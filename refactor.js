const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'frontend/src/pages'),
    path.join(__dirname, 'frontend/src/components')
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove inline table styles
    content = content.replace(/style=\{\{\s*width:\s*'100%',\s*fontSize:\s*'1[23]px',\s*borderCollapse:\s*'collapse'(?:,\s*background:\s*'[^']+')?\s*\}\}/g, '');
    content = content.replace(/style=\{\{\s*width:\s*'100%',\s*borderCollapse:\s*'collapse',\s*fontSize:\s*'13px'\s*\}\}/g, '');
    content = content.replace(/style=\{\{\s*fontSize:\s*['"]?1[23]px['"]?\s*\}\}/g, '');

    // 2. Remove table-card inline backgrounds and borders
    content = content.replace(/style=\{\{\s*background:\s*'[^']+',\s*borderRadius:\s*'12px',\s*padding:\s*'1px',\s*(?:boxShadow|border):\s*'[^']+'\s*\}\}/g, '');
    content = content.replace(/style=\{\{\s*marginTop:\s*'15px',\s*border:\s*'1px solid #[a-f0-9]+',\s*borderRadius:\s*'8px',\s*overflow:\s*'hidden'\s*\}\}/g, '');

    // 3. Remove inline styles from buttons where they conflict with global classes
    content = content.replace(/style=\{\{\s*background:\s*'[^']+',\s*border:\s*'[^']+',\s*borderRadius:\s*'6px',\s*padding:\s*'6px 8px',\s*color:\s*'[^']+'\s*\}\}/g, '');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Cleaned inline styles in:', path.basename(filePath));
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

dirs.forEach(walk);
console.log('Refactoring complete.');
