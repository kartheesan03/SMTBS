import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    CalendarCheck, Clock, CheckCircle, FileText, 
    Download, Bell, Calendar, Briefcase, ExternalLink, Activity, DollarSign
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

    const getIcon = (id) => {
        if(id === 1) return <FileText size={16} className="text-success" />;
        if(id === 2) return <DollarSign size={16} className="text-primary" />;
        return <CheckCircle size={16} className="text-warning" />;
    };

    return (
        <div className="role-dashboard-layout">
            
            {/* --- Main Content Left --- */}
            <div className="dashboard-main-content">
                <div className="header-section">
                    <h1 className="page-title">Employee Workspace</h1>
                    <p className="page-subtitle">Welcome back, {user?.name || 'Employee'}. Here is your workspace summary.</p>
                </div>

                {/* Top KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><CalendarCheck size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Attendance Status</span>
                            <h3 className="kpi-value">{employeeStats.attendanceToday ? 'Present' : 'Not Logged In'}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><CheckCircle size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Assigned Tasks</span>
                            <h3 className="kpi-value">{myTasks.length}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Briefcase size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Projects</span>
                            <h3 className="kpi-value">2</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><FileText size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Leave Balance</span>
                            <h3 className="kpi-value">12 Days</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfeff', color: '#0891b2' }}><Clock size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Logged Hours</span>
                            <h3 className="kpi-value">41.3h</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}><Activity size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Leaves</span>
                            <h3 className="kpi-value">{employeeStats.myPendingLeaves || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    
                    {/* Weekly Attendance Bar Chart */}
                    <div className="bento-card span-8">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Clock size={18} /> Weekly Hours Logged</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Payslip Summary Card */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><DollarSign size={18} /> Recent Payslip</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 600 }}>May 2023</h4>
                                <h2 style={{ margin: '0', color: '#0f172a', fontSize: '32px', fontWeight: 800 }}>$4,250</h2>
                                <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 8px', background: '#ecfdf5', color: '#10b981', fontSize: '12px', fontWeight: 700, borderRadius: '4px' }}>Paid</span>
                            </div>
                            <button style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                <Download size={16} /> Download Payslip
                            </button>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="bento-card span-12">
                        <div className="bento-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="bento-card-title"><CheckCircle size={18} /> My Active Tasks</div>
                            <span style={{ fontSize: '13px', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>View All</span>
                        </div>
                        <div className="bento-card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {myTasks.map(task => (
                                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fff' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{task.title}</h4>
                                                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14}/> {task.project}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> {task.due}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: task.priority === 'High' ? '#fef2f2' : '#eff6ff', color: task.priority === 'High' ? '#dc2626' : '#3b82f6' }}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Right Panel: Employee Features --- */}
            <div className="role-side-panel">
                <div className="side-panel-header">
                    <h3>Employee Panel</h3>
                    <span className="badge">Staff</span>
                </div>
                
                <div className="side-panel-content">
                    
                    {/* Quick Links */}
                    <div className="feature-block">
                        <h4 className="block-title">Quick Links</h4>
                        <div className="action-list">
                            <button className="action-item"><Calendar size={16} /> Apply for Leave</button>
                            <button className="action-item"><DollarSign size={16} /> Submit Expense</button>
                            <button className="action-item"><Briefcase size={16} /> Company Policies</button>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="feature-block">
                        <h4 className="block-title">Upcoming Events <Calendar size={14} className="text-primary ml-1"/></h4>
                        <div className="event-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingEvents.map(event => (
                                <div key={event.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', borderLeft: '3px solid #3b82f6' }}>
                                    <div style={{ flex: 1 }}>
                                        <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#0f172a' }}>{event.title}</h5>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                                            <span>{event.time}</span>
                                            <span>{event.type}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notifications feed */}
                    <div className="feature-block">
                        <h4 className="block-title">Recent Notifications</h4>
                        <div className="timeline">
                            {notifications.map((notif) => (
                                <div className="timeline-item" key={notif.id}>
                                    <div className="timeline-dot" style={{ borderColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                                        {/* Using pseudo element for simple dot if we want, or render icon */}
                                    </div>
                                    <div className="timeline-content">
                                        <p>{notif.text}</p>
                                        <span style={{ display: 'block', marginTop: '2px' }}>{notif.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Shared Embedded CSS for Role Dashboards --- */}
            <style jsx="true">{`
                .role-dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .dashboard-main-content {
                    padding: 30px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .header-section { margin-bottom: 24px; }
                .page-title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
                .page-subtitle { font-size: 15px; color: #64748b; margin: 0; }

                /* KPI Grid */
                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }
                .kpi-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .kpi-info { flex: 1; }
                .kpi-label { display: block; font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 4px; }
                .kpi-value { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }

                /* Charts Grid */
                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .bento-card {
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .span-12 { grid-column: span 12; }
                .span-8 { grid-column: span 8; }
                .span-4 { grid-column: span 4; }
                
                .bento-card-header { padding: 20px 24px 0; }
                .bento-card-title { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { padding: 24px; flex: 1; }

                /* --- Right Panel --- */
                .role-side-panel {
                    background: #ffffff;
                    border-left: 1px solid #e2e8f0;
                    height: 100vh;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                .side-panel-header {
                    padding: 24px 24px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .side-panel-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; }
                .badge { background: #3b82f6; color: #ffffff; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 12px; }
                .side-panel-content { padding: 24px; display: flex; flex-direction: column; gap: 32px; }

                .block-title { margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; }
                .action-list { display: flex; flex-direction: column; gap: 10px; }
                .action-item {
                    display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f8fafc;
                    border: 1px solid #f1f5f9; border-radius: 12px; color: #334155; font-weight: 600; font-size: 14px;
                    cursor: pointer; transition: all 0.2s; text-align: left;
                }
                .action-item:hover { background: #f1f5f9; color: #0f172a; }
                .action-item svg { color: #64748b; }

                .timeline { position: relative; padding-left: 14px; border-left: 2px solid #e2e8f0; display: flex; flex-direction: column; gap: 20px; }
                .timeline-item { position: relative; }
                .timeline-dot { position: absolute; left: -21px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: #ffffff; border: 3px solid #3b82f6; }
                .timeline-content p { margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #334155; line-height: 1.4; }
                .timeline-content span { font-size: 12px; color: #94a3b8; }

                @media (max-width: 1400px) {
                    .kpi-grid { grid-template-columns: repeat(2, 1fr); }
                    .charts-grid { display: flex; flex-direction: column; }
                }
                @media (max-width: 1024px) {
                    .role-dashboard-layout { grid-template-columns: 1fr; }
                    .role-side-panel { display: none; }
                }
                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: 1fr; }
                    .dashboard-main-content { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
