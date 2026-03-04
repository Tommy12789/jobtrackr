# -*- coding: utf-8 -*-
from __future__ import absolute_import, division, print_function

__metaclass__ = type

import collections.abc

from ansible.plugins.callback.default import CallbackModule as CallbackModule_default

DOCUMENTATION = """
    name: protect_data
    type: stdout
    short_description: hide sensitive data such as passwords from screen output
    description:
        - hide passwords from screen output
    options:
        sensitive_keywords:
            description:
                - a list of sensitive keywords to hide separated by a comma
            type: str
            env:
                - name: PROTECT_DATA_SENSITIVE_KEYWORDS
            ini:
                - section: callback_protect_data
                  key: sensitive_keywords
            default: vault,pwd,pass,cert
        result_format:
            description: Define the task result format used in the callback output.
            type: str
            default: json
            env:
                - name: ANSIBLE_CALLBACK_RESULT_FORMAT
            ini:
                - section: defaults
                  key: callback_result_format
            choices:
                - json
                - yaml
        pretty_results:
            description: Configure the result format to be more readable
            type: bool
            default: true
            env:
                - name: ANSIBLE_CALLBACK_FORMAT_PRETTY
            ini:
                - section: defaults
                  key: callback_format_pretty
        show_per_host_start:
            description: Show per host task start callback
            type: bool
            default: false
            env:
                - name: ANSIBLE_SHOW_PER_HOST_START
            ini:
                - section: defaults
                  key: show_per_host_start
        display_skipped_hosts:
            description: Toggle to control displaying skipped task/host results
            type: bool
            default: true
            env:
                - name: DISPLAY_SKIPPED_HOSTS
            ini:
                - section: defaults
                  key: display_skipped_hosts
        display_ok_hosts:
            description: Toggle to control displaying ok task/host results
            type: bool
            default: true
            env:
                - name: ANSIBLE_DISPLAY_OK_HOSTS
            ini:
                - section: defaults
                  key: display_ok_hosts
        display_failed_stderr:
            description: Toggle to control whether failed task output is displayed to stderr
            type: bool
            default: false
            env:
                - name: ANSIBLE_DISPLAY_FAILED_STDERR
            ini:
                - section: defaults
                  key: display_failed_stderr
        show_custom_stats:
            description: Show custom stats at the end of playbook execution
            type: bool
            default: false
            env:
                - name: ANSIBLE_SHOW_CUSTOM_STATS
            ini:
                - section: defaults
                  key: show_custom_stats
        show_task_path_on_failure:
            description: Show task path on failure
            type: bool
            default: false
            env:
                - name: ANSIBLE_SHOW_TASK_PATH_ON_FAILURE
            ini:
                - section: defaults
                  key: show_task_path_on_failure
        check_mode_markers:
            description: Toggle to control displaying markers when running in check mode
            type: bool
            default: false
            env:
                - name: ANSIBLE_CHECK_MODE_MARKERS
            ini:
                - section: defaults
                  key: check_mode_markers
"""

EXAMPLES = r"""
ansible.cfg: >
    # Enable plugin
    [defaults]
    stdout_callback = protect_data
    callback_plugins = ./plugins/callback

    [callback_protect_data]
    sensitive_keywords = vault,pwd,pass,cert
"""


class CallbackModule(CallbackModule_default):
    CALLBACK_VERSION = 2.0
    CALLBACK_TYPE = "stdout"
    CALLBACK_NAME = "protect_data"

    def __init__(self):
        super(CallbackModule, self).__init__()
        self.sensitive_keywords = []

    def set_options(self, task_keys=None, var_options=None, direct=None):
        super(CallbackModule, self).set_options(
            task_keys=task_keys, var_options=var_options, direct=direct
        )
        keywords_str = self.get_option("sensitive_keywords")
        if keywords_str:
            self.sensitive_keywords = [
                kw.strip() for kw in keywords_str.split(",") if kw.strip()
            ]

    def hide_password(self, result):
        """Recursively hide sensitive values in result dict."""
        ret = {}
        for key, value in result.items():
            if isinstance(value, (collections.abc.MutableMapping, dict)):
                ret[key] = self.hide_password(value)
            else:
                sensitive_content = False
                for sensitive_keyword in self.sensitive_keywords:
                    if sensitive_keyword.lower() in key.lower():
                        ret[key] = "********"
                        sensitive_content = True
                        break
                if not sensitive_content:
                    ret[key] = value
        return ret

    def _get_item_label(self, result):
        """Retrieves the value to be displayed as a label for an item entry."""
        result = self.hide_password(result)
        if result.get("_ansible_no_log", False):
            item = "(censored due to no_log)"
        else:
            item = result.get("_ansible_item_label", result.get("item"))
        return item

    def _dump_results(self, result, indent=None, sort_keys=True, keep_invocation=False):
        return super(CallbackModule, self)._dump_results(
            self.hide_password(result), indent, sort_keys, keep_invocation
        )