import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { 
    Calendar, CheckCircle, Clock, Briefcase, 
    FileText, Bell, Search, ChevronDown, ListTodo, ArrowUpRight, ArrowDownRight, Fingerprint
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
    const [attendancesData, setAttendancesData] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);
    const [notificationsData, setNotificationsData] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, taskRes, ordRes, attRes, levRes, salRes, notifRes] = await Promise.all([
                API.get('/dashboard/stats').catch(() => ({ data: {} })),
                API.get('/tasks').catch(() => ({ data: [] })),
                API.get('/orders').catch(() => ({ data: [] })),
                API.get('/attendances').catch(() => ({ data: [] })),
                API.get('/leaves').catch(() => ({ data: [] })),
                API.get('/salaries').catch(() => ({ data: [] })),
                API.get('/notifications').catch(() => ({ data: [] }))
            ]);
            setDashboardData(dashRes.data || {});
            setTasksData(taskRes.data || []);
            setOrdersData(ordRes.data || []);
            setAttendancesData(attRes.data || []);
            setLeavesData(levRes.data || []);
            setSalariesData(salRes.data || []);
            setNotificationsData(notifRes.data || []);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
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
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const userId = user?.id || user?._id;

    const safeArray = (data, key) => Array.isArray(data) ? data : data?.[key] || data?.data || [];
    
    const tasksArray = safeArray(tasksData, 'tasks');
    const ordersArray = safeArray(ordersData, 'orders');
    const attendancesArray = safeArray(attendancesData, 'attendances');
    const leavesArray = safeArray(leavesData, 'leaves');
    const salariesArray = safeArray(salariesData, 'salaries');
    const notificationsArray = safeArray(notificationsData, 'notifications');

    const myTasksList = tasksArray.filter(t => t.assignedTo === userId || t.employeeId === userId);
    const myOrdersList = ordersArray.filter(o => o.employeeId === userId || o.assignedTo === userId || o.createdById === userId);
    const myAttendancesList = attendancesArray.filter(a => a.employeeId === userId || a.userId === userId);
    const myLeavesList = leavesArray.filter(l => l.employeeId === userId || l.userId === userId);
    const mySalariesList = salariesArray.filter(s => s.employeeId === userId || s.userId === userId);
    const myNotificationsList = notificationsArray.filter(n => n.userId === userId || n.employeeId === userId);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAttendance = myAttendancesList.find(a => {
        if (!a.date) return false;
        return a.date.toString().includes(todayStr) || new Date(a.date).toISOString().split('T')[0] === todayStr;
    });
    
    const todaysLeave = myLeavesList.find(l => {
        if (!l.startDate || !l.endDate || l.status !== 'Approved') return false;
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const today = new Date();
        return today >= start && today <= end;
    });

    let attendanceStatus = "Not Marked";
    let attendanceColor = '#64748b';
    if (todaysLeave) {
        attendanceStatus = "On Leave";
        attendanceColor = '#3b82f6';
    } else if (todaysAttendance) {
        if (todaysAttendance.checkOut) {
            attendanceStatus = "Checked Out";
            attendanceColor = '#f59e0b';
        } else if (todaysAttendance.checkIn) {
            attendanceStatus = "Present";
            attendanceColor = '#10b981';
        }
    }
    
    const pendingTasks = myTasksList.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const assignedProjects = myOrdersList.length;
    const leaveBalance = myLeavesList.filter(l => l.status === 'Pending').length;
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const hasSalary = mySalariesList.some(s => s.month === currentMonth && s.year === currentYear);
    const salarySlip = hasSalary ? "Generated" : "Pending";
    
    const unreadNotifications = myNotificationsList.filter(n => !n.isRead).length;

    const myAttendanceData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        const att = myAttendancesList.find(a => a.date && (a.date.toString().includes(dStr) || new Date(a.date).toISOString().split('T')[0] === dStr));
        let hours = 0;
        if (att && att.checkIn && att.checkOut) {
            const inTime = new Date(att.checkIn);
            const outTime = new Date(att.checkOut);
            hours = (outTime - inTime) / (1000 * 60 * 60);
        }
        
        myAttendanceData.push({
            name: days[d.getDay()],
            hours: Number(Math.max(0, hours).toFixed(1)),
            fill: hours >= 8 ? '#10b981' : hours > 0 ? '#f59e0b' : '#e2e8f0'
        });
    }

    const myTasks = myTasksList
        .filter(t => t.status !== 'Completed' && t.status !== 'Done')
        .slice(0, 5)
        .map((t, index) => ({
            id: t._id || t.id || index,
            title: t.title || t.description || 'Task',
            priority: t.priority || 'Medium',
            status: t.status || 'Pending',
            due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'
        }));

    const kpiCards = [
        { title: 'Attendance Status', value: attendanceStatus, icon: Fingerprint, color: attendanceColor, isStatus: true },
        { title: 'Pending Tasks', value: pendingTasks, icon: ListTodo, color: '#f59e0b' },
        { title: 'Assigned Projects', value: assignedProjects, icon: Briefcase, color: '#3b82f6' },
        { title: 'Pending Leaves', value: leaveBalance, icon: Calendar, color: '#8b5cf6' },
        { title: 'Salary Slip', value: salarySlip, icon: FileText, color: '#10b981', isStatus: true },
        { title: 'Notifications', value: `${unreadNotifications} Unread`, icon: Bell, color: '#ef4444' },
    ];

    return (
        <div className="main-content">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Employee Workspace</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Welcome back, {user?.firstName || 'User'}!</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        <Clock size={12} /> {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="bento-grid">
                {/* Left Side: KPIs and Charts (Span 9) */}
                <div className="bento-col-9 bento-grid" style={{ alignContent: 'start' }}>
                    
                    {/* Top KPIs (2 rows of 3) */}
                    {kpiCards.map((kpi, idx) => (
                        <div className="bento-col-4" key={idx}>
                            <div className="bento-card kpi-card-bento" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.title}</div>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${kpi.color}15`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <kpi.icon size={16} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 style={{ fontSize: kpi.isStatus ? '20px' : '24px', fontWeight: 800, color: kpi.isStatus ? kpi.color : '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>{kpi.value}</h3>
                            </div>
                        </div>
                    ))}

                    <div className="bento-col-12">
                        <div className="bento-card">
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><ListTodo size={16} /> My Tasks</h3>
                            </div>
                            <div className="bento-card-body">
                                {myTasks.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Task Description</th>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Priority</th>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Due Date</th>
                                                <th style={{ paddingBottom: '8px', fontWeight: 600 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {myTasks.map((task, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '12px 0', fontWeight: 600, color: '#0f172a' }}>{task.title}</td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{ 
                                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                            background: task.priority === 'High' ? '#fee2e2' : task.priority === 'Medium' ? '#fef3c7' : '#f1f5f9',
                                                            color: task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#d97706' : '#64748b'
                                                        }}>{task.priority}</span>
                                                    </td>
                                                    <td style={{ padding: '12px 0', color: '#64748b', fontWeight: 500 }}>{task.due}</td>
                                                    <td style={{ padding: '12px 0' }}>
                                                        <span style={{ 
                                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                            background: task.status === 'Completed' ? '#ecfdf5' : task.status === 'In Progress' ? '#eff6ff' : '#f8fafc',
                                                            color: task.status === 'Completed' ? '#059669' : task.status === 'In Progress' ? '#3b82f6' : '#64748b'
                                                        }}>{task.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex-center" style={{ height: '60px', color: '#94a3b8', fontSize: '13px' }}>No pending tasks</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Feature Panel & Activity (Span 3) */}
                <div className="bento-col-3 bento-grid" style={{ alignContent: 'start' }}>
                    
                    <div className="bento-col-12">
                        <div className="bento-card" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { path: '/tasks', name: 'My Tasks', icon: ListTodo, color: '#3b82f6' },
                                    { path: '/my-leaves', name: 'Apply Leave', icon: Calendar, color: '#8b5cf6' },
                                    { path: '/my-attendance', name: 'Mark Attendance', icon: Fingerprint, color: '#10b981' },
                                    { path: '/my-salary', name: 'Salary Slips', icon: FileText, color: '#f59e0b' }
                                ].map((link, idx) => (
                                    <NavLink to={link.path} key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', textDecoration: 'none', color: '#0f172a', fontWeight: 500, fontSize: '13px', transition: 'all 0.2s' }} className="quick-action-link">
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                            <link.icon size={14} />
                                        </div>
                                        {link.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-12">
                        <div className="bento-card chart-card" style={{ height: '340px' }}>
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><Clock size={16} /> My Attendance</h3>
                            </div>
                            <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 10px 20px 10px' }}>
                                {myAttendanceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={myAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={20}>
                                                {myAttendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No attendance data</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx="true">{`
                .quick-action-link:hover {
                    background: #fff !important;
                    border-color: #e2e8f0 !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
                }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
