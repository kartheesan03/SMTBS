const fs = require('fs');
const path = require('path');

const dualSidebarPath = path.join(__dirname, 'src', 'components', 'DualSidebar.jsx');
let dsContent = fs.readFileSync(dualSidebarPath, 'utf8');

// DualSidebar: Add hasPerm check
if (!dsContent.includes('hasPerm')) {
    dsContent = dsContent.replace(
        'const { user, logout } = useContext(AuthContext);',
        'const { user, logout } = useContext(AuthContext);\n    const hasPerm = (perm) => user?.permissions?.includes(perm) || user?.permissions?.includes("all");'
    );
}

// DualSidebar: Hide Primary Nav buttons conditionally
const psNavReplacements = [
    { name: 'attendance', perm: 'view_attendance' },
    { name: 'hrms', perm: 'view_hrms' },
    { name: 'materials', perm: 'view_materials' },
    { name: 'crm', perm: 'view_crm' },
    { name: 'erp', perm: 'view_erp' },
    { name: 'tasks', perm: 'view_tasks' },
    { name: 'reports', perm: 'view_reports' },
    { name: 'settings', perm: 'view_settings' }
];

psNavReplacements.forEach(r => {
    const regex = new RegExp(`(<button className={\\\`ps-nav-item \\\${activePrimaryTab === '${r.name}' \\? 'active' : ''}\\\` onClick=\{\\(\\) => \\{ setActivePrimaryTab\\('${r.name}'\\); setIsExpanded\\(true\\); \\}\\} title=".*?">\\s*<.*? />\\s*</button>)`, 'g');
    dsContent = dsContent.replace(regex, `{hasPerm('${r.perm}') && ( $1 )}`);
});

fs.writeFileSync(dualSidebarPath, dsContent, 'utf8');
console.log('DualSidebar.jsx refactored.');

const farmakuSidebarPath = path.join(__dirname, 'src', 'components', 'FarmakuSidebar.jsx');
let fsContent = fs.readFileSync(farmakuSidebarPath, 'utf8');

if (!fsContent.includes('hasPerm')) {
    fsContent = fsContent.replace(
        'const { logout } = useContext(AuthContext);',
        'const { user, logout } = useContext(AuthContext);\n    const hasPerm = (perm) => user?.permissions?.includes(perm) || user?.permissions?.includes("all");'
    );
    
    // AuthContext import check
    if (!fsContent.includes('const { user, logout }')) {
        fsContent = fsContent.replace(
            'const { logout }',
            'const { user, logout }'
        );
    }
}

const fsNavReplacements = [
    { name: 'hrms', perm: 'view_hrms', regex: /<li>\s*<div className={`farmaku-nav-item \${isPathActive\(\['\/hrms', '\/leave-management', '\/payroll', '\/my-salary'\]\) \? 'active' : ''}`} onClick=\{\(\) => toggleMenu\('hrms'\)\}>[\s\S]*?<\/li>/g },
    { name: 'materials', perm: 'view_materials', regex: /<li>\s*<div className={`farmaku-nav-item \${isPathActive\(\['\/materials', '\/tracking-overview', '\/stock-requests', '\/vendors'\]\) \? 'active' : ''}`} onClick=\{\(\) => toggleMenu\('materials'\)\}>[\s\S]*?<\/li>/g },
    { name: 'erp', perm: 'view_erp', regex: /<li>\s*<NavLink to="\/erp" className=\{\(\{isActive\}\) => isActive \? "farmaku-nav-item active" : "farmaku-nav-item"\}\>\s*<ShoppingCart size=\{20\} \/>\s*<span>ERP<\/span>\s*<\/NavLink>\s*<\/li>/g },
    { name: 'attendance', perm: 'view_attendance', regex: /<li>\s*<div className={`farmaku-nav-item \${isPathActive\(\['\/attendance', '\/attendance\/my'\]\) \? 'active' : ''}`} onClick=\{\(\) => toggleMenu\('attendance'\)\}>[\s\S]*?<\/li>/g },
    { name: 'crm', perm: 'view_crm', regex: /<li>\s*<NavLink to="\/crm" className=\{\(\{isActive\}\) => isActive \? "farmaku-nav-item active" : "farmaku-nav-item"\}\>\s*<Briefcase size=\{20\} \/>\s*<span>CRM<\/span>\s*<\/NavLink>\s*<\/li>/g },
    { name: 'tasks', perm: 'view_tasks', regex: /<li>\s*<NavLink to="\/tasks" className=\{\(\{isActive\}\) => isActive \? "farmaku-nav-item active" : "farmaku-nav-item"\}\>\s*<CheckSquare size=\{20\} \/>\s*<span>Tasks<\/span>\s*<\/NavLink>\s*<\/li>/g },
    { name: 'reports', perm: 'view_reports', regex: /<li>\s*<NavLink to="\/reports" className=\{\(\{isActive\}\) => isActive \? "farmaku-nav-item active" : "farmaku-nav-item"\}\>\s*<BarChart2 size=\{20\} \/>\s*<span>Reports<\/span>\s*<ChevronRight size=\{16\} style=\{\{marginLeft: 'auto'\}\} \/>\s*<\/NavLink>\s*<\/li>/g },
    { name: 'settings', perm: 'view_settings', regex: /<li>\s*<div className={`farmaku-nav-item \${isPathActive\(\['\/settings', '\/admin-dashboard', '\/reports'\]\) \? 'active' : ''}`} onClick=\{\(\) => toggleMenu\('admin'\)\}>[\s\S]*?<\/li>/g }
];

fsNavReplacements.forEach(r => {
    fsContent = fsContent.replace(r.regex, (match) => `{hasPerm('${r.perm}') && ( ${match} )}`);
});

fs.writeFileSync(farmakuSidebarPath, fsContent, 'utf8');
console.log('FarmakuSidebar.jsx refactored.');
