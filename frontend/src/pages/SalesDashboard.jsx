import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  DollarSign, ShoppingCart, Users, Target, TrendingUp, TrendingDown,
  FileText, PhoneCall, Clock, CheckCircle, ArrowRight, Activity,
  AlertTriangle, Plus, Star, Crosshair, BarChart2,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState } from "../components/DataStates";

const greeting=()=>{const h=new Date().getHours();if(h<12)return"Good Morning";if(h<18)return"Good Afternoon";return"Good Evening";};
const fmtINR=(v)=>{if(!v&&v!==0)return"₹0";const abs=Math.abs(v);if(abs>=100000)return`₹${(abs/100000).toFixed(2)}L`;if(abs>=1000)return`₹${(abs/1000).toFixed(1)}k`;return`₹${abs}`;};
const fmtTime=(iso)=>new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

const KpiCard=({icon:Icon,iconClass,label,value,trend,trendUp,sub})=>(
  <div className="db-kpi-card">
    <div className="db-kpi-top">
      <div className={`db-kpi-icon ${iconClass}`}><Icon size={22}/></div>
      {trend&&<span className={`db-kpi-trend ${trendUp?"up":"down"}`}>{trendUp?<TrendingUp size={11}/>:<TrendingDown size={11}/>} {trend}</span>}
    </div>
    <div><div className="db-kpi-value">{value}</div><div className="db-kpi-label">{label}</div></div>
    {sub&&<div className="db-kpi-sub">{sub}</div>}
  </div>
);
const QaBtn=({icon:Icon,label,colorClass,onClick})=>(
  <div className="db-qa-item" onClick={onClick}>
    <div className={`db-qa-icon ${colorClass}`}><Icon size={20}/></div>
    <span className="db-qa-label">{label}</span>
  </div>
);
const SPARK=[5,9,7,12,8,14,10,16,12,18,14,17];

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData]= useState(null);
  const [leads,         setLeads]         = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [customers,     setCustomers]     = useState([]);
  const [tasks,         setTasks]         = useState([]);
  const [upcomingEvents,setUpcomingEvents]= useState([]);
  const [loading,       setLoading]       = useState(true);
  const [now, setNow] = useState(new Date());

  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    Promise.all([
      API.get("/dashboard/stats").catch(()=>({data:{}})),
      API.get("/leads").catch(()=>({data:[]})),
      API.get("/orders").catch(()=>({data:[]})),
      API.get("/customers").catch(()=>({data:[]})),
      API.get("/tasks").catch(()=>({data:[]})),
    ]).then(([statsR,leadsR,ordR,custR,taskR])=>{
      setDashboardData(statsR.data||{});
      setLeads(leadsR.data||[]);
      setOrders(ordR.data||[]);
      setCustomers(custR.data||[]);
      const tl=taskR.data||[];
      setTasks(tl.filter(t=>t.status!=="Completed").slice(0,5));
      const n=new Date();
      setUpcomingEvents(
        tl.filter(t=>t.dueDate&&new Date(t.dueDate)>=n)
          .sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,4)
          .map((t,i)=>{ const d=new Date(t.dueDate); const colors=["#DC2626","#6366F1","#22C55E","#F97316"]; return{day:String(d.getDate()).padStart(2,"0"),mon:d.toLocaleString("default",{month:"short"}).toUpperCase(),title:t.title,sub:t.category||"Sales",color:colors[i%4]}; })
      );
    }).finally(()=>setLoading(false));
  },[]);

  if(loading) return <LoadingState message="Loading Sales Dashboard…" height="100vh"/>;

  const s=dashboardData?.stats||{};
  const totalRevenue  =s.revenue||0;
  const newLeads      =leads.filter(l=>l.status==="New"||!l.status).length;
  const closedDeals   =leads.filter(l=>l.status==="Closed"||l.status==="Won").length;
  const activeCustomers=customers.length||s.activeCustomers||0;
  const openOrders    =orders.filter(o=>!["Delivered","Completed","Cancelled"].includes(o.status)).length;
  const pendingOrders =s.pendingOrders||0;

  const trendRaw=dashboardData?.analytics?.trendData||dashboardData?.charts?.monthlyStats||[];
  const chartData=trendRaw.map(d=>({name:d.name,revenue:d.revenue||0,sales:d.revenue||0}));
  const pipelineData=[{name:"Prospects",value:leads.filter(l=>l.status==="Prospect").length||25},{name:"Qualified",value:leads.filter(l=>l.status==="Qualified").length||15},{name:"Proposal",value:leads.filter(l=>l.status==="Proposal").length||10},{name:"Closed",value:closedDeals||8}];
  const recentActivity=dashboardData?.tables?.recentActivity||[];
  const notifications =dashboardData?.tables?.notifications||[];

  const fallbackAiInsights=[
    newLeads>0      && `${newLeads} new lead${newLeads!==1?"s":""} in the pipeline. Follow up soon.`,
    closedDeals>0   && `${closedDeals} deal${closedDeals!==1?"s":""} closed — great work!`,
    openOrders>0    && `${openOrders} active order${openOrders!==1?"s":""} in progress.`,
    `Focus on following up with "In Progress" leads to boost conversion.`,
  ].filter(Boolean).slice(0,5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  return (
    <div className="db-page">
      <div className="db-content">

        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">{greeting()}, {user?.name?.split(" ")[0]||"Sales Rep"}! 👋</div>
            <div className="db-greeting-sub">Here's your sales pipeline and revenue overview.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="db-status-pill"><div className="db-status-dot"/>Market Active</div>
          </div>
        </div>

        <div className="db-kpi-grid">
          <KpiCard icon={DollarSign}   iconClass="rose"   label="Total Revenue"    value={fmtINR(totalRevenue)} trend="vs last month" trendUp={true}  sub="Period total" />
          <KpiCard icon={Crosshair}    iconClass="blue"   label="New Leads"        value={newLeads}             trend="This month"    trendUp={true}  sub="In pipeline" />
          <KpiCard icon={CheckCircle}  iconClass="green"  label="Closed Deals"     value={closedDeals}          trend="Won"           trendUp={true}  sub="This period" />
          <KpiCard icon={Users}        iconClass="orange" label="Active Customers"  value={activeCustomers}      trend="vs last month" trendUp={true}  sub="Total customers" />
        </div>

        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={Plus}         label="New Order"    colorClass="qa-red"    onClick={()=>navigate("/orders/new")}/>
            <QaBtn icon={Crosshair}    label="Leads"        colorClass="qa-blue"   onClick={()=>navigate("/crm/leads")}/>
            <QaBtn icon={FileText}     label="Quotations"   colorClass="qa-purple" onClick={()=>navigate("/quotations")}/>
            <QaBtn icon={Users}        label="Customers"    colorClass="qa-green"  onClick={()=>navigate("/customers")}/>
            <QaBtn icon={BarChart2}    label="Reports"      colorClass="qa-amber"  onClick={()=>navigate("/analytics")}/>
            <QaBtn icon={Target}       label="Pipeline"     colorClass="qa-orange" onClick={()=>navigate("/crm/pipeline")}/>
            <QaBtn icon={PhoneCall}    label="Follow-ups"   colorClass="qa-teal"   onClick={()=>navigate("/crm/activities")}/>
            <QaBtn icon={ShoppingCart} label="Orders"       colorClass="qa-cyan"   onClick={()=>navigate("/orders")}/>
          </div>
        </div>

        <div className="db-stats-mini-grid">
          {[
            [DollarSign,"#FEF2F2","#991B1B","Total Revenue",  fmtINR(totalRevenue),"badge-green-sm","↑ Growing"],
            [Crosshair, "#DBEAFE","#1D4ED8","New Leads",      newLeads,            "badge-blue-sm","In Pipeline"],
            [CheckCircle,"#DCFCE7","#15803D","Deals Closed",  closedDeals,         "badge-green-sm","Won"],
            [ShoppingCart,"#FFEDD5","#C2410C","Active Orders",openOrders,          "badge-orange-sm","In Progress"],
          ].map(([Icon,bg,col,label,val,badge,badgeText],i)=>(
            <div key={i} className="db-stats-mini-card">
              <div className="db-stats-mini-icon" style={{ background:bg,color:col }}><Icon size={18}/></div>
              <div className="db-stats-mini-body"><div className="db-stats-mini-val">{val}</div><div className="db-stats-mini-label">{label}</div><span className={`db-stats-mini-badge ${badge}`}>{badgeText}</span></div>
            </div>
          ))}
        </div>

        {/* ── Bento Grid ── */}
        <div className="db-bento">
          {/* Row 1 */}
          <div className="db-card db-col-3">
            <div className="db-profile-banner profile-banner-sales"/>
            <div className="db-profile-avatar profile-avatar-sales">{(user?.name||"S")[0].toUpperCase()}</div>
            <div className="db-profile-body">
              <div className="db-profile-name">{user?.name||"Sales Rep"}</div>
              <div className="db-profile-role">Sales Executive</div>
              <span className="db-profile-badge profile-badge-sales">Sales Access</span>
              <div className="db-profile-info">
                <div className="db-profile-info-row"><span className="db-profile-info-label">Sales ID</span><span className="db-profile-info-val">SLS-{String(user?.id||5001).padStart(4,"0")}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Email</span><span className="db-profile-info-val" style={{ fontSize:11 }}>{user?.email||"—"}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Revenue</span><span className="db-profile-info-val">{fmtINR(totalRevenue)}</span></div>
              </div>
              <button className="db-profile-btn" onClick={()=>navigate("/profile")}>View Profile <ArrowRight size={13}/></button>
            </div>
          </div>

          <div className="db-card db-col-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(220, 38, 38, 0.15)", position: "relative", overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}>
            <div className="db-card-header" style={{ borderBottom: "none", padding: "24px 24px 0 24px", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <div className="db-card-title" style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingUp size={16} color="#dc2626" />
                  Sales Trend
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                  {fmtINR(totalRevenue)}
                  <span style={{ fontSize: 13, padding: "3px 10px", background: "#fef2f2", color: "#b91c1c", borderRadius: "12px", fontWeight: 700 }}>
                    ↑ +8.4%
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: "220px", marginTop: "20px", padding: "0 20px 10px 0" }}>
              {chartData.length>0?(
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} dx={-10}/>
                    <Tooltip cursor={{ stroke: '#fca5a5', strokeWidth: 2, strokeDasharray: '4 4' }} contentStyle={{fontSize:12,borderRadius:8,border:"none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)"}}/>
                    <Area type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={4} fill="url(#salesGrad)" activeDot={{ r: 6, fill: "#fff", stroke: "#dc2626", strokeWidth: 3 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              ):<div className="db-empty" style={{ paddingTop: "80px" }}>No sales data</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Deal Pipeline</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" stroke="none" cornerRadius={6}>
                      {["#DC2626","#F97316","#EAB308","#22C55E"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize:26,fontWeight:800,color:"#111827", lineHeight: 1 }}>{leads.length}</div>
                  <div style={{ fontSize:12,color:"#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Leads</div>
                </div>
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center", fontSize: 11, marginTop: 8 }}>
                {[["Prospects","#DC2626"],["Qualified","#F97316"],["Proposal","#EAB308"],["Closed","#22C55E"]].map(([l,c],i)=>(
                  <span key={i} style={{ color:"#64748b", fontWeight: 600 }}><span style={{ color:c,fontWeight:800 }}>●</span> {l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Lead Pipeline</div></div>
            <div className="db-status-list">
              {[["New",leads.filter(l=>l.status==="New"||!l.status).length,"status-healthy"],["Qualified",leads.filter(l=>l.status==="Qualified").length,"status-healthy"],["Proposal",leads.filter(l=>l.status==="Proposal").length,"status-warning"],["Negotiation",leads.filter(l=>l.status==="Negotiation").length,"status-warning"],["Closed Won",closedDeals,"status-healthy"],["Lost",leads.filter(l=>l.status==="Lost").length,"status-critical"]].map(([n,v,cls],i)=>(
                <div key={i} className="db-status-row"><span className="db-status-name">{n}</span><span className={`db-status-badge ${cls}`}>{v}</span></div>
              ))}
            </div>
          </div>

          <div className="db-card db-col-6">
            <div className="db-card-header"><div className="db-card-title">Recent Activity</div><span className="db-card-link" onClick={()=>navigate("/settings/audit-logs")}>View All</span></div>
            <div className="db-activity-list">
              {recentActivity.slice(0,5).map((a,i)=>{
                const lo=(a.text||"").toLowerCase();
                let Icon=Activity,bg="#FEF2F2",col="#DC2626";
                if(lo.includes("order")){Icon=ShoppingCart;bg="#DCFCE7";col="#22C55E";}
                else if(lo.includes("customer")){Icon=Users;bg="#DBEAFE";col="#3B82F6";}
                return <div key={i} className="db-activity-item"><div className="db-activity-icon" style={{ background:bg,color:col }}><Icon size={14}/></div><div className="db-activity-body"><div className="db-activity-title" style={{ textTransform:"capitalize" }}>{a.type||"Activity"}</div><div className="db-activity-desc">{a.text}</div></div><div className="db-activity-time">{fmtTime(a.time)}</div></div>;
              })}
              {recentActivity.length===0&&<div className="db-empty">No recent activity</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Notifications</div><span className="db-card-link" onClick={()=>navigate("/notifications")}>View All</span></div>
            <div className="db-notif-list">
              {notifications.slice(0,5).map((n,i)=>{const colors=["#DC2626","#22C55E","#6366F1","#F97316","#EAB308"];return<div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:colors[i%colors.length] }}/><div className="db-notif-body"><div className="db-notif-text">{n.text}</div><div className="db-notif-time">{fmtTime(n.time)}</div></div></div>;}) }
              {notifications.length===0&&[["New lead assigned to you","#DC2626"],["Order #1234 confirmed","#22C55E"],["Follow-up reminder: Client A","#F97316"],["Quote accepted by Customer B","#6366F1"]].map(([t,c],i)=>(
                <div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:c }}/><div className="db-notif-body"><div className="db-notif-text">{t}</div><div className="db-notif-time">09:{String(30+i*5).padStart(2,"0")} AM</div></div></div>
              ))}
            </div>
          </div>

          {/* Row 3 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Pending Tasks</div></div>
            <div className="db-status-list">
              {tasks.map((t,i)=><div key={i} className="db-status-row"><span className="db-status-name" style={{ fontSize:12 }}>{t.title}</span><span className={`db-status-badge ${t.priority==="High"?"status-critical":"status-warning"}`}>{t.priority||"Normal"}</span></div>)}
              {tasks.length===0&&<div className="db-empty">No pending tasks 🎉</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
            <div className="db-event-list">
              <br/>
              {upcomingEvents.length>0?upcomingEvents.map((ev,i)=>(
                <div key={i} className="db-event-item"><div className="db-event-date" style={{ background:ev.color }}><div className="db-event-day">{ev.day}</div><div className="db-event-mon">{ev.mon}</div></div><div className="db-event-body"><div className="db-event-title">{ev.title}</div><div className="db-event-sub">{ev.sub}</div></div></div>
              )):[["02","SEP","Sales Call","Client A","#DC2626"],["08","SEP","Product Demo","Client B","#6366F1"],["15","SEP","Quarter Review","Management","#22C55E"]].map(([d,m,t,s,c],i)=>(
                <div key={i} className="db-event-item"><div className="db-event-date" style={{ background:c }}><div className="db-event-day">{d}</div><div className="db-event-mon">{m}</div></div><div className="db-event-body"><div className="db-event-title">{t}</div><div className="db-event-sub">{s}</div></div></div>
              ))}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">AI Sales Insights</div></div>
            <div className="db-ai-insights">
              <br/>
              {aiLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  <div className="db-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '8px' }}></div><br />
                  Generating insights...
                </div>
              ) : displayInsights && displayInsights.length > 0 ? (
                displayInsights.map((text,i)=>{const colors=["#DC2626","#22C55E","#6366F1","#F97316","#EAB308"];return<div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;})
              ) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Top Customers</div></div>
            <div className="db-bar-list">
              <br/>
              {customers.slice(0,5).map((c,i)=>{const colors=["#DC2626","#F97316","#6366F1","#22C55E","#EAB308"];return<div key={i} className="db-bar-item"><div className="db-bar-label"><span>{c.name||c.companyName||`Customer ${i+1}`}</span><span style={{ fontWeight:600 }}>{c.totalOrders||i+1} orders</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${80-i*15}%`,background:colors[i] }}/></div></div>;})} {customers.length===0&&[["ABC Corp","#DC2626"],["XYZ Ltd","#F97316"],["PQR Inc","#6366F1"],["MNO Co","#22C55E"],["RST Pvt","#EAB308"]].map(([n,c],i)=><div key={i} className="db-bar-item"><div className="db-bar-label"><span>{n}</span><span style={{ fontWeight:600 }}>{5-i} orders</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${80-i*15}%`,background:c }}/></div></div>)}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Revenue by Segment</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:"Enterprise",value:45},{name:"SMB",value:30},{name:"Retail",value:15},{name:"Other",value:10}]} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" stroke="none" cornerRadius={6}>
                      {["#DC2626","#F97316","#EAB308","#9CA3AF"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Monthly Revenue</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-card-body" style={{ padding: 0 }}>
              <div className="db-profit-val">{fmtINR(totalRevenue)}</div>
              <div className="db-profit-sub">↑ 18.4% vs last month</div>
              <div style={{ width: "100%", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i)=>({m:i+1,v}))}>
                    <Line type="monotone" dataKey="v" stroke="#DC2626" strokeWidth={3} dot={false}/>
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

export default SalesDashboard;
