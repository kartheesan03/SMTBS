import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    Users, Search, Bell, Moon,
    Briefcase, Activity, FileText,
    Menu, Calendar, Clock, LogOut, Settings as SettingsIcon, User as UserIcon, UserCheck, DollarSign, AlertCircle
} from 'lucide-react';
import {
    EmptyState, SkeletonCard,
    TopWelcomeBar, PremiumKPICard, TimelineWidget,
    PendingApprovalsList, QuickActionsGrid
} from '../components/AdminDashboard/DashboardWidgets';
import { SalesAreaChart, InventoryStatusDonut } from '../components/AdminDashboard/AnalyticsCharts';
import CommandCenter from '../components/CommandCenter';
import UserAvatar from '../components/UserAvatar';
import '../components/AdminDashboard/AdminDashboardPremium.css';

const HRDashboard = () => {
    const { user, logout } = useContext(AuthContext);

    // Fallback logic for user profile data (handles both flat and nested user objects)
    const displayName = user?.name || user?.user?.name || 'HR Admin';
    const displayRole = user?.role || user?.user?.role || 'Human Resources';
    const displayEmail = user?.email || user?.user?.email || 'hr@smtbms.com';

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    
    // Add additional state variables needed for HR specific widgets
    const [employees, setEmployees] = useState([]);
    const [leavesData, setLeavesData] = useState([]);
    const [salariesData, setSalariesData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.erp-profile-menu-container')) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, empRes, leavesRes, salariesRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/employees').catch(e => ({ data: [] })),
                    API.get('/leaves').catch(e => ({ data: [] })),
                    API.get('/salaries').catch(e => ({ data: [] }))
                ]);
                
                setDashboardData(statsRes.data || {});
                setEmployees(empRes.data || []);
                setLeavesData(leavesRes.data || []);
                setSalariesData(salariesRes.data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (root.getAttribute('data-theme') === 'dark') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'dark');
        }
    };

    if (loading) {
        return (
            <div className="erp-dashboard-container">
                <div className="erp-main-content">
                    <div className="erp-summary-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="erp-dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <EmptyState icon={Activity} title="Error Loading Data" message={error} />
            </div>
        );
    }

    const dashboard = dashboardData || {};
    const hrStats = dashboard.hrStats || {};

    const uniqueEmployees = Array.from(new Map(employees.map(e => [e.employeeId || e._id || Math.random(), e])).values());

    const totalEmployees = uniqueEmployees.length;
    const presentToday = hrStats.presentToday || 0;
    const onLeave = hrStats.onLeave || 0;
    const absentToday = hrStats.absentToday || 0;
    const newJoiners = employees.filter(e => e.createdAt && new Date(e.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length || 0;

    const pendingLeaves = (leavesData || []).filter(l => l.status === 'Pending').length;
    const pendingSalaries = (salariesData || []).filter(s => s.status === 'Awaiting Approval').length;
    const pendingApprovals = pendingLeaves + pendingSalaries;

    const salaries = salariesData || [];
    let payrollProcessed = 0;
    if (salaries.length > 0) {
        const paidSalaries = salaries.filter(s => s.status === 'Paid').length;
        payrollProcessed = Math.round((paidSalaries / salaries.length) * 100);
    }

    const todayData = {
        attendance: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
        employees: totalEmployees,
        onLeave: onLeave,
        alerts: pendingApprovals
    };

    const pendingApprovalsData = [
        { name: 'Pending Leaves', count: pendingLeaves },
        { name: 'Pending Salaries', count: pendingSalaries }
    ].filter(item => item.count > 0);

    const attendanceDonutData = [
        { name: 'Present', value: presentToday, color: '#10b981' },
        { name: 'Absent', value: absentToday, color: '#ef4444' },
        { name: 'On Leave', value: onLeave, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    let recentActivities = dashboard.recentActivity || [];
    if (recentActivities.length === 0 && leavesData.length > 0) {
        recentActivities = [...leavesData].reverse().slice(0, 5).map(l => ({
            id: l._id,
            text: `Leave request from ${l.employeeName || 'Employee'} (${l.status || 'Pending'})`,
            time: new Date(l.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: '#8b5cf6'
        }));
    } else {
        recentActivities = recentActivities.map(a => ({
            text: a.text,
            time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: '#3b82f6'
        }));
    }

    const kpiCards = [
        { title: 'Total Employees', value: totalEmployees, icon: Users, color: '#3b82f6', trend: `+${newJoiners} new joiners`, trendType: 'up' },
        { title: 'Present Today', value: presentToday, icon: UserCheck, color: '#10b981', trend: `${todayData.attendance}% attendance`, trendType: 'up' },
        { title: 'On Leave', value: onLeave, icon: Moon, color: '#f59e0b', trend: `${pendingLeaves} pending`, trendType: 'down' },
        { title: 'Pending Approvals', value: pendingApprovals, icon: AlertCircle, color: '#ef4444', trend: 'Needs attention', trendType: 'down' }
    ];

    return (
        <div className="erp-dashboard-container">
            {/* Top Navigation */}
            <header className="erp-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                    <Menu size={24} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => window.dispatchEvent(new CustomEvent('openModuleLauncher'))} />
                    <div className="erp-global-search" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '8px', width: '400px', cursor: 'text' }} onClick={() => setIsCommandCenterOpen(true)}>
                        <Search size={18} color="#94a3b8" />
                        <input type="text" placeholder="Search across ERP..." className="erp-search-input" style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#1e293b', cursor: 'text' }} readOnly />
                    </div>
                </div>

                <div className="erp-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="erp-datetime" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '12px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#1e293b' }}>
                            <Calendar size={12} />
                            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Clock size={12} />
                            <span>{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                        </div>
                    </div>

                    <button className="erp-icon-btn erp-notification-btn" style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                        <Bell size={20} color="#64748b" />
                        {pendingApprovals > 0 && <span className="erp-notification-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{pendingApprovals}</span>}
                    </button>

                    <button className="erp-icon-btn" onClick={toggleDarkMode} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Moon size={20} color="#64748b" />
                    </button>

                    <div className="erp-profile-menu-container" style={{ position: 'relative' }}>
                        <div className="erp-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingLeft: '24px', borderLeft: '1px solid #e2e8f0' }} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                            <div className="module-wb-avatar">
                                <UserAvatar
                                    src={user?.picture || user?.avatar || user?.user?.picture || user?.user?.avatar}
                                    name={displayName}
                                    size={48}
                                />
                            </div>
                            <div className="erp-profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className="erp-profile-name" style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{displayName}</span>
                                <span className="erp-profile-role" style={{ fontSize: '12px', color: '#64748b' }}>{displayRole}</span>
                            </div>
                        </div>

                        {isProfileMenuOpen && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '220px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', zIndex: 50, overflow: 'hidden' }}>
                                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>{displayName}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{displayEmail}</div>
                                </div>
                                <div style={{ padding: '8px 0' }}>
                                    <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#475569', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <UserIcon size={16} /> My Profile
                                    </button>
                                    <button onClick={() => navigate('/settings')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#475569', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <SettingsIcon size={16} /> Account Settings
                                    </button>
                                </div>
                                <div style={{ padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
                                    <button onClick={() => logout()} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#ef4444', textAlign: 'left', fontWeight: '500' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="erp-main-content erp-dashboard-main">
                {/* Row 1: Welcome & Quick Metrics */}
                <TopWelcomeBar username={displayName.split(' ')[0]} data={todayData} />

                {/* Row 2: Premium KPI Cards */}
                <div className="erp-premium-kpi-grid">
                    <PremiumKPICard
                        title="Total Employees" value={totalEmployees} subtitle="Active Workforce"
                        icon={Users} color="#3b82f6" trendValue="+5%"
                    />
                    <PremiumKPICard
                        title="Present Today" value={presentToday} subtitle="Daily Attendance"
                        icon={UserCheck} color="#10b981" trendValue="+2%"
                    />
                    <PremiumKPICard
                        title="On Leave" value={onLeave} subtitle="Currently Away"
                        icon={Calendar} color="#f59e0b" trendValue="-1%"
                    />
                    <PremiumKPICard
                        title="New Joiners" value={newJoiners} subtitle="Past 30 Days"
                        icon={Briefcase} color="#8b5cf6" trendValue="+12%"
                    />
                    <PremiumKPICard
                        title="Pending Approvals" value={pendingApprovals} subtitle="Needs Attention"
                        icon={AlertCircle} color="#ef4444" trendValue="-5%"
                    />
                    <PremiumKPICard
                        title="Payroll Processed" value={payrollProcessed} subtitle="Current Month" isCurrency={false} prefix="" suffix="%"
                        icon={DollarSign} color="#14b8a6" trendValue="+1%"
                    />
                </div>

                {/* Row 3: Charts & Timelines */}
                <div className="erp-premium-row-3">
                    {dashboard.charts?.monthlyStats && <SalesAreaChart data={dashboard.charts.monthlyStats} />}
                    <InventoryStatusDonut 
                        inventoryData={attendanceDonutData} 
                        totalItems={totalEmployees} 
                        title="Today's Attendance" 
                        centerLabel="Total Staff" 
                    />
                    <TimelineWidget title="Recent Activities" items={recentActivities} viewAllLink={true} />
                </div>

                {/* Row 4: Bottom Widgets */}
                <div className="erp-premium-row-4">
                    <PendingApprovalsList approvals={pendingApprovalsData} />
                    <QuickActionsGrid />
                </div>
            </main>

            <CommandCenter
                isOpen={isCommandCenterOpen}
                onClose={() => setIsCommandCenterOpen(false)}
            />
        </div>
    );
};

export default HRDashboard;
