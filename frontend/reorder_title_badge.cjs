const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

let changedCount = 0;

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // We want to match:
    // <div className="rd-module-title-row">
    //     <span className="rd-module-badge">...</span>
    //     <span className="rd-module-title">...</span>
    // </div>
    // And swap them.
    
    // We can use a regex to capture the entire title row block and its contents
    const rowRegex = /(<div\s+className="rd-module-title-row">)\s*(<span\s+className="rd-module-badge"[^>]*>[\s\S]*?<\/span>)\s*(<span\s+className="rd-module-title"[^>]*>[\s\S]*?<\/span>)/g;
    
    content = content.replace(rowRegex, '$1\n                            $3\n                            $2');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Reordered badge and title in: ${file}`);
        changedCount++;
    }
}

console.log(`Total files updated: ${changedCount}`);
