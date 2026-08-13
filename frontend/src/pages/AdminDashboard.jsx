import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import API from "../api/axios";
import {
  Users, ShoppingCart, DollarSign, Box, FileText, Truck,
  BarChart2, Bell, CheckCircle2, Calendar, Cpu, ListTodo,
  UserCheck, Activity, AlertCircle, AlertTriangle, Package,
  Layers, Target, Building2, Tag, Clock, TrendingUp,
  TrendingDown, Settings, Plus, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
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
  const chartData      = trendRaw.map(d => ({
    name: d.name,
    revenue: revTrendYear === "current" ? (d.revenue||0) : (d.lastYearRevenue||0),
    expenses: revTrendYear === "current" ? (d.expenses||0) : (d.lastYearExpenses||0),
  }));

  /* attendance donut */
  const attendanceTotal  = dashboardData?.hrStats?.presentToday || 0;
  const attendanceAbsent = Math.max(0, totalEmployees - attendanceTotal);
  const donutData = attendanceTotal > 0
    ? [{ name: "Present", value: attendanceTotal }, { name: "Absent", value: attendanceAbsent }]
    : [{ name: "No Data", value: 1 }];
  const attendancePct = totalEmployees > 0 ? Math.round((attendanceTotal / totalEmployees) * 100) : 0;

  /* AI insights */
  const aiInsights = [
    totalRevenue > 0 && `Revenue is ${fmtINR(totalRevenue)} this period — tracking positively.`,
    lowStock.length > 0 && `${lowStock.length} material${lowStock.length > 1 ? "s are" : " is"} below reorder threshold.`,
    pendingOrders > 0 && `${pendingOrders} order${pendingOrders > 1 ? "s are" : " is"} pending approval.`,
    totalEmployees > 0 && `${attendanceTotal} of ${totalEmployees} employees present today (${attendancePct}%).`,
    pendingTasks > 0 && `${pendingTasks} task${pendingTasks > 1 ? "s are" : " is"} still pending completion.`,
  ].filter(Boolean).slice(0, 5);

  /* top materials */
  const topMaterials = (dashboardData?.tables?.topMaterials || []).slice(0, 5);
  const maxMatVal = topMaterials.reduce((m, d) => Math.max(m, d.revenue || d.value || 0), 1);

  const DONUT_COLORS = ["#6366f1","#e2e8f0"];

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
              <div className="db-stats-mini-label">Today's Revenue</div>
              <span className="db-stats-mini-badge badge-green-sm">↑ 18.4%</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background: "#F3E8FF", color: "#7C3AED" }}><BarChart2 size={18} /></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{fmtINR(totalRevenue * 6.8)}</div>
              <div className="db-stats-mini-label">Monthly Sales</div>
              <span className="db-stats-mini-badge badge-green-sm">↑ 6%</span>
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

        {/* ── Main 3-col Grid ── */}
        <div className="db-main-grid">

          {/* LEFT — System Status */}
          <div className="db-main-left">
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">System Status</div>
                <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
              </div>
              <div className="db-status-list">
                <StatusRow name="Backend API"    status="Healthy" />
                <StatusRow name="Database"       status="Healthy" />
                <StatusRow name="Authentication" status="Healthy" />
                <StatusRow name="Storage"        status="Healthy" />
                <StatusRow name="Backup"         status="Healthy" />
                <StatusRow name="Mail Service"   status="Healthy" />
              </div>
            </div>

            <div className="db-card">
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
          </div>

          {/* CENTER — Charts + Activity */}
          <div className="db-main-center">
            {/* Revenue Trend + Attendance Donut */}
            <div className="db-chart-row">
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">Revenue Trend</div>
                  <select className="db-panel-select" value={revTrendYear} onChange={e => setRevTrendYear(e.target.value)}>
                    <option value="current">This Month</option>
                    <option value="last">Last Month</option>
                  </select>
                </div>
                <div className="db-card-body">
                  <div className="db-chart-wrap">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                          <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="db-empty">No revenue data available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Attendance Donut */}
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">Employee Attendance</div>
                  <span style={{ fontSize: 11, color: "#6B7280" }}>This Week</span>
                </div>
                <div className="db-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div className="db-donut-wrap" style={{ position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value" startAngle={90} endAngle={-270}>
                          {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{attendancePct}%</div>
                      <div style={{ fontSize: 10, color: "#6B7280" }}>Present</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                    <span style={{ color: "#6366f1", fontWeight: 600 }}>● Present {attendanceTotal}</span>
                    <span style={{ color: "#E2E8F0", fontWeight: 600, color: "#9CA3AF" }}>● Absent {attendanceAbsent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Recent Activity</div>
                <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
              </div>
              <div className="db-activity-list">
                {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((a, i) => {
                  const lo = (a.text || "").toLowerCase();
                  let Icon = Activity, bg = "#EFF6FF", col = "#3B82F6";
                  if (lo.includes("created")) { Icon = Plus; bg = "#DCFCE7"; col = "#22C55E"; }
                  else if (lo.includes("delete") || lo.includes("warning")) { Icon = AlertTriangle; bg = "#FEF9C3"; col = "#D97706"; }
                  else if (lo.includes("logged")) { Icon = UserCheck; bg = "#EFF6FF"; col = "#3B82F6"; }
                  return <ActivityItem key={i} icon={Icon} iconBg={bg} iconColor={col} title={a.type || "Activity"} desc={a.text} time={fmtTime(a.time)} />;
                }) : <div className="db-empty">No recent activity</div>}
              </div>
            </div>
          </div>

          {/* RIGHT — Profile + Notifs + Events */}
          <div className="db-main-right">

            {/* Profile Card */}
            <div className="db-profile-card">
              <div className="db-profile-banner profile-banner-admin" />
              <div className="db-profile-avatar profile-avatar-admin">
                {(user?.name || "A")[0].toUpperCase()}
              </div>
              <div className="db-profile-body">
                <div className="db-profile-name">{user?.name || "Administrator"}</div>
                <div className="db-profile-role">System Administrator</div>
                <span className="db-profile-badge profile-badge-admin">Full Access</span>
                <div className="db-profile-info">
                  <div className="db-profile-info-row">
                    <span className="db-profile-info-label">Admin ID</span>
                    <span className="db-profile-info-val">ADM-{String(user?.id || 1001).padStart(4,"0")}</span>
                  </div>
                  <div className="db-profile-info-row">
                    <span className="db-profile-info-label">Email</span>
                    <span className="db-profile-info-val" style={{ fontSize: 11 }}>{user?.email || "—"}</span>
                  </div>
                  <div className="db-profile-info-row">
                    <span className="db-profile-info-label">Last Login</span>
                    <span className="db-profile-info-val">{new Date().toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" })}</span>
                  </div>
                </div>
                <button className="db-profile-btn" onClick={() => navigate("/profile")}>
                  View Profile <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Notifications</div>
                <span className="db-card-link" onClick={() => navigate("/notifications")}>View All</span>
              </div>
              <div className="db-notif-list">
                {notifications.length > 0 ? notifications.slice(0, 5).map((n, i) => {
                  const colors = ["#6366F1","#22C55E","#F97316","#EF4444","#EAB308"];
                  return (
                    <div key={i} className="db-notif-item">
                      <div className="db-notif-dot" style={{ background: colors[i % colors.length] }} />
                      <div className="db-notif-body">
                        <div className="db-notif-text">{n.text}</div>
                        <div className="db-notif-time">{fmtTime(n.time)}</div>
                      </div>
                    </div>
                  );
                }) : (
                  <>
                    {[["New employee registered","#22C55E"],["Leave request for Consent","#6366F1"],["Payroll for June pending","#F97316"],["New order received","#3B82F6"],["Backup completed successfully","#22C55E"]].map(([text, color], i) => (
                      <div key={i} className="db-notif-item">
                        <div className="db-notif-dot" style={{ background: color }} />
                        <div className="db-notif-body">
                          <div className="db-notif-text">{text}</div>
                          <div className="db-notif-time">09:{String(30 + i * 5).padStart(2,"0")} AM</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Upcoming Events</div>
              </div>
              <div className="db-event-list">
                {upcomingEvents.length > 0 ? upcomingEvents.map((ev, i) => (
                  <div key={i} className="db-event-item">
                    <div className="db-event-date" style={{ background: ev.color }}>
                      <div className="db-event-day">{ev.day}</div>
                      <div className="db-event-mon">{ev.mon}</div>
                    </div>
                    <div className="db-event-body">
                      <div className="db-event-title">{ev.title}</div>
                      <div className="db-event-sub">{ev.sub}</div>
                    </div>
                  </div>
                )) : (
                  [["30","AUG","Payroll Processing","Finance","#6366F1"],["03","AUG","Management Meeting","Admin","#F97316"],["15","AUG","Monthly Audit","Compliance","#22C55E"]].map(([day,mon,title,sub,color],i) => (
                    <div key={i} className="db-event-item">
                      <div className="db-event-date" style={{ background: color }}>
                        <div className="db-event-day">{day}</div>
                        <div className="db-event-mon">{mon}</div>
                      </div>
                      <div className="db-event-body">
                        <div className="db-event-title">{title}</div>
                        <div className="db-event-sub">{sub}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="db-bottom-grid">

          {/* AI Insights */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title" style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Cpu size={14} color="#7C3AED" /> AI Insights
              </div>
            </div>
            <div className="db-ai-insights">
              {aiInsights.map((text, i) => {
                const colors = ["#6366F1","#F97316","#22C55E","#EF4444","#EAB308"];
                return (
                  <div key={i} className="db-ai-item">
                    <div className="db-ai-dot" style={{ background: colors[i % colors.length] }} />
                    <div className="db-ai-text">{text}</div>
                  </div>
                );
              })}
              {aiInsights.length === 0 && <div className="db-empty">Analyzing data…</div>}
            </div>
          </div>

          {/* Top Selling Materials */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">Top Selling Materials</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-bar-list">
              {topMaterials.length > 0 ? topMaterials.map((m, i) => {
                const colors = ["#6366F1","#3B82F6","#22C55E","#F97316","#EF4444"];
                const val = m.revenue || m.value || 0;
                const pct = Math.round((val / maxMatVal) * 100);
                return (
                  <div key={i} className="db-bar-item">
                    <div className="db-bar-label">
                      <span>{m.name || m.materialName}</span>
                      <span style={{ fontWeight: 600 }}>{fmtINR(val)}</span>
                    </div>
                    <div className="db-bar-track">
                      <div className="db-bar-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                );
              }) : (
                [["Cement","80"],["Steel","65"],["Bricks","55"],["Sand","42"],["Paint","30"]].map(([name, pct], i) => {
                  const colors = ["#6366F1","#3B82F6","#22C55E","#F97316","#EF4444"];
                  return (
                    <div key={i} className="db-bar-item">
                      <div className="db-bar-label"><span>{name}</span><span style={{ fontWeight:600 }}>{pct}0 Tons</span></div>
                      <div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${pct}%`, background: colors[i] }} /></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sales Analytics Pie */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">Sales Analytics</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-card-body" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:"Constructure",value:45},{name:"Real Estate",value:30},{name:"Manufacturing",value:15},{name:"Others",value:10}]}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                      {["#6366F1","#22C55E","#F97316","#9CA3AF"].map((c,i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
                  <div style={{ fontSize: 14, fontWeight:800, color:"#111827" }}>Total Sales</div>
                  <div style={{ fontSize: 11, color:"#6B7280" }}>{fmtINR(totalRevenue * 6.8)}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
                {[["Constructure","#6366F1","45%"],["Real Estate","#22C55E","30%"],["Manufacturing","#F97316","15%"],["Others","#9CA3AF","10%"]].map(([label,color,pct],i) => (
                  <span key={i} style={{ fontSize:11, color:"#374151" }}><span style={{ color, fontWeight:700 }}>●</span> {label} {pct}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Profit */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">Monthly Profit</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-profit-val">{fmtINR(totalRevenue * 2)}</div>
            <div className="db-profit-sub">↑ 6.7% vs last month</div>
            <div style={{ padding: "0 20px 16px" }}>
              <div className="db-chart-wrap" style={{ height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i) => ({ m: i+1, v }))}>
                    <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
