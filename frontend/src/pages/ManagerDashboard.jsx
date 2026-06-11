import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Briefcase, CheckSquare, TrendingUp, AlertCircle
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

const ManagerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load Manager stats", error);
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

    const managerStats = dashboardData.managerStats || {};
    const hrStats = dashboardData.hrStats || {};
    const tables = dashboardData.tables || {};

    const projectStatusData = [
        { name: 'Active Orders', value: managerStats.activeProjects || 0, color: '#10b981' },
        { name: 'Pending', value: managerStats.pendingApprovals || 0, color: '#f59e0b' },
        { name: 'Delayed', value: 0, color: '#ef4444' }, // Placeholder for actual delay tracking
    ];

    if (projectStatusData.every(d => d.value === 0)) {
        projectStatusData.push({ name: 'No Data', value: 1, color: '#e2e8f0' });
    }

    // Attempt to use hrStats.attendanceHistory if available (Manager has access to overall team stats or just his team. We'll use hrStats.attendanceHistory if admin)
    // If not admin, the backend doesn't send hrStats. We'll mock for now if missing.
    const teamAttendanceData = hrStats.attendanceHistory && hrStats.attendanceHistory.length > 0
        ? hrStats.attendanceHistory.map(h => ({ name: h.name, present: h.employees, absent: Math.max(0, (hrStats.totalEmployees || 0) - h.employees) }))
        : [
            { name: 'Mon', present: 0, absent: 0 },
            { name: 'Tue', present: 0, absent: 0 }
        ];

    const workloadData = [
        { subject: 'Development', A: 85, fullMark: 100 },
        { subject: 'Code Review', A: 60, fullMark: 100 },
        { subject: 'Meetings', A: 90, fullMark: 100 },
        { subject: 'Planning', A: 45, fullMark: 100 },
        { subject: 'Support', A: 30, fullMark: 100 },
    ];

    const recentActivities = tables.recentActivity || [];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Manager Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Overview of team performance and project statuses.</p>
            </div>

            {/* Metrics Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Team Members</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {managerStats.teamMembers || 0}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Active Projects</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {managerStats.activeProjects || 0}
                            </h2>
                        </div>
                        <div style={{ background: '#f5f3ff', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
                            <Briefcase size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Pending Approvals</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {managerStats.pendingApprovals || 0}
                            </h2>
                        </div>
                        <div style={{ background: 'var(--warning-light)', padding: '10px', borderRadius: '12px', color: 'var(--warning)' }}>
                            <CheckSquare size={20} />
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Team Productivity</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {managerStats.teamProductivity || 0}%
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '24px' }}>
                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Briefcase size={18} className="text-primary" />
                            Project/Order Status
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '260px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: 'auto' }}>
                            {projectStatusData.filter(i => i.name !== 'No Data').map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Users size={18} className="text-primary" />
                            Team Attendance (Weekly)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Bar dataKey="present" stackId="a" fill="var(--primary)" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <TrendingUp size={18} className="text-primary" />
                            Team Workload
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={workloadData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Radar name="Workload" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                            </RadarChart>
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
                            Recent Activities
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
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
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

export default ManagerDashboard;
