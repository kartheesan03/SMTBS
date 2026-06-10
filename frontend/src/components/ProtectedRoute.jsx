import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role ? user.role.toLowerCase() : '';
        const isSuperAdmin = user.email === 'admin@smtbms.com' || userRole === 'super admin' || userRole === 'admin';
        
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
        
        if (!isSuperAdmin && !normalizedAllowed.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
