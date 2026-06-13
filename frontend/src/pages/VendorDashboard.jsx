import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Package, Truck, CheckCircle, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/vendors/my-profile');
                setProfile(res.data.vendor);
                setMaterials(res.data.materials);
            } catch (error) {
                console.error("Error fetching vendor data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="app-loading">Loading...</div>;

    return (
        <div className="dashboard-container p-30">
            <div className="header-box" style={{ marginBottom: '20px' }}>
                <div className="icon-wrapper"><Store size={28} /></div>
                <h2>Vendor Dashboard</h2>
                <p>Welcome back, {profile?.name}</p>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon" style={{background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8'}}>
                        <Package size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Materials Supplied</h3>
                        <p className="metric-value">{materials.length}</p>
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-icon" style={{background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'}}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="metric-info">
                        <h3>Status</h3>
                        <p className="metric-value" style={{fontSize: '18px'}}>{profile?.status}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '30px' }}>
                <div className="dashboard-card" style={{ gridColumn: 'span 8' }}>
                    <div className="card-header">
                        <h3>My Materials Catalog</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Material Name</th>
                                    <th>Category</th>
                                    <th>Current Stock (Our End)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map(material => (
                                    <tr key={material._id || material.id}>
                                        <td>{material.name}</td>
                                        <td><span className="category-badge">{material.category}</span></td>
                                        <td>{material.quantity} {material.unit}</td>
                                    </tr>
                                ))}
                                {materials.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>No materials listed.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <h3>Business Details</h3>
                    </div>
                    <div className="profile-details" style={{ padding: '20px' }}>
                        <p><strong>Contact Person:</strong> {profile?.contactPerson}</p>
                        <p><strong>Email:</strong> {profile?.email}</p>
                        <p><strong>Phone:</strong> {profile?.phone}</p>
                        <p><strong>Address:</strong> {profile?.address}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
