const fs = require('fs');
const path = require('path');
const srcDir = path.join(process.cwd(), 'frontend', 'src', 'pages');
const loginPath = path.join(srcDir, 'Login.jsx');
const registerPath = path.join(srcDir, 'Register.jsx');
const authCssPath = path.join(srcDir, 'Auth.css');

function extractCss(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const startTag = '<style jsx="true">{';
    const endTag = '}</style>';
    const startIndex = content.indexOf(startTag);
    const endIndex = content.indexOf(endTag, startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const cssContent = content.substring(startIndex + startTag.length, endIndex);
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex + endTag.length);
        
        let lines = before.split('\n');
        lines.splice(1, 0, "import './Auth.css';");
        
        const newContent = lines.join('\n') + after;
        fs.writeFileSync(filePath, newContent);
        return cssContent;
    }
    return null;
}

const css = extractCss(loginPath);
if (css) {
    fs.writeFileSync(authCssPath, css.trim());
    console.log('Successfully extracted CSS from Login.jsx');
}
extractCss(registerPath);
console.log('Successfully removed CSS from Register.jsx');
