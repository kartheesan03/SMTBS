const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

// Reduce font sizes and paddings in Materials.jsx
code = code.replace(/padding: '4px 10px'/g, "padding: '4px 6px'");
code = code.replace(/fontSize: 14/g, "fontSize: 13");
code = code.replace(/fontSize: 13/g, "fontSize: 12");
code = code.replace(/fontSize: 12/g, "fontSize: 11");
code = code.replace(/width: '200px'/g, "width: '140px'");
code = code.replace(/maxWidth: '200px'/g, "maxWidth: '140px'");

fs.writeFileSync(file, code);
console.log('Reduced sizes in Materials.jsx');
