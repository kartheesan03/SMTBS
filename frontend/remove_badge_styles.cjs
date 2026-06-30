const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

let changedCount = 0;

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const originalContent = content;

    // Regex to match <span className="rd-module-badge" style={{...}}>
    const badgeRegex = /(<span\s+className="rd-module-badge")\s+style=\{\{[^\}]+\}\}\s*>/g;
    
    content = content.replace(badgeRegex, '$1>');

    // Just in case it spans multiple lines:
    const badgeRegexMultiline = /(<span\s+className="rd-module-badge")[\s\S]*?(>)/g;
    content = content.replace(badgeRegexMultiline, (match, p1, p2) => {
        return p1 + p2;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated badge in: ${file}`);
        changedCount++;
    }
}

console.log(`Total files updated: ${changedCount}`);
