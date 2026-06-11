import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Briefcase, CheckSquare, Target, Clock, AlertCircle, 
    Calendar, CheckCircle, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
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

    // Manager KPIs
    const teamMembers = managerStats.teamMembers || 12;
    const activeProjects = managerStats.activeProjects || 4;
    const pendingApprovals = managerStats.pendingApprovals || 5;
    const teamProductivity = managerStats.teamProductivity || 87;

    // Additional Simulated KPIs
    const departmentRevenue = 145000;
    const openTasks = 34;

    // Team Performance (Radar Chart)
    const teamPerformanceData = [
        { subject: 'Quality', A: 120, fullMark: 150 },
        { subject: 'Speed', A: 98, fullMark: 150 },
        { subject: 'Communication', A: 86, fullMark: 150 },
        { subject: 'Initiative', A: 99, fullMark: 150 },
        { subject: 'Teamwork', A: 85, fullMark: 150 },
        { subject: 'Reliability', A: 65, fullMark: 150 },
    ];

    // Project Status (Pie Chart)
    const projectStatusData = [
        { name: 'On Track', value: 5, color: '#10b981' },
        { name: 'At Risk', value: 2, color: '#f59e0b' },
        { name: 'Delayed', value: 1, color: '#ef4444' }
    ];

    // Team Attendance & Workload (Bar Chart)
    const teamWorkloadData = [
        { name: 'Alice', hours: 42, fill: '#3b82f6' },
        { name: 'Bob', hours: 38, fill: '#10b981' },
        { name: 'Charlie', hours: 45, fill: '#f59e0b' },
        { name: 'Diana', hours: 40, fill: '#8b5cf6' },
        { name: 'Eve', hours: 35, fill: '#ec4899' }
    ];

    // Pending Approvals List
    const pendingList = [
        { id: 1, text: 'Annual Leave request from Alice', type: 'Leave', priority: 'Medium' },
        { id: 2, text: 'Hardware Purchase order $1200', type: 'Expense', priority: 'High' },
        { id: 3, text: 'Timesheet approval for Week 24', type: 'Timesheet', priority: 'Low' }
    ];

    // Urgent Alerts
    const urgentAlerts = [
        { id: 1, text: 'Project Alpha deadline approaching in 3 days' },
        { id: 2, text: 'Charlie exceeded 45 hours this week' }
    ];

    return (
        <div className="role-dashboard-layout">
            
            {/* --- Main Content Left --- */}
            <div className="dashboard-main-content">
                <div className="header-section">
                    <h1 className="page-title">Manager Dashboard</h1>
                    <p className="page-subtitle">Team Performance & Project Operations</p>
                </div>

                {/* Top KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Team Members</span>
                            <h3 className="kpi-value">{teamMembers}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><Briefcase size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Projects</span>
                            <h3 className="kpi-value">{activeProjects}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}><Clock size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Approvals</span>
                            <h3 className="kpi-value">{pendingApprovals}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Target size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Team Productivity</span>
                            <h3 className="kpi-value">{teamProductivity}%</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfeff', color: '#0891b2' }}><Activity size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Open Tasks</span>
                            <h3 className="kpi-value">{openTasks}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><CheckSquare size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Dept. Revenue</span>
                            <h3 className="kpi-value">${departmentRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    
                    {/* Team Workload Bar Chart */}
                    <div className="bento-card span-8">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Clock size={18} /> Team Workload (Weekly Hours)</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={teamWorkloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={40}>
                                        {teamWorkloadData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Project Status Donut */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><PieChartIcon size={18} /> Project Status</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={projectStatusData}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value" stroke="none"
                                    >
                                        {projectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                {projectStatusData.map((item, i) => (
                                    <div key={i} className="legend-item" style={{ justifyContent: 'center' }}>
                                        <span className="dot" style={{ background: item.color }}></span>
                                        <span className="text">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Team Performance Radar */}
                    <div className="bento-card span-12">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={18} /> Aggregate Team Performance</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '340px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={teamPerformanceData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar name="Team Average" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Right Panel: Manager Features --- */}
            <div className="role-side-panel">
                <div className="side-panel-header">
                    <h3>Manager Panel</h3>
                    <span className="badge">Manager</span>
                </div>
                
                <div className="side-panel-content">
                    
                    {/* Quick Actions */}
                    <div className="feature-block">
                        <h4 className="block-title">Quick Actions</h4>
                        <div className="action-list">
                            <button className="action-item"><CheckSquare size={16} /> Assign Task</button>
                            <button className="action-item"><Calendar size={16} /> Approve Leaves</button>
                            <button className="action-item"><Briefcase size={16} /> New Project</button>
                        </div>
                    </div>

                    {/* Urgent Alerts */}
                    <div className="feature-block">
                        <h4 className="block-title">Urgent Alerts <AlertCircle size={14} className="text-warning ml-1"/></h4>
                        <div className="alerts-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {urgentAlerts.map(alert => (
                                <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                    <div style={{ color: '#ef4444' }}><AlertCircle size={18} /></div>
                                    <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 500, lineHeight: 1.4 }}>{alert.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pending Approvals */}
                    <div className="feature-block">
                        <h4 className="block-title">Pending Approvals</h4>
                        <div className="timeline">
                            {pendingList.map((item) => (
                                <div className="timeline-item" key={item.id}>
                                    <div className="timeline-dot" style={{ borderColor: item.priority === 'High' ? '#ef4444' : '#3b82f6' }}></div>
                                    <div className="timeline-content">
                                        <p>{item.text}</p>
                                        <span style={{ display: 'block', marginTop: '2px', fontWeight: 600, color: '#64748b' }}>{item.type}</span>
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
                .span-6 { grid-column: span 6; }
                .span-4 { grid-column: span 4; }
                
                .bento-card-header { padding: 20px 24px 0; }
                .bento-card-title { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { padding: 24px; flex: 1; }

                .chart-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 16px; }
                .legend-item { display: flex; align-items: center; gap: 8px; }
                .legend-item .dot { width: 10px; height: 10px; border-radius: 50%; }
                .legend-item .text { font-size: 13px; color: #475569; font-weight: 500; }

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

export default ManagerDashboard;
