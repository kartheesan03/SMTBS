import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Building2, CheckCircle, AlertTriangle, DollarSign, Star, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const Vendors = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/vendors');
            setVendors(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load vendors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleDeleteVendor = async (row) => {
        const id = row._id || row.id;
        if (!id) return toast.error("Invalid vendor ID");
        
        if (window.confirm(`Are you sure you want to delete ${row.name}? This action cannot be undone.`)) {
            try {
                await API.delete(`/vendors/${id}`);
                toast.success('Vendor deleted successfully.');
                fetchVendors();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Error deleting vendor');
            }
        }
    };

    // KPI computations
    const activeVendors = vendors.filter(v => (v.status || 'Active').toLowerCase() === 'active');
    const onHoldVendors = vendors.filter(v => (v.status || '').toLowerCase() === 'on hold');
    const totalOutstanding = vendors.reduce((sum, v) => sum + (Number(v.outstanding) || 0), 0);

    const formatCurrency = (val) => {
        if (!val || val === 0) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
        return `₹${val.toLocaleString()}`;
    };

    const renderStars = (rating) => {
        const r = Number(rating) || 0;
        const full = Math.floor(r);
        const half = r - full >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return (
            <div style={{display: 'flex', gap: 2}}>
                {[...Array(full)].map((_, i) => <Star key={`f${i}`} size={14} fill="#f59e0b" color="#f59e0b" />)}
                {half ? <Star key="h" size={14} fill="#f59e0b" color="#f59e0b" style={{clipPath: 'inset(0 50% 0 0)'}} /> : null}
                {[...Array(empty)].map((_, i) => <Star key={`e${i}`} size={14} fill="none" color="#cbd5e1" />)}
            </div>
        );
    };

    const columns = [
        { 
            key: 'name', 
            label: 'Vendor Name', 
            sortable: true,
            render: (val, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Building2 size={20} />
                    </div>
                    <div>
                        <div style={{fontWeight: 600, color: '#0f172a'}}>{val}</div>
                        <div style={{fontSize: 12, color: '#64748b'}}>{row.companyName || 'No Company'}</div>
                    </div>
                </div>
            )
        },
        { key: 'category', label: 'Category', sortable: true },
        { 
            key: 'rating', 
            label: 'Rating', 
            sortable: true,
            render: (val) => renderStars(val)
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const status = val || 'Active';
                const badgeClass = status.toLowerCase() === 'active' ? 'success' : 'warning';
                return <span className={`ui-badge ${badgeClass}`}>{status}</span>;
            }
        },
        { 
            key: 'outstanding', 
            label: 'Outstanding', 
            sortable: true,
            render: (val) => <span style={{fontWeight: 600, color: '#ef4444'}}>₹{val?.toLocaleString() || 0}</span>
        }
    ];

    const actions = [
        { label: 'View Profile', icon: Eye, onClick: (row) => navigate(`/vendors/${row._id || row.id}`) },
        { label: 'Edit', icon: Edit, onClick: (row) => navigate(`/vendors/${row._id || row.id}/edit`) },
        { label: 'Delete', icon: Trash2, onClick: handleDeleteVendor, color: 'danger' }
    ];

    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    return (
        <div className="rd-container">
            
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800, color: 'white'}}>VM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>VENDORS</span>
                            <span className="rd-module-title">Vendor Management</span>
                        </div>
                        <div className="rd-module-desc">Manage supplier relationships, contracts, performance, and compliance.</div>
                    </div>
                </div>

                <div className="rd-kpi-row">
                    <VendorKPICard title="Total Vendors" val={vendors.length} icon={Building2} color="blue" data={barData} />
                    <VendorKPICard title="Active" val={activeVendors.length} icon={CheckCircle} color="green" data={barData} />
                    <VendorKPICard title="On Hold" val={onHoldVendors.length} icon={AlertTriangle} color="orange" data={barData} />
                    <VendorKPICard title="Total Outstanding" val={formatCurrency(totalOutstanding)} icon={DollarSign} color="red" data={barData} />
                </div>

                <div style={{ marginTop: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            Loading vendor data...
                        </div>
                    ) : (
                        <DataTable 
                            title="Vendor Directory"
                            subtitle="Manage and track all registered suppliers and partners"
                            columns={columns}
                            data={vendors}
                            actions={actions}
                            searchPlaceholder="Search by name, company, or category..."
                            primaryAction={{
                                label: 'Add Vendor',
                                icon: Plus,
                                onClick: () => navigate('/vendors/new')
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const VendorKPICard = ({ title, val, icon: Icon, color, data }) => {
    return (
        <div className={`rd-kpi-card ${color}`} style={{minHeight: 130, padding: 20}}>
            <div className="rd-kpi-header">
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <span style={{fontSize: 13, fontWeight: 600, opacity: 0.9}}>{title}</span>
                    <span style={{fontSize: 26, fontWeight: 800}}>{val}</span>
                </div>
                <div className="rd-kpi-icon-box" style={{width: 42, height: 42, opacity: 0.9}}>
                    <Icon size={22} color="#fff" />
                </div>
            </div>
            <div style={{marginTop: 16, height: 30, opacity: 0.6}}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <Bar dataKey="v" fill="#fff" radius={[2,2,0,0]} barSize={6} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Vendors;
