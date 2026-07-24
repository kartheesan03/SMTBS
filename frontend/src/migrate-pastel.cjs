const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
            const dirFile = path.join(dir, file);
            if (fs.statSync(dirFile).isDirectory()) {
                if (!dirFile.includes('node_modules')) {
                    filelist = walkSync(dirFile, filelist);
                }
            } else {
                if (dirFile.endsWith('.jsx')) {
                    filelist.push(dirFile);
                }
            }
        });
    }
    return filelist;
};

const pagesDir = path.join(__dirname, 'pages');
const files = walkSync(pagesDir);

let updatedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (content.includes('BentoStatGrid')) {
        // Fix imports
        content = content.replace(/import\s+\{\s*([^}]*?)\bBentoStatGrid\b([^}]*?)\s*\}\s+from\s+['"]([^'"]+)['"]/g, (match, before, after, source) => {
            let newImport = `import { ${before}StatGrid${after} } from '${source}'`;
            newImport = newImport.replace(/,\s*,/g, ',').replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}');
            return newImport;
        });
        
        // Remove featuredMetric prop and rename tags
        content = content.replace(/<BentoStatGrid\s+featuredMetric="[^"]*"([^>]*)>/g, '<StatGrid$1>');
        content = content.replace(/<BentoStatGrid([^>]*)>/g, '<StatGrid$1>');
        content = content.replace(/<\/BentoStatGrid>/g, '</StatGrid>');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFiles++;
        console.log(`Migrated: ${path.basename(file)} to StatGrid`);
    }
});

console.log(`\nComplete! Migrated ${updatedFiles} files back to standard StatGrid.`);
