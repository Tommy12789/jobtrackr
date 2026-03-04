- name: Test plugin import
  ansible.builtin.shell: |
    cd /runner/project
    python3 -c "
    import sys
    sys.path.insert(0, './plugins/callback')
    try:
        import protect_data
        print('OK: plugin loaded')
    except Exception as e:
        print(f'ERREUR: {e}')
    "
  delegate_to: localhost
  register: import_test

- name: Show result
  ansible.builtin.debug:
    var: import_test.stdout
