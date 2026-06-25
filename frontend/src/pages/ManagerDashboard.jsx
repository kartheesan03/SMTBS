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
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Manager Overview</h1>
                    <p className="page-subtitle">Team & Project Command Center</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 2px var(--success-bg)' }}></span> Live Data System
                    </span>
                </div>
            </div>

            {/* ===== KPI ROW ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px', marginBottom: '24px' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="premium-card" style={{ position: 'relative', overflow: 'hidden', padding: '20px', display: 'flex', flexDirection: 'column', minHeight: '130px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.title}</div>
                            <div className="kpi-icon-3d" style={{ width: '36px', height: '36px', borderRadius: '8px', background: `linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05)`, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <kpi.icon size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '8px 0 6px 0', lineHeight: 1 }}>{kpi.value}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: kpi.trendType === 'down' ? 'var(--danger)' : 'var(--success)' }}>
                                {kpi.trendType === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                                {kpi.trend} <span style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>vs last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ===== ROW 2: Charts and Quick Actions ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr 3fr', gap: '24px', marginBottom: '24px' }}>
                {/* Team Performance */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Team Performance</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: '-20px' }}>
                        {teamPerformanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={teamPerformanceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 600, color: 'var(--text-main)' }} iconType="circle" />
                                    <Line type="monotone" dataKey="completed" name="Completed Tasks" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="pending" name="Pending Tasks" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No Records Found</div>
                        )}
                    </div>
                </div>

                {/* Team Attendance */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '340px', overflow: 'hidden', padding: '24px' }}>
                    <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} /> Team Attendance</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {teamAttendanceData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1, minHeight: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={teamAttendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                                {teamAttendanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip 
                                                formatter={(value, name) => {
                                                    const pct = totalAttendanceEmployees > 0 ? ((value / totalAttendanceEmployees) * 100) : 0;
                                                    const formattedPct = Number(pct.toFixed(1));
                                                    return [`${value} (${formattedPct}%)`, name];
                                                }}
                                                contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600, fontSize: '13px' }} 
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalAttendanceEmployees}</div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>Total Employees</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', flexShrink: 0 }}>
                                    {teamAttendanceData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.color }}></span>
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
                                <Users size={24} style={{ opacity: 0.5 }} />
                                <span>No Records Found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
                    
                    {/* Quick Actions */}
                    <div className="premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { path: '/tasks', name: 'Tasks', icon: ListTodo, color: '#3b82f6' },
                                { path: '/projects', name: 'Projects', icon: FolderGit2, color: '#8b5cf6' },
                                { path: '/team', name: 'Team', icon: Users, color: '#10b981' },
                                { path: '/approvals', name: 'Approvals', icon: CheckCircle, color: '#ef4444' }
                            ].map((link, idx) => (
                                <NavLink to={link.path} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-heading)', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} className="quick-action-link ui-card">
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${link.color}15`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                        <link.icon size={18} />
                                    </div>
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Project Status */}
                    <div className="premium-card" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ paddingBottom: '20px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18} /> Project Status</h3>
                        </div>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {projectStatusData.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {projectStatusData.map(proj => (
                                        <div key={proj.id} style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{proj.name}</span>
                                                <span style={{ 
                                                    fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px',
                                                    background: proj.status === 'Completed' ? 'var(--success-bg)' : proj.status === 'At Risk' ? 'var(--danger-bg)' : 'var(--primary-bg)',
                                                    color: proj.status === 'Completed' ? 'var(--success)' : proj.status === 'At Risk' ? 'var(--danger)' : 'var(--primary)'
                                                }}>{proj.status}</span>
                                            </div>
                                            <div style={{ background: 'var(--border-subtle)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    height: '100%', width: `${proj.progress}%`, borderRadius: '3px',
                                                    background: proj.status === 'Completed' ? 'var(--success)' : proj.status === 'At Risk' ? 'var(--danger)' : 'var(--primary)'
                                                }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>No Active Projects</div>
                            )}
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

export default ManagerDashboard;
