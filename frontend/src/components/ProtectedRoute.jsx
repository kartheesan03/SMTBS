import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { hasHrmsPermission } from '../config/hrmsMenuConfig';

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
        if (requiredPermission.startsWith('hrms:')) {
            if (!hasHrmsPermission(user, requiredPermission)) {
                return <Navigate to="/access-denied" replace />;
            }
        } else {
            // If user is super admin they might have "all" permission.
            const isSuperAdmin = user.email === 'admin@smtbms.com' || (user.role && user.role.toLowerCase() === 'super admin');
            
            // Bypass for Employee accessing self-service material routes
            const isEmployeeMaterial = user.role && user.role.toLowerCase() === 'employee' && requiredPermission === 'view_materials_self';
            
            const hasPermission = isSuperAdmin || isEmployeeMaterial || (Array.isArray(user.permissions) && (user.permissions.includes(requiredPermission) || user.permissions.includes('all')));
            if (!hasPermission) {
                return <Navigate to="/access-denied" replace />;
            }
        }
    }

    return children;
};

export default ProtectedRoute;
