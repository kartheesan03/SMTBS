const fs = require('fs');
const path = require('path');

const dirPath = 'backend/src/controllers';

fs.readdirSync(dirPath).forEach(filename => {
    if (!filename.endsWith('.js')) return;
    const filepath = path.join(dirPath, filename);
    let content = fs.readFileSync(filepath, 'utf8');
    
    // 1. fix quotation syntax
    content = content.replace(
        "findAll({ where: ).populate('customer', order: [['createdAt', 'DESC']] });",
        "findAll({ include: ['customer'], order: [['createdAt', 'DESC']] });"
    );
    
    // 2. findById( ... ) -> findByPk( ... )
    content = content.replace(/\bfindById\(/g, 'findByPk(');
    
    // 3. findByIdAndUpdate(id, data, opts) -> update pattern
    content = content.replace(
        /(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*await\s+([A-Z][a-zA-Z0-9_]*)\.findByIdAndUpdate\(([^,]+),\s*([^,]+)(?:,\s*\{[^}]*\})?\);/g,
        'await $3.update($5, { where: { id: $4 } });\n        $1 $2 = await $3.findByPk($4);'
    );
    
    // 4. findByIdAndDelete(id) -> variable assignment
    content = content.replace(
        /(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*await\s+([A-Z][a-zA-Z0-9_]*)\.findByIdAndDelete\(([^)]+)\);/g,
        '$1 $2 = await $3.findByPk($4);\n        if ($2) await $2.destroy();'
    );
    
    // findByIdAndDelete(id) -> direct call
    content = content.replace(
        /await\s+([A-Z][a-zA-Z0-9_]*)\.findByIdAndDelete\(([^)]+)\);/g,
        'await $1.destroy({ where: { id: $2 } });'
    );

    // 5. .populate(...)
    content = content.replace(/\.populate\([^)]+\)/g, '');
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Processed ${filename}`);
});
