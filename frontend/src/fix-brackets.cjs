const fs = require('fs');
const glob = require('glob');

const files = glob.sync('C:/Users/Admin/Documents/project/frontend/src/pages/*Dashboard.jsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('/>>')) {
        content = content.replace(/\/>>/g, '/>');
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed syntax in ' + file);
    }
});
