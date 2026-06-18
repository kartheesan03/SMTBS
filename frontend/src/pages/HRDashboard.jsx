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
            <div className="flex-center" style={{ minHeight: '100vh', background: '#f8fafc' }}>
                <div className="loader"></div>
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
        <div className="main-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>HR Overview</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Human Resources & Analytics Dashboard</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Live Data
                    </span>
                </div>
            </div>

            {/* ===== ROW 1: KPI Cards (3 per row) ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="dashboard-card-3d kpi-card-3d" style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', padding: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{kpi.title}</div>
                            <div className="kpi-icon-3d" style={{ width: '32px', height: '32px', borderRadius: '10px', background: `linear-gradient(135deg, ${kpi.color}22, ${kpi.color}10)`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={16} strokeWidth={2.5} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1 }}>{kpi.value}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600, color: (kpi.trendType === 'down' && kpi.title !== 'Pending Approvals' && kpi.title !== 'On Leave') ? '#ef4444' : '#10b981' }}>
                            {kpi.trendType === 'up' ? <ArrowUpRight size={12} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={12} style={{ marginRight: '4px' }}/>}
                            {kpi.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== ROW 2: Employee Distribution (4fr) + Dept Headcount (5fr) + Right Panel (3fr) ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '4fr 5fr 3fr', gap: '16px', marginBottom: '16px' }}>

                {/* Employee Distribution */}
                <div className="dashboard-card-3d" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><PieChartIcon size={16} /> Employee Distribution</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                        {employeeDistributionData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1, minHeight: '160px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                            <Pie
                                                data={employeeDistributionData}
                                                cx="50%" cy="50%"
                                                innerRadius={50} outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value" stroke="none"
                                            >
                                                {employeeDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalEmployees}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', flexShrink: 0 }}>
                                    {employeeDistributionData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</div>
                        )}
                    </div>
                </div>

                {/* Department Headcount */}
                <div className="dashboard-card-3d" style={{ borderRadius: '14px', display: 'flex', flexDirection: 'column', minHeight: '260px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 18px', height: '48px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}><Users size={16} /> Department Headcount</h3>
                    </div>
                    <div style={{ flex: 1, padding: '0 24px 24px 24px', overflow: 'hidden' }}>
                        {departmentHeadcountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentHeadcountData} margin={{ top: 5, right: 5, left: -20, bottom: 25 }} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} interval={0} angle={-25} textAnchor="end" />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {departmentHeadcountData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No data</div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Birthdays + Activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Upcoming Birthdays */}
                    <div className="dashboard-card-3d" style={{ borderRadius: '14px', padding: '18px', overflow: 'hidden' }}>
                        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><Cake size={14} /> Upcoming Birthdays</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingBirthdays.length > 0 ? upcomingBirthdays.map((bday, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                        <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1 }}>{bday.date.split(' ')[0]}</span>
                                        <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 800, lineHeight: 1 }}>{bday.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{bday.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{bday.dept}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No upcoming birthdays</div>
                            )}
                        </div>
                    </div>

                    {/* Recent HR Activity */}
                    <div className="dashboard-card-3d" style={{ borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', minHeight: '120px', flex: 1, overflow: 'hidden' }}>
                        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}><Activity size={14} /> Recent HR Activity</h3>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {recentActivities.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {recentActivities.slice(0, 5).map((act, i) => (
                                        <div key={act.id || i} style={{ display: 'flex', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <Activity size={12} />
                                            </div>
                                            <div style={{ flex: 1, paddingBottom: i < recentActivities.slice(0, 5).length - 1 ? '14px' : '0', borderBottom: i < recentActivities.slice(0, 5).length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.description}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', fontWeight: 500 }}>{formatTime(act.time)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>No activity</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== ROW 3: Pending Leave Requests (Full Width) ===== */}
            <div className="dashboard-card-3d" style={{ borderRadius: '14px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Pending Leave Requests</h3>
                </div>
                <div>
                    {leavesData.filter(l => l.status === 'Pending').length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                                    <th style={{ paddingBottom: '10px', fontWeight: 600 }}>Employee</th>
                                    <th style={{ paddingBottom: '10px', fontWeight: 600 }}>Type</th>
                                    <th style={{ paddingBottom: '10px', fontWeight: 600 }}>Duration</th>
                                    <th style={{ paddingBottom: '10px', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leavesData.filter(l => l.status === 'Pending').slice(0, 5).map((l, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '12px 0', fontWeight: 500, color: '#0f172a' }}>{l.employeeName || 'Unknown'}</td>
                                        <td style={{ padding: '12px 0', color: '#475569' }}>{l.leaveType}</td>
                                        <td style={{ padding: '12px 0', color: '#475569' }}>{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '12px 0' }}>
                                            <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#fef3c7', color: '#d97706', fontSize: '11px', fontWeight: 600 }}>{l.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>No pending leave requests</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
