import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  Package, Truck, CheckCircle, Store, IndianRupee, Clock,
  ShoppingBag, FileText, User, TrendingUp, TrendingDown, ExternalLink,
  Tag, Bell, ArrowRight, Activity, AlertTriangle, Calendar, ChevronDown, ArrowUpRight, ArrowDownRight, Plus, Settings
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

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { vendorProfile: profile, vendorMaterials: materials, vendorOrders: orders } = useContext(AppInitContext);
  const [now, setNow] = useState(new Date());

  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);


  const activePOs   = orders.filter(o=>!["Completed","Delivered","Cancelled"].includes(o.status)).length;
  const pendingDel  = orders.filter(o=>o.status==="Shipped"||o.status==="Processing").length;
  const totalMat    = materials.length;
  const revenue     = orders.filter(o=>o.status==="Delivered"||o.status==="Completed").reduce((s,o)=>s+(o.totalAmount||o.amount||0),0);

  const monthlyCounts = new Array(12).fill(0);
  orders.forEach(o => {
    if(o.createdAt || o.date) {
      const m = new Date(o.createdAt || o.date).getMonth();
      monthlyCounts[m]++;
    }
  });
  const allMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const orderTrend = allMonths.map((m, i) => ({ name: m, orders: monthlyCounts[i] }));
  const statusData  = [
    {name:"Pending",  value:orders.filter(o=>o.status==="Pending").length},
    {name:"Processing",value:orders.filter(o=>o.status==="Processing").length},
    {name:"Delivered", value:orders.filter(o=>o.status==="Delivered").length},
    {name:"Cancelled", value:orders.filter(o=>o.status==="Cancelled").length},
  ];

  const fallbackAiInsights=[
    activePOs>0   && `${activePOs} active purchase order${activePOs!==1?"s":""} require attention.`,
    pendingDel>0  && `${pendingDel} shipment${pendingDel!==1?"s":""} pending delivery confirmation.`,
    revenue>0     && `Total revenue from fulfilled orders: ${fmtINR(revenue)}.`,
    totalMat>0    && `${totalMat} material${totalMat!==1?"s":""} in your product catalog.`,
    `Keep material information updated for faster order processing.`,
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
                <h1>Good morning, {profile?.name||user?.name?.split(' ')[0]||"Vendor"}! <span style={{fontSize:'1.5rem', display:'inline-block'}}>👋</span></h1>
                <p>Here's your vendor portal overview.</p>
                <div className="bx-hero-meta" style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'1rem', marginTop:'1.5rem'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', color:'#f8fafc', fontWeight:'500', fontSize:'0.9rem'}}>
                    <Calendar size={16} color="#93c5fd"/> {dateStr}
                  </div>
                  <div style={{display:'flex', gap:'1.5rem', alignItems:'center'}}>
                    <div style={{display:'flex', gap:'6px', alignItems:'center', color:'#34d399', fontSize:'0.9rem', fontWeight:'500'}}>
                      <span className="bx-status-dot" style={{backgroundColor: '#34d399'}}></span> Vendor Portal Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI ROW */}
            <div className="bx-kpi-row">
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon teal"><ShoppingBag size={14}/></div> Active POs</div>
                <div className="bx-kpi-val">{activePOs}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> In progress</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon blue"><Truck size={14}/></div> Pending Deliveries</div>
                <div className="bx-kpi-val">{pendingDel}</div>
                <div className="bx-kpi-trend down"><ArrowDownRight size={12}/> Awaiting shipment</div>
              </div>
              <div className="bx-kpi-card">
                <div className="bx-kpi-header"><div className="bx-kpi-icon green"><IndianRupee size={14}/></div> Revenue</div>
                <div className="bx-kpi-val">{fmtINR(revenue)}</div>
                <div className="bx-kpi-trend up"><ArrowUpRight size={12}/> Total earned</div>
              </div>
            </div>



            {/* QUICK LINKS */}
            <div className="bx-card" style={{marginBottom:'1rem'}}>
              <h3 className="bx-card-title" style={{marginBottom:'1rem'}}>Quick Actions</h3>
              <div className="bx-quick-links">
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/orders")}><ShoppingBag size={16} color="#3b82f6"/> My Orders</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/my-materials")}><Package size={16} color="#f97316"/> Catalog</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/tracking-overview")}><Truck size={16} color="#14b8a6"/> Deliveries</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/invoices")}><FileText size={16} color="#a855f7"/> Invoices</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/profile")}><User size={16} color="#22c55e"/> Profile</div>
                <div className="bx-quick-link" style={{cursor: 'pointer'}} onClick={()=>navigate("/support")}><Bell size={16} color="#f59e0b"/> Support</div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="bx-charts-row">
              <div className="bx-card" style={{gridColumn:'span 2'}}>
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Order History</h3>
                </div>
                <div style={{height:'220px', width:'100%'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderTrend} margin={{ top:5, right:20, bottom:5, left:0 }}>
                      <defs>
                        <linearGradient id="vendColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} dy={10} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#64748b'}} width={40} />
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                      <Area type="monotone" dataKey="orders" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#vendColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Delivery Status</h3>
                </div>
                <div style={{height:'220px', width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                        {["#EAB308","#3B82F6","#22C55E","#EF4444"].map((c,i) => <Cell key={i} fill={c}/>)}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="bx-budget-stats" style={{width:'100%', marginTop:'0'}}>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#EAB308'}}></div> Pending</div>
                      <div className="val">{orders.filter(o=>o.status==="Pending").length}</div>
                    </div>
                    <div className="bx-budget-row">
                      <div className="label"><div className="dot" style={{background:'#22C55E'}}></div> Delivered</div>
                      <div className="val">{orders.filter(o=>o.status==="Delivered").length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LISTS ROW */}
            <div className="bx-lists-row" style={{marginBottom:'2rem', marginTop: '1rem'}}>
              
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">My Materials</h3>
                </div>
                <div>
                  {materials.slice(0,5).map((m,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: "#DBEAFE", color:"#1D4ED8"}}><Package size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name||m.materialName}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stock: {m.stock||m.quantity||0}</p>
                      </div>
                    </div>
                  ))}
                  {materials.length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No materials listed</h4></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Recent Orders</h3>
                  <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/vendor/orders'); }}>View All →</a>
                </div>
                <div>
                  {orders.slice(0,5).map((o,i) => (
                    <div className="bx-list-item" key={i}>
                      <div className="bx-list-icon" style={{background: "#CCFBF1", color:"#14B8A6"}}><ShoppingBag size={14}/></div>
                      <div className="bx-list-content" style={{ minWidth: 0 }}>
                        <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Order #{o.orderNumber||o._id?.slice(-4)||`00${i+1}`}</h4>
                        <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtINR(o.totalAmount||o.amount||0)} · {o.status}</p>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No orders yet</h4></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bx-card">
                <div className="bx-card-header">
                  <h3 className="bx-card-title">Upcoming Deliveries</h3>
                </div>
                <div>
                  {orders.filter(o=>o.status==="Processing"||o.status==="Shipped").slice(0,5).map((o,i) => {
                     const colors=["#14B8A6","#6366F1","#F97316"];
                     const d=o.deliveryDate?new Date(o.deliveryDate):new Date(Date.now()+(i+1)*86400000*3);
                     return (
                       <div className="bx-list-item" key={i}>
                         <div className="bx-list-icon" style={{background: colors[i%3]}}><Truck size={14}/></div>
                         <div className="bx-list-content" style={{ minWidth: 0 }}>
                           <h4 className="bx-list-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Order #{o.orderNumber||o._id?.slice(-4)||`00${i+1}`}</h4>
                           <p className="bx-list-desc" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.toLocaleString("default",{month:"short"}).toUpperCase()} {String(d.getDate()).padStart(2,"0")}</p>
                         </div>
                       </div>
                     );
                  })}
                  {orders.filter(o=>["Processing","Shipped"].includes(o.status)).length === 0 && (
                    <div className="bx-list-item">
                      <div className="bx-list-content"><h4 className="bx-list-title">No upcoming deliveries</h4></div>
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
                <h3 className="bx-card-title">Notifications</h3>
                <a href="#" className="bx-card-link" onClick={(e) => { e.preventDefault(); navigate('/notifications'); }}>View All →</a>
              </div>
              <div className="bx-notifs-list">
                <div className="bx-notif-item"><div className="bx-task-content"><p className="bx-task-title">No new notifications</p></div></div>
              </div>
            </div>

            <div className="bx-ai-widget">
              <div className="bx-ai-header">
                <div style={{width:'24px', height:'24px', background:'#1d4ed8', color:'white', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center'}}>B</div>
                BuildAxis AI Insights <span style={{fontSize:'10px', background:'white', color:'#3b82f6', padding:'2px 4px', borderRadius:'4px', fontWeight:'normal'}}>Beta</span>
              </div>
              <div className="bx-ai-body" style={{maxHeight:'250px', overflowY:'auto'}}>
                <p className="bx-ai-msg">Hi {profile?.name||user?.name?.split(' ')[0]||"Vendor"}! Here are your latest insights:</p>
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

export default VendorDashboard;
