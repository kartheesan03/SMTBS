import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    CheckCircle, ListTodo, Calendar, DollarSign, Bell, CalendarDays
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, Cell
} from 'recharts';

const EmployeeDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load Employee stats", error);
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
    const tables = dashboardData.tables || {};

    const attendanceData = [
        { name: 'Mon', hours: 8, status: 'Present' },
        { name: 'Tue', hours: 8.5, status: 'Present' },
        { name: 'Wed', hours: 0, status: 'Absent' },
        { name: 'Thu', hours: 7.5, status: 'Present' },
        { name: 'Fri', hours: 8, status: 'Present' },
    ];

    const upcomingEvents = [
        { id: 1, title: 'Team Sync Meeting', time: 'Today, 2:00 PM', type: 'meeting' },
        { id: 2, title: 'Project Alpha Deadline', time: 'Tomorrow, 5:00 PM', type: 'deadline' },
        { id: 3, text: 'Company Townhall', time: 'Friday, 10:00 AM', type: 'event' },
    ];

    const recentNotifications = tables.recentActivity || [];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>My Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Welcome back! Here is your daily summary.</p>
            </div>

            {/* Metrics Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Status Today</p>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--success)' }}>
                                {employeeStats.attendanceToday || 'Not Marked'}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Pending Leaves</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {employeeStats.myPendingLeaves || 0}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                            <ListTodo size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Leave Balance</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {14} <span style={{fontSize: '16px', color: 'var(--text-muted)'}}>days</span>
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Last Payslip</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {employeeStats.payslipAmount ? `$${employeeStats.payslipAmount}` : 'N/A'}
                            </h2>
                        </div>
                        <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px', color: '#64748b' }}>
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <CalendarDays size={18} className="text-primary" />
                            My Attendance (This Week)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 10]} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`${value} hours`, 'Logged']}
                                />
                                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.status === 'Absent' ? '#ef4444' : 'var(--primary)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Bell size={18} className="text-primary" />
                            Recent Notifications
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '280px' }}>
                        {recentNotifications.length === 0 ? (
                            <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)' }}>
                                No recent notifications
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {recentNotifications.map((notif, i) => (
                                    <div key={notif.id || i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{notif.text}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(notif.time).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-12">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Calendar size={18} className="text-primary" />
                            Upcoming Events & Deadlines
                        </div>
                    </div>
                    <div className="bento-card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            {upcomingEvents.map((evt) => (
                                <div key={evt.id} style={{ 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    border: '1px solid var(--border)',
                                    background: evt.type === 'deadline' ? 'var(--danger-light)' : 'var(--bg-body)',
                                    display: 'flex', alignItems: 'center', gap: '16px'
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#ffffff', boxShadow: 'var(--shadow-sm)',
                                        color: evt.type === 'deadline' ? 'var(--danger)' : 'var(--primary)'
                                    }}>
                                        <CalendarDays size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{evt.title || evt.text}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{evt.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
