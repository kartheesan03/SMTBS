import PageHeader from '../components/PageHeader';
import React, { useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ShoppingCart, Clock, CheckCircle, IndianRupee, Search, Eye, Truck, FileText, Plus, Briefcase } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { LoadingState } from "../components/DataStates";
const ERP = () => {
  const navigate = useNavigate();
  const {
    user
  } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [poPage, setPoPage] = useState(1);
  const [soPage, setSoPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setPoPage(1);
    setSoPage(1);
  }, [activeFilter, searchTerm]);
  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      let extractedOrders = [];
      if (Array.isArray(res.data)) {
        extractedOrders = res.data;
      } else if (res.data && Array.isArray(res.data.orders)) {
        extractedOrders = res.data.orders;
      } else if (res.data && Array.isArray(res.data.data)) {
        extractedOrders = res.data.data;
      }
      setOrders(extractedOrders);
    } catch (error) {
      console.error("Failed to fetch ERP orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  const handleDeleteOrder = async id => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await API.delete(`/orders/${id}`);
        toast.success("Order deleted successfully");
        fetchOrders();
      } catch (err) {
        toast.error("Error deleting order");
      }
    }
  };
  const purchaseOrders = orders.filter(o => (o.orderType || "").toLowerCase() === "purchase" || String(o.orderNumber || o.poNumber || "").startsWith("PO-"));
  const salesOrders = orders.filter(o => (o.orderType || "").toLowerCase() === "sales" || String(o.orderNumber || "").startsWith("SO-"));
  const pendingOrders = purchaseOrders.filter(o => ["Pending", "Awaiting Approval"].includes(o.status));
  const approvedOrders = purchaseOrders.filter(o => ["Approved", "Processing", "In Transit", "Delivered"].includes(o.status));
  const totalPOValue = purchaseOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
  const filters = ["All", "Pending", "Approved", "In Transit", "Delivered"];
  const filterFunction = o => {
    const matchesFilter = activeFilter === "All" || o.status === activeFilter;
    const matchesSearch = !searchTerm || String(o.orderNumber || o.poNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(o.vendor?.name || o.vendor?.companyName || o.customer?.name || o.customer?.company || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  };
  const filteredPurchaseOrders = purchaseOrders.filter(filterFunction);
  const filteredSalesOrders = salesOrders.filter(filterFunction);
  
  const paginatedPurchaseOrders = filteredPurchaseOrders.slice((poPage - 1) * itemsPerPage, poPage * itemsPerPage);
  const paginatedSalesOrders = filteredSalesOrders.slice((soPage - 1) * itemsPerPage, soPage * itemsPerPage);
  const formatCurrency = val => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString()}`;
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
  const renderTableRows = filteredList => {
    if (filteredList.length === 0) {
      return <tr>
          <td colSpan={8} style={{
          textAlign: "center",
          padding: 40,
          color: "#94a3b8"
        }}>
            No orders found
          </td>
        </tr>;
    }
    return filteredList.map((order, i) => {
      const vendorName = order.vendor?.companyName || order.vendor?.name || order.vendorName || order.customer?.company || order.customer?.name || order.supplierName || "—";
      let itemDesc = "—";
      if (order.items && order.items.length > 0) {
        itemDesc = order.items.map(item => {
          const name = item.materialName || item.name || item.productName || item.material && (item.material.name || item.material.materialName) || "Item";
          const qty = item.quantity || item.qty || 0;
          const unit = item.unit || "pcs";
          return `${name} × ${qty} ${unit}`;
        }).join(", ");
      } else if (order.description || order.notes) {
        itemDesc = order.description || order.notes;
      }
      const amount = Number(order.totalAmount) || Number(order.grandTotal) || Number(order.amount) || 0;
      const raised = order.orderDate || order.createdAt || order.date;
      const delivery = order.deliveryDate || order.expectedDeliveryDate || order.expectedDelivery || order.dueDate;
      const priority = order.priority || "Normal";
      const status = order.status || "Pending";
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
      const isHighPriority = priority === "High" || priority === "Urgent";
      return <tr key={order._id || i} style={{
        height: "52px"
      }}>
          {" "}
          <td style={{
          verticalAlign: "middle",
          fontWeight: 700,
          color: "#3b82f6",
          whiteSpace: "nowrap"
        }} title={order.orderNumber || order.poNumber || order.id || "—"} data-label="ID">
            {order.orderNumber || order.poNumber || order.id || "—"}
          </td>{" "}
          <td style={{
          verticalAlign: "middle",
          fontWeight: 600,
          color: "var(--rd-text-main)",
          whiteSpace: "normal",
          wordBreak: "break-word"
        }} title={vendorName} data-label="Vendor/Customer">
            {vendorName}
          </td>{" "}
          <td style={{
          verticalAlign: "middle",
          color: "#475569",
          whiteSpace: "normal",
          wordBreak: "break-word"
        }} title={itemDesc} data-label="Item Description">
            {itemDesc}
          </td>{" "}
          <td style={{
          verticalAlign: "middle",
          fontWeight: 700,
          color: "var(--rd-text-main)",
          textAlign: "right"
        }} data-label="Amount">
            ₹{amount.toLocaleString()}
          </td>{" "}
          <td style={{
          verticalAlign: "middle",
          color: "#64748b"
        }} data-label="Raised">
            {raised ? new Date(raised).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
          }) : "—"}
          </td>{" "}
          <td style={{
          verticalAlign: "middle",
          color: "#64748b",
          textAlign: "center"
        }} data-label="Delivery">
            {delivery ? new Date(delivery).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
          }) : "—"}
          </td>{" "}
          <td style={{
          verticalAlign: "middle"
        }} data-label="Status">
            {" "}
            <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
              {" "}
              <span className={`ui-badge ${statusColors[status] === "rd-status-red" ? "danger" : statusColors[status] === "rd-status-green" ? "success" : statusColors[status] === "rd-status-orange" ? "warning" : "info"}`}>
                {" "}
                {status}{" "}
              </span>{" "}
              {isHighPriority && <span title={`${priority} Priority`} style={{
              color: "#ef4444",
              fontSize: "14px"
            }}>
                  🚩
                </span>}{" "}
            </div>{" "}
          </td>{" "}
          <td style={{
          verticalAlign: "middle",
          textAlign: "center"
        }} data-label="Actions">
            {" "}
            <button className="rd-btn-compact outline" style={{
            padding: "6px"
          }} title="View Order" onClick={() => navigate(`/orders/${order._id || order.id}/tracking`)}>
              {" "}
              <Eye size={14} />{" "}
            </button>{" "}
          </td>{" "}
        </tr>;
    });
  };
  if (loading) return <LoadingState message="Loading..." height="100vh" />;
  return <motion.div initial={{
    opacity: 0,
    y: 15
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }} className="rd-container">
      {" "}
      <div className="rd-content">
        {" "}
        {/* Module Header */}{" "}
        <PageHeader title="Procurement Management" />{" "}
        {/* KPI Cards */}{" "}
        <StatsGrid>
          {" "}
          <StatsCard title="Total POs" value={purchaseOrders.length} colorTheme="blue" icon={ShoppingCart} trendValue="Purchase Orders" trendPositive={true} />{" "}
          <StatsCard title="Total SOs" value={salesOrders.length} colorTheme="mint" icon={ShoppingCart} trendValue="Sales Orders" trendPositive={true} />{" "}
          <StatsCard title="Total PO Value" value={formatCurrency(totalPOValue)} colorTheme="purple" icon={IndianRupee} trendValue="Total spent" trendPositive={true} />{" "}
          <StatsCard title="Total SO Value" value={formatCurrency(salesOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0))} colorTheme="peach" icon={IndianRupee} trendValue="Total revenue" trendPositive={true} />{" "}
        </StatsGrid>{" "}
        {/* Purchase Orders Table */}{" "}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2,
        duration: 0.4
      }} className="rd-table-card" style={{
        marginBottom: "24px"
      }}>
          {" "}
          <div className="rd-table-header" style={{
          borderBottom: "1px solid var(--rd-border)",
          flexWrap: "wrap",
          gap: 16
        }}>
            {" "}
            <div>
              {" "}
              <div className="rd-table-title">Purchase Orders</div>{" "}
              <div className="rd-table-subtitle">
                All procurement requests and approvals
              </div>{" "}
            </div>{" "}
            <div className="rd-table-actions" style={{
            flexWrap: "wrap"
          }}>
              {" "}
              <div className="rd-search-bar" style={{
              minWidth: 220,
              flexShrink: 0,
              background: "#f8fafc"
            }}>
                {" "}
                <Search size={16} color="#94a3b8" />{" "}
                <input type="text" className="rd-search-input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />{" "}
              </div>{" "}
              <div style={{
              display: "flex",
              gap: 6
            }}>
                {" "}
                {filters.map(f => <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "6px 14px",
                borderRadius: 0,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                background: activeFilter === f ? "#3b82f6" : "#fff",
                color: activeFilter === f ? "#fff" : "#64748b",
                borderColor: activeFilter === f ? "#3b82f6" : "#e2e8f0"
              }}>
                    {f}
                  </button>)}{" "}
              </div>{" "}
              {user?.role !== "Employee" && user?.role !== "Sales" && <button className="rd-btn-solid" onClick={() => navigate("/orders/select-type")}>
                  + Raise PO
                </button>}{" "}
            </div>{" "}
          </div>{" "}
          <div className="rd-table-scroll">
            {" "}
            <table className="rd-table rd-table-responsive" style={{
            width: "100%"
          }}>
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th style={{
                  width: "15%"
                }}>PO ID</th>{" "}
                  <th style={{
                  width: "20%"
                }}>VENDOR</th>{" "}
                  <th style={{
                  width: "20%"
                }}>ITEM DESCRIPTION</th>{" "}
                  <th style={{
                  width: "12%",
                  textAlign: "right"
                }}>AMOUNT</th>{" "}
                  <th style={{
                  width: "10%"
                }}>RAISED</th>{" "}
                  <th style={{
                  width: "10%",
                  textAlign: "center"
                }}>
                    DELIVERY
                  </th>{" "}
                  <th style={{
                  width: "8%"
                }}>STATUS</th>{" "}
                  <th style={{
                  width: "5%",
                  textAlign: "center"
                }}>ACTIONS</th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody> {renderTableRows(paginatedPurchaseOrders)} </tbody>{" "}
            </table>{" "}
          </div>{" "}
          {renderPagination(filteredPurchaseOrders.length, poPage, setPoPage)}
        </motion.div>{" "}
        {/* Sales Orders Table */}{" "}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3,
        duration: 0.4
      }} className="rd-table-card">
          {" "}
          <div className="rd-table-header" style={{
          borderBottom: "1px solid var(--rd-border)",
          flexWrap: "wrap",
          gap: 16
        }}>
            {" "}
            <div>
              {" "}
              <div className="rd-table-title">Sales Orders</div>{" "}
              <div className="rd-table-subtitle">
                All customer sales and fulfillments
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="rd-table-scroll">
            {" "}
            <table className="rd-table rd-table-responsive" style={{
            width: "100%"
          }}>
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th style={{
                  width: "15%"
                }}>SO ID</th>{" "}
                  <th style={{
                  width: "20%"
                }}>CUSTOMER</th>{" "}
                  <th style={{
                  width: "20%"
                }}>ITEM DESCRIPTION</th>{" "}
                  <th style={{
                  width: "12%",
                  textAlign: "right"
                }}>AMOUNT</th>{" "}
                  <th style={{
                  width: "10%"
                }}>RAISED</th>{" "}
                  <th style={{
                  width: "10%",
                  textAlign: "center"
                }}>
                    DELIVERY
                  </th>{" "}
                  <th style={{
                  width: "8%"
                }}>STATUS</th>{" "}
                  <th style={{
                  width: "5%",
                  textAlign: "center"
                }}>ACTIONS</th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody> {renderTableRows(paginatedSalesOrders)} </tbody>{" "}
            </table>{" "}
          </div>{" "}
          {renderPagination(filteredSalesOrders.length, soPage, setSoPage)}
        </motion.div>{" "}
      </div>{" "}
    </motion.div>;
};
export default ERP;