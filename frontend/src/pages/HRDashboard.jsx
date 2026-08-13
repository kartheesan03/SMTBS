import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
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

  const aiInsights=[
    totalEmp>0         && `Workforce at ${totalEmp} employees — ${attendancePct}% attendance today.`,
    pendingLeaves>0    && `${pendingLeaves} leave request${pendingLeaves>1?"s are":" is"} pending approval.`,
    monthlyPayroll>0   && `Monthly payroll estimated at ${fmtINR(monthlyPayroll)}.`,
    employees.filter(e=>e.status==="Inactive").length>0 && `${employees.filter(e=>e.status==="Inactive").length} inactive employee records need review.`,
    `Recruitment pipeline — track open positions and new hires.`,
  ].filter(Boolean).slice(0,5);

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
            <QaBtn icon={UserCheck}   label="Attendance"   colorClass="qa-red"    onClick={()=>navigate("/attendance")}/>
            <QaBtn icon={DollarSign}  label="Payroll"      colorClass="qa-purple" onClick={()=>navigate("/payroll")}/>
            <QaBtn icon={Calendar}    label="Leave Mgmt"   colorClass="qa-green"  onClick={()=>navigate("/leave-management")}/>
            <QaBtn icon={Briefcase}   label="Recruitment"  colorClass="qa-blue"   onClick={()=>navigate("/recruitment")}/>
            <QaBtn icon={FileText}    label="HR Reports"   colorClass="qa-amber"  onClick={()=>navigate("/hr-reports")}/>
            <QaBtn icon={Users}       label="Employees"    colorClass="qa-teal"   onClick={()=>navigate("/employees")}/>
            <QaBtn icon={Star}        label="Performance"  colorClass="qa-orange" onClick={()=>navigate("/team-performance")}/>
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

        <div className="db-main-grid">
          <div className="db-main-left">
            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Department Status</div></div>
              <div className="db-status-list">
                {empDist.length>0 ? empDist.slice(0,6).map((d,i)=>(
                  <div key={i} className="db-status-row">
                    <span className="db-status-name">{d.name}</span>
                    <span className="db-status-badge status-healthy">{d.value} staff</span>
                  </div>
                )):[
                  ["Engineering","status-healthy"],["HR","status-healthy"],["Sales","status-healthy"],["Finance","status-healthy"],["Operations","status-warning"],
                ].map(([n,cls],i)=>(
                  <div key={i} className="db-status-row">
                    <span className="db-status-name">{n}</span>
                    <span className={`db-status-badge ${cls}`}>Active</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Leave Requests</div></div>
              <div className="db-status-list">
                {leavesData.filter(l=>l.status==="Pending").slice(0,5).map((l,i)=>(
                  <div key={i} className="db-status-row">
                    <span className="db-status-name" style={{ fontSize:12 }}>{l.employeeName||l.employee?.name||"Employee"}</span>
                    <span className="db-status-badge status-warning">Pending</span>
                  </div>
                ))}
                {leavesData.filter(l=>l.status==="Pending").length===0&&<div className="db-empty">No pending requests</div>}
              </div>
            </div>
          </div>

          <div className="db-main-center">
            <div className="db-chart-row">
              <div className="db-card">
                <div className="db-card-header"><div className="db-card-title">Attendance Trend</div></div>
                <div className="db-card-body">
                  <div className="db-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SPARK.map((v,i)=>({name:`W${i+1}`,pct:Math.min(100,v*7)}))} margin={{top:4,right:4,left:-20,bottom:0}}>
                        <defs><linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2}/><stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9CA3AF"}}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9CA3AF"}}/>
                        <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid #E5E7EB"}}/>
                        <Area type="monotone" dataKey="pct" stroke="#7C3AED" strokeWidth={2} fill="url(#hrGrad)" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="db-card">
                <div className="db-card-header"><div className="db-card-title">Attendance Split</div></div>
                <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
                  <div className="db-donut-wrap" style={{ position:"relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} dataKey="value">
                          {["#7C3AED","#E5E7EB"].map((c,i)=><Cell key={i} fill={c}/>)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center" }}>
                      <div style={{ fontSize:20,fontWeight:800,color:"#111827" }}>{attendancePct}%</div>
                      <div style={{ fontSize:10,color:"#6B7280" }}>Present</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:16,fontSize:12 }}>
                    <span style={{ color:"#7C3AED",fontWeight:600 }}>● Present {presentToday}</span>
                    <span style={{ color:"#9CA3AF",fontWeight:600 }}>● Absent {Math.max(0,totalEmp-presentToday)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="db-card">
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
          </div>

          <div className="db-main-right">
            <div className="db-profile-card">
              <div className="db-profile-banner profile-banner-hr"/>
              <div className="db-profile-avatar profile-avatar-hr">{(user?.name||"H")[0].toUpperCase()}</div>
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

            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Notifications</div><span className="db-card-link" onClick={()=>navigate("/notifications")}>View All</span></div>
              <div className="db-notif-list">
                {notifications.slice(0,5).map((n,i)=>{
                  const colors=["#7C3AED","#22C55E","#F97316","#3B82F6","#EAB308"];
                  return <div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:colors[i%colors.length] }}/><div className="db-notif-body"><div className="db-notif-text">{n.text}</div><div className="db-notif-time">{fmtTime(n.time)}</div></div></div>;
                })}
                {notifications.length===0&&[["New hire onboarding pending","#22C55E"],["Leave request submitted","#7C3AED"],["Payroll deadline this week","#F97316"],["Training scheduled for team","#3B82F6"]].map(([t,c],i)=>(
                  <div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:c }}/><div className="db-notif-body"><div className="db-notif-text">{t}</div><div className="db-notif-time">09:{String(30+i*5).padStart(2,"0")} AM</div></div></div>
                ))}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
              <div className="db-event-list">
                {upcomingEvents.length>0?upcomingEvents.map((ev,i)=>(
                  <div key={i} className="db-event-item">
                    <div className="db-event-date" style={{ background:ev.color }}><div className="db-event-day">{ev.day}</div><div className="db-event-mon">{ev.mon}</div></div>
                    <div className="db-event-body"><div className="db-event-title">{ev.title}</div><div className="db-event-sub">{ev.sub}</div></div>
                  </div>
                )):[["01","SEP","Payroll Processing","Finance","#7C3AED"],["10","SEP","Team Training","HR","#22C55E"],["20","SEP","Performance Review","Management","#F97316"]].map(([d,m,t,s,c],i)=>(
                  <div key={i} className="db-event-item">
                    <div className="db-event-date" style={{ background:c }}><div className="db-event-day">{d}</div><div className="db-event-mon">{m}</div></div>
                    <div className="db-event-body"><div className="db-event-title">{t}</div><div className="db-event-sub">{s}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="db-bottom-grid">
          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">AI HR Insights</div></div>
            <div className="db-ai-insights">{aiInsights.map((text,i)=>{const colors=["#7C3AED","#22C55E","#F97316","#3B82F6","#EAB308"];return <div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;})}</div>
          </div>
          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Department Headcount</div></div>
            <div className="db-bar-list">
              {(empDist.length>0?empDist:[{name:"Engineering",value:40},{name:"Sales",value:30},{name:"HR",value:15},{name:"Finance",value:10},{name:"Operations",value:5}]).map((d,i)=>{
                const colors=["#7C3AED","#3B82F6","#22C55E","#F97316","#EF4444"];
                const max=Math.max(1,...(empDist.length>0?empDist:[{value:40}]).map(x=>x.value));
                return <div key={i} className="db-bar-item"><div className="db-bar-label"><span>{d.name}</span><span style={{ fontWeight:600 }}>{d.value}</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${Math.round((d.value/max)*100)}%`,background:colors[i%colors.length] }}/></div></div>;
              })}
            </div>
          </div>
          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Leave Type Breakdown</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:"Casual",value:40},{name:"Sick",value:30},{name:"Annual",value:20},{name:"Other",value:10}]} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                      {["#7C3AED","#22C55E","#F97316","#9CA3AF"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="db-card">
            <div className="db-card-header"><div className="db-card-title">Monthly Payroll</div></div>
            <div className="db-profit-val">{fmtINR(monthlyPayroll)}</div>
            <div className="db-profit-sub">Total payroll this month</div>
            <div style={{ padding:"0 20px 16px" }}>
              <div className="db-chart-wrap" style={{ height:100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i)=>({m:i+1,v}))}>
                    <Line type="monotone" dataKey="v" stroke="#7C3AED" strokeWidth={2} dot={false}/>
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
