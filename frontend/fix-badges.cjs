const fs = require('fs');
const path = require('path');

const dashboards = [
    'AdminDashboard.jsx',
    'HRDashboard.jsx',
    'ManagerDashboard.jsx',
    'SalesDashboard.jsx',
    'EmployeeDashboard.jsx'
];

dashboards.forEach(dashboard => {
    const filePath = path.join(__dirname, 'src', 'pages', dashboard);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add NotificationContext import if missing
    if (!content.includes('NotificationContext')) {
        content = content.replace(
            "import { AuthContext } from '../context/AuthContext';",
            "import { AuthContext } from '../context/AuthContext';\nimport { NotificationContext } from '../context/NotificationContext';"
        );
    }
    
    // Add unreadCount extraction
    if (!content.includes('const { unreadCount } = useContext(NotificationContext);')) {
        content = content.replace(
            "const { user, logout } = useContext(AuthContext);",
            "const { user, logout } = useContext(AuthContext);\n    const { unreadCount } = useContext(NotificationContext);"
        );
    }
    
    // Replace the hardcoded badge
    const badgeRegex = /<span className="erp-notification-badge" style=\{\{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' \}\}>4<\/span>/g;
    
    const replacement = "{unreadCount > 0 && <span className=\"erp-notification-badge\" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{unreadCount}</span>}";
    
    content = content.replace(badgeRegex, replacement);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${dashboard}`);
});
