import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    CalendarCheck, Clock, CheckCircle, FileText, 
    Download, Bell, Calendar, Briefcase, ExternalLink, Activity
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const EmployeeDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load employee stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !dashboardData) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const employeeStats = dashboardData.employeeStats || {};

    // Mock data for employee specifically
    const weeklyAttendance = [
        { name: 'Mon', hours: 8.5 },
        { name: 'Tue', hours: 8.0 },
        { name: 'Wed', hours: 9.2 },
        { name: 'Thu', hours: 7.5 },
        { name: 'Fri', hours: 8.1 },
    ];

    const myTasks = [
        { id: 1, title: 'Update homepage banner', project: 'Website Redesign', due: 'Today', priority: 'High', status: 'In Progress' },
        { id: 2, title: 'Client presentation deck', project: 'Acme Corp Pitch', due: 'Tomorrow', priority: 'Medium', status: 'Pending' },
        { id: 3, title: 'Submit weekly report', project: 'Internal', due: 'Friday', priority: 'Low', status: 'Pending' }
    ];

    const upcomingEvents = [
        { id: 1, title: 'Team Standup', time: '10:00 AM', type: 'Meeting' },
        { id: 2, title: '1-on-1 with Manager', time: '2:30 PM', type: 'Review' },
        { id: 3, title: 'Townhall', time: 'Tomorrow 3:00 PM', type: 'Company' }
    ];

    const notifications = [
        { id: 1, text: 'Leave request approved', time: '2 hours ago', icon: <FileText size={16} /> },
        { id: 2, text: 'Salary credited for May', time: 'Yesterday', icon: <DollarSign size={16} /> },
        { id: 3, text: 'New task assigned by John', time: '2 days ago', icon: <CheckCircle size={16} /> }
    ];

    // Dummy lucide icons for notifications where DollarSign is missing, I'll use Activity
    const getIcon = (id) => {
        if(id === 1) return <FileText size={16} className="text-success" />;
        if(id === 2) return <Activity size={16} className="text-primary" />;
        return <CheckCircle size={16} className="text-warning" />;
    };

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Employee Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Welcome back, {user?.name || 'Employee'}. Here is your workspace summary.</p>
            </div>

            {/* Top KPI Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Attendance Status</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--success)' }}>
                                {employeeStats.attendanceToday ? 'Present' : 'Not Logged In'}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <CalendarCheck size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Pending Tasks</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                3
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Assigned Projects</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                2
                            </h2>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Briefcase size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Leave Balance</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                14 <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>days</span>
                            </h2>
                        </div>
                        <div style={{ background: 'var(--warning-light)', padding: '10px', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-4" style={{ background: '#f8fafc', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
                    <div style={{ background: 'var(--primary)', color: '#fff', padding: '16px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
                        <Download size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Salary Slip</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Download May 2026 Payslip</p>
                    </div>
                    <button className="btn-secondary" style={{ marginTop: '8px', padding: '6px 16px', fontSize: '12px' }}>Download PDF</button>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header" style={{ marginBottom: '12px' }}>
                        <div className="bento-card-title" style={{ fontSize: '14px' }}>
                            <Bell size={16} className="text-primary" />
                            Recent Notifications
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {notifications.map(n => (
                            <div key={n.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                                    {getIcon(n.id)}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{n.text}</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{n.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header" style={{ marginBottom: '12px' }}>
                        <div className="bento-card-title" style={{ fontSize: '14px' }}>
                            <ExternalLink size={16} className="text-primary" />
                            Quick Links
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: '0.2s' }} className="hover-shadow">Apply for Leave</div>
                        <div style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: '0.2s' }} className="hover-shadow">Company Policies</div>
                        <div style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: '0.2s' }} className="hover-shadow">IT Support Ticket</div>
                    </div>
                </div>
            </div>

            {/* Charts & Schedule Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Activity size={18} className="text-primary" />
                            My Attendance Log (This Week)
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Avg 8.2 hrs/day</span>
                    </div>
                    <div className="bento-card-body" style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                    formatter={(val) => [`${val} hours`, 'Logged']}
                                />
                                <Bar dataKey="hours" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header" style={{ marginBottom: '16px' }}>
                        <div className="bento-card-title">
                            <Calendar size={18} className="text-primary" />
                            Upcoming Events
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingEvents.map((event, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '4px', height: '36px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>{event.title}</h4>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{event.time}</span>
                                    </div>
                                    <span style={{ fontSize: '10px', background: '#e0e7ff', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{event.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="bento-col-12" style={{ marginTop: '20px' }}>
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title">
                                <CheckCircle size={18} className="text-primary" />
                                My Tasks
                            </div>
                        </div>
                        <div className="bento-card-body">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Task Name</th>
                                            <th>Project</th>
                                            <th>Due Date</th>
                                            <th>Priority</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myTasks.map(task => (
                                            <tr key={task.id}>
                                                <td style={{ fontWeight: 500 }}>{task.title}</td>
                                                <td>{task.project}</td>
                                                <td>{task.due}</td>
                                                <td>
                                                    <span className={`status-badge ${task.priority === 'High' ? 'low' : task.priority === 'Medium' ? 'pending' : 'new'}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${task.status === 'In Progress' ? 'new' : 'low'}`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx="true">{`
                .hover-shadow:hover {
                    box-shadow: var(--shadow-sm);
                    border-color: var(--primary-100);
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
