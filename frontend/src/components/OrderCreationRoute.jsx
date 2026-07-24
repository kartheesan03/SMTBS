import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OrderCreationRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.role ? user.role.toLowerCase() : '';
    const allowedRoles = ['admin', 'super admin', 'manager', 'hr'];

    if (!allowedRoles.includes(userRole)) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-body)' }}>
                <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '40px', borderRadius: '0px', border: '1px solid var(--border)' }}>
                    <h2 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: '500' }}>Access Denied. You do not have permission to create orders.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default OrderCreationRoute;
