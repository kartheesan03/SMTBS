import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceArea
} from 'recharts';
import { AuthContext } from "../../context/AuthContext";
import { Search, Eye } from "lucide-react";
import { motion } from "framer-motion";
import './OrderFinancesWidget.css';

const emptyData = [
  { name: 'Jan', sales: 0, purchases: 0 },
  { name: 'Feb', sales: 0, purchases: 0 },
  { name: 'Mar', sales: 0, purchases: 0 },
  { name: 'Apr', sales: 0, purchases: 0 },
  { name: 'May', sales: 0, purchases: 0 },
  { name: 'Jun', sales: 0, purchases: 0 },
  { name: 'Jul', sales: 0, purchases: 0 },
  { name: 'Aug', sales: 0, purchases: 0 },
  { name: 'Sep', sales: 0, purchases: 0 },
  { name: 'Oct', sales: 0, purchases: 0 },
  { name: 'Nov', sales: 0, purchases: 0 },
  { name: 'Dec', sales: 0, purchases: 0 },
];

const formatCurrency = (value) => {
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(value % 1000 !== 0 ? 1 : 0)}k`;
  }
  return `₹${value}`;
};

const formatFullCurrency = val => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val.toLocaleString()}`;
};

const statusColors = {
  Pending: "rd-status-orange",
  "Awaiting Approval": "rd-status-orange",
  Approved: "rd-status-green",
  Processing: "rd-status-blue",
  "In Transit": "rd-status-blue",
  Dispatched: "rd-status-blue",
  Delivered: "rd-status-green",
  Received: "rd-status-green",
  Cancelled: "rd-status-red",
  Rejected: "rd-status-red",
  "Employee Verification": "rd-status-blue",
  "Admin/Manager Review": "rd-status-orange",
  "Vendor Processing": "rd-status-blue",
  "Order Fulfillment": "rd-status-blue",
  Confirmed: "rd-status-blue",
  Shipped: "rd-status-blue"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bx-of-custom-tooltip">
        <div className="bx-of-tooltip-label">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="bx-of-tooltip-item">
            <div className="bx-of-tooltip-name">
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: entry.dataKey === 'purchases' ? '50%' : '2px',
                  backgroundColor: entry.color
                }}
              ></span>
              {entry.name}
            </div>
            <div className="bx-of-tooltip-value">
              {formatCurrency(entry.value)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const OrderFinancesWidget = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [viewAllYear, setViewAllYear] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [availableYears, setAvailableYears] = useState([2026, 2025, 2024]);
  const [chartData, setChartData] = useState(emptyData);

  const [monthDetails, setMonthDetails] = useState({ salesOrders: [], purchaseOrders: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Table states
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [poPage, setPoPage] = useState(1);
  const [soPage, setSoPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setPoPage(1);
    setSoPage(1);
  }, [activeFilter, searchTerm, selectedMonth, selectedYear, viewAllYear]);

  // Fetch Chart Data on Year Change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: res } = await API.get(`/orders/finances?year=${selectedYear}`);
        if (res.data) setChartData(res.data);
        if (res.availableYears?.length) setAvailableYears(res.availableYears);

        // Refresh details if already open
        if (viewAllYear) {
          handleViewAllDetails();
        } else if (selectedMonth) {
          handleMonthClick(selectedMonth);
        }
      } catch (err) {
        console.error('Error fetching order finances:', err);
      }
    };
    fetchData();
  }, [selectedYear]);

  const handleMonthClick = async (monthName) => {
    const monthIndex = emptyData.findIndex(m => m.name === monthName) + 1;
    if (monthIndex === 0) return;

    setSelectedMonth(monthName);
    setViewAllYear(false);
    setLoadingDetails(true);
    try {
      const { data } = await API.get(`/orders/finances?year=${selectedYear}&month=${monthIndex}`);
      setMonthDetails(data);
    } catch (err) {
      console.error('Error fetching month details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewAllDetails = async () => {
    setViewAllYear(true);
    setSelectedMonth(null);
    setLoadingDetails(true);
    try {
      const { data } = await API.get(`/orders/finances?year=${selectedYear}&details=true`);
      setMonthDetails(data);
    } catch (err) {
      console.error('Error fetching year details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderPagination = (total, currentPage, setPage) => {
    if (total <= itemsPerPage) return null;
    const totalPages = Math.ceil(total / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, total);
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--rd-border)' }}>
        <div style={{ color: '#64748b', fontSize: '14px' }}>
          Showing {start} to {end} of {total} records
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '4px', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{ padding: '6px 12px', border: '1px solid', background: currentPage === i + 1 ? '#6366f1' : '#fff', color: currentPage === i + 1 ? '#fff' : '#1e293b', borderColor: currentPage === i + 1 ? '#6366f1' : '#e2e8f0', cursor: 'pointer', borderRadius: '4px' }}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '4px', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderTableRows = (filteredList) => {
    if (filteredList.length === 0) {
      return (
        <tr>
          <td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            No orders found
          </td>
        </tr>
      );
    }
    return filteredList.map((order, i) => {
      const vendorName = order.vendor?.companyName || order.vendor?.name || order.customer?.company || order.customer?.name || "—";
      let itemDesc = "—";
      if (order.items && order.items.length > 0) {
        itemDesc = order.items.map(item => {
          const name = item.materialName || item.name || item.productName || (item.material && (item.material.name || item.material.materialName)) || "Item";
          const qty = item.quantity || item.qty || 0;
          const unit = item.unit || "pcs";
          return `${name} × ${qty} ${unit}`;
        }).join(", ");
      } else if (order.description || order.notes) {
        itemDesc = order.description || order.notes;
      }

      const amount = order.totalAmount || order.grandAmount || 0;
      const raised = order.orderDate || order.createdAt;
      const delivery = order.expectedDeliveryDate || order.deliveryDate;
      const priority = order.priority || "Normal";
      const status = order.status || "Pending";
      const isHighPriority = priority === "High" || priority === "Urgent";

      return (
        <tr key={order.id || i} style={{ height: "52px" }}>
          <td style={{ verticalAlign: "middle", fontWeight: 700, color: "#3b82f6", whiteSpace: "nowrap" }} data-label="ID">
            {order.orderNumber || order.poNumber || order.id || "—"}
          </td>
          <td style={{ verticalAlign: "middle", fontWeight: 600, color: "var(--rd-text-main)", whiteSpace: "normal", wordBreak: "break-word" }} data-label="Vendor/Customer">
            {vendorName}
          </td>
          <td style={{ verticalAlign: "middle", color: "#475569", whiteSpace: "normal", wordBreak: "break-word" }} data-label="Item Description">
            {itemDesc}
          </td>
          <td style={{ verticalAlign: "middle", fontWeight: 700, color: "var(--rd-text-main)", textAlign: "right" }} data-label="Amount">
            {formatFullCurrency(amount)}
          </td>
          <td style={{ verticalAlign: "middle", color: "#64748b" }} data-label="Raised">
            {raised ? new Date(raised).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"}
          </td>
          <td style={{ verticalAlign: "middle", color: "#64748b", textAlign: "center" }} data-label="Delivery">
            {delivery ? new Date(delivery).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—"}
          </td>
          <td style={{ verticalAlign: "middle" }} data-label="Status">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className={`ui-badge ${statusColors[status] === "rd-status-red" ? "danger" : statusColors[status] === "rd-status-green" ? "success" : statusColors[status] === "rd-status-orange" ? "warning" : "info"}`}>
                {status}
              </span>
              {isHighPriority && <span title={`${priority} Priority`} style={{ color: "#ef4444", fontSize: "14px" }}>🚩</span>}
            </div>
          </td>
          <td style={{ verticalAlign: "middle", textAlign: "center" }} data-label="Actions">
            <button className="rd-btn-compact outline" style={{ padding: "6px" }} title="View Order" onClick={() => navigate(`/orders/${order.id}/tracking`)}>
              <Eye size={14} />
            </button>
          </td>
        </tr>
      );
    });
  };

  const renderTableSection = (monthStr, sOrders, pOrders) => {
    const filters = ["All", "Pending", "Approved", "In Transit", "Delivered"];
    const filterFunction = o => {
      const matchesFilter = activeFilter === "All" || o.status === activeFilter;
      const matchesSearch = !searchTerm || String(o.orderNumber || o.poNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(o.vendor?.name || o.vendor?.companyName || o.customer?.name || o.customer?.company || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    };

    const filteredPurchaseOrders = pOrders.filter(filterFunction);
    const filteredSalesOrders = sOrders.filter(filterFunction);
    const paginatedPurchaseOrders = filteredPurchaseOrders.slice((poPage - 1) * itemsPerPage, poPage * itemsPerPage);
    const paginatedSalesOrders = filteredSalesOrders.slice((soPage - 1) * itemsPerPage, soPage * itemsPerPage);

    return (
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: 0 }}>
            {monthStr} {selectedYear}
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Sales Orders: {sOrders.length} Orders, {formatFullCurrency(sOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))} / Purchase Orders: {pOrders.length} Orders, {formatFullCurrency(pOrders.reduce((s, o) => s + (o.totalAmount || 0), 0))}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="rd-table-actions" style={{ flexWrap: "wrap", marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <div className="rd-search-bar" style={{ minWidth: 220, flexShrink: 0, background: "#f8fafc", display: 'flex', alignItems: 'center', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
            <Search size={16} color="#94a3b8" />
            <input type="text" className="rd-search-input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', width: '100%' }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid", background: activeFilter === f ? "#3b82f6" : "#fff", color: activeFilter === f ? "#fff" : "#64748b", borderColor: activeFilter === f ? "#3b82f6" : "#e2e8f0" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Purchase Orders Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="rd-table-card" style={{ marginBottom: "24px", background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div className="rd-table-header" style={{ padding: '16px', borderBottom: "1px solid var(--rd-border)", display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="rd-table-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Purchase Orders</div>
              <div className="rd-table-subtitle" style={{ color: '#64748b', fontSize: '0.9rem' }}>All procurement requests and approvals</div>
            </div>
            {user?.role !== "Employee" && user?.role !== "Sales" && (
              <button className="rd-btn-solid" style={{ background: '#0f172a', color: '#fff', padding: '8px 16px', borderRadius: '4px', fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => navigate("/orders/select-type")}>
                + Raise PO
              </button>
            )}
          </div>
          <div className="rd-table-scroll" style={{ overflowX: 'auto' }}>
            <table className="rd-table rd-table-responsive" style={{ width: "100%", borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ width: "15%", padding: '12px 16px' }}>PO ID</th>
                  <th style={{ width: "20%", padding: '12px 16px' }}>VENDOR</th>
                  <th style={{ width: "20%", padding: '12px 16px' }}>ITEM DESCRIPTION</th>
                  <th style={{ width: "12%", textAlign: "right", padding: '12px 16px' }}>AMOUNT</th>
                  <th style={{ width: "10%", padding: '12px 16px' }}>RAISED</th>
                  <th style={{ width: "10%", textAlign: "center", padding: '12px 16px' }}>DELIVERY</th>
                  <th style={{ width: "8%", padding: '12px 16px' }}>STATUS</th>
                  <th style={{ width: "5%", textAlign: "center", padding: '12px 16px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>{renderTableRows(paginatedPurchaseOrders)}</tbody>
            </table>
          </div>
          {renderPagination(filteredPurchaseOrders.length, poPage, setPoPage)}
        </motion.div>

        {/* Sales Orders Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="rd-table-card" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div className="rd-table-header" style={{ padding: '16px', borderBottom: "1px solid var(--rd-border)" }}>
            <div>
              <div className="rd-table-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sales Orders</div>
              <div className="rd-table-subtitle" style={{ color: '#64748b', fontSize: '0.9rem' }}>All customer sales and fulfillments</div>
            </div>
          </div>
          <div className="rd-table-scroll" style={{ overflowX: 'auto' }}>
            <table className="rd-table rd-table-responsive" style={{ width: "100%", borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ width: "15%", padding: '12px 16px' }}>SO ID</th>
                  <th style={{ width: "20%", padding: '12px 16px' }}>CUSTOMER</th>
                  <th style={{ width: "20%", padding: '12px 16px' }}>ITEM DESCRIPTION</th>
                  <th style={{ width: "12%", textAlign: "right", padding: '12px 16px' }}>AMOUNT</th>
                  <th style={{ width: "10%", padding: '12px 16px' }}>RAISED</th>
                  <th style={{ width: "10%", textAlign: "center", padding: '12px 16px' }}>DELIVERY</th>
                  <th style={{ width: "8%", padding: '12px 16px' }}>STATUS</th>
                  <th style={{ width: "5%", textAlign: "center", padding: '12px 16px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>{renderTableRows(paginatedSalesOrders)}</tbody>
            </table>
          </div>
          {renderPagination(filteredSalesOrders.length, soPage, setSoPage)}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bx-of-panel">
      {/* Header Area */}
      <div className="bx-of-header">
        <div>
          <h2 className="bx-of-title">Order Finances</h2>
          <div className="bx-of-subtitle">Receivable vs Payable Analytics</div>
        </div>
        <div className="bx-of-controls">
          <select
            className="bx-of-year-selector"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(yr => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <a href="#" className="bx-of-link" onClick={(e) => {
            e.preventDefault();
            handleViewAllDetails();
          }}>
            View details →
          </a>
        </div>
      </div>

      <div className="bx-of-legend-container">
        <div className="bx-of-legend-item">
          <span className="bx-of-legend-dot sales"></span>
          Receivable (Sales)
        </div>
        <div className="bx-of-legend-item">
          <span className="bx-of-legend-dot purchases"></span>
          Payable (Purchases)
        </div>
      </div>

      <div className="bx-of-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onMouseMove={(state) => {
              if (state?.isTooltipActive) {
                if (hoveredMonth !== state.activeLabel) {
                  setHoveredMonth(state.activeLabel);
                }
              } else {
                if (hoveredMonth !== null) {
                  setHoveredMonth(null);
                }
              }
            }}
            onMouseLeave={() => setHoveredMonth(null)}
            onClick={(state) => {
              if (state?.activeLabel) {
                handleMonthClick(state.activeLabel);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="colorSalesHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => val === 0 ? '0' : formatCurrency(val)}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(val) => val === 0 ? '0' : formatCurrency(val)}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />

            {hoveredMonth && (
              <ReferenceArea yAxisId="left" x1={hoveredMonth} x2={hoveredMonth} fill="#f1f5f9" fillOpacity={0.5} />
            )}

            {(selectedMonth && !hoveredMonth) && (
              <ReferenceArea yAxisId="left" x1={selectedMonth} x2={selectedMonth} fill="#f8fafc" fillOpacity={1} />
            )}

            <Bar
              yAxisId="left"
              dataKey="sales"
              name="Sales"
              barSize={32}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={(hoveredMonth === entry.name || selectedMonth === entry.name) ? "url(#colorSalesHover)" : "url(#colorSales)"}
                />
              ))}
            </Bar>

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="purchases"
              name="Purchases"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#ffffff', stroke: '#f97316' }}
              activeDot={{ r: 6, strokeWidth: 2, fill: '#ffffff', stroke: '#f97316' }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Drill-down Details Section */}
      <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        {loadingDetails && (
          <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '20px' }}>Loading orders...</div>
        )}

        {!loadingDetails && selectedMonth && (
          renderTableSection(selectedMonth, monthDetails.salesOrders || [], monthDetails.purchaseOrders || [])
        )}

        {!loadingDetails && viewAllYear && (
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '16px' }}>Order Finance Details — {selectedYear}</h3>
            {emptyData.map((month, idx) => {
              const mSales = (monthDetails.salesOrders || []).filter(o => new Date(o.orderDate || o.createdAt).getMonth() === idx);
              const mPurchases = (monthDetails.purchaseOrders || []).filter(o => new Date(o.orderDate || o.createdAt).getMonth() === idx);

              if (mSales.length === 0 && mPurchases.length === 0) return null;
              return (
                <div key={month.name} style={{ marginBottom: '40px' }}>
                  {renderTableSection(month.name, mSales, mPurchases)}
                </div>
              );
            })}
            {((monthDetails.salesOrders || []).length === 0 && (monthDetails.purchaseOrders || []).length === 0) && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No orders found for {selectedYear}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFinancesWidget;
