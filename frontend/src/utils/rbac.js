export const canWrite = (user) => {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase();
    
    // View-only roles
    if (role === 'employee' || role === 'sales') {
        return false;
    }
    
    // Admin, HR, Manager have write access (CRUD)
    if (['admin', 'super admin', 'hr', 'manager'].includes(role) || user.email === 'admin@smtbms.com') {
        return true;
    }
    
    return false;
};

export const isAdmin = (user) => {
    if (!user || !user.role) return false;
    const role = user.role.toLowerCase();
    return role === 'admin' || role === 'super admin' || user.email === 'admin@smtbms.com';
};
