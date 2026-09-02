import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAppInit } from "../context/AppInitContext";
import {
  Users, ShoppingCart, IndianRupee, Box, FileText, Truck,
  Bell, Calendar, ListTodo, UserCheck, Activity,
  AlertTriangle, Package, Target, Clock, Settings,
  TrendingUp, TrendingDown, ArrowRight, CheckSquare, Plus, Quote,
  ArrowUpRight, ArrowDownRight, Cloud, BarChart2
} from "lucide-react";
import {
  ComposedChart, Bar, Line, Legend, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import SystemHealthMonitorWidget from '../components/AdminDashboard/SystemHealthMonitorWidget';

const greeting = () => { const h=new Date().getHours(); if(h<12)return"Good Morning"; if(h<17)return"Good Afternoon"; if(h<21)return"Good Evening"; return"Good Night"; };
const fmtINR = (v) => { if(!v&&v!==0)return"₹0"; const abs=Math.abs(v); if(abs>=100000)return`₹${(abs/100000).toFixed(2)}L`; if(abs>=1000)return`₹${(abs/1000).toFixed(1)}k`; return`₹${abs}`; };

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Consume pre-fetched data from global AppInitContext — no local loading needed
  const {
    dashboardData: initDashboardData,
    tasks,
    orders,
    employees,
  } = useAppInit();

  const [upcomingEvents, setUpcomingEvents] = useState([]);
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

  // Derive upcoming events from pre-fetched tasks
  useEffect(() => {
    const n = new Date();
    setUpcomingEvents(
      (tasks || []).filter(t => t.dueDate && new Date(t.dueDate) >= n)
        .sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate)).slice(0,4)
        .map((t,i) => {
          const d = new Date(t.dueDate);
          const colors = ["#D97706","#6366F1","#22C55E","#EF4444"];
          return { day: String(d.getDate()).padStart(2,"0"), mon: d.toLocaleString("default",{month:"short"}).toUpperCase(), title: t.title, sub: t.category||"General", color: colors[i%4] };
        })
    );
  }, [tasks]);

  const dashboardData = initDashboardData || {};
  const filteredTasks = (tasks || []).filter(t => t.status !== "Completed").slice(0, 5);


  const s            = dashboardData?.stats || {};
  const totalTeam    = employees.length || s.totalEmployees || 0;
  const openOrders   = orders.filter(o => !["Completed","Delivered","Cancelled"].includes(o.status)).length;
  const pendingTasks = tasks.length;
  const totalRevenue = s.revenue || 0;
  const pendingOrders= s.pendingOrders || 0;

  const trendRaw  = dashboardData?.analytics?.trendData || dashboardData?.charts?.monthlyStats || [];
  const chartData = trendRaw.map(d => ({ name: d.name, revenue: d.revenue||0 }));

  const taskDoneCount = (dashboardData?.stats?.completedTasks || 0);
  const taskTotal     = taskDoneCount + pendingTasks;
  const taskPct       = taskTotal > 0 ? Math.round((taskDoneCount/taskTotal)*100) : 0;
  const donutData     = taskTotal > 0
    ? [{ name:"Done", value: taskDoneCount }, { name:"Pending", value: pendingTasks }]
    : [{ name:"No data", value: 1 }];

  const recentActivity = dashboardData?.tables?.recentActivity || [];
  const notifications  = dashboardData?.tables?.notifications  || [];

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
                <h1>{greeting()}, {user?.name?.split(' ')[0] || 'Manager'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your team and operations overview for today.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.6rem', marginTop:'1.2rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                    <Calendar size={15} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                      <Cloud size={15} color="#93c5fd"/> {weather.temp} <span style={{color:'#cbd5e1', fontSize:'0.75rem', fontWeight:'normal'}}>{weather.condition}</span>
                    </div>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.88rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor:'#34d399', animation: 'live-pulse 2s infinite'}}></span> Live Data
                    </div>
                  </div>
                </div>
              </div>

              <div className="bx-hero-stats">
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--purple"><Users size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{totalTeam}</div>
                    <div className="bx-hero-stat-lbl">Team Size</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--green"><ShoppingCart size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{openOrders}</div>
                    <div className="bx-hero-stat-lbl">Open Orders</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--amber"><ListTodo size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{pendingTasks}</div>
                    <div className="bx-hero-stat-lbl">Pending Tasks</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--cyan"><FileText size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{pendingOrders}</div>
                    <div className="bx-hero-stat-lbl">Pending Approval</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon amber"><Users size={14}/></div> Team Members</div>
                <div className="bx-kpi-val">{totalTeam}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Active Staff</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon blue"><ShoppingCart size={14}/></div> Open Orders</div>
                <div className="bx-kpi-val">{openOrders}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> Needs Review</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon orange"><ListTodo size={14}/></div> Pending Tasks</div>
                <div className="bx-kpi-val">{pendingTasks}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> Assign Now</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><IndianRupee size={14}/></div> Revenue</div>
                <div className="bx-kpi-val">{fmtINR(totalRevenue)}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> <span>this period</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon purple"><CheckSquare size={14}/></div> Task Completion</div>
                <div className="bx-kpi-val">{taskPct}%</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> <span>completion rate</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon teal"><FileText size={14}/></div> Pending Approvals</div>
                <div className="bx-kpi-val">{pendingOrders}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> <span>needs action</span></div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2', display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="bx-card-title" style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Revenue Trend</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Monthly revenue performance</p>
                  </div>
                  <button style={{ 
                    display: 'flex', alignItems: 'center', gap: '4px', 
                    background: '#f8fafc', border: '1px solid #e2e8f0', 
                    padding: '4px 10px', borderRadius: '6px', 
                    fontSize: '12px', fontWeight: '600', color: '#475569',
                    cursor: 'pointer'
                  }}>
                    2026 ▾
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>₹3.2L</span>
                    <span style={{ 
                      display: 'flex', alignItems: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: '600', color: '#16a34a',
                      background: '#f0fdf4', padding: '2px 8px', borderRadius: '12px'
                    }}>
                      +12.8% vs previous period
                    </span>
                  </div>
                </div>

                <div style={{ height: '220px', width: '100%', marginTop: 'auto' }}>
                  {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontWeight: 600, color: '#0f172a', fontSize: '13px', padding: '8px 12px' }}
                          cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                          formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <ReferenceLine y={chartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0) / (chartData.length || 1)} stroke="#94a3b8" strokeDasharray="4 4" label={{ position: 'insideTopRight', value: 'Target', fill: '#94a3b8', fontSize: 11, fontWeight: 500, offset: 10 }} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorRev)" 
                          activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No revenue data available</div>
                  )}
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
                        {donutData.map((_,i) => <Cell key={i} fill={["#D97706","#E5E7EB"][i%2]}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bx-budget-stats" style={{width:'100%', marginTop:'0'}}>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#D97706'}}></div> Done</div>
                      <div className="val">{taskDoneCount}</div>
                    </div>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#E5E7EB'}}></div> Pending</div>
                      <div className="val">{pendingTasks}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="bx-card" style={{padding:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Links</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/orders')}><ShoppingCart size={16} color="#3b82f6"/> Orders</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/materials')}><Box size={16} color="#f97316"/> Inventory</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/hrms')}><Users size={16} color="#a855f7"/> My Team</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/analytics')}><FileText size={16} color="#f59e0b"/> Reports</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/quotations')}><Quote size={16} color="#22c55e"/> Quotations</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/tasks')}><ListTodo size={16} color="#ef4444"/> Tasks</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/attendance')}><Calendar size={16} color="#14b8a6"/> Schedule</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/settings')}><Settings size={16} color="#06b6d4"/> Settings</div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop:'1rem'}}>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Order Pipeline</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/orders'); }}>View All →</a>
                </div>
                <div>
                  {[
                    ["Pending",    orders.filter(o => o.status === "Pending").length,    "#f59e0b"],
                    ["Processing", orders.filter(o => o.status === "Processing").length, "#3b82f6"],
                    ["Shipped",    orders.filter(o => o.status === "Shipped").length,    "#22c55e"],
                    ["Delivered",  orders.filter(o => o.status === "Delivered").length,  "#10b981"],
                  ].map(([n,v,cls],i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:cls}}><ShoppingCart size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{n}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v} Orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Pending Tasks</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/tasks'); }}>View All →</a>
                </div>
                <div>
                  {tasks.slice(0,5).map((t,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:t.priority==="High"?"#ef4444":t.priority==="Medium"?"#f59e0b":"#22c55e"}}><ListTodo size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.title}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.priority||"Normal"} Priority</p>
                      </div>
                      <div className="bx-list-meta" style={{flexShrink:0}}>
                        <span className={`bx-tag ${t.priority==="High"?"high":t.priority==="Medium"?"medium":"low"}`}>{t.priority||"Normal"}</span>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No pending tasks</h4></div>
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
                <h3 className="bx-card-title">My Payslips</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/payslips'); }}>View All →</a>
              </div>
              <div className="bx-tasks-list">
                <div className="bx-task-item" style={{justifyContent: 'center', padding: '20px', color: '#64748b'}}>
                  No recent payslips
                </div>
              </div>
            </div>

            <div className="bx-card">
              <div className="bx-card-header">
                <h3 className="bx-card-title">Notifications</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>View All →</a>
              </div>
              <div className="bx-notifs-list">
                {notifications.length > 0 ? [...notifications].sort((a,b) => new Date(b.time || b.createdAt) - new Date(a.time || a.createdAt)).slice(0, 3).map((n,i) => (
                  <div className="bx-notif-item" key={i}>
                    <div className="bx-notif-icon" style={{background:['#D97706','#22C55E','#6366F1','#EF4444'][i%4]}}><Bell size={10}/></div>
                    <div className="bx-task-content"><p className="bx-task-title">{n.text}</p></div>
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

export default ManagerDashboard;
