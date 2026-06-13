import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Calendar, CheckCircle, Clock, Briefcase, 
    FileText, Bell, Search, ChevronDown, ListTodo
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [tasksData, setTasksData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, taskRes, ordRes] = await Promise.all([
                API.get('/dashboard/stats'),
                API.get('/tasks').catch(() => ({ data: [] })),
                API.get('/orders').catch(() => ({ data: [] }))
            ]);
            setDashboardData(dashRes.data);
            setTasksData(taskRes.data || []);
            setOrdersData(ordRes.data || []);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
            setDashboardData({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const dashboard = dashboardData || {};

    // KPIs
    const attendanceStatus = dashboard?.employeeStats?.attendanceToday || "Not Marked"; 
    
    // Calculate pending tasks from real tasks data
    const pendingTasks = tasksData.filter(t => t.status !== 'Completed' && t.status !== 'Done').length;
    
    // Calculate active projects
    const assignedProjects = ordersData.filter(o => ['In Progress', 'Approved'].includes(o.status)).length;
    
    const leaveBalance = dashboard?.employeeStats?.myPendingLeaves || 0; // Fetch from leaves API if available
    const salarySlip = "Not Generated";
    const unreadNotifications = 0;

    // Charts Data
    const myAttendanceData = [];

    const myTasks = tasksData
        .filter(t => t.status !== 'Completed' && t.status !== 'Done')
        .slice(0, 5)
        .map((t, index) => ({
            id: t._id || index,
            title: t.title || t.description || 'Task',
            priority: t.priority || 'Medium',
            status: t.status || 'Pending',
            due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
        }));

    return (
        <div className="role-dashboard-layout">
            <div className="main-content">

                {/* Top Nav Bar */}
                <div className="top-nav-bar">
                    <div className="search-bar">
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search tasks, documents..." />
                    </div>
                    <div className="nav-actions">
                        <div className="date-filter">
                            <Calendar size={16} />
                            <span>This Week</span>
                            <ChevronDown size={14} />
                        </div>
                        <button className="icon-btn notification-btn">
                            <Bell size={20} />
                            <span className="notif-badge"></span>
                        </button>
                        <div className="profile-dropdown">
                            <div className="avatar" style={{background: '#6366f1'}}>
                                {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                            </div>
                            <div className="profile-info">
                                <span className="p-name">{user?.name || 'Employee'}</span>
                                <span className="p-role">{user?.role || 'Employee'}</span>
                            </div>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                <div className="header-section">
                    <h1 className="page-title">Employee Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's your overview.</p>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Attendance Status</span>
                            <h3 className="kpi-value" style={{color: '#059669'}}>{attendanceStatus}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><ListTodo size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Tasks</span>
                            <h3 className="kpi-value">{pendingTasks}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Briefcase size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Assigned Projects</span>
                            <h3 className="kpi-value">{assignedProjects}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Calendar size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Leaves</span>
                            <h3 className="kpi-value">{leaveBalance}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><FileText size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Salary Slip</span>
                            <h3 className="kpi-value">{salarySlip}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><Bell size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Notifications</span>
                            <h3 className="kpi-value">{unreadNotifications} Unread</h3>
                        </div>
                    </div>
                </div>

                {/* Main Content Row */}
                <div className="charts-grid-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
                    
                    {/* My Attendance Chart */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Clock size={16} /> My Attendance (Hours)</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            {myAttendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={myAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                        <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={24}>
                                            {myAttendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>No attendance data available</span>
                            )}
                        </div>
                    </div>

                    {/* My Tasks Table */}
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><ListTodo size={16} /> My Tasks</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '280px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 8px' }}>Task Description</th>
                                        <th style={{ padding: '12px 8px' }}>Priority</th>
                                        <th style={{ padding: '12px 8px' }}>Due Date</th>
                                        <th style={{ padding: '12px 8px' }}>Status</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTasks.length > 0 ? myTasks.map(task => (
                                        <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 600, color: '#334155' }}>{task.title}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: task.priority === 'High' ? '#fee2e2' : task.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                                                    color: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#d97706' : '#64748b'
                                                }}>{task.priority}</span>
                                            </td>
                                            <td style={{ padding: '12px 8px', color: '#64748b' }}>{task.due}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: task.status === 'Completed' ? '#ecfdf5' : task.status === 'In Progress' ? '#eff6ff' : '#f8fafc',
                                                    color: task.status === 'Completed' ? '#059669' : task.status === 'In Progress' ? '#3b82f6' : '#64748b'
                                                }}>{task.status}</span>
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                <button style={{ background: 'transparent', color: '#3b82f6', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>Update</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                                No tasks found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx="true">{`
                .role-dashboard-layout {
                    display: block;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .main-content {
                    padding: 20px 24px;
                    height: 100vh;
                    overflow-y: auto;
                }

                /* Top Nav Bar */
                .top-nav-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .search-bar {
                    display: flex; align-items: center; gap: 8px;
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 8px 12px; width: 300px;
                }
                .search-bar input { border: none; outline: none; width: 100%; font-size: 13px; color: #0f172a; }
                .search-bar input::placeholder { color: #94a3b8; }
                .nav-actions { display: flex; align-items: center; gap: 16px; }
                .date-filter {
                    display: flex; align-items: center; gap: 6px; cursor: pointer;
                    background: #ffffff; border: 1px solid #e2e8f0; padding: 6px 12px;
                    border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;
                }
                .icon-btn {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%;
                    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #64748b; position: relative;
                }
                .notification-btn .notif-badge {
                    position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
                    background: #ef4444; border-radius: 50%; border: 2px solid #fff;
                }
                .profile-dropdown {
                    display: flex; align-items: center; gap: 8px; cursor: pointer;
                }
                .avatar {
                    width: 32px; height: 32px; border-radius: 50%; background: #1e293b;
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-weight: bold; font-size: 13px;
                }
                .profile-info { display: flex; flex-direction: column; }
                .p-name { font-size: 13px; font-weight: 700; color: #0f172a; }
                .p-role { font-size: 11px; color: #64748b; }

                .header-section { margin-bottom: 16px; }
                .page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }
                .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .kpi-card {
                    background: #ffffff; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
                }
                .kpi-icon-wrapper { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
                .kpi-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 2px; }
                .kpi-value { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }

                .charts-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .bento-card {
                    background: #ffffff; border-radius: 10px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .bento-card-header { padding: 12px 14px 0; }
                .bento-card-title { font-size: 13px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
                .bento-card-body { padding: 14px; flex: 1; overflow-y: auto; }

                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                    .charts-grid-3 { grid-template-columns: 1fr; }
                    .main-content { padding: 16px; }
                    .top-nav-bar { flex-direction: column; gap: 12px; align-items: flex-start; }
                    .search-bar { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
