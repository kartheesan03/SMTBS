import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  IndianRupee, ShoppingCart, Users, Target, TrendingUp, TrendingDown,
  FileText, PhoneCall, Clock, CheckCircle, Activity,
  AlertTriangle, Plus, Star, Crosshair, BarChart2, Calendar,
  ArrowUpRight, ArrowDownRight, Box, Quote, Bell, Settings, Cloud
} from "lucide-react";
import {
  ComposedChart, Bar, Line, Legend, AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState } from "../components/DataStates";
import SystemHealthMonitorWidget from '../components/AdminDashboard/SystemHealthMonitorWidget';

const greeting = () => { const h=new Date().getHours(); if(h<12)return"Good Morning"; if(h<17)return"Good Afternoon"; if(h<21)return"Good Evening"; return"Good Night"; };
const fmtINR = (v) => { if(!v&&v!==0)return"₹0"; const abs=Math.abs(v); if(abs>=100000)return`₹${(abs/100000).toFixed(2)}L`; if(abs>=1000)return`₹${(abs/1000).toFixed(1)}k`; return`₹${abs}`; };

const SalesDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [leads,         setLeads]         = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [customers,     setCustomers]     = useState([]);
  const [tasks,         setTasks]         = useState([]);
  const [upcomingEvents,setUpcomingEvents]= useState([]);
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
      API.get("/dashboard/stats").catch(() => ({ data: {} })),
      API.get("/leads").catch(() => ({ data: [] })),
      API.get("/orders").catch(() => ({ data: [] })),
      API.get("/customers").catch(() => ({ data: [] })),
      API.get("/tasks").catch(() => ({ data: [] })),
    ]).then(([statsR, leadsR, ordR, custR, taskR]) => {
      setDashboardData(statsR.data || {});
      setLeads(leadsR.data || []);
      setOrders(ordR.data || []);
      setCustomers(custR.data || []);
      const tl = taskR.data || [];
      setTasks(tl.filter(t => t.status !== "Completed").slice(0,5));
      const n = new Date();
      setUpcomingEvents(
        tl.filter(t => t.dueDate && new Date(t.dueDate) >= n)
          .sort((a,b) => new Date(a.dueDate)-new Date(b.dueDate)).slice(0,4)
          .map((t,i) => {
            const d = new Date(t.dueDate);
            const colors = ["#DC2626","#6366F1","#22C55E","#F97316"];
            return { day: String(d.getDate()).padStart(2,"0"), mon: d.toLocaleString("default",{month:"short"}).toUpperCase(), title: t.title, sub: t.category||"Sales", color: colors[i%4] };
          })
      );
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading Sales Dashboard…" height="100vh"/>;

  const s              = dashboardData?.stats || {};
  const totalRevenue   = s.revenue || 0;
  const newLeads       = leads.filter(l => l.status === "New" || !l.status).length;
  const closedDeals    = leads.filter(l => l.status === "Closed" || l.status === "Won").length;
  const activeCustomers= customers.length || s.activeCustomers || 0;
  const openOrders     = orders.filter(o => !["Delivered","Completed","Cancelled"].includes(o.status)).length;
  const pendingOrders  = s.pendingOrders || 0;

  const trendRaw   = dashboardData?.analytics?.trendData || dashboardData?.charts?.monthlyStats || [];
  const chartData  = trendRaw.map(d => ({ name: d.name, revenue: d.revenue||0 }));
  const pipelineData = [
    { name:"Prospects", value: leads.filter(l => l.status === "Prospect").length },
    { name:"Qualified",  value: leads.filter(l => l.status === "Qualified").length },
    { name:"Proposal",   value: leads.filter(l => l.status === "Proposal").length },
    { name:"Closed",     value: closedDeals }
  ];
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
                <h1>{greeting()}, {user?.name?.split(' ')[0] || 'Sales'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your sales pipeline and performance overview for today.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.6rem', marginTop:'1.2rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                    <Calendar size={15} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                      <Cloud size={15} color="#93c5fd"/> {weather.temp} <span style={{color:'#cbd5e1', fontSize:'0.75rem', fontWeight:'normal'}}>{weather.condition}</span>
                    </div>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.88rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor:'#34d399'}}></span> Market Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="bx-hero-stats">
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--purple"><IndianRupee size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{fmtINR(totalRevenue)}</div>
                    <div className="bx-hero-stat-lbl">Total Revenue</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--amber"><Target size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{newLeads}</div>
                    <div className="bx-hero-stat-lbl">New Leads</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--green"><CheckCircle size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{closedDeals}</div>
                    <div className="bx-hero-stat-lbl">Closed Deals</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--cyan"><ShoppingCart size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{openOrders}</div>
                    <div className="bx-hero-stat-lbl">Open Orders</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon amber"><IndianRupee size={14}/></div> Total Revenue</div>
                <div className="bx-kpi-val">{fmtINR(totalRevenue)}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> vs last month</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon blue"><Crosshair size={14}/></div> New Leads</div>
                <div className="bx-kpi-val">{newLeads}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> This month</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><CheckCircle size={14}/></div> Closed Deals</div>
                <div className="bx-kpi-val">{closedDeals}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Won this period</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon purple"><Users size={14}/></div> Active Customers</div>
                <div className="bx-kpi-val">{activeCustomers}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> <span>total customers</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon orange"><ShoppingCart size={14}/></div> Open Orders</div>
                <div className="bx-kpi-val">{openOrders}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> Needs follow-up</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon teal"><Clock size={14}/></div> Pending Approvals</div>
                <div className="bx-kpi-val">{pendingOrders}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> Awaiting action</div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2'}}>
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Sales Revenue Trend</h3>
                </div>
                <div style={{height:'220px', width:'100%'}}>
                  {chartData && chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={chartData.map(d => ({ ...d, target: d.revenue ? d.revenue * 0.8 : 0 }))} 
                        margin={{top:20, right:20, bottom:5, left:0}}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} width={40} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}/>
                        <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}} cursor={{fill: '#f1f5f9'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingBottom: '20px'}}/>
                        <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="target" name="Target" stroke="#F97316" strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: '#F97316', strokeWidth: 2}} activeDot={{r: 6}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>No sales data available</div>
                  )}
                </div>
              </div>
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Deal Pipeline</h3>
                </div>
                <div style={{height:'220px', width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                        {["#DC2626","#F97316","#EAB308","#22C55E"].map((c,i) => <Cell key={i} fill={c}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bx-budget-stats" style={{width:'100%', marginTop:'0'}}>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#DC2626'}}></div> Prospects</div>
                      <div className="val">{pipelineData[0]?.value || 0}</div>
                    </div>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#22C55E'}}></div> Closed Won</div>
                      <div className="val">{closedDeals}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="bx-card" style={{padding:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Actions</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/orders/select-type")}><Plus size={16} color="#ef4444"/> New Order</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/crm/leads")}><Crosshair size={16} color="#3b82f6"/> Leads</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/quotations")}><FileText size={16} color="#a855f7"/> Quotations</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/customers")}><Users size={16} color="#22c55e"/> Customers</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/analytics")}><BarChart2 size={16} color="#f59e0b"/> Reports</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/crm/pipeline")}><Target size={16} color="#f97316"/> Pipeline</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/crm/follow-ups")}><PhoneCall size={16} color="#14b8a6"/> Follow-ups</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate("/orders")}><ShoppingCart size={16} color="#06b6d4"/> Orders</div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop:'1rem'}}>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Lead Pipeline</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/crm/leads'); }}>View All →</a>
                </div>
                <div>
                  {[
                    ["New",       leads.filter(l => l.status==="New"||!l.status).length,         "#3b82f6"],
                    ["Qualified", leads.filter(l => l.status==="Qualified").length,               "#f59e0b"],
                    ["Proposal",  leads.filter(l => l.status==="Proposal").length,                "#a855f7"],
                    ["Closed Won",closedDeals,                                                    "#22c55e"],
                  ].map(([n,v,cls],i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:cls}}><Crosshair size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{n}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{v} Leads</p>
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
                {notifications.length > 0 ? notifications.slice(0,4).map((n,i) => (
                  <div className="bx-notif-item" key={i}>
                    <div className="bx-notif-icon" style={{background:['#DC2626','#22C55E','#6366F1','#F97316'][i%4]}}><Bell size={10}/></div>
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

export default SalesDashboard;
