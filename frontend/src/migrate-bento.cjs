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

// Mapping of filename keywords to the desired featured metric
const getFeaturedMetric = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('admindashboard') || name.includes('revenuedashboard')) return 'Revenue YTD';
    if (name.includes('managerdashboard') || name.includes('team')) return 'Active Projects';
    if (name.includes('stock') || name.includes('materials') || name.includes('inventory')) return 'Total Items';
    if (name.includes('request')) return 'Pending Requests';
    if (name.includes('employee')) return 'Total Tasks';
    if (name.includes('sales')) return 'Total Revenue';
    if (name.includes('hr') || name.includes('attendance')) return 'Present Today';
    return ''; // Default to the first item
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    const featured = getFeaturedMetric(path.basename(file));
    
    // Update imports: change { StatGrid } or { StatCard, StatGrid } to BentoStatGrid
    // We already export BentoStatGrid from StatCard.jsx
    if (content.includes('StatGrid')) {
        content = content.replace(/import\s+\{\s*([^}]*?)\bStatGrid\b([^}]*?)\s*\}\s+from\s+['"]([^'"]+)['"]/g, (match, before, after, source) => {
            let newImport = `import { ${before}BentoStatGrid${after} } from '${source}'`;
            // Cleanup double commas if any
            newImport = newImport.replace(/,\s*,/g, ',').replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}');
            return newImport;
        });

        // Some files might have import StatGrid from ... directly, but it's usually { StatGrid }
        
        // Update tags
        if (featured) {
            content = content.replace(/<StatGrid([^>]*?)>/g, `<BentoStatGrid featuredMetric="${featured}"$1>`);
        } else {
            content = content.replace(/<StatGrid([^>]*?)>/g, `<BentoStatGrid$1>`);
        }
        content = content.replace(/<\/StatGrid>/g, `</BentoStatGrid>`);
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFiles++;
        console.log(`Migrated: ${path.basename(file)} (Featured: ${featured || 'Default'})`);
    }
});

console.log(`\nComplete! Migrated ${updatedFiles} files to BentoStatGrid.`);
