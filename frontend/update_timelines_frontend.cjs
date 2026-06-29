const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Admin/Documents/project/frontend/src/pages';
const files = ['VendorDetails.jsx', 'MaterialDetails.jsx', 'CustomerDetails.jsx'];

files.forEach(f => {
    let filePath = path.join(dir, f);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Add timeline state
    if (!content.includes('const [timeline, setTimeline]')) {
        content = content.replace(
            /(const \[loading, setLoading\] = useState\(true\);)/,
            '$1\n    const [timeline, setTimeline] = useState([]);'
        );
    }
    
    const endpoint = f === 'VendorDetails.jsx' ? 'vendors' : f === 'MaterialDetails.jsx' ? 'materials' : 'customers';
    
    // Find the fetch block
    if (content.includes(`const { data } = await API.get(\`/\${endpoint}/\${id}\`);`)) {
        content = content.replace(
            `const { data } = await API.get(\`/\${endpoint}/\${id}\`);`,
            `const { data } = await API.get(\`/\${endpoint}/\${id}\`);\n            const timelineRes = await API.get(\`/\${endpoint}/\${id}/timeline\`).catch(e => ({ data: [] }));\n            setTimeline(timelineRes.data || []);`
        );
    } else if (content.includes(`const { data } = await API.get(\`/${endpoint}/\${id}\`);`)) {
        content = content.replace(
            `const { data } = await API.get(\`/${endpoint}/\${id}\`);`,
            `const { data } = await API.get(\`/${endpoint}/\${id}\`);\n            const timelineRes = await API.get(\`/${endpoint}/\${id}/timeline\`).catch(e => ({ data: [] }));\n            setTimeline(timelineRes.data || []);`
        );
    }

    // Replace mock timeline with real one
    content = content.replace(/const mockTimeline = \[\s*\{[^\]]+\];/g, '');
    
    content = content.replace(
        /<Timeline items=\{mockTimeline\} \/>/g,
        `<Timeline items={timeline.map((t, i) => ({ id: t.id || i, time: t.date ? new Date(t.date).toLocaleDateString() : t.time, title: t.action || 'Event', description: t.description || 'System action', color: '#3b82f6' }))} />`
    );
    
    // Remove comments
    content = content.replace(/\/\/ Mock timeline for now until backend audit log exists/g, '');

    fs.writeFileSync(filePath, content);
});
console.log('Done updating details timelines');
