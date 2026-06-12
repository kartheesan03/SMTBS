import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Briefcase, FileText, CheckCircle, 
    Activity, DollarSign, ListTodo, TrendingUp, TrendingDown,
    Search, Bell, ChevronDown, Clock, Calendar
} from 'lucide-react';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const ManagerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await API.get('/dashboard/stats');
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
            setDashboardData({});
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
            <div className="flex-center" style={{ height: '80vh' }}>
                <div className="loader"></div>
            </div>
        );
    }

    const dashboard = dashboardData || {};

    // KPIs
    const teamMembers = 14; // Simulated
    const activeProjects = 5; // Simulated
    const pendingApprovals = 8; // Simulated
    const completedTasks = 42; // Simulated
    const teamProductivity = 94; // Simulated percentage
    const departmentRevenue = 125000; // Simulated

    // Charts Data
    const teamPerformanceData = [
        { name: 'Mon', completed: 12, pending: 4 },
        { name: 'Tue', completed: 15, pending: 3 },
        { name: 'Wed', completed: 10, pending: 8 },
        { name: 'Thu', completed: 18, pending: 2 },
        { name: 'Fri', completed: 14, pending: 5 },
    ];

    const teamAttendanceData = [
        { name: 'Present', value: 12, color: '#10b981' },
        { name: 'On Leave', value: 2, color: '#f59e0b' }
    ];

    const projectStatusData = [
        { id: 1, name: 'ERP Phase 2', progress: 75, status: 'On Track' },
        { id: 2, name: 'Q3 Marketing', progress: 40, status: 'At Risk' },
        { id: 3, name: 'Vendor Portal', progress: 90, status: 'On Track' },
        { id: 4, name: 'Security Audit', progress: 100, status: 'Completed' },
    ];

    return (
        <div className="role-dashboard-layout">
            <div className="main-content">

                <div className="header-section">
                    <h1 className="page-title">Manager Dashboard</h1>
                    <p className="page-subtitle">Team and Project Command Center</p>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +2</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{teamMembers}</h3>
                            <span className="kpi-label">Team Members</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Briefcase size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +1</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{activeProjects}</h3>
                            <span className="kpi-label">Active Projects</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><FileText size={18} /></div>
                            <div className="kpi-trend negative"><TrendingDown size={14} /> -2</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{pendingApprovals}</h3>
                            <span className="kpi-label">Pending Approvals</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +15%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{completedTasks}</h3>
                            <span className="kpi-label">Completed Tasks</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><TrendingUp size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +5%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{teamProductivity}%</h3>
                            <span className="kpi-label">Team Productivity</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +12%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">${departmentRevenue.toLocaleString()}</h3>
                            <span className="kpi-label">Dept Revenue</span>
                        </div>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Team Performance</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 10px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={teamPerformanceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                                    <Line type="monotone" dataKey="completed" name="Completed" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="pending" name="Pending" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Briefcase size={16} /> Project Status</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px', overflowY: 'auto', padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {projectStatusData.map(proj => (
                                    <div key={proj.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{proj.name}</span>
                                            <span style={{ 
                                                fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px',
                                                background: proj.status === 'Completed' ? '#ecfdf5' : proj.status === 'At Risk' ? '#fee2e2' : '#eff6ff',
                                                color: proj.status === 'Completed' ? '#059669' : proj.status === 'At Risk' ? '#ef4444' : '#3b82f6'
                                            }}>{proj.status}</span>
                                        </div>
                                        <div style={{ background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', width: `${proj.progress}%`, borderRadius: '4px',
                                                background: proj.status === 'Completed' ? '#10b981' : proj.status === 'At Risk' ? '#ef4444' : '#3b82f6'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Users size={16} /> Team Attendance</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '10px', position: 'relative' }}>
                            <div className="chart-center-text" style={{ marginTop: '-20px' }}>
                                <h3>{teamMembers}</h3>
                                <span>Total</span>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={teamAttendanceData} cx="50%" cy="45%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                                        {teamAttendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx="true">{`
                .role-dashboard-layout {
                    display: block;
                    min-height: 100vh;
                    background: #f4f7fb;
                }

                .main-content {
                    padding: 24px 32px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .header-section { margin-bottom: 24px; }
                .page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.5px; }
                .page-subtitle { font-size: 14px; color: #64748b; margin: 0; font-weight: 500; }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .kpi-card {
                    background: #ffffff; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02); border: 1px solid #e2e8f0; height: 110px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .kpi-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
                }
                .kpi-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .kpi-icon-wrapper { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .kpi-trend { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 2px; padding: 4px 8px; border-radius: 20px; }
                .kpi-trend.positive { background: #dcfce7; color: #16a34a; }
                .kpi-trend.negative { background: #fee2e2; color: #dc2626; }
                
                .kpi-info { display: flex; flex-direction: column; }
                .kpi-label { font-size: 12px; font-weight: 600; color: #64748b; margin-top: 2px; }
                .kpi-value { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1; }

                .charts-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .bento-card {
                    background: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0;
                    display: flex; flex-direction: column; overflow: hidden;
                    transition: box-shadow 0.2s ease;
                }
                .bento-card:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); }
                .bento-card-header { padding: 18px 20px 0; }
                .bento-card-title { font-size: 15px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { flex: 1; overflow-y: hidden; }

                .chart-center-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    pointer-events: none;
                    margin-top: -15px;
                }
                .chart-center-text h3 { margin: 0; font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1; }
                .chart-center-text span { font-size: 13px; font-weight: 600; color: #64748b; }

                @media (max-width: 1400px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 1024px) {
                    .charts-grid-3 { grid-template-columns: 1fr; }
                    .main-content { padding: 16px; }
                }
            `}</style>
        </div>
    );
};

export default ManagerDashboard;
