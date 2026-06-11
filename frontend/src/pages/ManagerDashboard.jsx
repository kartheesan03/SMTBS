import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, Briefcase, FileText, CheckCircle, 
    Activity, DollarSign, ListTodo, TrendingUp,
    Search, Bell, ChevronDown, Clock, Calendar
} from 'lucide-react';
import { 
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
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

    const pendingApprovalsList = [
        { id: 1, type: 'Leave Request', requester: 'Alice Smith', details: '2 days sick leave' },
        { id: 2, type: 'Expense Claim', requester: 'Bob Johnson', details: 'Travel to client site ($240)' },
        { id: 3, type: 'Resource Request', requester: 'Charlie Brown', details: '1 additional frontend dev' },
    ];

    const rightPanelFeatures = [
        { title: 'Project Management', icon: <Briefcase size={16} /> },
        { title: 'Task Assignments', icon: <ListTodo size={16} /> },
        { title: 'Approve Timesheets', icon: <Clock size={16} /> },
        { title: 'Team Directory', icon: <Users size={16} /> },
        { title: 'Performance Reviews', icon: <Activity size={16} /> }
    ];

    return (
        <div className="role-dashboard-layout">
            <div className="main-content">

                {/* Top Nav Bar */}
                <div className="top-nav-bar">
                    <div className="search-bar">
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search projects, members..." />
                    </div>
                    <div className="nav-actions">
                        <div className="date-filter">
                            <Calendar size={16} />
                            <span>This Week</span>
                            <ChevronDown size={14} />
                        </div>
                        <button className="icon-btn notification-btn">
                            <Bell size={20} />
                            <span className="notif-badge"></span>
                        </button>
                        <div className="profile-dropdown">
                            <div className="avatar" style={{background: '#8b5cf6'}}>M</div>
                            <div className="profile-info">
                                <span className="p-name">Manager</span>
                                <span className="p-role">Department Head</span>
                            </div>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                <div className="header-section">
                    <h1 className="page-title">Manager Dashboard</h1>
                    <p className="page-subtitle">Team and Project Command Center</p>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Team Members</span>
                            <h3 className="kpi-value">{teamMembers}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Briefcase size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Active Projects</span>
                            <h3 className="kpi-value">{activeProjects}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><FileText size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Approvals</span>
                            <h3 className="kpi-value">{pendingApprovals}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Completed Tasks</span>
                            <h3 className="kpi-value">{completedTasks}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><TrendingUp size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Team Productivity</span>
                            <h3 className="kpi-value">{teamProductivity}%</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Dept Revenue</span>
                            <h3 className="kpi-value">${departmentRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Team Performance</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={teamPerformanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="pending" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Briefcase size={16} /> Project Status</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {projectStatusData.map(proj => (
                                    <div key={proj.id} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{proj.name}</span>
                                            <span style={{ 
                                                fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                                background: proj.status === 'Completed' ? '#ecfdf5' : proj.status === 'At Risk' ? '#fee2e2' : '#eff6ff',
                                                color: proj.status === 'Completed' ? '#059669' : proj.status === 'At Risk' ? '#ef4444' : '#3b82f6'
                                            }}>{proj.status}</span>
                                        </div>
                                        <div style={{ background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', width: `${proj.progress}%`,
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
                        <div className="bento-card-body" style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={teamAttendanceData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                                        {teamAttendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="charts-grid-3" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><FileText size={16} /> Pending Approvals</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 8px' }}>Type</th>
                                        <th style={{ padding: '12px 8px' }}>Requester</th>
                                        <th style={{ padding: '12px 8px' }}>Details</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingApprovalsList.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 600, color: '#334155' }}>{item.type}</td>
                                            <td style={{ padding: '12px 8px', color: '#64748b' }}>{item.requester}</td>
                                            <td style={{ padding: '12px 8px', color: '#64748b' }}>{item.details}</td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, marginRight: '6px' }}>Approve</button>
                                                <button style={{ background: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>Deny</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Panel */}
            <div className="side-panel">
                <div className="side-panel-header">
                    <h3>MANAGER FEATURES</h3>
                </div>
                <div className="side-panel-content">
                    <div className="features-list">
                        {rightPanelFeatures.map((feature, idx) => (
                            <div className="feature-item" key={idx}>
                                <div className="feature-icon">{feature.icon}</div>
                                <span className="feature-text">{feature.title}</span>
                                <ChevronDown size={14} className="feature-chevron" style={{ transform: 'rotate(-90deg)' }}/>
                            </div>
                        ))}
                    </div>

                    <div className="system-status-block" style={{ marginTop: 'auto', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <h4 style={{ color: '#1e40af', margin: '0 0 8px 0', fontSize: '13px' }}><Activity size={14} style={{display:'inline', marginBottom:'-2px'}}/> Team Workload</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#334155' }}>
                                <span>Design Team</span><span>85%</span>
                            </div>
                            <div style={{ background: '#dbeafe', height: '6px', borderRadius: '3px' }}><div style={{ background: '#3b82f6', height: '100%', width: '85%' }}></div></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#334155', marginTop: '4px' }}>
                                <span>Engineering</span><span>110% (Overload)</span>
                            </div>
                            <div style={{ background: '#fee2e2', height: '6px', borderRadius: '3px' }}><div style={{ background: '#ef4444', height: '100%', width: '100%' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .role-dashboard-layout {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .main-content {
                    padding: 20px 24px;
                    height: 100vh;
                    overflow-y: auto;
                }

                /* Top Nav Bar */
                .top-nav-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .search-bar {
                    display: flex; align-items: center; gap: 8px;
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 8px 12px; width: 300px;
                }
                .search-bar input { border: none; outline: none; width: 100%; font-size: 13px; color: #0f172a; }
                .search-bar input::placeholder { color: #94a3b8; }
                .nav-actions { display: flex; align-items: center; gap: 16px; }
                .date-filter {
                    display: flex; align-items: center; gap: 6px; cursor: pointer;
                    background: #ffffff; border: 1px solid #e2e8f0; padding: 6px 12px;
                    border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;
                }
                .icon-btn {
                    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%;
                    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #64748b; position: relative;
                }
                .notification-btn .notif-badge {
                    position: absolute; top: 6px; right: 6px; width: 6px; height: 6px;
                    background: #ef4444; border-radius: 50%; border: 2px solid #fff;
                }
                .profile-dropdown {
                    display: flex; align-items: center; gap: 8px; cursor: pointer;
                }
                .avatar {
                    width: 32px; height: 32px; border-radius: 50%; background: #1e293b;
                    color: white; display: flex; align-items: center; justify-content: center;
                    font-weight: bold; font-size: 13px;
                }
                .profile-info { display: flex; flex-direction: column; }
                .p-name { font-size: 13px; font-weight: 700; color: #0f172a; }
                .p-role { font-size: 11px; color: #64748b; }

                .header-section { margin-bottom: 16px; }
                .page-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0; }
                .page-subtitle { font-size: 13px; color: #64748b; margin: 0; }

                .kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .kpi-card {
                    background: #ffffff; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
                }
                .kpi-icon-wrapper { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
                .kpi-label { display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 2px; }
                .kpi-value { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }

                .charts-grid-3 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .bento-card {
                    background: #ffffff; border-radius: 10px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .bento-card-header { padding: 12px 14px 0; }
                .bento-card-title { font-size: 13px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px; }
                .bento-card-body { padding: 14px; flex: 1; overflow-y: auto; }

                .side-panel {
                    background: #ffffff; border-left: 1px solid #e2e8f0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column;
                }
                .side-panel-header { padding: 16px; border-bottom: 1px solid #f1f5f9; }
                .side-panel-header h3 { margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                .side-panel-content { padding: 16px; display: flex; flex-direction: column; flex: 1; }
                
                .features-list { display: flex; flex-direction: column; gap: 6px; }
                .feature-item {
                    display: flex; align-items: center; padding: 10px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;
                }
                .feature-item:hover { background: #f8fafc; border-color: #cbd5e1; }
                .feature-icon { color: #3b82f6; margin-right: 10px; display: flex; align-items: center; }
                .feature-text { font-size: 12px; font-weight: 600; color: #334155; flex: 1; }
                .feature-chevron { color: #94a3b8; }

                .system-status-block { border-radius: 8px; padding: 16px; }

                @media (max-width: 1024px) {
                    .role-dashboard-layout { grid-template-columns: 1fr; }
                    .side-panel { display: none; }
                }
                @media (max-width: 768px) {
                    .kpi-grid { grid-template-columns: repeat(3, 1fr); }
                    .charts-grid-3 { grid-template-columns: 1fr; }
                    .main-content { padding: 16px; }
                    .top-nav-bar { flex-direction: column; gap: 12px; align-items: flex-start; }
                    .search-bar { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default ManagerDashboard;
