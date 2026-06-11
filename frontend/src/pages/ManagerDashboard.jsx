import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Users, Briefcase, CheckCircle, Clock, 
    TrendingUp, Activity, FileText, CheckSquare,
    AlertCircle, Target
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const ManagerDashboard = () => {
    const { user } = useContext(AuthContext);
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

    // Mock data for manager charts
    const teamProductivity = [
        { name: 'Mon', completed: 15, pending: 5 },
        { name: 'Tue', completed: 18, pending: 4 },
        { name: 'Wed', completed: 14, pending: 6 },
        { name: 'Thu', completed: 22, pending: 3 },
        { name: 'Fri', completed: 19, pending: 2 },
    ];

    const projectStatus = [
        { name: 'On Track', value: 6, color: '#10b981' },
        { name: 'At Risk', value: 2, color: '#f59e0b' },
        { name: 'Delayed', value: 1, color: '#ef4444' },
    ];

    const teamWorkload = [
        { name: 'Alice S.', load: 85 },
        { name: 'Bob J.', load: 60 },
        { name: 'Charlie D.', load: 95 },
        { name: 'Diana P.', load: 45 },
    ];

    const teamAttendance = [
        { id: 1, name: 'Alice Smith', status: 'Present', time: '09:00 AM' },
        { id: 2, name: 'Bob Johnson', status: 'On Leave', time: '-' },
        { id: 3, name: 'Charlie Davis', status: 'Present', time: '09:15 AM' },
        { id: 4, name: 'Diana Prince', status: 'Present', time: '08:45 AM' },
    ];

    const pendingApprovals = [
        { id: 1, text: 'Leave Request - Bob Johnson', date: 'Yesterday' },
        { id: 2, text: 'Expense Report - Team Lunch', date: 'Today' },
        { id: 3, text: 'Project Deadline Extension - X2', date: '2 days ago' },
    ];

    return (
        <div className="p-30">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Manager Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>Oversee team performance, projects, and productivity.</p>
            </div>

            {/* Top KPI Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-3">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Team Members</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                {managerStats.teamMembers || 8}
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
                                {managerStats.activeProjects || 9}
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
                                {managerStats.pendingApprovals || 3}
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
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>Completed Tasks</p>
                            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 0 0', color: 'var(--text-primary)' }}>
                                88
                            </h2>
                        </div>
                        <div style={{ background: 'var(--success-light)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-6" style={{ background: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', color: 'var(--success)', boxShadow: 'var(--shadow-sm)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Team Productivity</span>
                            <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>92% <span style={{fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)'}}>Task Completion Rate</span></h3>
                        </div>
                    </div>
                </div>
                
                <div className="bento-card bento-col-6" style={{ background: '#f8fafc', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Department Revenue</span>
                            <h3 style={{ margin: 0, fontSize: '24px', color: 'var(--text-primary)' }}>$124,500 <span style={{fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)'}}>This Quarter</span></h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="bento-grid" style={{ marginBottom: '20px' }}>
                <div className="bento-card bento-col-8">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Activity size={18} className="text-primary" />
                            Team Task Completion (This Week)
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={teamProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Area type="monotone" dataKey="completed" name="Completed Tasks" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                                <Area type="monotone" dataKey="pending" name="Pending Tasks" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.2} fill="#f59e0b" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Briefcase size={18} className="text-primary" />
                            Project Status
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={projectStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {projectStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: 'auto' }}>
                            {projectStatus.map((item) => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></span>
                                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                            {item.name}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value} Projects</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bento-grid">
                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Activity size={18} className="text-purple" style={{ color: '#8b5cf6' }} />
                            Team Workload
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamWorkload} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} width={80} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                    formatter={(value) => [`${value}%`, 'Capacity']}
                                />
                                <Bar dataKey="load" radius={[0, 4, 4, 0]} barSize={16}>
                                    {teamWorkload.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.load > 90 ? '#ef4444' : entry.load > 70 ? '#f59e0b' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <Users size={18} className="text-primary" />
                            Team Attendance
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {teamAttendance.map((member, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={`https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        <div>
                                            <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{member.name}</h4>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In: {member.time}</span>
                                        </div>
                                    </div>
                                    <span className={`status-badge ${member.status === 'Present' ? 'confirmed' : 'low'}`} style={{ fontSize: '11px' }}>
                                        {member.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bento-card bento-col-4">
                    <div className="bento-card-header">
                        <div className="bento-card-title">
                            <CheckSquare size={18} className="text-warning" />
                            Action Items
                        </div>
                    </div>
                    <div className="bento-card-body" style={{ overflowY: 'auto', height: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {pendingApprovals.map((approval, i) => (
                                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', color: 'var(--warning)' }}>
                                        <FileText size={16} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 4px 0', color: 'var(--text-primary)', lineHeight: '1.4' }}>{approval.text}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{approval.date}</span>
                                            <button style={{ background: 'transparent', color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>Review</button>
                                        </div>
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

export default ManagerDashboard;
