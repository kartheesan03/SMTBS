const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

// Allow LOCATION to wrap
code = code.replace(/<span style=\{\{ color: '#334155', fontSize: 13, whiteSpace: 'nowrap' \}\}/g, "<span style={{ color: '#334155', fontSize: 13, whiteSpace: 'normal' }}");

// Fix ellipsis issue on Supplier
code = code.replace(/overflow: 'hidden', textOverflow: 'ellipsis', /g, "");

// Reduce padding inside action buttons to shrink the ACTIONS column
code = code.replace(/padding: '4px 10px', fontSize: 12/g, "padding: '4px 6px', fontSize: 11");

fs.writeFileSync(file, code);
console.log('Allowed Location to wrap and removed ellipses');
