import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, UserCheck, Calendar, DollarSign, 
    FileText, Activity, AlertCircle, Briefcase,
    Search, Bell, ChevronDown, Award
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const HRDashboard = () => {
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

    const hrStats = dashboardData.hrStats || {};

    // KPIs
    const totalEmployees = dashboardData.totalEmployees || 0;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
    const newJoiners = 4; // Simulated
    const pendingApprovals = 12; // Simulated
    const payrollProcessed = 85; // Simulated percentage

    // Charts Data
    const employeeDistributionData = [
        { name: 'Engineering', value: 45, color: '#3b82f6' },
        { name: 'Sales', value: 30, color: '#10b981' },
        { name: 'Operations', value: 15, color: '#f59e0b' },
        { name: 'HR & Admin', value: 10, color: '#8b5cf6' },
    ];

    const attendanceOverviewData = [
        { name: 'Mon', present: 140, leave: 5 },
        { name: 'Tue', present: 142, leave: 3 },
        { name: 'Wed', present: 138, leave: 7 },
        { name: 'Thu', present: 141, leave: 4 },
        { name: 'Fri', present: 135, leave: 10 },
    ];

    const departmentHeadcountData = [
        { name: 'Engineering', count: 45, fill: '#3b82f6' },
        { name: 'Sales', count: 30, fill: '#10b981' },
        { name: 'Operations', count: 15, fill: '#f59e0b' },
        { name: 'HR', count: 5, fill: '#8b5cf6' },
        { name: 'Admin', count: 5, fill: '#ec4899' },
    ];

    const leaveRequests = [
        { id: 1, name: 'Alice Smith', type: 'Sick Leave', duration: '2 Days', status: 'Pending' },
        { id: 2, name: 'Bob Johnson', type: 'Vacation', duration: '5 Days', status: 'Approved' },
        { id: 3, name: 'Charlie Brown', type: 'Personal', duration: '1 Day', status: 'Pending' },
    ];


    return (
        <div className="role-dashboard-layout">
            <div className="main-content">

                {/* Top Nav Bar */}
                <div className="top-nav-bar">
                    <div className="search-bar">
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search HR records..." />
                    </div>
                    <div className="nav-actions">
                        <div className="date-filter">
                            <Calendar size={16} />
                            <span>This Month</span>
                            <ChevronDown size={14} />
                        </div>
                        <button className="icon-btn notification-btn">
                            <Bell size={20} />
                            <span className="notif-badge"></span>
                        </button>
                        <div className="profile-dropdown">
                            <div className="avatar">HR</div>
                            <div className="profile-info">
                                <span className="p-name">HR Manager</span>
                                <span className="p-role">Human Resources</span>
                            </div>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>

                <div className="header-section">
                    <h1 className="page-title">HR Manager Dashboard</h1>
                    <p className="page-subtitle">Human Resources Overview</p>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Employees</span>
                            <h3 className="kpi-value">{totalEmployees.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><UserCheck size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Present Today</span>
                            <h3 className="kpi-value">{presentToday}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><AlertCircle size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">On Leave</span>
                            <h3 className="kpi-value">{onLeave}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Briefcase size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">New Joiners</span>
                            <h3 className="kpi-value">{newJoiners}</h3>
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
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Payroll Processed</span>
                            <h3 className="kpi-value">{payrollProcessed}%</h3>
                        </div>
                    </div>
                </div>

                {/* Row 1 */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Attendance Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceOverviewData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Line type="monotone" dataKey="present" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="leave" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Users size={16} /> Employee Distribution</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={employeeDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                                        {employeeDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Briefcase size={16} /> Department Headcount</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentHeadcountData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155' }} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                                        {departmentHeadcountData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="charts-grid-3" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Calendar size={16} /> Leave Management</div>
                        </div>
                        <div className="bento-card-body">
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 8px' }}>Employee</th>
                                        <th style={{ padding: '12px 8px' }}>Leave Type</th>
                                        <th style={{ padding: '12px 8px' }}>Duration</th>
                                        <th style={{ padding: '12px 8px' }}>Status</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRequests.map(req => (
                                        <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 600, color: '#334155' }}>{req.name}</td>
                                            <td style={{ padding: '12px 8px', color: '#64748b' }}>{req.type}</td>
                                            <td style={{ padding: '12px 8px', color: '#64748b' }}>{req.duration}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: req.status === 'Approved' ? '#ecfdf5' : '#fffbeb',
                                                    color: req.status === 'Approved' ? '#059669' : '#d97706'
                                                }}>{req.status}</span>
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                {req.status === 'Pending' ? (
                                                    <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>Review</button>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>


            <style jsx="true">{`
                .role-dashboard-layout {
                    display: block;
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
                    .role-dashboard-layout { display: block; }
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

export default HRDashboard;
