import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { 
    Users, Search, Bell, CheckCircle, Calendar, DollarSign,
    Box, Briefcase, Activity, RefreshCw, BarChart2, TrendingUp, AlertTriangle, AlertCircle, FileText
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip, CartesianGrid } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import CommandCenter from '../components/CommandCenter';
import { RDKPICard } from './AdminDashboard';

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    
    const [dashboardData, setDashboardData] = useState(null);
    const [ordersData, setOrdersData] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [tasksData, setTasksData] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [dashRes, ordRes, empRes, taskRes, attRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/orders').catch(e => ({ data: [] })),
                    API.get('/employees').catch(e => ({ data: [] })),
                    API.get('/tasks').catch(e => ({ data: [] })),
                    API.get('/attendance').catch(e => ({ data: null }))
                ]);
                setDashboardData(dashRes.data || {});
                setOrdersData(ordRes.data || []);
                setEmployeesData(empRes.data || []);
                setTasksData(taskRes.data || []);
                setAttendanceData(attRes.data);
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

    const dashboard = dashboardData || {};
    const teamMembers = employeesData.length;
    const activeProjects = ordersData.filter(o => ['Pending', 'Awaiting Approval', 'Approved', 'In Progress'].includes(o.status)).length;
    const pendingApprovals = ordersData.filter(o => o.status === 'Awaiting Approval').length;
    
    let completedTasksCount = 0;
    let pendingTasksCount = 0;
    
    tasksData.forEach(task => {
        if (task.status === 'Completed' || task.status === 'Done') {
            completedTasksCount++;
        } else {
            pendingTasksCount++;
        }
    });

    const totalTasks = completedTasksCount + pendingTasksCount;
    const teamProductivity = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    
    const departmentRevenue = ordersData
        .filter(o => o.status === 'Delivered' || o.status === 'Paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const presentCount = attendanceData?.presentToday || 0;

    const projectStatusData = ordersData
        .filter(o => o.status && o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled')
        .slice(0, 5)
        .map(o => ({
            id: o._id,
            text: `Project: ${o.description || o.orderNumber} (${o.status})`,
            time: new Date(o.createdAt || Date.now()).toISOString(),
            type: 'activity'
        }));

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Hero Banner */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-greeting">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'Manager'} <span role="img" aria-label="wave">­ƒæï</span>
                        </div>
                        <div className="rd-subtitle">
                            {user?.role || 'Department Manager'} ÔÇó <span className="rd-badge-id">{user?.email || 'manager@smtbms.com'}</span> ÔÇó Today's Status: Online
                        </div>
                        
                        <div className="rd-hero-actions">
                            <button className="rd-btn-primary" onClick={() => navigate('/tasks')}><CheckCircle size={18}/> Team Tasks</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/orders')}><Briefcase size={18}/> Active Projects</button>
                            <button className="rd-btn-outline" onClick={() => navigate('/employees')}><Users size={18}/> My Team</button>
                        </div>
                        
                        <div className="rd-hero-footer">
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Module Access</span>
                                <span className="rd-footer-val">Department Ops</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Team Size</span>
                                <span className="rd-footer-val">{teamMembers}</span>
                            </div>
                            <div className="rd-footer-item">
                                <span className="rd-footer-label">Productivity</span>
                                <span className="rd-footer-val">{teamProductivity}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="rd-hero-right">
                        <div className="rd-circle-progress" style={{"--p": `${teamMembers > 0 ? Math.round((presentCount / teamMembers) * 100) : 0}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{teamMembers > 0 ? Math.round((presentCount / teamMembers) * 100) : 0}%</span>
                                <span className="rd-circle-label">Attendance</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": `${teamProductivity}%`}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{teamProductivity}%</span>
                                <span className="rd-circle-label">Productivity</span>
                            </div>
                        </div>
                        <div className="rd-circle-progress" style={{"--p": "100%"}}>
                            <div className="rd-circle-inner">
                                <span className="rd-circle-val">{activeProjects}</span>
                                <span className="rd-circle-label">Projects</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Row */}
                <div className="rd-kpi-row">
                    <RDKPICard title="Team Members" value={teamMembers} trendValue="Active" icon={Users} color="blue" subLabel="Direct Reports" bottomVal={`${teamMembers} members`} />
                    <RDKPICard title="Active Projects" value={activeProjects} trendValue="In Progress" icon={Briefcase} color="green" subLabel="Ongoing Work" bottomVal={`${activeProjects} projects`} />
                    <RDKPICard title="Pending Approvals" value={pendingApprovals} trendValue="Review" icon={AlertCircle} color="orange" subLabel="Needs Attention" bottomVal={`${pendingApprovals} items`} />
                    <RDKPICard title="Tasks Completed" value={completedTasksCount} trendValue="Done" icon={CheckCircle} color="purple" subLabel="This Month" bottomVal={`${totalTasks} total`} />
                </div>

                {/* Middle Section */}
                <div className="rd-middle-row">
                    {/* Overview Summary */}
                    <div className="rd-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="rd-card-title">Department Performance</div>
                        <div style={{flex: 1, minHeight: 250, marginTop: 16}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dashboard.charts?.monthlyStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                    <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Legend verticalAlign="top" align="left" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: 13, fontWeight: 500 }} />
                                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProd)" name="Output / KPI" dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rd-card">
                        <div className="rd-card-title">Quick Actions</div>
                        <div className="rd-action-stack">
                            <div className="rd-action-btn blue" onClick={() => navigate('/tasks/new')}><span className="rd-action-text">Assign Task</span> <span>ÔåÆ</span></div>
                            <div className="rd-action-btn green" onClick={() => navigate('/orders/new')}><span className="rd-action-text">New Project</span> <span>ÔåÆ</span></div>
                            <div className="rd-action-btn purple" onClick={() => navigate('/employees')}><span className="rd-action-text">Team Performance</span> <span>ÔåÆ</span></div>
                            <div className="rd-action-btn orange" onClick={() => navigate('/leave-management')}><span className="rd-action-text">Approve Time Off</span> <span>ÔåÆ</span></div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="rd-card">
                        <div className="rd-card-title">Recent Projects</div>
                        <div className="rd-feed">
                            {projectStatusData.length > 0 ? (
                                projectStatusData.map((notif, idx) => (
                                    <div className="rd-feed-item" key={notif.id || idx}>
                                        <div className={`rd-feed-icon ${notif.type === 'alert' ? 'orange' : 'blue'}`}>
                                            <Briefcase size={16}/>
                                        </div>
                                        <div className="rd-feed-content">
                                            <div className="rd-feed-text">{notif.text}</div>
                                            <div className="rd-feed-time">{new Date(notif.time).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8'}}>No active projects currently.</div>
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
