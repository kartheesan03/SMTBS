import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  Users, IndianRupee, Calendar, UserCheck, AlertTriangle, Activity,
  FileText, Plus, Settings, TrendingUp, TrendingDown, ArrowRight,
  Briefcase, Bell, Clock, Star, Moon, ChevronDown, ArrowUpRight, ArrowDownRight, Cloud
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, BarChart, Bar
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState } from "../components/DataStates";
import OperationalIntelligenceWidget from '../components/AdminDashboard/OperationalIntelligenceWidget';

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
  const chartData    = trendRaw.map(d=>({name:d.name,employees:d.employees||0}));
  const employeeTrend = dashboardData?.analytics?.employeeTrend || [];
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
                <h1>Good morning, {user?.name?.split(' ')[0] || 'HR Manager'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your people & HR operations overview for today.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem', marginTop:'1.5rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.9rem'}}>
                    <Calendar size={16} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.9rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor: '#34d399'}}></span> All Systems Operational
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon purple"><Users size={14}/></div> Total Employees</div>
                <div className="bx-kpi-val">{totalEmp}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> {totalEmp > 0 ? 'Active' : 'N/A'}</div>
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
            </div>


            {/* QUICK LINKS */}
            <div className="bx-card" style={{marginBottom:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Links</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/attendance')}><UserCheck size={16} color="#ef4444"/> Attendance</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/payroll')}><IndianRupee size={16} color="#a855f7"/> Payroll</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/leave-management')}><Calendar size={16} color="#10b981"/> Leave Mgmt</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/hrms/add-employee')}><Briefcase size={16} color="#3b82f6"/> Recruitment</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/hr-reports')}><FileText size={16} color="#f59e0b"/> HR Reports</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/hrms')}><Users size={16} color="#14b8a6"/> Employee Data</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/team-performance')}><Star size={16} color="#f97316"/> Performance</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/settings')}><Settings size={16} color="#06b6d4"/> Settings</div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2'}}>
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Attendance Trend</h3>
                </div>
                <div style={{height:'220px', width:'100%'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={employeeTrend} margin={{top:5, right:20, bottom:5, left:0}}>
                      <defs>
                        <linearGradient id="hrColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} width={40}/>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                      <Area type="monotone" dataKey="efficiency" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#hrColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
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
                        {["#7C3AED","#E5E7EB"].map((c,i)=><Cell key={i} fill={c}/>)}
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
                      <div className="val">{Math.max(0,totalEmp-presentToday)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop: '1rem'}}>
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Pending Leave Requests</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/hr/leave'); }}>View All →</a>
                </div>
                <div>
                  {leavesData.filter(l=>l.status==="Pending").slice(0,5).map((l,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: '#f59e0b'}}><Clock size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.employeeName||l.employee?.name||"Employee"}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pending Approval</p>
                      </div>
                    </div>
                  ))}
                  {leavesData.filter(l=>l.status==="Pending").length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No pending requests</h4></div>
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
                      <div className="bx-list-icon" style={{background: ev.color}}><Star size={14}/></div>
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

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Department Headcount</h3>
                </div>
                <div>
                  {empDist.length>0 ? empDist.slice(0,5).map((d,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: ['#7C3AED','#3B82F6','#22C55E','#F97316','#EF4444'][i%5]}}><Users size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.value} Staff</p>
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
                <h3 className="bx-card-title">Recent HR Activity</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/settings/audit-logs'); }}>View All →</a>
              </div>
              <div className="bx-tasks-list">
                {recentActivity.length > 0 ? recentActivity.slice(0,4).map((a,i) => {
                    const lo=(a.text||"").toLowerCase();
                    let ActIcon=Activity,bg="#F5F3FF",col="#7C3AED";
                    if(lo.includes("leave"))      {ActIcon=Calendar;col="#D97706";}
                    else if(lo.includes("hire")||lo.includes("employee")){ActIcon=Users;col="#22C55E";}
                    else if(lo.includes("payroll")){ActIcon=IndianRupee;col="#3B82F6";}
                    return (
                      <div className="bx-task-item" key={i}>
                        <div className="bx-activity-icon" style={{width: '32px', height: '32px', borderRadius: '8px', background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0}}><ActIcon size={16}/></div>
                        <div className="bx-task-content">
                          <p className="bx-task-title">
                            {String(a.type).trim().toLowerCase() === 'info' ? (a.text?.match(/\(([^)]+)\)/)?.[1] ? `${a.text.match(/\(([^)]+)\)/)[1]} Activity` : "System Activity") : (a.type || "HR Activity")}
                          </p>
                          <p className="bx-task-sub">{a.text}</p>
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
                    <div className="bx-notif-icon" style={{background: ['#10b981','#3b82f6','#ef4444','#f59e0b'][i%4]}}><Bell size={10}/></div>
                    <div className="bx-task-content"><p className="bx-task-title">{n.text}</p></div>
                    <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)', whiteSpace: 'nowrap'}}>{n.time ? new Date(n.time).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'}) : 'Recent'}</span>
                  </div>
                )) : (
                  <div className="bx-notif-item"><div className="bx-task-content"><p className="bx-task-title">No notifications</p></div></div>
                )}
              </div>
            </div>

            <OperationalIntelligenceWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
