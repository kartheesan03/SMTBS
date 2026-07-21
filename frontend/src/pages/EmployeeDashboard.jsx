import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    CheckCircle, CheckCircle2, Calendar, FileText, Clock, UserCheck, 
    AlertCircle, Quote, Star, Award, Shield, CheckSquare, 
    Activity, Book, MapPin, Coffee, MessageSquare, LayoutGrid, Bell, Cpu, Layers, Server, ListTodo, AlertTriangle, TrendingUp
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, InvRow } from './AdminDashboard';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrendYear, setRevenueTrendYear] = useState('current');
    const [myTasks, setMyTasks] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({});
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tasksRes, attRes, allTasksRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/tasks/my').catch(e => ({ data: [] })),
                    API.get('/attendance/my-history').catch(e => ({ data: [] })),
                    API.get('/tasks').catch(e => ({ data: [] }))
                ]);
                
                setDashboardData(statsRes.data || {});
                
                // Keep the fallback mock filtering for tasks if no assignee logic
                setMyTasks((tasksRes.data || []).slice(0, 5));
                setAttendanceStats(attRes.data || {});
                
                // Process global tasks for upcoming events
                const now = new Date();
                const futureTasks = (allTasksRes.data || [])
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
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Employee')}&background=059669&color=fff`} alt="Profile" className="rd-hero-avatar" />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Employee'}
                            </div>
                            <div className="rd-hero-subtitle">
                                {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})} &nbsp;·&nbsp; Your Daily Overview
                            </div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-neutral">
                                    <Activity size={14} /> {attendanceRate}% Attendance
                                </span>
                                <span className="rd-hero-badge badge-status">
                                    <div className="status-dot-inline"></div> {leaveBalance} Leave Days Left
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rd-hero-right">
                        <div className="rd-hero-visual">
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Performance</div>
                                <div className="rd-vc-value">94.5%</div>
                                <div className="rd-vc-chart"></div>
                            </div>
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Activity</div>
                                <div className="rd-vc-bars">
                                    <div className="rd-vc-bar" style={{height: '30%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '60%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '100%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '80%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '50%'}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="rd-hero-actions-col">
                            <button className="hero-action-btn primary" onClick={() => navigate('/leave-management/history')}>
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
                    <PastelKPICard title="Completed Tasks" value={completedTasks} colorTheme="mint" icon={CheckCircle} trendValue="This week" trendPositive={true} />
                    <PastelKPICard title="Pending Tasks" value={pendingTasks} colorTheme="peach" icon={Clock} trendValue="Requires attention" trendPositive={false} />
                    <PastelKPICard title="Attendance Rate" value={`${attendanceRate}%`} colorTheme="blue" icon={Activity} trendValue="Excellent" trendPositive={true} />
                    <PastelKPICard title="Leave Balance" value={leaveBalance} colorTheme="purple" icon={Calendar} trendValue="Days remaining" trendPositive={true} />
                    <PastelKPICard title="Current Streak" value={`${currentStreak} days`} colorTheme="yellow" icon={TrendingUp} trendValue="Without absence" trendPositive={true} />
                    <PastelKPICard title="Pending Leaves" value={pendingLeaves} colorTheme="pink" icon={AlertCircle} trendValue="Awaiting approval" trendPositive={false} />
                </PastelKPIGrid>

                {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
                <div className="rd-middle-row">
                    
                    {/* Left: Quick Actions Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={CheckCircle2} label="Check In" colorClass="bg-light-green" onClick={() => navigate('/attendance')} />
                            <IconQuickAction icon={Calendar} label="Apply Leave" colorClass="bg-light-orange" onClick={() => navigate('/leave-management/history')} />
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

                    {/* Right: Personal Summary Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Personal Summary</div>
                        </div>
                        <div className="inv-grid">
                            <InvRow icon={CheckSquare} iconBg="#eff6ff" iconColor="#2563EB" label="Total Tasks" value={myTasks.length} caption="Assigned" />
                            <InvRow icon={AlertCircle} iconBg="#fef2f2" iconColor="#DC2626" label="Overdue" value="0" caption="Tasks" />
                            <InvRow icon={Star} iconBg="#ecfdf5" iconColor="#059669" label="On Time" value="100%" caption="Delivery" />
                            <InvRow icon={Clock} iconBg="#f3e8ff" iconColor="#9333ea" label="Meetings" value="2" caption="Today" />
                            
                            <InvRow icon={Calendar} iconBg="#fffbeb" iconColor="#D97706" label="Leave Taken" value={leaveTaken} caption="Days" />
                            <InvRow icon={Award} iconBg="#fdf2f8" iconColor="#DB2777" label="Kudos" value="12" caption="Received" />
                            <InvRow icon={Book} iconBg="#f0fdfa" iconColor="#0D9488" label="Training" value="85%" caption="Completed" />
                            <InvRow icon={Activity} iconBg="#eff6ff" iconColor="#2563EB" label="Perf Score" value="4.8" caption="/ 5.0" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1: Productivity (wide) + Task Distribution ── */}
                <div className="rd-chart-row-wide">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Productivity Trend</div>
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
                                <LineChart data={dashboardData?.analytics?.employeeTrend || []} margin={{top:4, right:10, left:0, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={8}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} width={48} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}/>
                                    <Tooltip contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0'}} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} verticalAlign="top" height={36} />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "tasksCompleted" : "lastTasksCompleted"} 
                                        name="Tasks Completed" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "hoursLogged" : "lastHoursLogged"} 
                                        name="Hours Logged" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "efficiency" : "lastEfficiency"} 
                                        name="Efficiency (%)" 
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
                                <option>Current ▾</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 170 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.erpDonut || []} innerRadius={50} outerRadius={75} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.erpDonut || []).map((entry, index) => {
                                                const colors = ['#3b82f6', '#f59e0b', '#8b5cf6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 12}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                                {(dashboardData?.charts?.erpDonut || []).map((entry, idx) => {
                                    const colors = ['#3b82f6', '#f59e0b', '#8b5cf6'];
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

                {/* ── 5. Activity Row: Recent Activity + Tasks ── */}
                <div className="rd-two-col">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">My Recent Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity?.length > 0 ? dashboardData.tables.recentActivity : [
                                { type: 'Task Completed', text: 'Submitted the weekly sales report', time: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
                                { type: 'Attendance', text: 'Checked in at 09:00 AM', time: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
                                { type: 'Document', text: 'Uploaded expenses receipt for July', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
                                { type: 'Meeting', text: 'Attended the All-Hands meeting', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() }
                            ]).slice(0, 5).map((activity, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-time">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="feed-icon-wrapper" style={{background: '#3b82f6'}}><CheckCircle2 size={12}/></div>
                                        <div className="feed-content">
                                            <div className="feed-title">{activity.type}</div>
                                            <div className="feed-desc">{activity.text}</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">My Tasks</div>
                            <a href="/tasks" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {myTasks && myTasks.length > 0 ? (
                                myTasks.slice(0, 5).map((task, idx) => {
                                    let col = '#4f46e5'; let bg = '#e0e7ff';
                                    if (task.priority === 'High') { col = '#ef4444'; bg = '#fee2e2'; }
                                    if (task.priority === 'Low') { col = '#10b981'; bg = '#d1fae5'; }
                                    return (
                                        <div className="feed-item" key={idx}>
                                            <div className="feed-icon-wrapper" style={{background: bg, color: col}}><CheckSquare size={12}/></div>
                                            <div className="feed-content">
                                                <div className="feed-title">{task.title}</div>
                                                <div className="feed-desc" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                                    <span style={{color: col, fontWeight: 500}}>{task.status}</span>
                                                    <span>•</span>
                                                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No pending tasks.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 6. Bottom Row: 5 panels in a 5-column grid ── */}
                <div className="rd-five-col">
                    
                    {/* Personal Insights */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={15} style={{display:'inline', verticalAlign:'middle', marginRight:5}} color="#3b82f6"/> Personal Insights</div>
                        </div>
                        <div className="ai-insights-list">
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

                    {/* Skills Progression */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Skills</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.charts?.categoryData || []} margin={{top:0, right:20, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569'}} width={80} />
                                    <Tooltip contentStyle={{fontSize: 11}} cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Time Allocation */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Time</div>
                            <select className="panel-dropdown"><option>This Week ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 130 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.crmDonut || []} innerRadius={38} outerRadius={56} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.crmDonut || []).map((entry, index) => {
                                                const colors = ['#10b981', '#f59e0b', '#3b82f6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 11}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '100%', fontSize: 10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                                {(dashboardData?.charts?.crmDonut || []).map((entry, idx) => {
                                    const colors = ['#10b981', '#f59e0b', '#3b82f6'];
                                    return (
                                        <div key={idx} style={{display:'flex', alignItems:'center', gap:4}}>
                                            <div style={{width:8,height:8,borderRadius:'50%',background:colors[idx % colors.length]}}></div> 
                                            <span><b>{entry.value}</b> {entry.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Work Hours */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Work Hours</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ padding: '5px 0' }}>
                            <div style={{fontSize: 20, fontWeight: 800, color: '#0f172a'}}>164 hrs</div>
                            <div style={{fontSize: 11, color: '#10b981', fontWeight: 600}}>On Track</div>
                        </div>
                        <div style={{height: 100, width: '100%'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} dot={{r: 3, fill: '#10b981'}} />
                                    <Tooltip contentStyle={{fontSize: 11}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Company Events */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Company Events</div>
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

export default EmployeeDashboard;
