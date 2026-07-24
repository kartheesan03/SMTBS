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
                if (dirFile.endsWith('.jsx') || dirFile.endsWith('.css')) {
                    filelist.push(dirFile);
                }
            }
        });
    }
    return filelist;
};

const dirsToScan = [
    path.join(__dirname, 'pages'),
    path.join(__dirname, 'components')
];

let files = [];
dirsToScan.forEach(dir => {
    files = walkSync(dir, files);
});

let updatedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    if (file.endsWith('.jsx')) {
        // Replace borderRadius: '50%' with borderRadius: '2px'
        content = content.replace(/borderRadius:\s*['"]50%['"]/g, "borderRadius: '2px'");
        // Replace borderRadius: 50 (number) with 2
        content = content.replace(/borderRadius:\s*50(?!%)/g, "borderRadius: 2");

        // Replace other standard border radius strings (like '4px', '8px', '12px', '16px') with '0px'
        content = content.replace(/borderRadius:\s*['"][0-9]+px['"]/g, "borderRadius: '0px'");
        // Replace number border radius (e.g. borderRadius: 8) with 0
        // We ensure we don't accidentally match 0, so [1-9][0-9]*
        content = content.replace(/borderRadius:\s*([1-9][0-9]*)(?!%)/g, "borderRadius: 0");
    } else if (file.endsWith('.css')) {
        // Replace border-radius: 50% with 2px
        content = content.replace(/border-radius:\s*50%;/g, "border-radius: 2px;");
        // Replace other pixel/rem border radius with 0px
        content = content.replace(/border-radius:\s*[0-9\.]+px;/g, "border-radius: 0px;");
        content = content.replace(/border-radius:\s*[0-9\.]+rem;/g, "border-radius: 0px;");
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        updatedFiles++;
        console.log(`Updated: ${path.basename(file)}`);
    }
});

console.log(`\nComplete! Updated ${updatedFiles} files.`);
