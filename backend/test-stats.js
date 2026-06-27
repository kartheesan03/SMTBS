const fs = require('fs');
const path = require('path');

const fileContent = fs.readFileSync(path.join(__dirname, 'src/controllers/dashboardcontroller.js'), 'utf-8');
const lines = fileContent.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('data.hrStats = {')) {
        for (let j = i; j < i + 25; j++) {
            console.log(lines[j]);
        }
        break;
    }
}
