import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, CalendarCheck, Clock, FileText, UserPlus, AlertCircle,
    Cake, CheckSquare, Briefcase, Activity, Calendar, ArrowRight
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area
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
    
    // Derived Metrics safely
    const totalEmployees = hrStats.totalEmployees || 0;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
    const newJoiners = hrStats.newJoiners || 0;
    const pendingApprovals = hrStats.pending || 0;
    const payrollProcessed = 84; // Simulated percent or count

    // Employee Distribution Data
    const employeeDistribution = hrStats.employeeDistribution && hrStats.employeeDistribution.length > 0
        ? hrStats.employeeDistribution
        : [
            { name: 'Full-time', value: 8, color: '#3b82f6' },
            { name: 'Contractor', value: 3, color: '#10b981' },
            { name: 'Intern', value: 2, color: '#f59e0b' }
        ];

    // Attendance Overview Data
    const attendanceHistory = hrStats.attendanceHistory && hrStats.attendanceHistory.length > 0
        ? hrStats.attendanceHistory.reverse()
        : [
            { name: 'Mon', employees: 12 },
            { name: 'Tue', employees: 13 },
            { name: 'Wed', employees: 12 },
            { name: 'Thu', employees: 10 },
            { name: 'Fri', employees: 11 },
        ];

    // Department Headcount
    const departmentHeadcount = [
        { dept: 'Engineering', count: 18, fill: '#3b82f6' },
        { dept: 'Sales', count: 12, fill: '#8b5cf6' },
        { dept: 'Marketing', count: 8, fill: '#10b981' },
        { dept: 'HR', count: 4, fill: '#f59e0b' },
        { dept: 'Operations', count: 10, fill: '#ef4444' }
    ];

    // Recent Activities
    const recentActivities = tables.recentActivity || [
        { id: 1, text: 'John Doe applied for Annual Leave', time: new Date(Date.now() - 3600000) },
        { id: 2, text: 'Salary processed for May', time: new Date(Date.now() - 86400000) },
        { id: 3, text: 'New employee Jane Smith onboarded', time: new Date(Date.now() - 172800000) }
    ];

    // Upcoming Birthdays
    const upcomingBirthdays = [
        { name: 'Alice Cooper', date: 'Oct 12', role: 'Sales Exec' },
        { name: 'Bob Singer', date: 'Oct 15', role: 'Engineer' }
    ];

    return (
        <div className="role-dashboard-layout">
            
            {/* --- Main Content Left --- */}
            <div className="dashboard-main-content">
                <div className="header-section">
                    <h1 className="page-title">HR Manager Dashboard</h1>
                    <p className="page-subtitle">Human Resources Overview & Operations</p>
                </div>

                {/* Top KPI Cards */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Total Employees</span>
                            <h3 className="kpi-value">{totalEmployees}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><CalendarCheck size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Present Today</span>
                            <h3 className="kpi-value">{presentToday}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">On Leave</span>
                            <h3 className="kpi-value">{onLeave}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><UserPlus size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">New Joiners (30d)</span>
                            <h3 className="kpi-value">{newJoiners}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Pending Approvals</span>
                            <h3 className="kpi-value">{pendingApprovals}</h3>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-icon-wrapper" style={{ background: '#ecfeff', color: '#0891b2' }}><CheckSquare size={20} /></div>
                        <div className="kpi-info">
                            <span className="kpi-label">Payroll Processed</span>
                            <h3 className="kpi-value">{payrollProcessed}%</h3>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    
                    {/* Attendance Overview Area Chart */}
                    <div className="bento-card span-8">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={18} /> Attendance Trend (7 Days)</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={attendanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Area type="monotone" dataKey="employees" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Employee Distribution Donut */}
                    <div className="bento-card span-4">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><PieChart size={18} /> Workforce Distribution</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={employeeDistribution}
                                        cx="50%" cy="50%"
                                        innerRadius={65} outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value" stroke="none"
                                    >
                                        {employeeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="chart-legend">
                                {employeeDistribution.map((item, i) => (
                                    <div key={i} className="legend-item">
                                        <span className="dot" style={{ background: item.color || '#3b82f6' }}></span>
                                        <span className="text">{item.name || 'Unassigned'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Department Headcount Bar */}
                    <div className="bento-card span-6">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Briefcase size={18} /> Department Headcount</div>
                        </div>
                        <div className="bento-card-body" style={{ height: '280px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentHeadcount} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} width={80} />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                                        {departmentHeadcount.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Leave Management Summary */}
                    <div className="bento-card span-6">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Calendar size={18} /> Leave Management</div>
                        </div>
                        <div className="bento-card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="summary-row">
                                    <div className="summary-icon bg-warning-light text-warning"><Clock size={20}/></div>
                                    <div className="summary-text">
                                        <h4>Pending Leave Requests</h4>
                                        <p>{pendingApprovals} requests awaiting approval</p>
                                    </div>
                                    <button className="icon-btn"><ArrowRight size={16}/></button>
                                </div>
                                <div className="summary-row">
                                    <div className="summary-icon bg-success-light text-success"><CalendarCheck size={20}/></div>
                                    <div className="summary-text">
                                        <h4>Approved Leaves Today</h4>
                                        <p>{onLeave} employees currently off</p>
                                    </div>
                                    <button className="icon-btn"><ArrowRight size={16}/></button>
                                </div>
                                <div className="summary-row">
                                    <div className="summary-icon bg-primary-light text-primary"><Users size={20}/></div>
                                    <div className="summary-text">
                                        <h4>Upcoming Leaves</h4>
                                        <p>3 employees requested time off next week</p>
                                    </div>
                                    <button className="icon-btn"><ArrowRight size={16}/></button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- Right Panel: HR Features --- */}
            <div className="role-side-panel">
                <div className="side-panel-header">
                    <h3>HR Features</h3>
                    <span className="badge">Admin</span>
                </div>
                
                <div className="side-panel-content">
                    
                    {/* Quick Actions */}
                    <div className="feature-block">
                        <h4 className="block-title">Quick Actions</h4>
                        <div className="action-list">
                            <button className="action-item"><UserPlus size={16} /> Onboard Employee</button>
                            <button className="action-item"><FileText size={16} /> Process Payroll</button>
                            <button className="action-item"><Calendar size={16} /> Leave Approvals</button>
                        </div>
                    </div>

                    {/* Upcoming Birthdays */}
                    <div className="feature-block">
                        <h4 className="block-title">Upcoming Birthdays <Cake size={14} className="text-warning ml-1"/></h4>
                        <div className="birthdays-list">
                            {upcomingBirthdays.map((person, i) => (
                                <div className="birthday-card" key={i}>
                                    <div className="b-avatar">{person.name.charAt(0)}</div>
                                    <div className="b-info">
                                        <h5>{person.name}</h5>
                                        <span>{person.role} • {person.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent HR Activity */}
                    <div className="feature-block">
                        <h4 className="block-title">Recent HR Activity</h4>
                        <div className="timeline">
                            {recentActivities.map((activity, i) => (
                                <div className="timeline-item" key={activity.id || i}>
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <p>{activity.text}</p>
                                        <span>{activity.time ? new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
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
                .span-8 { grid-column: span 8; }
                .span-6 { grid-column: span 6; }
                .span-4 { grid-column: span 4; }
                
                .bento-card-header { padding: 20px 24px 0; }
                .bento-card-title { font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
                .bento-card-body { padding: 24px; flex: 1; }

                .chart-legend { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
                .legend-item { display: flex; align-items: center; gap: 8px; }
                .legend-item .dot { width: 10px; height: 10px; border-radius: 50%; }
                .legend-item .text { font-size: 13px; color: #475569; font-weight: 500; }

                .summary-row {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    gap: 16px;
                }
                .summary-icon {
                    width: 40px; height: 40px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                }
                .summary-text h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #0f172a; }
                .summary-text p { margin: 0; font-size: 12px; color: #64748b; }
                .icon-btn { margin-left: auto; background: none; border: none; color: #94a3b8; cursor: pointer; }
                
                .bg-primary-light { background: #eff6ff; } .text-primary { color: #3b82f6; }
                .bg-success-light { background: #ecfdf5; } .text-success { color: #10b981; }
                .bg-warning-light { background: #fef3c7; } .text-warning { color: #f59e0b; }

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

                .birthdays-list { display: flex; flex-direction: column; gap: 12px; }
                .birthday-card {
                    display: flex; align-items: center; gap: 12px; padding: 12px;
                    background: #fdfbf7; border: 1px solid #fef3c7; border-radius: 12px;
                }
                .b-avatar {
                    width: 36px; height: 36px; border-radius: 50%; background: #f59e0b; color: white;
                    display: flex; align-items: center; justify-content: center; font-weight: bold;
                }
                .b-info h5 { margin: 0 0 2px 0; font-size: 13px; font-weight: 700; color: #0f172a; }
                .b-info span { font-size: 11px; color: #64748b; }

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

export default HRDashboard;
