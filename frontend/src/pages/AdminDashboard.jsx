import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";
import API from "../api/axios";
import {
  Users,
  Briefcase,
  ShoppingCart,
  Plus,
  BarChart2,
  Search,
  TrendingUp,
  TrendingDown,
  Bell,
  UserPlus,
  FileText,
  CheckCircle2,
  CheckCircle,
  Calendar,
  DollarSign,
  Box,
  Truck,
  Tag,
  Layers,
  Cpu,
  PhoneCall,
  ListTodo,
  UserCheck,
  LayoutGrid,
  Clock,
  Target,
  Server,
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Package,
  BarChart as BarChartIcon,
  Zap,
  MapPin,
  Building2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
  LabelList,
  Label,
} from "recharts";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import PageHeader from "../components/PageHeader";
import CommandCenter from "../components/CommandCenter";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import LedgerChart from "../components/LedgerChart";
import WelcomeBanner from "../components/ui/WelcomeBanner";
import { LoadingState, ErrorState, EmptyState } from "../components/DataStates";
export const IconQuickAction = ({ icon: Icon, label, colorClass, onClick }) => (
  <div className="qa-item" onClick={onClick}>
    {" "}
    <div className={`qa-icon-wrapper ${colorClass}`}>
      {" "}
      <Icon size={20} strokeWidth={2} />{" "}
    </div>{" "}
    <div className="qa-label">{label}</div>{" "}
  </div>
);
export const InvRow = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  caption,
  isAlert,
}) => (
  <div className="inv-row">
    {" "}
    <div className="inv-row-icon" style={{ background: iconBg }}>
      {" "}
      <Icon size={14} strokeWidth={2.5} color={iconColor} />{" "}
    </div>{" "}
    <div className="inv-row-info">
      {" "}
      <span className="inv-row-label">{label}</span>{" "}
      {caption && <span className="inv-row-caption">{caption}</span>}{" "}
    </div>{" "}
    <div
      className="inv-row-value"
      style={{ color: isAlert ? "#DC2626" : "#0f172a" }}
    >
      {" "}
      {value}{" "}
    </div>{" "}
  </div>
);
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const { data: dashboardData, loading, error } = useDashboardData();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [revenueTrendYear, setRevenueTrendYear] = useState("current");
  const [topMaterialsSortBy, setTopMaterialsSortBy] = useState("revenue");
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksRes = await API.get("/tasks");
        const now = new Date();
        const pendingTasks = (tasksRes.data || [])
          .filter((t) => t.status !== "Completed")
          .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
          .slice(0, 4)
          .map((t) => {
            const d = new Date(t.dueDate);
            let isOverdue = d < now;
            let col = "#4f46e5";
            let bg = "#e0e7ff";
            if (isOverdue || t.priority === "High") {
              col = "#ef4444";
              bg = "#fee2e2";
            } else if (t.priority === "Low") {
              col = "#10b981";
              bg = "#d1fae5";
            }
            return {
              day: String(d.getDate()).padStart(2, "0"),
              month: d
                .toLocaleString("default", { month: "short" })
                .toUpperCase(),
              bg,
              col,
              title: t.title,
              category: t.category || t.department || "General",
              isOverdue,
            };
          });
        setUpcomingEvents(pendingTasks);
      } catch (err) {
        console.error("Failed to load upcoming tasks", err);
      }
    };
    fetchTasks();
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandCenterOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  if (loading)
    return (
      <LoadingState message="Loading business overview..." height="100vh" />
    );
  if (error)
    return (
      <ErrorState
        message="Failed to load dashboard data. Please try again."
        height="100vh"
      />
    );
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };
  const formatINR = (val) => {
    if (!val && val !== 0) return "₹0";
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const sign = isNegative ? "-" : "";
    if (absVal >= 100000) return `${sign}₹${(absVal / 100000).toFixed(2)}L`;
    if (absVal >= 1000) return `${sign}₹${(absVal / 1000).toFixed(1)}k`;
    return `${sign}₹${absVal}`;
  };
  const totalRevenue = dashboardData?.stats?.revenue || 0;
  const totalMaterials = dashboardData?.stats?.totalMaterials || 0;
  const lowStock = dashboardData?.tables?.lowStock || [];
  const totalEmployees = dashboardData?.stats?.totalEmployees || 0;
  const activeCustomers = dashboardData?.stats?.activeCustomers || 0;
  const totalOrders = dashboardData?.stats?.totalOrders || 0;
  const activeOrdersCount = dashboardData?.stats?.activeOrdersCount || 0;
  const totalVendors = dashboardData?.stats?.totalVendors || 0;
  const orderFulfillment =
    dashboardData?.analytics?.healthMetrics?.orderFulfillment || 0;
  const pendingOrders = dashboardData?.stats?.pendingOrders || 0;
  const completedTasks = dashboardData?.stats?.completedTasks || 0;
  const pendingTasks = dashboardData?.stats?.pendingTasks || 0;
  return (
    <div className="rd-container theme-admin">
      {" "}
      <div className="rd-content">
        {" "}
        <WelcomeBanner
          user={user}
          greeting={`${getGreeting()}`}
          subtitle={`${new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })} · Here's your business overview`}
          badges={[
            {
              icon: Package,
              text: `${activeOrdersCount} Active Orders`,
              type: "neutral",
            },
            { type: "status", text: "All Systems Operational" },
          ]}
          rightVisuals={
            <>
              {" "}
              <div className="rd-visual-card">
                {" "}
                <div className="rd-vc-label">Efficiency</div>{" "}
                <div className="rd-vc-value">98.2%</div>{" "}
                <div
                  className="rd-vc-chart"
                  style={{ "--progress": "98.2%" }}
                ></div>{" "}
              </div>{" "}
              <div className="rd-visual-card">
                {" "}
                <div className="rd-vc-label">Activity</div>{" "}
                <div className="rd-vc-bars">
                  {" "}
                  <div
                    className="rd-vc-bar"
                    style={{ height: "40%" }}
                  ></div>{" "}
                  <div className="rd-vc-bar" style={{ height: "70%" }}></div>{" "}
                  <div className="rd-vc-bar" style={{ height: "50%" }}></div>{" "}
                  <div className="rd-vc-bar" style={{ height: "90%" }}></div>{" "}
                  <div className="rd-vc-bar" style={{ height: "60%" }}></div>{" "}
                </div>{" "}
              </div>{" "}
            </>
          }
          actions={[
            {
              label: "Apply Leave",
              icon: CheckCircle,
              variant: "primary",
              onClick: () => navigate("/leave-management/history"),
            },
            {
              label: "Check In",
              icon: Clock,
              variant: "secondary",
              onClick: () => navigate("/attendance"),
            },
          ]}
        />{" "}
        <StatsGrid>
          {" "}
          <StatsCard
            title="Total Revenue"
            value={formatINR(totalRevenue)}
            icon={DollarSign}
            trendValue="8% vs last month"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Order Fulfillment"
            value={`${orderFulfillment}%`}
            icon={Activity}
            trendValue="Successfully delivered"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Total Orders"
            value={totalOrders}
            icon={ShoppingCart}
            trendValue="12% vs last month"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Total Materials"
            value={totalMaterials}
            icon={Box}
            trendValue="Stock stable"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Total Employees"
            value={totalEmployees}
            icon={Users}
            trendValue="Across all branches"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Total Tasks"
            value={completedTasks + pendingTasks}
            icon={ListTodo}
            trendValue="High priority pending"
            trendPositive={false}
          />{" "}
        </StatsGrid>{" "}
        <div className="rd-middle-row">
          <div className="dashboard-panel type-glass">
            <div className="panel-header">
              {" "}
              <div className="panel-title">Quick Actions</div>{" "}
            </div>{" "}
            <div className="qa-grid">
              {" "}
              <IconQuickAction
                icon={CheckCircle2}
                label="Attendance"
                colorClass="bg-light-red"
                onClick={() => navigate("/attendance")}
              />{" "}
              <IconQuickAction
                icon={Calendar}
                label="Leave Mgmt"
                colorClass="bg-light-green"
                onClick={() => navigate("/leave-management")}
              />{" "}
              <IconQuickAction
                icon={DollarSign}
                label="Payroll"
                colorClass="bg-light-purple"
                onClick={() => navigate("/payroll")}
              />{" "}
              <IconQuickAction
                icon={Box}
                label="Materials"
                colorClass="bg-light-orange"
                onClick={() => navigate("/materials")}
              />{" "}
              <IconQuickAction
                icon={Building2}
                label="Vendors"
                colorClass="bg-light-cyan"
                onClick={() => navigate("/vendors")}
              />{" "}
              <IconQuickAction
                icon={ShoppingCart}
                label="Purchase Orders"
                colorClass="bg-light-green"
                onClick={() => navigate("/orders/purchase")}
              />{" "}
              <IconQuickAction
                icon={Tag}
                label="Sales Orders"
                colorClass="bg-light-red"
                onClick={() => navigate("/orders")}
              />{" "}
              <IconQuickAction
                icon={FileText}
                label="Reports"
                colorClass="bg-light-purple"
                onClick={() => navigate("/analytics")}
              />{" "}
              <IconQuickAction
                icon={Users}
                label="HRMS"
                colorClass="bg-light-blue"
                onClick={() => navigate("/hrms")}
              />{" "}
              <IconQuickAction
                icon={Layers}
                label="ERP"
                colorClass="bg-light-cyan"
                onClick={() => navigate("/erp")}
              />{" "}
              <IconQuickAction
                icon={Target}
                label="CRM"
                colorClass="bg-light-pink"
                onClick={() => navigate("/crm")}
              />{" "}
              <IconQuickAction
                icon={ListTodo}
                label="Tasks"
                colorClass="bg-light-orange"
                onClick={() => navigate("/my-tasks")}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="dashboard-panel type-gradient" style={{ height: "100%", padding: 0, overflow: 'hidden' }}>
            <div className="panel-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
              <div className="panel-title">Inventory &amp; Orders</div>
            </div>
            
            <style>{`
              .kpi-list-container {
                display: flex;
                flex-direction: column;
              }
              .kpi-list-item {
                display: flex;
                align-items: center;
                padding: 16px 24px;
                border-bottom: 1px solid #f1f5f9;
                transition: background-color 0.2s ease;
              }
              .kpi-list-item:hover {
                background-color: #f8fafc;
              }
              .kpi-list-item:last-child {
                border-bottom: none;
              }
              .kpi-list-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: #f1f5f9;
                color: #475569;
                margin-right: 16px;
                flex-shrink: 0;
              }
              .kpi-list-content {
                flex: 1;
                min-width: 0;
              }
              .kpi-list-title {
                font-size: 14px;
                font-weight: 500;
                color: #1e293b;
                margin-bottom: 2px;
              }
              .kpi-list-desc {
                font-size: 13px;
                color: #64748b;
              }
              .kpi-list-value {
                font-size: 20px;
                font-weight: 700;
                color: #0f172a;
                font-family: 'Inter', sans-serif;
                margin-left: 16px;
              }
            `}</style>
            
            <div className="kpi-list-container">
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Briefcase size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Total Vendors</div>
                  <div className="kpi-list-desc">Active partners</div>
                </div>
                <div className="kpi-list-value">{totalVendors}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><AlertCircle size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Low Stock Alerts</div>
                  <div className="kpi-list-desc">Items below threshold</div>
                </div>
                <div className="kpi-list-value">{lowStock.length}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Clock size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Active Orders</div>
                  <div className="kpi-list-desc">Currently processing</div>
                </div>
                <div className="kpi-list-value">{activeOrdersCount}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><AlertTriangle size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Pending Approvals</div>
                  <div className="kpi-list-desc">Orders awaiting review</div>
                </div>
                <div className="kpi-list-value">{pendingOrders}</div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-panel type-glass" style={{ height: "100%", padding: 0, overflow: 'hidden' }}>
            <div className="panel-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', margin: 0 }}>
              <div className="panel-title">Business &amp; Operations</div>
            </div>
            
            <div className="kpi-list-container">
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Users size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Total Staff</div>
                  <div className="kpi-list-desc">Active employees</div>
                </div>
                <div className="kpi-list-value">{totalEmployees}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><Target size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Total Clients</div>
                  <div className="kpi-list-desc">Customers served</div>
                </div>
                <div className="kpi-list-value">{activeCustomers}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><DollarSign size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Revenue YTD</div>
                  <div className="kpi-list-desc">Year to date</div>
                </div>
                <div className="kpi-list-value">{formatINR(totalRevenue)}</div>
              </div>
              <div className="kpi-list-item">
                <div className="kpi-list-icon"><BarChartIcon size={18} /></div>
                <div className="kpi-list-content">
                  <div className="kpi-list-title">Fulfillment Rate</div>
                  <div className="kpi-list-desc">Orders delivered</div>
                </div>
                <div className="kpi-list-value">{orderFulfillment}%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="rd-chart-row-wide" style={{ alignItems: "stretch" }}>
          {" "}
          <div
            className="dashboard-panel"
            style={{
              flex: 1.5,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              boxSizing: "border-box",
            }}
          >
            <div className="panel-header">
              <div className="panel-title">Financial Ledger</div>
              <select
                className="panel-dropdown"
                style={{ paddingRight: "24px", width: "auto" }}
                value={revenueTrendYear}
                onChange={(e) => setRevenueTrendYear(e.target.value)}
              >
                <option value="current">This Year</option>
                <option value="last">Last Year</option>
              </select>
            </div>
            <div style={{ flex: 1, minHeight: 0, padding: 0 }}>
              {(() => {
                const trendData = dashboardData?.analytics?.trendData;
                const monthlyStats = dashboardData?.charts?.monthlyStats;
                let chartData = null;
                if (trendData && trendData.length > 0) {
                  chartData = trendData;
                } else if (monthlyStats && monthlyStats.length > 0) {
                  chartData = monthlyStats.map((m) => ({
                    name: m.name,
                    revenue: m.revenue || 0,
                    expenses: 0,
                    currentYearProfit: m.revenue || 0,
                    lastYearRevenue: 0,
                    lastYearExpenses: 0,
                    lastYearProfit: 0,
                  }));
                }
                if (!chartData || chartData.length === 0) {
                  return (
                    <EmptyState
                      title="No Revenue Data"
                      message="No historical revenue data available."
                      height={300}
                    />
                  );
                }
                const revenueKey =
                  revenueTrendYear === "current" ? "revenue" : "lastYearRevenue";
                const expensesKey =
                  revenueTrendYear === "current"
                    ? "expenses"
                    : "lastYearExpenses";
                const profitKey =
                  revenueTrendYear === "current"
                    ? "currentYearProfit"
                    : "lastYearProfit";
                const ledgerData = chartData.map((d) => ({
                  month: d.name,
                  revenue: d[revenueKey] || 0,
                  expenses: d[expensesKey] || 0,
                  netProfit: d[profitKey] || 0,
                }));
                return (
                  <LedgerChart
                    data={ledgerData}
                    currencySymbol="₹"
                    periodLabel={
                      revenueTrendYear === "current"
                        ? "Current Year"
                        : "Last Year"
                    }
                    compact={true}
                    hideHeader={true}
                  />
                );
              })()}
            </div>
          </div>{" "}
          <div
            className="dashboard-panel"
            style={{
              height: "100%",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">Employees by Dept.</div>{" "}
              <select
                className="panel-dropdown"
                style={{ paddingRight: "24px", width: "auto" }}
              >
                {" "}
                <option>By Department</option>{" "}
              </select>{" "}
            </div>{" "}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minHeight: 0,
              }}
            >
              {" "}
              <div style={{ width: "100%", height: "100%", minHeight: 170 }}>
                {" "}
                {!dashboardData?.hrStats?.employeeDistribution ||
                dashboardData.hrStats.employeeDistribution.length === 0 ? (
                  <EmptyState
                    title="No Employee Data"
                    message="No department data available."
                    height={170}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {" "}
                    <BarChart
                      data={dashboardData.hrStats.employeeDistribution}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      {" "}
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                        vertical={false}
                      />{" "}
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        dy={8}
                      />{" "}
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        allowDecimals={false}
                      />{" "}
                      <Tooltip
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 0,
                          border: "1px solid #e2e8f0",
                        }}
                        cursor={{ fill: "#f1f5f9" }}
                      />{" "}
                      <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      >
                        {" "}
                        {dashboardData.hrStats.employeeDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color || "#7C3AED"}
                            />
                          )
                        )}{" "}
                      </Bar>{" "}
                    </BarChart>{" "}
                  </ResponsiveContainer>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="rd-two-col">
          {" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              <div className="panel-title">Recent Activity</div>
              <span
                className="panel-action"
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#7C3AED",
                  fontWeight: 600,
                }}
                onClick={() => navigate("/settings/audit-logs")}
              >
                View All
              </span>
            </div>
            <div className="feed-list">
              {" "}
              {(dashboardData?.tables?.recentActivity || []).length > 0 ? (
                (dashboardData?.tables?.recentActivity || [])
                  .slice(0, 5)
                  .map((activity, idx) => (
                    <div className="feed-item" key={idx}>
                      {" "}
                      <div className="feed-time">
                        {new Date(activity.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>{" "}
                      {(() => {
                        let IconComp = Activity;
                        let iconColor = "#2563EB";
                        let iconBg = "#eff6ff";
                        const textLower = (activity.text || "").toLowerCase();
                        if (textLower.includes("logged in")) { IconComp = UserCheck; iconColor = "#3b82f6"; iconBg = "#eff6ff"; }
                        else if (activity.type === "success" || textLower.includes("created")) { IconComp = Plus; iconColor = "#10b981"; iconBg = "#d1fae5"; }
                        else if (activity.type === "warning" || textLower.includes("delete")) { IconComp = AlertTriangle; iconColor = "#f59e0b"; iconBg = "#fef3c7"; }
                        
                        return (
                          <div
                            className="feed-icon-wrapper"
                            style={{
                              background: iconBg,
                              color: iconColor,
                            }}
                          >
                            {" "}
                            <IconComp size={12} />{" "}
                          </div>
                        );
                      })()}{" "}
                      <div className="feed-content">
                        {" "}
                        <div
                          className="feed-title"
                          style={{ textTransform: "capitalize" }}
                        >
                          {activity.type}
                        </div>{" "}
                        <div className="feed-desc">{activity.text}</div>{" "}
                      </div>{" "}
                    </div>
                  ))
              ) : (
                <EmptyState
                  title="No Recent Activity"
                  message="System activity will appear here."
                  height={150}
                />
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">Notifications</div>{" "}
              <a href="/notifications" className="panel-action">
                View All
              </a>{" "}
            </div>{" "}
            <div className="feed-list">
              {" "}
              {(dashboardData?.tables?.notifications || []).length > 0 ? (
                (dashboardData?.tables?.notifications || [])
                  .slice(0, 5)
                  .map((notif, idx) => (
                    <div className="feed-item" key={idx}>
                      {" "}
                      {(() => {
                        let IconComp = Bell;
                        let iconColor = "#7c3aed";
                        let iconBg = "#f5f3ff";
                        const textLower = (notif.text || "").toLowerCase();
                        if (textLower.includes("out of stock") || textLower.includes("critical")) { IconComp = AlertTriangle; iconColor = "#ef4444"; iconBg = "#fee2e2"; }
                        else if (textLower.includes("order") && textLower.includes("confirmed")) { IconComp = ShoppingCart; iconColor = "#10b981"; iconBg = "#d1fae5"; }
                        else if (textLower.includes("order")) { IconComp = Package; iconColor = "#3b82f6"; iconBg = "#eff6ff"; }

                        return (
                          <div
                            className="feed-icon-wrapper"
                            style={{
                              background: iconBg,
                              color: iconColor,
                              flexShrink: 0,
                            }}
                          >
                            {" "}
                            <IconComp size={14} />{" "}
                          </div>
                        );
                      })()}{" "}
                      <div className="feed-content" style={{ flex: 1 }}>
                        {" "}
                        <div
                          className="feed-desc"
                          style={{
                            fontSize: 12,
                            color: "#334155",
                            whiteSpace: "normal",
                          }}
                        >
                          {notif.text}
                        </div>{" "}
                      </div>{" "}
                      <div
                        className="feed-time"
                        style={{ width: "auto", flexShrink: 0 }}
                      >
                        {new Date(notif.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>{" "}
                    </div>
                  ))
              ) : (
                <EmptyState
                  title="No Notifications"
                  message="You're all caught up!"
                  height={150}
                  icon={Bell}
                />
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="rd-five-col">
          {" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">
                <Cpu
                  size={15}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 5,
                  }}
                  color="#7C3AED"
                />{" "}
                AI Insights
              </div>{" "}
            </div>{" "}
            {false ? (
              <div className="ai-insights-list">
                {" "}
                {(dashboardData?.analytics?.trendData || []).length > 0 && (
                  <div
                    className="ai-insight-item"
                    onClick={() => navigate("/reports")}
                  >
                    {" "}
                    <div className="ai-dot"></div>{" "}
                    <div>
                      Revenue{" "}
                      {(dashboardData?.analytics?.kpis?.revenueGrowth || 0) >= 0
                        ? "increased"
                        : "decreased"}{" "}
                      by{" "}
                      <strong>
                        {Math.abs(
                          dashboardData?.analytics?.kpis?.revenueGrowth || 0
                        )}
                        %
                      </strong>{" "}
                      vs last month.
                    </div>{" "}
                  </div>
                )}{" "}
                {(dashboardData?.stats?.pendingOrders || 0) > 0 && (
                  <div
                    className="ai-insight-item"
                    onClick={() => navigate("/orders/purchase")}
                  >
                    <div className="ai-dot"></div>
                    <div>
                      <strong>{dashboardData?.stats?.pendingOrders}</strong>{" "}
                      orders require approval.
                    </div>
                  </div>
                )}{" "}
                {(dashboardData?.tables?.lowStock?.length || 0) > 0 && (
                  <div
                    className="ai-insight-item"
                    onClick={() => navigate("/materials")}
                  >
                    <div className="ai-dot"></div>
                    <div>
                      <strong>
                        {dashboardData?.tables?.lowStock?.length} items
                      </strong>{" "}
                      below stock threshold.
                    </div>
                  </div>
                )}{" "}
                {(dashboardData?.stats?.pendingSalaries || 0) > 0 && (
                  <div
                    className="ai-insight-item"
                    onClick={() => navigate("/payroll")}
                  >
                    <div className="ai-dot"></div>
                    <div>
                      <strong>{dashboardData?.stats?.pendingSalaries}</strong>{" "}
                      payrolls pending.
                    </div>
                  </div>
                )}{" "}
              </div>
            ) : (
              <EmptyState
                title="No Insights"
                message="Insufficient data to generate insights."
                height={180}
                icon={Cpu}
              />
            )}{" "}
          </div>{" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">Top Selling Materials</div>{" "}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {" "}
                <select
                  className="panel-dropdown"
                  value={topMaterialsSortBy}
                  onChange={(e) => setTopMaterialsSortBy(e.target.value)}
                  style={{ paddingRight: "24px", width: "auto" }}
                >
                  {" "}
                  <option value="revenue">By Revenue</option>{" "}
                  <option value="sales">By Quantity</option>{" "}
                </select>{" "}
              </div>{" "}
            </div>{" "}
            <div
              style={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {" "}
              {!dashboardData?.tables?.topSellingMaterials ||
              dashboardData.tables.topSellingMaterials.length === 0 ? (
                <EmptyState
                  title="No Data"
                  message="Insufficient sales data."
                  height={180}
                />
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  {" "}
                  <BarChart
                    layout="vertical"
                    data={[
                      ...(dashboardData?.tables?.topSellingMaterials || []),
                    ].sort(
                      (a, b) => b[topMaterialsSortBy] - a[topMaterialsSortBy]
                    )}
                    margin={{ top: 0, right: 45, left: 0, bottom: 0 }}
                  >
                    {" "}
                    <XAxis type="number" hide />{" "}
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val && typeof val === "string" && val.length > 18
                          ? val.substring(0, 18) + "..."
                          : val || ""
                      }
                      tick={{ fill: "#475569", fontSize: 11 }}
                      width={120}
                    />{" "}
                    <Tooltip
                      contentStyle={{ fontSize: 11 }}
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(val) =>
                        topMaterialsSortBy === "revenue"
                          ? formatINR(val || 0)
                          : val || 0
                      }
                    />{" "}
                    <Bar
                      dataKey={topMaterialsSortBy}
                      fill="#7C3AED"
                      radius={[0, 4, 4, 0]}
                      barSize={12}
                    >
                      {" "}
                      <LabelList
                        dataKey={topMaterialsSortBy}
                        position="right"
                        formatter={(val) =>
                          topMaterialsSortBy === "revenue"
                            ? formatINR(val || 0)
                            : val || 0
                        }
                        style={{
                          fontSize: 10,
                          fill: "#475569",
                          fontWeight: 600,
                        }}
                      />{" "}
                    </Bar>{" "}
                  </BarChart>{" "}
                </ResponsiveContainer>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">Sales Analytics</div>{" "}
              <select
                className="panel-dropdown"
                style={{ paddingRight: "24px", width: "auto" }}
              >
                <option>This Month</option>
              </select>{" "}
            </div>{" "}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                minHeight: 180,
                flex: 1,
              }}
            >
              {" "}
              {!dashboardData?.charts?.salesCategoryData ||
              dashboardData.charts.salesCategoryData.length === 0 ? (
                <EmptyState
                  title="No Sales"
                  message="No sales data available."
                  height={180}
                />
              ) : (
                <>
                  {" "}
                  <div style={{ width: "100%", height: 140 }}>
                    {" "}
                    <ResponsiveContainer width="100%" height="100%">
                      {" "}
                      <PieChart>
                        {" "}
                        <Pie
                          data={dashboardData.charts.salesCategoryData}
                          innerRadius={45}
                          outerRadius={65}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                        >
                          {" "}
                          {dashboardData.charts.salesCategoryData.map(
                            (entry, index) => {
                              const colors = [
                                "#7C3AED",
                                "#D97706",
                                "#059669",
                                "#2563EB",
                              ];
                              return (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              );
                            }
                          )}{" "}
                          <Label
                            value={formatINR(
                              dashboardData.charts.salesCategoryData.reduce(
                                (acc, curr) => acc + curr.value,
                                0
                              )
                            )}
                            position="center"
                            fill="#0f172a"
                            style={{ fontSize: "13px", fontWeight: "bold" }}
                          />{" "}
                        </Pie>{" "}
                        <Tooltip
                          contentStyle={{ fontSize: 11 }}
                          formatter={(val) => `₹${val.toLocaleString()}`}
                        />{" "}
                      </PieChart>{" "}
                    </ResponsiveContainer>{" "}
                  </div>{" "}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      width: "100%",
                    }}
                  >
                    {" "}
                    {dashboardData.charts.salesCategoryData
                      .slice(0, 3)
                      .map((entry, idx) => {
                        const colors = [
                          "#7C3AED",
                          "#D97706",
                          "#059669",
                          "#2563EB",
                        ];
                        return (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 15,
                              fontSize: 11,
                              width: "100%",
                            }}
                          >
                            {" "}
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                color: "#475569",
                              }}
                            >
                              {" "}
                              <div
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "0px",
                                  background: colors[idx % colors.length],
                                  flexShrink: 0,
                                }}
                              ></div>{" "}
                              <span>{entry.name}</span>{" "}
                            </span>{" "}
                            <strong style={{ color: "#0f172a" }}>
                              ₹{entry.value.toLocaleString()}
                            </strong>{" "}
                          </div>
                        );
                      })}{" "}
                  </div>{" "}
                </>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">Monthly Profit</div>{" "}
              <select
                className="panel-dropdown"
                style={{ paddingRight: "24px", width: "auto" }}
              >
                <option>This Month</option>
              </select>{" "}
            </div>{" "}
            <div
              style={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              {" "}
              {!dashboardData?.charts?.monthlyStats ||
              dashboardData.charts.monthlyStats.length === 0 ? (
                <EmptyState
                  title="No Profit Data"
                  message="No historical profit data."
                  height={150}
                />
              ) : (
                <>
                  {" "}
                  <div style={{ marginBottom: 16 }}>
                    {" "}
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#0f172a",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {formatINR(
                        dashboardData?.analytics?.kpis?.netProfit ||
                          totalRevenue
                      )}
                    </div>{" "}
                    <div
                      style={{
                        fontSize: 12,
                        color:
                          (dashboardData?.analytics?.kpis?.revenueGrowth ||
                            0) >= 0
                            ? "#059669"
                            : "#ef4444",
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {" "}
                      {(() => {
                        const growth =
                          dashboardData?.analytics?.kpis?.revenueGrowth || 0;
                        const lastMonth =
                          dashboardData?.analytics?.kpis?.lastMonthRevenue || 0;
                        const thisMonth =
                          dashboardData?.analytics?.kpis?.thisMonthRevenue || 0;
                        if (lastMonth === 0) {
                          const diff = thisMonth - lastMonth;
                          return `${diff >= 0 ? "+" : ""}${formatINR(
                            diff
                          )} vs last month (${formatINR(lastMonth)})`;
                        }
                        return `${growth >= 0 ? "↑" : "↓"} ${Math.abs(
                          growth
                        )}% vs last month (${formatINR(lastMonth)})`;
                      })()}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div
                    style={{
                      flex: 1,
                      minHeight: 110,
                      width: "100%",
                      overflow: "hidden",
                      paddingBottom: 10,
                    }}
                  >
                    {" "}
                    <ResponsiveContainer width="100%" height="100%">
                      {" "}
                      <LineChart
                        data={dashboardData?.charts?.monthlyStats || []}
                        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                      >
                        {" "}
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "#94a3b8" }}
                          dy={10}
                        />{" "}
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#059669"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#059669" }}
                          isAnimationActive={false}
                        />{" "}
                        <Tooltip
                          contentStyle={{ fontSize: 11 }}
                          formatter={(val) => [
                            `₹${val.toLocaleString()}`,
                            "Revenue",
                          ]}
                        />{" "}
                      </LineChart>{" "}
                    </ResponsiveContainer>{" "}
                  </div>{" "}
                </>
              )}{" "}
            </div>{" "}
          </div>{" "}
          <div className="dashboard-panel">
            {" "}
            <div className="panel-header">
              {" "}
              <div className="panel-title">Upcoming Events</div>{" "}
              <span
                onClick={() => navigate("/tasks/calendar")}
                className="panel-action"
                style={{ cursor: "pointer" }}
              >
                View Calendar
              </span>{" "}
            </div>{" "}
            <div className="feed-list" style={{ gap: 14 }}>
              {" "}
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((ev, i) => (
                  <div
                    className="event-item"
                    key={i}
                    style={{
                      borderLeft: ev.isOverdue ? "3px solid #ef4444" : "none",
                      paddingLeft: ev.isOverdue ? 6 : 0,
                    }}
                  >
                    {" "}
                    <div
                      style={{
                        background: ev.bg,
                        borderRadius: 0,
                        padding: "4px 8px",
                        textAlign: "center",
                        flexShrink: 0,
                        minWidth: 36,
                      }}
                    >
                      {" "}
                      <div
                        style={{
                          color: ev.col,
                          fontSize: 9,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {ev.month}
                      </div>{" "}
                      <div
                        style={{
                          color: "#0f172a",
                          fontSize: 16,
                          fontWeight: 800,
                          lineHeight: 1.1,
                        }}
                      >
                        {ev.day}
                      </div>{" "}
                    </div>{" "}
                    <div
                      className="feed-content"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {" "}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                        }}
                      >
                        {" "}
                        <div
                          className="feed-title"
                          style={{
                            color: ev.isOverdue ? "#ef4444" : "inherit",
                            flex: 1,
                            paddingRight: 6,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ev.title}
                        </div>{" "}
                        <span
                          style={{
                            fontSize: 9,
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: 0,
                            color: "#475569",
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        >
                          {ev.category}
                        </span>{" "}
                      </div>{" "}
                      <div
                        className="feed-desc"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {" "}
                        {ev.isOverdue && (
                          <AlertCircle size={10} color="#ef4444" />
                        )}{" "}
                        {ev.desc}{" "}
                      </div>{" "}
                    </div>{" "}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No Events"
                  message="No upcoming events."
                  height={180}
                  icon={Calendar}
                />
              )}{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <CommandCenter
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
      />{" "}
    </div>
  );
};
export default AdminDashboard;
