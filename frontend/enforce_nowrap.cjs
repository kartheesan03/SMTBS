const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/<div style=\{\{ display: 'flex', gap: 6, justifyContent: 'center' \}\}>/g, "<div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'nowrap' }}>");

code = code.replace(/<span style=\{\{ fontWeight: 700, color: '#1e293b', fontSize: 11 \}\}>\{val\}<\/span>/g, "<span style={{ fontWeight: 700, color: '#1e293b', fontSize: 11, whiteSpace: 'nowrap' }}>{val}</span>");

code = code.replace(/<span style=\{\{ color: '#94a3b8', fontSize: 13, fontWeight: 500 \}\}>\{val \|\| row\.unit \|\| 'units'\}<\/span>/g, "<span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{val || row.unit || 'units'}</span>");

fs.writeFileSync(file, code);
console.log('Enforced nowrap on specific columns in Materials.jsx');
