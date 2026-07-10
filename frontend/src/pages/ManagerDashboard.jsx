import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, UserCheck, CheckSquare, ListTodo, Target, Shield, FileText, Quote, LayoutGrid, Clock, Settings, Layers, Cpu, Server, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, InvRow } from './AdminDashboard';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrendYear, setRevenueTrendYear] = useState('current');
    const [tasks, setTasks] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tasksRes, empRes, ordersRes, attRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/tasks').catch(e => ({ data: [] })),
                    API.get('/employees').catch(e => ({ data: [] })),
                    API.get('/orders').catch(e => ({ data: [] })),
                    API.get('/attendance').catch(e => ({ data: null }))
                ]);
                
                setDashboardData(statsRes.data || {});
                setTasks(tasksRes.data || []);
                setEmployeesData(empRes.data || []);
                setOrdersData(ordersRes.data || []);
                setAttendanceData(attRes.data || null);
                
                // Process tasks for upcoming events
                const now = new Date();
                const futureTasks = (tasksRes.data || [])
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

    const managerStats = dashboardData?.managerStats || {};
    const myTeamSize = managerStats.teamMembers || employeesData.length || 0;
    
    let completedTasks = 0;
    let pendingTasks = 0;
    tasks.forEach(t => {
        if (t.status === 'Completed' || t.status === 'Done') completedTasks++;
        else pendingTasks++;
    });
    
    const activeProjects = managerStats.activeProjects || ordersData.filter(o => ['Pending', 'Awaiting Approval', 'Approved', 'In Progress'].includes(o.status)).length || 0;
    const pendingApprovals = managerStats.pendingApprovals || ordersData.filter(o => o.status === 'Awaiting Approval').length || 0;
    
    const totalTasks = completedTasks + pendingTasks;
    const teamProductivity = managerStats.teamProductivity || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);
    const presentCount = attendanceData?.presentToday || 0;
    const onLeaveCount = attendanceData?.onLeave || 0;

    return (
        <div className="rd-container theme-manager">
            <div className="rd-content">
                
                {/* ── Page Header ── */}
                <PageHeader title="Manager Dashboard" badge="MGMT" subtitle="Team performance & project management overview" />

                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Manager')}&background=D97706&color=fff`} alt="Profile" className="rd-hero-avatar" />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Manager'}
                            </div>
                            <div className="rd-hero-subtitle">
                                {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})} &nbsp;·&nbsp; Team Performance Overview
                            </div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-neutral">
                                    <Users size={14} /> {myTeamSize} Team Members
                                </span>
                                <span className="rd-hero-badge badge-status">
                                    <div className="status-dot-inline"></div> {activeProjects} Active Projects
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rd-hero-right">
                        <div className="rd-hero-visual">
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Productivity</div>
                                <div className="rd-vc-value">{teamProductivity}%</div>
                                <div className="rd-vc-chart"></div>
                            </div>
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Activity</div>
                                <div className="rd-vc-bars">
                                    <div className="rd-vc-bar" style={{height: '60%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '90%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '50%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '80%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '70%'}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="rd-hero-actions-col">
                            <button className="hero-action-btn primary" onClick={() => navigate('/leave-management')}>
                                <CheckCircle size={15} /> Apply Leave
                            </button>
                            <button className="hero-action-btn secondary" onClick={() => navigate('/attendance')}>
                                <Clock size={15} /> Check In
                            </button>
                        </div>
                    </div>
                </div>


                {/* ── 2. KPI Row (6 columns) ── */}
                <PastelKPIGrid columns={6}>
                    <PastelKPICard title="My Team Size" value={myTeamSize} colorTheme="blue" icon={Users} trendValue="Active members" trendPositive={true} />
                    <PastelKPICard title="Active Projects" value={activeProjects} colorTheme="purple" icon={Briefcase} trendValue="In progress" trendPositive={true} />
                    <PastelKPICard title="Completed Tasks" value={completedTasks} colorTheme="mint" icon={CheckCircle} trendValue="This week" trendPositive={true} />
                    <PastelKPICard title="Pending Tasks" value={pendingTasks} colorTheme="peach" icon={Clock} trendValue="Needs attention" trendPositive={false} />
                    <PastelKPICard title="Pending Approvals" value={pendingApprovals} colorTheme="pink" icon={AlertCircle} trendValue="Awaiting action" trendPositive={false} />
                    <PastelKPICard title="Team Productivity" value={`${teamProductivity}%`} colorTheme="yellow" icon={TrendingUp} trendValue="Efficiency rate" trendPositive={true} />
                </PastelKPIGrid>

                {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
                <div className="rd-middle-row">
                    
                    {/* Left: Quick Actions Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={CheckSquare} label="Assign Task" colorClass="bg-light-blue" onClick={() => navigate('/tasks')} />
                            <IconQuickAction icon={Briefcase} label="New Project" colorClass="bg-light-purple" onClick={() => navigate('/crm')} />
                            <IconQuickAction icon={BarChart2} label="Team Perf." colorClass="bg-light-green" onClick={() => navigate('/reports')} />
                            <IconQuickAction icon={Calendar} label="Apply Leave" colorClass="bg-light-orange" onClick={() => navigate('/leave-management')} />
                            
                            <IconQuickAction icon={CheckCircle} label="Approvals" colorClass="bg-light-pink" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Users} label="My Team" colorClass="bg-light-blue" onClick={() => navigate('/employees')} />
                            <IconQuickAction icon={Target} label="Goals" colorClass="bg-light-teal" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Settings} label="Settings" colorClass="bg-light-gray" onClick={() => navigate('/settings')} />
                            
                            <IconQuickAction icon={Activity} label="Activity" colorClass="bg-light-orange" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Bell} label="Notifs" colorClass="bg-light-red" onClick={() => navigate('/notifications')} />
                            <IconQuickAction icon={FileText} label="Reports" colorClass="bg-light-purple" onClick={() => navigate('/reports')} />
                            <IconQuickAction icon={LayoutGrid} label="Dashboard" colorClass="bg-light-green" onClick={() => navigate('/')} />
                        </div>
                    </div>

                    {/* Right: Manager Summary Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Manager Summary</div>
                        </div>
                        <div className="inv-grid">
                            <InvRow icon={Users} iconBg="#eff6ff" iconColor="#2563EB" label="Total Team" value={myTeamSize} caption="Active" />
                            <InvRow icon={UserCheck} iconBg="#fffbeb" iconColor="#D97706" label="On Leave" value={onLeaveCount} caption="Today" isAlert={onLeaveCount > 2} />
                            <InvRow icon={AlertTriangle} iconBg="#fef2f2" iconColor="#DC2626" label="Pending Tasks" value={pendingTasks} caption="Tasks" isAlert={pendingTasks > 0} />
                            <InvRow icon={CheckSquare} iconBg="#ecfdf5" iconColor="#059669" label="Completed" value={completedTasks} caption="All time" />
                            
                            <InvRow icon={Briefcase} iconBg="#f3e8ff" iconColor="#9333ea" label="Projects" value={ordersData.length || 0} caption="Total" />
                            <InvRow icon={Clock} iconBg="#e0f2fe" iconColor="#0284c7" label="Active Projects" value={activeProjects} caption="In Progress" />
                            <InvRow icon={Target} iconBg="#f0fdfa" iconColor="#0D9488" label="Efficiency" value={`${teamProductivity}%`} caption="Target 90%" />
                            <InvRow icon={AlertCircle} iconBg="#fdf2f8" iconColor="#DB2777" label="Approvals" value={pendingApprovals} caption="Pending" isAlert={pendingApprovals > 0} />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1: Task Trend (wide) + Task Distribution ── */}
                <div className="rd-chart-row-wide">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Team Performance</div>
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
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.analytics?.managerTrend || []} margin={{top:4, right:10, left:0, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={8}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} width={48} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}/>
                                    <Tooltip contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0'}} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} verticalAlign="top" height={36} />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "completedProjects" : "lastCompletedProjects"} 
                                        name="Completed Projects" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "pendingProjects" : "lastPendingProjects"} 
                                        name="Pending Projects" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "overdueProjects" : "lastOverdueProjects"} 
                                        name="Overdue Projects" 
                                        stroke="#10b981" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Task Distribution</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}>
                                <option>By Member</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 170 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.erpDonut || []} innerRadius={50} outerRadius={75} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.erpDonut || []).map((entry, index) => {
                                                const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 12}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => {
                                    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
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
                </div>

                {/* ── 5. Activity Row: Team Activity + Approvals (equal columns) ── */}
                <div className="rd-two-col">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Team Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 5).map((activity, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-time">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="feed-icon-wrapper" style={{background: '#3b82f6'}}><CheckCircle size={12}/></div>
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
                            <div className="panel-title">Pending Approvals</div>
                            <a href="/" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No pending approvals.</div>
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
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>Your team has <strong>{myTeamSize}</strong> active members.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div><strong>{activeProjects}</strong> projects currently active.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>Ensure tasks are evenly distributed among team members.</div>
                            </div>
                        </div>
                    </div>

                    {/* Resource Utilization */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Resource Use</div>
                            <select className="panel-dropdown"><option>Month</option></select>
                        </div>
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.charts?.categoryData || []} margin={{top:0, right:20, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569'}} width={80} />
                                    <Tooltip contentStyle={{fontSize: 11}} cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[0,4,4,0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Project Status */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Projects</div>
                            <select className="panel-dropdown"><option>All ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 130 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.crmDonut || []} innerRadius={38} outerRadius={56} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.crmDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 11}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '100%', fontSize: 10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', alignItems:'center', gap:4}}>
                                        <div style={{width:8,height:8,borderRadius:'50%',background:entry.color || '#10b981'}}></div> 
                                        <span><b>{entry.value}</b> {entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sprint Velocity */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Velocity</div>
                            <select className="panel-dropdown"><option>Last 6</option></select>
                        </div>
                        <div style={{ padding: '5px 0' }}>
                            <div style={{fontSize: 20, fontWeight: 800, color: '#0f172a'}}>42 Points</div>
                            <div style={{fontSize: 11, color: '#10b981', fontWeight: 600}}>↑ 5% avg increase</div>
                        </div>
                        <div style={{height: 100, width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{r: 3, fill: '#3b82f6'}} />
                                    <Tooltip contentStyle={{fontSize: 11}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Deadlines</div>
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

export default ManagerDashboard;
