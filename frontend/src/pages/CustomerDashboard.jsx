import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import {
  ShoppingCart, Package, Truck, CheckCircle, Plus, FileText,
  XCircle, Clock, MapPin, DollarSign, TrendingUp, TrendingDown,
  Bell, ArrowRight, Activity, User, ExternalLink,
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
const SPARK=[3,5,4,7,5,9,7,11,8,13,10,12];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  useEffect(()=>{
    Promise.all([
      API.get("/customers/profile").catch(()=>({data:null})),
      API.get("/orders/customer").catch(()=>({data:[]})),
    ]).then(([profileR,ordersR])=>{
      setProfile(profileR.data);
      setOrders(ordersR.data||[]);
    }).finally(()=>setLoading(false));
  },[]);

  if(loading) return <LoadingState message="Loading Customer Dashboard…" height="100vh"/>;

  const totalOrders   = orders.length;
  const pendingOrders = orders.filter(o=>o.status==="Pending"||o.status==="Processing").length;
  const deliveredOrds = orders.filter(o=>o.status==="Delivered"||o.status==="Completed").length;
  const totalSpend    = orders.reduce((s,o)=>s+(o.totalAmount||o.amount||0),0);

  const statusData=[
    {name:"Pending",   value:pendingOrders||2},
    {name:"Processing",value:orders.filter(o=>o.status==="Processing").length||1},
    {name:"Shipped",   value:orders.filter(o=>o.status==="Shipped").length||2},
    {name:"Delivered", value:deliveredOrds||5},
    {name:"Cancelled", value:orders.filter(o=>o.status==="Cancelled").length||0},
  ];

  const orderTrend=SPARK.map((v,i)=>({name:`M${i+1}`,orders:v}));

  const upcomingDeliveries=orders
    .filter(o=>["Shipped","Processing"].includes(o.status))
    .slice(0,3)
    .map((o,i)=>{ const colors=["#1D4ED8","#22C55E","#F97316"]; const d=o.deliveryDate?new Date(o.deliveryDate):new Date(Date.now()+(i+1)*86400000*3); return{day:String(d.getDate()).padStart(2,"0"),mon:d.toLocaleString("default",{month:"short"}).toUpperCase(),title:`Order #${o.orderNumber||o._id?.slice(-4)||`00${i+1}`}`,sub:o.status,color:colors[i%3]}; });

  const aiInsights=[
    totalOrders>0   && `You have placed ${totalOrders} order${totalOrders!==1?"s":""} with us. Thank you!`,
    pendingOrders>0 && `${pendingOrders} order${pendingOrders!==1?"s":""} are currently being processed.`,
    deliveredOrds>0 && `${deliveredOrds} order${deliveredOrds!==1?"s":""} successfully delivered.`,
    totalSpend>0    && `Total amount spent: ${fmtINR(totalSpend)}.`,
    `Track your orders in real time — stay updated on every delivery.`,
  ].filter(Boolean).slice(0,5);

  return (
    <div className="db-page">
      <div className="db-content">

        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">{greeting()}, {profile?.name||user?.name?.split(" ")[0]||"Customer"}! 👋</div>
            <div className="db-greeting-sub">Here's your order overview and activity.</div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">{now.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>
            <div className="db-status-pill"><div className="db-status-dot"/>Customer Portal Active</div>
          </div>
        </div>

        <div className="db-kpi-grid">
          <KpiCard icon={ShoppingCart} iconClass="blue"   label="My Orders"       value={totalOrders}         trend="All time"     trendUp={true}  sub="Total placed" />
          <KpiCard icon={Clock}        iconClass="orange" label="Pending Orders"   value={pendingOrders}       trend="In progress"  trendUp={false} sub="Processing now" />
          <KpiCard icon={CheckCircle}  iconClass="green"  label="Delivered"        value={deliveredOrds}       trend="Successfully" trendUp={true}  sub="Received orders" />
          <KpiCard icon={DollarSign}   iconClass="purple" label="Total Spend"      value={fmtINR(totalSpend)}  trend="All orders"   trendUp={true}  sub="Lifetime value" />
        </div>

        <div className="db-quick-actions">
          <div className="db-section-title">Quick Actions</div>
          <div className="db-qa-grid">
            <QaBtn icon={Plus}         label="New Order"    colorClass="qa-blue"   onClick={()=>navigate("/orders/new")}/>
            <QaBtn icon={Truck}        label="Track Order"  colorClass="qa-orange" onClick={()=>navigate("/my-orders")}/>
            <QaBtn icon={FileText}     label="Invoices"     colorClass="qa-purple" onClick={()=>navigate("/invoices")}/>
            <QaBtn icon={Bell}         label="Support"      colorClass="qa-teal"   onClick={()=>navigate("/support")}/>
            <QaBtn icon={User}         label="My Profile"   colorClass="qa-green"  onClick={()=>navigate("/profile")}/>
            <QaBtn icon={ExternalLink} label="Catalog"      colorClass="qa-amber"  onClick={()=>navigate("/catalog")}/>
          </div>
        </div>

        <div className="db-stats-mini-grid">
          {[
            [ShoppingCart,"#DBEAFE","#1D4ED8","Total Orders",   totalOrders,       "badge-blue-sm","All Time"],
            [Clock,       "#FFEDD5","#C2410C","Pending",         pendingOrders,     "badge-orange-sm","In Progress"],
            [CheckCircle, "#DCFCE7","#15803D","Delivered",       deliveredOrds,     "badge-green-sm","Received"],
            [DollarSign,  "#F3E8FF","#7C3AED","Total Spend",    fmtINR(totalSpend),"badge-blue-sm","Lifetime"],
          ].map(([Icon,bg,col,label,val,badge,badgeText],i)=>(
            <div key={i} className="db-stats-mini-card">
              <div className="db-stats-mini-icon" style={{ background:bg,color:col }}><Icon size={18}/></div>
              <div className="db-stats-mini-body"><div className="db-stats-mini-val">{val}</div><div className="db-stats-mini-label">{label}</div><span className={`db-stats-mini-badge ${badge}`}>{badgeText}</span></div>
            </div>
          ))}
        </div>

        <div className="db-main-grid">
          <div className="db-main-left">
            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Order Status</div></div>
              <div className="db-status-list">
                {[["Pending",   pendingOrders,                                         "status-warning"],
                  ["Processing",orders.filter(o=>o.status==="Processing").length,      "status-warning"],
                  ["Shipped",   orders.filter(o=>o.status==="Shipped").length,         "status-healthy"],
                  ["Delivered", deliveredOrds,                                          "status-healthy"],
                  ["Cancelled", orders.filter(o=>o.status==="Cancelled").length,       "status-critical"],
                ].map(([n,v,cls],i)=>(
                  <div key={i} className="db-status-row"><span className="db-status-name">{n}</span><span className={`db-status-badge ${cls}`}>{v}</span></div>
                ))}
              </div>
            </div>
            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">My Profile</div></div>
              <div className="db-status-list">
                <div className="db-status-row"><span className="db-status-name">Name</span><span className="db-status-badge status-healthy">{profile?.name||user?.name||"Customer"}</span></div>
                <div className="db-status-row"><span className="db-status-name">Type</span><span className="db-status-badge status-healthy">{profile?.type||"Regular"}</span></div>
                <div className="db-status-row"><span className="db-status-name">City</span><span className="db-status-badge status-healthy">{profile?.city||"—"}</span></div>
                <div className="db-status-row"><span className="db-status-name">Member Since</span><span className="db-status-badge status-healthy">{profile?.createdAt?new Date(profile.createdAt).getFullYear():"2024"}</span></div>
              </div>
            </div>
          </div>

          <div className="db-main-center">
            <div className="db-chart-row">
              <div className="db-card">
                <div className="db-card-header"><div className="db-card-title">Order History</div></div>
                <div className="db-card-body">
                  <div className="db-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={orderTrend} margin={{top:4,right:4,left:-20,bottom:0}}>
                        <defs><linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2}/><stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false}/>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9CA3AF"}}/>
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9CA3AF"}}/>
                        <Tooltip contentStyle={{fontSize:12,borderRadius:8,border:"1px solid #E5E7EB"}}/>
                        <Area type="monotone" dataKey="orders" stroke="#1D4ED8" strokeWidth={2} fill="url(#custGrad)" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="db-card">
                <div className="db-card-header"><div className="db-card-title">Order Status Split</div></div>
                <div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
                  <div className="db-donut-wrap" style={{ position:"relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">
                          {["#EAB308","#3B82F6","#14B8A6","#22C55E","#EF4444"].map((c,i)=><Cell key={i} fill={c}/>)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize:11,borderRadius:8 }}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center" }}>
                      <div style={{ fontSize:16,fontWeight:800,color:"#111827" }}>{totalOrders}</div>
                      <div style={{ fontSize:9,color:"#6B7280" }}>Orders</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Recent Orders</div><span className="db-card-link" onClick={()=>navigate("/my-orders")}>View All</span></div>
              <div className="db-activity-list">
                {orders.slice(0,5).map((o,i)=>{
                  const statusColors={Pending:"#EAB308",Processing:"#3B82F6",Shipped:"#14B8A6",Delivered:"#22C55E",Cancelled:"#EF4444"};
                  const color=statusColors[o.status]||"#6B7280";
                  return <div key={i} className="db-activity-item">
                    <div className="db-activity-icon" style={{ background:"#DBEAFE",color:"#1D4ED8" }}><Package size={14}/></div>
                    <div className="db-activity-body"><div className="db-activity-title">Order #{o.orderNumber||o._id?.slice(-4)||`00${i+1}`}</div><div className="db-activity-desc">{fmtINR(o.totalAmount||o.amount||0)} · <span style={{ color, fontWeight:600 }}>{o.status}</span></div></div>
                    <div className="db-activity-time">{o.createdAt?fmtTime(o.createdAt):"—"}</div>
                  </div>;
                })}
                {orders.length===0&&<div className="db-empty">No orders placed yet</div>}
              </div>
            </div>
          </div>

          <div className="db-main-right">
            <div className="db-profile-card">
              <div className="db-profile-banner profile-banner-customer"/>
              <div className="db-profile-avatar profile-avatar-customer">{(profile?.name||user?.name||"C")[0].toUpperCase()}</div>
              <div className="db-profile-body">
                <div className="db-profile-name">{profile?.name||user?.name||"Customer"}</div>
                <div className="db-profile-role">{profile?.type||"Customer"} Account</div>
                <span className="db-profile-badge profile-badge-customer">Customer Access</span>
                <div className="db-profile-info">
                  <div className="db-profile-info-row"><span className="db-profile-info-label">Customer ID</span><span className="db-profile-info-val">CUS-{String(user?.id||7001).padStart(4,"0")}</span></div>
                  <div className="db-profile-info-row"><span className="db-profile-info-label">Email</span><span className="db-profile-info-val" style={{ fontSize:11 }}>{profile?.email||user?.email||"—"}</span></div>
                  <div className="db-profile-info-row"><span className="db-profile-info-label">Total Spend</span><span className="db-profile-info-val">{fmtINR(totalSpend)}</span></div>
                </div>
                <button className="db-profile-btn" onClick={()=>navigate("/profile")}>View Profile <ArrowRight size={13}/></button>
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Notifications</div></div>
              <div className="db-notif-list">
                {[["Your order is being processed","#1D4ED8"],["New order shipped","#14B8A6"],["Delivery confirmed","#22C55E"],["Invoice generated","#6366F1"],["Special offer available","#F97316"]].map(([t,c],i)=>(
                  <div key={i} className="db-notif-item"><div className="db-notif-dot" style={{ background:c }}/><div className="db-notif-body"><div className="db-notif-text">{t}</div><div className="db-notif-time">09:{String(30+i*5).padStart(2,"0")} AM</div></div></div>
                ))}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header"><div className="db-card-title">Upcoming Deliveries</div></div>
              <div className="db-event-list">
                {upcomingDeliveries.length>0?upcomingDeliveries.map((ev,i)=>(
                  <div key={i} className="db-event-item"><div className="db-event-date" style={{ background:ev.color }}><div className="db-event-day">{ev.day}</div><div className="db-event-mon">{ev.mon}</div></div><div className="db-event-body"><div className="db-event-title">{ev.title}</div><div className="db-event-sub">{ev.sub}</div></div></div>
                )):[["05","SEP","Order #7001","Delivery Expected","#1D4ED8"],["12","SEP","Order #7002","Processing","#22C55E"]].map(([d,m,t,s,c],i)=>(
                  <div key={i} className="db-event-item"><div className="db-event-date" style={{ background:c }}><div className="db-event-day">{d}</div><div className="db-event-mon">{m}</div></div><div className="db-event-body"><div className="db-event-title">{t}</div><div className="db-event-sub">{s}</div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="db-bottom-grid">
          <div className="db-card"><div className="db-card-header"><div className="db-card-title">AI Insights</div></div><div className="db-ai-insights">{aiInsights.map((text,i)=>{const colors=["#1D4ED8","#22C55E","#F97316","#6366F1","#EAB308"];return<div key={i} className="db-ai-item"><div className="db-ai-dot" style={{ background:colors[i%colors.length] }}/><div className="db-ai-text">{text}</div></div>;})}</div></div>
          <div className="db-card"><div className="db-card-header"><div className="db-card-title">Order History Breakdown</div></div><div className="db-bar-list">{[["Delivered",deliveredOrds,"#22C55E"],["Processing",orders.filter(o=>o.status==="Processing").length,"#3B82F6"],["Pending",pendingOrders,"#EAB308"],["Cancelled",orders.filter(o=>o.status==="Cancelled").length,"#EF4444"]].map(([label,val,color],i)=>{const max=Math.max(1,totalOrders);return<div key={i} className="db-bar-item"><div className="db-bar-label"><span>{label}</span><span style={{ fontWeight:600 }}>{val}</span></div><div className="db-bar-track"><div className="db-bar-fill" style={{ width:`${Math.round((val/max)*100)}%`,background:color }}/></div></div>;})} </div></div>
          <div className="db-card"><div className="db-card-header"><div className="db-card-title">Order Status</div></div><div className="db-card-body" style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}><div className="db-donut-wrap" style={{ position:"relative" }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value">{["#EAB308","#3B82F6","#14B8A6","#22C55E","#EF4444"].map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Tooltip contentStyle={{ fontSize:11,borderRadius:8 }}/></PieChart></ResponsiveContainer></div></div></div>
          <div className="db-card"><div className="db-card-header"><div className="db-card-title">Total Spend</div></div><div className="db-profit-val">{fmtINR(totalSpend)}</div><div className="db-profit-sub">Lifetime purchase value</div><div style={{ padding:"0 20px 16px" }}><div className="db-chart-wrap" style={{ height:100 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={SPARK.map((v,i)=>({m:i+1,v}))}><Line type="monotone" dataKey="v" stroke="#1D4ED8" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></div></div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboard;
