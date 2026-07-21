const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/color: '#1e293b', whiteSpace: 'nowrap'/g, "color: '#1e293b', whiteSpace: 'normal'");
code = code.replace(/color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap'/g, "color: '#94a3b8', marginTop: 2, whiteSpace: 'normal'");
code = code.replace(/textOverflow: 'ellipsis', whiteSpace: 'nowrap'/g, "textOverflow: 'ellipsis', whiteSpace: 'normal'");

fs.writeFileSync(file, code);
console.log('Selectively wrapped Material Name and Supplier columns');
