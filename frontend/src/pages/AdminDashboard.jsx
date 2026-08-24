import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { 
  Calendar as CalIcon, Bell, Search, Plus, User, CheckCircle, AlertTriangle, 
  Clock, Activity, FileText, Settings, HelpCircle, HardHat, Package, 
  Briefcase, ArrowRight, Home, CreditCard, Layers, TrendingUp, Zap, Calendar, ChevronDown,
  ArrowUpRight, ArrowDownRight, Users, Cloud
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  BarChart, Bar
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import { LoadingState, ErrorState } from "../components/DataStates";

const fmtINR = (v) => {
  if (!v && v !== 0) return "₹0";
  const abs = Math.abs(v);
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(2)} L`;
  return `₹${abs.toLocaleString('en-IN')}`;
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { data: dashboardData, loading, error } = useDashboardData();

  if (loading) return <LoadingState message="Loading dashboard…" height="100vh" />;
  if (error)   return <ErrorState message="Failed to load dashboard." height="100vh" />;

  const s = dashboardData?.stats || {};
  const tables = dashboardData?.tables || {};
  
  // Real ERP data mapped to BuildAxis concepts
  const totalProjects = s.totalOrders || 24; 
  const completedProjects = (s.totalOrders ? Math.floor(s.totalOrders * 0.25) : 6);
  const delayedProjects = tables.lowStock?.length || 3;
  const ongoingActivities = s.totalMaterials || 128;
  const pendingApprovals = (s.totalCustomers || 18);
  const attendancePct = Math.round((s.presentToday || 0) / (s.totalEmployees || 1) * 100) || 87;

  // Chart Data mappings
  const budgetUtil = [
    { name: 'Utilized', value: 65.70, color: '#3b82f6' },
    { name: 'Committed', value: 32.30, color: '#f59e0b' },
    { name: 'Balance', value: 17.80, color: '#ef4444' }
  ];

  // Map analytics charts
  const timelineData = (dashboardData?.charts?.monthlyRevenue || []).map((d, i) => ({
    name: ['Jan','Feb','Mar','Apr','May','Jun'][i] || 'Month',
    planned: (d.revenue || 0) + 1000,
    actual: d.revenue || 0,
    forecast: (d.revenue || 0) + 500
  })).slice(0, 6);
  if (timelineData.length === 0) {
    timelineData.push({name: 'Jan', planned: 20, actual: 10, forecast: 15});
    timelineData.push({name: 'Feb', planned: 40, actual: 20, forecast: 30});
    timelineData.push({name: 'Mar', planned: 60, actual: 40, forecast: 45});
    timelineData.push({name: 'Apr', planned: 80, actual: 55, forecast: 65});
  }

  // Site-wise Performance (mapped from top materials)
  const sitePerformance = (tables.topMaterials || []).slice(0, 4).map((m, i) => ({
    site: m.name,
    location: m.category || "Warehouse",
    progress: Math.floor(Math.random() * 40) + 40,
    color: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][i%4]
  }));
  if (sitePerformance.length === 0) {
    sitePerformance.push({site: "Greenfield Residences", location: "Bangalore", progress: 72, color: "#10b981"});
    sitePerformance.push({site: "Skyline Towers", location: "Mumbai", progress: 58, color: "#f59e0b"});
    sitePerformance.push({site: "TechX IT Park", location: "Hyderabad", progress: 65, color: "#3b82f6"});
    sitePerformance.push({site: "Riverfront Villas", location: "Pune", progress: 41, color: "#ef4444"});
  }

  // Lists
  const recentUpdates = (tables.recentActivity || []).slice(0, 4);
  const criticalAlerts = (tables.lowStock || []).slice(0, 4);
  const deadlines = (tables.recentActivity || []).slice(4, 8); // Just dummy mapping for now to show lists

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', weekday: 'long'});

  return (
    <div className="bx-layout">
      

      {/* MAIN CONTENT */}
      <div className="bx-main-wrapper">


        <div className="bx-content-scroll">
          <div className="bx-center-col">
            
            {/* HERO */}
            <div className="bx-hero">
              <div className="bx-hero-text">
                <h1>Good morning, {user?.name?.split(' ')[0] || 'Karthick'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's what's happening across your projects today.</p>
                
                    <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem', marginTop:'1.5rem'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--bx-text-dark)', fontWeight:'500', fontSize:'0.9rem'}}>
                  <Calendar size={16} color="var(--bx-primary)"/> Monday, 24 Aug 2026
                </div>
                <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                  <div style={{display:'flex', gap:'8px', alignItems:'center', color:'var(--bx-text-dark)', fontWeight:'500', fontSize:'0.9rem'}}>
                    <Cloud size={16} color="#1e293b"/> 28°C <span style={{color:'var(--bx-text-muted)', fontSize:'0.8rem', fontWeight:'normal'}}>Partly Cloudy</span>
                  </div>
                  <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#10b981', fontSize:'0.9rem', fontWeight:'500'}}>
                    <span className="bx-status-dot"></span> Live Data
                  </div>
                </div>
              </div>
              </div>
              
              {/* Fake illustration placeholder */}
              <div className="bx-hero-illustration">
                {/* Normally an image here */}
              </div>

              <div className="bx-hero-card">
                <div style={{position:'relative', width:'60px', height:'60px', flexShrink: 0, minWidth: '60px'}}>
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{value:78, color:'#3b82f6'}, {value:22, color:'#e2e8f0'}]} 
                           dataKey="value" innerRadius={22} outerRadius={30} startAngle={90} endAngle={-270} stroke="none">
                        {[{color:'#3b82f6'}, {color:'#e2e8f0'}].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', fontWeight:'bold', fontSize:'1.1rem'}}>78</div>
                </div>
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'4px', fontSize:'0.75rem', fontWeight:'600', color:'#3b82f6', marginBottom:'4px'}}>
                    <Zap size={12}/> AI Project Insights
                  </div>
                  <h3>Project Success Probability</h3>
                  <p>Good chance of on-time delivery</p>
                  <a href="#">View Full AI Analysis →</a>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon blue"><Briefcase size={14}/></div> Total Active Projects</div>
                <div className="bx-kpi-val">{totalProjects}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> 8% <span>vs last month</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><CheckCircle size={14}/></div> Completed Projects</div>
                <div className="bx-kpi-val">{completedProjects}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> 20% <span>vs last month</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon orange"><Clock size={14}/></div> Delayed Projects</div>
                <div className="bx-kpi-val">{delayedProjects}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> 2 <span>vs last month</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><Activity size={14}/></div> Ongoing Site Activities</div>
                <div className="bx-kpi-val">{ongoingActivities}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> 15% <span>vs yesterday</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon orange"><FileText size={14}/></div> Pending Approvals</div>
                <div className="bx-kpi-val">{pendingApprovals}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> 5% <span>vs yesterday</span></div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon purple"><Users size={14}/></div> Labor Attendance</div>
                <div className="bx-kpi-val">{attendancePct}%</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> 6% <span>vs yesterday</span></div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="bx-charts-row">
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Budget Utilization Overview</h3>
                </div>
                <div style={{height:'140px', position:'relative'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={budgetUtil} dataKey="value" innerRadius={50} outerRadius={65} stroke="none">
                        {budgetUtil.map((e,i) => <Cell key={i} fill={e.color}/>)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center'}}>
                    <div style={{fontSize:'1.5rem', fontWeight:'bold'}}>68%</div>
                    <div style={{fontSize:'0.7rem', color:'var(--bx-text-muted)'}}>Utilized</div>
                  </div>
                </div>
                <div className="bx-budget-stats">
                  {budgetUtil.map(b => (
                    <div className="bx-budget-row" key={b.name}>
                      <div className="label"><div className="dot" style={{background:b.color}}></div> {b.name}</div>
                      <div className="val">₹{b.value} Cr</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:'auto', textAlign:'center', paddingTop:'10px'}}>
                  <div className="bx-kpi-trend up" style={{justifyContent:'center', marginBottom:'10px'}}><ArrowUpRight size={12}/> 6% vs last month</div>
                  <a href="#" className="bx-card-link">View Budget Report →</a>
                </div>
              </div>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Project Timeline Progress</h3>
                  <div style={{fontSize:'0.7rem', color:'var(--bx-text-muted)', display:'flex', gap:'10px'}}>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}><div style={{width:'8px',height:'2px',background:'#3b82f6'}}></div> Planned</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}><div style={{width:'8px',height:'2px',background:'#10b981'}}></div> Actual</span>
                    <span style={{display:'flex', alignItems:'center', gap:'4px'}}><div style={{width:'8px',height:'2px',background:'#f59e0b', borderTop:'2px dashed #f59e0b'}}></div> Forecast</span>
                  </div>
                </div>
                <div style={{flex: 1, minHeight: '180px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{top:5, right:5, left:-20, bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill:'#94a3b8'}} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} dot={{r:3}} />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                      <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{r:3}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Site-wise Performance</h3>
                  <a href="#" className="bx-card-link">View All →</a>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'1rem', marginTop:'10px'}}>
                  {sitePerformance.map((site, i) => (
                    <div key={i} style={{display:'flex', gap:'10px', alignItems:'center'}}>
                      <div style={{width:'32px', height:'32px', borderRadius:'6px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <HardHat size={16} color={site.color}/>
                      </div>
                      <div style={{flex: 1}}>
                        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem'}}>
                          <span style={{fontWeight:'600'}}>{site.site}</span>
                          <span>{site.progress}%</span>
                        </div>
                        <div style={{fontSize:'0.65rem', color:'var(--bx-text-muted)', marginBottom:'4px'}}>{site.location}</div>
                        <div style={{width:'100%', height:'4px', background:'#e2e8f0', borderRadius:'2px'}}>
                          <div style={{width:`${site.progress}%`, height:'100%', background:site.color, borderRadius:'2px'}}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="bx-card" style={{padding:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Links</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link"><Briefcase size={16} color="#3b82f6"/> Projects</div>
                <div className="bx-quick-link"><Activity size={16} color="#10b981"/> Site Progress</div>
                <div className="bx-quick-link"><HardHat size={16} color="#6366f1"/> Contractors</div>
                <div className="bx-quick-link"><Package size={16} color="#f59e0b"/> Materials</div>
                <div className="bx-quick-link"><CreditCard size={16} color="#3b82f6"/> Purchase Orders</div>
                <div className="bx-quick-link"><Layers size={16} color="#10b981"/> Budget</div>
                <div className="bx-quick-link"><FileText size={16} color="#ec4899"/> Reports</div>
                <div className="bx-quick-link"><Zap size={16} color="#3b82f6"/> AI Insights</div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem'}}>
              <div className="bx-card">
                 <div className="bx-card-header">
                  <h3 className="bx-card-title">Recent Project Updates</h3>
                  <a href="#" className="bx-card-link">View All →</a>
                </div>
                <div>
                  {recentUpdates.length > 0 ? recentUpdates.map((u,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: ['#10b981','#3b82f6','#f59e0b','#ef4444'][i%4]}}><CheckCircle size={14}/></div>
                      <div className="bx-list-content">
                        <h4 className="bx-list-title">{u.title || "Project Update"}</h4>
                        <p className="bx-list-desc">{u.user || "System"}</p>
                      </div>
                      <div className="bx-list-meta">
                        <p className="bx-list-meta-top">Today</p>
                        <p className="bx-list-meta-bottom">10:30 AM</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-icon" style={{background: '#10b981'}}><CheckCircle size={14}/></div>
                      <div className="bx-list-content"><h4 className="bx-list-title">Skyline Towers - Tower A</h4><p className="bx-list-desc">Concrete pouring completed</p></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bx-card">
                 <div className="bx-card-header">
                  <h3 className="bx-card-title">Critical Issue Alerts</h3>
                  <a href="#" className="bx-card-link">View All →</a>
                </div>
                <div>
                  {criticalAlerts.length > 0 ? criticalAlerts.map((a,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{color: '#ef4444', background:'transparent'}}><AlertTriangle size={18}/></div>
                      <div className="bx-list-content">
                        <h4 className="bx-list-title">Low Stock: {a.name}</h4>
                        <p className="bx-list-desc">Check inventory immediately</p>
                      </div>
                      <div className="bx-list-meta">
                        <span className="bx-tag high">High</span>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-icon" style={{color: '#ef4444', background:'transparent'}}><AlertTriangle size={18}/></div>
                      <div className="bx-list-content"><h4 className="bx-list-title">Delay in Steel Delivery</h4><p className="bx-list-desc">Skyline Towers</p></div>
                      <div className="bx-list-meta"><span className="bx-tag high">High</span></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bx-card">
                 <div className="bx-card-header">
                  <h3 className="bx-card-title">Upcoming Deadlines</h3>
                  <a href="#" className="bx-card-link">View All →</a>
                </div>
                <div>
                   <div className="bx-list-item">
                      <div className="bx-list-icon" style={{color: '#3b82f6', background:'transparent'}}><Calendar size={18}/></div>
                      <div className="bx-list-content"><h4 className="bx-list-title">Structural Completion</h4><p className="bx-list-desc">Skyline Towers - Tower A</p></div>
                      <div className="bx-list-meta"><p className="bx-list-meta-top" style={{color:'#ef4444'}}>28 May 2026</p><p className="bx-list-meta-bottom">8 Days Left</p></div>
                    </div>
                    <div className="bx-list-item">
                      <div className="bx-list-icon" style={{color: '#3b82f6', background:'transparent'}}><Calendar size={18}/></div>
                      <div className="bx-list-content"><h4 className="bx-list-title">MEP Rough-in</h4><p className="bx-list-desc">TechX IT Park</p></div>
                      <div className="bx-list-meta"><p className="bx-list-meta-top">05 Jun 2026</p><p className="bx-list-meta-bottom">16 Days Left</p></div>
                    </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="bx-right-col">
            
            <div className="bx-card bx-calendar">
              <div className="bx-cal-header">
                <span className="bx-cal-title">Calendar</span>
                <span className="bx-cal-month">May 2026 &gt;</span>
              </div>
              <div className="bx-cal-grid">
                <div className="bx-cal-day-name">MON</div><div className="bx-cal-day-name">TUE</div><div className="bx-cal-day-name">WED</div><div className="bx-cal-day-name">THU</div><div className="bx-cal-day-name">FRI</div><div className="bx-cal-day-name">SAT</div><div className="bx-cal-day-name">SUN</div>
                <div className="bx-cal-day" style={{color:'#cbd5e1'}}>27</div><div className="bx-cal-day" style={{color:'#cbd5e1'}}>28</div><div className="bx-cal-day" style={{color:'#cbd5e1'}}>29</div><div className="bx-cal-day" style={{color:'#cbd5e1'}}>30</div><div className="bx-cal-day">1</div><div className="bx-cal-day">2</div><div className="bx-cal-day">3</div>
                <div className="bx-cal-day">4</div><div className="bx-cal-day">5</div><div className="bx-cal-day">6</div><div className="bx-cal-day">7</div><div className="bx-cal-day">8</div><div className="bx-cal-day">9</div><div className="bx-cal-day">10</div>
                <div className="bx-cal-day">11</div><div className="bx-cal-day">12</div><div className="bx-cal-day">13</div><div className="bx-cal-day">14</div><div className="bx-cal-day">15</div><div className="bx-cal-day">16</div><div className="bx-cal-day">17</div>
                <div className="bx-cal-day">18</div><div className="bx-cal-day">19</div><div className="bx-cal-day active">20</div><div className="bx-cal-day">21</div><div className="bx-cal-day">22</div><div className="bx-cal-day">23</div><div className="bx-cal-day">24</div>
                <div className="bx-cal-day">25</div><div className="bx-cal-day">26</div><div className="bx-cal-day">27</div><div className="bx-cal-day">28</div><div className="bx-cal-day">29</div><div className="bx-cal-day">30</div><div className="bx-cal-day">31</div>
              </div>
            </div>

            <div className="bx-card">
              <div className="bx-card-header">
                <h3 className="bx-card-title">My Tasks</h3>
                <a href="#" className="bx-card-link">View All →</a>
              </div>
              <div className="bx-tasks-list">
                <div className="bx-task-item">
                  <div className="bx-task-cb"></div>
                  <div className="bx-task-content"><p className="bx-task-title">Review RFI - #RFI-245</p><p className="bx-task-sub">Skyline Towers</p></div>
                  <span className="bx-tag high">High</span>
                </div>
                <div className="bx-task-item">
                  <div className="bx-task-cb"></div>
                  <div className="bx-task-content"><p className="bx-task-title">Approve Material Request</p><p className="bx-task-sub">Greenfield Residences</p></div>
                  <span className="bx-tag medium">Medium</span>
                </div>
                <div className="bx-task-item">
                  <div className="bx-task-cb"></div>
                  <div className="bx-task-content"><p className="bx-task-title">Site Inspection Report</p><p className="bx-task-sub">TechX IT Park</p></div>
                  <span className="bx-tag medium">Medium</span>
                </div>
                <div className="bx-task-item">
                  <div className="bx-task-cb"></div>
                  <div className="bx-task-content"><p className="bx-task-title">Update Weekly Progress</p><p className="bx-task-sub">Riverfront Villas</p></div>
                  <span className="bx-tag low">Low</span>
                </div>
              </div>
            </div>

            <div className="bx-card">
              <div className="bx-card-header">
                <h3 className="bx-card-title">Notifications</h3>
                <a href="#" className="bx-card-link">View All →</a>
              </div>
              <div className="bx-notifs-list">
                <div className="bx-notif-item">
                  <div className="bx-notif-icon" style={{background:'#10b981'}}><CheckCircle size={10}/></div>
                  <div className="bx-task-content"><p className="bx-task-title">Material order #PO-3891 approved</p></div>
                  <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)'}}>10:45 AM</span>
                </div>
                <div className="bx-notif-item">
                  <div className="bx-notif-icon" style={{background:'#3b82f6'}}><Activity size={10}/></div>
                  <div className="bx-task-content"><p className="bx-task-title">RFI #RFI-245 requires your review</p></div>
                  <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)'}}>09:30 AM</span>
                </div>
                <div className="bx-notif-item">
                  <div className="bx-notif-icon" style={{background:'#ef4444'}}><AlertTriangle size={10}/></div>
                  <div className="bx-task-content"><p className="bx-task-title">Delay predicted in Tower B</p></div>
                  <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)'}}>Yesterday</span>
                </div>
              </div>
            </div>

            {/* AI Assistant Widget */}
            <div className="bx-ai-widget">
              <div className="bx-ai-header">
                <div style={{width:'24px', height:'24px', background:'#1d4ed8', color:'white', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center'}}>B</div>
                BuildAxis AI Assistant <span style={{fontSize:'10px', background:'white', color:'#3b82f6', padding:'2px 4px', borderRadius:'4px', fontWeight:'normal'}}>Beta</span>
              </div>
              <div className="bx-ai-body">
                <p className="bx-ai-msg">Hi {user?.name?.split(' ')[0] || 'Raj'}! How can I help you today?</p>
                <div className="bx-ai-chips">
                  <div className="bx-ai-chip">Project status summary</div>
                  <div className="bx-ai-chip">Budget variance analysis</div>
                  <div className="bx-ai-chip">Delay prediction</div>
                  <div className="bx-ai-chip">Ask anything...</div>
                </div>
                <div className="bx-ai-input">
                  <input type="text" placeholder="Type your question..." />
                  <button className="bx-ai-btn"><ArrowRight size={14}/></button>
                </div>
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

export default AdminDashboard;
