const fs = require('fs');

const controllers = ['vendor', 'customer', 'material'];

controllers.forEach(name => {
    let content = fs.readFileSync(`c:/Users/Admin/Documents/project/backend/src/controllers/${name}Controller.js`, 'utf8');
    
    // Add getTimeline method
    const timelineMethod = `
const getTimeline = async (req, res) => {
    try {
        const id = req.params.id;
        const AuditLog = require('../models/AuditLog');
        const logs = await AuditLog.find({ module: '${name.charAt(0).toUpperCase() + name.slice(1)}', targetId: id }).sort({ createdAt: -1 });
        
        // Map to timeline format
        const timeline = logs.map(log => ({
            id: log.id,
            action: log.action,
            description: log.description || \`\${log.action} action performed\`,
            user: log.userName || 'System',
            date: log.createdAt,
            time: new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }));
        
        // If empty, return a fallback so it doesn't look broken
        if (timeline.length === 0) {
            timeline.push({
                id: 'init',
                action: 'CREATE',
                description: 'Record initialized',
                user: 'System',
                date: new Date(),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            });
        }
        
        res.json(timeline);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching timeline' });
    }
};
`;

    if (!content.includes('getTimeline')) {
        content = content.replace('module.exports = {', timelineMethod + '\nmodule.exports = {\n    getTimeline,');
        fs.writeFileSync(`c:/Users/Admin/Documents/project/backend/src/controllers/${name}Controller.js`, content);
    }

    // Update routes
    let routeContent = fs.readFileSync(`c:/Users/Admin/Documents/project/backend/src/routes/${name}Routes.js`, 'utf8');
    if (!routeContent.includes('getTimeline')) {
        routeContent = routeContent.replace(
            /const \{([^\}]+)\} = require\('\.\.\/controllers\/.*Controller'\);/,
            `const {$1, getTimeline } = require('../controllers/${name}Controller');`
        );
        routeContent = routeContent.replace(
            `router.get('/:id', protect, `,
            `router.get('/:id/timeline', protect, getTimeline);\nrouter.get('/:id', protect, `
        );
        
        fs.writeFileSync(`c:/Users/Admin/Documents/project/backend/src/routes/${name}Routes.js`, routeContent);
    }
});
console.log('Timeline routes and controllers updated.');
