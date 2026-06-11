import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, CalendarCheck, Clock, FileText, UserPlus, AlertCircle
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
    const tables = dashboardData.tables || {};

    const employeeDistribution = hrStats.employeeDistribution || [
        { name: 'No Data', value: 1, color: '#e2e8f0' }
    ];

    const departmentHeadcount = hrStats.employeeDistribution 
        ? hrStats.employeeDistribution.map(d => ({ name: d.name, count: d.value }))
        : [];

    const recentActivities = tables.recentActivity || [];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>HR Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Manage workforce, attendance, and recruitment.</p>
            </div>

            {/* Metrics Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Total Employees</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.totalEmployees || 0}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Attendance Today</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.presentToday || 0}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Leave Requests</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.pending || 0}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>On Leave</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {hrStats.onLeave || 0}
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <FileText size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Users size={18} className="text-primary" />
                            Employee Distribution
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '260px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={employeeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                            {employeeDistribution.filter(i => i.name !== 'No Data').map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <BarChart size={18} className="text-primary" />
                            Department Headcount
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentHeadcount} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-12">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <AlertCircle size={18} className="text-primary" />
                            Recent HR Activities
                        </div>
                    </div>
                    <div className="bento-card-body">
                        {recentActivities.length === 0 ? (
                             <div className="flex-center" style={{ padding: '20px', color: 'var(--text-muted)' }}>
                                 No recent activities
                             </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentActivities.map((act, i) => (
                                    <div key={act.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: '#ffffff', padding: '8px', borderRadius: '50%', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                                                <AlertCircle size={14} />
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{act.text}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(act.time).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
