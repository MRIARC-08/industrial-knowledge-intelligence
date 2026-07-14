import os
import re
import json

def update_imports(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                
                # Replace relative imports
                new_content = re.sub(r'[\'"](\.\./)+shared/(api|types)[\'"]', r"'@iki/shared'", content)
                new_content = re.sub(r'[\'"](\.\./)+shared[\'"]', r"'@iki/shared'", new_content)
                
                if new_content != content:
                    with open(filepath, 'w') as f:
                        f.write(new_content)
                    print(f"Updated imports in {filepath}")

def add_dep(filepath):
    with open(filepath, 'r') as f:
        data = json.load(f)
    if 'dependencies' not in data:
        data['dependencies'] = {}
    data['dependencies']['@iki/shared'] = "*"
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Added dependency to {filepath}")

update_imports('admin/src')
update_imports('mobile/src')
update_imports('mobile')

add_dep('admin/package.json')
add_dep('mobile/package.json')
