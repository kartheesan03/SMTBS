import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, X
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';

// --- Shared Reusable Components ---

export const RDHeader = ({ onRefresh }) => {
    const { user } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AU';
    const role = user?.role?.toUpperCase() || 'ADMIN';

    return (
        <header className="rd-header">
            <div className="rd-search-bar">
                <Search size={16} color="#94a3b8" />
                <input type="text" className="rd-search-input" placeholder="Search materials, PO, vendors..." />
                <span className="rd-cmd-k">⌘K</span>
            </div>
            
            <div className="rd-header-actions">
                <div className="rd-datetime-pill">
                    <Calendar size={16} />
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    <span style={{ color: '#fda4af', margin: '0 4px' }}>·</span>
                    {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                
                <button className="rd-icon-btn" onClick={onRefresh}>
                    <RefreshCw size={18} />
                </button>
                
                <button className="rd-icon-btn">
                    <Bell size={18} />
                    {unreadCount > 0 && <span className="rd-badge">{unreadCount}</span>}
                </button>
                
                <div className="rd-profile-menu">
                    <div className="rd-avatar">{initials}</div>
                    <div className="rd-profile-info">
                        <span className="rd-profile-name">{user?.name || 'Admin User'}</span>
                        <span className="rd-profile-role">{role} <span className="rd-dot"></span></span>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 4}}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
        </header>
    );
};

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

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => window.location.reload()} />
            
            <div className="rd-content">
                {/* Hero Banner */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-greeting">
                            Good Morning, {user?.name?.split(' ')[0] || 'Admin'} <CheckCircle size={28} color="#fca5a5" />
                        </div>
                        <div className="rd-subtitle">
                            System Administrator • <span className="rd-badge-id">ADM-00001</span> • Today's Status: Checked In
                        </div>
                        
                        <div className="rd-hero-actions">
                            <button className="rd-btn-primary"><CheckCircle size={18}/> Check In</button>
                            <button className="rd-btn-outline"><Calendar size={18}/> Apply Leave</button>
                            <button className="rd-btn-outline"><DollarSign size={18}/> View Payslip</button>
                        </div>
                        
                        <div className="rd-hero-footer">
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Department</span>
                                <span className="rd-footer-val">IT / Systems</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Reporting To</span>
                                <span className="rd-footer-val">Board</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Work Location</span>
                                <span className="rd-footer-val">Head Office</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rd-hero-right">
                        <div className="rd-circle-progress" style={{"--p": "92%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">92%</span>
                                <span className="rd-circle-label">Performance</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": "87%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">87%</span>
                                <span className="rd-circle-label">Sys Health</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": "100%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">128</span>
                                <span className="rd-circle-label">Tasks Done</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="rd-kpi-row">
                    <RDKPICard title="HRMS (Total Employees)" value={dashboardData ? dashboardData.totalEmployees : 0} trend="up" trendValue="+5%" icon={Users} color="blue" subLabel="Active / Leave" bottomVal="0 / 0" />
                    <RDKPICard title="MATERIAL (Total Items)" value={dashboardData ? dashboardData.totalMaterials : 0} trend="down" trendValue="-2%" icon={Box} color="orange" subLabel="Low / Out" bottomVal="0 / 0" />
                    <RDKPICard title="CRM (Total Customers)" value={dashboardData ? dashboardData.totalCustomers : 0} trend="up" trendValue="+14%" icon={TrendingUp} color="green" subLabel="Active / Total" bottomVal={`${dashboardData?.activeCustomers || 0} / ${dashboardData?.totalCustomers || 0}`} />
                    <RDKPICard title="ERP (Active Orders)" value={dashboardData ? dashboardData.activeOrdersCount : 0} trend="up" trendValue="+8%" icon={Briefcase} color="cyan" subLabel="Sales / Purchase" bottomVal={`${dashboardData?.totalSalesOrders || 0} / ${dashboardData?.totalPurchaseOrders || 0}`} />
                </div>

                {/* Middle Section */}
                <div className="rd-middle-row">
                    {/* Overview Summary */}
                    <div className="rd-card">
                        <div className="rd-card-title">Monthly Sales & Revenue</div>
                        <div style={{height: 250}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData?.charts?.monthlyStats || []} barGap={4}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="sales" fill="#3b82f6" radius={[4,4,0,0]} barSize={12} name="Sales Orders" />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4,4,0,0]} barSize={12} name="Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rd-card">
                        <div className="rd-card-title">Quick Actions</div>
                        <div className="rd-action-stack">
                            <div className="rd-action-btn blue">Add New Employee <span>→</span></div>
                            <div className="rd-action-btn green">Add New Material <span>→</span></div>
                            <div className="rd-action-btn purple">Add New Lead <span>→</span></div>
                            <div className="rd-action-btn orange">Create New Project <span>→</span></div>
                            <div className="rd-action-btn cyan">View All Modules <span>→</span></div>
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
