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
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import CommandCenter from '../components/CommandCenter';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import { SparklineKPICard, IconQuickAction, MiniStatCard, InvRow } from './AdminDashboard';

const SalesDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrendYear, setRevenueTrendYear] = useState('current');
    const [leads, setLeads] = useState([]);
    const [customersData, setCustomersData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [tasksData, setTasksData] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
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
                
                // Process tasks for upcoming events
                const now = new Date();
                const futureTasks = (taskRes.data || [])
                    .filter(t => t.dueDate && new Date(t.dueDate) >= now)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 3)
                    .map(t => {
                        const d = new Date(t.dueDate);
                        let col = '#4f46e5'; let bg = '#e0e7ff';
                        if (t.priority === 'High') { col = '#ef4444'; bg = '#fee2e2'; }
                        if (t.priority === 'Low') { col = '#10b981'; bg = '#d1fae5'; }
                        return {
                            day: String(d.getDate()).padStart(2, '0'),
                            month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                            bg,
                            col,
                            title: t.title,
                            desc: `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} • ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                        };
                    });
                setUpcomingEvents(futureTasks);
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading your dashboard...</div>;
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

    // Build sales trend data from real leads/tasks if API doesn't provide it
    const buildSalesTrendData = () => {
        const apiData = dashboardData?.analytics?.salesTrend;
        if (apiData && apiData.length > 0) return apiData;

        // Aggregate leads and tasks by month (last 6 months)
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const name = d.toLocaleString('default', { month: 'short' });
            const monthLeads = leads.filter(l => {
                if (!l.createdAt) return false;
                const ld = new Date(l.createdAt);
                return ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
            });
            const monthMeetings = tasksData.filter(t => {
                if (!t.createdAt) return false;
                const td = new Date(t.createdAt);
                const isMeeting = t.title?.toLowerCase().includes('meeting') || t.title?.toLowerCase().includes('call');
                return isMeeting && td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
            });
            months.push({
                name,
                newLeads: monthLeads.length,
                meetings: monthMeetings.length,
                dealsClosed: monthLeads.filter(l => l.status === 'Converted').length,
            });
        }

        return months;
    };
    const salesTrendData = buildSalesTrendData();


    const topProspects = [...leads]
        .filter(l => l.status !== 'Converted' && l.status !== 'Lost')
        .sort((a, b) => (b.value || b.dealValue || 0) - (a.value || a.dealValue || 0))
        .slice(0, 5);

    return (
        <div className="rd-container theme-sales">
            <div className="rd-content">

                {/* ── 1. Hero Banner ── */}
                <WelcomeBanner 
                    user={user}
                    greeting={`${getGreeting()}`}
                    subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Sales Pipeline Overview`}
                    badges={[
                        { icon: Target, text: `${formatINR(totalRevenue)} Revenue`, type: 'neutral' },
                        { type: 'status', text: `${activeLeads} Active Leads` }
                    ]}
                    rightVisuals={
                        <>
                            <div className="rd-visual-card">
                                                            <div className="rd-vc-label">Conversion</div>
                                                            <div className="rd-vc-value">{conversionRate}%</div>
                                                            <div className="rd-vc-chart"></div>
                                                        </div>
                                                        <div className="rd-visual-card">
                                                            <div className="rd-vc-label">Activity</div>
                                                            <div className="rd-vc-bars">
                                                                <div className="rd-vc-bar" style={{height: '20%'}}></div>
                                                                <div className="rd-vc-bar" style={{height: '80%'}}></div>
                                                                <div className="rd-vc-bar" style={{height: '60%'}}></div>
                                                                <div className="rd-vc-bar" style={{height: '100%'}}></div>
                                                                <div className="rd-vc-bar" style={{height: '40%'}}></div>
                                                            </div>
                                                        </div>
                        </>
                    }
                    actions={[
                        { label: 'Apply Leave', icon: CheckCircle, variant: 'primary', onClick: () => navigate('/leave-management/history') },
                        { label: 'Check In', icon: Clock, variant: 'secondary', onClick: () => navigate('/attendance') }
                    ]}
                />


                {/* ── 2. KPI Row (6 columns) ── */}
                <StatGrid columns={6}>
                    <StatCard title="Total Revenue" value={formatINR(totalRevenue)} colorTheme="blue" icon={DollarSign} trendValue="This month" trendPositive={true} />
                    <StatCard title="Active Leads" value={activeLeads} colorTheme="purple" icon={Target} trendValue="In pipeline" trendPositive={true} />
                    <StatCard title="Conversion Rate" value={`${conversionRate}%`} colorTheme="mint" icon={TrendingUp} trendValue="Lead to deal" trendPositive={true} />
                    <StatCard title="Total Customers" value={totalCustomers} colorTheme="yellow" icon={Users} trendValue="Active" trendPositive={true} />
                    <StatCard title="Sales Meetings" value={meetings} colorTheme="peach" icon={CheckCircle} trendValue="Scheduled" trendPositive={true} />
                    <StatCard title="Total Orders" value={totalOrders} colorTheme="pink" icon={ShoppingCart} trendValue="Completed" trendPositive={true} />
                </StatGrid>

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

                    {/* Right: Sales Summary (InvRow style matching Admin Dashboard) */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Summary</div>
                            <span className="panel-action" style={{ cursor: 'pointer' }} onClick={() => navigate('/crm')}>View All →</span>
                        </div>
                        <div className="inv-grid">
                            <InvRow icon={DollarSign} iconBg="#eff6ff" iconColor="#2563EB" label="Total Revenue" value={formatINR(totalRevenue)} caption="Year to date" />
                            <InvRow icon={ShoppingCart} iconBg="#ecfdf5" iconColor="#059669" label="Total Orders" value={totalOrders} caption="This month" />
                            <InvRow icon={Target} iconBg="#f3e8ff" iconColor="#9333ea" label="Active Leads" value={activeLeads} caption="In pipeline" />
                            <InvRow icon={TrendingUp} iconBg="#fef9c3" iconColor="#ca8a04" label="Conversion Rate" value={`${conversionRate}%`} caption="Lead to deal" />
                            <InvRow icon={Users} iconBg="#e0f2fe" iconColor="#0284c7" label="Total Customers" value={totalCustomers} caption="Active accounts" />
                            <InvRow icon={CheckCircle} iconBg="#fce7f3" iconColor="#db2777" label="Sales Meetings" value={meetings} caption="Scheduled" />
                            <InvRow icon={UserPlus} iconBg="#ffedd5" iconColor="#ea580c" label="New Leads" value={newLeads} caption="This month" isAlert={newLeads === 0} />
                            <InvRow icon={Activity} iconBg="#f0fdfa" iconColor="#0D9488" label="Pipeline Value" value={formatINR(activePipeline)} caption="Potential revenue" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1: Sales Revenue (wide) + Lead Sources ── */}
                <div className="rd-chart-row-wide">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Pipeline Trend</div>
                            <select 
                                className="panel-dropdown" 
                                style={{ paddingRight: '24px', width: 'auto' }}
                                value={revenueTrendYear} 
                                onChange={(e) => setRevenueTrendYear(e.target.value)}
                            >
                                <option value="current">This Year</option>
                                <option value="last">Last Year</option>
                            </select>
                        </div>
                        <div style={{ height: 220, width: '100%' }}>
                            {salesTrendData.length === 0 ? (
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#94a3b8',fontSize:13}}>No trend data available.</div>
                            ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrendData} margin={{top:4, right:10, left:0, bottom:0}}>
                                    <defs>
                                        <linearGradient id="gradNewLeads" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="gradMeetings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.22}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="gradDealsClosed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.22}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={8}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} width={35} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}/>
                                    <Tooltip contentStyle={{fontSize: 12, borderRadius: 0, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'}} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} verticalAlign="top" height={36} />
                                    <Area
                                        type="monotone"
                                        dataKey={revenueTrendYear === 'current' ? "dealsClosed" : "lastDealsClosed"}
                                        name="Deals Closed"
                                        stroke="#10b981"
                                        strokeWidth={2.5}
                                        fill="url(#gradDealsClosed)"
                                        dot={false}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={revenueTrendYear === 'current' ? "meetings" : "lastMeetings"}
                                        name="Meetings"
                                        stroke="#f59e0b"
                                        strokeWidth={2.5}
                                        fill="url(#gradMeetings)"
                                        dot={false}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={revenueTrendYear === 'current' ? "newLeads" : "lastNewLeads"}
                                        name="New Leads"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        fill="url(#gradNewLeads)"
                                        dot={false}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Lead Sources</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}>
                                <option>This Month ▾</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 170 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.crmDonut || []} innerRadius={50} outerRadius={75} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.crmDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 12}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize: 11}}>
                                        <span style={{display:'flex', alignItems:'center', gap:5, color:'#475569'}}>
                                            <div style={{width:8,height:8,borderRadius: '0px',background:entry.color || '#3b82f6'}}></div>{entry.name}
                                        </span>
                                        <strong style={{color:'#0f172a'}}>{entry.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 5. Activity Row: Recent Activity + Top Prospects ── */}
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
                                        <div className="feed-icon-wrapper" style={{background: '#3b82f6'}}><DollarSign size={12}/></div>
                                        <div className="feed-content">
                                            <div className="feed-title">{activity.type}</div>
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
                            <div className="panel-title">Top Prospects</div>
                            <a href="/crm" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {topProspects.length > 0 ? topProspects.map((lead, idx) => {
                                const statusColors = {
                                    'New': { bg: '#eff6ff', color: '#2563eb' },
                                    'Contacted': { bg: '#f0fdf4', color: '#16a34a' },
                                    'Qualified': { bg: '#fef9c3', color: '#ca8a04' },
                                    'Proposal': { bg: '#f3e8ff', color: '#9333ea' },
                                    'Negotiation': { bg: '#fff7ed', color: '#ea580c' },
                                };
                                const sc = statusColors[lead.status] || { bg: '#f1f5f9', color: '#64748b' };
                                return (
                                    <div className="feed-item" key={idx} style={{ cursor: 'pointer' }} onClick={() => navigate('/crm/leads')}>
                                        <div className="feed-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: 13 }}>
                                            {idx + 1}
                                        </div>
                                        <div className="feed-content" style={{ flex: 1 }}>
                                            <div className="feed-title" style={{ fontWeight: 600 }}>{lead.name || lead.companyName || 'Unnamed Lead'}</div>
                                            <div className="feed-desc">{lead.company || lead.source || ''}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                                            {(lead.value || lead.dealValue) ? (
                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{formatINR(lead.value || lead.dealValue)}</span>
                                            ) : null}
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 0, background: sc.bg, color: sc.color }}>{lead.status}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No active prospects in pipeline.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 6. Bottom Row: 5 panels in a 5-column grid ── */}
                <div className="rd-five-col">
                    
                    {/* Sales Insights */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={15} style={{display:'inline', verticalAlign:'middle', marginRight:5}} color="#3b82f6"/> Sales Insights</div>
                        </div>
                        <div className="ai-insights-list">
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

                    {/* Sales by Region */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">By Region</div>
                            <select className="panel-dropdown"><option>Quarter ▾</option></select>
                        </div>
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.charts?.categoryData || []} margin={{top:0, right:20, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569'}} width={80} />
                                    <Tooltip contentStyle={{fontSize: 11}} cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#10b981" radius={[0,4,4,0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pipeline Stage */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Pipeline</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 130 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.erpDonut || []} innerRadius={38} outerRadius={56} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.erpDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 11}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '100%', fontSize: 10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', alignItems:'center', gap:4}}>
                                        <div style={{width:8,height:8,borderRadius: '0px',background:entry.color || '#3b82f6'}}></div> 
                                        <span><b>{entry.value}</b> {entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lead Growth */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Lead Growth</div>
                            <select className="panel-dropdown"><option>Last 6 ▾</option></select>
                        </div>
                        <div style={{ padding: '5px 0' }}>
                            <div style={{fontSize: 20, fontWeight: 800, color: '#0f172a'}}>{leads.length} Leads</div>
                            <div style={{fontSize: 11, color: '#10b981', fontWeight: 600}}>{newLeads > 0 ? `+${newLeads} in last 30 days` : 'No new leads recently'}</div>
                        </div>
                        <div style={{height: 100, width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2} dot={{r: 3, fill: '#f59e0b'}} />
                                    <Tooltip contentStyle={{fontSize: 11}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Sales Events */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Events</div>
                            <span onClick={() => navigate('/tasks/calendar')} className="panel-action" style={{cursor: 'pointer'}}>View All</span>
                        </div>
                        <div className="feed-list" style={{gap: 12, marginTop: 8}}>
                            {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                                <div className="event-item" key={i}>
                                    <div className="event-date" style={{ background: ev.bg, color: ev.col, padding: '4px 6px' }}>
                                        <span className="event-month" style={{fontSize: 10}}>{ev.month}</span>
                                        <span className="event-day" style={{color: ev.col, fontSize: 13}}>{ev.day}</span>
                                    </div>
                                    <div className="feed-content">
                                        <div className="feed-title" style={{fontSize: 13}}>{ev.title}</div>
                                        <div className="feed-desc" style={{fontSize: 11}}>{ev.desc}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                                    No upcoming events
                                </div>
                            )}
                        </div>
                    </div>

                </div>


            </div>
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        </div>
    );
};

export default SalesDashboard;
