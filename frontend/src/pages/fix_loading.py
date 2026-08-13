import os
import re

PAGE_DIR = r"c:\Users\Admin\Documents\project\frontend\src\pages"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "if (loading) return <LoadingState" in content or "if (loading) return (<LoadingState" in content:
        if "LoadingState" not in content[:content.find("if (loading)")]:
            pass
            
    idx = content.find("if (loading)")
    if idx == -1:
        return False
        
    if "<LoadingState" in content[idx:idx+100]:
        return False
        
    print(f"Fixing {os.path.basename(filepath)}...")
    
    # Matches `if (loading) { return ( <JSX> ); }`
    pattern1 = re.compile(r'if\s*\(\s*loading\s*\)\s*\{\s*return\s*\(.*?\);\s*\}', re.DOTALL)
    # Matches `if (loading) return ( <JSX> );`
    pattern2 = re.compile(r'if\s*\(\s*loading\s*\)\s*return\s*\(.*?\);', re.DOTALL)
    # Matches `if (loading) return <div ...>...</div>;`
    pattern3 = re.compile(r'if\s*\(\s*loading\s*\)\s*return\s*<div.*?>.*?</div>;', re.DOTALL)
    
    new_content = content
    matched = False
    
    for p in [pattern1, pattern2, pattern3]:
        if p.search(new_content):
            new_content = p.sub('if (loading) return <LoadingState message="Loading..." height="100vh" />;', new_content)
            matched = True
            break
            
    if not matched:
        print(f"  -> Could not automatically match the loading block in {os.path.basename(filepath)}")
        return False
        
    if "LoadingState" not in new_content[:idx] and "import { LoadingState" not in new_content:
        imports_end = [m.end() for m in re.finditer(r'^import .*?;?\n', new_content, re.MULTILINE)]
        if imports_end:
            insert_pos = imports_end[-1]
            new_content = new_content[:insert_pos] + 'import { LoadingState } from "../components/DataStates";\n' + new_content[insert_pos:]
        else:
            new_content = 'import { LoadingState } from "../components/DataStates";\n' + new_content

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return True

changed = 0
for file in os.listdir(PAGE_DIR):
    if file.endswith('.jsx'):
        if process_file(os.path.join(PAGE_DIR, file)):
            changed += 1
            
print(f"Changed {changed} files.")
