const fs = require('fs');
const path = require('path');

const PAGE_DIR = path.join('c:', 'Users', 'Admin', 'Documents', 'project', 'frontend', 'src', 'pages');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    if (content.includes('if (loading) return <LoadingState') || content.includes('if (loading) return (<LoadingState')) {
        if (!content.substring(0, content.indexOf('if (loading)')).includes('LoadingState')) {
            // we will add it below if it's missing
        }
    }

    const idx = content.indexOf('if (loading)');
    if (idx === -1) return false;

    if (content.substring(idx, idx + 100).includes('<LoadingState')) {
        return false;
    }

    console.log(`Fixing ${path.basename(filepath)}...`);

    const pattern1 = /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\(.*?\);\s*\}/s;
    const pattern2 = /if\s*\(\s*loading\s*\)\s*return\s*\(.*?\);/s;
    const pattern3 = /if\s*\(\s*loading\s*\)\s*return\s*<div.*?>.*?<\/div>;/s;
    const pattern4 = /if\s*\(\s*loading\s*\)\s*return\s*<LoadingState.*?\/>;/s;

    let matched = false;
    let newContent = content;

    for (const p of [pattern1, pattern2, pattern3, pattern4]) {
        if (p.test(newContent)) {
            newContent = newContent.replace(p, 'if (loading) return <LoadingState message="Loading..." height="100vh" />;');
            matched = true;
            break;
        }
    }

    if (!matched) {
        console.log(`  -> Could not automatically match the loading block in ${path.basename(filepath)}`);
        return false;
    }

    if (!newContent.substring(0, idx).includes('LoadingState') && !newContent.includes('import { LoadingState')) {
        // Find last import
        const importRegex = /^import .*?;?(?=\n)/gm;
        let lastImportIndex = -1;
        let match;
        while ((match = importRegex.exec(newContent)) !== null) {
            lastImportIndex = match.index + match[0].length;
        }
        
        if (lastImportIndex !== -1) {
            newContent = newContent.substring(0, lastImportIndex) + '\nimport { LoadingState } from "../components/DataStates";' + newContent.substring(lastImportIndex);
        } else {
            newContent = 'import { LoadingState } from "../components/DataStates";\n' + newContent;
        }
    }

    fs.writeFileSync(filepath, newContent, 'utf8');
    return true;
}

let changed = 0;
const files = fs.readdirSync(PAGE_DIR);
for (const file of files) {
    if (file.endsWith('.jsx')) {
        if (processFile(path.join(PAGE_DIR, file))) {
            changed++;
        }
    }
}

console.log(`Changed ${changed} files.`);
