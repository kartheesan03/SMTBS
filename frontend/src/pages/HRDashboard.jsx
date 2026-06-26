import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
import { 
    Users, UserCheck, Calendar, DollarSign, 
    FileText, Activity, AlertCircle, Briefcase,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock,
    Cake, PieChart as PieChartIcon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import AttendanceWidget from '../components/Dashboard/AttendanceWidget';
import SkeletonLoader from '../components/SkeletonLoader';

const HRDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, empRes, usersRes, leavesRes, salariesRes, attSummaryRes] = await Promise.all([
                API.get('/dashboard/stats').catch(e => ({ data: {} })),
                API.get('/employees').catch(e => ({ data: [] })),
                API.get('/auth/users').catch(e => ({ data: [] })),
                API.get('/leaves').catch(e => ({ data: [] })),
                API.get('/salaries').catch(e => ({ data: [] })),
                API.get('/attendance/monthly-summary').catch(e => ({ data: [] }))
            ]);
            setDashboardData(statsRes.data || {});
            setEmployees(empRes.data || []);
            setUsers(usersRes.data || []);
            setLeavesData(leavesRes.data || []);
            setSalariesData(salariesRes.data || []);
            setAttendanceSummary(attSummaryRes.data || []);
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
            <div style={{ padding: '24px', background: 'var(--bg-body)', minHeight: '100vh' }}>
                <SkeletonLoader type="dashboard" />
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const hrStats = dashboard.hrStats || {};

    const uniqueEmployees = Array.from(new Map(employees.map(e => [e.employeeId || e._id || Math.random(), e])).values());

    const totalEmployees = uniqueEmployees.length;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
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

    const departmentCounts = {};
    uniqueEmployees.forEach(emp => {
        const dept = emp.department || 'Employee';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

    const rawDistributionData = Object.keys(departmentCounts).map((dept, index) => ({
        name: dept,
        value: departmentCounts[dept],
        color: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    const employeeDistributionData = [];
    let othersCount = 0;
    rawDistributionData.forEach((item, index) => {
        if (index < 4) {
            employeeDistributionData.push(item);
        } else {
            othersCount += item.value;
        }
    });
    if (othersCount > 0) {
        employeeDistributionData.push({
            name: 'Others',
            value: othersCount,
            color: '#cbd5e1'
        });
    }

    const roleLabels = {
        'admin': 'Admin',
        'super admin': 'Admin',
        'hr': 'HR',
        'manager': 'Manager',
        'sales': 'Sales',
        'employee': 'Employee'
    };

    const roleCounts = {};
    uniqueEmployees.forEach(emp => {
        let roleStr = emp.department ? emp.department.toLowerCase().trim() : 'employee';
        if (roleStr.includes('hr')) roleStr = 'hr';
        else if (roleStr.includes('sales')) roleStr = 'sales';
        else if (roleStr.includes('admin')) roleStr = 'admin';
        else if (roleStr.includes('manager')) roleStr = 'manager';

        const label = roleLabels[roleStr] || `${emp.department || 'Employee'}`;
        roleCounts[label] = (roleCounts[label] || 0) + 1;
    });

    const departmentHeadcountData = Object.keys(roleCounts).map((roleLabel, index) => ({
        name: roleLabel,
        count: roleCounts[roleLabel],
        fill: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.count - a.count);

    const absentToday = dashboard.hrStats?.absentToday || 0;

    const attendanceOverviewData = totalEmployees > 0 ? [
        { name: 'Present', value: presentToday, color: '#10b981' },
        { name: 'Absent', value: absentToday, color: '#ef4444' },
        { name: 'On Leave', value: onLeave, color: '#f59e0b' },
    ].filter(item => item.value > 0) : [];

    const kpiCards = [
        { title: 'Total Employees', value: totalEmployees, icon: Users, color: '#3b82f6', trend: '+5%', trendType: 'up' },
        { title: 'Present Today', value: presentToday, icon: UserCheck, color: '#10b981', trend: '+2%', trendType: 'up' },
        { title: 'On Leave', value: onLeave, icon: Calendar, color: '#f59e0b', trend: '-1%', trendType: 'down' },
        { title: 'New Joiners', value: newJoiners, icon: Briefcase, color: '#8b5cf6', trend: '+12%', trendType: 'up' },
        { title: 'Pending Approvals', value: pendingApprovals, icon: AlertCircle, color: '#ef4444', trend: '-5%', trendType: 'down' },
        { title: 'Payroll Processed', value: `${payrollProcessed}%`, icon: DollarSign, color: '#14b8a6', trend: '+1%', trendType: 'up' },
    ];

    const upcomingBirthdays = [];

    let recentActivities = dashboard.recentActivity || [];
    if (recentActivities.length === 0 && leavesData.length > 0) {
        recentActivities = [...leavesData].reverse().slice(0, 5).map(l => ({
            id: l._id,
            title: `Leave request from ${l.employeeName || 'Employee'}`,
            description: `Status: ${l.status || 'Pending'}`,
            time: l.createdAt || new Date().toISOString()
        }));
    }

    const formatTime = (isoString) => {
        if (!isoString) return 'Recently';
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="unified-dashboard">
            {/* Header Row */}
            <div className="dashboard-header-row">
                <div className="welcome-area">
                    <div className="welcome-text-block">
                        <h1>Welcome to HR Dashboard</h1>
                        <p className="subtitle">
                            <span className="role-text">Human Resources</span>
                            <span className="dot-sep">&bull;</span>
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </p>
                    </div>
                    
                    <div className="welcome-stats">
                        <div className="stat-pill blue">
                            <div className="stat-pill-header">
                                <Users size={16} /> Total Employees
                            </div>
                            <div className="stat-big-val">{totalEmployees}</div>
                            <div className="stat-desc">Active Workforce</div>
                        </div>
                        <div className="stat-pill green">
                            <div className="stat-pill-header">
                                <UserCheck size={16} /> Present Today
                            </div>
                            <div className="stat-big-val">{presentToday}</div>
                            <div className="stat-desc">Daily Attendance</div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <AttendanceWidget />
                </div>

                <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', flex: 1, }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>HR Actions</h3>
                        <div className="header-actions">
                            <NavLink to="/add-employee" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn blue">
                                    <div className="qa-icon"><Users size={18} /></div>
                                    <span>Add Employee</span>
                                </div>
                            </NavLink>
                            <NavLink to="/payroll" style={{ textDecoration: 'none' }}>
                                <div className="qa-btn green">
                                    <div className="qa-icon"><DollarSign size={18} /></div>
                                    <span>Run Payroll</span>
                                </div>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Center - Workflow integration */}
            <div className="action-center-row">
                <h3 className="section-title">Action Center</h3>
                <div className="action-cards">
                    <NavLink to="/leave-management" style={{ textDecoration: 'none' }}>
                        <div className="action-card ac-orange">
                            <div className="ac-icon"><Calendar size={24} /></div>
                            <div className="ac-info">
                                <h4>{pendingLeaves} Leave Requests</h4>
                                <p>Awaiting HR verification</p>
                            </div>
                        </div>
                    </NavLink>
                    <NavLink to="/payroll" style={{ textDecoration: 'none' }}>
                        <div className="action-card ac-blue">
                            <div className="ac-icon"><DollarSign size={24} /></div>
                            <div className="ac-info">
                                <h4>{pendingSalaries} Payroll Approvals</h4>
                                <p>Salaries awaiting processing</p>
                            </div>
                        </div>
                    </NavLink>
                    <div className="action-card ac-green">
                        <div className="ac-icon"><UserCheck size={24} /></div>
                        <div className="ac-info">
                            <h4>{newJoiners} New Joiners</h4>
                            <p>Need onboarding verification</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards-row">
                <div className="summary-card card-blue">
                    <h3 className="sc-header-center">Workforce Health</h3>
                    <div className="donut-chart-container">
                        <PieChartIcon size={64} style={{ color: '#3b82f6', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{Math.round((presentToday / (totalEmployees || 1)) * 100) || 0}%</div>
                            <div className="donut-label">Attendance Rate</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-orange">
                    <h3 className="sc-header-center">Leave Status</h3>
                    <div className="donut-chart-container">
                        <Calendar size={64} style={{ color: '#f59e0b', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{onLeave}</div>
                            <div className="donut-label">Currently on Leave</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-green">
                    <h3 className="sc-header-center">Payroll Status</h3>
                    <div className="donut-chart-container">
                        <DollarSign size={64} style={{ color: '#10b981', opacity: 0.2, margin: '20px 0' }} />
                        <div style={{ textAlign: 'center' }}>
                            <div className="donut-total">{payrollProcessed}%</div>
                            <div className="donut-label">Processed this month</div>
                        </div>
                    </div>
                </div>
                <div className="summary-card card-purple">
                    <h3 className="sc-header-center">Recent Activity</h3>
                    <div className="activity-list" style={{ marginTop: '16px' }}>
                        {recentActivities.length > 0 ? recentActivities.slice(0, 3).map((act, i) => (
                            <div key={i} className="activity-item">
                                <div className="act-icon purple"><Activity size={16} /></div>
                                <div className="act-content">
                                    <h4>{act.title}</h4>
                                    <span>{formatTime(act.time)}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="activity-item">
                                <div className="act-content"><span>No recent activity</span></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
        </div>
    );
};

export default HRDashboard;
