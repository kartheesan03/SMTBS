import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import API from '../api/axios';
import {
    Users, Search, Bell, Moon,
    Briefcase, Activity, FileText, CheckCircle, ListTodo, FolderGit2,
    Menu, Calendar, Clock, LogOut, Settings as SettingsIcon, User as UserIcon, UserCheck, TrendingUp, Fingerprint
} from 'lucide-react';
import {
    EmptyState, SkeletonCard,
    TopWelcomeBar, PremiumKPICard, TimelineWidget,
    QuickActionsGrid
} from '../components/AdminDashboard/DashboardWidgets';
import { SalesAreaChart, InventoryStatusDonut } from '../components/AdminDashboard/AnalyticsCharts';
import CommandCenter from '../components/CommandCenter';
import '../components/AdminDashboard/AdminDashboardPremium.css';

const EmployeeDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { unreadCount } = useContext(NotificationContext);

    const displayName = user?.name || user?.user?.name || 'Employee';
    const displayRole = user?.role || user?.user?.role || 'Staff';
    const displayEmail = user?.email || user?.user?.email || 'employee@smtbms.com';

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [myTasks, setMyTasks] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState(null);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.erp-profile-menu-container')) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Get general stats (if needed) but main focus is own data
                const [dashRes, myTasksRes, attRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/tasks/my-tasks').catch(e => ({ data: [] })),
                    API.get('/attendance/my-stats').catch(e => ({ data: null }))
                ]);
                
                setDashboardData(dashRes.data || {});
                setMyTasks(myTasksRes.data || []);
                setAttendanceStats(attRes.data);
                setError(null);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
    };

    if (loading) {
        return (
            <div className="erp-dashboard-container">
                <div className="erp-main-content">
                    <div className="erp-summary-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="erp-dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <EmptyState icon={Activity} title="Error Loading Data" message={error} />
            </div>
        );
    }

    const dashboard = dashboardData || {};
    
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

    const myAttendanceData = [
        { name: 'Present', value: presentDays, fill: '#10b981' },
        { name: 'On Leave', value: leaveDays, fill: '#f59e0b' },
        { name: 'Absent', value: absentDays, fill: '#ef4444' }
    ].filter(item => item.value > 0);

    const recentTaskData = myTasks
        .filter(t => t.status !== 'Completed' && t.status !== 'Done')
        .slice(0, 5)
        .map(t => ({
            id: t._id,
            text: `Task: ${t.title || 'Untitled'} (${t.status})`,
            time: new Date(t.dueDate || t.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: '#3b82f6'
        }));

    const todayData = {
        revenue: 'N/A', // Not highly relevant for typical employee, maybe replace with task info if needed
        orders: myTasks.length, // Total Tasks
        attendance: attendancePercentage, // Personal attendance
        alerts: pendingTasksCount // Pending tasks as alerts
    };

    const kpiCards = [
        { title: 'My Tasks', value: totalTasks, icon: ListTodo, color: '#3b82f6', trend: `${pendingTasksCount} pending`, trendType: 'up' },
        { title: 'Task Completion', value: `${taskCompletionRate}%`, icon: CheckCircle, color: '#10b981', trend: 'Great job', trendType: 'up' },
        { title: 'Attendance', value: `${attendancePercentage}%`, icon: UserCheck, color: '#f59e0b', trend: `${presentDays} days present`, trendType: 'up' },
        { title: 'Leave Balance', value: attendanceStats?.leaveBalance ?? 'N/A', icon: Calendar, color: '#8b5cf6', trend: 'Available', trendType: 'up' }
    ];

    return (
        <div className="module-container">
            {/* Actions & Title */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Employee Workspace</h1>
                    <p>Welcome back, {user?.firstName || 'User'}!</p>
                </div>
                <div className="action-buttons">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-body)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <Clock size={16} style={{ color: 'var(--primary)' }} /> 
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Core KPIs */}
            <div className="module-kpi-section" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">{kpi.title}</span>
                            <div className="kpi-icon-wrapper" style={{background: `${kpi.color}15`, color: kpi.color}}>
                                <kpi.icon size={20} />
                            </div>
                        </div>
                        <div className="kpi-value" style={{ color: kpi.isStatus ? kpi.color : 'inherit', fontSize: kpi.isStatus ? '20px' : '28px' }}>
                            {kpi.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="module-analytics-section" style={{ gridTemplateColumns: '5fr 3fr' }}>
                {/* Left Side: Tasks Table */}
                <div className="analytics-card" style={{ flex: 1 }}>
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ListTodo size={18} /> My Pending Tasks</h3>
                    </div>
                    <div style={{ padding: '0 20px 20px 20px' }}>
                        {myTasks.length > 0 ? (
                            <table className="enterprise-table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th>Task Description</th>
                                        <th>Priority</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTasks.map((task, i) => (
                                        <tr key={i}>
                                            <td><strong>{task.title}</strong></td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: task.priority === 'High' ? 'rgba(239,68,68,0.1)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
                                                    color: task.priority === 'High' ? '#EF4444' : task.priority === 'Medium' ? '#F59E0B' : '#64748B'
                                                }}>{task.priority}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{task.due}</td>
                                            <td>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: task.status === 'Completed' ? 'rgba(16,185,129,0.1)' : task.status === 'In Progress' ? 'rgba(59,130,246,0.1)' : 'rgba(100,116,139,0.1)',
                                                    color: task.status === 'Completed' ? '#10B981' : task.status === 'In Progress' ? '#3B82F6' : '#64748B'
                                                }}>{task.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>No pending tasks</div>
                        )}
                    </div>
                </div>

                {/* Right Side: Quick Actions & Attendance Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Quick Actions */}
                    <div className="analytics-card" style={{ padding: '20px' }}>
                        <div className="analytics-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { path: '/my-tasks', name: 'My Tasks', icon: ListTodo, color: '#3b82f6' },
                                { path: '/leave-management', name: 'Apply Leave', icon: Calendar, color: '#8b5cf6' },
                                { path: '/my-attendance', name: 'Mark Attendance', icon: Fingerprint, color: '#10b981' },
                                { path: '/my-salary', name: 'Salary Slips', icon: FileText, color: '#f59e0b' }
                            ].map((link, idx) => (
                                <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-heading)', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                                        <link.icon size={16} />
                                    </div>
                                    {link.name}
                                    <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendance Chart */}
                    <div className="analytics-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="analytics-header">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> My Attendance</h3>
                        </div>
                        <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {myAttendanceData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                        <Pie
                                            data={myAttendanceData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={2}
                                            stroke="none"
                                        >
                                            {myAttendanceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex-center" style={{ color: 'var(--text-muted)' }}>No attendance data available</div>
                            )}
                        </div>
                        {myAttendanceData.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
                                {myAttendanceData.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                        <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.fill }}></span>
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
