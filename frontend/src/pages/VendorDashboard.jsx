import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const VendorDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="p-30">
            <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
            <p>Welcome, {user?.name}. Manage your supplies and interactions here.</p>
        </div>
    );
};

export default VendorDashboard;
