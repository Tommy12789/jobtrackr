- name: Check callback config
  ansible.builtin.debug:
    msg:
      stdout_callback_env: "{{ lookup('env', 'ANSIBLE_STDOUT_CALLBACK') }}"
      callback_plugins_env: "{{ lookup('env', 'ANSIBLE_CALLBACK_PLUGINS') }}"
      config_file_env: "{{ lookup('env', 'ANSIBLE_CONFIG') }}"

- name: Check ansible.cfg content
  ansible.builtin.shell: |
    echo "=== ANSIBLE_CONFIG ==="
    echo $ANSIBLE_CONFIG
    echo "=== Config file used ==="
    ansible --version | head -5
    echo "=== ansible.cfg content ==="
    cat {{ playbook_dir }}/ansible.cfg 2>/dev/null || echo "no ansible.cfg found"
    echo "=== callback plugins dir ==="
    ls -la {{ playbook_dir }}/plugins/callback/ 2>/dev/null || echo "no callback dir"
  register: config_check
  delegate_to: localhost

- name: Show config
  ansible.builtin.debug:
    var: config_check.stdout_lines
