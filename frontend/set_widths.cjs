const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/Materials.jsx';
let code = fs.readFileSync(file, 'utf8');

const widthMap = {
    'sku': "width: '8%',",
    'name': "width: '18%',",
    'vendor': "width: '14%',",
    'category': "width: '10%',",
    'quantity': "width: '5%',",
    'unit': "width: '5%',",
    'location': "width: '12%',",
    'status': "width: '10%',",
    'locationUpdatedAt': "width: '8%',",
    'action': "width: '10%',"
};

for (const [key, widthStr] of Object.entries(widthMap)) {
    const regex = new RegExp(`key: '${key}',\\s+label: '[^']+',\\s*(?:sortable: true,\\s*(?:align: '[a-z]+',\\s*)?)?`, 'g');
    code = code.replace(regex, (match) => {
        if (match.includes("width: '140px'")) return match; // Will manually handle vendor
        return `${match}\n            ${widthStr}`;
    });
}

// Manually fix vendor
code = code.replace(/width: '140px'/g, "width: '14%'");
// Manually fix vendor column inline width
code = code.replace(/maxWidth: '140px'/g, "width: '100%'");

fs.writeFileSync(file, code);
console.log('Added percentage widths to columns');
