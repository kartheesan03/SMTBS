import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CustomerDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="p-30">
            <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
            <p>Welcome, {user?.name}. Manage your orders and interactions here.</p>
        </div>
    );
};

export default CustomerDashboard;
