import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Users, UserCheck, Calendar, DollarSign, 
    FileText, Activity, AlertCircle, Briefcase,
    TrendingUp, TrendingDown, Award
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const HRDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, empRes, usersRes] = await Promise.all([
                API.get('/dashboard/stats'),
                API.get('/employees'),
                API.get('/auth/users')
            ]);
            setDashboardData(statsRes.data);
            setEmployees(empRes.data);
            setUsers(usersRes.data);
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

    // Filter unique active employees
    const uniqueEmployees = Array.from(new Map(employees.map(e => [e.employeeId || e._id || Math.random(), e])).values());

    // KPIs
    const totalEmployees = uniqueEmployees.length;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
    const newJoiners = 4; // Simulated
    const pendingApprovals = 12; // Simulated
    const payrollProcessed = 85; // Simulated percentage

    // Dynamic Chart Data based on employee records
    const departmentCounts = {};
    uniqueEmployees.forEach(emp => {
        const dept = emp.department || 'Employee';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#64748b'];

    const rawDistributionData = Object.keys(departmentCounts).map((dept, index) => ({
        name: dept,
        value: departmentCounts[dept],
        color: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value);

    const employeeDistributionData = [];
    let othersCount = 0;
    rawDistributionData.forEach((item, index) => {
        if (index < 4) {
            employeeDistributionData.push(item);
        } else {
            othersCount += item.value;
        }
    });
    if (othersCount > 0) {
        employeeDistributionData.push({
            name: 'Others',
            value: othersCount,
            color: '#cbd5e1'
        });
    }

    // Role-based Department Headcount from Employees Table
    const roleLabels = {
        'admin': 'Admin Department',
        'super admin': 'Admin Department',
        'hr': 'HR Department',
        'manager': 'Manager Department',
        'sales': 'Sales Department',
        'employee': 'Employee Department'
    };

    const roleCounts = {};
    uniqueEmployees.forEach(emp => {
        let roleStr = emp.department ? emp.department.toLowerCase().trim() : 'employee';
        
        // Handle fallback mappings if the database has other variants
        if (roleStr.includes('hr')) roleStr = 'hr';
        else if (roleStr.includes('sales')) roleStr = 'sales';
        else if (roleStr.includes('admin')) roleStr = 'admin';
        else if (roleStr.includes('manager')) roleStr = 'manager';

        const label = roleLabels[roleStr] || `${emp.department || 'Employee'} Department`;
        roleCounts[label] = (roleCounts[label] || 0) + 1;
    });

    const departmentHeadcountData = Object.keys(roleCounts).map((roleLabel, index) => ({
        name: roleLabel,
        count: roleCounts[roleLabel],
        fill: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.count - a.count);

    const absentToday = Math.max(0, totalEmployees - presentToday - onLeave);
    const attendanceOverviewData = totalEmployees > 0 ? [
        { name: 'Present', value: presentToday, color: '#10b981' },
        { name: 'Absent', value: absentToday, color: '#ef4444' },
        { name: 'On Leave', value: onLeave, color: '#f59e0b' },
    ] : [
        { name: 'Present', value: 6, color: '#10b981' },
        { name: 'Absent', value: 0, color: '#ef4444' },
        { name: 'On Leave', value: 0, color: '#f59e0b' },
    ];

    // Simulated Trend Analytics Data
    const monthlyAttendanceTrend = [
        { month: 'Jan', present: 85, absent: 15 },
        { month: 'Feb', present: 88, absent: 12 },
        { month: 'Mar', present: 92, absent: 8 },
        { month: 'Apr', present: 90, absent: 10 },
        { month: 'May', present: 95, absent: 5 },
        { month: 'Jun', present: 96, absent: 4 },
    ];

    const departmentPerformance = [
        { dept: 'Sales', score: 92 },
        { dept: 'HR', score: 88 },
        { dept: 'Operations', score: 85 },
        { dept: 'Production', score: 78 },
        { dept: 'Accounts', score: 94 },
    ];

    const employeeGrowth = [
        { month: 'Jan', employees: totalEmployees > 20 ? totalEmployees - 15 : 2 },
        { month: 'Feb', employees: totalEmployees > 20 ? totalEmployees - 12 : 3 },
        { month: 'Mar', employees: totalEmployees > 20 ? totalEmployees - 8 : 5 },
        { month: 'Apr', employees: totalEmployees > 20 ? totalEmployees - 5 : 8 },
        { month: 'May', employees: totalEmployees > 20 ? totalEmployees - 2 : 11 },
        { month: 'Jun', employees: totalEmployees },
    ];

    const sumOfChartData = departmentHeadcountData.reduce((acc, curr) => acc + curr.count, 0);
    console.log("HR Dashboard Debug:", {
        totalEmployees,
        chartData: departmentHeadcountData,
        sumOfChartData
    });

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
        if (percent === 0) return null;
        return (
          <text x={x} y={y} fill="white" fontSize="12px" fontWeight="600" textAnchor="middle" dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
    };

    return (
        <div className="role-dashboard-layout">
            <div className="main-content">

                <div className="header-section">
                    <h1 className="page-title">HR Manager Dashboard</h1>
                    <p className="page-subtitle">Human Resources & Analytics Overview</p>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +8%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{totalEmployees.toLocaleString()}</h3>
                            <span className="kpi-label">Total Employees</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#f0fdf4', color: '#16a34a' }}><UserCheck size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +2%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{presentToday}</h3>
                            <span className="kpi-label">Present Today</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}><AlertCircle size={18} /></div>
                            <div className="kpi-trend negative"><TrendingDown size={14} /> -1%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{onLeave}</h3>
                            <span className="kpi-label">On Leave</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#f3e8ff', color: '#9333ea' }}><Briefcase size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +12%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{newJoiners}</h3>
                            <span className="kpi-label">New Joiners</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#fee2e2', color: '#ef4444' }}><FileText size={18} /></div>
                            <div className="kpi-trend negative"><TrendingDown size={14} /> -5%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{pendingApprovals}</h3>
                            <span className="kpi-label">Pending Approvals</span>
                        </div>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}><DollarSign size={18} /></div>
                            <div className="kpi-trend positive"><TrendingUp size={14} /> +100%</div>
                        </div>
                        <div className="kpi-info">
                            <h3 className="kpi-value">{payrollProcessed}%</h3>
                            <span className="kpi-label">Payroll Processed</span>
                        </div>
                    </div>
                </div>

                {/* Row 1: Core HR Metrics */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Activity size={16} /> Attendance Overview</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '10px', position: 'relative' }}>
                            <div className="chart-center-text">
                                <h3>{totalEmployees}</h3>
                                <span>Total</span>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie data={attendanceOverviewData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none" labelLine={false} label={renderCustomizedLabel}>
                                        {attendanceOverviewData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Users size={16} /> Employee Distribution</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '10px', position: 'relative' }}>
                            <div className="chart-center-text" style={{ marginTop: '-20px' }}>
                                <h3>{totalEmployees}</h3>
                                <span>Total</span>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie data={employeeDistributionData} cx="50%" cy="45%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none" labelLine={false} label={renderCustomizedLabel}>
                                        {employeeDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value, name) => [value, name]} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '0px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Briefcase size={16} /> Department Headcount</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 0' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={departmentHeadcountData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} width={120} />
                                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#0f172a', fontSize: 12, fontWeight: 700 }}>
                                        {departmentHeadcountData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Row 2: Advanced Analytics */}
                <div className="charts-grid-3">
                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Calendar size={16} /> Monthly Attendance Trend</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 10px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyAttendanceTrend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                                    <Line type="monotone" dataKey="present" name="Present %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="absent" name="Absent %" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><Award size={16} /> Department Performance</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 10px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={departmentPerformance} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                                    <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="score" name="Avg Score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bento-card">
                        <div className="bento-card-header">
                            <div className="bento-card-title"><TrendingUp size={16} /> Employee Growth</div>
                        </div>
                        <div className="bento-card-body" style={{ display: 'block', padding: '20px 10px 10px 10px' }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={employeeGrowth} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="employees" name="Total Staff" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                                </AreaChart>
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
                .bento-card-body { padding: 20px; flex: 1; overflow-y: hidden; }

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

export default HRDashboard;
