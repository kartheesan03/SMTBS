import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Building2, CheckCircle, AlertTriangle, DollarSign, Star, Plus, Eye, Edit, Trash2 , Truck} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { DataTable } from '../components/ui';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
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

    

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Vendor Management</span>
                            <span className="rd-module-badge">VENDORS</span>
                        </div>
                        </div>
                </div>

                <PastelKPIGrid>
                    <PastelKPICard title="Total Vendors" value={vendors.length} colorTheme="blue" icon={Building2} trendValue="All partners" trendPositive={true} />
                    <PastelKPICard title="Active" value={activeVendors.length} colorTheme="mint" icon={CheckCircle} trendValue="Good standing" trendPositive={true} />
                    <PastelKPICard title="On Hold" value={onHoldVendors.length} colorTheme="peach" icon={AlertTriangle} trendValue="Needs attention" trendPositive={false} />
                    <PastelKPICard title="Total Outstanding" value={formatCurrency(totalOutstanding)} colorTheme="pink" icon={DollarSign} trendValue="Unpaid balance" trendPositive={false} />
                </PastelKPIGrid>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    style={{ marginTop: '24px' }}
                >
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
                </motion.div>
            </div>
        </motion.div>
    );
};

const VendorKPICard = ({ title, val, color, icon: Icon, data }) => {
    const themeClass = color ? `ent-theme-${color}` : 'ent-theme-primary';
    
    return (
        <div className={`ent-module-card ${themeClass}`}>
            <div className="ent-card-icon-wrapper">
                {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            <div className="ent-card-title" title={title}>{title}</div>
            <div className="ent-card-value-area">
                <div className="ent-card-value">{val}</div>
                <div className="ent-card-status-badge" style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--ent-text-secondary)', fontWeight: 500 }}>Monitoring Level</div>
            </div>
            <div className="ent-card-footer">
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                    Updated Today
                </div>
            </div>
        </div>
    );
};

export default Vendors;
