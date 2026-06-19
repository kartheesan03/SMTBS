const fs = require('fs');
const path = './src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import\s+(\w+)\s+from\s+['"]\.\/pages\/([^'"]+)['"];?/g, "const $1 = React.lazy(() => import('./pages/$2'));");
content = content.replace(/<Routes>/, "<React.Suspense fallback={<div className=\"app-loading\">Loading...</div>}>\n                <Routes>");
content = content.replace(/<\/Routes>/, "</Routes>\n                </React.Suspense>");

fs.writeFileSync(path, content, 'utf8');
console.log('App.jsx updated for lazy loading.');
