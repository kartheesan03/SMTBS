import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    Users, Search, Bell, Moon, Target, ShoppingBag, Award,
    Briefcase, Activity, FileText, CheckCircle, ListTodo,
    Menu, Calendar, Clock, LogOut, Settings as SettingsIcon, User as UserIcon, DollarSign, TrendingUp
} from 'lucide-react';
import {
    EmptyState, SkeletonCard,
    TopWelcomeBar, PremiumKPICard, TimelineWidget,
    QuickActionsGrid
} from '../components/AdminDashboard/DashboardWidgets';
import { SalesAreaChart, InventoryStatusDonut } from '../components/AdminDashboard/AnalyticsCharts';
import CommandCenter from '../components/CommandCenter';
import '../components/AdminDashboard/AdminDashboardPremium.css';

const SalesDashboard = () => {
    const { user, logout } = useContext(AuthContext);

    const displayName = user?.name || user?.user?.name || 'Sales Rep';
    const displayRole = user?.role || user?.user?.role || 'Sales';
    const displayEmail = user?.email || user?.user?.email || 'sales@smtbms.com';
    const displayAvatar = user?.picture || user?.avatar || user?.user?.picture || user?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [customersData, setCustomersData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [leadsData, setLeadsData] = useState([]);
    const [tasksData, setTasksData] = useState([]);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
                const [dashRes, custRes, ordRes, leadRes, taskRes] = await Promise.all([
                    API.get('/dashboard/stats').catch(e => ({ data: {} })),
                    API.get('/customers').catch(e => ({ data: [] })),
                    API.get('/orders').catch(e => ({ data: [] })),
                    API.get('/leads').catch(e => ({ data: [] })),
                    API.get('/tasks').catch(e => ({ data: [] }))
                ]);
                setDashboardData(dashRes.data || {});
                setCustomersData(custRes.data || []);
                setOrdersData(ordRes.data || []);
                setLeadsData(leadRes.data || []);
                setTasksData(taskRes.data || []);
                setError(null);
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
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
    const totalCustomers = customersData.length;
    const totalSales = ordersData.filter(o => o.status === 'Delivered' || o.status === 'Paid').length;
    
    const revenue = ordersData
        .filter(o => o.status === 'Delivered' || o.status === 'Paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const activeLeads = leadsData.filter(l => l.status !== 'Converted' && l.status !== 'Lost').length;
    
    let completedTasksCount = 0;
    let pendingTasksCount = 0;
    
    tasksData.forEach(task => {
        if (task.status === 'Completed' || task.status === 'Done') {
            completedTasksCount++;
        } else {
            pendingTasksCount++;
        }
    });

    const targetRevenue = 50000;
    const targetAchieved = revenue > 0 ? Math.min(Math.round((revenue / targetRevenue) * 100), 100) : 0;
    const conversionRate = (totalSales > 0 && activeLeads > 0) ? Math.round((totalSales / (totalSales + activeLeads)) * 100) : 15;

    const leadsStatusData = [
        { name: 'Active', value: activeLeads, color: '#3b82f6' },
        { name: 'Converted', value: leadsData.filter(l => l.status === 'Converted').length, color: '#10b981' },
        { name: 'Lost', value: leadsData.filter(l => l.status === 'Lost').length, color: '#ef4444' }
    ].filter(item => item.value > 0);

    const recentOrdersData = ordersData
        .slice(0, 5)
        .map(o => ({
            id: o._id,
            text: `Order ${o.orderNumber || ''} - $${o.totalAmount || 0} (${o.status})`,
            time: new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            color: o.status === 'Paid' || o.status === 'Delivered' ? '#10b981' : '#3b82f6'
        }));

    const todayData = {
        revenue: revenue.toLocaleString(),
        orders: totalSales,
        attendance: targetAchieved, // Using attendance prop for target achieved %
        alerts: activeLeads // Alerts showing active leads
    };

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
                        {activeLeads > 0 && <span className="erp-notification-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{activeLeads}</span>}
                    </button>

                    <button className="erp-icon-btn" onClick={toggleDarkMode} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Moon size={20} color="#64748b" />
                    </button>

                    <div className="erp-profile-menu-container" style={{ position: 'relative' }}>
                        <div className="erp-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingLeft: '24px', borderLeft: '1px solid #e2e8f0' }} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                            <div className="erp-profile-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px', overflow: 'hidden' }}>
                                <img src={displayAvatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        title="Total Revenue" value={revenue} subtitle="This Month" isCurrency={true} prefix="$"
                        icon={DollarSign} color="#10b981" trend="up" trendValue="+15%"
                    />
                    <PremiumKPICard
                        title="Completed Sales" value={totalSales} subtitle="Closed Won"
                        icon={ShoppingBag} color="#3b82f6" trend="up" trendValue="+8%"
                    />
                    <PremiumKPICard
                        title="Active Leads" value={activeLeads} subtitle="In Pipeline"
                        icon={Target} color="#f59e0b" trend="up" trendValue="+12"
                    />
                    <PremiumKPICard
                        title="Total Customers" value={totalCustomers} subtitle="Active Accounts"
                        icon={Users} color="#8b5cf6" trend="up" trendValue="+5%"
                    />
                    <PremiumKPICard
                        title="Conversion Rate" value={conversionRate} subtitle="Leads to Sales" isCurrency={false} prefix="" suffix="%"
                        icon={TrendingUp} color="#10b981" trend="up" trendValue="+2%"
                    />
                    <PremiumKPICard
                        title="Target Achieved" value={targetAchieved} subtitle="Monthly Goal" isCurrency={false} prefix="" suffix="%"
                        icon={Award} color="#ef4444" trend="up" trendValue="+5%"
                    />
                </div>

                {/* Row 3: Charts & Timelines */}
                <div className="erp-premium-row-3">
                    {dashboard.charts?.monthlyStats ? <SalesAreaChart data={dashboard.charts.monthlyStats} /> : <div className="erp-premium-card" style={{ flex: 2, minWidth: '400px' }}><div className="erp-card-header"><h3 className="erp-card-title">Sales Overview</h3></div><div className="erp-card-body" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>No data available</div></div>}
                    <InventoryStatusDonut 
                        inventoryData={leadsStatusData} 
                        totalItems={leadsData.length} 
                        title="Leads Pipeline" 
                        centerLabel="Total Leads" 
                    />
                    <TimelineWidget title="Recent Orders" items={recentOrdersData} viewAllLink={true} />
                </div>

                {/* Row 4: Bottom Widgets */}
                <div className="erp-premium-row-4">
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

export default SalesDashboard;
