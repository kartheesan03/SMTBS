import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    CheckCircle, CheckCircle2, Calendar, FileText, Clock, UserCheck, 
    AlertCircle, Quote, Star, Award, Shield, CheckSquare, 
    Activity, Book, MapPin, Coffee, MessageSquare, LayoutGrid, Bell, Cpu, Layers, Server, ListTodo, AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, MiniStatCard } from './AdminDashboard';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tasksRes, attRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/tasks/my').catch(e => ({ data: [] })),
                    API.get('/attendance/my-history').catch(e => ({ data: [] }))
                ]);
                
                setDashboardData(statsRes.data || {});
                
                // Keep the fallback mock filtering for tasks if no assignee logic
                setMyTasks((tasksRes.data || []).slice(0, 5));
                setAttendanceStats(attRes.data || {});
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

    const completedTasks = myTasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
    const pendingTasks = myTasks.filter(t => t.status !== 'Completed' && t.status !== 'Done').length;
    
    const employeeStats = dashboardData?.employeeStats || {};
    const attendanceRate = attendanceStats?.attendanceRate || 98;
    const leaveBalance = attendanceStats?.leaveBalance || 14;
    const currentStreak = attendanceStats?.currentStreak || 12;
    const leaveTaken = attendanceStats?.leaveTaken || 4;
    const pendingLeaves = employeeStats.myPendingLeaves || 0;
    const attendanceToday = employeeStats.attendanceToday || '-';

    return (
        <div className="rd-container theme-employee">
            <div className="rd-content">
                
                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-bg-chart"></div>
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'Employee'}&background=10b981&color=fff`} alt="Profile" className="rd-hero-avatar" style={{ borderColor: '#10b981' }} />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Employee'} <span role="img" aria-label="wave">👋</span>
                            </div>
                            <div className="rd-hero-subtitle">Here is your daily activity and task overview.</div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-blue">
                                    <Star size={14} /> Top Performer
                                </span>
                                <span className="rd-hero-badge badge-blue" style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569'}}>
                                    <FileText size={14} /> {user?.email || 'employee@smtbms.com'}
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
                    <SparklineKPICard title="Tasks Completed" value={completedTasks} trend="up" trendValue="2 today" icon={CheckSquare} colorClass="icon-green" />
                    <SparklineKPICard title="Pending Tasks" value={pendingTasks} trend="down" trendValue="Due soon" icon={ListTodo} colorClass="icon-orange" />
                    <SparklineKPICard title="Attendance Rate" value={`${attendanceRate}%`} trend="up" trendValue="Excellent" icon={UserCheck} colorClass="icon-blue" />
                    <SparklineKPICard title="Leave Balance" value={leaveBalance} trend="neutral" trendValue="Days remaining" icon={Calendar} colorClass="icon-purple" />
                    <SparklineKPICard title="Work Streak" value={`${currentStreak} days`} trend="up" trendValue="Keep it up!" icon={Award} colorClass="icon-pink" />
                    <SparklineKPICard title="Hours Logged" value="38.5" trend="up" trendValue="This week" icon={Clock} colorClass="icon-teal" />
                </div>

                {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
                <div className="rd-middle-row">
                    
                    {/* Left: Quick Actions Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={CheckCircle2} label="Check In" colorClass="bg-light-green" onClick={() => navigate('/attendance')} />
                            <IconQuickAction icon={Calendar} label="Apply Leave" colorClass="bg-light-orange" onClick={() => navigate('/leave-management')} />
                            <IconQuickAction icon={FileText} label="Pay Slips" colorClass="bg-light-purple" onClick={() => navigate('/')} />
                            <IconQuickAction icon={CheckSquare} label="My Tasks" colorClass="bg-light-blue" onClick={() => navigate('/tasks')} />
                            
                            <IconQuickAction icon={Book} label="Policies" colorClass="bg-light-gray" onClick={() => navigate('/')} />
                            <IconQuickAction icon={MessageSquare} label="Messages" colorClass="bg-light-pink" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Coffee} label="Breaks" colorClass="bg-light-teal" onClick={() => navigate('/')} />
                            <IconQuickAction icon={MapPin} label="WFH Req." colorClass="bg-light-blue" onClick={() => navigate('/')} />
                            
                            <IconQuickAction icon={Activity} label="Activity" colorClass="bg-light-orange" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Bell} label="Notifs" colorClass="bg-light-red" onClick={() => navigate('/notifications')} />
                            <IconQuickAction icon={Star} label="Kudos" colorClass="bg-light-purple" onClick={() => navigate('/')} />
                            <IconQuickAction icon={LayoutGrid} label="Dashboard" colorClass="bg-light-green" onClick={() => navigate('/')} />
                        </div>
                    </div>

                    {/* Right: Mini Stats Grid */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="ms-grid" style={{ flex: 1, alignContent: 'center' }}>
                            <MiniStatCard title="Total Tasks" value={myTasks.length} subValue="Assigned" icon={CheckSquare} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Overdue" value="0" subValue="Tasks" icon={AlertCircle} colorClass="bg-light-red" trendColor="#10b981" />
                            <MiniStatCard title="On Time" value="100%" subValue="Delivery" icon={Star} colorClass="bg-light-green" trendColor="#10b981" />
                            <MiniStatCard title="Meetings" value="2" subValue="Today" icon={Clock} colorClass="bg-light-purple" trendColor="#8b5cf6" />
                            
                            <MiniStatCard title="Leave Taken" value={leaveTaken} subValue="Days" icon={Calendar} colorClass="bg-light-orange" trendColor="#f59e0b" />
                            <MiniStatCard title="Kudos" value="12" subValue="Received" icon={Award} colorClass="bg-light-pink" trendColor="#ec4899" />
                            <MiniStatCard title="Training" value="85%" subValue="Completed" icon={Book} colorClass="bg-light-teal" trendColor="#14b8a6" />
                            <MiniStatCard title="Perf Score" value="4.8" subValue="/ 5.0" icon={Activity} colorClass="bg-light-blue" trendColor="#3b82f6" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1 (4 Columns) ── */}
                <div className="bottom-grid-4">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">My Productivity</div>
                            <select className="panel-dropdown"><option>This Week ▾</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <defs>
                                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} width={40} />
                                    <Tooltip contentStyle={{fontSize: 10, borderRadius: 8}} />
                                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Task Distribution</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.erpDonut || []} innerRadius={35} outerRadius={55} dataKey="value">
                                            {(dashboardData?.charts?.erpDonut || []).map((entry, index) => {
                                                const colors = ['#3b82f6', '#f59e0b', '#8b5cf6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: 'auto', minWidth: '85px', fontSize: 9 }}>
                                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => {
                                    const colors = ['#3b82f6', '#f59e0b', '#8b5cf6'];
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
                            <div className="panel-title">My Recent Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 3).map((activity, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-time">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="feed-icon-wrapper" style={{background: '#3b82f6'}}><CheckCircle2 size={12}/></div>
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
                            <div className="panel-title">My Tasks</div>
                            <a href="/tasks" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No pending tasks.</div>
                        </div>
                    </div>

                </div>

                {/* ── 5. Chart Row 2 (5 Columns) ── */}
                <div className="bottom-grid-5">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={16} style={{display:'inline', verticalAlign:'middle', marginRight:4}} color="#3b82f6"/> Personal Insights</div>
                        </div>
                        <div className="ai-insights-list" style={{marginTop: 8}}>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>Your attendance rate is <strong>{attendanceRate}</strong>.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>You have taken <strong>{leaveTaken}</strong> leave days.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>You have <strong>{myTasks.length}</strong> active tasks.</div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Skills Progression</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.charts?.categoryData || []} margin={{top:0, right:30, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} width={70} />
                                    <Tooltip contentStyle={{fontSize: 10}} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} barSize={8} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Time Allocation</div>
                            <select className="panel-dropdown"><option>This Week ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.crmDonut || []} innerRadius={35} outerRadius={55} dataKey="value">
                                            {(dashboardData?.charts?.crmDonut || []).map((entry, index) => {
                                                const colors = ['#10b981', '#f59e0b', '#3b82f6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: 'auto', minWidth: '85px', fontSize: 9 }}>
                                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => {
                                    const colors = ['#10b981', '#f59e0b', '#3b82f6'];
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
                            <div className="panel-title">Work Hours</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ padding: '0 0 10px 0' }}>
                            <div style={{fontSize: 18, fontWeight: 800, color: '#0f172a'}}>164 hrs</div>
                            <div style={{fontSize: 10, color: '#10b981', fontWeight: 600}}>On Track</div>
                        </div>
                        <div style={{height: 100, width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{r: 3, fill: '#10b981'}} />
                                    <Tooltip contentStyle={{fontSize: 10}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Upcoming Company Events</div>
                            <a href="/calendar" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list" style={{gap: 12, marginTop: 8}}>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#8b5cf6'}}>Jul</span>
                                    <span className="event-day">15</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Townhall Meeting</div>
                                    <div className="feed-desc">All Hands Update</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#ec4899'}}>Jul</span>
                                    <span className="event-day">20</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Team Outing</div>
                                    <div className="feed-desc">Annual team lunch</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month" style={{color: '#f59e0b'}}>Aug</span>
                                    <span className="event-day">15</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Public Holiday</div>
                                    <div className="feed-desc">Independence Day</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── 6. Footer ── */}
                <div className="dashboard-footer">
                    <div><Calendar size={12} style={{display:'inline',marginRight:4}}/> Current FY: 2026 - 2027</div>
                    <div><Layers size={12} style={{display:'inline',marginRight:4}}/> Employee Portal v2.5.1</div>
                    <div><Clock size={12} style={{display:'inline',marginRight:4}}/> Last Login: Today, 09:00 AM</div>
                    <div className="footer-item" style={{color: '#10b981'}}>
                        <div className="footer-dot"></div> All Systems Operational
                    </div>
                </div>

            </div>
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        </div>
    );
};

export default EmployeeDashboard;
