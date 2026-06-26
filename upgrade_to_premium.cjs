const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            filelist = walkSync(fullPath, filelist);
        } else {
            if (file.endsWith('.jsx')) {
                filelist.push(fullPath);
            }
        }
    });
    return filelist;
};

const pagesDir = path.join(__dirname, 'frontend/src/pages');
const compDir = path.join(__dirname, 'frontend/src/components');

let files = [];
if (fs.existsSync(pagesDir)) files = files.concat(walkSync(pagesDir));
if (fs.existsSync(compDir)) files = files.concat(walkSync(compDir));

let totalChanges = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Layout wrappers
    content = content.replace(/className=['"]module-container['"]/g, 'className="page-container"');
    content = content.replace(/className=['"]module-actions-section['"]/g, 'className="page-header"');
    content = content.replace(/className=['"]module-title-block['"]/g, 'className="header-content"');
    content = content.replace(/className=['"]action-buttons['"]/g, 'className="header-actions"');
    
    // Cards
    content = content.replace(/className=['"]dashboard-card-3d['"]/g, 'className="premium-card"');
    content = content.replace(/className=['"]analytics-card['"]/g, 'className="premium-card"');
    content = content.replace(/className=['"]stat-card['"]/g, 'className="premium-card"');
    content = content.replace(/className=['"]kpi-card['"]/g, 'className="premium-card"');
    
    // Buttons
    content = content.replace(/className=['"]ui-button primary['"]/g, 'className="btn-primary"');
    content = content.replace(/className=['"]ui-button secondary['"]/g, 'className="btn-secondary"');
    content = content.replace(/className=['"]action-btn['"]/g, 'className="btn-primary"');
    content = content.replace(/className=['"]action-btn outline['"]/g, 'className="btn-outline"');
    content = content.replace(/className=['"]btn btn-primary['"]/g, 'className="btn-primary"');
    
    // Clean up ugly inline borders and shadows that override premium CSS
    content = content.replace(/style=\{\{[^}]*border:\s*['"]1px solid #[a-zA-Z0-9]+['"][^}]*\}\}/g, (match) => {
        return match.replace(/border:\s*['"]1px solid #[a-zA-Z0-9]+['"]\s*,?\s*/g, '');
    });
    content = content.replace(/style=\{\{[^}]*boxShadow:\s*['"][^'"]+['"][^}]*\}\}/g, (match) => {
        return match.replace(/boxShadow:\s*['"][^'"]+['"]\s*,?\s*/g, '');
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        totalChanges++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`Total files updated: ${totalChanges}`);
