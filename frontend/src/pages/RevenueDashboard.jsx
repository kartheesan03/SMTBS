import React, { useState, useEffect } from "react";
import API from "../api/axios";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingCart,
  TrendingDown,
  ArrowRight,
  Activity
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { LoadingState } from "../components/DataStates";
import "../components/AdminDashboard/DashboardLayout.css";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

const fmtINR = (v) => {
  if (!v && v !== 0) return "₹0";
  const abs = Math.abs(v);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}k`;
  return `₹${abs}`;
};

const KpiCard = ({ icon: Icon, iconClass, label, value, trend, trendUp, sub }) => (
  <div className="db-kpi-card">
    <div className="db-kpi-top">
      <div className={`db-kpi-icon ${iconClass}`}>
        <Icon size={22} />
      </div>
      {trend && (
        <span className={`db-kpi-trend ${trendUp ? "up" : "down"}`}>
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {trend}
        </span>
      )}
    </div>
    <div>
      <div className="db-kpi-value">{value}</div>
      <div className="db-kpi-label">{label}</div>
    </div>
    {sub && <div className="db-kpi-sub">{sub}</div>}
  </div>
);

const RevenueDashboard = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchRevenueData = async () => {
    try {
      const ordRes = await API.get("/orders").catch((e) => ({ data: [] }));
      setOrdersData(ordRes.data || []);
    } catch (error) {
      console.error("Failed to load revenue stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  if (loading) return <LoadingState message="Loading Revenue Dashboard…" height="100vh" />;

  const salesOrders = ordersData.filter((o) => {
    const t = String(o.orderType || "").toUpperCase();
    return t.includes("SALES");
  });
  
  const completedOrders = salesOrders.filter((o) =>
    ["Delivered", "Completed", "Invoice Generated", "Workflow Completed"].includes(o.status)
  );
  
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0),
    0
  );
  
  const totalSalesOrders = completedOrders.length;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revMap = {};
  
  completedOrders.forEach((o) => {
    const date = new Date(o.orderDate || o.createdAt);
    if (!isNaN(date.getTime())) {
      const month = monthNames[date.getMonth()];
      revMap[month] = (revMap[month] || 0) + (Number(o.totalAmount) || Number(o.grandTotal) || 0);
    }
  });

  const currentMonthIdx = new Date().getMonth();
  const currentMonthName = monthNames[currentMonthIdx];
  const prevMonthName = monthNames[(currentMonthIdx - 1 + 12) % 12];
  const monthlyRevenue = revMap[currentMonthName] || 0;
  const prevMonthlyRevenue = revMap[prevMonthName] || 0;
  
  let growthPercent = 0;
  let growthDirection = "up";
  if (prevMonthlyRevenue > 0) {
    growthPercent = ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100;
    growthDirection = growthPercent >= 0 ? "up" : "down";
  } else if (monthlyRevenue > 0) {
    growthPercent = 100;
  }

  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonthIdx - i;
    if (m < 0) m += 12;
    const mName = monthNames[m];
    trendData.push({
      name: mName,
      revenue: revMap[mName] || 0,
    });
  }

  let highestMonth = { name: "-", revenue: 0 };
  Object.keys(revMap).forEach((m) => {
    if (revMap[m] > highestMonth.revenue) {
      highestMonth = { name: m, revenue: revMap[m] };
    }
  });

  const formatCurrency = (value) => fmtINR(value);

  return (
    <div className="db-page">
      <div className="db-content">
        
        {/* Greeting Bar */}
        <div className="db-greeting-bar">
          <div className="db-greeting-left">
            <div className="db-greeting-text">
              {greeting()}, Financial Team! 👋
            </div>
            <div className="db-greeting-sub">
              Here is the revenue breakdown and historical trend.
            </div>
          </div>
          <div className="db-greeting-right">
            <div className="db-datetime">
              <Calendar size={14} />
              {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="db-kpi-grid">
          <KpiCard
            icon={DollarSign}
            iconClass="green"
            label="Total Revenue"
            value={fmtINR(totalRevenue)}
            trend="All time"
            trendUp={true}
            sub="Completed Orders"
          />
          <KpiCard
            icon={Activity}
            iconClass="blue"
            label="This Month"
            value={fmtINR(monthlyRevenue)}
            trend={`${Math.abs(growthPercent).toFixed(1)}% vs last month`}
            trendUp={growthDirection === "up"}
            sub={currentMonthName}
          />
          <KpiCard
            icon={ShoppingCart}
            iconClass="orange"
            label="Total Sales"
            value={totalSalesOrders}
            trend="Completed"
            trendUp={true}
            sub="Invoiced & Delivered"
          />
          <KpiCard
            icon={TrendingUp}
            iconClass="purple"
            label="Highest Month"
            value={highestMonth.name}
            trend={fmtINR(highestMonth.revenue)}
            trendUp={true}
            sub="Best performance"
          />
        </div>

        {/* Chart Section */}
        <div className="db-main-grid">
          <div className="db-card" style={{ gridColumn: "span 3" }}>
            <div className="db-card-header">
              <div className="db-card-title">6-Month Revenue Trend</div>
            </div>
            <div className="db-card-content" style={{ padding: "20px", height: "350px" }}>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--text-muted)" }} tickFormatter={formatCurrency} width={80} />
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: "8px", border: "1px solid var(--border-light)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                      activeDot={{ r: 6 }}
                      label={{ position: "top", formatter: formatCurrency, fill: "var(--text-heading)", fontSize: 11, fontWeight: 600, dy: -10 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty">No revenue data available</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RevenueDashboard;
