import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
const ProtectedRoute = ({ children, requiredPermission, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return null;
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && allowedRoles.length > 0) {
        const isSuperAdmin = user.email === 'admin@smtbms.com' || (user.role && user.role.toLowerCase() === 'super admin') || (user.role && user.role.toLowerCase() === 'admin');
        const role = (user.role || '').toLowerCase();
        if (!isSuperAdmin && !allowedRoles.includes(role)) {
            return <Navigate to="/access-denied" replace />;
        }
    }
    if (requiredPermission) {
        const isSuperAdmin = user.email === 'admin@smtbms.com' || (user.role && user.role.toLowerCase() === 'super admin');
        const isEmployeeMaterial = user.role && user.role.toLowerCase() === 'employee' && requiredPermission === 'view_materials_self';
        const isManagerHrms = Array.isArray(user.permissions) && user.permissions.includes('view_hrms') && requiredPermission.startsWith('hrms:') && requiredPermission.endsWith(':view');
        const hasPermission = isSuperAdmin || isEmployeeMaterial || isManagerHrms || (Array.isArray(user.permissions) && (user.permissions.includes(requiredPermission) || user.permissions.includes('all')));
        if (!isSuperAdmin && !hasPermission) {
            return <Navigate to="/access-denied" replace />;
        }
    }
    return children;
};
export default ProtectedRoute;
