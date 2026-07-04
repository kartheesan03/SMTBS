import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Briefcase, ShoppingCart, MessageSquare, Plus,
    BarChart2, Shield, Search, TrendingUp, TrendingDown,
    Quote, Bell, UserPlus, Settings, FileText, CheckCircle2,
    CheckCircle, Calendar, DollarSign, Box, Truck, Tag, 
    Layers, Cpu, PhoneCall, ListTodo, UserCheck, LayoutGrid, Clock, Target, Server, Activity, AlertCircle, AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';

// --- Reusable Components ---

export const SparklineKPICard = ({ title, value, trend, trendValue, icon: Icon, colorClass }) => {
    // Generate dummy sparkline data for visualization
    const sparklineData = Array.from({length: 15}, () => ({ value: Math.floor(Math.random() * 100) + 20 }));
    
    // Extract raw color from class for stroke
    const strokeColor = colorClass === 'icon-green' ? '#10b981' :
                        colorClass === 'icon-purple' ? '#8b5cf6' :
                        colorClass === 'icon-blue' ? '#3b82f6' :
                        colorClass === 'icon-orange' ? '#f59e0b' :
                        colorClass === 'icon-teal' ? '#14b8a6' :
                        colorClass === 'icon-pink' ? '#ec4899' : '#3b82f6';

    return (
        <div className="rd-kpi-card">
            <div className="rd-kpi-header">
                <div className={`rd-kpi-icon ${colorClass}`}>
                    <Icon size={18} />
                </div>
                <div className="rd-kpi-info">
                    <div className="rd-kpi-title">{title}</div>
                    <div className="rd-kpi-value">{value}</div>
                    <div className={`rd-kpi-trend ${trend === 'up' ? 'trend-up' : trend === 'down' ? 'trend-down' : 'trend-neutral'}`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                    </div>
                </div>
            </div>
            <div className="rd-kpi-sparkline">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                        <Line type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const IconQuickAction = ({ icon: Icon, label, colorClass, onClick }) => (
    <div className="qa-item" onClick={onClick}>
        <div className={`qa-icon-wrapper ${colorClass}`}>
            <Icon size={22} />
        </div>
        <div className="qa-label">{label}</div>
    </div>
);

export const MiniStatCard = ({ title, value, subValue, icon: Icon, colorClass, trendColor }) => {
    const strokeColor = colorClass === 'bg-light-blue' ? '#3b82f6' :
                        colorClass === 'bg-light-green' ? '#10b981' :
                        colorClass === 'bg-light-orange' ? '#f59e0b' :
                        colorClass === 'bg-light-purple' ? '#8b5cf6' :
                        colorClass === 'bg-light-red' ? '#ef4444' : '#3b82f6';

    return (
        <div className="ms-item">
            <div className={`ms-icon ${colorClass}`} style={{ color: strokeColor }}>
                <Icon size={16} />
            </div>
            <div className="ms-info">
                <div className="ms-title">{title}</div>
                <div className="ms-value-row">
                    <span className="ms-value">{value}</span>
                </div>
                <div className="ms-trend" style={{ color: trendColor || '#64748b' }}>
                    {subValue}
                </div>
            </div>
        </div>
    );
};

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

    const formatINR = (val) => {
        if (!val) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
        return `₹${val}`;
    };

    const totalRevenue = dashboardData?.stats?.revenue || 0;
    const totalMaterials = dashboardData?.stats?.totalMaterials || 0;
    const lowStock = dashboardData?.tables?.lowStock || [];
    const totalEmployees = dashboardData?.stats?.totalEmployees || 0;
    const activeCustomers = dashboardData?.stats?.activeCustomers || 0;
    const totalOrders = dashboardData?.stats?.totalOrders || 0;
    const totalVendors = dashboardData?.stats?.totalVendors || 0;

    return (
        <div className="rd-container theme-admin">
            <div className="rd-content">
                
                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-bg-chart"></div>
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || 'https://ui-avatars.com/api/?name=Karthik&background=ef4444&color=fff'} alt="Profile" className="rd-hero-avatar" style={{ borderColor: '#ef4444' }} />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Karthik'} <span role="img" aria-label="wave">👋</span>
                            </div>
                            <div className="rd-hero-subtitle">Here's what's happening with your business today.</div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-blue">
                                    <UserCheck size={14} /> Admin
                                </span>
                                <span className="rd-hero-badge badge-blue" style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569'}}>
                                    <FileText size={14} /> {user?.email || 'admin@smtbms.com'}
                                </span>
                                <span className="rd-hero-badge badge-green" style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#10b981'}}>
                                    <div style={{width:8,height:8,background:'#10b981',borderRadius:'50%'}}></div> Online
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rd-hero-right-actions">
                        <button className="hero-action-btn primary" onClick={() => navigate('/attendance')}>
                            <Clock size={16} /> Check In
                        </button>
                        <button className="hero-action-btn secondary" onClick={() => navigate('/leave-management/approve')}>
                            <CheckCircle size={16} /> Leave Approval
                        </button>
                    </div>
                </div>

                {/* ── 2. KPI Row (6 columns) ── */}
                <div className="rd-kpi-row">
                    <SparklineKPICard title="Overall Health" value="98%" trend="up" trendValue="All Systems Go" icon={Activity} colorClass="icon-green" />
                    <SparklineKPICard title="Total Orders" value={totalOrders} trend="up" trendValue="12% vs last month" icon={ShoppingCart} colorClass="icon-purple" />
                    <SparklineKPICard title="Total Revenue" value={formatINR(totalRevenue)} trend="up" trendValue="8% vs last month" icon={DollarSign} colorClass="icon-blue" />
                    <SparklineKPICard title="Total Materials" value={totalMaterials} trend="neutral" trendValue="Stock stable" icon={Box} colorClass="icon-orange" />
                    <SparklineKPICard title="Total Employees" value={totalEmployees} trend="up" trendValue="2 new hires" icon={Users} colorClass="icon-teal" />
                    <SparklineKPICard title="Active Customers" value={activeCustomers} trend="up" trendValue="5% increase" icon={Target} colorClass="icon-pink" />
                </div>

                {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
                <div className="rd-middle-row">
                    
                    {/* Left: Quick Actions Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={CheckCircle2} label="Check Attendance" colorClass="bg-light-red" onClick={() => navigate('/attendance')} />
                            <IconQuickAction icon={Calendar} label="Leaves" colorClass="bg-light-green" onClick={() => navigate('/leave-management')} />
                            <IconQuickAction icon={DollarSign} label="Payroll" colorClass="bg-light-purple" onClick={() => navigate('/payroll')} />
                            <IconQuickAction icon={Box} label="Material Tracking" colorClass="bg-light-orange" onClick={() => navigate('/materials')} />
                            
                            <IconQuickAction icon={Truck} label="Vendors" colorClass="bg-light-blue" onClick={() => navigate('/vendors')} />
                            <IconQuickAction icon={ShoppingCart} label="Purchase Orders" colorClass="bg-light-green" onClick={() => navigate('/orders/purchase')} />
                            <IconQuickAction icon={Tag} label="Sales Orders" colorClass="bg-light-red" onClick={() => navigate('/orders')} />
                            <IconQuickAction icon={FileText} label="Reports" colorClass="bg-light-purple" onClick={() => navigate('/reports')} />
                            
                            <IconQuickAction icon={Users} label="HRMS" colorClass="bg-light-blue" onClick={() => navigate('/employees')} />
                            <IconQuickAction icon={Layers} label="ERP" colorClass="bg-light-cyan" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Target} label="CRM" colorClass="bg-light-pink" onClick={() => navigate('/crm')} />
                            <IconQuickAction icon={ListTodo} label="Tasks" colorClass="bg-light-orange" onClick={() => navigate('/tasks')} />
                        </div>
                    </div>

                    {/* Right: Mini Stats Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Inventory Summary</div>
                        </div>
                        <div className="ms-grid">
                            <MiniStatCard title="Overall Health" value="98%" subValue="System" icon={CheckCircle2} colorClass="bg-light-green" trendColor="#10b981" />
                            <MiniStatCard title="Total Vendors" value={totalVendors} subValue="Active" icon={Briefcase} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Total Materials" value={totalMaterials} subValue="Stock Items" icon={Box} colorClass="bg-light-orange" trendColor="#f59e0b" />
                            <MiniStatCard title="Total Orders" value={totalOrders} subValue="Sales" icon={ShoppingCart} colorClass="bg-light-purple" trendColor="#8b5cf6" />
                            
                            <MiniStatCard title="Low Stock Items" value={lowStock.length} subValue="Alerts" icon={AlertCircle} colorClass="bg-light-red" trendColor="#ef4444" />
                            <MiniStatCard title="Total Staff" value={totalEmployees} subValue="Active" icon={Users} colorClass="bg-light-teal" trendColor="#14b8a6" />
                            <MiniStatCard title="Total Clients" value={activeCustomers} subValue="Served" icon={Target} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Total Revenue" value={formatINR(totalRevenue)} subValue="YTD" icon={DollarSign} colorClass="bg-light-green" trendColor="#10b981" />
                        </div>
                    </div>

                </div>


                {/* ── 4. Chart Row 1: Revenue Trend (wide) + Attendance Donut ── */}
                <div className="rd-chart-row-wide">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Revenue Trend</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ height: 220, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []} margin={{top:4, right:10, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={8}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} width={48} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}/>
                                    <Tooltip contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0'}} formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}/>
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Employee Attendance</div>
                            <select className="panel-dropdown"><option>This Week ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 170 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.hrmsDonut || []} innerRadius={55} outerRadius={75} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.hrmsDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'}/>
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 11}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {(dashboardData?.charts?.hrmsDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', alignItems:'center', gap: 6, fontSize: 12}}>
                                        <div style={{width:9,height:9,borderRadius:'50%',background:entry.color||'#3b82f6', flexShrink:0}}></div>
                                        <span style={{color:'#475569'}}>{entry.name}</span>
                                        <strong style={{color:'#0f172a'}}>{entry.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 5. Activity Row: Recent Activity + Notifications (equal columns) ── */}
                <div className="rd-two-col">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Recent Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 5).map((activity, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-time">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="feed-icon-wrapper" style={{background: activity.type === 'warning' ? '#f59e0b' : '#3b82f6'}}><Activity size={12}/></div>
                                        <div className="feed-content">
                                            <div className="feed-title" style={{textTransform:'capitalize'}}>{activity.type}</div>
                                            <div className="feed-desc">{activity.text}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No recent activity.</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Notifications</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 5).map((notif, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-icon-wrapper" style={{background: '#ede9fe', color: '#7c3aed', flexShrink: 0}}><Bell size={14}/></div>
                                        <div className="feed-content" style={{flex: 1}}>
                                            <div className="feed-desc" style={{fontSize: 12, color: '#334155', whiteSpace: 'normal'}}>{notif.text}</div>
                                        </div>
                                        <div className="feed-time" style={{width: 'auto', flexShrink: 0}}>{new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No notifications.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 6. Bottom Row: 5 panels in a 5-column grid ── */}
                <div className="rd-five-col">

                    {/* AI Insights */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={15} style={{display:'inline', verticalAlign:'middle', marginRight:5}} color="#3b82f6"/> AI Insights</div>
                        </div>
                        <div className="ai-insights-list">
                            <div className="ai-insight-item"><div className="ai-dot"></div><div>Revenue is <strong>{dashboardData?.analytics?.kpis?.revenueGrowth || 0}%</strong> vs last month.</div></div>
                            <div className="ai-insight-item"><div className="ai-dot"></div><div><strong>{dashboardData?.stats?.pendingOrders || 0}</strong> orders require approval.</div></div>
                            <div className="ai-insight-item"><div className="ai-dot"></div><div><strong>{dashboardData?.tables?.lowStock?.length || 0} items</strong> below stock threshold.</div></div>
                            <div className="ai-insight-item"><div className="ai-dot"></div><div><strong>{dashboardData?.stats?.pendingSalaries || 0}</strong> payrolls pending.</div></div>
                        </div>
                    </div>

                    {/* Top Selling Materials */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Top Selling Materials</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.tables?.topSellingMaterials || []} margin={{top:0, right:20, left:0, bottom:0}}>
                                    <XAxis type="number" hide/>
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569'}} width={80}/>
                                    <Tooltip contentStyle={{fontSize: 11}} cursor={{fill: '#f8fafc'}}/>
                                    <Bar dataKey="sales" fill="#3b82f6" radius={[0,4,4,0]} barSize={10}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales Analytics Donut */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Analytics</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 130 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.categoryData || []} innerRadius={38} outerRadius={56} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.categoryData || []).map((entry, index) => {
                                                const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index%colors.length]}/>;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 11}}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                                {(dashboardData?.charts?.categoryData || []).map((entry, idx) => {
                                    const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6'];
                                    return (
                                        <div key={idx} style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize: 11}}>
                                            <span style={{display:'flex', alignItems:'center', gap:5, color:'#475569'}}>
                                                <div style={{width:8,height:8,borderRadius:'50%',background:colors[idx%colors.length]}}></div>{entry.name}
                                            </span>
                                            <strong style={{color:'#0f172a'}}>{entry.value}</strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Profit */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Monthly Profit</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px'}}>{formatINR(dashboardData?.analytics?.kpis?.netProfit || totalRevenue)}</div>
                            <div style={{fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 3}}>↑ {dashboardData?.analytics?.kpis?.revenueGrowth || 0}% vs last month</div>
                        </div>
                        <div style={{height: 110}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []} margin={{top:4, right:4, left:0, bottom:0}}>
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{r: 3, fill: '#10b981'}}/>
                                    <Tooltip contentStyle={{fontSize: 11}} formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Upcoming Events</div>
                            <a href="/calendar" className="panel-action">View Calendar</a>
                        </div>
                        <div className="feed-list" style={{gap: 14}}>
                            {[
                                {day:'05', month:'JUL', bg:'#e0e7ff', col:'#4f46e5', title:'Payroll Processing', desc:'05 July, 2026'},
                                {day:'10', month:'JUL', bg:'#fef3c7', col:'#d97706', title:'Management Meeting', desc:'10 July • 10:00 AM'},
                                {day:'15', month:'JUL', bg:'#dcfce7', col:'#059669', title:'Monthly Audit', desc:'15 July • 11:00 AM'}
                            ].map((ev, i) => (
                                <div className="event-item" key={i}>
                                    <div style={{background: ev.bg, borderRadius: 8, padding: '4px 8px', textAlign:'center', flexShrink:0, minWidth:36}}>
                                        <div style={{color: ev.col, fontSize:9, fontWeight:700, textTransform:'uppercase'}}>{ev.month}</div>
                                        <div style={{color:'#0f172a', fontSize:16, fontWeight:800, lineHeight:1.1}}>{ev.day}</div>
                                    </div>
                                    <div className="feed-content">
                                        <div className="feed-title">{ev.title}</div>
                                        <div className="feed-desc">{ev.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── 6. Footer ── */}
                <div className="dashboard-footer">
                    <div><Calendar size={12} style={{display:'inline',marginRight:4}}/> Current FY: 2026 - 2027</div>
                    <div><Layers size={12} style={{display:'inline',marginRight:4}}/> ERP Version: v2.5.1</div>
                    <div><Server size={12} style={{display:'inline',marginRight:4}}/> Database Size: 1.28 GB</div>
                    <div><Clock size={12} style={{display:'inline',marginRight:4}}/> Last Backup: 03 Jul 2026, 02:30 AM</div>
                    <div className="footer-item" style={{color: '#10b981'}}>
                        <div className="footer-dot"></div> All Systems Operational
                    </div>
                </div>

            </div>
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        </div>
    );
};

export default AdminDashboard;
