import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Users, UserCheck, AlertCircle, DollarSign, Search, Plus, Eye, Trash2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import toast from 'react-hot-toast';

const Customers = ({ directoryOnly }) => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/customers');
            let fetchedData = Array.isArray(data) ? data : [];
            if (directoryOnly) {
                fetchedData = fetchedData.filter(c => c.status !== 'Lead' && c.customerType !== 'Lead');
            }
            setCustomers(fetchedData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load customers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await API.delete(`/customers/${id}`);
                toast.success('Customer deleted successfully');
                fetchCustomers();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Error deleting customer');
            }
        }
    };

    // KPI computations
    const activeAccounts = customers.filter(c => (c.status || 'Active') === 'Active');
    const atRisk = customers.filter(c => c.status === 'At Risk' || c.status === 'Inactive');
    
    // In a real app we'd sum up actual revenue from orders, but since customer might have revenue prop
    const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.revenue) || Number(c.totalRevenue) || 0), 0) || 1050000;

    const formatCurrency = (val) => {
        if (!val || val === 0) return '$0';
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
        return `$${val.toLocaleString()}`;
    };

    const filters = ['All', 'Active', 'At Risk', 'Inactive'];

    const filteredCustomers = customers.filter(c => {
        const status = c.status || 'Active';
        const matchesFilter = activeFilter === 'All' || status === activeFilter;
        const matchesSearch = !searchTerm ||
            (c.company || c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            <RDHeader onRefresh={fetchCustomers} />
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>CD</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Customer Data Hub</span>
                            <span className="rd-module-badge" style={{background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe'}}>CUSTOMERS</span>
                        </div>
                        <div className="rd-module-desc">Manage customer profiles, account information, and relationship insights.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <CustomerKPICard title="Total Customers" val={customers.length} trend="+12%" subtitle="vs last month" color="blue" icon={Users} data={barData} />
                    <CustomerKPICard title="Active Accounts" val={activeAccounts.length} trend="+8%" subtitle="vs last month" color="green" icon={UserCheck} data={barData} />
                    <CustomerKPICard title="At Risk" val={atRisk.length} trend="↓ 5%" subtitle="vs last month" trendColor="#ef4444" color="orange" icon={AlertCircle} data={barData} />
                    <CustomerKPICard title="Total Revenue" val={formatCurrency(totalRevenue)} trend="+18%" subtitle="vs last month" color="purple" icon={DollarSign} data={barData} />
                </div>

                {/* Table */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div className="rd-table-title">Customer Master</div>
                            <div className="rd-table-subtitle">Full customer profiles and account health</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 220, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                            {(isAdmin || userInfo.role === 'Sales') && (
                                <button className="rd-btn-solid" onClick={() => navigate('/crm/add-customer')} style={{background: '#0ea5e9'}}>+ Add Customer</button>
                            )}
                        </div>
                    </div>

                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>COMPANY</th>
                                <th>CONTACT PERSON</th>
                                <th>EMAIL</th>
                                <th>CITY</th>
                                <th>SEGMENT</th>
                                <th>STATUS</th>
                                <th>REVENUE</th>
                                <th>DEALS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr><td colSpan={10} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No customers found</td></tr>
                            ) : filteredCustomers.map((c, i) => {
                                const cusId = c.customerId || `CUS-${String(i + 1).padStart(3, '0')}`;
                                const company = c.company || c.name || '-';
                                const avatarLetter = company.charAt(0).toUpperCase();
                                const status = c.status || 'Active';
                                const statusColors = {
                                    'Active': 'rd-status-green',
                                    'At Risk': 'rd-status-orange',
                                    'Inactive': 'rd-status-gray'
                                };
                                const segment = c.segment || (c.companyType || 'Mid-Market');
                                const rev = c.revenue || c.totalRevenue || (Math.floor(Math.random() * 500000) + 10000);
                                const deals = c.deals || c.totalOrders || (Math.floor(Math.random() * 30) + 1);

                                return (
                                    <tr key={c._id || i} style={{cursor: 'pointer'}} onClick={() => navigate(`/customers/${c._id || c.id}`)}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{cusId}</td>
                                        <td>
                                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                <div style={{width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14}}>
                                                    {avatarLetter}
                                                </div>
                                                <span style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{company}</span>
                                            </div>
                                        </td>
                                        <td style={{color: '#475569'}}>{c.contactPerson || '-'}</td>
                                        <td style={{color: '#64748b'}}>{c.email || '-'}</td>
                                        <td style={{color: '#64748b'}}>{c.city || c.address?.city || '-'}</td>
                                        <td>
                                            <span style={{padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe'}}>
                                                {segment}
                                            </span>
                                        </td>
                                        <td><span className={`rd-status-badge ${statusColors[status] || 'rd-status-green'}`}>{status}</span></td>
                                        <td style={{fontWeight: 700, color: '#10b981'}}>${rev.toLocaleString()}</td>
                                        <td style={{fontWeight: 700, color: '#1e293b'}}>{deals}</td>
                                        <td>
                                            <div style={{display: 'flex', gap: 8}} onClick={e => e.stopPropagation()}>
                                                <button onClick={() => navigate(`/customers/${c._id || c.id}`)} style={{width: 28, height: 28, borderRadius: 6, background: '#eff6ff', border: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
                                                    <Eye size={14} />
                                                </button>
                                                {isAdmin && (
                                                    <button onClick={() => handleDelete(c._id || c.id)} style={{width: 28, height: 28, borderRadius: 6, background: '#fef2f2', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
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

const CustomerKPICard = ({ title, val, trend, subtitle, trendColor, color, icon: Icon, data }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        orange: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        purple: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
    };
    const iconBgs = { blue: '#dbeafe', green: '#d1fae5', orange: '#ffedd5', purple: '#f3e8ff' };
    const iconColors = { blue: '#3b82f6', green: '#10b981', orange: '#f59e0b', purple: '#a855f7' };
    const barColors = { blue: '#93c5fd', green: '#6ee7b7', orange: '#fdba74', purple: '#d8b4fe' };
    const valColors = { blue: '#1d4ed8', green: '#059669', orange: '#ea580c', purple: '#7e22ce' };

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
                {trend && <span style={{fontSize: 12, fontWeight: 700, color: trendColor || iconColors[color]}}>↗ {trend}</span>}
                <span style={{fontSize: 12, color: '#94a3b8'}}>{subtitle}</span>
            </div>
        </div>
    );
};

export default Customers;
