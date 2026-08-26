const fs = require('fs');
const path = require('path');

function getCssFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getCssFiles(fullPath, files);
        } else if (fullPath.endsWith('.css') && 
                   !fullPath.includes('Auth.css') && 
                   !fullPath.includes('LandingPage.css') &&
                   !fullPath.includes('dashboard-layout.css') &&
                   !fullPath.includes('FarmakuDashboard.css')) {
            files.push(fullPath);
        }
    });
    return files;
}

const basePath = path.join(__dirname, 'src', 'pages');
const cssFiles = getCssFiles(basePath);

cssFiles.forEach(fullPath => {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove gradients
    content = content.replace(/background:\s*(linear|radial)-gradient\([^;]+;/g, 'background: #ffffff; border: 1px solid #E5EAF2;');
    content = content.replace(/background-image:\s*(linear|radial)-gradient\([^;]+;/g, 'background: #ffffff; border: 1px solid #E5EAF2;');

    // Fix sharp corners (border-radius: 0/0px) -> 8px
    content = content.replace(/border-radius:\s*0px;/g, 'border-radius: 8px;');
    content = content.replace(/border-radius:\s*0;/g, 'border-radius: 8px;');

    // Soften heavy shadows
    content = content.replace(/box-shadow:\s*0\s+4px\s+[^;]+;/g, 'box-shadow: 0 1px 3px rgba(0,0,0,0.05);');
    content = content.replace(/box-shadow:\s*0\s+8px\s+[^;]+;/g, 'box-shadow: 0 1px 3px rgba(0,0,0,0.05);');
    content = content.replace(/box-shadow:\s*0\s+12px\s+[^;]+;/g, 'box-shadow: 0 1px 3px rgba(0,0,0,0.05);');

    // Soften backgrounds that are off-white/gray, ensure they look professional
    // Sometimes hardcoded to #f8fafc or #f4f6fa, we want #f3f4f6 or #f8faff.
    content = content.replace(/background-color:\s*#f8fafc;/g, 'background-color: #f8faff;');
    content = content.replace(/background:\s*#f4f6fa;/g, 'background: #f8faff;');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${path.basename(fullPath)}`);
});

console.log("Global professional theme applied to module pages.");
