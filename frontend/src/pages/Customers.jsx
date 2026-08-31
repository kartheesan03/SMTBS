import PageHeader from '../components/PageHeader';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Search, Plus, Download, Filter, User, Building2, UserCheck, AlertCircle, IndianRupee, Users, ArrowUpRight, ArrowDownRight, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import EmailCell from "../components/ui/EmailCell";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import { DataTable } from "../components/ui";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
const Customers = ({
  directoryOnly
}) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo") || "{}");
  const isAdmin = userInfo.role === "Admin" || userInfo.role === "Super Admin" || userInfo.email === "admin@smtbms.com";
  const isManager = userInfo.role === "Manager";
  const canAddCustomer = isAdmin || isManager;
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const {
        data
      } = await API.get("/customers");
      let fetchedData = Array.isArray(data) ? data : [];
      if (directoryOnly) {
        fetchedData = fetchedData.filter(c => c.status !== "Lead" && c.customerType !== "Lead");
      }
      setCustomers(fetchedData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);
  const handleDelete = async row => {
    const id = row._id || row.id;
    if (!id) return toast.error("Invalid customer ID");
    if (window.confirm(`Are you sure you want to delete ${row.name || row.company}?`)) {
      try {
        await API.delete(`/customers/${id}`);
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting customer");
      }
    }
  };
  const activeAccounts = customers.filter(c => (c.status || "Active") === "Active");
  const atRisk = customers.filter(c => c.status === "At Risk" || c.status === "Inactive");
  const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.revenue) || Number(c.totalRevenue) || 0), 0);
  const formatCurrency = val => {
    if (!val || val === 0) return "₹0";
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val.toLocaleString()}`;
  };
  const columns = [{
    key: "name",
    label: "Customer / Company",
    sortable: true,
    render: (val, row) => {
      let contact = row.contactPerson || val;
      if (!contact || contact === row.company || contact === "Individual Customer") {
        contact = "No Contact Person";
      } else if (row.company) {
        const n1 = contact.toLowerCase().split(" ")[0];
        const c1 = row.company.toLowerCase().split(" ")[0];
        if (n1 === c1) contact = "No Contact Person";
      }
      return <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
            <div style={{
          width: "40px",
          height: "40px",
          background: "#f1f5f9",
          borderRadius: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b"
        }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{
            fontWeight: 600,
            color: "#0f172a"
          }}>
                {row.company || val}
              </div>
              <div style={{
            fontSize: 12,
            color: "#64748b"
          }}>{contact}</div>
            </div>
          </div>;
    }
  }, {
    key: "email",
    label: "Contact Info",
    sortable: true,
    render: (val, row) => <div>
          <EmailCell email={val} />
          <div style={{
        fontSize: 12,
        color: "#64748b"
      }}>
            {row.phone || "No phone"}
          </div>
        </div>
  }, {
    key: "industry",
    label: "Industry",
    sortable: true,
    render: val => <div style={{ color: "#64748b" }}>{val || "N/A"}</div>
  }, {
    key: "website",
    label: "Website",
    sortable: true,
    render: val => <div style={{ color: "#64748b" }}>{val || "N/A"}</div>
  }, {
    key: "status",
    label: "Status",
    render: val => {
      const status = val || "Active";
      let badgeClass = "default";
      if (status === "Active") badgeClass = "success";else if (status === "Lead") badgeClass = "info";else if (status === "At Risk" || status === "Inactive") badgeClass = "danger";
      return <span className={`ui-badge ${badgeClass}`}>{status}</span>;
    }
  }];
  const isEmployeeOrSales = userInfo.role && (userInfo.role.toLowerCase() === "employee" || userInfo.role.toLowerCase() === "sales");
  const actions = [{
    label: "View Profile",
    icon: Eye,
    onClick: row => navigate(`/customers/${row._id || row.id}`)
  }, {
    label: "Edit",
    icon: Edit,
    onClick: row => navigate(`/customers/${row._id || row.id}/edit`)
  }];
  if (isAdmin) {
    actions.push({
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete
    });
  }
  return <motion.div initial={{
    opacity: 0,
    y: 15
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }} className="rd-container">
      <div className="rd-content">
        <PageHeader title="Customer Data Hub" />
        <StatsGrid>
          <StatsCard title="Total Accounts" value={customers.length} colorTheme="blue" icon={Users} trendValue="All customers" trendPositive={true} />
          <StatsCard title="Active" value={activeAccounts.length} colorTheme="mint" icon={UserCheck} trendValue="Ordering" trendPositive={true} />
          <StatsCard title="At Risk" value={atRisk.length} colorTheme="peach" icon={AlertCircle} trendValue="Churn warning" trendPositive={false} />
          <StatsCard title="LTV / Revenue" value={formatCurrency(totalRevenue)} colorTheme="purple" icon={IndianRupee} trendValue="Lifetime" trendPositive={true} />
        </StatsGrid>
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2,
        duration: 0.4
      }} style={{
        marginTop: "24px"
      }}>
          {loading ? <div style={{
          textAlign: "center",
          padding: "40px",
          background: "#fff",
          borderRadius: "0px",
          border: "1px solid #e2e8f0"
        }}>
              Loading customer data...
            </div> : <DataTable title="Customer Directory" subtitle="Manage and track all registered clients and leads" columns={columns} data={customers} actions={actions} primaryAction={canAddCustomer ? { label: "Add Customer", icon: Plus, onClick: () => navigate("/customers/new") } : null} searchPlaceholder="Search by name, company, or email..." />}
        </motion.div>
      </div>
    </motion.div>;
};
export default Customers;