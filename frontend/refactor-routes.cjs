const fs = require('fs');
const path = require('path');

const appJsxPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appJsxPath, 'utf8');

// Add AccessDenied import if not present
if (!content.includes('AccessDenied')) {
    content = content.replace(
        "const ErrorBoundary = require('./components/ErrorBoundary');", 
        "const ErrorBoundary = require('./components/ErrorBoundary');"
    );
    // Find import section to add AccessDenied
    content = content.replace(
        "import ErrorBoundary from './components/ErrorBoundary';",
        "import ErrorBoundary from './components/ErrorBoundary';\nconst AccessDenied = React.lazy(() => import('./pages/AccessDenied'));"
    );
}

// Map of common allowedRoles -> requiredPermission
// Note: This is an approximation. We will replace the allowedRoles string completely.
const replacements = [
    { regex: /allowedRoles=\{\['Super Admin', 'Admin', 'HR', 'Manager'\]\}/g, perm: 'requiredPermission="view_hrms"' },
    { regex: /allowedRoles=\{\['Super Admin', 'Admin', 'HR', 'Manager', 'Employee'\]\}/g, perm: 'requiredPermission="view_hrms"' }, // or view_profile
    { regex: /allowedRoles=\{\['Admin', 'Manager', 'Sales', 'Employee'\]\}/g, perm: 'requiredPermission="view_materials"' }, // used in materials
    { regex: /allowedRoles=\{\['Admin', 'Manager', 'Sales'\]\}/g, perm: 'requiredPermission="manage_materials"' }, // used in add material/vendor
    { regex: /allowedRoles=\{\['Admin', 'HR', 'Manager'\]\}/g, perm: 'requiredPermission="manage_hrms"' }, // used in payroll/attendance
    { regex: /allowedRoles=\{\['Admin', 'HR'\]\}/g, perm: 'requiredPermission="manage_hrms"' }, // hr reports
    { regex: /allowedRoles=\{\['Admin', 'Manager'\]\}/g, perm: 'requiredPermission="manage_reports"' }, // team performance
    { regex: /allowedRoles=\{\['Admin', 'Manager', 'Sales', 'HR', 'Employee'\]\}/g, perm: 'requiredPermission="view_erp"' },
    { regex: /allowedRoles=\{\['Admin', 'Manager', 'Sales', 'HR', 'Employee', 'Customer'\]\}/g, perm: 'requiredPermission="view_erp"' },
    { regex: /allowedRoles=\{\['Admin', 'Manager', 'Finance'\]\}/g, perm: 'requiredPermission="manage_erp"' },
    { regex: /allowedRoles=\{\['Admin', 'Sales', 'Manager'\]\}/g, perm: 'requiredPermission="view_crm"' },
    { regex: /allowedRoles=\{\['Admin', 'Manager', 'Sales', 'HR'\]\}/g, perm: 'requiredPermission="view_reports"' },
    { regex: /allowedRoles=\{\['Customer'\]\}/g, perm: 'requiredPermission="view_customer_portal"' },
    { regex: /allowedRoles=\{\['Vendor'\]\}/g, perm: 'requiredPermission="view_vendor_portal"' }
];

replacements.forEach(r => {
    content = content.replace(r.regex, r.perm);
});

// Also add a route for /403
if (!content.includes('<Route path="/403"')) {
    content = content.replace(
        '<Route path="*" element={<Navigate to="/" replace />} />',
        '<Route path="/403" element={<AccessDenied />} />\n                    <Route path="*" element={<Navigate to="/" replace />} />'
    );
}

// Remove Dashboard role checks (AdminDashboard, HRDashboard, etc) since requirement says:
// "Dynamically load the correct dashboard..."
// We should update the root Route "/" to point to a dynamic dashboard component.
// But wait, the user said "If a new role is created... the application should automatically use its configured permissions".
// So Dashboard component itself should render widgets based on permissions, not roles.

fs.writeFileSync(appJsxPath, content, 'utf8');
console.log('App.jsx routes refactored.');
