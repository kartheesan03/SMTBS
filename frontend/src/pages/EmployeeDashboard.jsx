import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    Calendar, CheckCircle, Clock, Briefcase, 
    FileText, Bell, Search, ChevronDown, ListTodo, ArrowUpRight, ArrowDownRight, Fingerprint
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [tasksData, setTasksData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [attendancesData, setAttendancesData] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);
    const [notificationsData, setNotificationsData] = useState([]);
    const [attStatusData, setAttStatusData] = useState(null);
    const [attHistoryData, setAttHistoryData] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, taskRes, ordRes, attRes, levRes, salRes, notifRes, attStatusRes, attHistoryRes] = await Promise.all([
                API.get('/dashboard/stats').catch(() => ({ data: {} })),
                API.get('/tasks/my').catch(() => API.get('/tasks').catch(() => ({ data: [] }))),
                API.get('/orders').catch(() => ({ data: [] })),
                API.get('/attendances').catch(() => ({ data: [] })),
                API.get('/leaves').catch(() => ({ data: [] })),
                API.get('/salaries').catch(() => ({ data: [] })),
                API.get('/notifications').catch(() => ({ data: [] })),
                API.get('/attendance/status').catch(() => ({ data: null })),
                API.get('/attendance/my-history').catch(() => ({ data: [] }))
            ]);
            setDashboardData(dashRes.data || {});
            setTasksData(taskRes.data || []);
            setOrdersData(ordRes.data || []);
            setAttendancesData(attRes.data || []);
            setLeavesData(levRes.data || []);
            setSalariesData(salRes.data || []);
            setNotificationsData(notifRes.data || []);
            setAttStatusData(attStatusRes.data || null);
            setAttHistoryData(attHistoryRes.data || []);
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

    const parseJSON = (val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
        return [];
    };

    const myTasksList = tasksArray.map(task => {
        const completions = parseJSON(task.completions);
        const userStatus = completions.find(c => {
            const uid = c.user?._id || c.user?.id || c.user;
            return String(uid) === String(userId);
        })?.status || 'Pending';
        return { ...task, userStatus };
    });

    const myOrdersList = ordersArray.filter(o => o.employeeId === userId || o.assignedTo === userId || o.createdById === userId);
    const myAttendancesList = attendancesArray.filter(a => a.employeeId === userId || a.userId === userId);
    const myLeavesList = leavesArray.filter(l => l.employeeId === userId || l.userId === userId);
    const mySalariesList = salariesArray.filter(s => s.employeeId === userId || s.userId === userId);
    const myNotificationsList = notificationsArray.filter(n => n.userId === userId || n.employeeId === userId);

    const todayStr = new Date().toISOString().split('T')[0];
    
    const todaysLeave = myLeavesList.find(l => {
        if (!l.startDate || !l.endDate || l.status !== 'Approved') return false;
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const today = new Date();
        return today >= start && today <= end;
    });

    const parseDateTime = (timeStr, baseDateStr) => {
        if (!timeStr) return null;
        if (timeStr.includes('T') || (timeStr.includes('-') && timeStr.includes(':') && timeStr.length > 10)) {
            const d = new Date(timeStr);
            if (!isNaN(d.getTime())) return d;
        }
        const datePart = baseDateStr ? baseDateStr.split('T')[0] : new Date().toISOString().split('T')[0];
        const combined = `${datePart} ${timeStr}`;
        const d = new Date(combined);
        if (!isNaN(d.getTime())) return d;
        
        const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
        if (match) {
            let [_, hours, minutes, ampm] = match;
            hours = parseInt(hours, 10);
            minutes = parseInt(minutes, 10);
            if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
            const d = new Date(datePart);
            d.setHours(hours, minutes, 0, 0);
            return d;
        }
        
        const fallback = new Date(timeStr);
        return isNaN(fallback.getTime()) ? null : fallback;
    };

    let attendanceStatus = "Not Marked";
    let attendanceColor = '#64748b';
    
    if (todaysLeave) {
        attendanceStatus = "On Leave";
        attendanceColor = '#3b82f6';
    } else if (attStatusData && attStatusData.status && attStatusData.status !== 'Not Checked In' && attStatusData.status !== '-') {
        if (attStatusData.checkIn && !attStatusData.checkOut) {
            const start = parseDateTime(attStatusData.checkIn, attStatusData.date);
            const timeStr = start ? start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Checked In';
            attendanceStatus = `Checked In (${timeStr})`;
            attendanceColor = '#10b981';
        } else if (attStatusData.checkIn && attStatusData.checkOut) {
            const start = parseDateTime(attStatusData.checkIn, attStatusData.date);
            const end = parseDateTime(attStatusData.checkOut, attStatusData.date);
            if (start && end) {
                const diffHours = ((end - start) / 3600000).toFixed(1);
                attendanceStatus = `Completed (${diffHours}h)`;
            } else {
                attendanceStatus = `Completed`;
            }
            attendanceColor = '#f59e0b';
        } else {
            attendanceStatus = attStatusData.status || "Present";
            attendanceColor = '#10b981';
        }
    }
    
    const pendingTasks = myTasksList.filter(t => t.userStatus === 'Pending' || t.userStatus === 'In Progress').length;
    const assignedProjects = myTasksList.length;
    const leaveBalance = myLeavesList.filter(l => l.status === 'Pending').length;
    
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const hasSalary = mySalariesList.some(s => s.month === currentMonth && s.year === currentYear);
    const salarySlip = hasSalary ? "Generated" : "Pending";
    
    const unreadNotifications = myNotificationsList.filter(n => !n.isRead).length;

    const myAttendanceData = [];
    let presentCount = 0, absentCount = 0, leaveCount = 0, lateCount = 0;
    const currentM = new Date().getMonth();
    const currentY = new Date().getFullYear();

    attHistoryData.forEach(a => {
        if (!a.date) return;
        const d = new Date(a.date);
        if (d.getMonth() === currentM && d.getFullYear() === currentY) {
            if (a.status === 'Present' || (a.status !== 'Absent' && a.status !== 'Leave' && a.status !== 'Late' && a.checkIn)) presentCount++;
            else if (a.status === 'Absent') absentCount++;
            else if (a.status === 'Leave') leaveCount++;
            else if (a.status === 'Late') lateCount++;
        }
    });

    if (presentCount > 0) myAttendanceData.push({ name: 'Present', value: presentCount, fill: '#10b981' });
    if (leaveCount > 0) myAttendanceData.push({ name: 'Leave', value: leaveCount, fill: '#3b82f6' });
    if (absentCount > 0) myAttendanceData.push({ name: 'Absent', value: absentCount, fill: '#ef4444' });
    if (lateCount > 0) myAttendanceData.push({ name: 'Late', value: lateCount, fill: '#f59e0b' });

    const myTasks = myTasksList
        .filter(t => t.userStatus !== 'Completed' && t.userStatus !== 'Done')
        .slice(0, 5)
        .map((t, index) => ({
            id: t._id || t.id || index,
            title: t.title || t.description || 'Task',
            priority: t.priority || 'Medium',
            status: t.userStatus || 'Pending',
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
        <div className="module-container">
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
                            <div className="dashboard-card-3d kpi-card-3d" style={{ position: 'relative', overflow: 'hidden' }}>
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
                        <div className="dashboard-card-3d">
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><ListTodo size={16} /> My Tasks</h3>
                            </div>
                            <div className="bento-card-body">
                                {myTasks.length > 0 ? (
                                    <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
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
                        <div className="dashboard-card-3d" style={{ padding: '16px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {[
                                    { path: '/my-tasks', name: 'My Tasks', icon: ListTodo, color: '#3b82f6' },
                                    { path: '/leave-management', name: 'Apply Leave', icon: Calendar, color: '#8b5cf6' },
                                    { path: '/my-attendance', name: 'Mark Attendance', icon: Fingerprint, color: '#10b981' },
                                    { path: '/my-salary', name: 'Salary Slips', icon: FileText, color: '#f59e0b' }
                                ].map((link, idx) => (
                                    <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', cursor: 'pointer', color: '#0f172a', fontWeight: 500, fontSize: '13px', transition: 'all 0.2s' }} className="quick-action-link quick-action-3d">
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                                            <link.icon size={14} />
                                        </div>
                                        {link.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-12">
                        <div className="dashboard-card-3d chart-card-3d" style={{ height: '340px' }}>
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><Clock size={16} /> My Attendance</h3>
                            </div>
                            <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 10px 20px 10px' }}>
                                {myAttendanceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                            <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                            <Pie
                                                data={myAttendanceData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                labelLine={false}
                                            >
                                                {myAttendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No attendance data available</div>
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
