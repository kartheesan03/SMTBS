import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  CheckCircle, Calendar, DollarSign, Clock, UserCheck, Activity,
  FileText, Bell, AlertTriangle, Award, Star, TrendingUp, TrendingDown,
  ArrowRight, MessageSquare, Coffee, Book, ListTodo,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
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
const SPARK=[5,8,6,11,7,13,9,14,11,16,13,15];

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [myTasks,      setMyTasks]      = useState([]);
  const [attendStats,  setAttendStats]  = useState({});
  const [salary,       setSalary]       = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [upcomingEvents,setUpcomingEvents]=useState([]);
  const [notifications, setNotifications]=useState([]);
  const [loading,      setLoading]      = useState(true);
  const [now, setNow] = useState(new Date());

  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    Promise.all([
      API.get("/tasks/my").catch(()=>({data:[]})),
      API.get("/attendance/my-history").catch(()=>({data:[]})),
      API.get("/payroll/my-salary").catch(()=>({data:null})),
      API.get("/leaves/balance").catch(()=>({data:null})),
      API.get("/notifications").catch(()=>({data:[]})),
    ]).then(([taskR,attR,salR,lvR,notifR])=>{
      const tasks=(taskR.data||[]);
      setMyTasks(tasks.filter(t=>t.status!=="Completed").slice(0,5));
      const attArr=attR.data||[];
      const present=attArr.filter(a=>a.status==="Present"||a.checkIn).length;
      setAttendStats({ total:attArr.length, present, pct: attArr.length>0?Math.round((present/attArr.length)*100):0 });
      setSalary(salR.data);
      setLeaveBalance(lvR.data);
      setNotifications((notifR.data||[]).slice(0,5));
      const n=new Date();
      setUpcomingEvents(
        tasks.filter(t=>t.dueDate&&new Date(t.dueDate)>=n)
          .sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,4)
          .map((t,i)=>{ const d=new Date(t.dueDate); const colors=["#059669","#6366F1","#F97316","#EF4444"]; return{day:String(d.getDate()).padStart(2,"0"),mon:d.toLocaleString("default",{month:"short"}).toUpperCase(),title:t.title,sub:t.priority||"Task",color:colors[i%4]}; })
      );
    }).finally(()=>setLoading(false));
  },[]);

  if(loading) return <LoadingState message="Loading your Dashboard…" height="100vh"/>;

  const taskDone   = myTasks.filter(t=>t.status==="Completed").length;
  const taskTotal  = myTasks.length;
  const taskPct    = taskTotal>0?Math.round((taskDone/taskTotal)*100):0;
  // leaveBalance can be a number, { remaining, balance } or { Annual, Sick, Casual, Unpaid }
  const leaveBal = (() => {
    if (!leaveBalance) return 12;
    if (typeof leaveBalance === 'number') return leaveBalance;
    if (typeof leaveBalance.remaining === 'number') return leaveBalance.remaining;
    if (typeof leaveBalance.balance === 'number') return leaveBalance.balance;
    // Object shape: { Annual: N, Sick: N, Casual: N, Unpaid: N }
    if (typeof leaveBalance.Annual === 'number') {
      return (leaveBalance.Annual || 0) + (leaveBalance.Sick || 0) + (leaveBalance.Casual || 0);
    }
    return 12;
  })();
  const mySalary   = salary?.netSalary||salary?.basicSalary||0;
  const attendPct  = attendStats.pct||0;
  const completedTask = myTasks.filter(t=>t.status==="Completed").length;
  const pendingTask = myTasks.filter(t=>t.status!=="Completed").length;
  const present = attendPct;

  const donutData=[{name:"Done",value:taskDone||1},{name:"Pending",value:Math.max(0,taskTotal-taskDone)||0}];

  const attTrend=SPARK.map((v,i)=>({name:`D${i+1}`,pct:Math.min(100,attendPct+v-8)}));

  const fallbackAiInsights=[
    present>0     && `Attendance tracking at ${present}% for the month.`,
    completedTask>0&& `Great job! You have completed ${completedTask} tasks so far.`,
    pendingTask>0 && `${pendingTask} task${pendingTask!==1?"s":""} remaining in your queue.`,
    `Remember to check out at the end of your shift.`,
    `Review your upcoming scheduled tasks to stay ahead.`,
  ].filter(Boolean).slice(0,5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  return (
    <div className="db-page">
      <div className="db-content">

        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">{greeting()}, {user?.name?.split(" ")[0]||"Employee"}! 👋</div>
            <div className="db-greeting-sub">Here's your personal work overview for today.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="db-status-pill"><div className="db-status-dot"/>Work Day Active</div>
          </div>
        </div>

        <div className="db-kpi-grid">
          <KpiCard icon={ListTodo}  iconClass="green"  label="Tasks Due"       value={myTasks.filter(t=>t.status!=="Completed").length} trend="This week"  trendUp={false} sub="Pending tasks" />
          <KpiCard icon={Calendar}  iconClass="blue"   label="Leave Balance"   value={leaveBal}                                         trend="Days left"  trendUp={true}  sub="Available days" />
          <KpiCard icon={UserCheck} iconClass="teal"   label="Attendance"      value={`${attendPct}%`}                                  trend="This month" trendUp={true}  sub="Your rate" />
          <KpiCard icon={DollarSign}iconClass="purple" label="My Salary"       value={fmtINR(mySalary)}                                 trend="Processed"  trendUp={true}  sub="Latest payslip" />
        </div>

        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={ListTodo}     label="My Tasks"     colorClass="qa-green"  onClick={()=>navigate("/tasks")}/>
            <QaBtn icon={Calendar}     label="Apply Leave"  colorClass="qa-blue"   onClick={()=>navigate("/hr/leave")}/>
            <QaBtn icon={FileText}     label="My Payslip"   colorClass="qa-purple" onClick={()=>navigate("/hr/payroll")}/>
            <QaBtn icon={UserCheck}    label="Attendance"   colorClass="qa-teal"   onClick={()=>navigate("/hr/attendance")}/>
            <QaBtn icon={MessageSquare}label="Support"      colorClass="qa-orange" onClick={()=>navigate("/support")}/>
            <QaBtn icon={Award}        label="My Profile"   colorClass="qa-amber"  onClick={()=>navigate("/profile")}/>
          </div>
        </div>

        <div className="db-stats-mini-grid">
          {[
            [ListTodo, "#DCFCE7","#15803D","Tasks Pending", myTasks.filter(t=>t.status!=="Completed").length, "badge-red-sm","Due Soon"],
            [Calendar, "#DBEAFE","#1D4ED8","Leave Balance",  leaveBal,                                          "badge-blue-sm","Days Left"],
            [UserCheck,"#CCFBF1","#0D9488","Attendance",     `${attendPct}%`,                                   "badge-green-sm","This Month"],
            [DollarSign,"#F3E8FF","#7C3AED","Last Salary",   fmtINR(mySalary),                                  "badge-blue-sm","Processed"],
          ].map(([Icon,bg,col,label,val,badge,badgeText],i)=>(
            <div key={i} className="db-stats-mini-card">
              <div className="db-stats-mini-icon" style={{ background:bg,color:col }}><Icon size={18}/></div>
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
            <div className="db-profile-banner profile-banner-employee"/>
            <div className="db-profile-avatar profile-avatar-employee">{(user?.name||"E")[0].toUpperCase()}</div>
            <div className="db-profile-body">
              <div className="db-profile-name">{user?.name||"Employee"}</div>
              <div className="db-profile-role">{user?.department||"Employee"}</div>
              <span className="db-profile-badge profile-badge-employee">Employee</span>
              <div className="db-profile-info">
                <div className="db-profile-info-row"><span className="db-profile-info-label">Emp ID</span><span className="db-profile-info-val">EMP-{String(user?.id||4001).padStart(4,"0")}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Email</span><span className="db-profile-info-val" style={{ fontSize:11 }}>{user?.email||"—"}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Attendance</span><span className="db-profile-info-val">{attendPct}% this month</span></div>
              </div>
              <button className="db-profile-btn" onClick={()=>navigate("/profile")}>View Profile <ArrowRight size={13}/></button>
            </div>
          </div>

          <div className="db-card db-col-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(5, 150, 105, 0.15)", position: "relative", overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}>
            <div className="db-card-header" style={{ borderBottom: "none", padding: "24px 24px 0 24px", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <div className="db-card-title" style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <UserCheck size={16} color="#059669" />
                  My Attendance
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                  {attendPct}%
                  <span style={{ fontSize: 13, padding: "3px 10px", background: "#ecfdf5", color: "#10b981", borderRadius: "12px", fontWeight: 700 }}>
                    Excellent
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: "220px", marginTop: "20px", padding: "0 20px 10px 0" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attTrend} margin={{top:4,right:4,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} width={40}/>
                  <Tooltip cursor={{ stroke: '#6ee7b7', strokeWidth: 2, strokeDasharray: '4 4' }} contentStyle={{fontSize:12,borderRadius:8,border:"none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)"}}/>
                  <Area type="monotone" dataKey="pct" stroke="#059669" strokeWidth={4} fill="url(#empGrad)" activeDot={{ r: 6, fill: "#fff", stroke: "#059669", strokeWidth: 3 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Task Progress</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" startAngle={90} endAngle={-270} stroke="none" cornerRadius={6}>
                      {["#059669","#E5E7EB"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize:26,fontWeight:800,color:"#111827", lineHeight: 1 }}>{taskPct}%</div>
                  <div style={{ fontSize:12,color:"#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Done</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:24,fontSize:13, marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669" }} />
                  <span style={{ color:"#64748b",fontWeight:600 }}>Done <span style={{ color: "#0f172a", fontWeight: 800, marginLeft: 2 }}>{taskDone}</span></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e5e7eb" }} />
                  <span style={{ color:"#64748b",fontWeight:600 }}>Pending <span style={{ color: "#0f172a", fontWeight: 800, marginLeft: 2 }}>{taskTotal-taskDone}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">My Task Status</div></div>
            <div className="db-status-list">
              {[["To Do",myTasks.filter(t=>t.status==="To Do").length,"status-warning"],["In Progress",myTasks.filter(t=>t.status==="In Progress").length,"status-healthy"],["Completed",myTasks.filter(t=>t.status==="Completed").length,"status-healthy"],["Overdue",myTasks.filter(t=>t.priority==="High"&&t.status!=="Completed").length,"status-critical"]].map(([n,v,cls],i)=>(
                <div key={i} className="db-status-row"><span className="db-status-name">{n}</span><span className={`db-status-badge ${cls}`}>{v}</span></div>
              ))}
            </div>
          </div>

          <div className="db-card db-col-6">
            <div className="db-card-header"><div className="db-card-title">Recent Activity</div></div>
            <div className="db-activity-list">
              {notifications.slice(0,5).map((n,i)=>{
                return <div key={i} className="db-activity-item">
                  <div className="db-activity-icon" style={{ background:"#DCFCE7",color:"#059669" }}><Activity size={14}/></div>
                  <div className="db-activity-body"><div className="db-activity-title">Notification</div><div className="db-activity-desc">{n.text||n.message||"System notification"}</div></div>
                  <div className="db-activity-time">{n.time?fmtTime(n.time):"Now"}</div>
                </div>;
              })}
              {notifications.length===0&&<div className="db-empty">No recent activity</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Notifications</div></div>
            <div className="db-notif-list">
              {notifications.length>0?notifications.map((n,i)=>{const colors=["#059669","#6366F1","#F97316","#3B82F6","#EAB308"];return<div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:colors[i%colors.length] }}/><div className="db-notif-body"><div className="db-notif-text">{n.text||n.message}</div><div className="db-notif-time">{n.time?fmtTime(n.time):"Now"}</div></div></div>;})
              : <div className="db-empty">No new notifications</div>}
            </div>
          </div>

          {/* Row 3 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Tasks</div></div>
            <div className="db-status-list">
              {myTasks.slice(0,5).map((t,i)=>(
                <div key={i} className="db-status-row"><span className="db-status-name" style={{ fontSize:12 }}>{t.title}</span><span className={`db-status-badge ${t.priority==="High"?"status-critical":"status-warning"}`}>{t.priority||"Normal"}</span></div>
              ))}
              {myTasks.length===0&&<div className="db-empty">No tasks assigned 🎉</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Events</div></div>
            <div className="db-event-list">
              <br/>
              {upcomingEvents.length>0?upcomingEvents.map((ev,i)=>(
                <div key={i} className="db-event-item"><div className="db-event-date" style={{ background:ev.color }}><div className="db-event-day">{ev.day}</div><div className="db-event-mon">{ev.mon}</div></div><div className="db-event-body"><div className="db-event-title">{ev.title}</div><div className="db-event-sub">{ev.sub}</div></div></div>
              )) : <div className="db-empty">No upcoming events</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">AI Insights</div></div>
            <div className="db-ai-insights">
              <br/>
              {aiLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                  <div className="db-spin" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', marginBottom: '8px' }}></div><br />
                  Generating insights...
                </div>
              ) : displayInsights && displayInsights.length > 0 ? (
                displayInsights.map((text,i)=>{const colors=["#059669","#6366F1","#F97316","#3B82F6","#EAB308"];return<div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;})
              ) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">My Task Breakdown</div></div>
            <div className="db-bar-list">
              <br/>
              {[["To Do",myTasks.filter(t=>t.status==="To Do").length,"#F97316"],["In Progress",myTasks.filter(t=>t.status==="In Progress").length,"#3B82F6"],["Completed",myTasks.filter(t=>t.status==="Completed").length,"#22C55E"]].map(([label,val,color],i)=>{const max=Math.max(1,myTasks.length);return<div key={i} className="db-bar-item"><div className="db-bar-label"><span>{label}</span><span style={{ fontWeight:600 }}>{val}</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${Math.round((val/max)*100)}%`,background:color }}/></div></div>;})} 
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Leave Summary</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{name:"Used",value:Math.max(0,34-leaveBal)},{name:"Remaining",value:Math.max(0,leaveBal)}]} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" stroke="none" cornerRadius={6}>
                      {["#EF4444","#059669"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Monthly Salary</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>This Month</span>
            </div>
            <div className="db-card-body" style={{ padding: 0 }}>
              <div className="db-profit-val">{fmtINR(mySalary)}</div>
              <div className="db-profit-sub">Net salary this month</div>
              <div style={{ width: "100%", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[]}>
                    <Line type="monotone" dataKey="v" stroke="#059669" strokeWidth={3} dot={false}/>
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

export default EmployeeDashboard;
