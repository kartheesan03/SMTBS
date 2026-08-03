const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend', 'src');
const BACKEND_DIR = path.join(__dirname, 'backend', 'src');
const FLAGGED_FILE = path.join(__dirname, 'flagged_comments.md');

function isCodeComment(comment) {
    const codeIndicators = [
        /const\b/, /let\b/, /var\b/, /function\b/, 
        /=>/, /\{/, /\}/, /;\s*$/, /console\.log/, /import\b/,
        /<\//, /\/>/, /<[a-zA-Z]+/
    ];
    for (let ind of codeIndicators) {
        if (ind.test(comment)) return true;
    }
    return false;
}

function processFile(filepath, flaggedStream) {
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Group 1: strings ( "", '', `` )
    // Group 2: block comments ( /* ... */ )
    // Group 3: single line comments ( // ... )
    const regex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)/g;
    
    let flaggedComments = [];
    
    let newContent = content.replace(regex, (match, group1, group2, group3) => {
        if (group3) {
            const comment = group3;
            if (comment.includes('eslint-disable') || comment.includes('@ts-ignore')) {
                return comment;
            }
            if (isCodeComment(comment)) {
                flaggedComments.push(comment);
                return comment; // keep it
            }
            return '';
        }
        return match;
    });

    // Remove empty lines left behind by comment removal
    newContent = newContent.replace(/^\s*$\n/gm, '');

    if (newContent !== content) {
        fs.writeFileSync(filepath, newContent, 'utf8');
    }

    if (flaggedComments.length > 0) {
        flaggedStream.write(`### File: ${filepath}\n`);
        for (let fc of flaggedComments) {
            flaggedStream.write(`- \`${fc}\`\n`);
        }
        flaggedStream.write('\n');
    }
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (/\.(js|jsx|ts|tsx)$/.test(dirPath)) {
                callback(dirPath);
            }
        }
    });
}

const flaggedStream = fs.createWriteStream(FLAGGED_FILE, { flags: 'w' });
flaggedStream.write('# Flagged Commented-Out Code\n\n');

walkDir(FRONTEND_DIR, (fp) => processFile(fp, flaggedStream));
walkDir(BACKEND_DIR, (fp) => processFile(fp, flaggedStream));

flaggedStream.end();
console.log('Done! Check flagged_comments.md');
