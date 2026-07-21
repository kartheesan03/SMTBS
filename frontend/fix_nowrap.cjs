const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(/whiteSpace:\s*'nowrap'/g, "whiteSpace: 'normal'");
fs.writeFileSync(file, code);
console.log('Fixed Materials.jsx');
