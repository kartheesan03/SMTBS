const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'associations.js' && f !== 'index.js');

for (const file of files) {
    const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
    
    // Check if it has primaryKey: true but misses autoIncrement: true
    if (content.includes('primaryKey: true')) {
        if (!content.includes('autoIncrement: true') && !content.includes('defaultValue: DataTypes.UUIDV4')) {
            console.log(`[!] Missing autoIncrement in: ${file}`);
        }
    }
}
