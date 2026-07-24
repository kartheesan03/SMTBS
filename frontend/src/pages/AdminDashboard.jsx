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
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar, Legend, LabelList, Label } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import PageHeader from '../components/PageHeader';
import CommandCenter from '../components/CommandCenter';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import WelcomeBanner from '../components/ui/WelcomeBanner';
import { LoadingState, ErrorState, EmptyState } from '../components/DataStates';

// ─── Unified KPI Card removed in favor of StatCard ──────────────────────────────


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
    const [topMaterialsSortBy, setTopMaterialsSortBy] = useState('revenue');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksRes = await API.get('/tasks');
                const now = new Date();
                const pendingTasks = (tasksRes.data || [])
                    .filter(t => t.status !== 'Completed')
                    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
                    .slice(0, 4)
                    .map(t => {
                        const d = new Date(t.dueDate);
                        let isOverdue = d < now;
                        let col = '#4f46e5'; let bg = '#e0e7ff';
                        if (isOverdue || t.priority === 'High') { col = '#ef4444'; bg = '#fee2e2'; }
                        else if (t.priority === 'Low') { col = '#10b981'; bg = '#d1fae5'; }
                        return {
                            day: String(d.getDate()).padStart(2, '0'),
                            month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                            bg, col,
                            title: t.title,
                            category: t.category || t.department || 'General',
                            isOverdue,
                        };
                    });
                // Temporarily disable mock backend tasks to remove hardcode and reduce row size
                setUpcomingEvents([]); 
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
        if (!val && val !== 0) return '₹0';
        const isNegative = val < 0;
        const absVal = Math.abs(val);
        const sign = isNegative ? '-' : '';
        if (absVal >= 100000) return `${sign}₹${(absVal / 100000).toFixed(2)}L`;
        if (absVal >= 1000) return `${sign}₹${(absVal / 1000).toFixed(1)}k`;
        return `${sign}₹${absVal}`;
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

                <WelcomeBanner 
                    user={user}
                    greeting={`${getGreeting()}`}
                    subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Here's your business overview`}
                    badges={[
                        { icon: Package, text: `${activeOrdersCount} Active Orders`, type: 'neutral' },
                        { type: 'status', text: 'All Systems Operational' }
                    ]}
                    rightVisuals={
                        <>
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
                        </>
                    }
                    actions={[
                        { label: 'Apply Leave', icon: CheckCircle, variant: 'primary', onClick: () => navigate('/leave-management/history') },
                        { label: 'Check In', icon: Clock, variant: 'secondary', onClick: () => navigate('/attendance') }
                    ]}
                />

                {/* ── 2. KPI Row (Full Width) ── */}
                <StatGrid columns={6}>
                    <StatCard title="Order Fulfillment" value={`${orderFulfillment}%`} colorTheme="mint" icon={Activity} trendValue="Successfully delivered" trendPositive={true} />
                    <StatCard title="Total Orders" value={totalOrders} colorTheme="purple" icon={ShoppingCart} trendValue="12% vs last month" trendPositive={true} />
                    <StatCard title="Total Revenue" value={formatINR(totalRevenue)} colorTheme="blue" icon={DollarSign} trendValue="8% vs last month" trendPositive={true} />
                    <StatCard title="Total Materials" value={totalMaterials} colorTheme="peach" icon={Box} trendValue="Stock stable" trendPositive={true} />
                    <StatCard title="Total Employees" value={totalEmployees} colorTheme="teal" icon={Users} trendValue="Across all branches" trendPositive={true} />
                    <StatCard title="Total Tasks" value={completedTasks + pendingTasks} colorTheme="pink" icon={ListTodo} trendValue="High priority pending" trendPositive={false} />
                </StatGrid>

                {/* ── MAIN LAYOUT (Content) ── */}
                    <div className="rd-middle-row">
                        {/* Quick Actions */}
                        <div className="dashboard-panel type-glass">
                        <div className="panel-header">
                            <div className="panel-title">Quick Actions</div>
                        </div>
                        <div className="qa-grid">
                            <IconQuickAction icon={CheckCircle2} label="Attendance"     colorClass="bg-light-red"    onClick={() => navigate('/attendance')} />
                            <IconQuickAction icon={Calendar}    label="Leave Mgmt"      colorClass="bg-light-green"  onClick={() => navigate('/leave-management')} />
                            <IconQuickAction icon={DollarSign}  label="Payroll"          colorClass="bg-light-purple" onClick={() => navigate('/payroll')} />
                            <IconQuickAction icon={Box}         label="Materials"        colorClass="bg-light-orange" onClick={() => navigate('/materials')} />
                            <IconQuickAction icon={Building2}   label="Vendors"          colorClass="bg-light-cyan"   onClick={() => navigate('/vendors')} />
                            <IconQuickAction icon={ShoppingCart} label="Purchase Orders" colorClass="bg-light-green"  onClick={() => navigate('/orders/purchase')} />
                            <IconQuickAction icon={Tag}         label="Sales Orders"     colorClass="bg-light-red"    onClick={() => navigate('/orders')} />
                            <IconQuickAction icon={FileText}    label="Reports"          colorClass="bg-light-purple" onClick={() => navigate('/reports')} />
                            <IconQuickAction icon={Users}       label="HRMS"             colorClass="bg-light-blue"   onClick={() => navigate('/hrms')} />
                            <IconQuickAction icon={Layers}      label="ERP"              colorClass="bg-light-cyan"   onClick={() => navigate('/')} />
                            <IconQuickAction icon={Target}      label="CRM"              colorClass="bg-light-pink"   onClick={() => navigate('/crm')} />
                            <IconQuickAction icon={ListTodo}    label="Tasks"            colorClass="bg-light-orange" onClick={() => navigate('/tasks')} />
                        </div>
                    </div>

                    {/* Inventory Summary — complementary data, NOT repeating KPI row */}
                    <div className="dashboard-panel type-gradient">
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
                            {(() => {
                                // Primary: use analytics.trendData
                                // Fallback: use charts.monthlyStats (revenue field)
                                const trendData = dashboardData?.analytics?.trendData;
                                const monthlyStats = dashboardData?.charts?.monthlyStats;
                                
                                // Build chart data: prefer trendData, fallback to monthlyStats
                                let chartData = null;
                                if (trendData && trendData.length > 0) {
                                    chartData = trendData;
                                } else if (monthlyStats && monthlyStats.length > 0) {
                                    // monthlyStats has {name, revenue, sales} — map to trendData shape
                                    chartData = monthlyStats.map(m => ({
                                        name: m.name,
                                        revenue: m.revenue || 0,
                                        expenses: 0,
                                        currentYearProfit: m.revenue || 0,
                                        lastYearRevenue: 0,
                                        lastYearExpenses: 0,
                                        lastYearProfit: 0,
                                    }));
                                }

                                if (!chartData || chartData.length === 0) {
                                    return <EmptyState title="No Revenue Data" message="No historical revenue data available." height={220} />;
                                }

                                return (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={48} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val} />
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0, border: '1px solid #e2e8f0' }} formatter={(val, name) => [`₹${val.toLocaleString()}`, name]} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" height={36} />
                                            <Line type="monotone" dataKey={revenueTrendYear === 'current' ? 'revenue' : 'lastYearRevenue'} name="Revenue" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey={revenueTrendYear === 'current' ? 'expenses' : 'lastYearExpenses'} name="Expenses" stroke="#D97706" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey={revenueTrendYear === 'current' ? 'currentYearProfit' : 'lastYearProfit'} name="Net Profit" stroke="#059669" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                );
                            })()}
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
                                            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 0, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f1f5f9' }} />
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
                            {(dashboardData?.tables?.notifications || []).length > 0 ? (
                                (dashboardData?.tables?.notifications || []).slice(0, 5).map((notif, idx) => (
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

                {/* ── 6. Bottom Row: 5 panels (Full Width) ── */}
                <div className="rd-five-col">
                    {/* AI Insights */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title"><Cpu size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} color="#7C3AED" /> AI Insights</div>
                        </div>
                        {/* Temporarily disabled mock AI Insights to remove hardcode */}
                        {false ? (
                            <div className="ai-insights-list">
                                {(dashboardData?.analytics?.trendData || []).length > 0 && (
                                    <div className="ai-insight-item" onClick={() => navigate('/reports')}>
                                        <div className="ai-dot"></div>
                                        <div>Revenue {(dashboardData?.analytics?.kpis?.revenueGrowth || 0) >= 0 ? 'increased' : 'decreased'} by <strong>{Math.abs(dashboardData?.analytics?.kpis?.revenueGrowth || 0)}%</strong> vs last month.</div>
                                    </div>
                                )}
                                {(dashboardData?.stats?.pendingOrders || 0) > 0 && (
                                    <div className="ai-insight-item" onClick={() => navigate('/orders/purchase')}><div className="ai-dot"></div><div><strong>{dashboardData?.stats?.pendingOrders}</strong> orders require approval.</div></div>
                                )}
                                {(dashboardData?.tables?.lowStock?.length || 0) > 0 && (
                                    <div className="ai-insight-item" onClick={() => navigate('/materials')}><div className="ai-dot"></div><div><strong>{dashboardData?.tables?.lowStock?.length} items</strong> below stock threshold.</div></div>
                                )}
                                {(dashboardData?.stats?.pendingSalaries || 0) > 0 && (
                                    <div className="ai-insight-item" onClick={() => navigate('/payroll')}><div className="ai-dot"></div><div><strong>{dashboardData?.stats?.pendingSalaries}</strong> payrolls pending.</div></div>
                                )}
                            </div>
                        ) : (
                            <EmptyState title="No Insights" message="Insufficient data to generate insights." height={180} icon={Cpu} />
                        )}
                    </div>

                    {/* Top Selling Materials */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Top Selling Materials</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select 
                                    className="panel-dropdown" 
                                    value={topMaterialsSortBy} 
                                    onChange={e => setTopMaterialsSortBy(e.target.value)}
                                    style={{ paddingRight: '24px', width: 'auto' }}
                                >
                                    <option value="revenue">By Revenue</option>
                                    <option value="sales">By Quantity</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ minHeight: 180, display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {(!dashboardData?.tables?.topSellingMaterials || dashboardData.tables.topSellingMaterials.length === 0) ? (
                                <EmptyState title="No Data" message="Insufficient sales data." height={180} />
                            ) : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart 
                                        layout="vertical" 
                                        data={[...(dashboardData?.tables?.topSellingMaterials || [])].sort((a, b) => b[topMaterialsSortBy] - a[topMaterialsSortBy])} 
                                        margin={{ top: 0, right: 45, left: 0, bottom: 0 }}
                                    >
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tickFormatter={(val) => val.length > 18 ? val.substring(0, 18) + '...' : val} tick={{ fill: '#475569', fontSize: 11 }} width={120} />
                                        <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ fill: '#f8fafc' }} formatter={(val) => topMaterialsSortBy === 'revenue' ? formatINR(val) : val} />
                                        <Bar dataKey={topMaterialsSortBy} fill="#7C3AED" radius={[0, 4, 4, 0]} barSize={12}>
                                            <LabelList dataKey={topMaterialsSortBy} position="right" formatter={(val) => topMaterialsSortBy === 'revenue' ? formatINR(val) : val} style={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Sales Analytics */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Sales Analytics</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}><option>This Month</option></select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minHeight: 180, flex: 1 }}>
                            {(!dashboardData?.charts?.salesCategoryData || dashboardData.charts.salesCategoryData.length === 0) ? (
                                <EmptyState title="No Sales" message="No sales data available." height={180} />
                            ) : (
                                <>
                                    <div style={{ width: '100%', height: 140 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={dashboardData.charts.salesCategoryData} innerRadius={45} outerRadius={65} dataKey="value" cx="50%" cy="50%">
                                            {dashboardData.charts.salesCategoryData.map((entry, index) => {
                                                const colors = ['#7C3AED', '#D97706', '#059669', '#2563EB'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                            <Label
                                                value={formatINR(dashboardData.charts.salesCategoryData.reduce((acc, curr) => acc + curr.value, 0))}
                                                position="center"
                                                fill="#0f172a"
                                                style={{ fontSize: '13px', fontWeight: 'bold' }}
                                            />
                                        </Pie>
                                        <Tooltip contentStyle={{ fontSize: 11 }} formatter={(val) => `₹${val.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                                        {dashboardData.charts.salesCategoryData.slice(0, 3).map((entry, idx) => {
                                            const colors = ['#7C3AED', '#D97706', '#059669', '#2563EB'];
                                            return (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, fontSize: 11, width: '100%' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '0px', background: colors[idx % colors.length], flexShrink: 0 }}></div>
                                                        <span>{entry.name}</span>
                                                    </span>
                                                    <strong style={{ color: '#0f172a' }}>₹{entry.value.toLocaleString()}</strong>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Monthly Profit */}
                    <div className="dashboard-panel">
                        <div className="panel-header">
                            <div className="panel-title">Monthly Profit</div>
                            <select className="panel-dropdown" style={{ paddingRight: '24px', width: 'auto' }}><option>This Month</option></select>
                        </div>
                        <div style={{ minHeight: 180, display: 'flex', flexDirection: 'column', flex: 1 }}>
                            {(!dashboardData?.charts?.monthlyStats || dashboardData.charts.monthlyStats.length === 0) ? (
                                <EmptyState title="No Profit Data" message="No historical profit data." height={150} />
                            ) : (
                                <>
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{formatINR(dashboardData?.analytics?.kpis?.netProfit || totalRevenue)}</div>
                                        <div style={{ fontSize: 12, color: (dashboardData?.analytics?.kpis?.revenueGrowth || 0) >= 0 ? '#059669' : '#ef4444', fontWeight: 600, marginTop: 4 }}>
                                            {(() => {
                                                const growth = dashboardData?.analytics?.kpis?.revenueGrowth || 0;
                                                const lastMonth = dashboardData?.analytics?.kpis?.lastMonthRevenue || 0;
                                                const thisMonth = dashboardData?.analytics?.kpis?.thisMonthRevenue || 0;
                                                
                                                if (lastMonth === 0) {
                                                    const diff = thisMonth - lastMonth;
                                                    return `${diff >= 0 ? '+' : ''}${formatINR(diff)} vs last month (${formatINR(lastMonth)})`;
                                                }
                                                return `${growth >= 0 ? '↑' : '↓'} ${Math.abs(growth)}% vs last month (${formatINR(lastMonth)})`;
                                            })()}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minHeight: 110, width: '100%', overflow: 'hidden', paddingBottom: 10 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dashboardData?.charts?.monthlyStats || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                                                <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} dot={{ r: 3, fill: '#059669' }} isAnimationActive={false} />
                                                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            )}
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
                                <div className="event-item" key={i} style={{ borderLeft: ev.isOverdue ? '3px solid #ef4444' : 'none', paddingLeft: ev.isOverdue ? 6 : 0 }}>
                                    <div style={{ background: ev.bg, borderRadius: 0, padding: '4px 8px', textAlign: 'center', flexShrink: 0, minWidth: 36 }}>
                                        <div style={{ color: ev.col, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{ev.month}</div>
                                        <div style={{ color: '#0f172a', fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>{ev.day}</div>
                                    </div>
                                    <div className="feed-content" style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div className="feed-title" style={{ color: ev.isOverdue ? '#ef4444' : 'inherit', flex: 1, paddingRight: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                                            <span style={{ fontSize: 9, background: '#f1f5f9', padding: '2px 6px', borderRadius: 0, color: '#475569', fontWeight: 600, flexShrink: 0 }}>{ev.category}</span>
                                        </div>
                                        <div className="feed-desc" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {ev.isOverdue && <AlertCircle size={10} color="#ef4444" />}
                                            {ev.desc}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <EmptyState title="No Events" message="No upcoming events." height={180} icon={Calendar} />
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
