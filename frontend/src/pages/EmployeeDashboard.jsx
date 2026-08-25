import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  CheckCircle, Calendar, IndianRupee, Clock, UserCheck, Activity,
  FileText, Bell, AlertTriangle, Award, Star, TrendingUp, TrendingDown,
  ArrowRight, MessageSquare, Coffee, Book, ListTodo, ChevronDown, ArrowUpRight, ArrowDownRight, Settings
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
      setAttendStats({ total:attArr.length, present, pct: attArr.length>0?Math.round((present/attArr.length)*100):0, attArr });
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

  const attTrend = (attendStats.attArr || []).slice(0, 12).map((a) => ({
    name: new Date(a.date || a.createdAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}),
    pct: (a.status === "Present" || a.checkIn) ? 100 : 0
  })).reverse();

  const fallbackAiInsights=[
    present>0     && `Attendance tracking at ${present}% for the month.`,
    completedTask>0&& `Great job! You have completed ${completedTask} tasks so far.`,
    pendingTask>0 && `${pendingTask} task${pendingTask!==1?"s":""} remaining in your queue.`,
    `Remember to check out at the end of your shift.`,
    `Review your upcoming scheduled tasks to stay ahead.`,
  ].filter(Boolean).slice(0,5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', weekday: 'long'});
  const calendarDays = [];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
  for(let i=0; i<startOffset; i++) calendarDays.push(<div key={`empty-${i}`} className="bx-cal-day" style={{color:'transparent'}}>-</div>);
  for(let i=1; i<=daysInMonth; i++) {
    const isToday = i === today.getDate();
    calendarDays.push(<div key={`day-${i}`} className={`bx-cal-day ${isToday ? 'active' : ''}`}>{i}</div>);
  }

  return (
    <div className="bx-layout">
      <div className="bx-main-wrapper">
        <div className="bx-content-scroll">
          <div className="bx-center-col">
            
            {/* HERO */}
            <div className="bx-hero">
              <div className="bx-hero-text">
                <h1>Good morning, {user?.name?.split(' ')[0] || 'Employee'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your personal work overview for today.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem', marginTop:'1.5rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.9rem'}}>
                    <Calendar size={16} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.9rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor: '#34d399'}}></span> Work Day Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><ListTodo size={14}/></div> Tasks Due</div>
                <div className="bx-kpi-val">{myTasks.length}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> Pending Tasks</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon blue"><Calendar size={14}/></div> Leave Balance</div>
                <div className="bx-kpi-val">{leaveBal}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Days Left</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon teal"><UserCheck size={14}/></div> Attendance</div>
                <div className="bx-kpi-val">{attendPct}%</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> This Month</div>
              </div>
            </div>


            {/* QUICK LINKS */}
            <div className="bx-card" style={{marginBottom:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Actions</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/tasks")}><ListTodo size={16} color="#10b981"/> My Tasks</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/leave-management/apply")}><Calendar size={16} color="#3b82f6"/> Apply Leave</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/payslips")}><FileText size={16} color="#a855f7"/> My Payslip</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/attendance")}><UserCheck size={16} color="#14b8a6"/> Attendance</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/support")}><MessageSquare size={16} color="#f97316"/> Support</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/profile")}><Award size={16} color="#f59e0b"/> My Profile</div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2'}}>
                <div className="bx-card-header">
                  <h3 className="bx-card-title">My Attendance</h3>
                </div>
                <div style={{height:'220px', width:'100%'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attTrend} margin={{ top:5, right:20, bottom:5, left:0 }}>
                      <defs>
                        <linearGradient id="empColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} width={40} tickFormatter={(value) => `${value}%`}/>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                      <Area type="monotone" dataKey="pct" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#empColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Task Progress</h3>
                </div>
                <div style={{height:'220px', width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                        {["#059669","#E5E7EB"].map((c,i) => <Cell key={i} fill={c}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bx-budget-stats" style={{width:'100%', marginTop:'0'}}>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#059669'}}></div> Done</div>
                      <div className="val">{taskDone}</div>
                    </div>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#E5E7EB'}}></div> Pending</div>
                      <div className="val">{pendingTask}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop: '1rem'}}>
              
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">My Task Status</h3>
                </div>
                <div>
                  {[
                    ["To Do",myTasks.filter(t=>t.status==="To Do").length,"#f59e0b"],
                    ["In Progress",myTasks.filter(t=>t.status==="In Progress").length,"#3b82f6"],
                    ["Completed",taskDone,"#22c55e"],
                    ["Overdue",myTasks.filter(t=>t.priority==="High"&&t.status!=="Completed").length,"#ef4444"],
                  ].map(([n,v,cls],i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: cls}}><ListTodo size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v} Tasks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Upcoming Tasks</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/tasks'); }}>View All →</a>
                </div>
                <div>
                  {myTasks.slice(0,5).map((t,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: t.priority==="High"?"#ef4444":t.priority==="Medium"?"#f59e0b":"#22c55e"}}><FileText size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.priority||"Normal"} Priority</p>
                      </div>
                    </div>
                  ))}
                  {myTasks.length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No pending tasks 🎉</h4></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Upcoming Events</h3>
                </div>
                <div>
                  {upcomingEvents.length > 0 ? upcomingEvents.map((ev,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: ev.color}}><Calendar size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.mon} {ev.day}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No upcoming events</h4></div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="bx-right-col">
            
            <div className="bx-card bx-calendar">
              <div className="bx-cal-header">
                <span className="bx-cal-title">Calendar</span>
                <span className="bx-cal-month">{today.toLocaleString('default', {month:'long', year:'numeric'})}</span>
              </div>
              <div className="bx-cal-grid">
                <div className="bx-cal-day-name">MON</div><div className="bx-cal-day-name">TUE</div><div className="bx-cal-day-name">WED</div><div className="bx-cal-day-name">THU</div><div className="bx-cal-day-name">FRI</div><div className="bx-cal-day-name">SAT</div><div className="bx-cal-day-name">SUN</div>
                {calendarDays}
              </div>
            </div>

            <div className="bx-card">
              <div className="bx-card-header">
                <h3 className="bx-card-title">Recent Activity</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>View All →</a>
              </div>
              <div className="bx-tasks-list">
                {notifications.length > 0 ? notifications.slice(0,4).map((n,i) => {
                    return (
                      <div className="bx-task-item" key={i}>
                        <div className="bx-activity-icon" style={{width: '32px', height: '32px', borderRadius: '8px', background: "#D1FAE5", color: "#059669", display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0}}><Activity size={16}/></div>
                        <div className="bx-task-content">
                          <p className="bx-task-title">
                            {n.text?.match(/\(([^)]+)\)/)?.[1] ? `${n.text.match(/\(([^)]+)\)/)[1]} Activity` : "System Activity"}
                          </p>
                          <p className="bx-task-sub">{n.text||n.message||"System notification"}</p>
                        </div>
                      </div>
                    );
                }) : (
                  <div className="bx-task-item"><div className="bx-task-content"><p className="bx-task-title">No recent activity</p></div></div>
                )}
              </div>
            </div>

            <div className="bx-card">
              <div className="bx-card-header">
                <h3 className="bx-card-title">Notifications</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>View All →</a>
              </div>
              <div className="bx-notifs-list">
                {notifications.length > 0 ? notifications.slice(0,4).map((n,i) => (
                  <div className="bx-notif-item" key={i}>
                    <div className="bx-notif-icon" style={{background: ['#059669','#6366F1','#F97316','#3B82F6'][i%4]}}><Bell size={10}/></div>
                    <div className="bx-task-content"><p className="bx-task-title">{n.text||n.message}</p></div>
                    <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)', whiteSpace: 'nowrap'}}>{n.time ? new Date(n.time).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'}) : 'Recent'}</span>
                  </div>
                )) : (
                  <div className="bx-notif-item"><div className="bx-task-content"><p className="bx-task-title">No notifications</p></div></div>
                )}
              </div>
            </div>

            <div className="bx-ai-widget">
              <div className="bx-ai-header">
                <div style={{width:'24px', height:'24px', background:'#1d4ed8', color:'white', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center'}}>B</div>
                BuildAxis AI Insights <span style={{fontSize:'10px', background:'white', color:'#3b82f6', padding:'2px 4px', borderRadius:'4px', fontWeight:'normal'}}>Beta</span>
              </div>
              <div className="bx-ai-body" style={{maxHeight:'250px', overflowY:'auto'}}>
                <p className="bx-ai-msg">Hi {user?.name?.split(' ')[0] || 'Employee'}! Here are your latest insights:</p>
                {aiLoading ? (
                  <p className="bx-ai-msg" style={{background:'#f1f5f9'}}>Analyzing data...</p>
                ) : displayInsights && displayInsights.length > 0 ? (
                  displayInsights.map((insight, i) => (
                    <p className="bx-ai-msg" key={i} style={{background:'#f1f5f9', marginTop:'8px', fontSize:'0.75rem'}}>{insight}</p>
                  ))
                ) : (
                  <p className="bx-ai-msg" style={{background:'#f1f5f9'}}>No new insights generated today.</p>
                )}
              </div>
              <div className="bx-ai-footer">
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}><Bell size={14}/> Smart Reminders</div>
                <div style={{display:'flex', gap:'8px'}}><span style={{background:'rgba(255,255,255,0.2)', padding:'2px 6px', borderRadius:'10px', fontSize:'0.7rem'}}>?</span> <ChevronDown size={14}/></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
