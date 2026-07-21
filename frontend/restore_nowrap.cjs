const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/color: '#1e293b', whiteSpace: 'normal'/g, "color: '#1e293b', whiteSpace: 'nowrap'");
code = code.replace(/color: '#94a3b8', marginTop: 2, whiteSpace: 'normal'/g, "color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap'");
code = code.replace(/textOverflow: 'ellipsis', whiteSpace: 'normal'/g, "textOverflow: 'ellipsis', whiteSpace: 'nowrap'");

fs.writeFileSync(file, code);
console.log('Restored nowrap in Materials.jsx');
