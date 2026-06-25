import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
import { 
    Users, Briefcase, FileText, CheckCircle, 
    Activity, DollarSign, ListTodo, TrendingUp, TrendingDown,
    Search, Bell, ChevronDown, Clock, Calendar, ArrowUpRight, ArrowDownRight, FolderGit2
} from 'lucide-react';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const ManagerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [ordersData, setOrdersData] = useState([]);
    const [employeesData, setEmployeesData] = useState([]);
    const [tasksData, setTasksData] = useState([]);
    const [attendanceData, setAttendanceData] = useState(null);

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

    const completedTasks = completedTasksCount;
    const totalTasks = completedTasksCount + pendingTasksCount;
    const teamProductivity = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
    
    const departmentRevenue = ordersData
        .filter(o => o.status === 'Delivered' || o.status === 'Paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const daysMap = { 'Mon': { completed: 0, pending: 0 }, 'Tue': { completed: 0, pending: 0 }, 'Wed': { completed: 0, pending: 0 }, 'Thu': { completed: 0, pending: 0 }, 'Fri': { completed: 0, pending: 0 }, 'Sat': { completed: 0, pending: 0 }, 'Sun': { completed: 0, pending: 0 } };
    
    tasksData.forEach(task => {
        if (!task.createdAt) return;
        const d = new Date(task.createdAt);
        const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
        if (daysMap[dayStr]) {
            if (task.status === 'Completed' || task.status === 'Done') {
                daysMap[dayStr].completed++;
            } else {
                daysMap[dayStr].pending++;
            }
        }
    });

    const teamPerformanceData = Object.keys(daysMap)
        .map(key => ({
            name: key,
            completed: daysMap[key].completed,
            pending: daysMap[key].pending
        }))
        .filter(d => d.completed > 0 || d.pending > 0);

    const presentCount = attendanceData?.presentToday || 0;
    const leaveCount = attendanceData?.onLeaveToday || 0;
    const absentCount = attendanceData?.absentToday || 0;
    const totalAttendanceEmployees = presentCount + leaveCount + absentCount;

    const teamAttendanceData = [
        { name: 'Present', value: presentCount, color: '#10b981' },
        { name: 'On Leave', value: leaveCount, color: '#f59e0b' },
        { name: 'Absent', value: absentCount, color: '#ef4444' }
    ];

    const projectStatusData = ordersData
        .filter(o => o.status && o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled')
        .slice(0, 5)
        .map(o => ({
            id: o._id,
            name: o.description || `Project ${o.orderNumber || ''}`,
            progress: o.status === 'In Progress' ? 50 : (o.status === 'Approved' ? 25 : 10),
            status: o.status
        }));

    const kpiCards = [
        { title: 'Team Members', value: teamMembers, icon: Users, color: '#3b82f6', trend: '+2', trendType: 'up' },
        { title: 'Active Projects', value: activeProjects, icon: Briefcase, color: '#8b5cf6', trend: '+1', trendType: 'up' },
        { title: 'Pending Approvals', value: pendingApprovals, icon: FileText, color: '#ef4444', trend: '-2', trendType: 'down' },
        { title: 'Completed Tasks', value: completedTasks, icon: CheckCircle, color: '#10b981', trend: '+15%', trendType: 'up' },
        { title: 'Team Productivity', value: `${teamProductivity}%`, icon: TrendingUp, color: '#f59e0b', trend: '+5%', trendType: 'up' },
        { title: 'Dept Revenue', value: `$${departmentRevenue.toLocaleString()}`, icon: DollarSign, color: '#10b981', trend: '+12%', trendType: 'up' },
    ];

    return (
        <div className="unified-dashboard">
            {/* Header Row */}
            <div className="dashboard-header-row">
                <div className="welcome-area">
                    <div className="welcome-text-block">
                        <h1>Welcome to Manager Dashboard</h1>
                        <p className="subtitle">
                            <span className="role-text">Management</span>
                            <span className="dot-sep">&bull;</span>
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    </div>
                    
                    <div className="welcome-stats">
                        <div className="stat-pill blue">
                            <div className="stat-pill-header">
                                <Users size={16} /> Team Members
                            </div>
                            <div className="stat-big-val">{teamMembers}</div>
                            <div className="stat-desc">Direct Reports</div>
                        </div>
                        <div className="stat-pill green">
                            <div className="stat-pill-header">
                                <CheckCircle size={16} /> Productivity
                            </div>
                            <div className="stat-big-val">{teamProductivity}%</div>
                            <div className="stat-desc">Tasks Completed</div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', flex: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>Quick Actions</h3>
                        <div className="action-buttons">
                            <NavLink to="/my-tasks" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn blue">
                                    <div className="qa-icon"><ListTodo size={18} /></div>
                                    <span>Assign Task</span>
                                </div>
                            </NavLink>
                            <NavLink to="/erp" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn purple">
                                    <div className="qa-icon"><FolderGit2 size={18} /></div>
                                    <span>Manage Projects</span>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Center - Workflow integration */}
            <div className="action-center-row">
                <h3 className="section-title">Team Action Center</h3>
                <div className="action-cards">
                    <div className="action-card ac-red">
                        <div className="ac-icon"><FileText size={24} /></div>
                        <div className="ac-info">
                            <h4>{pendingApprovals} Pending Approvals</h4>
                            <p>Awaiting your sign-off</p>
                        </div>
                    </div>
                    <div className="action-card ac-blue">
                        <div className="ac-icon"><Briefcase size={24} /></div>
                        <div className="ac-info">
                            <h4>{activeProjects} Active Projects</h4>
                            <p>Currently in progress</p>
                        </div>
                    </div>
                    <div className="action-card ac-green">
                        <div className="ac-icon"><CheckCircle size={24} /></div>
                        <div className="ac-info">
                            <h4>{completedTasks} Tasks Done</h4>
                            <p>Team completed tasks</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards-row">
                <div className="summary-card card-blue">
                    <h3 className="sc-header-center">Team Attendance</h3>
                    <div className="donut-chart-container">
                        <Users size={64} style={{ color: '#3b82f6', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{presentCount}</div>
                            <div className="donut-label">Present Today</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Project Status</h3>
                    <div className="donut-chart-container">
                        <FolderGit2 size={64} style={{ color: '#f59e0b', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{projectStatusData.length}</div>
                            <div className="donut-label">Projects In Pipeline</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-green">
                    <h3 className="sc-header-center">Department Revenue</h3>
                    <div className="donut-chart-container">
                        <DollarSign size={64} style={{ color: '#10b981', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">${(departmentRevenue / 1000).toFixed(1)}k</div>
                            <div className="donut-label">Generated Revenue</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">Recent Projects</h3>
                    <div className="activity-list" style={{ marginTop: '16px' }}>
                        {projectStatusData.length > 0 ? projectStatusData.slice(0, 3).map((proj, i) => (
                            <div key={i} className="activity-item">
                                <div className="act-icon purple"><Activity size={16} /></div>
                                <div className="act-content">
                                    <h4>{proj.name}</h4>
                                    <span>Status: {proj.status}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="activity-item">
                                <div className="act-content"><span>No recent projects</span></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default ManagerDashboard;
