import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, CalendarCheck, Clock, FileText, UserPlus, AlertCircle,
    Cake, CheckSquare, Briefcase, Activity
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const HRDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load HR stats", error);
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

    const hrStats = dashboardData.hrStats || {};
    
    // Employee Distribution Data
    const employeeDistribution = hrStats.employeeDistribution && hrStats.employeeDistribution.length > 0
        ? hrStats.employeeDistribution
        : [
            { name: 'Full-time', value: 8, color: '#3b82f6' },
            { name: 'Contractor', value: 3, color: '#10b981' },
            { name: 'Intern', value: 2, color: '#f59e0b' }
        ];

    const departmentHeadcount = employeeDistribution.map(d => ({ name: d.name, count: d.value }));

    // Mock data for new charts to match bento design
    const attendanceOverview = [
        { name: 'Mon', present: 12, absent: 1 },
        { name: 'Tue', present: 13, absent: 0 },
        { name: 'Wed', present: 11, absent: 2 },
        { name: 'Thu', present: 13, absent: 0 },
        { name: 'Fri', present: 10, absent: 3 },
    ];

    const upcomingBirthdays = [
        { id: 1, name: 'Alice Smith', date: 'Jun 15', role: 'Sales Exec' },
        { id: 2, name: 'Bob Johnson', date: 'Jun 18', role: 'Developer' },
        { id: 3, name: 'Emma Davis', date: 'Jun 22', role: 'HR Manager' }
    ];

    const leaveManagement = [
        { id: 1, name: 'John Doe', type: 'Sick Leave', duration: '2 Days', status: 'Pending' },
        { id: 2, name: 'Sarah Lee', type: 'Vacation', duration: '1 Week', status: 'Approved' },
        { id: 3, name: 'Mike Brown', type: 'Personal', duration: '1 Day', status: 'Pending' }
    ];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>HR Manager Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Manage workforce, attendance, and recruitment.</p>
            </div>

            {/* Top KPI Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Employees</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.totalEmployees || 13}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', color: 'var(--primary)' }}>
                            <Users size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Present Today</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.presentToday || 10}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>On Leave</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.onLeave || 2}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--warning-light)', padding: '10px', borderRadius: '12px', color: 'var(--warning)' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>New Joiners</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.newJoiners || 1}
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <UserPlus size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Operations Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-6" style={{ background: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                            <FileText size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Approvals</span>
                            <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>4 <span style={{fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)'}}>requests</span></h3>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Review All</button>
                </div>
                
                <div className="bento-card bento-col-6" style={{ background: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', color: 'var(--success)', boxShadow: 'var(--shadow-sm)' }}>
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Payroll Processed</span>
                            <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>100% <span style={{fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)'}}>for May</span></h3>
                        </div>
                    </div>
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>View Report</button>
                </div>
            </div>

            {/* Analytics Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Activity size={18} className="text-primary" />
                            Attendance Overview (Weekly)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceOverview} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="present" fill="var(--success)" radius={[4, 4, 0, 0]} name="Present" />
                                <Bar dataKey="absent" fill="var(--danger)" radius={[4, 4, 0, 0]} name="Absent/Leave" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Briefcase size={18} className="text-primary" />
                            Employee Distribution
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={employeeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {employeeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                            {employeeDistribution.filter(i => i.name !== 'No Data').map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Info Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-6">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Clock size={18} className="text-warning" />
                            Leave Management
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {leaveManagement.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${item.name}&background=random&color=fff`} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{item.name}</h4>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.type} ({item.duration})</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${item.status === 'Approved' ? 'confirmed' : 'low'}`} style={{ fontSize: '11px' }}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-6">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Cake size={18} className="text-purple" style={{ color: '#8b5cf6' }} />
                            Upcoming Birthdays
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingBirthdays.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '10px', color: '#8b5cf6', fontWeight: 700, fontSize: '14px', width: '48px', textAlign: 'center' }}>
                                            {item.date.split(' ')[1]}<br/>
                                            <span style={{ fontSize: '10px', fontWeight: 500 }}>{item.date.split(' ')[0]}</span>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{item.name}</h4>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.role}</span>
                                        </div>
                                    </div>
                                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Send Wish</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
