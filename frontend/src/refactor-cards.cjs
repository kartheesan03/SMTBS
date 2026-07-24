const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname);

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
};

const files = walk(rootDir);
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    if (content.includes('PastelKPICard')) {
        // 1. Replace imports (handle various relative paths)
        // e.g. import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
        content = content.replace(/import\s+\{\s*PastelKPICard\s*,\s*PastelKPIGrid\s*\}\s+from\s+['"]([^'"]+PastelKPICard)['"];?/g, (match, p1) => {
            const upDirs = p1.split('components')[0];
            return `import { StatCard, StatGrid } from '${upDirs}components/ui/StatCard';`;
        });
        
        content = content.replace(/import\s+\{\s*PastelKPICard\s*\}\s+from\s+['"]([^'"]+PastelKPICard)['"];?/g, (match, p1) => {
            const upDirs = p1.split('components')[0];
            return `import { StatCard } from '${upDirs}components/ui/StatCard';`;
        });

        // 2. Replace JSX tags
        content = content.replace(/<PastelKPICard/g, '<StatCard');
        content = content.replace(/<\/PastelKPICard>/g, '</StatCard>');
        
        content = content.replace(/<PastelKPIGrid/g, '<StatGrid');
        content = content.replace(/<\/PastelKPIGrid>/g, '</StatGrid>');
        
        if (content !== original) {
            fs.writeFileSync(file, content);
            console.log('Updated:', file);
            count++;
        }
    }
});

console.log(`Refactor complete! Updated ${count} files.`);
