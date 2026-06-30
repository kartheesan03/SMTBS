const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple regex to match KPI card components and remove the trend/chart part.
            // We can search for <ResponsiveContainer...> inside the KPI components.
            
            // This is complex to do with Regex. Let's just remove anything from <div style={{display: 'flex', alignItems: 'flex-end' to </ResponsiveContainer></div></div>
            // Wait, the KPI cards all have a standard structure.
            
            // Let's remove the <ResponsiveContainer> block manually using string replacement
            const startMarker = "<div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16}}>";
            const endMarker = "</div>\n        </div>\n    );\n};";
            
            if (content.includes(startMarker)) {
                content = content.replace(/<div style=\{\{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16\}\}>[\s\S]*?<\/div>\n        <\/div>\n    \);\n\};/g, '</div>\n    );\n};');
                modified = true;
            }

            // For HRMSShared.jsx (HRMSKPICard)
            if (content.includes('HRMSKPICard')) {
                content = content.replace(/trend(Dir)?,\s*/g, '');
                content = content.replace(/data,\s*/g, '');
            }

            // Remove destructured props: trend, trendDir, data
            content = content.replace(/trend, trendDir, color, data/g, 'color');
            content = content.replace(/trend, trendDir, data, color/g, 'color');
            content = content.replace(/trend, color, data/g, 'color');

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed KPI Card: ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Done.');
