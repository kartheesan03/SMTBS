import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, UserCheck, CheckSquare, ListTodo, Target, Shield, FileText, Quote, LayoutGrid, Clock, Settings, Layers, Cpu, Server, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, MiniStatCard } from './AdminDashboard';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading Manager dashboard data...</div>;
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
                
                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-bg-chart"></div>
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'Manager'}&background=f59e0b&color=fff`} alt="Profile" className="rd-hero-avatar" style={{ borderColor: '#f59e0b' }} />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Manager'} <span role="img" aria-label="wave">👋</span>
                            </div>
                            <div className="rd-hero-subtitle">Here is your team's performance overview today.</div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-blue">
                                    <Target size={14} /> Department Manager
                                </span>
                                <span className="rd-hero-badge badge-blue" style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569'}}>
                                    <FileText size={14} /> {user?.email || 'manager@smtbms.com'}
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
                    <SparklineKPICard title="Team Members" value={myTeamSize} trend="up" trendValue="1 new" icon={Users} colorClass="icon-blue" />
                    <SparklineKPICard title="Active Projects" value={activeProjects} trend="up" trendValue="On Track" icon={Briefcase} colorClass="icon-purple" />
                    <SparklineKPICard title="Completed Tasks" value={completedTasks} trend="up" trendValue="12% vs yesterday" icon={CheckSquare} colorClass="icon-green" />
                    <SparklineKPICard title="Pending Tasks" value={pendingTasks} trend="down" trendValue="5 due soon" icon={ListTodo} colorClass="icon-orange" />
                    <SparklineKPICard title="Team Efficiency" value={`${teamProductivity}%`} trend="up" trendValue="Excellent" icon={TrendingUp} colorClass="icon-teal" />
                    <SparklineKPICard title="Pending Approvals" value={pendingApprovals} trend="neutral" trendValue="Requires Action" icon={AlertCircle} colorClass="icon-pink" />
                </div>

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
                            <IconQuickAction icon={Calendar} label="Time Off" colorClass="bg-light-orange" onClick={() => navigate('/leave-management')} />
                            
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

                    {/* Right: Mini Stats Grid */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="ms-grid" style={{ flex: 1, alignContent: 'center' }}>
                            <MiniStatCard title="Total Team" value={myTeamSize} subValue="Active" icon={Users} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="On Leave" value={onLeaveCount} subValue="Today" icon={UserCheck} colorClass="bg-light-orange" trendColor="#f59e0b" />
                            <MiniStatCard title="Pending Tasks" value={pendingTasks} subValue="Tasks" icon={AlertTriangle} colorClass="bg-light-red" trendColor="#ef4444" />
                            <MiniStatCard title="Completed" value={completedTasks} subValue="All time" icon={CheckSquare} colorClass="bg-light-green" trendColor="#10b981" />
                            
                            <MiniStatCard title="Projects" value={ordersData.length || 0} subValue="Total" icon={Briefcase} colorClass="bg-light-purple" trendColor="#8b5cf6" />
                            <MiniStatCard title="Active Projects" value={activeProjects} subValue="In Progress" icon={Clock} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Efficiency" value={`${teamProductivity}%`} subValue="Target 90%" icon={Target} colorClass="bg-light-teal" trendColor="#14b8a6" />
                            <MiniStatCard title="Approvals" value={pendingApprovals} subValue="Pending" icon={AlertCircle} colorClass="bg-light-pink" trendColor="#ec4899" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1 (4 Columns) ── */}
                <div className="bottom-grid-4">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Task Completion Trend</div>
                            <select className="panel-dropdown"><option>This Week</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <defs>
                                        <linearGradient id="colorTask" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} width={40} />
                                    <Tooltip contentStyle={{fontSize: 10, borderRadius: 8}} />
                                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTask)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Project Status</div>
                            <select className="panel-dropdown"><option>All Projects</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.crmDonut || []} innerRadius={40} outerRadius={60} dataKey="value">
                                            {(dashboardData?.charts?.crmDonut || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '80px', fontSize: 10 }}>
                                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => (
                                    <div key={idx} style={{display:'flex', alignItems:'center', gap:4, marginBottom:6}}>
                                        <div style={{width:8,height:8,borderRadius:'50%',background:entry.color || '#10b981'}}></div> 
                                        <span><b>{entry.name}</b><br/>{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Team Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 3).map((activity, idx) => (
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
                                <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No recent activity.</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Pending Approvals</div>
                            <a href="/" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No pending approvals.</div>
                        </div>
                    </div>

                </div>

                {/* ── 5. Chart Row 2 (5 Columns) ── */}
                <div className="bottom-grid-5">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={16} style={{display:'inline', verticalAlign:'middle', marginRight:4}} color="#3b82f6"/> AI Insights</div>
                        </div>
                        <div className="ai-insights-list" style={{marginTop: 8}}>
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

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Resource Utilization</div>
                            <select className="panel-dropdown"><option>This Month</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.charts?.categoryData || []} margin={{top:0, right:30, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={70} />
                                    <Tooltip contentStyle={{fontSize: 10}} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[0,4,4,0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Task Distribution</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.erpDonut || []} innerRadius={35} outerRadius={55} dataKey="value">
                                            {(dashboardData?.charts?.erpDonut || []).map((entry, index) => {
                                                const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: 'auto', minWidth: '85px', fontSize: 9 }}>
                                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => {
                                    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
                                    return (
                                        <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                                            <span><div className="ai-dot" style={{display:'inline-block',background:colors[idx % colors.length],marginRight:4}}></div>{entry.name}</span> 
                                            <b>{entry.value}</b>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sprint Velocity</div>
                            <select className="panel-dropdown"><option>Last 6 Sprints</option></select>
                        </div>
                        <div style={{ padding: '0 0 10px 0' }}>
                            <div style={{fontSize: 18, fontWeight: 800, color: '#0f172a'}}>42 Points</div>
                            <div style={{fontSize: 10, color: '#10b981', fontWeight: 600}}>↑ 5% avg increase</div>
                        </div>
                        <div style={{height: 100, width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{r: 3, fill: '#3b82f6'}} />
                                    <Tooltip contentStyle={{fontSize: 10}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Upcoming Deadlines</div>
                            <a href="/calendar" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list" style={{gap: 12, marginTop: 8}}>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#ef4444'}}>Jul</span>
                                    <span className="event-day">12</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Sprint Demo</div>
                                    <div className="feed-desc">Frontend team demo</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#f59e0b'}}>Jul</span>
                                    <span className="event-day">18</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Release v2.5.2</div>
                                    <div className="feed-desc">Production deployment</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#3b82f6'}}>Jul</span>
                                    <span className="event-day">25</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Quarterly Review</div>
                                    <div className="feed-desc">Q3 planning session</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── 6. Footer ── */}
                <div className="dashboard-footer">
                    <div><Calendar size={12} style={{display:'inline',marginRight:4}}/> Current FY: 2026 - 2027</div>
                    <div><Layers size={12} style={{display:'inline',marginRight:4}}/> Manager Module v2.5.1</div>
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

export default ManagerDashboard;
