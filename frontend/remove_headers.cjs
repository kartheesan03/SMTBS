const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

let changedCount = 0;

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('className="rd-module-header"')) {
        continue;
    }

    const originalContent = content;

    const iconRegex = /<div\s+className="rd-module-icon"[^>]*>[\s\S]*?<\/div>\s*/g;
    const descRegex = /<div\s+className="rd-module-desc"[^>]*>[\s\S]*?<\/div>\s*/g;

    content = content.replace(iconRegex, '');
    content = content.replace(descRegex, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${file}`);
        changedCount++;
    }
}

console.log(`Total files updated: ${changedCount}`);
