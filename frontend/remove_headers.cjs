const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Admin/Documents/project/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
let replacedCount = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  if (file === 'AdminDashboard.jsx') {
      newContent = newContent.replace(/export const RDHeader = [\s\S]*?\/\/\s*---\s*Page Specific Components\s*---/m, '// --- Page Specific Components ---');
      newContent = newContent.replace(/<RDHeader[\s\S]*?\/>/g, '');
  } else {
      newContent = newContent.replace(/import\s*{\s*RDHeader\s*}\s*from\s*['"]\.?\/AdminDashboard['"];?\n?/g, '');
      newContent = newContent.replace(/<RDHeader[\s\S]*?\/>/g, '');
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log('Updated', file);
    replacedCount++;
  }
}
console.log('Done. Replaced in', replacedCount, 'files.');
