import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, X
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';

// --- Shared Reusable Components ---


export const RDKPICard = ({ title, value, trend, trendValue, icon: Icon, color, subLabel, bottomVal, data }) => {
    return (
        <div className={`rd-kpi-card ${color}`}>
            <div className="rd-kpi-header">
                <div className="rd-kpi-icon-box">
                    <Icon size={24} color="#fff" />
                </div>
                <div className="rd-trend-pill">
                    {trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''} {trendValue}
                </div>
            </div>
            
            <div className="rd-kpi-body">
                <div className="rd-kpi-val">{value}</div>
                <div className="rd-kpi-title">{title}</div>
            </div>
            
            <div className="rd-kpi-bottom-stats">
                <div className="rd-kpi-bottom-label">{subLabel}</div>
                <div className="rd-kpi-bottom-val">{bottomVal}</div>
            </div>
        </div>
    );
};

// --- Page Specific Components ---

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandCenterOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);



    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading dashboard data...</div>;
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Hero Banner */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-greeting">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'} <span role="img" aria-label="wave">👋</span>
                        </div>
                        <div className="rd-subtitle">
                            {user?.role || 'Administrator'} • <span className="rd-badge-id">{user?.email || 'System'}</span> • Today's Status: Online
                        </div>
                        
                        <div className="rd-hero-actions">
                            <button className="rd-btn-primary" onClick={() => navigate('/attendance')}><CheckCircle size={18}/> Check Attendance</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/leave-management')}><Calendar size={18}/> Leaves</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/payroll')}><DollarSign size={18}/> Payroll</button>
                        </div>
                        
                        <div className="rd-hero-footer">
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Module Access</span>
                                <span className="rd-footer-val">{user?.role === 'Admin' ? 'All Modules' : 'Restricted'}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Active Users</span>
                                <span className="rd-footer-val">{dashboardData?.totalEmployees || 0}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Active Materials</span>
                                <span className="rd-footer-val">{dashboardData?.totalMaterials || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rd-hero-right">
                        <div className="rd-circle-progress" style={{"--p": "100%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">100%</span>
                                <span className="rd-circle-label">Sys Health</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": `${dashboardData?.stats?.totalOrders > 0 ? Math.round((dashboardData.stats.totalOrders - dashboardData.stats.activeOrdersCount) / dashboardData.stats.totalOrders * 100) : 0}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{dashboardData?.stats?.totalOrders > 0 ? Math.round((dashboardData.stats.totalOrders - dashboardData.stats.activeOrdersCount) / dashboardData.stats.totalOrders * 100) : 0}%</span>
                                <span className="rd-circle-label">Order Completion</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": "100%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{dashboardData?.stats?.totalOrders || 0}</span>
                                <span className="rd-circle-label">Total Orders</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="rd-kpi-row">
                    <RDKPICard title="HRMS (Total Employees)" value={dashboardData ? dashboardData.totalEmployees : 0} trendValue="+5%" icon={Users} color="blue" subLabel="Active / Leave" bottomVal={`${dashboardData?.hrStats?.presentToday || 0} / ${dashboardData?.hrStats?.onLeave || 0}`} />
                    <RDKPICard title="MATERIAL (Total Items)" value={dashboardData ? dashboardData.totalMaterials : 0} trendValue="-2%" icon={Box} color="orange" subLabel="Low / Out" bottomVal={`${dashboardData?.lowStockItems || 0} / ${dashboardData?.materialStats?.outOfStockCount || 0}`} />
                    <RDKPICard title="CRM (Total Customers)" value={dashboardData ? dashboardData.totalCustomers : 0} trendValue="+14%" icon={TrendingUp} color="green" subLabel="Active / Total" bottomVal={`${dashboardData?.activeCustomers || 0} / ${dashboardData?.totalCustomers || 0}`} />
                    <RDKPICard title="ERP (Active Orders)" value={dashboardData ? dashboardData.stats?.activeOrdersCount : 0} trendValue="+8%" icon={Briefcase} color="cyan" subLabel="Sales / Purchase" bottomVal={`${dashboardData?.stats?.totalSalesOrders || 0} / ${dashboardData?.stats?.totalPurchaseOrders || 0}`} />
                </div>

                {/* Middle Section */}
                <div className="rd-middle-row">
                    {/* Overview Summary */}
                    <div className="rd-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="rd-card-title">Monthly Sales & Revenue</div>
                        <div style={{flex: 1, minHeight: 250, marginTop: 16}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                                    <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Legend verticalAlign="top" align="left" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: 13, fontWeight: 500 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Revenue" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#8b5cf6' }} activeDot={{ r: 6 }} />
                                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Sales Orders" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--rd-border)' }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--rd-text-muted)', marginBottom: 4 }}>Total YTD Revenue</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6' }}>
                                    ₹{dashboardData?.charts?.monthlyStats?.reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString() || 0}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--rd-text-muted)', marginBottom: 4 }}>Total Sales Orders</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                                    {dashboardData?.charts?.monthlyStats?.reduce((sum, item) => sum + (item.sales || 0), 0).toLocaleString() || 0}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--rd-text-muted)', marginBottom: 4 }}>Avg. Monthly Rev.</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--rd-text-main)' }}>
                                    ₹{dashboardData?.charts?.monthlyStats?.length ? Math.round(dashboardData.charts.monthlyStats.reduce((sum, item) => sum + (item.revenue || 0), 0) / dashboardData.charts.monthlyStats.length).toLocaleString() : 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rd-card">
                        <div className="rd-card-title">Quick Actions</div>
                        <div className="rd-action-stack">
                            <div className="rd-action-btn blue" onClick={() => navigate('/employees/new')}><span className="rd-action-text">Add Employee</span> <span>→</span></div>
                            <div className="rd-action-btn green" onClick={() => navigate('/materials/new')}><span className="rd-action-text">Add Material</span> <span>→</span></div>
                            <div className="rd-action-btn purple" onClick={() => navigate('/customers/new')}><span className="rd-action-text">Add Customer</span> <span>→</span></div>
                            <div className="rd-action-btn orange" onClick={() => navigate('/orders/select-type')}><span className="rd-action-text">New Order</span> <span>→</span></div>
                            <div className="rd-action-btn cyan" onClick={() => navigate('/settings')}><span className="rd-action-text">Settings</span> <span>→</span></div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rd-card">
                        <div className="rd-card-title">Recent Activities</div>
                        <div className="rd-feed">
                            {dashboardData?.tables?.recentActivity?.length > 0 ? (
                                dashboardData.tables.recentActivity.slice(0,4).map((notif, idx) => (
                                    <div className="rd-feed-item" key={notif.id || idx}>
                                        <div className={`rd-feed-icon ${notif.type === 'alert' ? 'orange' : 'blue'}`}>
                                            {notif.type === 'alert' ? <AlertTriangle size={16}/> : <Activity size={16}/>}
                                        </div>
                                        <div className="rd-feed-content">
                                            <div className="rd-feed-text">{notif.text}</div>
                                            <div className="rd-feed-time">{new Date(notif.time).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>No recent activities.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Donuts */}
                {dashboardData?.charts && (
                    <div className="rd-donuts-row">
                        <DonutCard title="HRMS" subtitle="Employee Overview" total={`${dashboardData.totalEmployees} Total`} data={dashboardData.charts.hrmsDonut || []} link="/employees" />
                        <DonutCard title="Material" subtitle="Stock Overview" total={`${dashboardData.totalMaterials} Items`} data={dashboardData.charts.matDonut || []} link="/materials" />
                        <DonutCard title="CRM" subtitle="Customer Status" total={`${dashboardData.totalCustomers} Custs`} data={dashboardData.charts.crmDonut || []} link="/crm" />
                        <DonutCard title="ERP" subtitle="Orders Overview" total={`${dashboardData.stats.totalSalesOrders + dashboardData.stats.totalPurchaseOrders} Orders`} data={dashboardData.charts.erpDonut || []} link="/orders" />
                    </div>
                )}
            </div>
            
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        </div>
    );
};

const DonutCard = ({ title, subtitle, total, data, link }) => {
    const navigate = useNavigate();
    return (
        <div className="rd-card rd-donut-card">
            <div className="rd-donut-header">
                <div className="rd-donut-title">{title}</div>
                <div className="rd-donut-subtitle">{subtitle}</div>
            </div>
            <div style={{height: 160, width: '100%', marginTop: 16, position: 'relative'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', pointerEvents: 'none'}}>
                    <span style={{fontSize: 20, fontWeight: 800, color: '#1e293b'}}>{total.split(' ')[0]}</span>
                    <span style={{fontSize: 10, color: '#64748b', textTransform: 'uppercase'}}>{total.split(' ')[1]}</span>
                </div>
            </div>
            <div className="rd-donut-legend">
                {data.map((item, i) => (
                    <div key={i} className="rd-legend-item">
                        <div className="rd-legend-left">
                            <span className="rd-legend-dot" style={{background: item.color}}></span>
                            {item.name}
                        </div>
                        <div className="rd-legend-val">{item.value}</div>
                    </div>
                ))}
            </div>
            <button className="rd-btn-link" onClick={() => navigate(link)}>View Full Report <span>→</span></button>
        </div>
    );
}

export default AdminDashboard;
