import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Building2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Star,
  Plus,
  Eye,
  Edit,
  Trash2,
  Truck,
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { DataTable } from "../components/ui";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/vendors");
      setVendors(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchVendors();
  }, []);
  const handleDeleteVendor = async (row) => {
    const id = row._id || row.id;
    if (!id) return toast.error("Invalid vendor ID");
    if (
      window.confirm(
        `Are you sure you want to delete ${row.name}? This action cannot be undone.`
      )
    ) {
      try {
        await API.delete(`/vendors/${id}`);
        toast.success("Vendor deleted successfully.");
        fetchVendors();
      } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting vendor");
      }
    }
  };

  const activeVendors = vendors.filter((v) => {
    const s = (v.status || "Active").toLowerCase();
    return s === "active" || s === "vendor created";
  });
  const onHoldVendors = vendors.filter(
    (v) => (v.status || "").toLowerCase() === "on hold"
  );
  const totalOutstanding = vendors.reduce(
    (sum, v) => sum + (Number(v.outstanding) || 0),
    0
  );
  const formatCurrency = (val) => {
    if (!val || val === 0) return "₹0";
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString()}`;
  };
  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    const full = Math.floor(r);
    const half = r - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {" "}
        {[...Array(full)].map((_, i) => (
          <Star key={`f${i}`} size={14} fill="#f59e0b" color="#f59e0b" />
        ))}{" "}
        {half ? (
          <Star
            key="h"
            size={14}
            fill="#f59e0b"
            color="#f59e0b"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        ) : null}{" "}
        {[...Array(empty)].map((_, i) => (
          <Star key={`e${i}`} size={14} fill="none" color="#cbd5e1" />
        ))}{" "}
      </div>
    );
  };
  const columns = [
    {
      key: "name",
      label: "Vendor Name",
      sortable: true,
      render: (val, row) => {
        const fallbackNames = [
          "Ramesh",
          "Senthil Kumar",
          "Venkatesh",
          "Karthik",
          "Suresh",
          "Priya",
          "Meena",
          "Arun",
        ];
        let contact = row.contactPerson || row.email;
        if (!contact || contact === val) {
          const idx =
            Array.from(val || "A").reduce(
              (acc, char) => acc + char.charCodeAt(0),
              0
            ) % fallbackNames.length;
          contact = fallbackNames[idx];
        }
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {" "}
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#f1f5f9",
                borderRadius: "0px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
              }}
            >
              {" "}
              <Building2 size={20} />{" "}
            </div>{" "}
            <div>
              {" "}
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {val}
              </div>{" "}
              <div style={{ fontSize: 12, color: "#64748b" }}>{contact}</div>{" "}
            </div>{" "}
          </div>
        );
      },
    },
    { key: "category", label: "Category", sortable: true },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (val) => renderStars(val || 0),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const status = val || "Active";
        let badgeClass = "primary";
        if (status.toLowerCase().includes("active")) badgeClass = "success";
        else if (status.toLowerCase().includes("hold")) badgeClass = "warning";
        else if (status.toLowerCase().includes("created")) badgeClass = "info";
        return <span className={`ui-badge ${badgeClass}`}>{status}</span>;
      },
    },
    {
      key: "outstanding",
      label: "Outstanding",
      sortable: true,
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: "#ef4444" }}>
          ₹{(val || 0).toLocaleString()}
        </span>
      ),
    },
  ];
  const userInfo = JSON.parse(
    localStorage.getItem("userInfo") ||
      sessionStorage.getItem("userInfo") ||
      "{}"
  );
  const isAdmin = userInfo.role === "Admin";
  const isEmployeeOrSales =
    userInfo.role &&
    (userInfo.role.toLowerCase() === "employee" ||
      userInfo.role.toLowerCase() === "sales");
  const isManager = userInfo.role && userInfo.role.toLowerCase() === "manager";
  const canAddVendor = isAdmin || isManager;
  const actions = [
    {
      label: "View Profile",
      icon: Eye,
      onClick: (row) => navigate(`/vendors/${row._id || row.id}`),
    },
  ];
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
        <div className="rd-module-header">
          {" "}
          <div className="rd-module-info">
            {" "}
            <div className="rd-module-title-row">
              {" "}
              <span className="rd-module-title">Vendor Management</span>{" "}
              <span className="rd-module-badge">VENDORS</span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <StatsGrid>
          <StatsCard
            title="Total Vendors"
            value={vendors.length}
            colorTheme="blue"
            icon={Building2}
            trendValue="All partners"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Active"
            value={activeVendors.length}
            colorTheme="mint"
            icon={CheckCircle}
            trendValue="Good standing"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="On Hold"
            value={onHoldVendors.length}
            colorTheme="peach"
            icon={AlertTriangle}
            trendValue="Needs attention"
            trendPositive={false}
          />{" "}
          <StatsCard
            title="Total Outstanding"
            value={formatCurrency(totalOutstanding)}
            colorTheme="pink"
            icon={DollarSign}
            trendValue="Unpaid balance"
            trendPositive={false}
          />{" "}
        </StatsGrid>{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          style={{ marginTop: "24px" }}
        >
          {" "}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                background: "#fff",
                borderRadius: "0px",
                border: "1px solid #e2e8f0",
              }}
            >
              {" "}
              Loading vendor data...{" "}
            </div>
          ) : (
            <DataTable
              title="Vendor Directory"
              subtitle="Manage and track all registered suppliers and partners"
              columns={columns}
              data={vendors}
              actions={actions}
              searchPlaceholder="Search by name, company, or category..."
              primaryAction={
                canAddVendor
                  ? {
                      label: "Add Vendor",
                      icon: Plus,
                      onClick: () => navigate("/vendors/add-vendor"),
                    }
                  : undefined
              }
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Vendors;
