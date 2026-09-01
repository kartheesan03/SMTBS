import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import { useAiInsights } from "../hooks/useAiInsights";
import { 
  Users, ArrowUpRight, ArrowDownRight, Package, Truck, Clock, RefreshCw, Bell,
  FileText, Briefcase, UserPlus, Database, Search, Filter, MessageSquare, Plus, CheckCircle, 
  Calendar, Cloud, Activity, HardHat, Settings, HelpCircle, ArrowRight, Home, CreditCard, 
  Layers, TrendingUp, Zap, ChevronDown, AlertTriangle
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  BarChart, Bar, AreaChart, Area, ComposedChart, Legend
} from "recharts";
import "../components/AdminDashboard/DashboardLayout.css";
import LiveOrganizationWidget from '../components/AdminDashboard/LiveOrganizationWidget';
import SystemHealthMonitorWidget from '../components/AdminDashboard/SystemHealthMonitorWidget';
import OrderFinancesWidget from '../components/AdminDashboard/OrderFinancesWidget';
import { LoadingState, ErrorState } from "../components/DataStates";


const greeting = () => { const h=new Date().getHours(); if(h<12)return"Good Morning"; if(h<17)return"Good Afternoon"; if(h<21)return"Good Evening"; return"Good Night"; };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '0.85rem' }}>{label}</p>
        {payload.map((entry, index) => {
          const isOrderCount = entry.name.includes('Orders');
          return (
            <div key={index} style={{ color: entry.color, fontSize: '0.8rem', margin: '4px 0', display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
              <span>
                <span style={{display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: entry.color, marginRight: '6px'}}></span>
                {entry.name}: <strong>{isOrderCount ? entry.value : `₹${entry.value.toLocaleString()}`}</strong>
              </span>
              {!isOrderCount && (
                <span style={{color: '#64748b', fontSize: '0.75rem'}}>
                  ({entry.payload[`${entry.dataKey}Orders`] || 0} orders)
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const fmtINR = (v) => {
  if (!v && v !== 0) return "₹0";
  const abs = Math.abs(v);
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(2)} L`;
  return `₹${abs.toLocaleString('en-IN')}`;
};

const fmtTime = (iso) => new Date(iso).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: dashboardData, loading, error } = useDashboardData();
  const { aiInsights, loading: aiLoading } = useAiInsights();

  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState({ temp: '28°C', condition: 'Partly Cloudy' });

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

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
          else if (w.weathercode >= 71 && w.weathercode <= 77) cond = 'Snow';
          else if (w.weathercode >= 80 && w.weathercode <= 82) cond = 'Rain Showers';
          else if (w.weathercode >= 95) cond = 'Thunderstorm';
          setWeather({ temp: `${Math.round(w.temperature)}°C`, condition: cond });
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        (err) => fetchWeather(28.61, 77.21)
      );
    } else {
      fetchWeather(28.61, 77.21);
    }
  }, []);

  if (loading) return <LoadingState message="Loading dashboard…" height="100vh" />;
  if (error)   return <ErrorState message="Failed to load dashboard." height="100vh" />;

  const s = dashboardData?.stats || {};
  const tables = dashboardData?.tables || {};
  
  // Real ERP data mapped to BuildAxis concepts
  const totalProjects = s.totalOrders || 0; 
  const completedProjects = s.totalOrders ? s.totalOrders - (s.activeOrdersCount || 0) : 0;
  const delayedProjects = tables.lowStock?.length || 0;
  const ongoingActivities = s.totalMaterials || 0;
  const pendingApprovals = (s.totalCustomers || 0);
  const attendancePct = Math.round((s.presentToday || 0) / (s.totalEmployees || 1) * 100) || 0;

  const budgetUtil = dashboardData?.charts?.erpDonut || [];

  // Map analytics charts
  const trendRaw = dashboardData?.analytics?.trendData || dashboardData?.charts?.monthlyStats || dashboardData?.charts?.monthlyRevenue || [];

  const timelineData = trendRaw.map((d) => ({
    name: d.name || d.month || 'Month',
    revenue: d.revenue || 0,
    sales: d.sales || 0,
    purchase: d.purchase || d.purchases || d.expenses || 0,
    revenueOrders: d.revenueOrders || d.orders || d.totalOrders || 0,
    salesOrders: d.salesOrders || d.salesCount || d.sales || 0,
    purchaseOrders: d.purchaseOrders || d.purchaseCount || d.purchase || 0,
  }));

  // Site-wise Performance (mapped from top selling materials)
  let siteM = tables.topSellingMaterials || tables.topMaterials || [];

  const sitePerformance = siteM.slice(0, 4).map((m, i) => ({
    site: m.name,
    location: m.category || "General",
    progress: m.progress || 0,
    color: m.color || ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][i%4]
  }));

  // Lists
  const recentUpdates = (tables.recentActivity || []).slice(0, 4);
  const criticalAlerts = (tables.lowStock || []).slice(0, 4);
  const deadlines = (tables.recentActivity || []).slice(4, 8); 
  const notifications = (tables.notifications || []).slice(0, 4);
  const recentOrders = (tables.recentOrders || []).slice(0, 4);
  const topMaterials = (tables.topSellingMaterials || []).slice(0, 4);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', weekday: 'long'});

  // Generate dynamic calendar for current month
  const calendarDays = [];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0
  
  for(let i=0; i<startOffset; i++) calendarDays.push(<div key={`empty-${i}`} className="bx-cal-day" style={{color:'transparent'}}>-</div>);
  for(let i=1; i<=daysInMonth; i++) {
    const isToday = i === today.getDate();
    calendarDays.push(<div key={`day-${i}`} className={`bx-cal-day ${isToday ? 'active' : ''}`}>{i}</div>);
  }

  return (
    <div className="bx-layout">
      

      {/* MAIN CONTENT */}
      <div className="bx-main-wrapper">


        <div className="bx-content-scroll">
          <div className="bx-center-col">
            
            {/* HERO */}
            <div className="bx-hero">
              {/* Subtle decorative ring */}
              <div className="bx-hero-ring bx-hero-ring-1"/>
              <div className="bx-hero-ring bx-hero-ring-2"/>

              {/* LEFT: existing greeting text */}
              <div className="bx-hero-text" style={{zIndex:2}}>
                <h1>{greeting()}, {user?.name?.split(' ')[0] || user?.firstName || 'Admin'}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's what's happening across your projects today.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.6rem', marginTop:'1.2rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                    <Calendar size={15} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'8px', alignItems:'center', color:'#f8fafc', fontWeight:'500', fontSize:'0.88rem'}}>
                      <Cloud size={15} color="#93c5fd"/> {weather.temp} <span style={{color:'#cbd5e1', fontSize:'0.75rem', fontWeight:'normal'}}>{weather.condition}</span>
                    </div>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.88rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor: '#34d399'}}></span> Live Data
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: stat pills */}
              <div className="bx-hero-stats">
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--purple">
                    <Briefcase size={16}/>
                  </div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{totalProjects}</div>
                    <div className="bx-hero-stat-lbl">Active Projects</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--green">
                    <CheckCircle size={16}/>
                  </div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{completedProjects}</div>
                    <div className="bx-hero-stat-lbl">Completed</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--amber">
                    <Clock size={16}/>
                  </div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{delayedProjects}</div>
                    <div className="bx-hero-stat-lbl">Delayed</div>
                  </div>
                </div>
                <div className="bx-hero-stat">
                  <div className="bx-hero-stat-icon bx-hero-stat-icon--cyan">
                    <FileText size={16}/>
                  </div>
                  <div className="bx-hero-stat-body">
                    <div className="bx-hero-stat-val">{pendingApprovals}</div>
                    <div className="bx-hero-stat-lbl">Pending Approvals</div>
                  </div>
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
            <div className="bx-charts-row" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
              <OrderFinancesWidget />
            </div>

            {/* QUICK LINKS */}
            <div className="bx-card" style={{padding:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Links</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/projects')}><Briefcase size={16} color="#3b82f6"/> Projects</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/crm/customers')}><Users size={16} color="#10b981"/> Customers</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/vendors')}><HardHat size={16} color="#6366f1"/> Vendors</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/materials')}><Package size={16} color="#f59e0b"/> Materials</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/erp/purchase')}><CreditCard size={16} color="#3b82f6"/> Purchase Orders</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/finance')}><Layers size={16} color="#10b981"/> Budget</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/analytics')}><FileText size={16} color="#ec4899"/> Reports</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={() => navigate('/hrms')}><Users size={16} color="#3b82f6"/> Employee Data</div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem'}}>
              <div className="bx-card">
                 <div className="bx-card-header">
                  <h3 className="bx-card-title">System Audit Log</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/settings/audit-logs'); }}>View All →</a>
                </div>
                <div>
                  {recentUpdates.length > 0 ? recentUpdates.map((u,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: ['#10b981','#3b82f6','#f59e0b','#ef4444'][i%4]}}><CheckCircle size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.type || "Audit Action"}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.text || "System Update"}</p>
                      </div>
                      <div className="bx-list-meta" style={{ whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
                        <p className="bx-list-meta-top">{u.time ? new Date(u.time).toLocaleDateString('en-GB', {month:'short', day:'numeric'}) : "Today"}</p>
                        <p className="bx-list-meta-bottom">{u.time ? new Date(u.time).toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true}) : ""}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No recent updates</h4></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bx-card">
                 <div className="bx-card-header">
                  <h3 className="bx-card-title">Critical Issue Alerts</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/materials'); }}>View All →</a>
                </div>
                <div>
                  {criticalAlerts.length > 0 ? criticalAlerts.map((a,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{color: '#ef4444', background:'transparent'}}><AlertTriangle size={18}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Low Stock: {a.name}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Current stock: {a.quantity || 0} {a.unit || 'units'}</p>
                      </div>
                      <div className="bx-list-meta" style={{ flexShrink: 0 }}>
                        <span className="bx-tag high">High</span>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No critical alerts</h4></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bx-card">
                 <div className="bx-card-header">
                  <h3 className="bx-card-title">Upcoming Deadlines</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/projects'); }}>View All →</a>
                </div>
                <div>
                  {deadlines.length > 0 ? deadlines.map((d,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{color: '#3b82f6', background:'transparent'}}><Calendar size={18}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.type || "Action Required"}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.text || "Pending task"}</p>
                      </div>
                      <div className="bx-list-meta" style={{ whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}>
                        <p className="bx-list-meta-top" style={{color:'#ef4444'}}>{d.time ? new Date(d.time).toLocaleDateString('en-GB', {month:'short', day:'numeric'}) : "Soon"}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No upcoming deadlines</h4></div>
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
                <h3 className="bx-card-title">Recent Orders</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/erp/purchase'); }}>View All →</a>
              </div>
              <div className="bx-tasks-list">
                {recentOrders.length > 0 ? recentOrders.map((o,i) => (
                  <div className="bx-task-item" key={i}>
                    <div className="bx-task-cb"></div>
                    <div className="bx-task-content"><p className="bx-task-title">{o.orderNumber || "Order"}</p><p className="bx-task-sub">₹{(o.totalAmount || 0).toLocaleString('en-IN')}</p></div>
                    <span className={`bx-tag ${o.status === 'Completed' || o.status === 'Delivered' ? 'low' : 'medium'}`}>{o.status}</span>
                  </div>
                )) : (
                  <div className="bx-task-item"><div className="bx-task-content"><p className="bx-task-title">No recent orders</p></div></div>
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
                    <div className="bx-notif-icon" style={{background: ['#10b981','#3b82f6','#ef4444','#f59e0b'][i%4]}}><Bell size={10}/></div>
                    <div className="bx-task-content"><p className="bx-task-title">{n.text}</p></div>
                    <span style={{fontSize:'0.65rem', color:'var(--bx-text-muted)', whiteSpace: 'nowrap'}}>{n.time ? new Date(n.time).toLocaleTimeString(undefined, {hour:'2-digit', minute:'2-digit'}) : 'Recent'}</span>
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

export default AdminDashboard;
