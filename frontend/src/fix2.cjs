const fs = require('fs');

let c = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_erp.cjs', 'utf8');
c = c.replace(/content\.indexOf\([^)]+\);/, "content.search(/return \\([\\s\\S]{0,100}<div className=\"page-container\">/);");
fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_erp.cjs', c);

let h = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_hrms.cjs', 'utf8');
h = h.replace(/content\.indexOf\([^)]+\);/, "content.search(/return \\([\\s\\S]{0,100}<div className=\"page-container\">/);");
fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/replace_hrms.cjs', h);
console.log("Fixed scripts to use regex match");
