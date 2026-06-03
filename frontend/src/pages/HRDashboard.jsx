import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { 
    Users, CheckCircle, Calendar, Clock, ChevronRight, UserPlus, 
    DollarSign, Search, Filter, Mail, Briefcase, Plus
} from 'lucide-react';

const HRDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488'];

    useEffect(() => {
        const fetchHRData = async () => {
            try {
                const [dashRes, attRes] = await Promise.all([
                    API.get('/dashboard/stats'),
                    API.get('/attendance')
                ]);
                setData(dashRes.data);
                setAttendanceData(attRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHRData();
    }, []);

    if (loading) {
        return (
            <div className="dash-loading-wrapper">
                <div className="dash-spinner"></div>
                <p>Accessing Human Resources Management...</p>
            </div>
        );
    }

    const hrStats = data?.hrStats || {};

    const employeeDistribution = hrStats.employeeDistribution && hrStats.employeeDistribution.length > 0
        ? hrStats.employeeDistribution
        : [
            { name: 'HR', value: 0, percentage: '0%', color: '#2563eb' },
            { name: 'Finance', value: 0, percentage: '0%', color: '#10b981' },
            { name: 'Sales', value: 0, percentage: '0%', color: '#f59e0b' },
            { name: 'Operations', value: 0, percentage: '0%', color: '#7c3aed' },
            { name: 'IT', value: 0, percentage: '0%', color: '#0d9488' }
        ];

    const recentEmployees = hrStats.recentEmployees && hrStats.recentEmployees.length > 0
        ? hrStats.recentEmployees
        : [];

    // Stats mapping using single source of truth from attendance API
    const totalEmployees = attendanceData?.totalEmployees || 0;
    const presentToday = attendanceData?.presentToday || 0;
    const onLeave = attendanceData?.onLeaveToday || 0;
    const pending = attendanceData?.pendingToday || 0;
    const absentToday = attendanceData?.absentToday || 0;

    // Determine IST time for the banner message
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (5.5 * 60 * 60 * 1000));
    const isAfter5PM = istTime.getHours() >= 17;

    return (
        <div className="hr-workspace">
            {/* Breadcrumb */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">HR Dashboard</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title">HR Dashboard</h1>
                    <p className="header-subtitle">Overview of workforce attendance, department distributions, and recent hires.</p>
                    <div className={`attendance-banner ${isAfter5PM ? 'success' : 'warning'}`}>
                        {isAfter5PM 
                            ? "Absent marking completed for today." 
                            : "Absent will be automatically marked after 5:00 PM."}
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-primary-blue flex-center gap-8" onClick={() => navigate('/hrms')}>
                        <UserPlus size={16} /> Manage Employees
                    </button>
                </div>
            </header>

            {/* 5 Stats Cards */}
            <section className="hr-metrics-grid">
                <div className="hr-metric-card">
                    <div className="card-top">
                        <span className="label">Total Employees</span>
                        <span className="icon">👥</span>
                    </div>
                    <span className="value">{totalEmployees}</span>
                </div>
                <div className="hr-metric-card border-green">
                    <div className="card-top">
                        <span className="label text-green">Present Today</span>
                        <span className="icon">✅</span>
                    </div>
                    <span className="value text-green">{presentToday}</span>
                </div>
                <div className="hr-metric-card border-orange">
                    <div className="card-top">
                        <span className="label text-orange">On Leave</span>
                        <span className="icon">🌴</span>
                    </div>
                    <span className="value text-orange">{onLeave}</span>
                </div>
                <div className="hr-metric-card border-blue">
                    <div className="card-top">
                        <span className="label text-blue">Pending</span>
                        <span className="icon">⏳</span>
                    </div>
                    <span className="value text-blue">{pending}</span>
                </div>
                <div className="hr-metric-card border-red">
                    <div className="card-top">
                        <span className="label text-red">Absent Today</span>
                        <span className="icon">❌</span>
                    </div>
                    <span className="value text-red">{absentToday}</span>
                </div>
            </section>

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Employee Distribution */}
                <div className="chart-card">
                    <h3 className="card-title">Employee Distribution</h3>
                    <div className="distribution-container">
                        <div className="donut-chart-box">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie 
                                        data={employeeDistribution}
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {employeeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-label-box">
                                <span className="donut-val">{totalEmployees}</span>
                                <span className="donut-lbl">Total</span>
                            </div>
                        </div>
                        <div className="distribution-legend">
                            {employeeDistribution.map((dept, idx) => (
                                <div key={idx} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: dept.color }}></span>
                                    <span className="name">{dept.name}</span>
                                    <span className="val">{dept.value} ({dept.percentage})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Employees */}
                <div className="chart-card">
                    <div className="card-header-flex">
                        <h3 className="card-title">Recent Employees</h3>
                        <span className="view-all" onClick={() => navigate('/hrms')}>View All</span>
                    </div>
                    <div className="employees-list">
                        {recentEmployees.map((emp, idx) => (
                            <div key={idx} className="employee-row">
                                <div className="avatar-circle">
                                    {emp.avatar}
                                </div>
                                <div className="info">
                                    <span className="name">{emp.name}</span>
                                    <span className="role">{emp.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .hr-workspace {
                    padding: 24px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                
                .crumb:hover {
                    color: var(--primary);
                }
                
                .crumb.active {
                    color: var(--text-primary);
                    cursor: default;
                }
                
                .separator {
                    color: var(--text-muted);
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 6px 0;
                    letter-spacing: -0.5px;
                }
                
                .header-subtitle {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0;
                }
                
                .btn-primary-blue {
                    background: var(--primary);
                    color: #ffffff;
                    padding: 12px 20px;
                    border-radius: var(--radius-md, 12px);
                    font-weight: 700;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
                    display: inline-flex;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s ease;
                }
                
                .btn-primary-blue:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
                }

                /* Stats Cards styling */
                .hr-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 20px;
                }
                
                .hr-metric-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.25s ease;
                }

                .hr-metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--border-hover);
                }
                
                .border-green { border-color: var(--success); }
                .border-orange { border-color: var(--warning); }
                .border-purple { border-color: #8b5cf6; }
                .border-blue { border-color: #3b82f6; }
                
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .card-top .label {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .card-top .icon {
                    font-size: 20px;
                    transition: transform 0.2s ease;
                }

                .hr-metric-card:hover .icon {
                    transform: scale(1.1);
                }
                
                .hr-metric-card .value {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }
                
                .text-green { color: var(--success); }
                .text-orange { color: var(--warning); }
                .text-purple { color: #8b5cf6; }
                .text-blue { color: #3b82f6; }

                /* Banner styling */
                .attendance-banner {
                    margin-top: 10px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    display: inline-block;
                }
                .attendance-banner.warning {
                    background-color: #fffbeb;
                    color: #b45309;
                    border: 1px solid #fde68a;
                }
                .attendance-banner.success {
                    background-color: #f0fdf4;
                    color: #15803d;
                    border: 1px solid #bbf7d0;
                }

                /* Charts Row */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 24px;
                }
                
                .chart-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                }
                
                .card-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 20px 0;
                }
                
                .distribution-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                }
                
                .donut-chart-box {
                    position: relative;
                    width: 200px;
                    height: 200px;
                    flex-shrink: 0;
                }
                
                .donut-label-box {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .donut-val {
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                
                .donut-lbl {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                }
                
                .distribution-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                }
                
                .legend-item .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                
                .legend-item .name {
                    font-weight: 600;
                    color: var(--text-secondary);
                    flex: 1;
                }
                
                .legend-item .val {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .card-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .view-all {
                    font-size: 12px;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                .view-all:hover {
                    color: #1d4ed8;
                }
                
                .employees-list {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }
                
                .employee-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 10px 0;
                    border-bottom: 1px solid var(--border);
                }
                
                .employee-row:last-child {
                    border-bottom: none;
                }
                
                .avatar-circle {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: var(--primary-50);
                    color: var(--primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                
                .employee-row .info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .employee-row .name {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                
                .employee-row .role {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                
                .dash-loading-wrapper {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: var(--text-muted);
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .dash-spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid var(--primary-100);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-8 { gap: 8px; }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .hr-metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (max-width: 480px) {
                    .hr-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default HRDashboard;
