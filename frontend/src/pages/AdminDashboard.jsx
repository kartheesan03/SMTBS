import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import API from '../api/axios';
import {
    Users, Briefcase, ShoppingCart, Plus,
    BarChart2, Search, TrendingUp, TrendingDown,
    Bell, UserPlus, FileText, CheckCircle2,
    CheckCircle, Calendar, DollarSign, Box, Truck, Tag,
    Layers, Cpu, PhoneCall, ListTodo, UserCheck, LayoutGrid, Clock, Target, Server, Activity, AlertCircle, AlertTriangle,
    ArrowUpRight, Package, BarChart as BarChartIcon, Zap, MapPin, Building2
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar, Legend } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import CommandCenter from '../components/CommandCenter';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import { LoadingState, ErrorState, EmptyState } from '../components/DataStates';

// ─── Unified KPI Card ────────────────────────────────────────────────────────
// Accent colors are functional: green=good/performance, purple=business metric,
// orange=inventory/stock, teal=people, blue=informational
const KPI_THEMES = {
    green:  { main: '#637D68', bg: 'rgba(99,125,104,0.03)', border: 'rgba(99,125,104,0.2)', iconBg: 'rgba(99,125,104,0.1)' },
    purple: { main: '#64748B', bg: 'rgba(100,116,139,0.03)', border: 'rgba(100,116,139,0.2)', iconBg: 'rgba(100,116,139,0.1)' },
    orange: { main: '#A37F39', bg: 'rgba(163,127,57,0.03)', border: 'rgba(163,127,57,0.2)', iconBg: 'rgba(163,127,57,0.1)' },
    teal:   { main: '#52797B', bg: 'rgba(82,121,123,0.03)', border: 'rgba(82,121,123,0.2)', iconBg: 'rgba(82,121,123,0.1)' },
    blue:   { main: '#8D806F', bg: 'rgba(141,128,111,0.03)', border: 'rgba(141,128,111,0.2)', iconBg: 'rgba(141,128,111,0.1)' },
    pink:   { main: '#846274', bg: 'rgba(132,98,116,0.03)', border: 'rgba(132,98,116,0.2)', iconBg: 'rgba(132,98,116,0.1)' },
};

export const DashboardKPICard = ({ title, value, icon: Icon, theme = 'purple', trendValue, trendUp = true, sparklineData }) => {
    const t = KPI_THEMES[theme] || KPI_THEMES.purple;
    // Each card gets a distinct sparkline shape via its seed
    const defaultData = sparklineData || Array.from({ length: 12 }, (_, i) => ({
        v: 40 + Math.sin((i + title.charCodeAt(0)) * 0.7) * 20 + (trendUp ? i * 1.5 : -i * 1)
    }));

    const gradId = `spark-${title.replace(/\s+/g, '-')}`;

    return (
        <div className="dash-kpi-card" style={{ backgroundColor: t.bg, borderColor: t.border }}>
            {/* Header: label left, icon right */}
            <div className="dash-kpi-header">
                <span className="dash-kpi-eyebrow" style={{ color: t.main }}>{title}</span>
                <div className="dash-kpi-icon-badge" style={{ background: t.iconBg }}>
                    <Icon size={16} strokeWidth={2.5} color={t.main} />
                </div>
            </div>

            {/* Big number */}
            <div className="dash-kpi-value">{value}</div>

            {/* Caption: Plain text, wraps to 2 lines, never truncates. Semantic color for trend. */}
            <div className="dash-kpi-trend-badge" style={{ color: trendUp ? '#059669' : '#DC2626' }}>
                {trendUp ? <TrendingUp size={11} strokeWidth={3} style={{ flexShrink: 0 }} /> : <TrendingDown size={11} strokeWidth={3} style={{ flexShrink: 0 }} />}
                <span>{trendValue}</span>
            </div>

            {/* Sparkline — Area chart with gradient */}
            <div className="dash-kpi-sparkline-row">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={defaultData}>
                        <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={t.main} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={t.main} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={t.main} strokeWidth={1.5} fillOpacity={1} fill={`url(#${gradId})`} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ─── Quick Action Item ────────────────────────────────────────────────────────
export const IconQuickAction = ({ icon: Icon, label, colorClass, onClick }) => (
    <div className="qa-item" onClick={onClick}>
        <div className={`qa-icon-wrapper ${colorClass}`}>
            <Icon size={20} strokeWidth={2} />
        </div>
        <div className="qa-label">{label}</div>
    </div>
);

// ─── Inventory Row Item ───────────────────────────────────────────────────────
export const InvRow = ({ icon: Icon, iconBg, iconColor, label, value, caption, isAlert }) => (
    <div className="inv-row">
        <div className="inv-row-icon" style={{ background: iconBg }}>
            <Icon size={14} strokeWidth={2.5} color={iconColor} />
        </div>
        <div className="inv-row-info">
            <span className="inv-row-label">{label}</span>
            {caption && <span className="inv-row-caption">{caption}</span>}
        </div>
        <div className="inv-row-value" style={{ color: isAlert ? '#DC2626' : '#0f172a' }}>
            {value}
        </div>
    </div>
);

// ─── Legacy exports (still used by other dashboard pages) ────────────────────
export const SparklineKPICard = ({ title, value, trend, trendValue, icon: Icon, colorClass }) => {
    const themeMap = { 'icon-green': 'green', 'icon-purple': 'purple', 'icon-orange': 'orange',
                       'icon-teal': 'teal', 'icon-blue': 'blue', 'icon-pink': 'purple', 'icon-dark': 'purple' };
    return (
        <DashboardKPICard
            title={title} value={value} icon={Icon}
            theme={themeMap[colorClass] || 'purple'}
            trendValue={trendValue} trendUp={trend !== 'down'}
        />
    );
};

export const MiniStatCard = ({ title, value, subValue, icon: Icon, colorClass, trendColor }) => {
    const colorMap = {
        'bg-light-blue': { bg: '#eff6ff', color: '#2563EB' },
        'bg-light-green': { bg: '#ecfdf5', color: '#059669' },
        'bg-light-orange': { bg: '#fffbeb', color: '#D97706' },
        'bg-light-purple': { bg: '#f5f3ff', color: '#7C3AED' },
        'bg-light-red': { bg: '#fef2f2', color: '#DC2626' },
        'bg-light-teal': { bg: '#f0fdfa', color: '#0D9488' },
        'bg-light-indigo': { bg: '#eef2ff', color: '#4338CA' },
    };
    const c = colorMap[colorClass] || { bg: '#f3f4f6', color: '#6b7280' };
    return (
        <InvRow icon={Icon} iconBg={c.bg} iconColor={c.color} label={title} value={value} caption={subValue} />
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
    
    // Centralized Data Fetch
    const { data: dashboardData, loading, error } = useDashboardData();
    
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [revenueTrendYear, setRevenueTrendYear] = useState('current');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksRes = await API.get('/tasks');
                const now = new Date();
                const futureTasks = (tasksRes.data || [])
                    .filter(t => t.dueDate && new Date(t.dueDate) >= now)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 3)
                    .map(t => {
                        const d = new Date(t.dueDate);
                        let col = '#4f46e5'; let bg = '#e0e7ff';
                        if (t.priority === 'High') { col = '#ef4444'; bg = '#fee2e2'; }
                        if (t.priority === 'Low') { col = '#10b981'; bg = '#d1fae5'; }
                        return {
                            day: String(d.getDate()).padStart(2, '0'),
                            month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                            bg, col,
                            title: t.title,
                            desc: `${d.getDate()} ${d.toLocaleString('default', { month: 'long' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        };
                    });
                setUpcomingEvents(futureTasks);
            } catch (err) {
                console.error('Failed to load upcoming tasks', err);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandCenterOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (loading) return <LoadingState message="Loading business overview..." height="100vh" />;
    if (error) return <ErrorState message="Failed to load dashboard data. Please try again." height="100vh" />;

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatINR = (val) => {
        if (!val) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
        return `₹${val}`;
    };

    // KPI data
    const totalRevenue       = dashboardData?.stats?.revenue || 0;
    const totalMaterials     = dashboardData?.stats?.totalMaterials || 0;
    const lowStock           = dashboardData?.tables?.lowStock || [];
    const totalEmployees     = dashboardData?.stats?.totalEmployees || 0;
    const activeCustomers    = dashboardData?.stats?.activeCustomers || 0;
    const totalOrders        = dashboardData?.stats?.totalOrders || 0;
    const activeOrdersCount  = dashboardData?.stats?.activeOrdersCount || 0;
    const totalVendors       = dashboardData?.stats?.totalVendors || 0;
    const orderFulfillment   = dashboardData?.analytics?.healthMetrics?.orderFulfillment || 0;
    const pendingOrders      = dashboardData?.stats?.pendingOrders || 0;
    const completedTasks     = dashboardData?.stats?.completedTasks || 0;
    const pendingTasks       = dashboardData?.stats?.pendingTasks || 0;



    return (
        <div className="rd-container theme-admin">
            <div className="rd-content">

                {/* ── Page Header ── */}
                <PageHeader title="Admin Dashboard" badge="ADMIN" subtitle="Business overview & operations" />

                {/* ── 1. Hero Banner ── */}
                <div className="rd-hero">
                    <div className="rd-hero-left">
                        <div className="rd-hero-avatar-wrapper">
                            <img
                                src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2563EB&color=fff`}
                                alt="Profile"
                                className="rd-hero-avatar"
                            />
                            <div className="rd-hero-status-dot"></div>
                        </div>
                        <div>
                            <div className="rd-hero-greeting">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
                            </div>
                            <div className="rd-hero-subtitle">
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                &nbsp;·&nbsp; Here's your business overview
                            </div>
                            <div className="rd-hero-badges">
                                <span className="rd-hero-badge badge-neutral">
                                    <Package size={14} /> {activeOrdersCount} Active Orders
                                </span>
                                <span className="rd-hero-badge badge-status">
                                    <div className="status-dot-inline"></div> All Systems Operational
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="rd-hero-right">
                        <div className="rd-hero-visual">
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Efficiency</div>
                                <div className="rd-vc-value">98.2%</div>
                                <div className="rd-vc-chart"></div>
                            </div>
                            <div className="rd-visual-card">
                                <div className="rd-vc-label">Activity</div>
                                <div className="rd-vc-bars">
                                    <div className="rd-vc-bar" style={{height: '40%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '70%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '50%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '90%'}}></div>
                                    <div className="rd-vc-bar" style={{height: '60%'}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="rd-hero-actions-col">
                            <button className="hero-action-btn primary" onClick={() => navigate('/leave-management')}>
                                <CheckCircle size={15} /> Apply Leave
                            </button>
                            <button className="hero-action-btn secondary" onClick={() => navigate('/attendance')}>
                                <Clock size={15} /> Check In
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 2. KPI Row ── */}
                <PastelKPIGrid columns={6}>
                    <PastelKPICard title="Order Fulfillment" value={`${orderFulfillment}%`} colorTheme="mint" icon={Activity} trendValue="Successfully delivered" trendPositive={true} />
                    <PastelKPICard title="Total Orders" value={totalOrders} colorTheme="purple" icon={ShoppingCart} trendValue="12% vs last month" trendPositive={true} />
                    <PastelKPICard title="Total Revenue" value={formatINR(totalRevenue)} colorTheme="blue" icon={DollarSign} trendValue="8% vs last month" trendPositive={true} />
                    <PastelKPICard title="Total Materials" value={totalMaterials} colorTheme="peach" icon={Box} trendValue="Stock stable" trendPositive={true} />
                    <PastelKPICard title="Total Employees" value={totalEmployees} colorTheme="mint" icon={Users} trendValue="Across all branches" trendPositive={true} />
                    <PastelKPICard title="Total Tasks" value={completedTasks + pendingTasks} colorTheme="pink" icon={ListTodo} trendValue="High priority pending" trendPositive={false} />
                </PastelKPIGrid>

                {/* ── 3. Middle Row: Quick Actions + Inventory Summary ── */}
                <div className="rd-middle-row">

                    {/* Quick Actions */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={CheckCircle2} label="Attendance"     colorClass="bg-light-red"    onClick={() => navigate('/attendance')} />
                            <IconQuickAction icon={Calendar}    label="Leave Mgmt"      colorClass="bg-light-green"  onClick={() => navigate('/leave-management')} />
                            <IconQuickAction icon={DollarSign}  label="Payroll"          colorClass="bg-light-purple" onClick={() => navigate('/payroll')} />
                            <IconQuickAction icon={Box}         label="Materials"        colorClass="bg-light-orange" onClick={() => navigate('/materials')} />
                            <IconQuickAction icon={Building2}   label="Vendors"          colorClass="bg-light-cyan"   onClick={() => navigate('/vendors')} />
                            <IconQuickAction icon={Truck}       label="GPS Tracking"     colorClass="bg-light-blue"   onClick={() => navigate('/gps-tracking')} />
                            <IconQuickAction icon={ShoppingCart} label="Purchase Orders" colorClass="bg-light-green"  onClick={() => navigate('/orders/purchase')} />
                            <IconQuickAction icon={Tag}         label="Sales Orders"     colorClass="bg-light-red"    onClick={() => navigate('/orders')} />
                            <IconQuickAction icon={FileText}    label="Reports"          colorClass="bg-light-purple" onClick={() => navigate('/reports')} />
                            <IconQuickAction icon={Users}       label="HRMS"             colorClass="bg-light-blue"   onClick={() => navigate('/employees')} />
                            <IconQuickAction icon={Layers}      label="ERP"              colorClass="bg-light-cyan"   onClick={() => navigate('/')} />
                            <IconQuickAction icon={Target}      label="CRM"              colorClass="bg-light-pink"   onClick={() => navigate('/crm')} />
                            <IconQuickAction icon={ListTodo}    label="Tasks"            colorClass="bg-light-orange" onClick={() => navigate('/tasks')} />
                        </div>
                    </div>

                    {/* Inventory Summary — complementary data, NOT repeating KPI row */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Inventory &amp; Operations</div>
                            <span
                                className="panel-action"
                                style={{ cursor: 'pointer', fontSize: 12, color: '#7C3AED', fontWeight: 600 }}
                                onClick={() => navigate('/materials')}
                            >
                                View All →
                            </span>
                        </div>
                        <div className="inv-grid">
                            <InvRow
                                icon={Briefcase} iconBg="#eff6ff" iconColor="#2563EB"
                                label="Total Vendors" value={totalVendors}
                                caption="Active partners"
                            />
                            <InvRow
                                icon={AlertCircle} iconBg="#fef2f2" iconColor="#DC2626"
                                label="Low Stock Alerts" value={lowStock.length}
                                caption="Items below threshold" isAlert={lowStock.length > 0}
                            />
                            <InvRow
                                icon={Clock} iconBg="#fffbeb" iconColor="#D97706"
                                label="Active Orders" value={activeOrdersCount}
                                caption="Currently in processing"
                            />
                            <InvRow
                                icon={AlertTriangle} iconBg="#fef3c7" iconColor="#D97706"
                                label="Pending Approvals" value={pendingOrders}
                                caption="Orders awaiting review" isAlert={pendingOrders > 0}
                            />
                            <InvRow
                                icon={Users} iconBg="#f0fdfa" iconColor="#0D9488"
                                label="Total Staff" value={totalEmployees}
                                caption="Active employees"
                            />
                            <InvRow
                                icon={Target} iconBg="#ecfdf5" iconColor="#059669"
                                label="Total Clients" value={activeCustomers}
                                caption="Customers served"
                            />
                            <InvRow
                                icon={DollarSign} iconBg="#f5f3ff" iconColor="#7C3AED"
                                label="Revenue YTD" value={formatINR(totalRevenue)}
                                caption="Year to date"
                            />
                            <InvRow
                                icon={BarChartIcon} iconBg="#ecfdf5" iconColor="#059669"
                                label="Fulfillment Rate" value={`${orderFulfillment}%`}
                                caption="Orders delivered"
                            />
                        </div>
                    </div>
                </div>

                {/* ── 4. Chart Row: Revenue Trend + Employee Distribution ── */}
                <div className="rd-chart-row-wide">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Revenue Trend</div>
                            <select
                                className="panel-dropdown"
                                style={{ paddingRight: '24px', width: 'auto' }}
                                value={revenueTrendYear}
                                onChange={(e) => setRevenueTrendYear(e.target.value)}
                            >
                                <option value="current">This Year</option>
                                <option value="last">Last Year</option>
                            </select>
                        </div>
                        <div style={{ height: 220, width: '100%' }}>
                            {(!dashboardData?.analytics?.trendData || dashboardData.analytics.trendData.length === 0) ? (
                                <EmptyState title="No Revenue Data" message="No historical revenue data available." height={220} />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData.analytics.trendData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={48} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(val, name) => [`₹${val.toLocaleString()}`, name]} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" height={36} />
                                        <Line type="monotone" dataKey={revenueTrendYear === 'current' ? 'revenue' : 'lastYearRevenue'} name="Revenue" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey={revenueTrendYear === 'current' ? 'expenses' : 'lastYearExpenses'} name="Expenses" stroke="#D97706" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey={revenueTrendYear === 'current' ? 'currentYearProfit' : 'lastYearProfit'} name="Net Profit" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Employees by Dept.</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}>
                                <option>By Department</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 170 }}>
                                {(!dashboardData?.hrStats?.employeeDistribution || dashboardData.hrStats.employeeDistribution.length === 0) ? (
                                    <EmptyState title="No Employee Data" message="No department data available." height={170} />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dashboardData.hrStats.employeeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f1f5f9' }} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                                {dashboardData.hrStats.employeeDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#7C3AED'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 5. Activity + Notifications ── */}
                <div className="rd-two-col">
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Recent Activity</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 5).map((activity, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-time">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="feed-icon-wrapper" style={{ background: activity.type === 'warning' ? '#fef3c7' : '#eff6ff', color: activity.type === 'warning' ? '#D97706' : '#2563EB' }}>
                                            <Activity size={12} />
                                        </div>
                                        <div className="feed-content">
                                            <div className="feed-title" style={{ textTransform: 'capitalize' }}>{activity.type}</div>
                                            <div className="feed-desc">{activity.text}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState title="No Recent Activity" message="System activity will appear here." height={150} />
                            )}
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Notifications</div>
                            <a href="/notifications" className="panel-action">View All</a>
                        </div>
                        <div className="feed-list">
                            {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                                (dashboardData?.tables?.recentActivity || []).slice(0, 5).map((notif, idx) => (
                                    <div className="feed-item" key={idx}>
                                        <div className="feed-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed', flexShrink: 0 }}>
                                            <Bell size={14} />
                                        </div>
                                        <div className="feed-content" style={{ flex: 1 }}>
                                            <div className="feed-desc" style={{ fontSize: 12, color: '#334155', whiteSpace: 'normal' }}>{notif.text}</div>
                                        </div>
                                        <div className="feed-time" style={{ width: 'auto', flexShrink: 0 }}>{new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                ))
                            ) : (
                                <EmptyState title="No Notifications" message="You're all caught up!" height={150} icon={Bell} />
                            )}
                        </div>
                    </div>
                </div>

                {/* ── 6. Bottom Row: 5 panels ── */}
                <div className="rd-five-col">
                    {/* AI Insights */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} color="#7C3AED" /> AI Insights</div>
                        </div>
                        <div className="ai-insights-list">
                            <div className="ai-insight-item"><div className="ai-dot"></div><div>Revenue is <strong>{dashboardData?.analytics?.kpis?.revenueGrowth || 0}%</strong> vs last month.</div></div>
                            <div className="ai-insight-item"><div className="ai-dot"></div><div><strong>{dashboardData?.stats?.pendingOrders || 0}</strong> orders require approval.</div></div>
                            <div className="ai-insight-item"><div className="ai-dot"></div><div><strong>{dashboardData?.tables?.lowStock?.length || 0} items</strong> below stock threshold.</div></div>
                            <div className="ai-insight-item"><div className="ai-dot"></div><div><strong>{dashboardData?.stats?.pendingSalaries || 0}</strong> payrolls pending.</div></div>
                        </div>
                    </div>

                    {/* Top Selling Materials */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Top Selling Materials</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={dashboardData?.tables?.topSellingMaterials || []} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={80} />
                                    <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="sales" fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sales Analytics */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Analytics</div>
                            <select className="panel-dropdown"><option>This Month ▾</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: '100%', height: 130 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData?.charts?.categoryData || []} innerRadius={38} outerRadius={56} dataKey="value" cx="50%" cy="50%">
                                            {(dashboardData?.charts?.categoryData || []).map((entry, index) => {
                                                const colors = ['#7C3AED', '#D97706', '#059669', '#2563EB'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%' }}>
                                {(dashboardData?.charts?.categoryData || []).map((entry, idx) => {
                                    const colors = ['#7C3AED', '#D97706', '#059669', '#2563EB'];
                                    return (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[idx % colors.length] }}></div>{entry.name}
                                            </span>
                                            <strong style={{ color: '#0f172a' }}>{entry.value}</strong>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Monthly Profit */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Monthly Profit</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}><option>This Month</option></select>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{formatINR(dashboardData?.analytics?.kpis?.netProfit || totalRevenue)}</div>
                            <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 3 }}>↑ {dashboardData?.analytics?.kpis?.revenueGrowth || 0}% vs last month</div>
                        </div>
                        <div style={{ height: 110 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData?.charts?.monthlyStats || []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={{ r: 3, fill: '#059669' }} />
                                    <Tooltip contentStyle={{ fontSize: 11 }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Upcoming Events</div>
                            <span onClick={() => navigate('/tasks/calendar')} className="panel-action" style={{ cursor: 'pointer' }}>View Calendar</span>
                        </div>
                        <div className="feed-list" style={{ gap: 14 }}>
                            {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                                <div className="event-item" key={i}>
                                    <div style={{ background: ev.bg, borderRadius: 8, padding: '4px 8px', textAlign: 'center', flexShrink: 0, minWidth: 36 }}>
                                        <div style={{ color: ev.col, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{ev.month}</div>
                                        <div style={{ color: '#0f172a', fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>{ev.day}</div>
                                    </div>
                                    <div className="feed-content">
                                        <div className="feed-title">{ev.title}</div>
                                        <div className="feed-desc">{ev.desc}</div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', color: '#64748b', fontSize: 14, padding: '20px 0' }}>
                                    No upcoming events
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </div>
            <CommandCenter isOpen={isCommandCenterOpen} onClose={() => setIsCommandCenterOpen(false)} />
        </div>
    );
};

export default AdminDashboard;
