const fs = require('fs');
let content = fs.readFileSync('c:/Users/Admin/Documents/project/backend/src/controllers/ordercontroller.js', 'utf8');

// remove createOrder function block
content = content.replace(/\/\/ @desc    Create an order[\s\S]*?\/\/ @access  Private\s*const createOrder = async \(req, res\) => \{[\s\S]*?res\.status\(400\)\.json\(\{ message: error\.message \}\);\s*\}\s*\};/g, '');

// remove createOrder from exports
content = content.replace(/\s*createOrder,/g, '');

fs.writeFileSync('c:/Users/Admin/Documents/project/backend/src/controllers/ordercontroller.js', content);
console.log('ordercontroller.js cleaned successfully!');
