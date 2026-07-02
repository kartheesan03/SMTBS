const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

const files = [
    'TeamPerformance.jsx',
    'Payroll.jsx',
    'OrderManagement.jsx',
    'LeaveManagement.jsx',
    'Leads.jsx',
    'HRMS.jsx',
    'FinancialOperations.jsx',
    'ERP.jsx',
    'BarcodeManagement.jsx',
    'Attendance.jsx',
    'StockRequests.jsx'
];

let totalFixed = 0;

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`SKIP: ${file} not found`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    // Replace: <table className="rd-table" style={{minWidth: 1000}}> or 1200
    // With: <table className="rd-table" style={{ width: '100%' }}>
    content = content.replace(
        /(<table\s+className="rd-table"\s+style=\{\{)\s*minWidth:\s*\d+\s*(\}\}>)/g,
        '$1 width: \'100%\' $2'
    );
    
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`FIXED: ${file}`);
        totalFixed++;
    } else {
        console.log(`NO CHANGE: ${file}`);
    }
});

console.log(`\nDone! Fixed ${totalFixed} files.`);
