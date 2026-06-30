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

            // Remove makeTrend definitions
            if (content.includes('const makeTrend =')) {
                content = content.replace(/const makeTrend =.*?;/g, '');
                modified = true;
            }
            if (content.includes('const makeBarData =')) {
                content = content.replace(/const makeBarData =.*?;/g, '');
                modified = true;
            }
            
            // Remove data={makeTrend(...)}
            if (content.match(/data=\{makeTrend\([^)]*\)\}/)) {
                content = content.replace(/\s*data=\{makeTrend\([^)]*\)\}/g, '');
                modified = true;
            }
            if (content.match(/data=\{makeBarData\([^)]*\)\}/)) {
                content = content.replace(/\s*data=\{makeBarData\([^)]*\)\}/g, '');
                modified = true;
            }
            
            // Remove trend/trendDir if used with TrackingKPICard/HRMSKPICard/etc.
            // (We'll just remove them globally for these KPI cards since we removed the charts)
            if (content.match(/trend="[^"]*"/)) {
                content = content.replace(/\s*trend="[^"]*"/g, '');
                modified = true;
            }
            if (content.match(/trendDir="[^"]*"/)) {
                content = content.replace(/\s*trendDir="[^"]*"/g, '');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log('Cleaned: ' + fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Cleanup script finished.');
