import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  Users, ShoppingCart, DollarSign, Box, FileText, Truck,
  BarChart2, Bell, CheckCircle2, Calendar, Cpu, ListTodo,
  UserCheck, Activity, AlertCircle, AlertTriangle, Package,
  Layers, Target, Building2, Tag, Clock, TrendingUp,
  TrendingDown, Settings, Plus, ArrowRight, UserPlus, CreditCard,
  LineChart as LineChartIcon, Briefcase, Database, Folder
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
  ComposedChart
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState, ErrorState } from "../components/DataStates";

/* ─── helpers ─── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};
const fmtINR = (v) => {
  if (!v && v !== 0) return "₹0";
  const abs = Math.abs(v);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}k`;
  return `₹${abs}`;
};
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ─── sub-components ─── */
const KpiCard = ({ icon: Icon, iconClass, label, value, trend, trendUp, sub }) => (
  <div className="db-kpi-card">
    <div className="db-kpi-top">
      <div className={`db-kpi-icon ${iconClass}`}><Icon size={22} /></div>
      {trend && (
        <span className={`db-kpi-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
        </span>
      )}
    </div>
    <div>
      <div className="db-kpi-value">{value}</div>
      <div className="db-kpi-label">{label}</div>
    </div>
    {sub && <div className="db-kpi-sub">{sub}</div>}
  </div>
);

const QaBtn = ({ icon: Icon, label, colorClass, onClick }) => (
  <div className="db-qa-item" onClick={onClick}>
    <div className={`db-qa-icon ${colorClass}`}><Icon size={20} /></div>
    <span className="db-qa-label">{label}</span>
  </div>
);

const StatusRow = ({ name, status }) => {
  const cls = status === "Healthy" ? "status-healthy" : status === "Warning" ? "status-warning" : "status-critical";
  return (
    <div className="db-status-row">
      <span className="db-status-name">{name}</span>
      <span className={`db-status-badge ${cls}`}>{status}</span>
    </div>
  );
};

const ActivityItem = ({ icon: Icon, iconBg, iconColor, title, desc, time }) => (
  <div className="db-activity-item">
    <div className="db-activity-icon" style={{ background: iconBg, color: iconColor }}>
      <Icon size={14} />
    </div>
    <div className="db-activity-body">
      <div className="db-activity-title">{title}</div>
      <div className="db-activity-desc">{desc}</div>
    </div>
    <div className="db-activity-time">{time}</div>
  </div>
);

/* sparkline data seeds */
const SPARK = [4,7,5,9,6,11,8,13,10,15,12,14];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: dashboardData, loading, error } = useDashboardData();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [revTrendYear, setRevTrendYear] = useState("current");
  const [now, setNow] = useState(new Date());
  
  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    API.get("/tasks").then(r => {
      const future = (r.data || [])
        .filter(t => t.dueDate && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4)
        .map(t => {
          const d = new Date(t.dueDate);
          const colors = ["#6366f1","#f97316","#22c55e","#ef4444"];
          const bgs = ["#EEF2FF","#FFEDD5","#DCFCE7","#FEE2E2"];
          const i = upcomingEvents.length % 4;
          return { day: String(d.getDate()).padStart(2,"0"), mon: d.toLocaleString("default",{month:"short"}).toUpperCase(), title: t.title, sub: t.category||"General", color: colors[i], bg: bgs[i] };
        });
      setUpcomingEvents(future);
    }).catch(() => {});
  }, []);

  if (loading) return <LoadingState message="Loading Admin Dashboard…" height="100vh" />;
  if (error)   return <ErrorState   message="Failed to load dashboard." height="100vh" />;

  /* ── derived stats ── */
  const s = dashboardData?.stats || {};
  const totalRevenue   = s.revenue || 0;
  const totalEmployees = s.totalEmployees || 0;
  const totalOrders    = s.totalOrders || 0;
  const totalMaterials = s.totalMaterials || 0;
  const activeOrders   = s.activeOrdersCount || 0;
  const pendingOrders  = s.pendingOrders || 0;
  const totalVendors   = s.totalVendors || 0;
  const activeCustomers= s.activeCustomers || 0;
  const fulfillment    = dashboardData?.analytics?.healthMetrics?.orderFulfillment || 0;
  const completedTasks = s.completedTasks || 0;
  const pendingTasks   = s.pendingTasks || 0;
  const lowStock       = dashboardData?.tables?.lowStock || [];
  const recentActivity = dashboardData?.tables?.recentActivity || [];
  const notifications  = dashboardData?.tables?.notifications || [];
  const empDist        = dashboardData?.hrStats?.employeeDistribution || [];
  const trendRaw       = dashboardData?.analytics?.trendData || dashboardData?.charts?.monthlyStats || [];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData      = trendRaw.map(d => {
    let mName = d.name;
    if (!isNaN(mName) && mName >= 1 && mName <= 12) mName = MONTHS[mName - 1];
    return {
      name: mName,
      revenue: revTrendYear === "current" ? (d.revenue||0) : (d.lastYearRevenue||0),
      expenses: revTrendYear === "current" ? (d.expenses||0) : (d.lastYearExpenses||0),
    };
  });

  const purchaseCost = s.purchaseCost || 0;
  const totalProfit = totalRevenue - purchaseCost;
  const thisMonthRev = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;
  const lastMonthRev = chartData.length > 1 ? chartData[chartData.length - 2].revenue : 0;
  const profitTrendPct = lastMonthRev ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1) : 0;
  const sparkData = chartData.length > 0 ? chartData.map((d, i) => ({ i, v: d.revenue })) : [{i:0, v:0}];

  /* attendance donut */
  const attendanceTotal  = dashboardData?.hrStats?.presentToday || 0;
  const attendanceAbsent = Math.max(0, totalEmployees - attendanceTotal);
  const donutData = attendanceTotal > 0
    ? [{ name: "Present", value: attendanceTotal }, { name: "Absent", value: attendanceAbsent }]
    : [{ name: "No Data", value: 1 }];
  const attendancePct = totalEmployees > 0 ? Math.round((attendanceTotal / totalEmployees) * 100) : 0;

  const fallbackAiInsights = [
    totalRevenue > 0 && `Revenue is ${fmtINR(totalRevenue)} this period — tracking positively.`,
    lowStock.length > 0 && `${lowStock.length} material${lowStock.length > 1 ? "s are" : " is"} below reorder threshold.`,
    pendingOrders > 0 && `${pendingOrders} order${pendingOrders > 1 ? "s are" : " is"} pending approval.`,
    totalEmployees > 0 && `${attendanceTotal} of ${totalEmployees} employees present today (${attendancePct}%).`,
    pendingTasks > 0 && `${pendingTasks} task${pendingTasks > 1 ? "s are" : " is"} still pending completion.`,
  ].filter(Boolean).slice(0, 5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  /* top materials */
  const topMaterials = (dashboardData?.tables?.topMaterials || []).slice(0, 5);
  const maxMatVal = topMaterials.reduce((m, d) => Math.max(m, d.revenue || d.value || 0), 1);

  const DONUT_COLORS = ["#4f46e5", "#e2e8f0"];

  return (
    <div className="db-page">
      <div className="db-content">

        {/* ── Greeting Bar ── */}
        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">
              {greeting()}, {user?.name?.split(" ")[0] || "Admin"}! 👋
            </div>
            <div className="db-greeting-sub">
              Welcome back! You're doing great today.
            </div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              &nbsp;·&nbsp;
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="db-status-pill">
              <div className="db-status-dot" />
              All Systems Operational
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="db-kpi-grid">
          <KpiCard icon={Activity}     iconClass="green"  label="System Health"    value="100%"                    trend="Excellent"    trendUp={true}  sub="All services running" />
          <KpiCard icon={DollarSign}   iconClass="blue"   label="Revenue Today"    value={fmtINR(totalRevenue)}    trend="vs yesterday"  trendUp={true}  sub="Year-to-date" />
          <KpiCard icon={ShoppingCart} iconClass="orange" label="Orders Today"     value={activeOrders}            trend={`${pendingOrders} pending`} trendUp={false} sub="Active orders" />
          <KpiCard icon={Users}        iconClass="purple" label="Active Employees"  value={totalEmployees}          trend="vs last month" trendUp={true}  sub={`${attendanceTotal} present today`} />
        </div>

        {/* ── Quick Actions ── */}
        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={CheckCircle2} label="Attendance"     colorClass="qa-red"    onClick={() => navigate("/attendance")} />
            <QaBtn icon={Users}        label="Employee"       colorClass="qa-blue"   onClick={() => navigate("/employees")} />
            <QaBtn icon={DollarSign}   label="Payroll"        colorClass="qa-purple" onClick={() => navigate("/payroll")} />
            <QaBtn icon={Box}          label="Inventory"      colorClass="qa-orange" onClick={() => navigate("/materials")} />
            <QaBtn icon={Tag}          label="Sales"          colorClass="qa-green"  onClick={() => navigate("/orders")} />
            <QaBtn icon={Building2}    label="Vendors"        colorClass="qa-teal"   onClick={() => navigate("/vendors")} />
            <QaBtn icon={FileText}     label="Reports"        colorClass="qa-amber"  onClick={() => navigate("/analytics")} />
            <QaBtn icon={Settings}     label="Settings"       colorClass="qa-cyan"   onClick={() => navigate("/settings")} />
            <QaBtn icon={Layers}       label="ERP"            colorClass="qa-indigo" onClick={() => navigate("/erp")} />
            <QaBtn icon={ListTodo}     label="Tasks"          colorClass="qa-pink"   onClick={() => navigate("/my-tasks")} />
            <QaBtn icon={Folder}       label="Projects"       colorClass="qa-blue"   onClick={() => navigate("/projects")} />
          </div>
        </div>

        {/* ── Stats Mini Row ── */}
        <div className="db-stats-mini-grid">
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#EEF2FF", color: "#4F46E5" }}><Users size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{totalEmployees}</div>
              <div className="db-stats-mini-label">Total Employees</div>
              <span className="db-stats-mini-badge badge-green-sm">↑ 6% this month</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#DCFCE7", color: "#15803D" }}><UserCheck size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{attendanceTotal}</div>
              <div className="db-stats-mini-label">Present Today</div>
              <span className="db-stats-mini-badge badge-green-sm">{attendancePct}%</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#FEF9C3", color: "#92400E" }}><Calendar size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{dashboardData?.hrStats?.pendingLeaves || 0}</div>
              <div className="db-stats-mini-label">Pending Leaves</div>
              <span className="db-stats-mini-badge badge-orange-sm">Needs Approval</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#DBEAFE", color: "#1D4ED8" }}><Box size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{totalMaterials}</div>
              <div className="db-stats-mini-label">Active Materials</div>
              <span className="db-stats-mini-badge badge-blue-sm">In Inventory</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#FFEDD5", color: "#C2410C" }}><ShoppingCart size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{pendingOrders}</div>
              <div className="db-stats-mini-label">Open PO Orders</div>
              <span className="db-stats-mini-badge badge-orange-sm">Total Open</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#DCFCE7", color: "#15803D" }}><DollarSign size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{fmtINR(totalRevenue)}</div>
              <div className="db-stats-mini-label">Total Revenue</div>
              <span className="db-stats-mini-badge badge-green-sm">YTD</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#F3E8FF", color: "#7C3AED" }}><BarChart2 size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{fmtINR(thisMonthRev)}</div>
              <div className="db-stats-mini-label">Monthly Sales</div>
              <span className={`db-stats-mini-badge ${profitTrendPct >= 0 ? 'badge-green-sm' : 'badge-red-sm'}`}>
                {profitTrendPct >= 0 ? '↑' : '↓'} {Math.abs(profitTrendPct)}%
              </span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}><ListTodo size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{pendingTasks}</div>
              <div className="db-stats-mini-label">Pending Tasks</div>
              <span className="db-stats-mini-badge badge-red-sm">Due Soon</span>
            </div>
          </div>
        </div>

        
        {/* ── Bento Grid ── */}
        <div className="db-bento">
          {/* Row 1 */}
          <div className="db-card db-col-3">
            <div className="db-profile-banner profile-banner-admin"/>
            <div className="db-profile-body" style={{ paddingTop: '20px' }}>
              <div className="db-profile-name">{user?.name || "Admin"}</div>
              <div className="db-profile-role">{user?.role || "System Administrator"}</div>
              <span className="db-profile-badge profile-badge-admin">Full Access</span>
              <div className="db-profile-info">
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Admin ID</span>
                  <span className="db-profile-info-val">{user?.employeeId || user?.id || "SYS-01"}</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Email</span>
                  <span className="db-profile-info-val" style={{ fontSize: 11 }}>{user?.email || "admin@smtbms.com"}</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Last Login</span>
                  <span className="db-profile-info-val">{fmtTime(new Date())}</span>
                </div>
              </div>
              <button className="db-profile-btn" onClick={() => navigate("/profile")}>
                View Profile <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="db-card db-col-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.15)", position: "relative", overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}>
            <div className="db-card-header" style={{ borderBottom: "none", padding: "24px 24px 0 24px", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <div className="db-card-title" style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={16} color="#6366f1" />
                  Revenue Analytics
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                  {fmtINR(totalRevenue)}
                  <span style={{ fontSize: 13, padding: "3px 10px", background: profitTrendPct >= 0 ? "#ecfdf5" : "#fef2f2", color: profitTrendPct >= 0 ? "#10b981" : "#ef4444", borderRadius: "12px", fontWeight: 700 }}>
                    {profitTrendPct >= 0 ? '+' : '-'}{Math.abs(profitTrendPct)}%
                  </span>
                </div>
              </div>
              <select className="db-panel-select" style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", outline: "none", padding: "6px 14px", borderRadius: "20px", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }} value={revTrendYear} onChange={e => setRevTrendYear(e.target.value)}>
                <option value="current">This Year</option>
                <option value="last">Last Year</option>
              </select>
            </div>
            
            <div style={{ flex: 1, minHeight: "220px", marginTop: "20px", padding: "0 20px 10px 0" }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip 
                      cursor={{ stroke: '#818cf8', strokeWidth: 2, strokeDasharray: '4 4' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)" }}>
                              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 6px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{label}</p>
                              <p style={{ color: "#fff", fontSize: "18px", margin: 0, fontWeight: 800 }}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payload[0].value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fill="url(#colorRev)" activeDot={{ r: 6, fill: "#fff", stroke: "#4f46e5", strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty" style={{ color: "#94a3b8", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>No financial data available</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Employee Attendance</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Week</span>
            </div>
            <div className="db-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div className="db-donut-wrap" style={{ position: "relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" startAngle={90} endAngle={-270} stroke="none" cornerRadius={6}>
                      {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: "#1e293b", lineHeight: 1 }}>{attendancePct}%</span>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Present</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, fontSize: 13, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: DONUT_COLORS[0] }} />
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Present <span style={{ color: "#0f172a", fontWeight: 800, marginLeft: 2 }}>{attendanceTotal}</span></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: DONUT_COLORS[1] }} />
                  <span style={{ color: "#64748b", fontWeight: 600 }}>Absent <span style={{ color: "#0f172a", fontWeight: 800, marginLeft: 2 }}>{attendanceAbsent}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">System Status</div>
              <span className="db-card-link" onClick={() => navigate("/settings")}>View All</span>
            </div>
            <div className="db-status-list">
              <StatusRow name="Backend API" status="Healthy" />
              <StatusRow name="Database" status="Healthy" />
              <StatusRow name="Authentication" status="Healthy" />
              <StatusRow name="Storage" status="Healthy" />
              <StatusRow name="Backup" status="Healthy" />
              <StatusRow name="Mail Service" status="Healthy" />
            </div>
          </div>

          <div className="db-card db-col-6">
            <div className="db-card-header">
              <div className="db-card-title">Recent Activity</div>
              <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
            </div>
            <div className="db-activity-list">
              {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((a, i) => {
                const lo = (a.text || "").toLowerCase();
                let Icon = Activity, bg = "#EFF6FF", col = "#3B82F6";
                if (lo.includes("order") || lo.includes("sale")) { Icon = ShoppingCart; bg = "#FFEDD5"; col = "#F97316"; }
                else if (lo.includes("stock") || lo.includes("inventory")) { Icon = Box; bg = "#ECFEFF"; col = "#06B6D4"; }
                else if (lo.includes("user") || lo.includes("logged")) { Icon = Users; bg = "#F3E8FF"; col = "#A855F7"; }
                else if (lo.includes("payment") || lo.includes("invoice")) { Icon = DollarSign; bg = "#DCFCE7"; col = "#22C55E"; }
                return (
                  <ActivityItem
                    key={i} icon={Icon} iconBg={bg} iconColor={col}
                    title={a.title || a.user || "System Event"} desc={a.text} time={fmtTime(a.time || a.createdAt || a.timestamp || new Date())}
                  />
                );
              }) : (
                <div className="db-empty">No recent activity</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Notifications</div>
              <span className="db-card-link" onClick={() => navigate("/notifications")}>View All</span>
            </div>
            <div className="db-notif-list">
              {notifications.length > 0 ? notifications.slice(0, 4).map((n, i) => {
                const colors = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#eab308"];
                return (
                  <div key={i} className="db-notif-item">
                    <div className="db-notif-dot" style={{ background: colors[i % colors.length] }} />
                    <div className="db-notif-body">
                      <div className="db-notif-text">{n.text || n.message}</div>
                      <div className="db-notif-time">{fmtTime(n.time || n.date)}</div>
                    </div>
                  </div>
                );
              }) : (
                <div className="db-empty">All caught up! ✨</div>
              )}
            </div>
          </div>

          {/* Row 3 */}
          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Inventory Alerts</div>
            </div>
            <div className="db-status-list">
              {lowStock.length === 0 ? (
                <div className="db-empty">No low-stock alerts 🎉</div>
              ) : lowStock.slice(0, 5).map((m, i) => (
                <div key={i} className="db-status-row">
                  <span className="db-status-name">{m.name || m.materialName}</span>
                  <span className="db-status-badge status-critical">{m.currentStock ?? m.quantity ?? 0} left</span>
                </div>
              ))}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Upcoming Events</div>
            </div>
            <div className="db-event-list">
              <br/>
              {upcomingEvents.length > 0 ? upcomingEvents.map((e, i) => (
                <div key={i} className="db-event-item">
                  <div className="db-event-date" style={{ background: e.color }}>
                    <div className="db-event-day">{e.day}</div>
                    <div className="db-event-mon">{e.mon}</div>
                  </div>
                  <div className="db-event-body">
                    <div className="db-event-title">{e.title}</div>
                    <div className="db-event-sub">{e.sub}</div>
                  </div>
                </div>
              )) : (
                <div className="db-empty" style={{padding: "10px"}}>No events scheduled</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title"><Cpu size={16} style={{display:"inline", color:"#8b5cf6"}}/> AI Insights</div>
            </div>
            <div className="db-ai-insights">
              <br/>
              {aiLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  <Cpu size={18} className="db-spin" style={{ marginBottom: '8px', color: '#8b5cf6' }} /><br />
                  Generating insights...
                </div>
              ) : displayInsights && displayInsights.length > 0 ? (
                displayInsights.map((ins, i) => {
                  const colors = ["#6366f1", "#f97316", "#22c55e", "#ef4444"];
                  return (
                    <div key={i} className="db-ai-item">
                      <div className="db-ai-dot" style={{ background: colors[i % colors.length] }} />
                      <div className="db-ai-text">{ins}</div>
                    </div>
                  );
                })
              ) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Monthly Profit</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-card-body" style={{ padding: 0 }}>
              <div className="db-profit-val">{fmtINR(totalProfit)}</div>
              <div className="db-profit-sub">
                {profitTrendPct >= 0 ? '↑' : '↓'} {Math.abs(profitTrendPct)}% vs last month
              </div>
              <div style={{ width: "100%", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke={profitTrendPct >= 0 ? "#22C55E" : "#EF4444"} strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
    
      </div>
    </div>
  );
};export default AdminDashboard; 
