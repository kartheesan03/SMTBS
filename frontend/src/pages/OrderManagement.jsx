import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  Search,
  Plus,
  Eye,
  ArrowRight,
  Activity,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import toast from "react-hot-toast";
const OrderManagement = () => {
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo") ||
      sessionStorage.getItem("userInfo") ||
      "{}"
  );
  const userRole = userInfo.role || "";
  const writeAccess =
    userRole && !["employee", "sales"].includes(userRole.toLowerCase());
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusPeriod, setStatusPeriod] = useState("This Month");
  const [revenuePeriod, setRevenuePeriod] = useState("This Year");
  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders");
      let extractedOrders = [];
      if (Array.isArray(data)) extractedOrders = data;
      else if (data && Array.isArray(data.orders))
        extractedOrders = data.orders;
      else if (data && Array.isArray(data.data)) extractedOrders = data.data;
      setOrders(extractedOrders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  const activeOrders = orders.filter(
    (o) => !["Delivered", "Completed", "Cancelled"].includes(o.status)
  );
  const deliveredOrders = orders.filter((o) =>
    [
      "Delivered",
      "Completed",
      "Invoice Generated",
      "Workflow Completed",
    ].includes(o.status)
  );
  const salesOrders = orders.filter(
    (o) =>
      (o.orderType || "").toLowerCase() === "sales" ||
      String(o.orderNumber || "").startsWith("SO-")
  );
  const purchaseOrders = orders.filter(
    (o) =>
      (o.orderType || "").toLowerCase() === "purchase" ||
      String(o.orderNumber || o.poNumber || "").startsWith("PO-")
  );
  const salesRevenue = salesOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0),
    0
  );
  const purchaseCost = purchaseOrders.reduce(
    (sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0),
    0
  );
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const formatCurrency = (val) => {
    if (!val || val === 0) return "₹0";
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString()}`;
  };
  const filters = [
    "All",
    "Created",
    "Pending",
    "Processing",
    "In Transit",
    "Delivered",
  ];
  const filteredOrders = orders.filter((o) => {
    const status = o.status || "Created";
    const matchesFilter = activeFilter === "All" || status === activeFilter;
    const custName = o.customer?.company || o.customer?.name || "";
    const orderNum = o.orderNumber || "";
    const matchesSearch =
      !searchTerm ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orderNum.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const salesRevMap = {};
  const purchaseCostMap = {};
  let targetMonth = currentMonth;
  let targetYearForStatus = currentYear;
  if (statusPeriod === "Last Month") {
    targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    targetYearForStatus = currentMonth === 0 ? currentYear - 1 : currentYear;
  }
  const filteredOrdersForStatus = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === targetMonth && d.getFullYear() === targetYearForStatus
    );
  });
  const statusDistData = [
    {
      name: "Created",
      value:
        filteredOrdersForStatus.filter((o) =>
          ["New", "Created", "Pending"].includes(o.status)
        ).length || 0,
      fill: "#3b82f6",
    },
    {
      name: "Manager/Admin",
      value:
        filteredOrdersForStatus.filter((o) =>
          ["Pending Approval", "Manager/Admin Review"].includes(o.status)
        ).length || 0,
      fill: "#f59e0b",
    },
    {
      name: "Verification",
      value:
        filteredOrdersForStatus.filter((o) =>
          ["Employee Verification", "Awaiting Stock Check"].includes(o.status)
        ).length || 0,
      fill: "#8b5cf6",
    },
    {
      name: "Stock Issue",
      value:
        filteredOrdersForStatus.filter((o) =>
          [
            "Low Stock",
            "Low Stock Hold",
            "Out of Stock",
            "Waiting for Manager",
          ].includes(o.status)
        ).length || 0,
      fill: "#ef4444",
    },
    {
      name: "Processing",
      value:
        filteredOrdersForStatus.filter((o) =>
          [
            "Sales Processing",
            "Inventory Verified",
            "Ready for Delivery",
            "Processing",
            "In Transit",
          ].includes(o.status)
        ).length || 0,
      fill: "#f59e0b",
    },
    {
      name: "Out for Delivery",
      value:
        filteredOrdersForStatus.filter((o) => o.status === "Out for Delivery")
          .length || 0,
      fill: "#0ea5e9",
    },
    {
      name: "Delivered",
      value:
        filteredOrdersForStatus.filter((o) =>
          [
            "Delivered",
            "Invoice Generated",
            "Completed",
            "Workflow Completed",
          ].includes(o.status)
        ).length || 0,
      fill: "#10b981",
    },
  ];
  const targetYearForRevenue =
    revenuePeriod === "This Year" ? currentYear : currentYear - 1;
  orders.forEach((o) => {
    if (!o.createdAt) return;
    const date = new Date(o.createdAt);
    if (date.getFullYear() !== targetYearForRevenue) return;
    const month = monthNames[date.getMonth()];
    const amt = (Number(o.totalAmount) || Number(o.grandTotal) || 0) / 1000;
    const type = (o.orderType || "").toLowerCase();
    if (type === "sales" || String(o.orderNumber || "").startsWith("SO-")) {
      salesRevMap[month] = (salesRevMap[month] || 0) + amt;
    } else if (
      type === "purchase" ||
      String(o.orderNumber || o.poNumber || "").startsWith("PO-")
    ) {
      purchaseCostMap[month] = (purchaseCostMap[month] || 0) + amt;
    }
  });
  const monthsToShow =
    revenuePeriod === "This Year"
      ? monthNames.slice(0, currentMonth + 1)
      : monthNames;
  const revenueChartData = monthsToShow.map((month) => ({
    name: month,
    salesRevenue: Math.round(salesRevMap[month] || 0),
    purchaseCost: Math.round(purchaseCostMap[month] || 0),
  }));
  if (loading)
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="loader"></div>
      </div>
    );
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rd-container"
    >
      {" "}
      <div className="rd-content">
        {" "}
        {/* Module Header */}{" "}
        <div className="rd-module-header">
          {" "}
          <div className="rd-module-info">
            {" "}
            <div className="rd-module-title-row">
              {" "}
              <span className="rd-module-title">Order Management</span>{" "}
              <span className="rd-module-badge">ALL ORDERS</span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* KPI Cards */}{" "}
        <StatsGrid>
          {" "}
          <StatsCard
            title="Total Orders"
            value={orders.length}
            colorTheme="purple"
            icon={Package}
            trendValue="Combined sales & purchases"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Delivered"
            value={deliveredOrders.length}
            colorTheme="mint"
            icon={CheckCircle}
            trendValue="Successfully completed"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Sales Revenue"
            value={formatCurrency(salesRevenue)}
            colorTheme="blue"
            icon={DollarSign}
            trendValue="Total incoming"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Purchase Cost"
            value={formatCurrency(purchaseCost)}
            colorTheme="peach"
            icon={ShoppingCart}
            trendValue="Total outgoing"
            trendPositive={false}
          />{" "}
        </StatsGrid>{" "}
        {/* Charts */}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ display: "flex", gap: 24, marginBottom: 24 }}
        >
          {" "}
          <div className="rd-chart-card" style={{ flex: 1 }}>
            {" "}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {" "}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 0,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <Activity size={16} color="#3b82f6" />{" "}
                </div>{" "}
                <h3 className="rd-chart-title" style={{ margin: 0 }}>
                  Order Status Distribution
                </h3>{" "}
              </div>{" "}
              <select
                value={statusPeriod}
                onChange={(e) => setStatusPeriod(e.target.value)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 0,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  color: "#475569",
                  background: "#f8fafc",
                  outline: "none",
                  height: "fit-content",
                }}
              >
                {" "}
                <option>This Month</option> <option>Last Month</option>{" "}
              </select>{" "}
            </div>{" "}
            <div style={{ height: 200 }}>
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <BarChart data={statusDistData} barSize={24}>
                  {" "}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />{" "}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    dy={10}
                  />{" "}
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />{" "}
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: 0,
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />{" "}
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {" "}
                    {statusDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}{" "}
                  </Bar>{" "}
                </BarChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
          </div>{" "}
          <div className="rd-chart-card" style={{ flex: 1.5 }}>
            {" "}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              {" "}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {" "}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 0,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <TrendingUp size={16} color="#3b82f6" />{" "}
                </div>{" "}
                <h3 className="rd-chart-title" style={{ margin: 0 }}>
                  Monthly Order Revenue
                </h3>{" "}
              </div>{" "}
              <select
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 0,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  color: "#475569",
                  background: "#f8fafc",
                  outline: "none",
                  height: "fit-content",
                }}
              >
                {" "}
                <option>This Year</option> <option>Last Year</option>{" "}
              </select>{" "}
            </div>{" "}
            <div style={{ height: 200 }}>
              {" "}
              <ResponsiveContainer width="100%" height="100%">
                {" "}
                <BarChart data={revenueChartData} barGap={4} barSize={16}>
                  {" "}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />{" "}
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />{" "}
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => `${v}K`}
                  />{" "}
                  <Tooltip
                    formatter={(value) => `₹${value}K`}
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: 0,
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />{" "}
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  />{" "}
                  <Bar
                    dataKey="salesRevenue"
                    name="Sales Revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />{" "}
                  <Bar
                    dataKey="purchaseCost"
                    name="Purchase Cost"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                  />{" "}
                </BarChart>{" "}
              </ResponsiveContainer>{" "}
            </div>{" "}
          </div>{" "}
        </motion.div>{" "}
        {/* Table */}{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rd-table-card"
        >
          {" "}
          <div
            className="rd-table-header"
            style={{
              borderBottom: "1px solid var(--rd-border)",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {" "}
            <div>
              {" "}
              <div className="rd-table-title">Unified Order Register</div>{" "}
              <div className="rd-table-subtitle">
                All customer orders and vendor supply tracking
              </div>{" "}
            </div>{" "}
            <div className="rd-table-actions" style={{ flexWrap: "wrap" }}>
              {" "}
              <div
                className="rd-search-bar"
                style={{ minWidth: 220, flexShrink: 0, background: "#f8fafc" }}
              >
                {" "}
                <Search size={16} color="#94a3b8" />{" "}
                <input
                  type="text"
                  className="rd-search-input"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />{" "}
              </div>{" "}
              <div style={{ display: "flex", gap: 6 }}>
                {" "}
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid",
                      whiteSpace: "nowrap",
                      background: activeFilter === f ? "#3b82f6" : "#fff",
                      color: activeFilter === f ? "#fff" : "#64748b",
                      borderColor: activeFilter === f ? "#3b82f6" : "#e2e8f0",
                    }}
                  >
                    {f}
                  </button>
                ))}{" "}
              </div>{" "}
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {" "}
                {writeAccess && (
                  <button
                    className="rd-btn-solid"
                    onClick={() =>
                      navigate(
                        `/orders/create/${
                          window.location.pathname.includes("purchase")
                            ? "purchase"
                            : "sales"
                        }`
                      )
                    }
                  >
                    + New Order
                  </button>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="rd-table-scroll">
            {" "}
            <table
              className="rd-table rd-table-responsive"
              style={{ width: "100%" }}
            >
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th>ORDER ID</th> <th>TYPE</th> <th>CUSTOMER / VENDOR</th>{" "}
                  <th style={{ textAlign: "right" }}>AMOUNT</th>{" "}
                  <th>ORDERED</th> <th>PRIORITY</th> <th>STATUS</th>{" "}
                  <th>MANAGER</th>{" "}
                  <th style={{ textAlign: "center" }}>ACTION</th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#94a3b8",
                      }}
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o, i) => {
                    const orderId = o.orderNumber || "—";
                    const status = o.status || "—";
                    const statusColors = {
                      New: "rd-status-blue",
                      Created: "rd-status-blue",
                      "Manager/Admin Review": "rd-status-orange",
                      "Employee Verification": "rd-status-purple",
                      "Low Stock": "rd-status-red",
                      "Out of Stock": "rd-status-red",
                      "Waiting for Manager": "rd-status-orange",
                      "Purchase Completed": "rd-status-blue",
                      "Inventory Updated": "rd-status-blue",
                      "Inventory Verified": "rd-status-green",
                      "Sales Processing": "rd-status-orange",
                      "Out for Delivery": "rd-status-blue",
                      Delivered: "rd-status-green",
                      "Invoice Generated": "rd-status-green",
                      Cancelled: "rd-status-red",
                      "Awaiting Stock Check": "rd-status-purple",
                      "Ready for Delivery": "rd-status-orange",
                    };
                    const priorityColors = {
                      High: { color: "#ef4444", bg: "#fef2f2" },
                      Critical: { color: "#ef4444", bg: "#fef2f2" },
                      Normal: { color: "#64748b", bg: "#f8fafc" },
                      Low: { color: "#10b981", bg: "#ecfdf5" },
                    };
                    const pri = o.priority || "Normal";
                    const priStyle =
                      priorityColors[pri] || priorityColors["Normal"];
                    const type =
                      (o.orderType || "").toLowerCase() === "purchase" ||
                      String(orderId).startsWith("PO-")
                        ? "Purchase"
                        : "Sales";
                    const partyName =
                      o.customer?.company ||
                      o.customer?.name ||
                      o.vendor?.companyName ||
                      o.vendor?.name ||
                      "—";
                    return (
                      <tr
                        key={o._id || o.id || i}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/orders/${o._id || o.id}/tracking`)
                        }
                      >
                        {" "}
                        <td
                          style={{
                            fontWeight: 700,
                            color: "#3b82f6",
                            maxWidth: 110,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={orderId}
                          data-label="Order ID"
                        >
                          {orderId}
                        </td>{" "}
                        <td data-label="Type">
                          {" "}
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background:
                                type === "Purchase" ? "#fff7ed" : "#f0fdf4",
                              color:
                                type === "Purchase" ? "#ea580c" : "#16a34a",
                            }}
                          >
                            {" "}
                            {type.toUpperCase()}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--rd-text-main)",
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={partyName}
                          data-label="Customer/Vendor"
                        >
                          {partyName}
                        </td>{" "}
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--rd-text-main)",
                            textAlign: "right",
                          }}
                          data-label="Amount"
                        >
                          ₹
                          {(
                            Number(o.totalAmount) ||
                            Number(o.grandTotal) ||
                            0
                          ).toLocaleString()}
                        </td>{" "}
                        <td style={{ color: "#64748b" }} data-label="Ordered">
                          {o.createdAt
                            ? new Date(o.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                }
                              )
                            : "—"}
                        </td>{" "}
                        <td data-label="Priority">
                          {" "}
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 0,
                              fontSize: 12,
                              fontWeight: 700,
                              background: priStyle.bg,
                              color: priStyle.color,
                            }}
                          >
                            {" "}
                            {pri}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td data-label="Status">
                          {" "}
                          <span
                            className={`ui-badge ${
                              statusColors[status] === "rd-status-red"
                                ? "danger"
                                : statusColors[status] === "rd-status-green"
                                ? "success"
                                : statusColors[status] === "rd-status-orange" ||
                                  statusColors[status] === "rd-status-purple"
                                ? "warning"
                                : "primary"
                            }`}
                          >
                            {" "}
                            {status}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td style={{ color: "#475569" }} data-label="Manager">
                          {o.manager || o.salesRep || "—"}
                        </td>{" "}
                        <td style={{ textAlign: "center" }} data-label="Action">
                          {" "}
                          <button
                            className="rd-btn-compact outline"
                            style={{
                              padding: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                            title="View Order"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/orders/${o._id || o.id}/tracking`);
                            }}
                          >
                            {" "}
                            <Eye size={14} />{" "}
                          </button>{" "}
                        </td>{" "}
                      </tr>
                    );
                  })
                )}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </motion.div>{" "}
      </div>{" "}
    </motion.div>
  );
};
export default OrderManagement;
