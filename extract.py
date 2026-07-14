import re
import os

with open('frontend-guide.md', 'r') as f:
    content = f.read()

# Match code blocks that start with // path/to/file
pattern = re.compile(r'```(?:typescript|tsx)\n(// (admin|mobile)/[^\n]+)\n(.*?)\n```', re.DOTALL)

matches = pattern.findall(content)

for match in matches:
    header_line = match[0]
    filepath = header_line.replace('// ', '').strip()
    
    # We only care about the files we haven't fully built yet or want to overwrite with full code.
    # Actually, we can just write them all, but let's be careful.
    if filepath.startswith('admin/src/app') or filepath.startswith('mobile/src/screens'):
        # Make sure directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Write the file
        file_content = header_line + '\n' + match[2] + '\n'
        with open(filepath, 'w') as out_f:
            out_f.write(file_content)
        print(f"Wrote {filepath}")

print("Extraction complete.")
