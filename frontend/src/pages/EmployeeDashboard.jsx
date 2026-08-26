import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  CheckCircle, Calendar, IndianRupee, Clock, UserCheck, Activity,
  FileText, Bell, AlertTriangle, Award, Star, TrendingUp, TrendingDown,
  ArrowRight, MessageSquare, ListTodo, ArrowUpRight, ArrowDownRight, Cloud, Settings
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState } from "../components/DataStates";
import SystemHealthMonitorWidget from '../components/AdminDashboard/SystemHealthMonitorWidget';

const greeting = () => { const h=new Date().getHours(); if(h<12)return"Good Morning"; if(h<17)return"Good Afternoon"; if(h<21)return"Good Evening"; return"Good Night"; };
const fmtINR = (v) => { if(!v&&v!==0)return"₹0"; const abs=Math.abs(v); if(abs>=100000)return`₹${(abs/100000).toFixed(2)}L`; if(abs>=1000)return`₹${(abs/1000).toFixed(1)}k`; return`₹${abs}`; };

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [myTasks,       setMyTasks]       = useState([]);
  const [attendStats,   setAttendStats]   = useState({});
  const [salary,        setSalary]        = useState(null);
  const [leaveBalance,  setLeaveBalance]  = useState(null);
  const [upcomingEvents,setUpcomingEvents]= useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState({ temp: '28°C', condition: 'Partly Cloudy' });

  useEffect(() => { const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); }, []);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if (data?.current_weather) {
          const w = data.current_weather;
          let cond = 'Clear';
          if (w.weathercode === 1 || w.weathercode === 2) cond = 'Partly Cloudy';
          else if (w.weathercode === 3) cond = 'Overcast';
          else if (w.weathercode >= 45 && w.weathercode <= 48) cond = 'Fog';
          else if (w.weathercode >= 51 && w.weathercode <= 67) cond = 'Rain';
          else if (w.weathercode >= 80 && w.weathercode <= 82) cond = 'Rain Showers';
          else if (w.weathercode >= 95) cond = 'Thunderstorm';
          setWeather({ temp: `${Math.round(w.temperature)}°C`, condition: cond });
        }
      } catch (e) { console.error("Weather fetch failed", e); }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(28.61, 77.21)
      );
    } else { fetchWeather(28.61, 77.21); }
  }, []);

  useEffect(() => {
    Promise.all([
      API.get("/tasks/my").catch(() => ({ data: [] })),
      API.get("/attendance/my-history").catch(() => ({ data: [] })),
      API.get("/payroll/my-salary").catch(() => ({ data: null })),
      API.get("/leaves/balance").catch(() => ({ data: null })),
      API.get("/notifications").catch(() => ({ data: [] })),
    ]).then(([taskR, attR, salR, lvR, notifR]) => {
      const tasks = (taskR.data || []);
      setMyTasks(tasks.filter(t => t.status !== "Completed").slice(0, 5));
      const attArr = attR.data || [];
      const present = attArr.filter(a => a.status === "Present" || a.checkIn).length;
      setAttendStats({ total: attArr.length, present, pct: attArr.length > 0 ? Math.round((present/attArr.length)*100) : 0, attArr });
      setSalary(salR.data);
      setLeaveBalance(lvR.data);
      setNotifications((notifR.data || []).slice(0,5));
      const n = new Date();
      setUpcomingEvents(
        tasks.filter(t => t.dueDate && new Date(t.dueDate) >= n)
          .sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate)).slice(0,4)
          .map((t,i) => {
            const d = new Date(t.dueDate);
            const colors = ["#059669","#6366F1","#F97316","#EF4444"];
            return { day: String(d.getDate()).padStart(2,"0"), mon: d.toLocaleString("default",{month:"short"}).toUpperCase(), title: t.title, sub: t.priority||"Task", color: colors[i%4] };
          })
      );
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading your Dashboard…" height="100vh"/>;

  const taskDone   = myTasks.filter(t => t.status === "Completed").length;
  const taskTotal  = myTasks.length;
  const taskPct    = taskTotal > 0 ? Math.round((taskDone/taskTotal)*100) : 0;
  const leaveBal = (() => {
    if (!leaveBalance) return 12;
    if (typeof leaveBalance === 'number') return leaveBalance;
    if (typeof leaveBalance.remaining === 'number') return leaveBalance.remaining;
    if (typeof leaveBalance.balance === 'number') return leaveBalance.balance;
    if (typeof leaveBalance.Annual === 'number') return (leaveBalance.Annual||0)+(leaveBalance.Sick||0)+(leaveBalance.Casual||0);
    return 12;
  })();
  const mySalary   = salary?.netSalary || salary?.basicSalary || 0;
  const attendPct  = attendStats.pct || 0;
  const completedTask = myTasks.filter(t => t.status === "Completed").length;
  const pendingTask = myTasks.filter(t => t.status !== "Completed").length;

  const donutData = [{ name:"Done", value: taskDone||1 }, { name:"Pending", value: Math.max(0, taskTotal-taskDone)||0 }];
  const attTrend = (attendStats.attArr || []).slice(0,12).map((a) => ({
    name: new Date(a.date || a.createdAt).toLocaleDateString('en-GB', {day:'numeric', month:'short'}),
    pct: (a.status === "Present" || a.checkIn) ? 100 : 0
  })).reverse();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', weekday:'long'});
  const calendarDays = [];
  const currentMonth = today.getMonth();
  const currentYear  = today.getFullYear();
  const firstDay     = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth  = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset  = firstDay === 0 ? 6 : firstDay - 1;
  for (let i=0; i<startOffset; i++) calendarDays.push(<div key={`empty-${i}`} className="bx-cal-day" style={{color:'transparent'}}>-</div>);
  for (let i=1; i<=daysInMonth; i++) {
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
              <div className="bx-hero-ring bx-hero-ring-1"/>
              <div className="bx-hero-ring bx-hero-ring-2"/>

              <div className="bx-hero-text" style={{zIndex:2}}>
                <h1>{greeting()}, {user?.name?.split(' ')[0] || 'Employee'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your tasks, attendance, and work overview for today.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.6rem', marginTop:'1.2rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                    <Calendar size={15} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                      <Cloud size={15} color="#93c5fd"/> {weather.temp} <span style={{color:'#cbd5e1', fontSize:'0.75rem', fontWeight:'normal'}}>{weather.condition}</span>
                    </div>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.88rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor:'#34d399'}}></span> Checked In
                    </div>
                  </div>
                </div>
              </div>

              <div className="bx-hero-stats">
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--purple"><CheckCircle size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{taskPct}%</div>
                    <div className="bx-hero-stat-lbl">Task Progress</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--amber"><ListTodo size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{pendingTask}</div>
                    <div className="bx-hero-stat-lbl">Pending Tasks</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--green"><Calendar size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{leaveBal}</div>
                    <div className="bx-hero-stat-lbl">Leave Balance</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--cyan"><UserCheck size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{attendPct}%</div>
                    <div className="bx-hero-stat-lbl">Attendance Rate</div>
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
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon purple"><IndianRupee size={14}/></div> My Salary</div>
                <div className="bx-kpi-val">{fmtINR(mySalary)}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Net Pay</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon orange"><CheckCircle size={14}/></div> Completed</div>
                <div className="bx-kpi-val">{completedTask}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Tasks done</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon pink"><Star size={14}/></div> Task Progress</div>
                <div className="bx-kpi-val">{taskPct}%</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Completion rate</div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2'}}>
                <div className="bx-card-header">
                  <h3 className="bx-card-title">My Attendance History</h3>
                </div>
                <div style={{height:'220px', width:'100%'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attTrend} margin={{top:5, right:20, bottom:5, left:0}}>
                      <defs>
                        <linearGradient id="empColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} dy={10} interval={0}/>
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} width={40} tickFormatter={(v) => `${v}%`}/>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                      <Area type="monotone" dataKey="pct" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#empColor)"/>
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

            {/* QUICK LINKS */}
            <div className="bx-card" style={{padding:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Actions</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/tasks")}><ListTodo size={16} color="#10b981"/> My Tasks</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/leave-management/apply")}><Calendar size={16} color="#3b82f6"/> Apply Leave</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/payslips")}><FileText size={16} color="#a855f7"/> My Payslip</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/attendance")}><UserCheck size={16} color="#14b8a6"/> Attendance</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/support")}><MessageSquare size={16} color="#f97316"/> Support</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/profile")}><Award size={16} color="#f59e0b"/> My Profile</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/notifications")}><Bell size={16} color="#ef4444"/> Notifications</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/settings")}><Settings size={16} color="#06b6d4"/> Settings</div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop:'1rem'}}>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">My Task Status</h3>
                </div>
                <div>
                  {[
                    ["To Do",        myTasks.filter(t => t.status === "To Do").length,        "#f59e0b"],
                    ["In Progress",  myTasks.filter(t => t.status === "In Progress").length,  "#3b82f6"],
                    ["Completed",    taskDone,                                                 "#22c55e"],
                    ["High Priority",myTasks.filter(t => t.priority === "High" && t.status !== "Completed").length, "#ef4444"],
                  ].map(([n,v,cls],i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:cls}}><ListTodo size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{n}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v} Tasks</p>
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
                      <div className="bx-list-icon" style={{background:t.priority==="High"?"#ef4444":t.priority==="Medium"?"#f59e0b":"#22c55e"}}><FileText size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.title}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.priority||"Normal"} Priority</p>
                      </div>
                      <div className="bx-list-meta" style={{flexShrink:0}}>
                        <span className={`bx-tag ${t.priority==="High"?"high":t.priority==="Medium"?"medium":"low"}`}>{t.priority||"Normal"}</span>
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
                      <div className="bx-list-icon" style={{background:ev.color}}><Calendar size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ev.title}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ev.mon} {ev.day}</p>
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
                {notifications.length > 0 ? notifications.slice(0,4).map((n,i) => (
                  <div className="bx-task-item" key={i}>
                    <div className="bx-activity-icon" style={{width:'32px', height:'32px', borderRadius:'8px', background:"#D1FAE5", color:"#059669", display:'flex', alignItems:'center', justifyContent:'center', marginRight:'12px', flexShrink:0}}><Activity size={16}/></div>
                    <div className="bx-task-content">
                      <p className="bx-task-title">{n.text?.match(/\(([^)]+)\)/)?.[1] ? `${n.text.match(/\(([^)]+)\)/)[1]} Activity` : "System Activity"}</p>
                      <p className="bx-task-sub">{n.text || n.message || "System notification"}</p>
                    </div>
                  </div>
                )) : (
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
                    <div className="bx-notif-icon" style={{background:['#059669','#6366F1','#F97316','#3B82F6'][i%4]}}><Bell size={10}/></div>
                    <div className="bx-task-content"><p className="bx-task-title">{n.text || n.message}</p></div>
                    <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)', whiteSpace:'nowrap'}}>{n.time ? new Date(n.time).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'}) : 'Recent'}</span>
                  </div>
                )) : (
                  <div className="bx-notif-item"><div className="bx-task-content"><p className="bx-task-title">No notifications</p></div></div>
                )}
              </div>
            </div>

            <SystemHealthMonitorWidget />

          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
