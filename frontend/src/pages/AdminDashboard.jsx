import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import {
    Users, DollarSign, Search, Bell, Moon,
    ShoppingCart, Briefcase, Activity, Package, FileText,
    Menu, Calendar, Clock, LogOut, Settings as SettingsIcon, User as UserIcon
} from 'lucide-react';
import {
    EmptyState, SkeletonCard, RoleBasedRenderer,
    TopWelcomeBar, PremiumKPICard, TimelineWidget,
    PendingApprovalsList, TopSellingMaterialsTable, QuickActionsGrid
} from '../components/AdminDashboard/DashboardWidgets';
import { SalesAreaChart, CategoryPieChart, PerformanceBarChart, InventoryStatusDonut } from '../components/AdminDashboard/AnalyticsCharts';
import { RecentTransactions } from '../components/AdminDashboard/RecentTransactions';
import CommandCenter from '../components/CommandCenter';
import '../components/AdminDashboard/AdminDashboardPremium.css';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);

    // Fallback logic for user profile data (handles both flat and nested user objects)
    const displayName = user?.name || user?.user?.name || 'System Admin';
    const displayRole = user?.role || user?.user?.role || 'Super Admin';
    const displayEmail = user?.email || user?.user?.email || 'admin@smtbms.com';
    const displayAvatar = user?.picture || user?.avatar || user?.user?.picture || user?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

    const navigate = useNavigate();
    const [data, setData] = useState(null);
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
                const response = await API.get('/dashboard/stats');
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);


    // Derived values with safe fallbacks
    const stats = data?.stats || {};
    const charts = data?.charts || {};
    const tables = data?.tables || {};

    // Extrapolate logic for metrics requested based on available backend data
    const totalRevenue = data?.totalRevenue || 0;
    const totalExpenses = stats?.purchaseCost || 0;
    const netProfit = totalRevenue - totalExpenses;
    const totalInventory = data?.totalStockQuantity || 0;
    const totalEmployees = data?.totalEmployees || 0;
    const totalOrders = stats?.activeOrdersCount || 0;

    // Compute dynamic trends
    const currentMonthStats = charts?.monthlyStats && charts.monthlyStats.length > 0 ? charts.monthlyStats[charts.monthlyStats.length - 1] : { revenue: 0, sales: 0 };
    const prevMonthStats = charts?.monthlyStats && charts.monthlyStats.length > 1 ? charts.monthlyStats[charts.monthlyStats.length - 2] : { revenue: 0, sales: 0 };

    let revenueTrend = 0;
    if (prevMonthStats.revenue > 0) {
        revenueTrend = ((currentMonthStats.revenue - prevMonthStats.revenue) / prevMonthStats.revenue) * 100;
    }
    const revenueTrendStr = revenueTrend !== 0 ? `${Math.abs(revenueTrend).toFixed(1)}% vs last month` : null;
    const revenueTrendDir = revenueTrend >= 0 ? 'up' : 'down';

    let ordersTrend = 0;
    if (prevMonthStats.sales > 0) {
        ordersTrend = ((currentMonthStats.sales - prevMonthStats.sales) / prevMonthStats.sales) * 100;
    }
    const ordersTrendStr = ordersTrend !== 0 ? `${Math.abs(ordersTrend).toFixed(1)}% vs last month` : null;
    const ordersTrendDir = ordersTrend >= 0 ? 'up' : 'down';

    const empTrend = data?.hrStats?.newJoiners > 0 && totalEmployees > 0 ? (data.hrStats.newJoiners / totalEmployees) * 100 : 0;
    const empTrendStr = empTrend > 0 ? `${empTrend.toFixed(1)}% vs last month` : null;

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

    const todayData = {
        revenue: data?.totalRevenue ? data.totalRevenue.toLocaleString() : '0',
        purchase: stats?.purchaseCost ? stats.purchaseCost.toLocaleString() : '0',
        orders: stats?.activeOrdersCount ?? 0,
        attendance: data?.hrStats?.presentToday !== undefined && data?.hrStats?.totalEmployees
            ? Math.round((data.hrStats.presentToday / data.hrStats.totalEmployees) * 100)
            : 0,
        lowStock: data?.materialStats?.lowStockCount || 0,
        alerts: tables?.recentActivity?.length || 0
    };

    const recentActivities = (tables?.recentActivity || []).map(a => ({
        text: a.text,
        time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: '#3b82f6'
    }));

    const notifications = (tables?.recentActivity || []).filter(a => a.type === 'alert' || a.category === 'alert').map(a => ({
        text: a.text,
        time: new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: '#f59e0b'
    }));

    const pendingApprovalsData = [
        { name: 'Pending Orders', count: stats?.pendingOrders || 0 },
        { name: 'Pending Salaries', count: stats?.pendingSalaries || 0 },
        { name: 'Pending Customers', count: stats?.pendingCustomers || 0 },
        { name: 'Pending Leaves', count: data?.hrStats?.pending || 0 }
    ].filter(item => item.count > 0);

    const inventoryDonutData = [
        { name: 'In Stock', value: (data?.totalStockQuantity || 0) - (data?.materialStats?.lowStockCount || 0), color: '#10b981' },
        { name: 'Low Stock', value: data?.materialStats?.lowStockCount || 0, color: '#f59e0b' },
        { name: 'In Transit', value: data?.materialStats?.inTransitCount || 0, color: '#3b82f6' }
    ].filter(item => item.value > 0);

    const topMaterialsData = (tables?.topSellingMaterials || []).slice(0, 5).map(m => ({
        name: m.name,
        category: m.category,
        sales: m.sales,
        revenue: m.revenue,
        trend: 'up',
        trendValue: 'Popular'
    }));

    return (
        <div className="erp-dashboard-container">

            {/* Top Navigation */}
            <header className="erp-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                    <Menu
                        size={24}
                        color="#64748b"
                        style={{ cursor: 'pointer' }}
                        onClick={() => window.dispatchEvent(new CustomEvent('openModuleLauncher'))}
                    />
                    <div
                        className="erp-global-search"
                        style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '8px', width: '400px', cursor: 'text' }}
                        onClick={() => setIsCommandCenterOpen(true)}
                    >
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search across ERP..."
                            className="erp-search-input"
                            style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#1e293b', cursor: 'text' }}
                            readOnly
                        />
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

                    <button
                        className="erp-icon-btn erp-notification-btn"
                        style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={() => navigate('/notifications')}
                    >
                        <Bell size={20} color="#64748b" />
                        <span className="erp-notification-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>4</span>
                    </button>

                    <button className="erp-icon-btn" onClick={toggleDarkMode} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Moon size={20} color="#64748b" />
                    </button>

                    <div className="erp-profile-menu-container" style={{ position: 'relative' }}>
                        <div
                            className="erp-profile-menu"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingLeft: '24px', borderLeft: '1px solid #e2e8f0' }}
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        >
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
                <TopWelcomeBar username={user?.name} data={todayData} />

                {/* Row 2: Premium KPI Cards */}
                <div className="erp-premium-kpi-grid">
                    <PremiumKPICard
                        title="Total Revenue" value={totalRevenue || 0} subtitle="This Month" isCurrency={true} prefix="$"
                        icon={DollarSign} color="#3b82f6" trend={revenueTrendDir} trendValue={revenueTrendStr}
                    />
                    <PremiumKPICard
                        title="Total Expenses" value={totalExpenses || 0} subtitle="This Month" isCurrency={true} prefix="$"
                        icon={FileText} color="#ef4444"
                    />
                    <PremiumKPICard
                        title="Net Profit" value={netProfit || 0} subtitle="This Year" isCurrency={true} prefix="$"
                        icon={Activity} color="#10b981"
                    />
                    <PremiumKPICard
                        title="Inventory Quantity" value={totalInventory || 0} subtitle="Current Total" isCurrency={false}
                        icon={Package} color="#8b5cf6"
                    />
                    <PremiumKPICard
                        title="Total Employees" value={totalEmployees || 0} subtitle="Active" isCurrency={false}
                        icon={Users} color="#f59e0b" trend="up" trendValue={empTrendStr}
                    />
                    <PremiumKPICard
                        title="Active Orders" value={totalOrders || 0} subtitle="Current" isCurrency={false}
                        icon={ShoppingCart} color="#3b82f6" trend={ordersTrendDir} trendValue={ordersTrendStr}
                    />
                </div>

                {/* Row 3: Charts & Timelines */}
                <div className="erp-premium-row-3">
                    <SalesAreaChart data={charts?.monthlyStats || []} />
                    <TopSellingMaterialsTable materials={topMaterialsData} />
                    <TimelineWidget title="Recent Activities" items={recentActivities} viewAllLink={true} />
                </div>

                {/* Row 4: Bottom Widgets */}
                <div className="erp-premium-row-4">
                    <InventoryStatusDonut inventoryData={inventoryDonutData} totalItems={totalInventory} />
                    <PendingApprovalsList approvals={pendingApprovalsData} />
                    <QuickActionsGrid />
                    <TimelineWidget title="Notifications" items={notifications} viewAllLink={true} />
                </div>

            </main>

            <CommandCenter
                isOpen={isCommandCenterOpen}
                onClose={() => setIsCommandCenterOpen(false)}
            />
        </div>
    );
};

export default AdminDashboard;
