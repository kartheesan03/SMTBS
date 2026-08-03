const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/ERP.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('    return (\\n        <div className="page-container">\\n            {/* Breadcrumb */}');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   
}
