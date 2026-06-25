import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { NavLink } from 'react-router-dom';
import { 
    Users, UserCheck, Calendar, DollarSign, 
    FileText, Activity, AlertCircle, Briefcase,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock,
    Cake, PieChart as PieChartIcon
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
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
        <div className="module-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>HR Overview</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Human Resources & Analytics Dashboard</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 0 2px var(--primary-light)' }}></span> Live Data System
                    </span>
                </div>
            </div>

            {/* ===== ROW 1: KPI Cards (3 per row) ===== */}
            <div className="responsive-grid-3">
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="dashboard-card-3d" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
                            <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05)`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>{kpi.value}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: (kpi.trendType === 'down' && kpi.title !== 'Pending Approvals' && kpi.title !== 'On Leave') ? 'var(--danger)' : 'var(--success)' }}>
                                {kpi.trendType === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                                {kpi.trend} <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>vs last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== ROW 2: Employee Distribution (4fr) + Dept Headcount (5fr) + Right Panel (3fr) ===== */}
            <div className="responsive-grid-4-5-3">

                {/* Employee Distribution */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><PieChartIcon size={18} /> Employee Distribution</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {employeeDistributionData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1, minHeight: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={employeeDistributionData}
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={85}
                                                paddingAngle={2}
                                                dataKey="value" stroke="none"
                                            >
                                                {employeeDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalEmployees}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Total</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', paddingTop: '16px', flexShrink: 0 }}>
                                    {employeeDistributionData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color, flexShrink: 0 }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Department Headcount */}
                <div className="dashboard-card-3d" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Department Headcount</h3>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', marginLeft: '-24px' }}>
                        {departmentHeadcountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentHeadcountData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600 }} interval={0} angle={-25} textAnchor="end" dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)', fontWeight: 600 }} />
                                    <RechartsTooltip cursor={{fill: 'var(--bg-hover)'}} contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {departmentHeadcountData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No data available</div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Birthdays + Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Upcoming Birthdays */}
                    <div className="dashboard-card-3d" style={{ padding: '24px', overflow: 'hidden' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Cake size={18} /> Upcoming Birthdays</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((bday, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                                        <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>{bday.date.split(' ')[0]}</span>
                                        <span style={{ fontSize: '14px', color: 'var(--text-heading)', fontWeight: 800, lineHeight: 1, marginTop: '2px' }}>{bday.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)' }}>{bday.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bday.dept}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontWeight: 500 }}>No upcoming birthdays</div>
                            )}
                        </div>
                    </div>

                    {/* Recent HR Activity */}
                    <div className="dashboard-card-3d" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '120px', flex: 1, overflow: 'hidden' }}>
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Recent Activity</h3>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {recentActivities.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {recentActivities.slice(0, 5).map((act, i) => (
                                        <div key={act.id || i} style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Activity size={14} />
                                            </div>
                                            <div style={{ flex: 1, paddingBottom: i < recentActivities.slice(0, 5).length - 1 ? '16px' : '0', borderBottom: i < recentActivities.slice(0, 5).length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.description}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{formatTime(act.time)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No activity</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== ROW 3: Pending Leave Requests (Full Width) ===== */}
            <div className="dashboard-card-3d" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> Pending Leave Requests</h3>
                </div>
                <div className="table-responsive">
                    {leavesData.filter(l => l.status === 'Pending').length > 0 ? (
                        <table className="enterprise-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Duration</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leavesData.filter(l => l.status === 'Pending').slice(0, 5).map((l, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{l.employeeName || 'Unknown'}</td>
                                        <td>{l.leaveType}</td>
                                        <td>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: '11px', fontWeight: 600 }}>{l.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No pending leave requests</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
