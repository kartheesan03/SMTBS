import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useAiInsights } from "../hooks/useAiInsights";
import API from "../api/axios";
import {
  Package, Truck, CheckCircle, Store, DollarSign, Clock,
  ShoppingBag, FileText, User, TrendingUp, TrendingDown, ExternalLink,
  Tag, Bell, ArrowRight, Activity, AlertTriangle,
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
const SPARK=[4,6,5,8,6,10,8,12,9,14,11,13];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile,   setProfile]   = useState(null);
  const [materials, setMaterials] = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [now, setNow] = useState(new Date());

  const { aiInsights: fetchedAiInsights, loading: aiLoading, error: aiError } = useAiInsights();

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    API.get("/vendors/my-profile")
      .then(r=>{ setProfile(r.data.vendor); setMaterials(r.data.materials||[]); setOrders(r.data.orders||[]); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <LoadingState message="Loading Vendor Dashboard…" height="100vh"/>;

  const activePOs   = orders.filter(o=>!["Completed","Delivered","Cancelled"].includes(o.status)).length;
  const pendingDel  = orders.filter(o=>o.status==="Shipped"||o.status==="Processing").length;
  const totalMat    = materials.length;
  const revenue     = orders.filter(o=>o.status==="Delivered"||o.status==="Completed").reduce((s,o)=>s+(o.totalAmount||o.amount||0),0);

  const orderTrend  = SPARK.map((v,i)=>({name:`M${i+1}`,orders:v}));
  const statusData  = [
    {name:"Pending",  value:orders.filter(o=>o.status==="Pending").length||3},
    {name:"Processing",value:orders.filter(o=>o.status==="Processing").length||2},
    {name:"Delivered", value:orders.filter(o=>o.status==="Delivered").length||8},
    {name:"Cancelled", value:orders.filter(o=>o.status==="Cancelled").length||1},
  ];

  const fallbackAiInsights=[
    activePOs>0   && `${activePOs} active purchase order${activePOs!==1?"s":""} require attention.`,
    pendingDel>0  && `${pendingDel} shipment${pendingDel!==1?"s":""} pending delivery confirmation.`,
    revenue>0     && `Total revenue from fulfilled orders: ${fmtINR(revenue)}.`,
    totalMat>0    && `${totalMat} material${totalMat!==1?"s":""} in your product catalog.`,
    `Keep material information updated for faster order processing.`,
  ].filter(Boolean).slice(0,5);

  const displayInsights = (aiError || !fetchedAiInsights) ? fallbackAiInsights : fetchedAiInsights;

  return (
    <div className="db-page">
      <div className="db-content">

        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">{greeting()}, {profile?.name||user?.name?.split(" ")[0]||"Vendor"}! 👋</div>
            <div className="db-greeting-sub">Here's your vendor portal overview.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="db-status-pill"><div className="db-status-dot"/>Vendor Portal Active</div>
          </div>
        </div>

        <div className="db-kpi-grid">
          <KpiCard icon={ShoppingBag} iconClass="teal"   label="Active POs"        value={activePOs}       trend="In progress"   trendUp={false} sub="Purchase orders" />
          <KpiCard icon={Truck}       iconClass="blue"   label="Pending Deliveries" value={pendingDel}      trend="Needs dispatch" trendUp={false} sub="Awaiting shipment" />
          <KpiCard icon={Package}     iconClass="orange" label="Total Materials"    value={totalMat}        trend="In catalog"    trendUp={true}  sub="Your products" />
          <KpiCard icon={DollarSign}  iconClass="green"  label="Revenue Earned"     value={fmtINR(revenue)} trend="Fulfilled POs" trendUp={true}  sub="Total earned" />
        </div>

        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={ShoppingBag} label="My Orders"   colorClass="qa-blue"   onClick={()=>navigate("/vendor/orders")}/>
            <QaBtn icon={Package}     label="Catalog"     colorClass="qa-orange" onClick={()=>navigate("/vendor/materials")}/>
            <QaBtn icon={Truck}       label="Deliveries"  colorClass="qa-teal"   onClick={()=>navigate("/vendor/deliveries")}/>
            <QaBtn icon={FileText}    label="Invoices"    colorClass="qa-purple" onClick={()=>navigate("/vendor/invoices")}/>
            <QaBtn icon={User}        label="My Profile"  colorClass="qa-green"  onClick={()=>navigate("/vendor/profile")}/>
            <QaBtn icon={Bell}        label="Support"     colorClass="qa-amber"  onClick={()=>navigate("/support")}/>
          </div>
        </div>

        <div className="db-stats-mini-grid">
          {[
            [ShoppingBag,"#CCFBF1","#0D9488","Active POs",   activePOs,       "badge-blue-sm","Processing"],
            [Truck,      "#DBEAFE","#1D4ED8","Pending Ships",pendingDel,       "badge-orange-sm","Awaiting"],
            [Package,    "#FFEDD5","#C2410C","My Materials", totalMat,         "badge-blue-sm","Catalog"],
            [DollarSign, "#DCFCE7","#15803D","Revenue",      fmtINR(revenue),  "badge-green-sm","Earned"],
          ].map(([Icon,bg,col,label,val,badge,badgeText],i)=>(
            <div key={i} className="db-stats-mini-card">
              <div className="db-stats-mini-icon" style={{ background:bg,color:col }}><Icon size={18}/></div>
              <div className="db-stats-mini-body"><div className="db-stats-mini-val">{val}</div><div className="db-stats-mini-label">{label}</div><span className={`db-stats-mini-badge ${badge}`}>{badgeText}</span></div>
            </div>
          ))}
        </div>

        {/* ── Bento Grid ── */}
        <div className="db-bento">
          {/* Row 1 */}
          <div className="db-card db-col-3">
            <div className="db-profile-banner profile-banner-vendor"/>
            <div className="db-profile-avatar profile-avatar-vendor">{(profile?.name||user?.name||"V")[0].toUpperCase()}</div>
            <div className="db-profile-body">
              <div className="db-profile-name">{profile?.name||user?.name||"Vendor"}</div>
              <div className="db-profile-role">{profile?.company||"Vendor Company"}</div>
              <span className="db-profile-badge profile-badge-vendor">Vendor Access</span>
              <div className="db-profile-info">
                <div className="db-profile-info-row"><span className="db-profile-info-label">Vendor ID</span><span className="db-profile-info-val">VND-{String(user?.id||6001).padStart(4,"0")}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Contact</span><span className="db-profile-info-val" style={{ fontSize:11 }}>{profile?.email||user?.email||"—"}</span></div>
                <div className="db-profile-info-row"><span className="db-profile-info-label">Category</span><span className="db-profile-info-val">{profile?.category||"General"}</span></div>
              </div>
              <button className="db-profile-btn" onClick={()=>navigate("/vendor/profile")}>View Profile <ArrowRight size={13}/></button>
            </div>
          </div>

          <div className="db-card db-col-6" style={{ background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px -10px rgba(20, 184, 166, 0.15)", position: "relative", overflow: "hidden", padding: 0, display: "flex", flexDirection: "column" }}>
            <div className="db-card-header" style={{ borderBottom: "none", padding: "24px 24px 0 24px", margin: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
              <div>
                <div className="db-card-title" style={{ color: "#64748b", fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <ShoppingCart size={16} color="#14b8a6" />
                  Order History
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                  {orders.length}
                  <span style={{ fontSize: 13, padding: "3px 10px", background: "#ccfbf1", color: "#0f766e", borderRadius: "12px", fontWeight: 700 }}>
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: "220px", marginTop: "20px", padding: "0 20px 10px 0" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderTrend} margin={{top:4,right:4,left:-20,bottom:0}}>
                  <defs>
                    <linearGradient id="vendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} dy={10}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#94a3b8", fontWeight: 600}} dx={-10}/>
                  <Tooltip cursor={{ stroke: '#99f6e4', strokeWidth: 2, strokeDasharray: '4 4' }} contentStyle={{fontSize:12,borderRadius:8,border:"none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)"}}/>
                  <Area type="monotone" dataKey="orders" stroke="#14B8A6" strokeWidth={4} fill="url(#vendGrad)" activeDot={{ r: 6, fill: "#fff", stroke: "#14b8a6", strokeWidth: 3 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Delivery Status</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" stroke="none" cornerRadius={6}>
                      {["#EAB308","#3B82F6","#22C55E","#EF4444"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ fontSize:26,fontWeight:800,color:"#111827", lineHeight: 1 }}>{orders.length}</div>
                  <div style={{ fontSize:12,color:"#64748b", fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Orders</div>
                </div>
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center", fontSize: 11, marginTop: 8 }}>
                {[["Pending","#EAB308"],["Processing","#3B82F6"],["Delivered","#22C55E"],["Cancelled","#EF4444"]].map(([l,c],i)=>(
                  <span key={i} style={{ color:"#64748b", fontWeight: 600 }}><span style={{ color:c,fontWeight:800 }}>●</span> {l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Order Status</div></div>
            <div className="db-status-list">
              {[["Pending",   orders.filter(o=>o.status==="Pending").length,    "status-warning"],
                ["Processing",orders.filter(o=>o.status==="Processing").length, "status-healthy"],
                ["Shipped",   orders.filter(o=>o.status==="Shipped").length,    "status-healthy"],
                ["Delivered", orders.filter(o=>o.status==="Delivered").length,  "status-healthy"],
                ["Cancelled", orders.filter(o=>o.status==="Cancelled").length,  "status-critical"],
              ].map(([n,v,cls],i)=>(
                <div key={i} className="db-status-row"><span className="db-status-name">{n}</span><span className={`db-status-badge ${cls}`}>{v}</span></div>
              ))}
            </div>
          </div>

          <div className="db-card db-col-6">
            <div className="db-card-header"><div className="db-card-title">Recent Orders</div><span className="db-card-link" onClick={()=>navigate("/vendor/orders")}>View All</span></div>
            <div className="db-activity-list">
              {orders.slice(0,5).map((o,i)=>(
                <div key={i} className="db-activity-item">
                  <div className="db-activity-icon" style={{ background:"#CCFBF1",color:"#14B8A6" }}><Package size={14}/></div>
                  <div className="db-activity-body"><div className="db-activity-title">Order #{o.orderNumber||o._id?.slice(-4)||`00${i+1}`}</div><div className="db-activity-desc">{o.status||"Pending"} · {fmtINR(o.totalAmount||o.amount||0)}</div></div>
                  <div className="db-activity-time">{o.createdAt?fmtTime(o.createdAt):"—"}</div>
                </div>
              ))}
              {orders.length===0&&<div className="db-empty">No orders yet</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Recent Notifications</div></div>
            <div className="db-notif-list">
              {[["New PO received","#14B8A6"],["Payment processed","#22C55E"],["Delivery confirmation required","#F97316"],["Catalog updated successfully","#6366F1"],["New contact message","#3B82F6"]].map(([t,c],i)=>(
                <div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:c }}/><div className="db-notif-body"><div className="db-notif-text">{t}</div><div className="db-notif-time">09:{String(30+i*5).padStart(2,"0")} AM</div></div></div>
              ))}
            </div>
          </div>

          {/* Row 3 */}
          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">My Materials</div></div>
            <div className="db-status-list">
              {materials.slice(0,5).map((m,i)=>(
                <div key={i} className="db-status-row"><span className="db-status-name" style={{ fontSize:12 }}>{m.name||m.materialName}</span><span className="db-status-badge status-healthy">{m.stock||m.quantity||"—"}</span></div>
              ))}
              {materials.length===0&&<div className="db-empty">No materials listed</div>}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Upcoming Deliveries</div></div>
            <div className="db-event-list">
              <br/>
              {orders.filter(o=>o.status==="Processing"||o.status==="Shipped").slice(0,3).map((o,i)=>{
                const colors=["#14B8A6","#6366F1","#F97316"];
                const d=o.deliveryDate?new Date(o.deliveryDate):new Date(Date.now()+(i+1)*86400000*3);
                return <div key={i} className="db-event-item">
                  <div className="db-event-date" style={{ background:colors[i%3] }}><div className="db-event-day">{String(d.getDate()).padStart(2,"0")}</div><div className="db-event-mon">{d.toLocaleString("default",{month:"short"}).toUpperCase()}</div></div>
                  <div className="db-event-body"><div className="db-event-title">Order #{o.orderNumber||o._id?.slice(-4)||`00${i+1}`}</div><div className="db-event-sub">{o.status}</div></div>
                </div>;
              })}
              {orders.filter(o=>["Processing","Shipped"].includes(o.status)).length===0&&[["10","SEP","PO #VND-001","Dispatch","#14B8A6"],["18","SEP","PO #VND-002","Delivery","#6366F1"]].map(([d,m,t,s,c],i)=>(
                <div key={i} className="db-event-item"><div className="db-event-date" style={{ background:c }}><div className="db-event-day">{d}</div><div className="db-event-mon">{m}</div></div><div className="db-event-body"><div className="db-event-title">{t}</div><div className="db-event-sub">{s}</div></div></div>
              ))}
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
                displayInsights.map((text,i)=>{const colors=["#14B8A6","#22C55E","#F97316","#3B82F6","#EAB308"];return<div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;})
              ) : (
                <div className="db-empty" style={{padding: "10px"}}>AI has no new insights.</div>
              )}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Top Materials</div></div>
            <div className="db-bar-list">
              <br/>
              {materials.slice(0,5).map((m,i)=>{const colors=["#14B8A6","#3B82F6","#22C55E","#F97316","#EF4444"];const max=Math.max(1,...materials.map(x=>x.stock||x.quantity||1));return<div key={i} className="db-bar-item"><div className="db-bar-label"><span>{m.name||m.materialName}</span><span style={{ fontWeight:600 }}>{m.stock||m.quantity||0}</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${Math.round(((m.stock||m.quantity||0)/max)*100)}%`,background:colors[i%colors.length] }}/></div></div>;})} {materials.length===0&&[["Cement","#14B8A6"],["Steel","#3B82F6"],["Bricks","#22C55E"],["Sand","#F97316"]].map(([n,c],i)=><div key={i} className="db-bar-item"><div className="db-bar-label"><span>{n}</span><span style={{ fontWeight:600 }}>{80-i*20} units</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${80-i*20}%`,background:c }}/></div></div>)}
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header"><div className="db-card-title">Order Status Split</div></div>
            <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
              <div className="db-donut-wrap" style={{ position:"relative", height: "160px", width: "100%", display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={58} outerRadius={76} dataKey="value" stroke="none" cornerRadius={6}>
                      {["#EAB308","#3B82F6","#22C55E","#EF4444"].map((c,i)=><Cell key={i} fill={c}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:11,borderRadius:8, border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="db-card db-col-3">
            <div className="db-card-header">
              <div className="db-card-title">Revenue Trend</div>
              <span style={{ fontSize: 11, color: "#6B7280" }}>Total</span>
            </div>
            <div className="db-card-body" style={{ padding: 0 }}>
              <div className="db-profit-val">{fmtINR(revenue)}</div>
              <div className="db-profit-sub">Total fulfilled order revenue</div>
              <div style={{ width: "100%", height: "120px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK.map((v,i)=>({m:i+1,v}))}>
                    <Line type="monotone" dataKey="v" stroke="#14B8A6" strokeWidth={3} dot={false}/>
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

export default VendorDashboard;
