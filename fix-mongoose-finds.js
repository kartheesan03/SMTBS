const fs = require('fs');
const path = require('path');

const dir = 'backend/src/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace Model.find({}) with Model.findAll({})
    // Model must be a capitalized word (e.g. Order, Lead, Material)
    content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*\{\s*\}\s*\)/g, '$1.findAll()');
    
    // Replace Model.find() with Model.findAll()
    content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*\)/g, '$1.findAll()');

    // Replace Model.find({ ... }) with Model.findAll({ where: { ... } })
    // Careful not to match .find(notifQuery) where it's a variable
    content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*(\{[\s\S]*?\})\s*\)/g, (match, model, objStr) => {
        return `${model}.findAll({ where: ${objStr} })`;
    });

    // Replace Model.find(varName) with Model.findAll({ where: varName })
    content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.find\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, model, varName) => {
        return `${model}.findAll({ where: ${varName} })`;
    });
    
    // Check for Model.findOne({ ... })
    content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findOne\(\s*(\{[\s\S]*?\})\s*\)/g, (match, model, objStr) => {
        // If it already has 'where:', ignore
        if (objStr.includes('where:')) return match;
        return `${model}.findOne({ where: ${objStr} })`;
    });

    // Check for Model.findOne(varName)
    content = content.replace(/\b([A-Z][a-zA-Z0-9_]*)\.findOne\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, model, varName) => {
        if (varName === 'where') return match;
        return `${model}.findOne({ where: ${varName} })`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
