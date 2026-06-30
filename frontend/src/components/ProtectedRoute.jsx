import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermission) {
        // If user is super admin they might have "all" permission.
        const isSuperAdmin = user.email === 'admin@smtbms.com' || (user.role && user.role.toLowerCase() === 'super admin');
        const hasPermission = isSuperAdmin || (Array.isArray(user.permissions) && (user.permissions.includes(requiredPermission) || user.permissions.includes('all')));
        if (!hasPermission) {
            return <Navigate to="/access-denied" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
