const fs = require('fs');
let content = fs.readFileSync('c:/Users/Admin/Documents/project/frontend/src/pages/AriaCommandCenter.jsx', 'utf8');

content = content.replace(/const handleFileUpload = async.*?};\n\n/s, '');
content = content.replace(/<input\s+type="file"\s+ref=\{fileInputRef\}.*?\/>\s*/s, '');
content = content.replace(/<button onClick=\{[^>]*?fileInputRef.*?\}\/ocr<\/button>\s*/s, '');
content = content.replace(/'Documents': \{ title: 'Data Extraction', tags: \['OCR', 'Validation'\], filters: \['Type', 'Confidence', 'Date'\] \},\s*/s, '');

fs.writeFileSync('c:/Users/Admin/Documents/project/frontend/src/pages/AriaCommandCenter.jsx', content);
console.log("Successfully modified AriaCommandCenter");
