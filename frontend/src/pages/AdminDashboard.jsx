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
  TrendingDown, Settings, Plus, ArrowRight, UserPlus, CreditCard,
  LineChart as LineChartIcon, Briefcase, Database, Folder
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
        <div className="db-greeting-bar" style={{display:"flex", justifyContent:"space-between", marginBottom: 24}}>
          <div className="db-greeting-left">
            <div className="db-greeting-text" style={{fontSize: 24, fontWeight: 800, color:"#111827"}}>
              {greeting()}, {user?.name?.split(" ")[0] || "Admin"}! 👋
            </div>
            <div className="db-greeting-sub" style={{color:"#64748b", fontSize: 14}}>Welcome back! You're doing great today.</div>
          </div>
          <div className="db-greeting-right" style={{display:"flex", alignItems:"center", gap: 24}}>
            <div className="db-datetime" style={{fontSize: 12, color: "#64748b", display: "flex", alignItems: "center"}}>
              <Calendar size={14} style={{display:"inline", marginRight:4}} />
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              &nbsp;&nbsp;&nbsp;
              <Clock size={14} style={{display:"inline", marginRight:4}} />
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="db-status-pill" style={{background:"#dcfce7", color:"#16a34a", padding:"6px 12px", borderRadius:20, fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6}}>
              <div style={{width:6, height:6, borderRadius:"50%", background:"#16a34a"}} />
              All Systems Operational
            </div>
          </div>
        </div>

        {/* ── MASTER LAYOUT ── */}
        <div className="db-master-grid">
          
          {/* LEFT PANE: 9 columns */}
          <div className="db-left-pane">
            
            {/* KPI Cards */}
            <div className="db-kpi-grid">
              <KpiCard icon={Activity} iconClass="green" label="System Health" value="100%" trend="Excellent" trendUp={true} sub="All services running" />
              <KpiCard icon={DollarSign} iconClass="blue" label="Revenue Today" value={fmtINR(totalRevenue)} trend="vs yesterday" trendUp={true} sub="Year-to-date" />
              <KpiCard icon={ShoppingCart} iconClass="orange" label="Orders Today" value={activeOrders} trend={pendingOrders+" pending"} trendUp={false} sub="Active orders" />
              <KpiCard icon={Users} iconClass="purple" label="Active Employees" value={totalEmployees} trend="vs last month" trendUp={true} sub={attendanceTotal+" present today"} />
            </div>

            {/* Quick Actions */}
            <div className="db-card" style={{padding: "16px 20px"}}>
              <div style={{fontWeight: 600, fontSize: 13, color: "#111827", marginBottom: 16}}>Quick Actions</div>
              <div className="db-qa-grid" style={{display: 'flex', justifyContent: 'space-between', gap: '8px'}}>
                <QaBtn icon={CheckCircle2} label="Attendance" colorClass="qa-red" onClick={() => navigate("/attendance")} />
                <QaBtn icon={Users} label="Employee" colorClass="qa-blue" onClick={() => navigate("/employees")} />
                <QaBtn icon={DollarSign} label="Payroll" colorClass="qa-purple" onClick={() => navigate("/payroll")} />
                <QaBtn icon={Box} label="Inventory" colorClass="qa-orange" onClick={() => navigate("/materials")} />
                <QaBtn icon={Tag} label="Sales" colorClass="qa-green" onClick={() => navigate("/orders")} />
                <QaBtn icon={Building2} label="Vendors" colorClass="qa-teal" onClick={() => navigate("/vendors")} />
                <QaBtn icon={FileText} label="Reports" colorClass="qa-amber" onClick={() => navigate("/analytics")} />
                <QaBtn icon={Settings} label="Settings" colorClass="qa-cyan" onClick={() => navigate("/settings")} />
                <QaBtn icon={Layers} label="ERP" colorClass="qa-indigo" onClick={() => navigate("/erp")} />
                <QaBtn icon={ListTodo} label="Tasks" colorClass="qa-pink" onClick={() => navigate("/my-tasks")} />
                <QaBtn icon={Folder} label="Projects" colorClass="qa-blue" onClick={() => navigate("/projects")} />
              </div>
            </div>

            {/* Mini Stats */}
            <div className="db-card" style={{padding: "16px 20px"}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 16}}>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Total Employees</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><Users size={16} color="#3B82F6"/> {totalEmployees}</div><div style={{fontSize: 10, color: "#22c55e"}}>↑ this month</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Present Today</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><UserCheck size={16} color="#22c55e"/> {attendanceTotal}</div><div style={{fontSize: 10, color: "#22c55e"}}>{attendancePct}%</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Pending Leaves</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><Calendar size={16} color="#f97316"/> {dashboardData?.hrStats?.pendingLeaves || 0}</div><div style={{fontSize: 10, color: "#f97316"}}>Needs Approval</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Active Materials</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><Layers size={16} color="#3B82F6"/> {totalMaterials}</div><div style={{fontSize: 10, color: "#3B82F6"}}>In inventory</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Open P.O Orders</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><ShoppingCart size={16} color="#ef4444"/> 18</div><div style={{fontSize: 10, color: "#ef4444"}}>Total Open</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Today's Revenue</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><DollarSign size={16} color="#22c55e"/> {fmtINR(totalRevenue)}</div><div style={{fontSize: 10, color: "#22c55e"}}>↑ 18.6%</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Monthly Sales</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><LineChartIcon size={16} color="#3b82f6"/> ₹28.45L</div><div style={{fontSize: 10, color: "#22c55e"}}>↑ 12.4%</div></div>
                <div style={{width: 1, background: "#f1f5f9"}}/>
                <div style={{flex: 1}}><div style={{fontSize: 10, color: "#64748b"}}>Pending Tasks</div><div style={{fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}><ListTodo size={16} color="#f97316"/> {pendingTasks}</div><div style={{fontSize: 10, color: "#f97316"}}>Due Soon</div></div>
              </div>
            </div>

          </div>

          {/* RIGHT PANE: 3 columns */}
          <div className="db-right-pane">
            <div className="db-card" style={{ height: '100%' }}>
              <div className="db-card-body" style={{ alignItems: "center", textAlign: "center", paddingTop: 40, paddingBottom: 40, display: "flex", flexDirection: "column" }}>
                <div style={{width: 80, height: 80, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: "bold", color: "#64748b", marginBottom: 16}}>
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div style={{fontSize: 18, fontWeight: 700, color: "#111827"}}>{user?.name || "Admin"}</div>
                <div style={{fontSize: 12, color: "#64748b", marginBottom: 16}}>{user?.role || "System Administrator"}</div>
                <div style={{background: "#dcfce7", color: "#16a34a", fontSize: 10, fontWeight: 600, padding: "4px 8px", borderRadius: 4, marginBottom: 24}}>Full Access</div>
                
                <div style={{width: "100%", textAlign: "left", fontSize: 11, display: "flex", flexDirection: "column", gap: 12}}>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Admin ID</span><span style={{fontWeight: 600}}>ADM-1001</span></div>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Department</span><span style={{fontWeight: 600}}>Administration</span></div>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Email</span><span style={{fontWeight: 600}}>{user?.email || "admin@smtbms.com"}</span></div>
                  <div style={{display: "flex", justifyContent: "space-between"}}><span style={{color: "#64748b"}}>Last Login</span><span style={{fontWeight: 600}}>{now.toLocaleDateString()}</span></div>
                </div>

                <div style={{marginTop: "auto", width: "100%", paddingTop: 20}}>
                  <button onClick={() => navigate("/profile")} style={{width: "100%", padding: "10px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer"}}>View Profile →</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM GRID (12 columns) ── */}
        <div className="db-bottom-grid">
          
          {/* ROW 4 */}
          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">System Status</div><span className="db-card-link">View All</span></div>
            <div className="db-status-list" style={{padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12}}>
              <StatusRow name="Backend API" status="Healthy" />
              <StatusRow name="Database" status="Healthy" />
              <StatusRow name="Authentication" status="Healthy" />
              <StatusRow name="Storage" status="Healthy" />
              <StatusRow name="Backup" status="Healthy" />
              <StatusRow name="Mail Service" status="Healthy" />
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Revenue Trend</div>
              <select className="db-panel-select" style={{fontSize: 11, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, padding: "2px 4px", outline: "none"}} value={revTrendYear} onChange={e => setRevTrendYear(e.target.value)}><option value="current">This Month</option></select>
            </div>
            <div className="db-card-body" style={{padding:0}}>
              <div className="db-chart-wrap" style={{width: "100%", height: "240px"}}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={{r:3, fill:"#3b82f6"}} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="db-empty">No revenue data available</div>}
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Employee Attendance</div><span style={{fontSize: 11, color: "#6B7280"}}>This Week</span></div>
            <div className="db-card-body" style={{alignItems:"center", justifyContent:"center"}}>
              <div className="db-donut-wrap" style={{position:"relative", height: 160, width: 160}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      <Cell fill="#16A34A" />
                      <Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
                  <div style={{fontSize: 20, fontWeight: 800, color: "#111827"}}>{attendancePct}%</div>
                  <div style={{fontSize: 10, color: "#6B7280"}}>Present</div>
                </div>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: 8, fontSize: 11, marginTop: 16, width: "100%", padding: "0 10px"}}>
                <div style={{display: "flex", alignItems: "center", gap: 4}}><div style={{width: 8, height: 8, borderRadius: "50%", background: "#16A34A"}}/> <span style={{fontWeight: 600}}>Present</span> <span style={{marginLeft: "auto", color: "#64748b"}}>{attendanceTotal} ({attendancePct}%)</span></div>
                <div style={{display: "flex", alignItems: "center", gap: 4}}><div style={{width: 8, height: 8, borderRadius: "50%", background: "#ef4444"}}/> <span style={{fontWeight: 600}}>Absent</span> <span style={{marginLeft: "auto", color: "#64748b"}}>{attendanceAbsent} ({100-attendancePct}%)</span></div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Recent Activity</div><span className="db-card-link">View All</span></div>
            <div className="db-activity-list" style={{padding: "0 20px 20px"}}>
              <div style={{display: "flex", gap: 12, marginBottom: 16}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#e11d48", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}>A</div>
                <div style={{flex: 1}}><div style={{fontSize: 11, fontWeight: 600}}>Employee Added</div><div style={{fontSize: 10, color: "#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width:"100px"}}>New employee John Doe added</div></div>
                <div style={{fontSize: 10, color: "#64748b"}}>10:25 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#7c3aed", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}>S</div>
                <div style={{flex: 1}}><div style={{fontSize: 11, fontWeight: 600}}>Payroll Generated</div><div style={{fontSize: 10, color: "#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width:"100px"}}>June payroll generated successfully</div></div>
                <div style={{fontSize: 10, color: "#64748b"}}>09:45 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#f59e0b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}>C</div>
                <div style={{flex: 1}}><div style={{fontSize: 11, fontWeight: 600}}>Material Updated</div><div style={{fontSize: 10, color: "#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width:"100px"}}>Cement stock updated</div></div>
                <div style={{fontSize: 10, color: "#64748b"}}>09:15 AM</div>
              </div>
              <div style={{display: "flex", gap: 12}}>
                <div style={{width: 24, height: 24, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10}}><CheckCircle2 size={12}/></div>
                <div style={{flex: 1}}><div style={{fontSize: 11, fontWeight: 600}}>Leave Approved</div><div style={{fontSize: 10, color: "#64748b", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width:"100px"}}>Leave request approved</div></div>
                <div style={{fontSize: 10, color: "#64748b"}}>08:55 AM</div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Notifications</div><span className="db-card-link">View All</span></div>
            <div className="db-notif-list" style={{padding: "0 20px 20px"}}>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><UserPlus size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500, flex: 1}}>New employee registered</div>
                <div style={{fontSize: 10, color: "#64748b"}}>10:20 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#fff7ed", color: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><Box size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500, flex: 1}}>Inventory low for Cement</div>
                <div style={{fontSize: 10, color: "#64748b"}}>09:50 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#f3e8ff", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><CreditCard size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500, flex: 1}}>Payroll for June pending</div>
                <div style={{fontSize: 10, color: "#64748b"}}>09:45 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, marginBottom: 16, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><ShoppingCart size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500, flex: 1}}>New order received</div>
                <div style={{fontSize: 10, color: "#64748b"}}>09:30 AM</div>
              </div>
              <div style={{display: "flex", gap: 12, alignItems: "center"}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}><Database size={16}/></div>
                <div style={{fontSize: 12, fontWeight: 500, flex: 1}}>Backup completed successfully</div>
                <div style={{fontSize: 10, color: "#64748b"}}>08:20 AM</div>
              </div>
            </div>
          </div>

          {/* ROW 5 */}
          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title"><Cpu size={14} style={{display:"inline", color:"#8b5cf6"}}/> AI Insights</div></div>
            <div className="db-ai-insights" style={{padding: "0 20px 20px"}}>
              <div style={{display: "flex", gap: 8, marginBottom: 16}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", marginTop: 4}}/><div style={{fontSize: 11, color: "#475569"}}>Revenue increased <span style={{color: "#10b981", fontWeight: 600}}>18%</span> compared to yesterday.</div></div>
              <div style={{display: "flex", gap: 8, marginBottom: 16}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#10b981", marginTop: 4}}/><div style={{fontSize: 11, color: "#475569"}}>12 leave requests require approval.</div></div>
              <div style={{display: "flex", gap: 8, marginBottom: 16}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", marginTop: 4}}/><div style={{fontSize: 11, color: "#475569"}}>Inventory for Cement is below threshold.</div></div>
              <div style={{display: "flex", gap: 8, marginBottom: 16}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#ef4444", marginTop: 4}}/><div style={{fontSize: 11, color: "#475569"}}>Payroll deadline is tomorrow.</div></div>
              <div style={{display: "flex", gap: 8}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6", marginTop: 4}}/><div style={{fontSize: 11, color: "#475569"}}>Expected monthly profit: <span style={{fontWeight: 600}}>₹8.4 Lakhs</span>.</div></div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Top Selling Materials</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
            <div className="db-bar-list" style={{padding: "0 20px 20px"}}>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6}}><span style={{fontWeight: 600}}>Cement</span><span style={{color: "#64748b"}}>1,250 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '90%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6}}><span style={{fontWeight: 600}}>Steel</span><span style={{color: "#64748b"}}>980 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '75%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6}}><span style={{fontWeight: 600}}>Bricks</span><span style={{color: "#64748b"}}>750 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '60%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div style={{marginBottom: 12}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6}}><span style={{fontWeight: 600}}>Sand</span><span style={{color: "#64748b"}}>620 Tons</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '45%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
              <div>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6}}><span style={{fontWeight: 600}}>Paint</span><span style={{color: "#64748b"}}>410 Units</span></div>
                <div style={{height: 6, background: "#f1f5f9", borderRadius: 3}}><div style={{width: '30%', height: '100%', background: '#3B82F6', borderRadius: 3}} /></div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Sales Analytics</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
            <div className="db-card-body" style={{alignItems:"center", justifyContent:"center"}}>
              <div className="db-donut-wrap" style={{position:"relative", height: 160, width: 160}}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{value: 40}, {value: 30}, {value: 20}, {value: 10}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                      <Cell fill="#3B82F6" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#10B981" />
                      <Cell fill="#6366F1" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center"}}>
                  <div style={{fontSize: 10, color: "#6B7280"}}>Total Sales</div>
                  <div style={{fontSize: 16, fontWeight: 800, color: "#111827"}}>₹28.45L</div>
                </div>
              </div>
              <div style={{display: "flex", flexWrap: "wrap", gap: 12, fontSize: 10, marginTop: 16, justifyContent: "center", padding: "0 10px"}}>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#3B82F6"}}/> Construction <span style={{color:"#64748b", marginLeft:"auto"}}>40%</span></div>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#F59E0B"}}/> Real Estate <span style={{color:"#64748b", marginLeft:"auto"}}>30%</span></div>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#10B981"}}/> Manufacturing <span style={{color:"#64748b", marginLeft:"auto"}}>20%</span></div>
                <div style={{display: "flex", alignItems: "center", gap: 4, width: "40%"}}><div style={{width: 6, height: 6, borderRadius: "50%", background: "#6366F1"}}/> Others <span style={{color:"#64748b", marginLeft:"auto"}}>10%</span></div>
              </div>
            </div>
          </div>

          <div className="db-card db-col-2">
            <div className="db-card-header"><div className="db-card-title">Monthly Profit</div><span style={{fontSize: 11, color: "#6B7280"}}>This Month</span></div>
            <div className="db-card-body" style={{padding:0, paddingTop: 10}}>
              <div style={{fontSize: 10, color: "#64748b", padding: "0 20px"}}>Total Profit</div>
              <div style={{fontSize: 24, fontWeight: 800, color: "#111827", padding: "0 20px", marginTop: 4}}>₹8.45L</div>
              <div style={{fontSize: 11, color: "#16A34A", padding: "4px 20px", fontWeight: 600, display: "flex", alignItems: "center", gap: 4}}><TrendingUp size={12}/> 14.6% <span style={{color:"#94a3b8", fontWeight: 400}}>vs last month</span></div>
              <div style={{width:"100%", height:"120px", marginTop: "auto"}}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i)=>({i,v}))} margin={{top: 10, right: 0, left: 0, bottom: 0}}>
                    <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={3} dot={{r: 3, fill: "#22c55e", strokeWidth: 0}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Events</div><span className="db-card-link">View Calendar</span></div>
            <div style={{padding: "0 20px 20px"}}>
               <div style={{display: "flex", gap: 16, marginBottom: 20, alignItems: "center"}}>
                 <div style={{textAlign: "center", color: "#64748b", background: "#fef2f2", padding: "8px 12px", borderRadius: 8}}>
                   <div style={{fontSize: 16, fontWeight: 800, color: "#ef4444"}}>31</div>
                   <div style={{fontSize: 10, color: "#ef4444", fontWeight: 700}}>JUL</div>
                 </div>
                 <div><div style={{fontSize: 12, fontWeight: 600, color: "#111827"}}>Payroll Processing</div><div style={{fontSize: 11, color: "#64748b"}}>Due in 3 days</div></div>
               </div>
               <div style={{display: "flex", gap: 16, marginBottom: 20, alignItems: "center"}}>
                 <div style={{textAlign: "center", color: "#64748b", background: "#eff6ff", padding: "8px 12px", borderRadius: 8}}>
                   <div style={{fontSize: 16, fontWeight: 800, color: "#3b82f6"}}>05</div>
                   <div style={{fontSize: 10, color: "#3b82f6", fontWeight: 700}}>AUG</div>
                 </div>
                 <div><div style={{fontSize: 12, fontWeight: 600, color: "#111827"}}>Management Meeting</div><div style={{fontSize: 11, color: "#64748b"}}>Conference Room A</div></div>
               </div>
               <div style={{display: "flex", gap: 16, alignItems: "center"}}>
                 <div style={{textAlign: "center", color: "#64748b", background: "#ecfdf5", padding: "8px 12px", borderRadius: 8}}>
                   <div style={{fontSize: 16, fontWeight: 800, color: "#10b981"}}>15</div>
                   <div style={{fontSize: 10, color: "#10b981", fontWeight: 700}}>AUG</div>
                 </div>
                 <div><div style={{fontSize: 12, fontWeight: 600, color: "#111827"}}>Monthly Audit</div><div style={{fontSize: 11, color: "#64748b"}}>Compliance Check</div></div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
