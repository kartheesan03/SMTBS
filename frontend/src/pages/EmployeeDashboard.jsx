import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, AlertCircle, FileText, ListTodo
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { RDKPICard } from './AdminDashboard';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    
    const [dashboardData, setDashboardData] = useState(null);
    const [myTasks, setMyTasks] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dashRes, myTasksRes, attRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/tasks/my-tasks').catch(e => ({ data: [] })),
                    API.get('/attendance/my-stats').catch(e => ({ data: null }))
                ]);
                setDashboardData(dashRes.data || {});
                setMyTasks(myTasksRes.data || []);
                setAttendanceStats(attRes.data);
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading My Workspace...</div>;
    }

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    let completedTasksCount = 0;
    let pendingTasksCount = 0;
    
    myTasks.forEach(task => {
        if (task.status === 'Completed' || task.status === 'Done') {
            completedTasksCount++;
        } else {
            pendingTasksCount++;
        }
    });

    const totalTasks = completedTasksCount + pendingTasksCount;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    
    const presentDays = attendanceStats?.presentDays || 0;
    const leaveDays = attendanceStats?.leaveDays || 0;
    const absentDays = attendanceStats?.absentDays || 0;
    const workingDays = presentDays + leaveDays + absentDays || 1;
    const attendancePercentage = Math.round((presentDays / workingDays) * 100);

    const recentTaskData = myTasks
        .filter(t => t.status !== 'Completed' && t.status !== 'Done')
        .slice(0, 5)
        .map(t => ({
            id: t._id,
            text: `Task: ${t.title || 'Untitled'} (${t.status})`,
            time: new Date(t.dueDate || t.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'activity'
        }));

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Hero Banner */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-greeting">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'} <span role="img" aria-label="wave">👋</span>
                        </div>
                        <div className="rd-subtitle">
                            {user?.role || 'Employee'} • <span className="rd-badge-id">{user?.email || 'employee@smtbms.com'}</span> • Today's Status: Online
                        </div>
                        
                        <div className="rd-hero-actions">
                            <button className="rd-btn-primary" onClick={() => navigate('/tasks')}><ListTodo size={18}/> My Tasks</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/attendance')}><Calendar size={18}/> My Attendance</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/leave-management')}><AlertCircle size={18}/> Request Leave</button>
                        </div>
                        
                        <div className="rd-hero-footer">
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Module Access</span>
                                <span className="rd-footer-val">Personal Workspace</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Pending Tasks</span>
                                <span className="rd-footer-val">{pendingTasksCount}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Attendance Rate</span>
                                <span className="rd-footer-val">{attendancePercentage}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rd-hero-right">
                        <div className="rd-circle-progress" style={{"--p": `${taskCompletionRate}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{taskCompletionRate}%</span>
                                <span className="rd-circle-label">Task Completion</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": `${attendancePercentage}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{attendancePercentage}%</span>
                                <span className="rd-circle-label">Attendance</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": "100%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{leaveDays}</span>
                                <span className="rd-circle-label">Leaves Taken</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="rd-kpi-row">
                    <RDKPICard title="My Total Tasks" value={totalTasks} trendValue="Assigned" icon={ListTodo} color="blue" subLabel="Overall" bottomVal={`${pendingTasksCount} pending`} />
                    <RDKPICard title="Task Completion" value={`${taskCompletionRate}%`} trendValue="Done" icon={CheckCircle} color="green" subLabel="This Month" bottomVal={`${completedTasksCount} completed`} />
                    <RDKPICard title="Attendance Rate" value={`${attendancePercentage}%`} trendValue="Active" icon={Calendar} color="orange" subLabel="Overall" bottomVal={`${presentDays} days present`} />
                    <RDKPICard title="Leaves Balance" value={leaveDays} trendValue="Taken" icon={FileText} color="purple" subLabel="This Year" bottomVal={`${absentDays} days absent`} />
                </div>

                {/* Middle Section */}
                <div className="rd-middle-row">
                    {/* Overview Summary */}
                    <div className="rd-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="rd-card-title">My Output</div>
                        <div style={{flex: 1, minHeight: 250, marginTop: 16}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboardData?.charts?.monthlyStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Legend verticalAlign="top" align="left" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: 13, fontWeight: 500 }} />
                                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOutput)" name="Performance Metric" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rd-card">
                        <div className="rd-card-title">Quick Actions</div>
                        <div className="rd-action-stack">
                            <div className="rd-action-btn blue" onClick={() => navigate('/tasks')}><span className="rd-action-text">My Tasks</span> <span>→</span></div>
                            <div className="rd-action-btn green" onClick={() => navigate('/attendance')}><span className="rd-action-text">Attendance</span> <span>→</span></div>
                            <div className="rd-action-btn purple" onClick={() => navigate('/leave-management')}><span className="rd-action-text">Request Leave</span> <span>→</span></div>
                            <div className="rd-action-btn orange" onClick={() => navigate('/profile')}><span className="rd-action-text">My Profile</span> <span>→</span></div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rd-card">
                        <div className="rd-card-title">Pending Tasks</div>
                        <div className="rd-feed">
                            {recentTaskData.length > 0 ? (
                                recentTaskData.map((notif, idx) => (
                                    <div className="rd-feed-item" key={notif.id || idx}>
                                        <div className={`rd-feed-icon ${notif.type === 'alert' ? 'orange' : 'blue'}`}>
                                            <ListTodo size={16}/>
                                        </div>
                                        <div className="rd-feed-content">
                                            <div className="rd-feed-text">{notif.text}</div>
                                            <div className="rd-feed-time">{notif.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>No pending tasks!</div>
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
