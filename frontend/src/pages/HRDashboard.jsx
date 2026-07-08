import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, CheckCircle2, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, TrendingDown, AlertTriangle, UserCheck, Moon, AlertCircle, UserPlus, FileText, Settings, Shield, Plus, Quote, LayoutGrid, ListTodo, Target, Layers, Cpu, Server, Clock, Truck, ShoppingCart, Tag
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, InvRow } from './AdminDashboard';

const HRDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [revenueTrendYear, setRevenueTrendYear] = useState('current');
    const [employees, setEmployees] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, empRes, leavesRes, salariesRes, tasksRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/employees').catch(e => ({ data: [] })),
                    API.get('/leaves').catch(e => ({ data: [] })),
                    API.get('/salaries').catch(e => ({ data: [] })),
                    API.get('/tasks').catch(e => ({ data: [] }))
                ]);
                
                setDashboardData(statsRes.data || {});
                setEmployees(empRes.data || []);
                setLeavesData(leavesRes.data || []);
                setSalariesData(salariesRes.data || []);
                
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

    const hrStats = dashboardData?.hrStats || {};
    const totalEmployees = employees.length || 0;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
    const absentToday = hrStats.absentToday || 0;
    const newJoiners = employees.filter(e => e.joinDate && new Date(e.joinDate) > new Date(Date.now() - 30*24*60*60*1000)).length || hrStats.newJoiners || 0;
    const pendingLeaves = (leavesData || []).filter(l => l.status === 'Pending').length;
    
    let payrollProcessed = 0;
    if (salariesData.length > 0) {
        const paidSalaries = salariesData.filter(s => s.status === 'Paid').length;
        payrollProcessed = Math.round((paidSalaries / salariesData.length) * 100);
    }

    return (
        <div className="rd-container theme-hr">
            <div className="rd-content">
                
                {/* ── Page Header ── */}
                <PageHeader title="HR Dashboard" badge="HRMS" subtitle="Human resources management & workforce overview" />

                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'HR')}&background=7C3AED&color=fff`} alt="Profile" className="rd-hero-avatar" />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'HR Admin'}
                            </div>
                            <div className="rd-hero-subtitle">
                                {new Date().toLocaleDateString('en-IN', {weekday:'long', day:'numeric', month:'long', year:'numeric'})} &nbsp;·&nbsp; Human Resources Overview
                            </div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-neutral">
                                    <Users size={14} /> {totalEmployees} Employees
                                </span>
                                <span className="rd-hero-badge badge-status">
                                    <div className="status-dot-inline"></div> {pendingLeaves} Pending Leaves
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rd-hero-right-actions">
                        <button className="hero-action-btn secondary" onClick={() => navigate('/attendance')}>
                            <Clock size={15} /> Check In
                        </button>
                        <button className="hero-action-btn primary" onClick={() => navigate('/leave-management')}>
                            <CheckCircle size={15} /> Apply Leave
                        </button>
                    </div>
                </div>

                {/* ── 2. KPI Row (6 columns) ── */}
                <PastelKPIGrid columns={6}>
                    <PastelKPICard title="Total Employees" value={totalEmployees} colorTheme="blue" icon={Users} trendValue={`${newJoiners} new joiners`} trendPositive={true} />
                    <PastelKPICard title="Attendance Rate" value={hrStats.attendanceRate || '98%'} colorTheme="mint" icon={UserCheck} trendValue="vs last month" trendPositive={true} />
                    <PastelKPICard title="New Joiners" value={newJoiners} colorTheme="peach" icon={UserPlus} trendValue="This month" trendPositive={true} />
                    <PastelKPICard title="Pending Leaves" value={pendingLeaves} colorTheme="purple" icon={Calendar} trendValue="Awaiting approval" trendPositive={false} />
                    <PastelKPICard title="Payroll Processed" value={`${payrollProcessed}%`} colorTheme="pink" icon={DollarSign} trendValue="This month" trendPositive={true} />
                    <PastelKPICard title="On Leave Today" value={onLeave} colorTheme="yellow" icon={Moon} trendValue="vs average" trendPositive={true} />
                </PastelKPIGrid>

                {/* ── 3. Middle Row (Quick Actions + Mini Stats) ── */}
                <div className="rd-middle-row">
                    
                    {/* Left: Quick Actions Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={UserPlus} label="Add Employee" colorClass="bg-light-blue" onClick={() => navigate('/employees/new')} />
                            <IconQuickAction icon={CheckCircle2} label="Attendance" colorClass="bg-light-green" onClick={() => navigate('/attendance')} />
                            <IconQuickAction icon={Calendar} label="Apply Leave" colorClass="bg-light-orange" onClick={() => navigate('/leave-management')} />
                            <IconQuickAction icon={DollarSign} label="Payroll" colorClass="bg-light-purple" onClick={() => navigate('/payroll')} />
                            
                            <IconQuickAction icon={FileText} label="Contracts" colorClass="bg-light-pink" onClick={() => navigate('/reports')} />
                            <IconQuickAction icon={Users} label="Directory" colorClass="bg-light-blue" onClick={() => navigate('/employees')} />
                            <IconQuickAction icon={Target} label="Reviews" colorClass="bg-light-teal" onClick={() => navigate('/tasks')} />
                            <IconQuickAction icon={Settings} label="Policies" colorClass="bg-light-gray" onClick={() => navigate('/settings')} />
                            
                            <IconQuickAction icon={Activity} label="Wellbeing" colorClass="bg-light-orange" onClick={() => navigate('/')} />
                            <IconQuickAction icon={Bell} label="Notifs" colorClass="bg-light-red" onClick={() => navigate('/notifications')} />
                            <IconQuickAction icon={Briefcase} label="Hiring" colorClass="bg-light-purple" onClick={() => navigate('/')} />
                            <IconQuickAction icon={BarChart2} label="Reports" colorClass="bg-light-green" onClick={() => navigate('/reports')} />
                        </div>
                    </div>

                    {/* Right: HR Summary Grid */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">HR Summary</div>
                        </div>
                        <div className="inv-grid">
                            <InvRow icon={Users} iconBg="#eff6ff" iconColor="#2563EB" label="Total Staff" value={totalEmployees} caption="Active" />
                            <InvRow icon={UserCheck} iconBg="#ecfdf5" iconColor="#059669" label="Present" value={presentToday} caption="Today" />
                            <InvRow icon={AlertTriangle} iconBg="#fef2f2" iconColor="#DC2626" label="Absent" value={absentToday} caption="Today" isAlert={absentToday > 5} />
                            <InvRow icon={Moon} iconBg="#fffbeb" iconColor="#D97706" label="On Leave" value={onLeave} caption="Approved" />
                            
                            <InvRow icon={Calendar} iconBg="#fdf2f8" iconColor="#DB2777" label="Leave Reqs" value={pendingLeaves} caption="Pending" isAlert={pendingLeaves > 0} />
                            <InvRow icon={Clock} iconBg="#f3e8ff" iconColor="#9333ea" label="Avg Tenure" value="2.4" caption="Years" />
                            <InvRow icon={UserPlus} iconBg="#f0fdfa" iconColor="#0D9488" label="New Joiners" value={newJoiners} caption="This Month" />
                            <InvRow icon={TrendingDown} iconBg="#ecfdf5" iconColor="#059669" label="Turnover" value="1.2%" caption="This Qtr" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1 (4 Columns) ── */}
                {/* ── 4. Chart Row 1: Employee Growth (wide) + Attendance Today ── */}
                <div className="rd-chart-row-wide">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Workforce Trend</div>
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
                                <LineChart data={dashboardData?.analytics?.hrTrend || []} margin={{top:4, right:10, left:0, bottom:0}}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} dy={8}/>
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} width={48} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}/>
                                    <Tooltip contentStyle={{fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0'}} />
                                    <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} verticalAlign="top" height={36} />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "newHires" : "lastNewHires"} 
                                        name="New Hires" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "attrition" : "lastAttrition"} 
                                        name="Attrition" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2} 
                                        dot={false} 
                                        activeDot={{ r: 6 }} 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey={revenueTrendYear === 'current' ? "trainingHours" : "lastTrainingHours"} 
                                        name="Training Hours" 
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
                            <div className="panel-title">Attendance Today</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}>
                                <option>Today ▾</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 170 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[
                                            {name: 'Present', value: presentToday || 10}, 
                                            {name: 'Absent', value: absentToday || 1}, 
                                            {name: 'Leave', value: onLeave || 1}
                                        ]} innerRadius={50} outerRadius={75} dataKey="value" cx="50%" cy="50%">
                                            <Cell fill="#10b981" />
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 12}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                                {[
                                    {name: 'Present', value: presentToday || 10}, 
                                    {name: 'Absent', value: absentToday || 1}, 
                                    {name: 'Leave', value: onLeave || 1}
                                ].map((entry, idx) => {
                                    const colors = ['#10b981', '#ef4444', '#f59e0b'];
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

                {/* ── 5. Activity Row: HR Activity + HR Alerts ── */}
                <div className="rd-two-col">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">HR Activity</div>
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
                                <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No recent HR activity.</div>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">HR Alerts</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.hrStats?.recentEmployees || []).length > 0 ? (
                                (dashboardData?.hrStats?.recentEmployees || []).slice(0, 5).map((emp, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-icon-wrapper" style={{color: '#3b82f6', background: 'transparent'}}><UserPlus size={16}/></div>
                                        <div className="feed-content" style={{flex: 1}}>
                                            <div className="feed-title" style={{fontWeight: 500}}>{emp.name} joined ({emp.department})</div>
                                        </div>
                                        <div className="feed-time" style={{width: 'auto'}}>{new Date(emp.joinDate || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', fontSize: '13px', color: '#94a3b8', textAlign: 'center'}}>No recent hires.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 6. Bottom Row: 5 panels in a 5-column grid ── */}
                <div className="rd-five-col">
                    
                    {/* HR Insights */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={15} style={{display:'inline', verticalAlign:'middle', marginRight:5}} color="#3b82f6"/> HR Insights</div>
                        </div>
                        <div className="ai-insights-list">
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div><strong>{onLeave}</strong> employees are currently on leave.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div><strong>{newJoiners}</strong> new joiners this month.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div>Attendance rate is currently <strong>{dashboardData?.hrStats?.attendanceRate || 'N/A'}</strong>.</div>
                            </div>
                            <div className="ai-insight-item">
                                <div className="ai-dot"></div>
                                <div><strong>{pendingLeaves}</strong> leave requests pending.</div>
                            </div>
                        </div>
                    </div>

                    {/* Headcount by Dept */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Headcount</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.hrStats?.employeeDistribution || []} margin={{top:0, right:20, left:0, bottom:0}}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#475569'}} width={80} />
                                    <Tooltip contentStyle={{fontSize: 11}} cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0,4,4,0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Diversity Ratio */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Diversity</div>
                            <select className="panel-dropdown"><option>All ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 130 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.hrmsDonut || []} innerRadius={38} outerRadius={56} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.hrmsDonut || []).map((entry, index) => {
                                                const colors = ['#3b82f6', '#ec4899', '#f59e0b'];
                                                return <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 11}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '100%', fontSize: 10, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                                {(dashboardData?.charts?.hrmsDonut || []).map((entry, idx) => {
                                    const colors = ['#3b82f6', '#ec4899', '#f59e0b'];
                                    return (
                                        <div key={idx} style={{display:'flex', alignItems:'center', gap:4}}>
                                            <div style={{width:8,height:8,borderRadius:'50%',background:entry.color || colors[idx % colors.length]}}></div> 
                                            <span><b>{entry.value}</b> {entry.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Hiring Trend */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Hiring Trend</div>
                            <select className="panel-dropdown"><option>This Year ▾</option></select>
                        </div>
                        <div style={{ padding: '5px 0' }}>
                            <div style={{fontSize: 20, fontWeight: 800, color: '#0f172a'}}>{newJoiners} Hires</div>
                            <div style={{fontSize: 11, color: '#10b981', fontWeight: 600}}>This Month</div>
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

                    {/* Upcoming HR Events */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">HR Events</div>
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

                {/* ── 6. Footer ── */}
                <div className="dashboard-footer">
                    <div><Calendar size={12} style={{display:'inline',marginRight:4}}/> Current FY: 2026 - 2027</div>
                    <div><Layers size={12} style={{display:'inline',marginRight:4}}/> HR Module v2.5.1</div>
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

export default HRDashboard;
