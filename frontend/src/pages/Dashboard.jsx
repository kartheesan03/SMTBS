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
                const { data } = await API.get('/dashboard/stats');
                setData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

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
                        { title: 'Total Materials', value: data?.stats?.totalMaterials ?? 0, icon: <Package />, color: '#6366f1', trend: 0 },
                        { title: 'Total Employees', value: data?.stats?.totalEmployees ?? 0, icon: <Users />, color: '#14b8a6', trend: 0 },
                        { title: 'System Revenue', value: `$${(data?.stats?.revenue || 0).toLocaleString()}`, icon: <DollarSign />, color: '#10b981', trend: 0 },
                        { title: 'Total Orders', value: data?.stats?.totalOrders ?? 0, icon: <TrendingUp />, color: '#f59e0b', trend: 0 },
                    ],
                    actions: [
                        { label: 'Add Material', icon: <Package size={20}/>, onClick: () => {} },
                        { label: 'Add Employee', icon: <Users size={20}/>, onClick: () => {} },
                        { label: 'Create Order', icon: <PlusCircle size={20}/>, onClick: () => {} },
                        { label: 'Add Customer', icon: <Briefcase size={20}/>, onClick: () => {} },
                    ],
                    charts: (
                        <div className="glass-card chart-container">
                            <h3>Revenue & Sales Growth</h3>
                            <div style={{ height: 300, marginTop: 20 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={data?.charts?.monthlyStats || []}>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} />
                                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="rgba(99, 102, 241, 0.2)" />
                                        <Area type="monotone" dataKey="sales" stroke="#14b8a6" fill="rgba(20, 184, 166, 0.1)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ),
                    tables: (
                        <DataTable 
                            title="Critical Stock Alerts" 
                            headers={['Item', 'SKU', 'Level', 'Status']} 
                            data={data?.tables?.lowStock || []}
                            renderRow={(item) => (
                                <>
                                    <td>{item.name}</td>
                                    <td><code>{item.sku}</code></td>
                                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{item.quantity} {item.unit}</td>
                                    <td><span className="status-badge low-stock">Low Stock</span></td>
                                </>
                            )}
                        />
                    )
                };
            case 'HR':
                return {
                    title: "HR Management Hub",
                    stats: [
                        { title: 'Total Workforce', value: data?.stats?.totalEmployees ?? 0, icon: <Users />, color: '#6366f1' },
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
                        <div className="glass-card chart-container">
                            <h3>Workforce Attendance Trends</h3>
                            <div style={{ height: 300, marginTop: 20 }}>
                                <ResponsiveContainer>
                                    <BarChart data={data?.charts?.attendanceHistory || []}>
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                        <Bar dataKey="employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ),
                    tables: (
                        <DataTable 
                            title="Employees" 
                            headers={['Name', 'Designation', 'Department', 'Status']} 
                            data={data?.tables?.employees || []}
                            renderRow={(item) => (
                                <>
                                    <td>{item.firstName} {item.lastName}</td>
                                    <td>{item.designation}</td>
                                    <td>{item.department}</td>
                                    <td><span className="status-badge in-stock">Active</span></td>
                                </>
                            )}
                        />
                    )
                };
            case 'Sales':
                return {
                    title: "Sales & CRM Pipeline",
                    stats: [
                        { title: 'Active Leads', value: data?.stats?.totalLeads ?? 0, icon: <TrendingUp />, color: '#6366f1' },
                        { title: 'Converted', value: data?.stats?.convertedLeads ?? 0, icon: <CheckCircle2 />, color: '#10b981' },
                        { title: 'Follow-ups', value: data?.stats?.pendingFollowUps ?? 0, icon: <Calendar />, color: '#f59e0b' },
                        { title: 'Target Progress', value: `${data?.stats?.salesTarget ?? 0}%`, icon: <DollarSign />, color: '#14b8a6' },
                    ],
                    actions: [
                        { label: 'Add Lead', icon: <PlusCircle size={20}/>, onClick: () => navigate('/crm') },
                        { label: 'Update Pipeline', icon: <TrendingUp size={20}/>, onClick: () => navigate('/crm') },
                    ],
                    charts: (
                        <div className="glass-card chart-container flex-col-center">
                            <h3>Lead Conversion Rate</h3>
                            <div style={{ height: 250, width: '100%', marginTop: 20 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={data?.charts?.conversionRate || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            <Cell fill="#6366f1" />
                                            <Cell fill="#1e293b" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ),
                    tables: (
                        <DataTable 
                            title="Recent Leads" 
                            headers={['Name', 'Email', 'Source', 'Status']} 
                            data={data?.tables?.leadList || []}
                            renderRow={(item) => (
                                <>
                                    <td>{item.name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.source}</td>
                                    <td><span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></td>
                                </>
                            )}
                        />
                    )
                };
            default:
                return {
                    title: "Operational Dashboard",
                    stats: [
                        { title: 'My Tasks', value: 0, icon: <FileText />, color: '#6366f1' },
                        { title: 'Attendance', value: '0%', icon: <CheckCircle2 />, color: '#10b981' },
                        { title: 'Pending Orders', value: data?.stats?.totalOrders || 0, icon: <TrendingUp />, color: '#f59e0b' },
                    ],
                    actions: [
                        { label: 'Apply Leave', icon: <Calendar size={20}/>, onClick: () => navigate('/hrms') },
                        { label: 'Update Task', icon: <CheckCircle2 size={20}/>, onClick: () => navigate('/analytics') },
                    ],
                    charts: (
                        <div className="glass-card chart-container">
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
                    tables: <div><p className="text-muted" style={{padding: '20px'}}>No recent activity found.</p></div>
                };
        }
    };

    const content = getRoleContent();

    return (
        <div className="dashboard-layout">
            {/* Header / Notifications */}
            <header className="dashboard-top">
                <div className="header-info">
                    <h1>{content.title}</h1>
                    <p className="text-muted">Welcome back, {user?.role} {user?.name}</p>
                </div>
                
                <div className="dashboard-controls">
                    <div className="dashboard-search">
                        <Search size={18} />
                        <input type="text" placeholder="Global system search..." />
                    </div>
                    <div className="notifications-dropdown">
                        <div className="bell-box">
                            <Bell size={20} />
                            <span className="badge">{notifications.length}</span>
                        </div>
                    </div>
                    <div className="date-picker glass-card">
                        <Calendar size={16} />
                        <span>Apr 21, 2026</span>
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
                .dashboard-layout { padding: 30px; display: flex; flex-direction: column; gap: 30px; }
                .dashboard-top { display: flex; justify-content: space-between; align-items: center; }
                .dashboard-controls { display: flex; align-items: center; gap: 20px; }
                .dashboard-search { position: relative; display: flex; align-items: center; background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); border-radius: 10px; padding: 0 15px; }
                .dashboard-search input { background: none; border: none; padding: 10px; width: 200px; color: white; }
                .bell-box { position: relative; color: var(--text-muted); cursor: pointer; }
                .bell-box .badge { position: absolute; top: -5px; right: -5px; background: var(--danger); color: white; font-size: 10px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .date-picker { padding: 8px 15px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; }
                
                .notifications-bar { display: flex; flex-direction: column; gap: 10px; }
                .notif-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-radius: 10px; font-size: 14px; }
                .notif-item.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
                .notif-item.info { background: rgba(99, 102, 241, 0.1); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.2); }
                .notif-item button { margin-left: auto; background: none; color: inherit; font-size: 16px; }

                .dashboard-section { display: grid; gap: 20px; }
                .stats-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
                .middle-grid { grid-template-columns: 2fr 1fr; }
                .bottom-grid { grid-template-columns: 1fr; }

                .flex-col-center { display: flex; flex-direction: column; align-items: center; }
                .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-badge.low-stock { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .status-badge.in-stock { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .status-badge.new { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

                @media (max-width: 1024px) {
                    .middle-grid { grid-template-columns: 1fr; }
                    .dashboard-top { flex-direction: column; align-items: flex-start; gap: 20px; }
                    .dashboard-controls { width: 100%; justify-content: space-between; }
                }

                .loading-container { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; }
                .loader { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Dashboard;
