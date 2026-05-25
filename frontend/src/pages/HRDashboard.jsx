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
    const [loading, setLoading] = useState(true);

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#7c3aed', '#0d9488'];

    useEffect(() => {
        const fetchHRData = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setData(data);
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

    const employeeDistribution = [
        { name: 'HR', value: 45, percentage: '12.6%', color: '#2563eb' },
        { name: 'Finance', value: 67, percentage: '18.8%', color: '#10b981' },
        { name: 'Sales', value: 98, percentage: '27.5%', color: '#f59e0b' },
        { name: 'Operations', value: 89, percentage: '25.0%', color: '#7c3aed' },
        { name: 'IT', value: 57, percentage: '16.0%', color: '#0d9488' }
    ];

    const recentEmployees = [
        { name: 'John Doe', role: 'Software Engineer', avatar: 'JD' },
        { name: 'Jane Smith', role: 'HR Executive', avatar: 'JS' },
        { name: 'Michael Brown', role: 'Accountant', avatar: 'MB' },
        { name: 'Emily Davis', role: 'Sales Executive', avatar: 'ED' }
    ];

    // Stats mapping to reference mockup
    const totalEmployees = data?.stats?.totalEmployees ?? 356;
    const presentToday = 289;
    const onLeave = 34;
    const newJoiners = 12;

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
                </div>
                <div className="header-actions">
                    <button className="btn-primary-blue flex-center gap-8" onClick={() => navigate('/hrms')}>
                        <UserPlus size={16} /> Manage Employees
                    </button>
                </div>
            </header>

            {/* 4 Stats Cards */}
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
                <div className="hr-metric-card border-purple">
                    <div className="card-top">
                        <span className="label text-purple">New Joiners</span>
                        <span className="icon">🆕</span>
                    </div>
                    <span className="value text-purple">{newJoiners}</span>
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
                    background-color: #f1f5f9;
                    min-height: 100vh;
                    color: var(--dash-text-main);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--dash-text-muted);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .crumb:hover {
                    color: #2563eb;
                }
                
                .crumb.active {
                    color: #0f172a;
                    cursor: default;
                }
                
                .separator {
                    color: #94a3b8;
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                
                .header-subtitle {
                    font-size: 13px;
                    color: var(--dash-text-muted);
                    margin: 0;
                }
                
                .btn-primary-blue {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    display: inline-flex;
                    align-items: center;
                }
                
                .btn-primary-blue:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }

                /* Stats Cards styling */
                .hr-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .hr-metric-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .border-green { border-color: #bbf7d0; }
                .border-orange { border-color: #fef3c7; }
                .border-purple { border-color: #e9d5ff; }
                
                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .card-top .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--dash-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .card-top .icon {
                    font-size: 18px;
                }
                
                .hr-metric-card .value {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                
                .text-green { color: #10b981; }
                .text-orange { color: #f59e0b; }
                .text-purple { color: #7c3aed; }

                /* Charts Row */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .card-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                }
                
                .distribution-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }
                
                .donut-chart-box {
                    position: relative;
                    width: 180px;
                    height: 180px;
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
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f172a;
                }
                
                .donut-lbl {
                    font-size: 10px;
                    color: var(--dash-text-muted);
                    font-weight: 600;
                }
                
                .distribution-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex: 1;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                }
                
                .legend-item .dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    margin-right: 8px;
                    flex-shrink: 0;
                }
                
                .legend-item .name {
                    font-weight: 600;
                    color: #475569;
                    flex: 1;
                }
                
                .legend-item .val {
                    font-weight: 700;
                    color: #0f172a;
                }

                .card-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .view-all {
                    font-size: 11px;
                    color: #2563eb;
                    font-weight: 700;
                    cursor: pointer;
                }
                
                .employees-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .employee-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .employee-row:last-child {
                    border-bottom: none;
                }
                
                .avatar-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                
                .employee-row .info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .employee-row .name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e293b;
                }
                
                .employee-row .role {
                    font-size: 11px;
                    color: var(--dash-text-muted);
                }
                
                .dash-loading-wrapper {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                }
                
                .dash-spinner {
                    width: 44px;
                    height: 44px;
                    border: 3px solid rgba(37, 99, 235, 0.1);
                    border-top: 3px solid #2563eb;
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
