import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, DollarSign, TrendingUp, BarChart2,
    Briefcase, Target, PhoneCall, ShoppingCart, Tag, Crosshair, 
    ArrowUpRight, Clock, Star, Gift, LayoutGrid, Activity, 
    Layers, Cpu, Server, MapPin, UserPlus, AlertTriangle, AlertCircle, CheckCircle, FileText, Calendar
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, MiniStatCard } from './AdminDashboard';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [leads, setLeads] = useState([]);
    const [customersData, setCustomersData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [tasksData, setTasksData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, leadsRes, custRes, ordRes, taskRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/leads').catch(e => ({ data: [] })),
                    API.get('/customers').catch(e => ({ data: [] })),
                    API.get('/orders').catch(e => ({ data: [] })),
                    API.get('/tasks').catch(e => ({ data: [] }))
                ]);
                
                setDashboardData(statsRes.data || {});
                setLeads(leadsRes.data || []);
                setCustomersData(custRes.data || []);
                setOrdersData(ordRes.data || []);
                setTasksData(taskRes.data || []);
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading Sales dashboard data...</div>;
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const totalRevenue = dashboardData?.stats?.revenue || (dashboardData?.charts?.monthlyStats || []).reduce((sum, item) => sum + (item.revenue || 0), 0);
    const activeLeads = leads.filter(l => l.status !== 'Converted').length || 0;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length || 0;
    const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;
    const totalOrders = dashboardData?.stats?.totalSalesOrders || ordersData.length || 0;
    const newLeads = leads.filter(l => l.createdAt && new Date(l.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length || 0;
    const totalCustomers = dashboardData?.stats?.totalCustomers || customersData.length || 0;
    const meetings = tasksData.filter(t => t.title?.toLowerCase().includes('meeting') || t.title?.toLowerCase().includes('call')).length || 0;
    const activePipeline = totalRevenue * 0.45; // Simulated potential pipeline

    const formatINR = (val) => {
        if (!val) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
        return `₹${val}`;
    };

    return (
        <div className="rd-container theme-sales">
            <div className="rd-content">
                
                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-bg-chart"></div>
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'Sales'}&background=3b82f6&color=fff`} alt="Profile" className="rd-hero-avatar" style={{ borderColor: '#3b82f6' }} />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Sales Lead'} <span role="img" aria-label="wave">👋</span>
                            </div>
                            <div className="rd-hero-subtitle">Here is your sales pipeline overview today.</div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-blue">
                                    <Target size={14} /> Sales Director
                                </span>
                                <span className="rd-hero-badge badge-blue" style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569'}}>
                                    <FileText size={14} /> {user?.email || 'sales@smtbms.com'}
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
                    <SparklineKPICard title="Total Revenue" value={formatINR(totalRevenue)} trend="up" trendValue="14% vs last month" icon={DollarSign} colorClass="icon-blue" />
                    <SparklineKPICard title="Total Orders" value={totalOrders} trend="up" trendValue="8% vs last month" icon={ShoppingCart} colorClass="icon-green" />
                    <SparklineKPICard title="Active Leads" value={activeLeads} trend="up" trendValue={`${newLeads} new today`} icon={Users} colorClass="icon-orange" />
                    <SparklineKPICard title="Conversion Rate" value={`${conversionRate}%`} trend="up" trendValue="1.2% increase" icon={Crosshair} colorClass="icon-purple" />
                    <SparklineKPICard title="Total Customers" value={totalCustomers} trend="up" trendValue="Growing" icon={FileText} colorClass="icon-pink" />
                    <SparklineKPICard title="Avg Deal Size" value="₹45k" trend="up" trendValue="Good" icon={Briefcase} colorClass="icon-teal" />
                </div>

                {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
                <div className="rd-middle-row">
                    
                    {/* Left: Quick Actions Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={UserPlus} label="New Lead" colorClass="bg-light-blue" onClick={() => navigate('/crm/leads')} />
                            <IconQuickAction icon={FileText} label="Create Quote" colorClass="bg-light-purple" onClick={() => navigate('/')} />
                            <IconQuickAction icon={ShoppingCart} label="Sales Order" colorClass="bg-light-green" onClick={() => navigate('/orders')} />
                            <IconQuickAction icon={Users} label="Customers" colorClass="bg-light-orange" onClick={() => navigate('/customers')} />
                            
                            <IconQuickAction icon={PhoneCall} label="Calls" colorClass="bg-light-pink" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Target} label="Targets" colorClass="bg-light-blue" onClick={() => navigate('/')} />
                            <IconQuickAction icon={BarChart2} label="Reports" colorClass="bg-light-teal" onClick={() => navigate('/reports')} />
                            <IconQuickAction icon={MapPin} label="Regions" colorClass="bg-light-gray" onClick={() => navigate('/')} />
                            
                            <IconQuickAction icon={Activity} label="Activity" colorClass="bg-light-orange" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Bell} label="Notifs" colorClass="bg-light-red" onClick={() => navigate('/notifications')} />
                            <IconQuickAction icon={Gift} label="Promotions" colorClass="bg-light-purple" onClick={() => navigate('/')} />
                            <IconQuickAction icon={LayoutGrid} label="Dashboard" colorClass="bg-light-green" onClick={() => navigate('/')} />
                        </div>
                    </div>

                    {/* Right: Mini Stats Grid */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="ms-grid" style={{ flex: 1, alignContent: 'center' }}>
                            <MiniStatCard title="Total Revenue" value={formatINR(totalRevenue)} subValue="YTD" icon={DollarSign} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Sales Orders" value={totalOrders} subValue="This Month" icon={ShoppingCart} colorClass="bg-light-green" trendColor="#10b981" />
                            <MiniStatCard title="New Leads" value={newLeads} subValue="This Month" icon={UserPlus} colorClass="bg-light-orange" trendColor="#f59e0b" />
                            <MiniStatCard title="Win Rate" value={`${conversionRate}%`} subValue="Overall" icon={Target} colorClass="bg-light-orange" trendColor="#f59e0b" />
                            
                            <MiniStatCard title="Total Customers" value={totalCustomers} subValue="Active" icon={Users} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Active Leads" value={activeLeads} subValue="In Pipeline" icon={Briefcase} colorClass="bg-light-purple" trendColor="#8b5cf6" />
                            <MiniStatCard title="Meetings" value={meetings} subValue="Scheduled" icon={PhoneCall} colorClass="bg-light-teal" trendColor="#14b8a6" />
                            <MiniStatCard title="Pipeline" value={formatINR(activePipeline)} subValue="Potential" icon={TrendingUp} colorClass="bg-light-green" trendColor="#10b981" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1 (4 Columns) ── */}
                <div className="bottom-grid-4">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Revenue</div>
                            <select className="panel-dropdown"><option>This Year ▾</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} width={40} tickFormatter={(val) => val >= 1000 ? `${val/1000}L` : val} />
                                    <Tooltip contentStyle={{fontSize: 10, borderRadius: 8}} />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Lead Sources</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.crmDonut || []} innerRadius={35} outerRadius={55} dataKey="value">
                                            {(dashboardData?.charts?.crmDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: 'auto', minWidth: '85px', fontSize: 9 }}>
                                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                                        <span><div className="ai-dot" style={{display:'inline-block',background:entry.color || '#3b82f6',marginRight:4}}></div>{entry.name}</span> 
                                        <b>{entry.value}</b>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Recent Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 3).map((activity, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-time">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="feed-icon-wrapper" style={{background: '#3b82f6'}}><DollarSign size={12}/></div>
                                        <div className="feed-content">
                                            <div className="feed-title">{activity.type}</div>
                                            <div className="feed-desc">{activity.text}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No recent activity.</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Top Prospects</div>
                            <a href="/crm" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No prospects assigned to you.</div>
                        </div>
                    </div>

                </div>

                {/* ── 5. Chart Row 2 (5 Columns) ── */}
                <div className="bottom-grid-5">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={16} style={{display:'inline', verticalAlign:'middle', marginRight:4}} color="#3b82f6"/> Sales Insights</div>
                        </div>
                        <div className="ai-insights-list" style={{marginTop: 8}}>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>Total revenue is <strong>{formatINR(totalRevenue)}</strong>.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div><strong>{totalOrders}</strong> total orders processed.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>Revenue target progress is tracking well.</div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales by Region</div>
                            <select className="panel-dropdown"><option>This Quarter ▾</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.charts?.categoryData || []} margin={{top:0, right:30, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={70} />
                                    <Tooltip contentStyle={{fontSize: 10}} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0,4,4,0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Pipeline Stage</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.erpDonut || []} innerRadius={35} outerRadius={55} dataKey="value">
                                            {(dashboardData?.charts?.erpDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: 'auto', minWidth: '85px', fontSize: 9 }}>
                                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                                        <span><div className="ai-dot" style={{display:'inline-block',background:entry.color || '#3b82f6',marginRight:4}}></div>{entry.name}</span> 
                                        <b>{entry.value}</b>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Lead Growth</div>
                            <select className="panel-dropdown"><option>Last 6 Months ▾</option></select>
                        </div>
                        <div style={{ padding: '0 0 10px 0' }}>
                            <div style={{fontSize: 18, fontWeight: 800, color: '#0f172a'}}>156 Leads</div>
                            <div style={{fontSize: 10, color: '#10b981', fontWeight: 600}}>↑ 24% vs previous</div>
                        </div>
                        <div style={{height: 100, width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} dot={{r: 3, fill: '#f59e0b'}} />
                                    <Tooltip contentStyle={{fontSize: 10}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Upcoming Sales Events</div>
                            <a href="/calendar" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list" style={{gap: 12, marginTop: 8}}>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#3b82f6'}}>Jul</span>
                                    <span className="event-day">12</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Client Demo</div>
                                    <div className="feed-desc">Enterprise Solutions</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#8b5cf6'}}>Jul</span>
                                    <span className="event-day">15</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Sales Training</div>
                                    <div className="feed-desc">New product features</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#10b981'}}>Jul</span>
                                    <span className="event-day">30</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">End of Month</div>
                                    <div className="feed-desc">Target closure deadline</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── 6. Footer ── */}
                <div className="dashboard-footer">
                    <div><Calendar size={12} style={{display:'inline',marginRight:4}}/> Current FY: 2026 - 2027</div>
                    <div><Layers size={12} style={{display:'inline',marginRight:4}}/> Sales Module v2.5.1</div>
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

export default SalesDashboard;
