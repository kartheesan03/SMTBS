export const canWrite = (user) => {
    if (!user) return false;
    if (user.email === 'admin@smtbms.com') {
        return true;
    }
    if (!user.role) return false;
    const role = user.role.toLowerCase();
    if (role === 'employee' || role === 'sales') {
        return false;
    }
    if (['admin', 'super admin', 'hr', 'manager'].includes(role)) {
        return true;
    }
    return false;
};
export const isAdmin = (user) => {
    if (!user) return false;
    if (user.email === 'admin@smtbms.com') {
        return true;
    }
    if (!user.role) return false;
    const role = user.role.toLowerCase();
    return role === 'admin' || role === 'super admin';
};
