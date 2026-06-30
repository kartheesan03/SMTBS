import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, UserCheck, Moon, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { RDKPICard } from './AdminDashboard';

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

    const dashboard = dashboardData || {};
    const hrStats = dashboard.hrStats || {};

    const uniqueEmployees = Array.from(new Map(employees.map(e => [e.employeeId || e._id || Math.random(), e])).values());

    const totalEmployees = uniqueEmployees.length;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
    const absentToday = hrStats.absentToday || 0;
    const newJoiners = employees.filter(e => e.createdAt && new Date(e.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length || 0;

    const pendingLeaves = (leavesData || []).filter(l => l.status === 'Pending').length;
    const pendingSalaries = (salariesData || []).filter(s => s.status === 'Awaiting Approval').length;
    const pendingApprovals = pendingLeaves + pendingSalaries;

    const salaries = salariesData || [];
    let payrollProcessed = 0;
    if (salaries.length > 0) {
        const paidSalaries = salaries.filter(s => s.status === 'Paid').length;
        payrollProcessed = Math.round((paidSalaries / salaries.length) * 100);
    }

    const attendanceDonutData = [
        { name: 'Present', value: presentToday, color: '#10b981' },
        { name: 'Absent', value: absentToday, color: '#ef4444' },
        { name: 'On Leave', value: onLeave, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    let recentActivities = dashboard.recentActivity || [];
    if (recentActivities.length === 0 && leavesData.length > 0) {
        recentActivities = [...leavesData].reverse().slice(0, 5).map(l => ({
            id: l._id,
            text: `Leave request from ${l.employeeName || 'Employee'} (${l.status || 'Pending'})`,
            time: new Date(l.createdAt || Date.now()).toISOString(),
            type: 'activity'
        }));
    } else {
        recentActivities = recentActivities.map(a => ({
            text: a.text,
            time: a.time,
            type: 'activity'
        }));
    }

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Hero Banner */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-greeting">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'HR Admin'} <span role="img" aria-label="wave">👋</span>
                        </div>
                        <div className="rd-subtitle">
                            {user?.role || 'Human Resources'} • <span className="rd-badge-id">{user?.email || 'hr@smtbms.com'}</span> • Today's Status: Online
                        </div>
                        
                        <div className="rd-hero-actions">
                            <button className="rd-btn-primary" onClick={() => navigate('/attendance')}><CheckCircle size={18}/> Check Attendance</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/leave-management')}><Calendar size={18}/> Leaves</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/payroll')}><DollarSign size={18}/> Payroll</button>
                        </div>
                        
                        <div className="rd-hero-footer">
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Module Access</span>
                                <span className="rd-footer-val">HR Operations</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Total Staff</span>
                                <span className="rd-footer-val">{totalEmployees}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Pending Req.</span>
                                <span className="rd-footer-val">{pendingApprovals}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rd-hero-right">
                        <div className="rd-circle-progress" style={{"--p": `${totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0}%</span>
                                <span className="rd-circle-label">Attendance</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": `${payrollProcessed}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{payrollProcessed}%</span>
                                <span className="rd-circle-label">Payroll Paid</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": "100%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{pendingApprovals}</span>
                                <span className="rd-circle-label">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="rd-kpi-row">
                    <RDKPICard title="Total Employees" value={totalEmployees} trendValue={`+${newJoiners} new`} icon={Users} color="blue" subLabel="Active Workforce" bottomVal={`${totalEmployees} total`} />
                    <RDKPICard title="Present Today" value={presentToday} trendValue="+2%" icon={UserCheck} color="green" subLabel="Daily Attendance" bottomVal={`${presentToday} staff`} />
                    <RDKPICard title="On Leave" value={onLeave} trendValue={`${pendingLeaves} pending`} icon={Moon} color="orange" subLabel="Currently Away" bottomVal={`${onLeave} staff`} />
                    <RDKPICard title="Pending Approvals" value={pendingApprovals} trendValue="Attention" icon={AlertCircle} color="red" subLabel="Needs Action" bottomVal={`${pendingApprovals} requests`} />
                </div>

                {/* Middle Section */}
                <div className="rd-middle-row">
                    {/* Overview Summary */}
                    <div className="rd-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="rd-card-title">Monthly Employee Growth</div>
                        <div style={{flex: 1, minHeight: 250, marginTop: 16}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEmp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Legend verticalAlign="top" align="left" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: 13, fontWeight: 500 }} />
                                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorEmp)" name="Growth Rate" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rd-card">
                        <div className="rd-card-title">Quick Actions</div>
                        <div className="rd-action-stack">
                            <div className="rd-action-btn blue" onClick={() => navigate('/employees/new')}><span className="rd-action-text">Add Employee</span> <span>→</span></div>
                            <div className="rd-action-btn green" onClick={() => navigate('/attendance')}><span className="rd-action-text">Mark Attendance</span> <span>→</span></div>
                            <div className="rd-action-btn orange" onClick={() => navigate('/leave-management')}><span className="rd-action-text">Leave Requests</span> <span>→</span></div>
                            <div className="rd-action-btn purple" onClick={() => navigate('/payroll')}><span className="rd-action-text">Process Payroll</span> <span>→</span></div>
                            <div className="rd-action-btn cyan" onClick={() => navigate('/settings')}><span className="rd-action-text">HR Settings</span> <span>→</span></div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rd-card">
                        <div className="rd-card-title">Recent Activities</div>
                        <div className="rd-feed">
                            {recentActivities.length > 0 ? (
                                recentActivities.slice(0,4).map((notif, idx) => (
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
            </div>
            
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        </div>
    );
};

export default HRDashboard;
