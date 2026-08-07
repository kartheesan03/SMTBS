const fs = require('fs');
const path = require('path');

const dir = 'backend/src/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: .find(QUERY).sort({ FIELD: -1 }).limit(LIMIT)
    // Matches Model.find(...).sort({ FIELD: -1 }).limit(LIMIT)
    content = content.replace(/\.find\((.*?)\)\s*\.sort\(\s*\{\s*([A-Za-z0-9_]+)\s*:\s*-1\s*\}\s*\)\s*\.limit\(\s*(\d+)\s*\)/g, (match, query, sortField, limit) => {
        let whereClause = query.trim() ? `where: ${query}` : '';
        let parts = [];
        if (whereClause) parts.push(whereClause);
        parts.push(`order: [['${sortField}', 'DESC']]`);
        parts.push(`limit: ${limit}`);
        return `.findAll({ ${parts.join(', ')} })`;
    });

    // Pattern 2: .find(QUERY).sort({ FIELD: 1 }).limit(LIMIT)
    content = content.replace(/\.find\((.*?)\)\s*\.sort\(\s*\{\s*([A-Za-z0-9_]+)\s*:\s*1\s*\}\s*\)\s*\.limit\(\s*(\d+)\s*\)/g, (match, query, sortField, limit) => {
        let whereClause = query.trim() ? `where: ${query}` : '';
        let parts = [];
        if (whereClause) parts.push(whereClause);
        parts.push(`order: [['${sortField}', 'ASC']]`);
        parts.push(`limit: ${limit}`);
        return `.findAll({ ${parts.join(', ')} })`;
    });

    // Pattern 3: .find(QUERY).sort({ FIELD: -1 })
    content = content.replace(/\.find\((.*?)\)\s*\.sort\(\s*\{\s*([A-Za-z0-9_]+)\s*:\s*-1\s*\}\s*\)/g, (match, query, sortField) => {
        let whereClause = query.trim() ? `where: ${query}` : '';
        let parts = [];
        if (whereClause) parts.push(whereClause);
        parts.push(`order: [['${sortField}', 'DESC']]`);
        return `.findAll({ ${parts.join(', ')} })`;
    });

    // Pattern 4: .find(QUERY).sort({ FIELD: 1 })
    content = content.replace(/\.find\((.*?)\)\s*\.sort\(\s*\{\s*([A-Za-z0-9_]+)\s*:\s*1\s*\}\s*\)/g, (match, query, sortField) => {
        let whereClause = query.trim() ? `where: ${query}` : '';
        let parts = [];
        if (whereClause) parts.push(whereClause);
        parts.push(`order: [['${sortField}', 'ASC']]`);
        return `.findAll({ ${parts.join(', ')} })`;
    });
    
    // Pattern 5: .find(QUERY).populate(...).sort({ FIELD: -1 })
    content = content.replace(/\.find\((.*?)\)\s*\.populate\((.*?)\)\s*\.sort\(\s*\{\s*([A-Za-z0-9_]+)\s*:\s*-1\s*\}\s*\)/g, (match, query, populate, sortField) => {
        let whereClause = query.trim() ? `where: ${query}` : '';
        let parts = [];
        if (whereClause) parts.push(whereClause);
        parts.push(`include: [${populate}]`);
        parts.push(`order: [['${sortField}', 'DESC']]`);
        return `.findAll({ ${parts.join(', ')} })`;
    });

    // Pattern 6: .find(QUERY).populate(...).sort({ FIELD: 1 })
    content = content.replace(/\.find\((.*?)\)\s*\.populate\((.*?)\)\s*\.sort\(\s*\{\s*([A-Za-z0-9_]+)\s*:\s*1\s*\}\s*\)/g, (match, query, populate, sortField) => {
        let whereClause = query.trim() ? `where: ${query}` : '';
        let parts = [];
        if (whereClause) parts.push(whereClause);
        parts.push(`include: [${populate}]`);
        parts.push(`order: [['${sortField}', 'ASC']]`);
        return `.findAll({ ${parts.join(', ')} })`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
