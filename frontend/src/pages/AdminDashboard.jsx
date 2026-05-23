import React, { useEffect, useState, useContext, useCallback } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
    Users, Package, TrendingUp, AlertTriangle, CheckCircle2, 
    Briefcase, Calendar, DollarSign, PlusCircle, FileText, 
    Bell, Search, Filter, Download, MoreVertical, ExternalLink,
    ShoppingCart, Truck, Settings, LogOut, User as UserIcon, Clock
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

// Shared Components
import StatCard from '../components/Dashboard/StatCard';
import QuickActions from '../components/Dashboard/QuickActions';
import DataTable from '../components/Dashboard/DataTable';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

    const fetchAdminData = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/dashboard/stats');
            setData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleApproveSalary = async (id) => {
        try {
            await API.put(`/salaries/${id}/approve`);
            fetchAdminData();
        } catch (error) {
            alert('Approval failed');
        }
    };

    if (loading) return <div className="admin-loading">
        <div className="erp-loader"></div>
        <p>Loading Enterprise Intelligence...</p>
    </div>;

    const stats = [
        { title: 'Total Materials', value: data?.stats?.totalMaterials ?? 0, icon: <Package />, color: '#6366f1', path: '/materials' },
        { title: 'Total Employees', value: data?.stats?.totalEmployees ?? 0, icon: <Users />, color: '#14b8a6', path: '/hrms' },
        { title: 'Monthly Revenue', value: `$${(data?.stats?.revenue || 0).toLocaleString()}`, icon: <DollarSign />, color: '#8b5cf6', path: '/analytics' },
        { title: 'Pending Orders', value: data?.stats?.pendingOrders ?? 0, icon: <ShoppingCart />, color: '#f59e0b', path: '/erp' },
        { title: 'Pending Payroll', value: data?.stats?.pendingSalaries ?? 0, icon: <FileText />, color: '#8b5cf6', path: '/payroll' },
        { title: 'Pending CRM', value: data?.stats?.pendingCustomers ?? 0, icon: <Briefcase />, color: '#10b981', path: '/customers' },
    ];

    const quickActions = [
        { label: 'Add Material', icon: <Package size={20}/>, onClick: () => navigate('/materials', { state: { openModal: true } }) },
        { label: 'Add Employee', icon: <Users size={20}/>, onClick: () => navigate('/hrms', { state: { openModal: true } }) },
        { label: 'Create Order', icon: <ShoppingCart size={20}/>, onClick: () => navigate('/erp', { state: { openModal: true } }) },
        { label: 'Add Customer', icon: <Briefcase size={20}/>, onClick: () => navigate('/customers', { state: { openModal: true } }) },
    ];

    return (
        <div className="admin-wrapper">
            {/* Top Navbar */}
            <nav className="admin-navbar glass-card">
                <div className="nav-search">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search across ERP, CRM, Assets..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="nav-controls">
                    <div className="nav-icon-btn" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                        <Bell size={20} />
                        <span className="count-badge">0</span>
                    </div>
                    <div className="nav-user-dropdown">
                        <div className="user-avatar">
                            <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt="Admin" />
                        </div>
                        <div className="user-info-brief">
                            <p className="user-name">{user?.name}</p>
                            <small className="user-role">Administrator</small>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header / Export Section */}
            <div className="admin-header-flex">
                <div>
                    <h2 className="title-gradient">Enterprise Overview</h2>
                    <p className="text-muted">Real-time business indicators and operations monitoring.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary flex-center gap-10">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="btn-primary flex-center gap-10">
                        <Download size={16} /> Export Reports
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <section className="stats-grid-admin">
                {stats.map((s, i) => (
                    <div key={i} className="clickable-stat" onClick={() => navigate(s.path)}>
                        <StatCard {...s} />
                    </div>
                ))}
            </section>

            {/* Critical Alerts Banner */}
            <div className="alert-section-grid">
                {data?.tables?.lowStock?.length > 0 && (
                    <div className="alert-banner warning">
                        <AlertTriangle size={20} />
                        <div className="alert-text">
                            <strong>Inventory Alert:</strong> {data.tables.lowStock.length} items are below safety threshold.
                        </div>
                        <button className="alert-action-btn" onClick={() => navigate('/materials')}>Fix Stock</button>
                    </div>
                )}
                {data?.stats?.pendingSalaries > 0 && (
                    <div className="alert-banner info">
                        <DollarSign size={20} />
                        <div className="alert-text">
                            <strong>Payroll Alert:</strong> {data.stats.pendingSalaries} salary records are awaiting your final approval.
                        </div>
                        <button className="alert-action-btn" onClick={() => navigate('/payroll')}>Go to Payroll</button>
                    </div>
                )}
            </div>

            {/* Approvals Section */}
            {(data?.tables?.pendingSalaries?.length > 0) && (
                <section className="approvals-section glass-card">
                    <div className="card-header">
                        <h3 className="flex-center gap-10"><Clock size={18} className="text-warning"/> Critical Approvals Awaiting</h3>
                        <span className="count-badge-lg">{data.tables.pendingSalaries.length} Pending</span>
                    </div>
                    <div className="approval-list">
                        {data.tables.pendingSalaries.map(sal => (
                            <div key={sal._id} className="approval-card glass-card">
                                <div className="app-info">
                                    <div className="user-icon-sm"><UserIcon size={16}/></div>
                                    <div>
                                        <strong>{sal.employee?.userId?.name}</strong>
                                        <p>{sal.month} Payroll • <span className="text-primary">${sal.netSalary.toLocaleString()}</span></p>
                                    </div>
                                </div>
                                <div className="app-actions">
                                    <button className="btn-table-action view" onClick={() => navigate('/payroll')}>View Details</button>
                                    <button className="btn-table-action approve" onClick={() => handleApproveSalary(sal._id)}>Quick Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Analytics Section */}
            <section className="analytics-grid">
                <div className="glass-card big-chart">
                    <div className="card-header">
                        <h3>Sales & Revenue Performance</h3>
                        <div className="chart-legend">
                            <span className="legend-item"><div className="dot p"></div> Revenue</span>
                            <span className="legend-item"><div className="dot s"></div> Orders</span>
                        </div>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.charts?.monthlyStats || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={3} fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card small-chart">
                    <h3>Inventory Categories</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={data?.charts?.categoryData || []} 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {(data?.charts?.categoryData || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Quick Actions & Middle Content */}
            <section className="dashboard-mid-section">
                <QuickActions actions={quickActions} />
                <div className="glass-card module-shortcuts">
                    <h3>Workspace Modules</h3>
                    <div className="shortcut-list">
                        {[
                            { name: 'Materials', path: '/materials' },
                            { name: 'Employees', path: '/hrms' },
                            { name: 'Orders', path: '/erp' },
                            { name: 'Customers', path: '/crm' },
                            { name: 'Vendors', path: '/vendors' }
                        ].map(m => (
                            <div key={m.name} className="shortcut-item" onClick={() => navigate(m.path)}>
                                <span className="m-name">{m.name}</span>
                                <ExternalLink size={14} className="ext-icon" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tables Section */}
            <section className="admin-tables-grid">
                <div className="table-col">
                    <DataTable 
                        title="Recent Orders" 
                        headers={['Order ID', 'Customer', 'Amount', 'Date', 'Status']} 
                        data={data?.tables?.recentOrders || []}
                        onViewAll={() => navigate('/erp')}
                        renderRow={(ord) => (
                            <>
                                <td><span className="id-tag">{ord.orderNumber}</span></td>
                                <td>{ord.customer?.name || 'Walk-in'}</td>
                                <td><strong>${ord.totalAmount?.toLocaleString()}</strong></td>
                                <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                <td><span className={`status-pill ${ord.status.toLowerCase()}`}>{ord.status}</span></td>
                            </>
                        )}
                    />
                </div>

                <div className="table-col">
                    <DataTable 
                        title="Low Stock Materials" 
                        headers={['Material', 'Current', 'Min', 'Action']} 
                        data={data?.tables?.lowStock || []}
                        onViewAll={() => navigate('/materials')}
                        renderRow={(item) => (
                            <>
                                <td>{item.name}</td>
                                <td className="text-danger">{item.quantity} {item.unit}</td>
                                <td>{item.lowStockThreshold}</td>
                                <td><button className="btn-table">Restock</button></td>
                            </>
                        )}
                    />
                </div>
            </section>

            {/* System Logs / Activity */}
            <section className="activity-logs glass-card">
                <div className="card-header">
                    <h3>Recent System Activity</h3>
                    <button className="text-link" onClick={() => navigate('/analytics')}>View Audit Logs</button>
                </div>
                <div className="logs-list">
                    {[]} {/* Activity logs will be populated here when implemented */}
                </div>
            </section>

            <style jsx="true">{`
                .admin-wrapper { padding: 30px; display: flex; flex-direction: column; gap: 30px; }
                
                /* Navbar */
                .admin-navbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 25px;
                    margin-bottom: 10px;
                }
                .nav-search {
                    display: flex;
                    align-items: center;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0 15px;
                    width: 400px;
                }
                .nav-search input { background: none; border: none; padding: 12px; width: 100%; color: white; }
                .nav-controls { display: flex; align-items: center; gap: 20px; }
                .nav-icon-btn { position: relative; cursor: pointer; color: var(--text-muted); }
                .count-badge { position: absolute; top: -5px; right: -5px; background: var(--danger); width: 16px; height: 16px; border-radius: 50%; font-size: 10px; display: flex; align-items: center; justify-content: center; color: white; }
                .nav-user-dropdown { display: flex; align-items: center; gap: 12px; border-left: 1px solid var(--border); padding-left: 20px; }
                .user-avatar img { width: 35px; height: 35px; border-radius: 10px; }
                .user-info-brief { display: block; }
                .user-name { font-size: 14px; font-weight: 600; }
                .user-role { font-size: 11px; color: var(--primary); font-weight: 700; text-transform: uppercase; }

                /* Header */
                .admin-header-flex { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .header-actions { display: flex; gap: 12px; flex-wrap: wrap; }

                /* Grids */
                .stats-grid-admin { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .analytics-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
                .dashboard-mid-section { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
                .admin-tables-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; }

                .big-chart, .small-chart { padding: 25px; }
                .chart-wrapper { height: 300px; margin-top: 20px; }
                .card-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
                .chart-legend { display: flex; gap: 15px; }
                .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                .dot.p { background: var(--primary); }
                .dot.s { background: var(--secondary); }

                /* Alert Banner */
                .alert-banner { display: flex; align-items: center; gap: 15px; padding: 15px 25px; border-radius: 12px; }
                .alert-banner.warning { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .alert-action-btn { background: #f59e0b; color: white; padding: 6px 15px; border-radius: 6px; font-weight: 600; font-size: 12px; margin-left: auto; white-space: nowrap; }

                /* Module Shortcuts */
                .module-shortcuts { padding: 20px; }
                .shortcut-list { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
                .shortcut-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: rgba(255,255,255,0.02); border-radius: 10px; cursor: pointer; transition: 0.2s; }
                .shortcut-item:hover { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

                /* Tables & Paging UI */
                .id-tag { color: var(--primary); font-family: monospace; font-weight: 700; }
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-pill.confirmed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.shipped { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
                .btn-table { background: rgba(99, 102, 241, 0.1); color: var(--primary); font-size: 12px; padding: 5px 12px; border-radius: 6px; }

                /* Approvals */
                .approvals-section { padding: 25px; margin-top: 10px; }
                .count-badge-lg { background: var(--warning); color: #1e1b4b; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
                .approval-list { margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
                .approval-card { padding: 15px; display: flex; justify-content: space-between; align-items: center; border: 1px solid rgba(255,255,255,0.05); }
                .app-info { display: flex; align-items: center; gap: 12px; }
                .app-info p { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
                .app-actions { display: flex; gap: 8px; }
                .btn-table-action { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.2s; }
                .btn-table-action.view { background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); }
                .btn-table-action.approve { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
                .btn-table-action.approve:hover { background: #10b981; color: white; }

                .alert-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .alert-banner.info { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); color: var(--primary); }
                .alert-banner.info .alert-action-btn { background: var(--primary); }

                /* Logs */
                .activity-logs { padding: 25px; }
                .logs-list { margin-top: 20px; display: flex; flex-direction: column; gap: 5px; }
                .log-row { display: grid; grid-template-columns: 150px 1fr 120px 120px; padding: 12px 15px; border-bottom: 1px solid var(--border); align-items: center; }
                .log-user { display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 13px; }
                .user-icon-sm { background: #334155; padding: 6px; border-radius: 50%; display: flex; }
                .log-action { color: var(--text-muted); font-size: 13px; }
                .mod-badge { background: #1e293b; color: var(--text-main); padding: 3px 8px; border-radius: 4px; font-size: 11px; }
                .log-time { text-align: right; font-size: 12px; color: var(--text-muted); }

                .text-link { background: none; color: var(--primary); font-size: 13px; font-weight: 600; }

                /* Responsive */
                @media (max-width: 1280px) {
                    .analytics-grid, .dashboard-mid-section, .admin-tables-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .admin-wrapper { padding: 15px; gap: 20px; }
                    .admin-navbar { display: none; }
                    .admin-header-flex { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .header-actions { width: 100%; }
                    .header-actions button { flex: 1; font-size: 12px; }
                    .alert-section-grid { grid-template-columns: 1fr; }
                    .stats-grid-admin { grid-template-columns: repeat(2, 1fr); }
                    .approval-list { grid-template-columns: 1fr; }
                    .chart-wrapper { height: 250px; }
                    .card-header h3 { font-size: 16px; }
                }

                @media (max-width: 480px) {
                    .stats-grid-admin { grid-template-columns: 1fr; }
                    .header-actions { flex-direction: column; }
                    .app-actions { flex-direction: column; width: 100%; }
                    .btn-table-action { width: 100%; }
                    .approval-card { flex-direction: column; align-items: flex-start; gap: 15px; }
                }

                .admin-loading { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
                .erp-loader { width: 50px; height: 50px; border: 4px solid rgba(99, 102, 241, 0.1); border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
