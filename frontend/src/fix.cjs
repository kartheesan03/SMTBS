const fs = require('fs');

let c = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_erp.cjs', 'utf8');
c = c.replace("content.lastIndexOf('return (');", "content.indexOf('    return (\\n        <div className=\"page-container\">\\n            {/* Breadcrumb */}');");
fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_erp.cjs', c);

let h = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_hrms.cjs', 'utf8');
h = h.replace("content.lastIndexOf('return (');", "content.indexOf('    return (\\n        <div className=\"page-container\">\\n            <header className=\"page-header\">');");
fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_hrms.cjs', h);
console.log("Fixed scripts.");
