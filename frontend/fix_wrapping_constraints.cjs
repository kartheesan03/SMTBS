const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

// Fix MATERIAL NAME flex container
code = code.replace(/<div style=\{\{ display: 'flex', flexDirection: 'column' \}\}>/g, "<div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, wordWrap: 'break-word' }}>");

// Fix MATERIAL NAME spans
code = code.replace(/<span style=\{\{ fontWeight: 700, color: '#1e293b', whiteSpace: 'normal' \}\}>\{val\}<\/span>/g, "<span style={{ fontWeight: 700, color: '#1e293b', whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>{val}</span>");
code = code.replace(/<span style=\{\{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'normal' \}\}>\{row\.movementsCount \|\| 0\} movements recorded<\/span>/g, "<span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>{row.movementsCount || 0} movements recorded</span>");

// Fix SUPPLIER flex container
code = code.replace(/<div style=\{\{ display: 'flex', flexDirection: 'column', width: '100%' \}\}>/g, "<div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, wordWrap: 'break-word' }}>");

// Fix SUPPLIER spans
code = code.replace(/<span style=\{\{ fontWeight: 600, color: '#334155', whiteSpace: 'normal' \}\}>/g, "<span style={{ fontWeight: 600, color: '#334155', whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>");
code = code.replace(/<span style=\{\{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'normal' \}\}>/g, "<span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>");

// Fix LOCATION span
code = code.replace(/<span style=\{\{ color: '#334155', fontSize: 13, whiteSpace: 'normal' \}\}>/g, "<span style={{ color: '#334155', fontSize: 13, whiteSpace: 'normal', wordWrap: 'break-word', display: 'block' }}>");

// Let's also ensure DataTable.css td has overflow hidden so it NEVER overflows into the next cell visually even if it fails to wrap
// Wait, I will just do that in another step if needed.

fs.writeFileSync(file, code);
console.log('Fixed flex container wrapping constraints');
