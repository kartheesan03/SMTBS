import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Building2, CheckCircle, AlertTriangle, DollarSign, Search, Star, Plus } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import toast from 'react-hot-toast';

const Vendors = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchVendors = async () => {
        try {
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

    const handleDeleteVendor = async (vendor) => {
        if (window.confirm(`Are you sure you want to delete ${vendor.name}? This action cannot be undone.`)) {
            try {
                await API.delete(`/vendors/${vendor._id || vendor.id}`);
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

    const filters = ['All', 'Active', 'On Hold'];
    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    const filteredVendors = vendors.filter(v => {
        const status = (v.status || 'Active');
        const matchesFilter = activeFilter === 'All' || status === activeFilter;
        const matchesSearch = !searchTerm ||
            (v.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            <RDHeader onRefresh={fetchVendors} />
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>VM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Vendor Management</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>VENDORS</span>
                        </div>
                        <div className="rd-module-desc">Manage supplier relationships, contracts, performance, and compliance.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <VendorKPICard title="Total Vendors" val={vendors.length} trend="+9%" subtitle="vs last month" color="blue" icon={Building2} data={barData} />
                    <VendorKPICard title="Active" val={activeVendors.length} trend="+12%" subtitle="vs last month" color="green" icon={CheckCircle} data={barData} />
                    <VendorKPICard title="On Hold" val={onHoldVendors.length} trend="↓ 5%" subtitle="vs last month" color="orange" icon={AlertTriangle} data={barData} />
                    <VendorKPICard title="Outstanding" val={formatCurrency(totalOutstanding)} trend="" subtitle="Pending payments" subtitleColor="#ef4444" color="red" icon={DollarSign} data={barData} isCurrency />
                </div>

                {/* Table */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div className="rd-table-title">Vendor Master</div>
                            <div className="rd-table-subtitle">All registered vendors and payment terms</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 220, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search vendor, category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <div style={{display: 'flex', gap: 6}}>
                                {filters.map(f => (
                                    <button key={f} onClick={() => setActiveFilter(f)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                                            background: activeFilter === f ? '#3b82f6' : '#fff',
                                            color: activeFilter === f ? '#fff' : '#64748b',
                                            borderColor: activeFilter === f ? '#3b82f6' : '#e2e8f0'
                                        }}>{f}</button>
                                ))}
                            </div>
                            <button className="rd-btn-solid" onClick={() => navigate('/vendors/add-vendor')}>+ Add Vendor</button>
                        </div>
                    </div>

                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>VENDOR ID</th>
                                <th>NAME</th>
                                <th>CATEGORY</th>
                                <th>CONTACT</th>
                                <th>CITY</th>
                                <th>RATING</th>
                                <th>ORDERS</th>
                                <th>TOTAL PAID</th>
                                <th>OUTSTANDING</th>
                                <th>PAY TERMS</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.length === 0 ? (
                                <tr><td colSpan={11} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No vendors found</td></tr>
                            ) : filteredVendors.map((v, i) => {
                                const vendorId = v.vendorId || `VND-${String(i + 1).padStart(3, '0')}`;
                                const status = v.status || 'Active';
                                const categoryColors = {
                                    'Plumbing': '#8b5cf6', 'Wood': '#f59e0b', 'Electrical': '#3b82f6',
                                    'Metals': '#6366f1', 'Construction': '#0ea5e9', 'Paints': '#f97316',
                                    'Hardware': '#10b981', 'General': '#64748b'
                                };
                                const catColor = categoryColors[v.category] || '#64748b';

                                return (
                                    <tr key={v._id || i} style={{cursor: 'pointer'}} onClick={() => navigate(`/vendors/${v._id || v.id}`)}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{vendorId}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{v.name || v.companyName || '-'}</td>
                                        <td>
                                            {v.category && (
                                                <span style={{padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30`}}>
                                                    {v.category}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{color: '#475569'}}>{v.contactPerson || v.contact || '-'}</td>
                                        <td style={{color: '#64748b'}}>{v.city || v.address?.city || '-'}</td>
                                        <td>{renderStars(v.rating || 3)}</td>
                                        <td style={{fontWeight: 600, color: '#475569'}}>{v.orderCount || v.totalOrders || 0}</td>
                                        <td style={{fontWeight: 700, color: '#10b981'}}>{formatCurrency(v.totalPaid || 0)}</td>
                                        <td style={{fontWeight: 700, color: (v.outstanding || 0) > 0 ? '#ef4444' : '#64748b'}}>{formatCurrency(v.outstanding || 0)}</td>
                                        <td style={{color: '#64748b'}}>{v.paymentTerms || 'Net 30'}</td>
                                        <td>
                                            <span className={`rd-status-badge ${status === 'Active' ? 'rd-status-green' : status === 'On Hold' ? 'rd-status-orange' : 'rd-status-red'}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const VendorKPICard = ({ title, val, trend, subtitle, subtitleColor, color, icon: Icon, data, isCurrency }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        orange: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        red: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
    };
    const iconBgs = { blue: '#dbeafe', green: '#d1fae5', orange: '#ffedd5', red: '#ffe4e6' };
    const iconColors = { blue: '#3b82f6', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };
    const barColors = { blue: '#93c5fd', green: '#6ee7b7', orange: '#fdba74', red: '#fca5a5' };
    const valColors = { blue: '#1d4ed8', green: '#059669', orange: '#ea580c', red: '#dc2626' };
    const trendColors = { blue: '#3b82f6', green: '#10b981', orange: '#f59e0b', red: '#ef4444' };

    return (
        <div style={{
            background: gradients[color], borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.04)', minHeight: 130, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: 10, background: iconBgs[color], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon size={20} color={iconColors[color]} />
                    </div>
                    <div>
                        <div style={{fontSize: 28, fontWeight: 800, color: valColors[color], lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 6}}>{title}</div>
                    </div>
                </div>
                <div style={{width: 80, height: 50}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="v" fill={barColors[color]} radius={[2,2,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 10}}>
                {trend && <span style={{fontSize: 12, fontWeight: 700, color: trendColors[color]}}>↗ {trend}</span>}
                <span style={{fontSize: 12, color: subtitleColor || '#94a3b8'}}>{subtitle}</span>
            </div>
        </div>
    );
};

export default Vendors;
