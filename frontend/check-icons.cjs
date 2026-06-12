const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Admin/Documents/project/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.includes('Dashboard'));

files.forEach(f => {
    const code = fs.readFileSync(path.join(dir, f), 'utf-8');
    const lucideImportMatch = code.match(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/);
    if (!lucideImportMatch) return;
    
    const importedIcons = lucideImportMatch[1].split(',').map(s => s.trim().split(' as ')[0]);
    const usedIconsMatch = code.match(/<([A-Z][a-zA-Z0-9]*)\s+[^>]*size=/g);
    
    if (!usedIconsMatch) return;
    
    const usedIcons = usedIconsMatch.map(s => s.match(/<([A-Z][a-zA-Z0-9]*)/)[1]);
    const missing = usedIcons.filter(icon => !importedIcons.includes(icon) && !code.includes('import ' + icon));
    
    if (missing.length > 0) {
        console.log('Missing in ' + f + ': ' + [...new Set(missing)].join(', '));
    }
});
console.log('Analysis complete.');
