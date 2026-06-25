import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { 
    Users, Package, TrendingUp, AlertTriangle, CheckCircle2, 
    Briefcase, Calendar, DollarSign, PlusCircle, FileText, 
    Bell, Search, Filter, ChevronRight
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

// Components
import StatCard from '../components/Dashboard/StatCard';
import QuickActions from '../components/Dashboard/QuickActions';
import DataTable from '../components/Dashboard/DataTable';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, erpRes] = await Promise.all([
                    API.get('/dashboard/stats'),
                    API.get('/erp/stats')
                ]);
                setData({ ...dashRes.data, erpStats: erpRes.data });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Removed broken fetchLowStockCount
    if (loading) return <div className="loading-container">
        <div className="loader"></div>
        <p>Synchronizing Business Intelligence...</p>
    </div>;

    const role = user?.role;

    // --- Role Based Config ---
    const getRoleContent = () => {
        switch(role) {
            case 'Admin':
                return {
                    title: "Admin Control Center",
                    stats: [
                        { title: 'Total Material Types', value: data?.totalMaterials ?? 0, icon: <Package />, color: '#6366f1', trend: 0 },
                        { title: 'Low Stock Items', value: data?.lowStockItems ?? 0, icon: <AlertTriangle />, color: '#ef4444', trend: 0 },
                        { title: 'Total Employees', value: data?.totalEmployees ?? 0, icon: <Users />, color: '#14b8a6', trend: 0 },
                        { title: 'Open Orders', value: data?.openOrders ?? 0, icon: <TrendingUp />, color: '#f59e0b', trend: 0 },
                        { title: 'Active Customers', value: data?.activeCustomers ?? 0, icon: <Briefcase />, color: '#10b981', trend: 0 }
                    ],
                    actions: [
                        { label: 'Add Material', icon: <Package size={20}/>, onClick: () => {} },
                        { label: 'Add Employee', icon: <Users size={20}/>, onClick: () => {} },
                        { label: 'Add Customer', icon: <Briefcase size={20}/>, onClick: () => {} },
                    ],
                    <div className="premium-card chart-container">
                            <h3>Revenue & Sales Growth</h3>
                            <div style={{ height: 300, marginTop: 20 }}>
                                {data?.charts?.monthlyStats?.length > 0 ? (
                                    <ResponsiveContainer>
                                        <AreaChart data={data.charts.monthlyStats}>
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                                            <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="rgba(79, 70, 229, 0.15)" />
                                            <Area type="monotone" dataKey="sales" stroke="var(--success)" fill="rgba(16, 185, 129, 0.1)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ height: '100%' }}>No revenue data available</div>
                                )}
                            </div>
                        </div>
                    ),
                    tables: (
                        <div className="premium-card">
                        <DataTable 
                            title="Critical Stock Alerts" 
                            headers={['Item', 'SKU', 'Level', 'Status']} 
                            data={data?.tables?.lowStock || []}
                            renderRow={(item) => (
                                <>
                                    <td>{item.name}</td>
                                    <td><code className="sku-code">{item.sku}</code></td>
                                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{item.quantity} {item.unit}</td>
                                    <td><span className="status-badge status-danger">Low Stock</span></td>
                                </>
                            )}
                        />
                        </div>
                    )
                };
            case 'HR':
                return {
                    title: "HR Management Hub",
                    stats: [
                        { title: 'Total Workforce', value: data?.totalEmployees ?? 0, icon: <Users />, color: '#6366f1' },
                        { title: 'On Leave', value: data?.stats?.onLeave ?? 0, icon: <Calendar />, color: '#ef4444' },
                        { title: 'Present Today', value: data?.stats?.presentToday ?? 0, icon: <CheckCircle2 />, color: '#10b981' },
                        { title: 'Pending Leave', value: data?.stats?.pendingRequests ?? 0, icon: <FileText />, color: '#f59e0b' },
                    ],
                    actions: [
                        { label: 'Add Employee', icon: <Users size={20}/>, onClick: () => navigate('/hrms') },
                        { label: 'Approve Leave', icon: <CheckCircle2 size={20}/>, onClick: () => navigate('/hrms') },
                        { label: 'Update Payroll', icon: <DollarSign size={20}/>, onClick: () => navigate('/hrms') },
                    ],
                    charts: (
                        <div className="premium-card chart-container">
                            <h3>Workforce Attendance Trends</h3>
                            <div style={{ height: 300, marginTop: 20 }}>
                                {data?.charts?.attendanceHistory?.length > 0 ? (
                                    <ResponsiveContainer>
                                        <BarChart data={data.charts.attendanceHistory}>
                                            <XAxis dataKey="name" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip cursor={{fill: 'var(--bg-hover)'}} contentStyle={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                                            <Bar dataKey="employees" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ height: '100%' }}>No attendance data available</div>
                                )}
                            </div>
                        </div>
                    ),
                    tables: (
                        <div className="premium-card">
                        <DataTable 
                            title="Employees" 
                            headers={['Name', 'Designation', 'Department', 'Status']} 
                            data={data?.tables?.employees || []}
                            renderRow={(item) => (
                                <>
                                    <td>{item.firstName} {item.lastName}</td>
                                    <td>{item.designation}</td>
                                    <td>{item.department}</td>
                                    <td><span className="status-badge status-success">Active</span></td>
                                </>
                            )}
                        />
                        </div>
                    )
                };
            case 'Sales':
                return {
                    title: "Sales & CRM Pipeline",
                    stats: [
                        { title: 'Total Sales Orders', value: data?.stats?.totalSalesOrders ?? 0, icon: <TrendingUp />, color: '#6366f1' },
                        { title: 'Active Customers', value: data?.activeCustomers ?? 0, icon: <CheckCircle2 />, color: '#10b981' },
                        { title: 'Recent Customers', value: data?.salesStats?.recentCustomers ?? 0, icon: <Users />, color: '#f59e0b' },
                        { title: 'Total Revenue', value: `₹${(data?.charts?.monthlyStats?.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) || 0).toLocaleString('en-IN')}`, icon: <DollarSign />, color: '#14b8a6' },
                    ],
                    actions: [
                        { label: 'Add Customer', icon: <PlusCircle size={20}/>, onClick: () => navigate('/crm') },
                    ],
                    charts: (
                        <div className="premium-card chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3>Lead Conversion Rate</h3>
                            <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                                {data?.charts?.conversionRate?.length > 0 ? (
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={data.charts.conversionRate} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                <Cell fill="var(--primary)" />
                                                <Cell fill="var(--border-subtle)" />
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty-state" style={{ height: '100%' }}>No conversion data available</div>
                                )}
                            </div>
                        </div>
                    ),
                    tables: (
                        <div className="premium-card">
                        <DataTable 
                            title="Recent Orders" 
                            headers={['Order #', 'Customer', 'Amount', 'Status']} 
                            data={data?.tables?.recentOrders || []}
                            renderRow={(item) => (
                                <>
                                    <td>{item.orderNumber}</td>
                                    <td>{item.customer?.name || 'Walk-in'}</td>
                                    <td>₹{(Number(item.totalAmount) || 0).toLocaleString('en-IN')}</td>
                                    <td><span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                </>
                            )}
                        />
                        </div>
                    )
                };
            default:
                return {
                    title: "Operational Dashboard",
                    stats: [
                        { title: 'My Tasks', value: 0, icon: <FileText />, color: '#6366f1' },
                        { title: 'Attendance', value: '0%', icon: <CheckCircle2 />, color: '#10b981' },
                        { title: 'Pending Orders', value: data?.erpStats?.openOrders || 0, icon: <TrendingUp />, color: '#f59e0b' },
                    ],
                    actions: [
                        { label: 'Apply Leave', icon: <Calendar size={20}/>, onClick: () => navigate('/hrms') },
                        { label: 'Update Task', icon: <CheckCircle2 size={20}/>, onClick: () => navigate('/analytics') },
                    ],
                    charts: (
                        <div className="premium-card chart-container">
                            <h3>Performance Score</h3>
                            <div style={{ height: 300, marginTop: 20 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={data?.charts?.monthlyStats || []}>
                                        <Area type="monotone" dataKey="sales" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ),
                    tables: <div className="premium-card"><p style={{padding: '20px', color: 'var(--text-muted)'}}>No recent activity found.</p></div>
                };
        }
    };

    const content = getRoleContent();

    return (
        <div className="page-container">
            {/* Header / Notifications */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">{content.title}</h1>
                    <p className="page-subtitle">Welcome back, {user?.role} {user?.name}</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="dashboard-search">
                        <Search size={18} />
                        <input type="text" placeholder="Global system search..." />
                    </div>
                    <div className="notifications-dropdown">
                        <div className="bell-box">
                            <Bell size={20} />
                            <span className="notif-badge">{notifications.length}</span>
                        </div>
                    </div>
                    <div className="premium-card" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </header>

            {/* Notifications Bar */}
            {notifications.length > 0 && (
                <div className="notifications-bar">
                    {notifications.map(n => (
                        <div key={n.id} className={`notif-item ${n.type}`}>
                            <AlertTriangle size={16} />
                            <span>{n.text}</span>
                            <button onClick={() => setNotifications(notifications.filter(x => x.id !== n.id))}>✕</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Sections */}
            <section className="dashboard-section stats-grid">
                {content.stats.map((s, i) => <StatCard key={i} {...s} />)}
            </section>

            <section className="dashboard-section middle-grid">
                {content.charts}
                <QuickActions actions={content.actions} />
            </section>

            <section className="dashboard-section bottom-grid">
                {content.tables}
            </section>

            <style jsx="true">{`
                .dashboard-search { position: relative; display: flex; align-items: center; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 6px 15px; box-shadow: var(--shadow-sm); transition: all 0.2s ease; }
                .dashboard-search:focus-within { border-color: var(--primary); box-shadow: var(--ring-focus); }
                .dashboard-search input { background: none; border: none; padding: 6px; width: 220px; color: var(--text-heading); outline: none; font-size: 14px; }
                .dashboard-search input::placeholder { color: var(--text-muted); }
                .dashboard-search svg { color: var(--text-muted); }
                
                .bell-box { position: relative; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--bg-surface); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm); transition: all 0.2s; }
                .bell-box:hover { background: var(--bg-hover); color: var(--text-heading); }
                .notif-badge { position: absolute; top: -4px; right: -4px; background: var(--danger); color: white; font-size: 10px; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3); }
                
                .notifications-bar { display: flex; flex-direction: column; gap: 12px; }
                .notif-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; }
                .notif-item.warning { background: var(--warning-bg); color: #92400E; border: 1px solid rgba(245, 158, 11, 0.2); }
                .notif-item.info { background: var(--info-bg); color: #1E40AF; border: 1px solid rgba(59, 130, 246, 0.2); }
                .notif-item button { margin-left: auto; background: none; border: none; color: inherit; font-size: 16px; cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
                .notif-item button:hover { opacity: 1; }

                .dashboard-section { display: grid; gap: 24px; }
                .stats-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
                .middle-grid { grid-template-columns: 2fr 1fr; }
                .bottom-grid { grid-template-columns: 1fr; }

                .chart-container h3 { font-size: 16px; font-weight: 700; color: var(--text-heading); margin: 0; }

                .loading-container { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-muted); font-size: 14px; font-weight: 500; }
                .loader { width: 48px; height: 48px; border: 3px solid var(--primary-light); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .middle-grid { grid-template-columns: 1fr; }
                    .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .dashboard-search input { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
