const fs = require('fs');

const fixERP = () => {
    let content = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/pages/ERP.jsx', 'utf8');
    const returnIndex = content.indexOf('    return (\\r\\n        <div className="page-container">');
    if (returnIndex !== -1) {
        console.log("Found ERP with \\r\\n");
    } else {
        const idx2 = content.indexOf('    return (\\n        <div className="page-container">');
        if (idx2 !== -1) console.log("Found ERP with \\n");
        else console.log("Still can't find ERP return");
    }
}
fixERP();
