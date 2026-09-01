import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AppInitContext } from "../context/AppInitContext";
import API from "../api/axios";
import {
  Users, IndianRupee, Calendar, UserCheck, AlertTriangle, Activity,
  FileText, Settings, TrendingUp, TrendingDown, ArrowRight,
  Briefcase, Bell, Clock, Star, ArrowUpRight, ArrowDownRight, Cloud
} from "lucide-react";
import {
  ComposedChart, Bar, Line, Legend, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import SystemHealthMonitorWidget from '../components/AdminDashboard/SystemHealthMonitorWidget';

const greeting = () => { const h=new Date().getHours(); if(h<12)return"Good Morning"; if(h<17)return"Good Afternoon"; if(h<21)return"Good Evening"; return"Good Night"; };
const fmtINR = (v) => { if(!v&&v!==0)return"₹0"; const abs=Math.abs(v); if(abs>=100000)return`₹${(abs/100000).toFixed(2)}L`; if(abs>=1000)return`₹${(abs/1000).toFixed(1)}k`; return`₹${abs}`; };

const HRDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  // Consume pre-fetched data from global AppInitContext
  const {
    dashboardData: initDashboardData,
    employees,
    tasks,
    leavesData,
    salariesData,
  } = useContext(AppInitContext);

  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState({ temp: '28°C', condition: 'Partly Cloudy' });
  const [upcomingEvents, setUpcomingEvents] = useState([]);

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
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4)
        .map((t, i) => {
          const d = new Date(t.dueDate);
          const colors = ["#7C3AED","#22C55E","#F97316","#3B82F6"];
          return { day: String(d.getDate()).padStart(2,"0"), mon: d.toLocaleString("default",{month:"short"}).toUpperCase(), title: t.title, sub: t.category||"HR", color: colors[i%4] };
        })
    );
  }, [tasks]);


  const dashboardData = initDashboardData || {};
  const s = dashboardData?.stats || {};

  const totalEmp      = employees.length || s.totalEmployees || 0;
  const presentToday  = dashboardData?.hrStats?.presentToday || 0;
  const pendingLeaves = leavesData.filter(l => l.status === "Pending").length;
  const monthlyPayroll= salariesData.reduce((sum,p) => sum + (p.netSalary || p.basicSalary || 0), 0);
  const empDist       = dashboardData?.hrStats?.employeeDistribution || [];
  const employeeTrend = dashboardData?.analytics?.employeeTrend || [];
  const attendancePct = totalEmp > 0 ? Math.round((presentToday / totalEmp) * 100) : 0;
  const donutData     = [{ name:"Present", value: presentToday }, { name:"Absent", value: Math.max(0, totalEmp - presentToday) }];
  const recentActivity= dashboardData?.tables?.recentActivity || [];
  const notifications = dashboardData?.tables?.notifications || [];

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', weekday:'long' });
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
                <h1>{greeting()}, {user?.name?.split(' ')[0] || 'HR Manager'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your people & HR operations overview for today.</p>
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
                    <div className="bx-hero-stat-val">{totalEmp}</div>
                    <div className="bx-hero-stat-lbl">Total Employees</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--green"><UserCheck size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{presentToday}</div>
                    <div className="bx-hero-stat-lbl">Present Today</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--amber"><AlertTriangle size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{pendingLeaves}</div>
                    <div className="bx-hero-stat-lbl">Pending Leaves</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--cyan"><TrendingUp size={16}/></div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{attendancePct}%</div>
                    <div className="bx-hero-stat-lbl">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon purple"><Users size={14}/></div> Total Employees</div>
                <div className="bx-kpi-val">{totalEmp}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> {totalEmp > 0 ? 'Active' : 'N/A'} <span>workforce</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><UserCheck size={14}/></div> Present Today</div>
                <div className="bx-kpi-val">{presentToday}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> {attendancePct}% <span>attendance</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon orange"><Calendar size={14}/></div> Pending Leaves</div>
                <div className="bx-kpi-val">{pendingLeaves}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> {pendingLeaves > 0 ? 'Needs approval' : 'Clear'}</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon blue"><IndianRupee size={14}/></div> Monthly Payroll</div>
                <div className="bx-kpi-val">{fmtINR(monthlyPayroll)}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> <span>this month</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon teal"><Activity size={14}/></div> Departments</div>
                <div className="bx-kpi-val">{empDist.length || 0}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> <span>active units</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon pink"><Star size={14}/></div> Inactive Staff</div>
                <div className="bx-kpi-val">{employees.filter(e => e.status === "Inactive").length}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> <span>need review</span></div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2'}}>
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Attendance Efficiency Trend</h3>
                </div>
                <div style={{height:'220px', width:'100%'}}>
                  {employeeTrend && employeeTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart 
                        data={employeeTrend.map(d => ({ ...d, target: 85 }))} 
                        margin={{top:20, right:20, bottom:5, left:0}}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} width={40}/>
                        <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}} cursor={{fill: '#f1f5f9'}} />
                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingBottom: '20px'}}/>
                        <Bar dataKey="efficiency" name="Efficiency" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="target" name="Target" stroke="#F97316" strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: '#F97316', strokeWidth: 2}} activeDot={{r: 6}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>No trend data available</div>
                  )}
                </div>
              </div>
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Attendance Split</h3>
                </div>
                <div style={{height:'220px', width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                        {["#7C3AED","#E5E7EB"].map((c,i) => <Cell key={i} fill={c}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bx-budget-stats" style={{width:'100%', marginTop:'0'}}>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#7C3AED'}}></div> Present</div>
                      <div className="val">{presentToday}</div>
                    </div>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#E5E7EB'}}></div> Absent</div>
                      <div className="val">{Math.max(0, totalEmp - presentToday)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="bx-card" style={{padding:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Links</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/attendance')}><UserCheck size={16} color="#ef4444"/> Attendance</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/payroll')}><IndianRupee size={16} color="#a855f7"/> Payroll</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/leave-management')}><Calendar size={16} color="#10b981"/> Leave Mgmt</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/hrms/add-employee')}><Briefcase size={16} color="#3b82f6"/> Recruitment</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/hr-reports')}><FileText size={16} color="#f59e0b"/> HR Reports</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/hrms')}><Users size={16} color="#14b8a6"/> Employee Data</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/team-performance')}><Star size={16} color="#f97316"/> Performance</div>
                <div className="bx-quick-link" style={{cursor:'pointer'}} onClick={() => navigate('/settings')}><Settings size={16} color="#06b6d4"/> Settings</div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop:'1rem'}}>
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Pending Leave Requests</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/leave-management'); }}>View All →</a>
                </div>
                <div>
                  {leavesData.filter(l => l.status === "Pending").slice(0,5).map((l,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:'#f59e0b'}}><Clock size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.employeeName || l.employee?.name || "Employee"}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{l.leaveType || "Leave"} — Pending Approval</p>
                      </div>
                      <div className="bx-list-meta" style={{flexShrink:0}}>
                        <span className="bx-tag high">Pending</span>
                      </div>
                    </div>
                  ))}
                  {leavesData.filter(l => l.status === "Pending").length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No pending requests</h4></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Upcoming HR Events</h3>
                </div>
                <div>
                  {upcomingEvents.length > 0 ? upcomingEvents.map((ev,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:ev.color}}><Star size={14}/></div>
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

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Department Headcount</h3>
                </div>
                <div>
                  {empDist.length > 0 ? empDist.slice(0,5).map((d,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background:['#7C3AED','#3B82F6','#22C55E','#F97316','#EF4444'][i%5]}}><Users size={14}/></div>
                      <div className="bx-list-content" style={{minWidth:0}}>
                        <h4 className="bx-list-title" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.name}</h4>
                        <p className="bx-list-desc" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{d.value} Staff</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No headcount data</h4></div>
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
                <h3 className="bx-card-title">Recent Payslips</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/payroll'); }}>View All →</a>
              </div>
              <div className="bx-tasks-list">
                {salariesData.length > 0 ? salariesData.slice(0,4).map((s,i) => (
                  <div className="bx-task-item" key={i}>
                    <div className="bx-activity-icon" style={{width:'32px', height:'32px', borderRadius:'8px', background:'#DBEAFE', color:'#3B82F6', display:'flex', alignItems:'center', justifyContent:'center', marginRight:'12px', flexShrink:0}}>
                      <FileText size={16}/>
                    </div>
                    <div className="bx-task-content">
                      <p className="bx-task-title">{s.employeeName || s.employee?.name || "Employee Payslip"}</p>
                      <p className="bx-task-sub">{s.month || "Current Month"} • {fmtINR(s.netSalary || s.basicSalary || 0)}</p>
                    </div>
                    <div style={{cursor: 'pointer', color: '#7C3AED'}} title="Download Payslip">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                  </div>
                )) : (
                  <div className="bx-task-item"><div className="bx-task-content"><p className="bx-task-title">No recent payslips</p></div></div>
                )}
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
                    <div className="bx-notif-icon" style={{background:['#10b981','#3b82f6','#ef4444','#f59e0b'][i%4]}}><Bell size={10}/></div>
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

export default HRDashboard;
