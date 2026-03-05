#!/usr/bin/env python3
"""
Vérifie que toutes les variables contenant 'password', 'credential' ou 'secret'
dans leur nom sont préfixées par 'secret_'.

Analyse récursivement tous les .py depuis le répertoire courant.
"""

import ast
import sys
from pathlib import Path
from dataclasses import dataclass

SENSITIVE_KEYWORDS = {"password", "credential", "secret"}
REQUIRED_PREFIX = "secret_"


@dataclass
class Violation:
    file: Path
    line: int
    col: int
    name: str
    context: str  # ex: "assignment", "function parameter", "for target"

    def __str__(self):
        return (
            f"  {self.file}:{self.line}:{self.col} — "
            f"'{self.name}' ({self.context}) → devrait être '{REQUIRED_PREFIX}{self.name}'"
        )


def is_sensitive(name: str) -> bool:
    """Retourne True si le nom contient un mot-clé sensible sans le préfixe requis."""
    lower = name.lower()
    if lower.startswith(REQUIRED_PREFIX):
        return False
    return any(kw in lower for kw in SENSITIVE_KEYWORDS)


class SecretPrefixChecker(ast.NodeVisitor):
    """Parcourt l'AST d'un fichier Python pour détecter les variables sensibles non préfixées."""

    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.violations: list[Violation] = []

    def _add_if_sensitive(self, name: str, node: ast.AST, context: str):
        if is_sensitive(name):
            self.violations.append(
                Violation(self.filepath, node.lineno, node.col_offset, name, context)
            )

    def _check_target(self, target: ast.AST, context: str):
        """Vérifie récursivement les cibles d'assignation (tuple unpacking, etc.)."""
        if isinstance(target, ast.Name):
            self._add_if_sensitive(target.id, target, context)
        elif isinstance(target, (ast.Tuple, ast.List)):
            for elt in target.elts:
                self._check_target(elt, context)
        elif isinstance(target, ast.Starred):
            self._check_target(target.value, context)

    # --- Assignations ---
    def visit_Assign(self, node: ast.Assign):
        for target in node.targets:
            self._check_target(target, "assignment")
        self.generic_visit(node)

    def visit_AnnAssign(self, node: ast.AnnAssign):
        if node.target:
            self._check_target(node.target, "annotated assignment")
        self.generic_visit(node)

    def visit_AugAssign(self, node: ast.AugAssign):
        self._check_target(node.target, "augmented assignment")
        self.generic_visit(node)

    def visit_NamedExpr(self, node: ast.NamedExpr):
        self._check_target(node.target, "walrus operator")
        self.generic_visit(node)

    # --- Paramètres de fonctions ---
    def visit_FunctionDef(self, node: ast.FunctionDef):
        self._check_func_args(node)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self._check_func_args(node)
        self.generic_visit(node)

    def _check_func_args(self, node):
        for arg in (
            node.args.args
            + node.args.posonlyargs
            + node.args.kwonlyargs
        ):
            self._add_if_sensitive(arg.arg, arg, "function parameter")
        if node.args.vararg:
            self._add_if_sensitive(node.args.vararg.arg, node.args.vararg, "function *args")
        if node.args.kwarg:
            self._add_if_sensitive(node.args.kwarg.arg, node.args.kwarg, "function **kwargs")

    # --- For / With / Comprehensions ---
    def visit_For(self, node: ast.For):
        self._check_target(node.target, "for target")
        self.generic_visit(node)

    def visit_AsyncFor(self, node: ast.AsyncFor):
        self._check_target(node.target, "async for target")
        self.generic_visit(node)

    def visit_withitem(self, node: ast.withitem):
        if node.optional_vars:
            self._check_target(node.optional_vars, "with-as target")
        self.generic_visit(node)

    # --- Global / Nonlocal ---
    def visit_Global(self, node: ast.Global):
        for name in node.names:
            if is_sensitive(name):
                self.violations.append(
                    Violation(self.filepath, node.lineno, node.col_offset, name, "global")
                )
        self.generic_visit(node)

    def visit_Nonlocal(self, node: ast.Nonlocal):
        for name in node.names:
            if is_sensitive(name):
                self.violations.append(
                    Violation(self.filepath, node.lineno, node.col_offset, name, "nonlocal")
                )
        self.generic_visit(node)


def check_file(filepath: Path) -> list[Violation]:
    """Analyse un fichier Python et retourne la liste des violations."""
    try:
        source = filepath.read_text(encoding="utf-8")
    except (UnicodeDecodeError, PermissionError) as e:
        print(f"  ⚠ Impossible de lire {filepath}: {e}", file=sys.stderr)
        return []

    try:
        tree = ast.parse(source, filename=str(filepath))
    except SyntaxError as e:
        print(f"  ⚠ Erreur de syntaxe dans {filepath}: {e}", file=sys.stderr)
        return []

    checker = SecretPrefixChecker(filepath)
    checker.visit(tree)
    return checker.violations


def collect_python_files(root: Path) -> list[Path]:
    """Collecte récursivement tous les fichiers .py en ignorant les dossiers courants."""
    excludes = {
        "__pycache__", ".git", ".venv", "venv", "node_modules",
        ".tox", ".mypy_cache", ".pytest_cache", "env", ".env",
    }
    files = []
    for entry in sorted(root.iterdir()):
        if entry.name in excludes or entry.name.startswith("."):
            continue
        if entry.is_dir():
            files.extend(collect_python_files(entry))
        elif entry.is_file() and entry.suffix == ".py":
            files.append(entry)
    return files


def main():
    files = collect_python_files(Path("."))

    all_violations: list[Violation] = []
    for filepath in files:
        violations = check_file(filepath)
        all_violations.extend(violations)

    if all_violations:
        print(f"✗ {len(all_violations)} violation(s) trouvée(s) :\n")
        for v in all_violations:
            print(v)
        print()
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()