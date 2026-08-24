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
const KpiCard = ({ icon: Icon, iconClass, label, value, trend, trendUp, sub, sparkData, sparkColor }) => (
  <div className="db-kpi-card">
    <div className="db-kpi-top">
      <div className={`db-kpi-icon ${iconClass}`}><Icon size={22} /></div>
      {trend && (
        <span className={`db-kpi-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
        </span>
      )}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
      <div>
        <div className="db-kpi-value">{value}</div>
        <div className="db-kpi-label">{label}</div>
      </div>
      {sparkData && (
        <div style={{ width: '80px', height: '40px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    {sub && <div className="db-kpi-sub" style={{ marginTop: '8px' }}>{sub}</div>}
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
const DONUT_COLORS = ["#22c55e", "#ef4444"];

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

  return (
    <div className="db-page">
      <div className="db-content db-layout-split">
        
        {/* ── LEFT MAIN CONTENT ── */}
        <div className="db-main-content">
          
          {/* Row 1: 4 Stat Cards */}
          <div className="db-kpi-grid">
            <KpiCard icon={AlertTriangle} iconClass="orange" label="Low Stock Items" value={lowStock.length} trend="Needs Attention" trendUp={false} sub="Below reorder level" sparkData={null} sparkColor="#f97316" />
            <KpiCard icon={DollarSign}   iconClass="blue"   label="Revenue Today"    value={fmtINR(totalRevenue)}    trend="vs yesterday"  trendUp={true}  sub="Year-to-date" sparkData={sparkData} sparkColor="#3b82f6" />
            <KpiCard icon={ShoppingCart} iconClass="orange" label="Orders Today"     value={activeOrders}            trend={`${pendingOrders} pending`} trendUp={false} sub="Active orders" sparkData={sparkData} sparkColor="#f97316" />
            <KpiCard icon={Users}        iconClass="purple" label="Active Employees"  value={totalEmployees}          trend="vs last month" trendUp={true}  sub={`${attendanceTotal} present today`} sparkData={sparkData} sparkColor="#a855f7" />
          </div>

          {/* Row 2: Quick Actions */}
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

          {/* Row 3: Stats Mini Row */}
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

          {/* Row 4: Panel Row 1 (4 columns) */}
          <div className="db-panel-grid">
            
            {/* 1. Low Stock Alerts */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Low Stock Alerts</div>
                <span className="db-card-link" onClick={() => navigate("/materials")}>View Inventory</span>
              </div>
              <div className="db-status-list" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '8px' }}>
                {lowStock.length > 0 ? lowStock.slice(0, 6).map((item, idx) => (
                  <StatusRow key={idx} name={item.materialName || item.name || "Material"} status={`${item.currentStock || item.stock || 0} left`} />
                )) : (
                  <div className="db-empty" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>Stock levels healthy</div>
                )}
              </div>
            </div>

            {/* 2. Revenue Trend */}
            <div className="db-card">
              <div className="db-card-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
                <div className="db-card-title">Revenue Trend</div>
                <select className="db-panel-select" value={revTrendYear} onChange={e => setRevTrendYear(e.target.value)} style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <option value="current">This Month</option>
                  <option value="last">Last Month</option>
                </select>
              </div>
              <div style={{ flex: 1, minHeight: "160px", marginTop: "10px" }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} style={{ outline: 'none' }}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} style={{ outline: 'none' }}>
                      <defs>
                        <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip 
                        cursor={false}
                        labelFormatter={(label) => label}
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                        contentStyle={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '8px 12px', fontSize: '12px' }} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#colorRev2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="db-empty" style={{ textAlign: 'center', paddingTop: '20px', color: '#94a3b8' }}>No data</div>
                )}
              </div>
            </div>

            {/* 3. Employee Attendance */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Employee Attendance</div>
              </div>
              <div className="db-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, justifyContent: 'center' }}>
                <div className="db-donut-wrap" style={{ position: "relative", height: "120px", width: "100%", display: "flex", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={42} outerRadius={56} dataKey="value" startAngle={90} endAngle={-270} stroke="none" cornerRadius={4}>
                        {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{attendancePct}%</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, marginTop: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[0] }} />
                    <span style={{ color: "#64748b" }}>Present <span style={{ color: "#0f172a", fontWeight: 700 }}>{attendanceTotal}</span></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[1] }} />
                    <span style={{ color: "#64748b" }}>Absent <span style={{ color: "#0f172a", fontWeight: 700 }}>{attendanceAbsent}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Recent Activity */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Recent Activity</div>
                <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
              </div>
              <div className="db-activity-list" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px' }}>
                {recentActivity.length > 0 ? recentActivity.slice(0, 4).map((a, i) => {
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
                  <div className="db-empty" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No recent activity</div>
                )}
              </div>
            </div>
          </div>

          {/* Row 5: Panel Row 2 (4 columns) */}
          <div className="db-panel-grid">
            
            {/* 5. AI Insights */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={14} color="#8b5cf6" /> AI Insights
                </div>
              </div>
              <div className="db-ai-insights" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '8px' }}>
                {aiLoading ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>
                    Generating insights...
                  </div>
                ) : displayInsights && displayInsights.length > 0 ? (
                  displayInsights.map((ins, i) => {
                    const colors = ["#6366f1", "#f97316", "#22c55e", "#ef4444"];
                    return (
                      <div key={i} className="db-ai-item" style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <div className="db-ai-dot" style={{ background: colors[i % colors.length], marginTop: '4px', width: 6, height: 6 }} />
                        <div className="db-ai-text">{ins}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="db-empty" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No insights.</div>
                )}
              </div>
            </div>

            {/* 6. Top Selling Materials */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Top Selling Materials</div>
              </div>
              <div className="db-bar-list" style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topMaterials.length > 0 ? topMaterials.map((m, i) => (
                  <div key={i} className="db-bar-item" style={{ marginBottom: '8px' }}>
                    <div className="db-bar-label">
                      <span>{m.name || m.materialName || `Material ${i+1}`}</span>
                      <span style={{ fontWeight: 700 }}>{fmtINR(m.revenue || m.value || 0)}</span>
                    </div>
                    <div className="db-bar-track">
                      <div className="db-bar-fill" style={{ width: `${Math.max(10, ((m.revenue || m.value || 0) / (Math.max(...topMaterials.map(tm => tm.revenue || tm.value || 0)) || 1)) * 100)}%`, background: i === 0 ? '#3b82f6' : '#94a3b8' }} />
                    </div>
                  </div>
                )) : (
                  <div className="db-empty" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>No data</div>
                )}
              </div>
            </div>

            {/* 7. Sales Analytics */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Sales Analytics</div>
              </div>
              <div className="db-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, justifyContent: 'center' }}>
                <div className="db-donut-wrap" style={{ position: "relative", height: "120px", width: "100%", display: "flex", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                      <Pie data={[{name: 'A', value: 400}, {name: 'B', value: 300}, {name: 'C', value: 300}, {name: 'D', value: 200}]} cx="50%" cy="50%" innerRadius={42} outerRadius={56} dataKey="value" stroke="none" cornerRadius={4}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#e2e8f0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Total</span>
                    <br />
                    <span style={{ fontSize: 10, color: "#64748b" }}>Sales</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%' }}/> Electronics</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }}/> Hardware</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 6, height: 6, background: '#f59e0b', borderRadius: '50%' }}/> Software</div>
                </div>
              </div>
            </div>

            {/* 8. Monthly Profit */}
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Monthly Profit</div>
              </div>
              <div className="db-card-body" style={{ padding: '16px 16px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{fmtINR(totalProfit)}</div>
                <div style={{ fontSize: '12px', color: profitTrendPct >= 0 ? '#10b981' : '#ef4444', fontWeight: '600', marginBottom: '8px' }}>
                  {profitTrendPct >= 0 ? '↑' : '↓'} {Math.abs(profitTrendPct)}% vs last month
                </div>
                <div style={{ width: "100%", flex: 1, minHeight: '80px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={sparkData}>
                      <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ── RIGHT SIDEBAR RAIL ── */}
        <div className="db-sidebar-rail">
          
          {/* Profile Card */}
          <div className="db-profile-card">
            <div className="db-profile-banner profile-banner-admin">
              <div className="db-profile-avatar profile-avatar-admin" style={{ overflow: 'hidden' }}>
                {user?.profileImage || user?.avatar ? (
                  <img src={user.profileImage || user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.name ? user.name.substring(0, 2).toUpperCase() : 'AU'
                )}
              </div>
            </div>
            <div className="db-profile-body">
              <div className="db-profile-name">{user?.name || "Admin User"}</div>
              <div className="db-profile-role">{user?.role || "System Administrator"}</div>
              <div className="db-profile-badge profile-badge-admin">Full Access</div>
              
              <div className="db-profile-info">
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Admin ID</span>
                  <span className="db-profile-info-val">{user?.employeeId || "N/A"}</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Department</span>
                  <span className="db-profile-info-val">{user?.department || user?.role || "N/A"}</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Email</span>
                  <span className="db-profile-info-val">{user?.email || "admin@smtbms.com"}</span>
                </div>
                <div className="db-profile-info-row">
                  <span className="db-profile-info-label">Last Login</span>
                  <span className="db-profile-info-val">{fmtTime(new Date().toISOString())}</span>
                </div>
              </div>
              
              <button className="db-profile-btn" onClick={() => navigate("/profile")}>
                <UserCheck size={14} /> View Profile
              </button>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">Notifications</div>
              <span className="db-card-link">View All</span>
            </div>
            <div className="db-notif-list" style={{ flex: 1, overflowY: 'auto' }}>
              <div className="db-notif-item">
                <div className="db-notif-dot" style={{ background: '#3b82f6' }} />
                <div className="db-notif-body">
                  <div className="db-notif-text">New order #8920 received from client</div>
                  <div className="db-notif-time">2 mins ago</div>
                </div>
              </div>
              <div className="db-notif-item">
                <div className="db-notif-dot" style={{ background: '#f59e0b' }} />
                <div className="db-notif-body">
                  <div className="db-notif-text">Low stock alert for Steel Beams</div>
                  <div className="db-notif-time">1 hr ago</div>
                </div>
              </div>
              <div className="db-notif-item">
                <div className="db-notif-dot" style={{ background: '#10b981' }} />
                <div className="db-notif-body">
                  <div className="db-notif-text">System backup completed successfully</div>
                  <div className="db-notif-time">3 hrs ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Panel */}
          <div className="db-card">
            <div className="db-card-header">
              <div className="db-card-title">Upcoming Events</div>
            </div>
            <div className="db-event-list" style={{ padding: '12px', flex: 1, overflowY: 'auto' }}>
              {upcomingEvents.length > 0 ? upcomingEvents.map((e, i) => (
                <div key={i} className="db-event-item" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="db-event-date" style={{ background: e.bg, color: e.color, padding: '6px 10px', borderRadius: '6px', textAlign: 'center' }}>
                    <div className="db-event-day" style={{ fontSize: '14px', fontWeight: '800' }}>{e.day}</div>
                    <div className="db-event-mon" style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase' }}>{e.mon}</div>
                  </div>
                  <div className="db-event-body">
                    <div className="db-event-title" style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a' }}>{e.title}</div>
                    <div className="db-event-sub" style={{ fontSize: '11px', color: '#64748b' }}>{e.sub}</div>
                  </div>
                </div>
              )) : (
                <div className="db-empty" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>No events scheduled</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
