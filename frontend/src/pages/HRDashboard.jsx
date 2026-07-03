import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, CheckCircle2, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, TrendingDown, AlertTriangle, UserCheck, Moon, AlertCircle, UserPlus, FileText, Settings, Shield, Plus, Quote, LayoutGrid, ListTodo, Target, Layers, Cpu, Server, Clock, Truck, ShoppingCart, Tag
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { SparklineKPICard, IconQuickAction, MiniStatCard } from './AdminDashboard';

const HRDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, empRes, leavesRes, salariesRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/employees').catch(e => ({ data: [] })),
                    API.get('/leaves').catch(e => ({ data: [] })),
                    API.get('/salaries').catch(e => ({ data: [] }))
                ]);
                
                setDashboardData(statsRes.data || {});
                setEmployees(empRes.data || []);
                setLeavesData(leavesRes.data || []);
                setSalariesData(salariesRes.data || []);
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading HR dashboard data...</div>;
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
                
                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-bg-chart"></div>
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name || 'HR'}&background=8b5cf6&color=fff`} alt="Profile" className="rd-hero-avatar" style={{ borderColor: '#8b5cf6' }} />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'HR Admin'} <span role="img" aria-label="wave">👋</span>
                            </div>
                            <div className="rd-hero-subtitle">Here is what's happening in Human Resources today.</div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-blue">
                                    <Shield size={14} /> HR Manager
                                </span>
                                <span className="rd-hero-badge badge-blue" style={{background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569'}}>
                                    <FileText size={14} /> {user?.email || 'hr@smtbms.com'}
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
                    <SparklineKPICard title="Total Employees" value={totalEmployees} trend="up" trendValue="1.2% vs last month" icon={Users} colorClass="icon-blue" />
                    <SparklineKPICard title="Present Today" value={presentToday} trend="up" trendValue="95% attendance" icon={UserCheck} colorClass="icon-green" />
                    <SparklineKPICard title="On Leave" value={onLeave} trend="neutral" trendValue="Normal levels" icon={Moon} colorClass="icon-orange" />
                    <SparklineKPICard title="Pending Leaves" value={pendingLeaves} trend="down" trendValue="Needs Action" icon={Calendar} colorClass="icon-pink" />
                    <SparklineKPICard title="Payroll Status" value={`${payrollProcessed}%`} trend="up" trendValue="Processed" icon={DollarSign} colorClass="icon-purple" />
                    <SparklineKPICard title="Open Positions" value="3" trend="neutral" trendValue="Actively Hiring" icon={Briefcase} colorClass="icon-teal" />
                </div>

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
                            <IconQuickAction icon={Calendar} label="Leaves" colorClass="bg-light-orange" onClick={() => navigate('/leave-management')} />
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

                    {/* Right: Mini Stats Grid */}
                    <div className="dashboard-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="ms-grid" style={{ flex: 1, alignContent: 'center' }}>
                            <MiniStatCard title="Total Staff" value={totalEmployees} subValue="Active" icon={Users} colorClass="bg-light-blue" trendColor="#3b82f6" />
                            <MiniStatCard title="Present" value={presentToday} subValue="Today" icon={UserCheck} colorClass="bg-light-green" trendColor="#10b981" />
                            <MiniStatCard title="Absent" value={absentToday} subValue="Today" icon={AlertTriangle} colorClass="bg-light-red" trendColor="#ef4444" />
                            <MiniStatCard title="On Leave" value={onLeave} subValue="Approved" icon={Moon} colorClass="bg-light-orange" trendColor="#f59e0b" />
                            
                            <MiniStatCard title="Leave Reqs" value={pendingLeaves} subValue="Pending" icon={Calendar} colorClass="bg-light-pink" trendColor="#ec4899" />
                            <MiniStatCard title="Avg Tenure" value="2.4" subValue="Years" icon={Clock} colorClass="bg-light-purple" trendColor="#8b5cf6" />
                            <MiniStatCard title="New Joiners" value={newJoiners} subValue="This Month" icon={UserPlus} colorClass="bg-light-teal" trendColor="#14b8a6" />
                            <MiniStatCard title="Turnover" value="1.2%" subValue="This Qtr" icon={TrendingDown} colorClass="bg-light-green" trendColor="#10b981" />
                        </div>
                    </div>

                </div>

                {/* ── 4. Chart Row 1 (4 Columns) ── */}
                <div className="bottom-grid-4">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Employee Growth</div>
                            <select className="panel-dropdown"><option>This Year ▾</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []}>
                                    <defs>
                                        <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8'}} width={40} />
                                    <Tooltip contentStyle={{fontSize: 10, borderRadius: 8}} />
                                    <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorEmp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Attendance Today</div>
                            <select className="panel-dropdown"><option>Today ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[
                                            {name: 'Present', value: presentToday || 10}, 
                                            {name: 'Absent', value: absentToday || 1}, 
                                            {name: 'Leave', value: onLeave || 1}
                                        ]} innerRadius={40} outerRadius={60} dataKey="value">
                                            <Cell fill="#10b981" />
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: '80px', fontSize: 10 }}>
                                <div style={{display:'flex', alignItems:'center', gap:4, marginBottom:6}}><div style={{width:8,height:8,borderRadius:'50%',background:'#10b981'}}></div> <b>Present</b><br/>{presentToday}</div>
                                <div style={{display:'flex', alignItems:'center', gap:4, marginBottom:6}}><div style={{width:8,height:8,borderRadius:'50%',background:'#ef4444'}}></div> <b>Absent</b><br/>{absentToday}</div>
                                <div style={{display:'flex', alignItems:'center', gap:4}}><div style={{width:8,height:8,borderRadius:'50%',background:'#f59e0b'}}></div> <b>Leave</b><br/>{onLeave}</div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">HR Activity</div>
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
                                <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No recent HR activity.</div>
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
                                (dashboardData?.hrStats?.recentEmployees || []).slice(0, 3).map((emp, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-icon-wrapper" style={{color: '#3b82f6', background: 'transparent'}}><UserPlus size={16}/></div>
                                        <div className="feed-content" style={{flex: 1}}>
                                            <div className="feed-title" style={{fontWeight: 500}}>{emp.name} joined ({emp.department})</div>
                                        </div>
                                        <div className="feed-time" style={{width: 'auto'}}>{new Date(emp.joinDate || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '12px', fontSize: '11px', color: '#64748b', textAlign: 'center'}}>No recent hires.</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* ── 5. Chart Row 2 (5 Columns) ── */}
                <div className="bottom-grid-5">
                    
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={16} style={{display:'inline', verticalAlign:'middle', marginRight:4}} color="#3b82f6"/> HR Insights</div>
                        </div>
                        <div className="ai-insights-list" style={{marginTop: 8}}>
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

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Headcount by Dept</div>
                            <select className="panel-dropdown"><option>Current ▾</option></select>
                        </div>
                        <div className="chart-container-sm">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.hrStats?.employeeDistribution || []} margin={{top:0, right:30, left:0, bottom:0}}>
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
                            <div className="panel-title">Diversity Ratio</div>
                            <select className="panel-dropdown"><option>All ▾</option></select>
                        </div>
                        <div className="chart-container-sm" style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flex: 1, height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.hrmsDonut || []} innerRadius={35} outerRadius={55} dataKey="value">
                                            {(dashboardData?.charts?.hrmsDonut || []).map((entry, index) => {
                                                const colors = ['#3b82f6', '#ec4899', '#f59e0b'];
                                                return <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{fontSize: 10}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ width: 'auto', minWidth: '85px', fontSize: 9 }}>
                                {(dashboardData?.charts?.hrmsDonut || []).map((entry, idx) => {
                                    const colors = ['#3b82f6', '#ec4899', '#f59e0b'];
                                    return (
                                        <div key={idx} style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                                            <span><div className="ai-dot" style={{display:'inline-block',background:entry.color || colors[idx % colors.length],marginRight:4}}></div>{entry.name}</span> 
                                            <b>{entry.value}</b>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Hiring Trend</div>
                            <select className="panel-dropdown"><option>This Year ▾</option></select>
                        </div>
                        <div style={{ padding: '0 0 10px 0' }}>
                            <div style={{fontSize: 18, fontWeight: 800, color: '#0f172a'}}>{newJoiners} Hires</div>
                            <div style={{fontSize: 10, color: '#10b981', fontWeight: 600}}>This Month</div>
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
                            <div className="panel-title">Upcoming HR Events</div>
                            <a href="/calendar" className="panel-action">View Calendar</a>
                        </div>
                        <div className="feed-list" style={{gap: 12, marginTop: 8}}>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month">Jul</span>
                                    <span className="event-day">15</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Company Townhall</div>
                                    <div className="feed-desc">All Hands Meeting</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month">Aug</span>
                                    <span className="event-day">01</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Performance Reviews</div>
                                    <div className="feed-desc">Q3 Appraisals Start</div>
                                </div>
                            </div>
                            <div className="event-item">
                                <div className="event-date">
                                    <span className="event-month">Aug</span>
                                    <span className="event-day">15</span>
                                </div>
                                <div className="feed-content">
                                    <div className="feed-title">Independence Day</div>
                                    <div className="feed-desc">Public Holiday</div>
                                </div>
                            </div>
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
