import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  Users, DollarSign, Calendar, UserCheck, AlertTriangle, Activity,
  FileText, Plus, Settings, TrendingUp, TrendingDown, ArrowRight,
  Briefcase, Bell, Clock, Star, Moon,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState } from "../components/DataStates";

const greeting = () => { const h=new Date().getHours(); if(h<12)return"Good Morning"; if(h<18)return"Good Afternoon"; return"Good Evening"; };
const fmtINR = (v) => { if(!v&&v!==0)return"₹0"; const abs=Math.abs(v); if(abs>=100000)return`₹${(abs/100000).toFixed(2)}L`; if(abs>=1000)return`₹${(abs/1000).toFixed(1)}k`; return`₹${abs}`; };
const fmtTime = (iso) => new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

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
const SPARK=[4,7,5,9,6,11,8,13,10,15,12,14];

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: dashboardData, loading } = useDashboardData();
  const [employees,     setEmployees]     = useState([]);
  const [leavesData,    setLeavesData]    = useState([]);
  const [salariesData,  setSalariesData]  = useState([]);
  const [upcomingEvents,setUpcomingEvents]= useState([]);
  const [now, setNow] = useState(new Date());

  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    Promise.all([
      API.get("/employees").catch(()=>({data:[]})),
      API.get("/leaves").catch(()=>({data:[]})),
      API.get("/payroll").catch(()=>({data:[]})),
      API.get("/tasks").catch(()=>({data:[]})),
    ]).then(([empR,lvR,payR,taskR])=>{
      setEmployees(empR.data||[]);
      setLeavesData(lvR.data||[]);
      setSalariesData(payR.data||[]);
      const now=new Date();
      setUpcomingEvents(
        (taskR.data||[]).filter(t=>t.dueDate&&new Date(t.dueDate)>=now)
          .sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,4)
          .map((t,i)=>{ const d=new Date(t.dueDate); const colors=["#7C3AED","#22C55E","#F97316","#3B82F6"]; return{day:String(d.getDate()).padStart(2,"0"),mon:d.toLocaleString("default",{month:"short"}).toUpperCase(),title:t.title,sub:t.category||"HR",color:colors[i%4]}; })
      );
    });
  },[]);

  if(loading) return <LoadingState message="Loading HR Dashboard…" height="100vh"/>;

  const s=dashboardData?.stats||{};
  const totalEmp     = employees.length||s.totalEmployees||0;
  const presentToday = dashboardData?.hrStats?.presentToday||0;
  const pendingLeaves= leavesData.filter(l=>l.status==="Pending").length;
  const monthlyPayroll= salariesData.reduce((sum,p)=>sum+(p.netSalary||p.basicSalary||0),0);
  const empDist      = dashboardData?.hrStats?.employeeDistribution||[];
  const trendRaw     = dashboardData?.analytics?.trendData||dashboardData?.charts?.monthlyStats||[];
  const chartData    = trendRaw.map(d=>({name:d.name,employees:d.employees||Math.round((Math.random()*10+totalEmp*0.9))}));
  const attendancePct= totalEmp>0?Math.round((presentToday/totalEmp)*100):0;
  const donutData    = [{name:"Present",value:presentToday},{name:"Absent",value:Math.max(0,totalEmp-presentToday)}];
  const recentActivity=dashboardData?.tables?.recentActivity||[];
  const notifications  =dashboardData?.tables?.notifications||[];

  const fallbackAiInsights=[
    totalEmp>0         && `Workforce at ${totalEmp} employees — ${attendancePct}% attendance today.`,
    pendingLeaves>0    && `${pendingLeaves} leave request${pendingLeaves>1?"s are":" is"} pending approval.`,
    monthlyPayroll>0   && `Monthly payroll estimated at ${fmtINR(monthlyPayroll)}.`,
    employees.filter(e=>e.status==="Inactive").length>0 && `${employees.filter(e=>e.status==="Inactive").length} inactive employee records need review.`,
    `Review upcoming performance appraisals for Q3.`,
  ].filter(Boolean).slice(0,5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  return (
    <div className="db-page">
      <div className="db-content">

        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">{greeting()}, {user?.name?.split(" ")[0]||"HR Manager"}! 👋</div>
            <div className="db-greeting-sub">Here's your people & HR operations overview.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="db-status-pill"><div className="db-status-dot"/>All Systems Operational</div>
          </div>
        </div>

        <div className="db-kpi-grid">
          <KpiCard icon={Users}       iconClass="purple" label="Total Employees"  value={totalEmp}            trend="vs last month" trendUp={true}  sub="All departments" />
          <KpiCard icon={UserCheck}   iconClass="green"  label="Present Today"    value={presentToday}        trend={`${attendancePct}%`} trendUp={true} sub="Attendance rate" />
          <KpiCard icon={Calendar}    iconClass="orange" label="Pending Leaves"   value={pendingLeaves}       trend="Needs review"  trendUp={false} sub="Awaiting approval" />
          <KpiCard icon={DollarSign}  iconClass="blue"   label="Monthly Payroll"  value={fmtINR(monthlyPayroll)} trend="Processed" trendUp={true} sub="This month" />
        </div>

        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={UserCheck}   label="Attendance"   colorClass="qa-red"    onClick={()=>navigate("/hr/attendance")}/>
            <QaBtn icon={DollarSign}  label="Payroll"      colorClass="qa-purple" onClick={()=>navigate("/hr/payroll")}/>
            <QaBtn icon={Calendar}    label="Leave Mgmt"   colorClass="qa-green"  onClick={()=>navigate("/hr/leave")}/>
            <QaBtn icon={Briefcase}   label="Recruitment"  colorClass="qa-blue"   onClick={()=>navigate("/hr/employees")}/>
            <QaBtn icon={FileText}    label="HR Reports"   colorClass="qa-amber"  onClick={()=>navigate("/analytics")}/>
            <QaBtn icon={Users}       label="Employees"    colorClass="qa-teal"   onClick={()=>navigate("/hr/employees")}/>
            <QaBtn icon={Star}        label="Performance"  colorClass="qa-orange" onClick={()=>navigate("/hr/employees")}/>
            <QaBtn icon={Settings}    label="Settings"     colorClass="qa-cyan"   onClick={()=>navigate("/settings")}/>
          </div>
        </div>

        <div className="db-stats-mini-grid">
          {[
            [Users,   "#F5F3FF","#7C3AED","Total Employees",  totalEmp,           "badge-blue-sm","All Depts"],
            [UserCheck,"#DCFCE7","#15803D","Present Today",   presentToday,       "badge-green-sm",`${attendancePct}%`],
            [Calendar, "#FEF9C3","#92400E","Pending Leaves",  pendingLeaves,      "badge-orange-sm","Needs Approval"],
            [DollarSign,"#DBEAFE","#1D4ED8","Monthly Payroll",fmtINR(monthlyPayroll),"badge-blue-sm","This Month"],
          ].map(([Icon,bg,col,label,val,badge,badgeText],i)=>(
            <div key={i} className="db-stats-mini-card">
              <div className="db-stats-mini-icon" style={{ background:bg, color:col }}><Icon size={18}/></div>
              <div className="db-stats-mini-body">
                <div className="db-stats-mini-val">{val}</div>
                <div className="db-stats-mini-label">{label}</div>
                <span className={`db-stats-mini-badge ${badge}`}>{badgeText}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Bento Grid ── */}
        <div className="db-bento">
          {/* Row 1 */}
          <div className="db-card db-col-3">
            <div className="db-profile-banner profile-banner-hr"/>

            <div className="db-profile-body">
              <div className="db-profile-name">{user?.name||"HR Manager"}</div>
              <div className="db-profile-role">Human Resources</div>
              <span className="db-profile-badge profile-badge-hr">HR Access</span>
              <div className="db-profile-info">
                <div className="db-profile-info-row"><span className="db-profile-info-label">HR ID</span><span className="db-profile-info-val">HR-{String(user?.id||3001).padStart(4,"0")}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Email</span><span className="db-profile-info-val" style={{ fontSize:11 }}>{user?.email||"—"}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Team Count</span><span className="db-profile-info-val">{totalEmp} employees</span></div>
              </div>
              <button className="db-profile-btn" onClick={()=>navigate("/profile")}>View Profile <ArrowRight size={13}/></button>
            </div>
          </div>

          <div className="db-card db-col-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(124, 58, 237, 0.15)", position: "relative", overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}>
            <div className="db-card-header" style={{ borderBottom: "none", padding: "24px 24px 0 24px", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <div className="db-card-title" style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <Activity size={16} color="#7c3aed" />
                  Attendance Trend
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                  {attendancePct}%
                  <span style={{ fontSize: 13, padding: "3px 10px", background: "#ecfdf5", color: "#10b981", borderRadius: "12px", fontWeight: 700 }}>
                    Excellent
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ flex: 1, minHeight: "220px", marginTop: "20px", padding: "0 20px 10px 0" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARK.map((v,i)=>({name:`W${i+1}`,pct:Math.min(100,v*7)}))} margin={{top:4,right:4,left:0,bottom:0}}>
                  <defs><linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0.05}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} width={40}/>
                  <Tooltip cursor={{ stroke: '#c4b5fd', strokeWidth: 2, strokeDasharray: '4 4' }} contentStyle={{fontSize:12,borderRadius:8,border:"none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)"}}/>
                  <Area type="monotone" dataKey="pct" stroke="#7C3AED" strokeWidth={4} fill="url(#hrGrad)" activeDot={{ r: 6, fill: "#fff", stroke: "#7c3aed", strokeWidth: 3 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Attendance Split</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" startAngle={90} endAngle={-270} stroke="none" cornerRadius={6}>
                      {["#7C3AED","#E5E7EB"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize:26,fontWeight:900,color:"#1e293b", lineHeight: 1 }}>{attendancePct}%</div>
                  <div style={{ fontSize:12,color:"#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Present</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:24,fontSize:13, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7c3aed" }} />
                  <span style={{ color:"#64748b",fontWeight:600 }}>Present <span style={{ color: "#0f172a", fontWeight: 800, marginLeft: 2 }}>{presentToday}</span></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e5e7eb" }} />
                  <span style={{ color:"#64748b",fontWeight:600 }}>Absent <span style={{ color: "#0f172a", fontWeight: 800, marginLeft: 2 }}>{Math.max(0,totalEmp-presentToday)}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Department Status</div></div>
            <div className="db-status-list">
              {empDist.length>0 ? empDist.slice(0,6).map((d,i)=>(
                <div key={i} className="db-status-row">
                  <span className="db-status-name">{d.name}</span>
                  <span className="db-status-badge status-healthy">{d.value} staff</span>
                </div>
              )) : <div className="db-empty">No department data</div>}
            </div>
          </div>

          <div className="db-card db-col-6">
            <div className="db-card-header"><div className="db-card-title">Recent HR Activity</div><span className="db-card-link" onClick={()=>navigate("/settings/audit-logs")}>View All</span></div>
            <div className="db-activity-list">
              {recentActivity.slice(0,5).map((a,i)=>{
                const lo=(a.text||"").toLowerCase();
                let Icon=Activity,bg="#F5F3FF",col="#7C3AED";
                if(lo.includes("leave"))      {Icon=Calendar;bg="#FEF9C3";col="#D97706";}
                else if(lo.includes("hire")||lo.includes("employee")){Icon=Users;bg="#DCFCE7";col="#22C55E";}
                else if(lo.includes("payroll")){Icon=DollarSign;bg="#DBEAFE";col="#3B82F6";}
                return <div key={i} className="db-activity-item">
                  <div className="db-activity-icon" style={{ background:bg,color:col }}><Icon size={14}/></div>
                  <div className="db-activity-body"><div className="db-activity-title" style={{ textTransform:"capitalize" }}>{a.type||"HR Activity"}</div><div className="db-activity-desc">{a.text}</div></div>
                  <div className="db-activity-time">{fmtTime(a.time)}</div>
                </div>;
              })}
              {recentActivity.length===0&&<div className="db-empty">No recent activity</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Notifications</div><span className="db-card-link" onClick={()=>navigate("/notifications")}>View All</span></div>
            <div className="db-notif-list">
              {notifications.slice(0,5).map((n,i)=>{
                const colors=["#7C3AED","#22C55E","#F97316","#3B82F6","#EAB308"];
                return <div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:colors[i%colors.length] }}/><div className="db-notif-body"><div className="db-notif-text">{n.text}</div><div className="db-notif-time">{fmtTime(n.time)}</div></div></div>;
              })}
              {notifications.length===0&&<div className="db-empty">No new notifications</div>}
            </div>
          </div>

          {/* Row 3 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Leave Requests</div></div>
            <div className="db-status-list">
              {leavesData.filter(l=>l.status==="Pending").slice(0,5).map((l,i)=>(
                <div key={i} className="db-status-row">
                  <span className="db-status-name" style={{ fontSize:12 }}>{l.employeeName||l.employee?.name||"Employee"}</span>
                  <span className="db-status-badge status-warning">Pending</span>
                </div>
              ))}
              {leavesData.filter(l=>l.status==="Pending").length===0&&<div className="db-empty">No pending requests 🎉</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
            <div className="db-event-list">
              <br/>
              {upcomingEvents.length>0?upcomingEvents.map((ev,i)=>(
                <div key={i} className="db-event-item">
                  <div className="db-event-date" style={{ background:ev.color }}><div className="db-event-day">{ev.day}</div><div className="db-event-mon">{ev.mon}</div></div>
                  <div className="db-event-body"><div className="db-event-title">{ev.title}</div><div className="db-event-sub">{ev.sub}</div></div>
                </div>
              )) : <div className="db-empty">No upcoming events</div>}
            </div>
          </div>


          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">AI HR Insights</div></div>
            <div className="db-ai-insights">
              <br/>
              {aiLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  <div className="db-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '8px' }}></div><br />
                  Generating insights...
                </div>
              ) : displayInsights && displayInsights.length > 0 ? (
                displayInsights.map((text,i)=>{const colors=["#7C3AED","#22C55E","#F97316","#3B82F6","#EAB308"];return <div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;})
              ) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Department Headcount</div></div>
            <div className="db-bar-list">
              <br/>
              {empDist.length>0?empDist.map((d,i)=>{
                const colors=["#7C3AED","#3B82F6","#22C55E","#F97316","#EF4444"];
                const max=Math.max(1,...empDist.map(x=>x.value));
                return <div key={i} className="db-bar-item"><div className="db-bar-label"><span>{d.name}</span><span style={{ fontWeight:600 }}>{d.value}</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${Math.round((d.value/max)*100)}%`,background:colors[i%colors.length] }}/></div></div>;
              }) : <div className="db-empty">No headcount data</div>}
            </div>
          </div>
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Leave Type Breakdown</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[]} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" stroke="none" cornerRadius={6}>
                      {["#7C3AED","#22C55E","#F97316","#9CA3AF"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Monthly Payroll</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-card-body" style={{ padding: 0 }}>
              <div className="db-profit-val">{fmtINR(monthlyPayroll)}</div>
              <div className="db-profit-sub">Total payroll this month</div>
              <div style={{ width: "100%", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[]}>
                    <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={3} dot={false}/>
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

export default HRDashboard;
