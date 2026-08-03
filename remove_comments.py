import os
import re
import json

FRONTEND_DIR = r"c:\Users\Admin\Documents\project\frontend\src"
BACKEND_DIR = r"c:\Users\Admin\Documents\project\backend\src"

def is_code_comment(comment):
    # Heuristic to detect if a comment is commented-out code
    code_indicators = [
        r'\bconst\b', r'\blet\b', r'\bvar\b', r'\bfunction\b', 
        r'=>', r'\{', r'\}', r';\s*$', r'console\.log', r'\bimport\b',
        r'</', r'/>', r'<[a-zA-Z]+'
    ]
    for ind in code_indicators:
        if re.search(ind, comment):
            return True
    return False

def process_file(filepath, flagged_file):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to match strings (to avoid replacing // inside strings) OR single-line comments
    # We use a scanner approach
    
    # regex pattern
    # Group 1: strings ( "", '', `` )
    # Group 2: block comments ( /* ... */ )
    # Group 3: single line comments ( // ... )
    
    pattern = re.compile(
        r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|`(?:\\.|[^`\\])*`)'
        r'|(/\*.*?\*/)'
        r'|(//[^\n]*)',
        re.DOTALL
    )

    flagged_comments = []

    def replacer(match):
        if match.group(3):
            comment = match.group(3)
            # check if it's a structural comment like eslint-disable
            if 'eslint-disable' in comment or '@ts-ignore' in comment:
                return comment
            
            if is_code_comment(comment):
                flagged_comments.append(comment)
                return comment # keep it
            
            # If it's just a normal comment, remove it
            return ''
        else:
            return match.group(0)

    new_content = pattern.sub(replacer, content)

    # Remove empty lines left behind by comment removal
    # If a line is just whitespace after we removed a comment, we can clear it.
    new_content = re.sub(r'(?m)^\s*$\n', '', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    if flagged_comments:
        flagged_file.write(f"### File: {filepath}\n")
        for fc in flagged_comments:
            flagged_file.write(f"- `{fc}`\n")
        flagged_file.write("\n")

def run():
    flagged_path = r"c:\Users\Admin\Documents\project\flagged_comments.md"
    with open(flagged_path, 'w', encoding='utf-8') as flagged_file:
        flagged_file.write("# Flagged Commented-Out Code\n\n")
        
        for root_dir in [FRONTEND_DIR, BACKEND_DIR]:
            for subdir, dirs, files in os.walk(root_dir):
                for file in files:
                    if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                        filepath = os.path.join(subdir, file)
                        try:
                            process_file(filepath, flagged_file)
                        except Exception as e:
                            print(f"Error processing {filepath}: {e}")

if __name__ == '__main__':
    run()
    print("Done! Check flagged_comments.md")
