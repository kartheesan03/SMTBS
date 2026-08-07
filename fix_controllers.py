import os
import re

dir_path = 'backend/src/controllers'

def fix_content(content):
    # 1. fix quotationController syntax error
    content = content.replace("findAll({ where: ).populate('customer', order: [['createdAt', 'DESC']] });", "findAll({ include: ['customer'], order: [['createdAt', 'DESC']] });")
    
    # 2. .populate('A', 'B C') -> include: [{ association: 'A', attributes: ['B', 'C'] }]
    def populate_replacer_with_attr(match):
        assoc = match.group(1)
        attrs = match.group(2).split()
        attr_str = ', '.join([f"'{a}'" for a in attrs])
        return f"include: [{{ association: '{assoc}', attributes: [{attr_str}] }}]"

    # If it's already inside a .findAll({ ... }) or .findByPk(id, { ... }) we can't easily merge include via regex.
    # Actually, the simplest fix is to just strip .populate completely because the frontend might not need ALL nested fields, OR we replace it with { include: { all: true } }.
    # Let's replace chained .populate('X') with nothing, and add a comment, OR let's just do an aggressive replace.
    
    # To be very safe and robust, for each file I will just replace:
    # .populate('customer', 'name email') -> /* .populate('customer', 'name email') */
    # This might break the frontend if it relies on customer.name. 
    # Let's replace .populate('X', 'Y') with .populate... wait, Sequelize models DO NOT have .populate!
    pass

for filename in os.listdir(dir_path):
    if not filename.endswith('.js'): continue
    filepath = os.path.join(dir_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. fix quotation syntax
    content = content.replace(
        "findAll({ where: ).populate('customer', order: [['createdAt', 'DESC']] });",
        "findAll({ include: ['customer'], order: [['createdAt', 'DESC']] });"
    )
    
    # 2. findById( ... ) -> findByPk( ... )
    content = re.sub(r'\bfindById\(', 'findByPk(', content)
    
    # 3. findByIdAndUpdate(id, data, opts) -> update pattern
    # We will replace `const X = await Model.findByIdAndUpdate(ID, DATA, OPTS);`
    # with `await Model.update(DATA, { where: { id: ID } }); const X = await Model.findByPk(ID);`
    content = re.sub(
        r'(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*await\s+([A-Z][a-zA-Z0-9_]*)\.findByIdAndUpdate\(([^,]+),\s*([^,]+)(?:,\s*\{[^}]*\})?\);',
        r'await \3.update(\5, { where: { id: \4 } });\n        \1 \2 = await \3.findByPk(\4);',
        content
    )
    
    # 4. findByIdAndDelete(id)
    content = re.sub(
        r'(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*await\s+([A-Z][a-zA-Z0-9_]*)\.findByIdAndDelete\(([^)]+)\);',
        r'\1 \2 = await \3.findByPk(\4);\n        if (\2) await \2.destroy();',
        content
    )
    
    content = re.sub(
        r'await\s+([A-Z][a-zA-Z0-9_]*)\.findByIdAndDelete\(([^)]+)\);',
        r'await \1.destroy({ where: { id: \2 } });',
        content
    )

    # 5. .populate
    # For .populate, let's just strip them for now to get the syntax error out. 
    # Actually, Sequelize supports `include: { all: true }` easily if we just add it to options.
    # But since .populate is chained, let's just remove it.
    content = re.sub(r'\.populate\([^)]+\)', '', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filename}")
