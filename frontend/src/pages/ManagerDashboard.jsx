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
        <div className="main-content">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Manager Overview</h1>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Team & Project Command Center</p>
                </div>
                <div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Live Data
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
                                <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1 }}>{kpi.value}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 600, color: (kpi.trendType === 'down' && kpi.title !== 'Pending Approvals') ? '#ef4444' : '#10b981' }}>
                                    {kpi.trendType === 'up' ? <ArrowUpRight size={14} style={{ marginRight: '4px' }}/> : <ArrowDownRight size={14} style={{ marginRight: '4px' }}/>}
                                    {kpi.trend}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Middle Section: Charts */}
                    <div className="bento-col-8">
                        <div className="bento-card chart-card">
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><Activity size={16} /> Team Performance</h3>
                            </div>
                            <div className="bento-card-body">
                                {teamPerformanceData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={teamPerformanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                                            <Line type="monotone" dataKey="completed" name="Completed Tasks" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="pending" name="Pending Tasks" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No Records Found</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bento-col-4">
                        <div className="bento-card chart-card">
                            <div className="bento-card-header">
                                <h3 className="bento-card-title"><Users size={16} /> Team Attendance</h3>
                            </div>
                            <div className="bento-card-body" style={{ position: 'relative' }}>
                                {teamAttendanceData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie data={teamAttendanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                                                    {teamAttendanceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip 
                                                    formatter={(value, name) => {
                                                        const pct = totalAttendanceEmployees > 0 ? ((value / totalAttendanceEmployees) * 100) : 0;
                                                        // Format to 1 decimal place max, removing trailing zeros
                                                        const formattedPct = Number(pct.toFixed(1));
                                                        return [`${value} (${formattedPct}%)`, name];
                                                    }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalAttendanceEmployees}</div>
                                            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Total Employees</div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                                            {teamAttendanceData.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                                    {item.name}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No Records Found</div>
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
                                    { path: '/tasks', name: 'Task Management', icon: ListTodo, color: '#3b82f6' },
                                    { path: '/projects', name: 'Project Boards', icon: FolderGit2, color: '#8b5cf6' },
                                    { path: '/team', name: 'Team Directory', icon: Users, color: '#10b981' },
                                    { path: '/approvals', name: 'Pending Approvals', icon: CheckCircle, color: '#ef4444' }
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
                        <div className="bento-card" style={{ height: '380px', padding: '16px' }}>
                            <div className="bento-card-header" style={{ marginBottom: '16px', paddingBottom: '0', borderBottom: 'none' }}>
                                <h3 className="bento-card-title" style={{ fontSize: '13px', color: '#64748b' }}><Briefcase size={14} /> Project Status</h3>
                            </div>
                            <div className="bento-card-body" style={{ overflowY: 'auto' }}>
                                {projectStatusData.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {projectStatusData.map(proj => (
                                            <div key={proj.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{proj.name}</span>
                                                    <span style={{ 
                                                        fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                                                        background: proj.status === 'Completed' ? '#ecfdf5' : proj.status === 'At Risk' ? '#fee2e2' : '#eff6ff',
                                                        color: proj.status === 'Completed' ? '#059669' : proj.status === 'At Risk' ? '#ef4444' : '#3b82f6'
                                                    }}>{proj.status}</span>
                                                </div>
                                                <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        height: '100%', width: `${proj.progress}%`, borderRadius: '3px',
                                                        background: proj.status === 'Completed' ? '#10b981' : proj.status === 'At Risk' ? '#ef4444' : '#3b82f6'
                                                    }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-center" style={{ height: '100%', color: '#94a3b8', fontSize: '13px' }}>No Records Found</div>
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

export default ManagerDashboard;
