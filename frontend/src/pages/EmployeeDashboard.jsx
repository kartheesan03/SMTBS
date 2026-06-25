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
import AttendanceWidget from '../components/Dashboard/AttendanceWidget';

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
        <div className="unified-dashboard">
            {/* Header Row */}
            <div className="dashboard-header-row">
                <div className="welcome-area">
                    <div className="welcome-text-block">
                        <h1>Welcome to Employee Workspace</h1>
                        <p className="subtitle">
                            <span className="role-text">{user?.department || 'Employee'}</span>
                            <span className="dot-sep">&bull;</span>
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    </div>
                    
                    <div className="welcome-stats">
                        <div className="stat-pill blue">
                            <div className="stat-pill-header">
                                <ListTodo size={16} /> Pending Tasks
                            </div>
                            <div className="stat-big-val">{pendingTasks}</div>
                            <div className="stat-desc">To be completed</div>
                        </div>
                        <div className="stat-pill green">
                            <div className="stat-pill-header">
                                <Fingerprint size={16} /> Attendance
                            </div>
                            <div className="stat-big-val" style={{ fontSize: '18px' }}>{attendanceStatus}</div>
                            <div className="stat-desc">Status Today</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <AttendanceWidget />
                </div>

                <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', flex: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>Quick Actions</h3>
                        <div className="action-buttons">
                            <NavLink to="/my-tasks" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn blue">
                                    <div className="qa-icon"><ListTodo size={18} /></div>
                                    <span>My Tasks</span>
                                </div>
                            </NavLink>
                            <NavLink to="/leave-management" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn orange">
                                    <div className="qa-icon"><Calendar size={18} /></div>
                                    <span>Apply Leave</span>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Center - Workflow integration */}
            <div className="action-center-row">
                <h3 className="section-title">My Action Center</h3>
                <div className="action-cards">
                    <NavLink to="/my-tasks" style={{ textDecoration: 'none' }}>
                        <div className="action-card ac-blue">
                            <div className="ac-icon"><Briefcase size={24} /></div>
                            <div className="ac-info">
                                <h4>{assignedProjects} Total Tasks</h4>
                                <p>Assigned to you</p>
                            </div>
                        </div>
                    </NavLink>
                    <NavLink to="/leave-management" style={{ textDecoration: 'none' }}>
                        <div className="action-card ac-orange">
                            <div className="ac-icon"><Calendar size={24} /></div>
                            <div className="ac-info">
                                <h4>{leaveBalance} Pending Leaves</h4>
                                <p>Awaiting manager approval</p>
                            </div>
                        </div>
                    </NavLink>
                    <div className="action-card ac-red">
                        <div className="ac-icon"><Bell size={24} /></div>
                        <div className="ac-info">
                            <h4>{unreadNotifications} Notifications</h4>
                            <p>Unread alerts & messages</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards-row">
                <div className="summary-card card-blue">
                    <h3 className="sc-header-center">Attendance Summary</h3>
                    <div className="donut-chart-container">
                        <Clock size={64} style={{ color: '#3b82f6', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{presentCount}</div>
                            <div className="donut-label">Days Present This Month</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Leave Status</h3>
                    <div className="donut-chart-container">
                        <Calendar size={64} style={{ color: '#f59e0b', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{leaveCount}</div>
                            <div className="donut-label">Days on Leave</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-green">
                    <h3 className="sc-header-center">Salary Status</h3>
                    <div className="donut-chart-container">
                        <FileText size={64} style={{ color: '#10b981', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total" style={{ fontSize: '24px' }}>{salarySlip}</div>
                            <div className="donut-label">{currentMonth} Salary</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">Recent Tasks</h3>
                    <div className="activity-list" style={{ marginTop: '16px' }}>
                        {myTasks.length > 0 ? myTasks.slice(0, 3).map((task, i) => (
                            <div key={i} className="activity-item">
                                <div className="act-icon purple"><ListTodo size={16} /></div>
                                <div className="act-content">
                                    <h4>{task.title}</h4>
                                    <span>Due: {task.due}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="activity-item">
                                <div className="act-content"><span>No recent tasks</span></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default EmployeeDashboard;
