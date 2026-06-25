const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/ERP.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('    return (\\n        <div className="page-container">\\n            {/* Breadcrumb */}');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   
   // We will read the new UI code from the original replace_erp.cjs!
   // Wait, I am overwriting replace_erp.cjs right now!
}
