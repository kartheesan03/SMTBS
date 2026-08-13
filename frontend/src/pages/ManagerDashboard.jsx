import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  Users, ShoppingCart, DollarSign, Box, FileText, Truck,
  BarChart2, Bell, Calendar, ListTodo, UserCheck, Activity,
  AlertCircle, AlertTriangle, Package, Target, Clock, Settings,
  TrendingUp, TrendingDown, ArrowRight, CheckSquare, Plus, Quote,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState } from "../components/DataStates";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};
const fmtINR = (v) => {
  if (!v && v !== 0) return "₹0";
  const abs = Math.abs(v);
  if (abs >= 100000) return `₹${(abs/100000).toFixed(2)}L`;
  if (abs >= 1000)   return `₹${(abs/1000).toFixed(1)}k`;
  return `₹${abs}`;
};
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const KpiCard = ({ icon: Icon, iconClass, label, value, trend, trendUp, sub }) => (
  <div className="db-kpi-card">
    <div className="db-kpi-top">
      <div className={`db-kpi-icon ${iconClass}`}><Icon size={22} /></div>
      {trend && <span className={`db-kpi-trend ${trendUp ? "up" : "down"}`}>{trendUp ? <TrendingUp size={11}/> : <TrendingDown size={11}/>} {trend}</span>}
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

const SPARK = [5,8,6,11,7,13,9,14,11,16,13,15];
const DONUT_COLORS = ["#D97706","#E2E8F0"];

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [orders, setOrders]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  useEffect(() => {
    Promise.all([
      API.get("/dashboard/stats").catch(() => ({ data: {} })),
      API.get("/tasks").catch(() => ({ data: [] })),
      API.get("/employees").catch(() => ({ data: [] })),
      API.get("/orders").catch(() => ({ data: [] })),
      API.get("/attendance").catch(() => ({ data: null })),
    ]).then(([stats, tasksR, empR, ordR, attR]) => {
      setDashboardData(stats.data || {});
      const taskList = tasksR.data || [];
      setTasks(taskList.filter(t => t.status !== "Completed").slice(0, 5));
      const now = new Date();
      setUpcomingEvents(
        taskList.filter(t => t.dueDate && new Date(t.dueDate) >= now)
          .sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate))
          .slice(0, 4)
          .map((t,i) => {
            const d = new Date(t.dueDate);
            const colors = ["#D97706","#6366F1","#22C55E","#EF4444"];
            return { day: String(d.getDate()).padStart(2,"0"), mon: d.toLocaleString("default",{month:"short"}).toUpperCase(), title: t.title, sub: t.category||"General", color: colors[i%4] };
          })
      );
      setEmployees(empR.data || []);
      setOrders(ordR.data || []);
      setAttendance(attR.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading Manager Dashboard…" height="100vh" />;

  const s = dashboardData?.stats || {};
  const totalTeam    = employees.length || s.totalEmployees || 0;
  const openOrders   = orders.filter(o => !["Completed","Delivered","Cancelled"].includes(o.status)).length;
  const pendingTasks = tasks.length;
  const totalRevenue = s.revenue || 0;
  const pendingOrders= s.pendingOrders || 0;

  const trendRaw  = dashboardData?.analytics?.trendData || dashboardData?.charts?.monthlyStats || [];
  const chartData = trendRaw.map(d => ({ name: d.name, revenue: d.revenue||0 }));

  const taskDoneCount = (dashboardData?.stats?.completedTasks || 0);
  const taskTotal = taskDoneCount + pendingTasks;
  const taskPct   = taskTotal > 0 ? Math.round((taskDoneCount/taskTotal)*100) : 0;
  const donutData = taskTotal > 0
    ? [{ name:"Done", value: taskDoneCount }, { name:"Pending", value: pendingTasks }]
    : [{ name:"No data", value:1 }];

  const recentActivity = dashboardData?.tables?.recentActivity || [];
  const notifications  = dashboardData?.tables?.notifications  || [];

  const fallbackAiInsights = [
    openOrders > 0    && `${openOrders} orders are currently active and require attention.`,
    pendingTasks > 0  && `${pendingTasks} tasks are pending — review and assign priorities.`,
    totalRevenue > 0  && `Revenue is tracking at ${fmtINR(totalRevenue)} this period.`,
    pendingOrders > 0 && `${pendingOrders} purchase orders are awaiting approval.`,
    totalTeam > 0     && `Managing a team of ${totalTeam} employees.`,
  ].filter(Boolean).slice(0,5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  return (
    <div className="db-page">
      <div className="db-content">

        {/* Greeting Bar */}
        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">{greeting()}, {user?.name?.split(" ")[0] || "Manager"}! 👋</div>
            <div className="db-greeting-sub">Here's your team and operations overview.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="db-status-pill"><div className="db-status-dot" /> All Systems Operational</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="db-kpi-grid">
          <KpiCard icon={Users}        iconClass="amber"  label="Team Members"   value={totalTeam}          trend="Active staff"   trendUp={true}  sub="All branches" />
          <KpiCard icon={ShoppingCart} iconClass="blue"   label="Open Orders"    value={openOrders}         trend="In progress"    trendUp={false} sub="Needs review" />
          <KpiCard icon={ListTodo}     iconClass="orange" label="Pending Tasks"  value={pendingTasks}       trend="Due this week"  trendUp={false} sub="Assign now" />
          <KpiCard icon={DollarSign}   iconClass="green"  label="Revenue"        value={fmtINR(totalRevenue)} trend="vs last month" trendUp={true} sub="Period total" />
        </div>

        {/* Quick Actions */}
        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={ShoppingCart} label="Orders"        colorClass="qa-blue"   onClick={() => navigate("/orders")} />
            <QaBtn icon={Box}          label="Inventory"     colorClass="qa-orange" onClick={() => navigate("/materials")} />
            <QaBtn icon={Users}        label="My Team"       colorClass="qa-purple" onClick={() => navigate("/employees")} />
            <QaBtn icon={FileText}     label="Reports"       colorClass="qa-amber"  onClick={() => navigate("/analytics")} />
            <QaBtn icon={Quote}        label="Quotations"    colorClass="qa-green"  onClick={() => navigate("/quotations")} />
            <QaBtn icon={ListTodo}     label="Tasks"         colorClass="qa-red"    onClick={() => navigate("/my-tasks")} />
            <QaBtn icon={Calendar}     label="Schedule"      colorClass="qa-teal"   onClick={() => navigate("/attendance")} />
            <QaBtn icon={Settings}     label="Settings"      colorClass="qa-cyan"   onClick={() => navigate("/settings")} />
          </div>
        </div>

        {/* Stats Mini */}
        <div className="db-stats-mini-grid">
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background:"#FFFBEB", color:"#B45309" }}><Users size={18}/></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{totalTeam}</div>
              <div className="db-stats-mini-label">Total Team</div>
              <span className="db-stats-mini-badge badge-green-sm">Active</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background:"#DBEAFE", color:"#1D4ED8" }}><ShoppingCart size={18}/></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{openOrders}</div>
              <div className="db-stats-mini-label">Open Orders</div>
              <span className="db-stats-mini-badge badge-blue-sm">In Progress</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background:"#FFEDD5", color:"#C2410C" }}><ListTodo size={18}/></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{pendingTasks}</div>
              <div className="db-stats-mini-label">Pending Tasks</div>
              <span className="db-stats-mini-badge badge-red-sm">Due Soon</span>
            </div>
          </div>
          <div className="db-stats-mini-card">
            <div className="db-stats-mini-icon" style={{ background:"#DCFCE7", color:"#15803D" }}><DollarSign size={18}/></div>
            <div className="db-stats-mini-body">
              <div className="db-stats-mini-val">{fmtINR(totalRevenue)}</div>
              <div className="db-stats-mini-label">Revenue</div>
              <span className="db-stats-mini-badge badge-green-sm">↑ On track</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="db-main-grid">

          {/* Left */}
          <div className="db-main-left">
            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Order Pipeline</div>
              </div>
              <div className="db-status-list">
                {[
                  ["Pending",    orders.filter(o => o.status==="Pending").length,    "status-warning"],
                  ["Processing", orders.filter(o => o.status==="Processing").length, "status-healthy"],
                  ["Shipped",    orders.filter(o => o.status==="Shipped").length,    "status-healthy"],
                  ["Delivered",  orders.filter(o => o.status==="Delivered").length,  "status-healthy"],
                  ["Cancelled",  orders.filter(o => o.status==="Cancelled").length,  "status-critical"],
                ].map(([n,v,cls],i) => (
                  <div key={i} className="db-status-row">
                    <span className="db-status-name">{n}</span>
                    <span className={`db-status-badge ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Pending Tasks</div>
              </div>
              <div className="db-status-list">
                {tasks.slice(0,5).map((t,i) => (
                  <div key={i} className="db-status-row">
                    <span className="db-status-name" style={{ fontSize:12 }}>{t.title}</span>
                    <span className={`db-status-badge ${t.priority==="High"?"status-critical":t.priority==="Medium"?"status-warning":"status-healthy"}`}>{t.priority||"Normal"}</span>
                  </div>
                ))}
                {tasks.length===0 && <div className="db-empty">No pending tasks 🎉</div>}
              </div>
            </div>
          </div>

          {/* Center */}
          <div className="db-main-center">
            <div className="db-chart-row">
              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">Revenue Trend</div>
                </div>
                <div className="db-card-body">
                  <div className="db-chart-wrap">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                          <defs>
                            <linearGradient id="mgrGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#D97706" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:10, fill:"#9CA3AF" }}/>
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize:10, fill:"#9CA3AF" }}/>
                          <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"1px solid #E5E7EB" }}/>
                          <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2} fill="url(#mgrGrad)" dot={false}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : <div className="db-empty">No revenue data</div>}
                  </div>
                </div>
              </div>

              <div className="db-card">
                <div className="db-card-header">
                  <div className="db-card-title">Task Progress</div>
                </div>
                <div className="db-card-body" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
                  <div className="db-donut-wrap" style={{ position:"relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value">
                          {donutData.map((_,i) => <Cell key={i} fill={["#D97706","#E5E7EB"][i%2]}/>)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
                      <div style={{ fontSize:20, fontWeight:800, color:"#111827" }}>{taskPct}%</div>
                      <div style={{ fontSize:10, color:"#6B7280" }}>Done</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:16, fontSize:12 }}>
                    <span style={{ color:"#D97706", fontWeight:600 }}>● Done {taskDoneCount}</span>
                    <span style={{ color:"#9CA3AF", fontWeight:600 }}>● Pending {pendingTasks}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Recent Activity</div>
                <span className="db-card-link" onClick={() => navigate("/settings/audit-logs")}>View All</span>
              </div>
              <div className="db-activity-list">
                {recentActivity.slice(0,5).map((a,i) => {
                  const lo = (a.text||"").toLowerCase();
                  let Icon = Activity, bg="#EFF6FF", col="#3B82F6";
                  if (lo.includes("created")) { Icon=Plus; bg="#DCFCE7"; col="#22C55E"; }
                  else if (lo.includes("delete")||lo.includes("warning")) { Icon=AlertTriangle; bg="#FEF9C3"; col="#D97706"; }
                  return <div key={i} className="db-activity-item">
                    <div className="db-activity-icon" style={{ background:bg, color:col }}><Icon size={14}/></div>
                    <div className="db-activity-body">
                      <div className="db-activity-title" style={{ textTransform:"capitalize" }}>{a.type||"Activity"}</div>
                      <div className="db-activity-desc">{a.text}</div>
                    </div>
                    <div className="db-activity-time">{fmtTime(a.time)}</div>
                  </div>;
                })}
                {recentActivity.length===0 && <div className="db-empty">No recent activity</div>}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="db-main-right">
            <div className="db-profile-card">
              <div className="db-profile-banner profile-banner-manager"/>
              <div className="db-profile-avatar profile-avatar-manager">{(user?.name||"M")[0].toUpperCase()}</div>
              <div className="db-profile-body">
                <div className="db-profile-name">{user?.name||"Manager"}</div>
                <div className="db-profile-role">Operations Manager</div>
                <span className="db-profile-badge profile-badge-manager">Team Lead</span>
                <div className="db-profile-info">
                  <div className="db-profile-info-row"><span className="db-profile-info-label">Manager ID</span><span className="db-profile-info-val">MGR-{String(user?.id||2001).padStart(4,"0")}</span></div>
                  <div className="db-profile-info-row"><span className="db-profile-info-label">Email</span><span className="db-profile-info-val" style={{ fontSize:11 }}>{user?.email||"—"}</span></div>
                  <div className="db-profile-info-row"><span className="db-profile-info-label">Team Size</span><span className="db-profile-info-val">{totalTeam} members</span></div>
                </div>
                <button className="db-profile-btn" onClick={() => navigate("/profile")}>View Profile <ArrowRight size={13}/></button>
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header">
                <div className="db-card-title">Notifications</div>
                <span className="db-card-link" onClick={() => navigate("/notifications")}>View All</span>
              </div>
              <div className="db-notif-list">
                {notifications.slice(0,5).map((n,i) => {
                  const colors=["#D97706","#22C55E","#6366F1","#EF4444","#3B82F6"];
                  return <div key={i} className="db-notif-item">
                    <div className="db-notif-dot" style={{ background:colors[i%colors.length] }}/>
                    <div className="db-notif-body">
                      <div className="db-notif-text">{n.text}</div>
                      <div className="db-notif-time">{fmtTime(n.time)}</div>
                    </div>
                  </div>;
                })}
                {notifications.length===0 && <div className="db-empty">No notifications</div>}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
              <div className="db-event-list">
                {upcomingEvents.length>0 ? upcomingEvents.map((ev,i)=>(
                  <div key={i} className="db-event-item">
                    <div className="db-event-date" style={{ background:ev.color }}><div className="db-event-day">{ev.day}</div><div className="db-event-mon">{ev.mon}</div></div>
                    <div className="db-event-body"><div className="db-event-title">{ev.title}</div><div className="db-event-sub">{ev.sub}</div></div>
                  </div>
                )):[["30","AUG","Team Review","Operations","#D97706"],["05","SEP","Inventory Check","Warehouse","#6366F1"]].map(([d,m,t,s,c],i)=>(
                  <div key={i} className="db-event-item">
                    <div className="db-event-date" style={{ background:c }}><div className="db-event-day">{d}</div><div className="db-event-mon">{m}</div></div>
                    <div className="db-event-body"><div className="db-event-title">{t}</div><div className="db-event-sub">{s}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="db-bottom-grid">
          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title" style={{ display:"flex", alignItems:"center", gap:6 }}>AI Insights</div></div>
            <div className="db-ai-insights">
              {aiLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  <div className="db-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '8px' }}></div><br />
                  Generating insights...
                </div>
              ) : displayInsights && displayInsights.length > 0 ? (
                displayInsights.map((text,i) => {
                  const colors=["#D97706","#6366F1","#22C55E","#EF4444","#3B82F6"];
                  return <div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;
                })
              ) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Order Status Breakdown</div></div>
            <div className="db-bar-list">
              {[["Completed",orders.filter(o=>o.status==="Delivered"||o.status==="Completed").length,"#22C55E"],
                ["In Progress",orders.filter(o=>o.status==="Processing"||o.status==="Shipped").length,"#3B82F6"],
                ["Pending",orders.filter(o=>o.status==="Pending").length,"#D97706"],
                ["Cancelled",orders.filter(o=>o.status==="Cancelled").length,"#EF4444"]].map(([label,val,color],i)=>{
                const max=Math.max(1,...orders.length>0?[orders.length]:1);
                return <div key={i} className="db-bar-item">
                  <div className="db-bar-label"><span>{label}</span><span style={{ fontWeight:600 }}>{val}</span></div>
                  <div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${Math.round((val/max)*100)}%`, background:color }}/></div>
                </div>;
              })}
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Department Workload</div></div>
            <div className="db-card-body" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:"Operations",value:40},{name:"Sales",value:25},{name:"HR",value:20},{name:"Finance",value:15}]} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                      {["#D97706","#3B82F6","#A855F7","#22C55E"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11, borderRadius:8 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Monthly Performance</div></div>
            <div className="db-profit-val">{taskPct}%</div>
            <div className="db-profit-sub">Task completion rate this month</div>
            <div style={{ padding:"0 20px 16px" }}>
              <div className="db-chart-wrap" style={{ height:100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i)=>({ m:i+1, v }))}>
                    <Line type="monotone" dataKey="v" stroke="#D97706" strokeWidth={2} dot={false}/>
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

export default ManagerDashboard;
