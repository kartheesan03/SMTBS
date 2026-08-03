import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  FileText,
  Plus,
  Search,
  FileDown,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { PageContainer, PageHeader, DataTable } from "../components/ui";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import { canWrite } from "../utils/rbac";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const Badge = ({ children, type = "default" }) => (
  <span className={`ui-badge ${type}`}>{children}</span>
);

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = React.useContext(AuthContext);
  const writeAccess = canWrite(user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const { data } = await API.get("/quotations");
        setQuotations(data);
      } catch (err) {
        toast.error("Failed to load quotations");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const columns = [
    { key: "quotationNumber", label: "Quote #", sortable: true },
    {
      key: "customerName",
      label: "Customer",
      sortable: true,
      render: (val, row) => row.customer?.name || val,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: "validUntil",
      label: "Valid Until",
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: "grandTotal",
      label: "Total Amount",
      sortable: true,
      render: (val) => `₹${val.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (val) => {
        const colors = {
          Draft: "secondary",
          Sent: "primary",
          Accepted: "success",
          Rejected: "danger",
          Expired: "warning",
          Converted: "info",
        };
        return <Badge type={colors[val] || "secondary"}>{val}</Badge>;
      },
    },
  ];

  const actions = [
    {
      label: "View Details",
      icon: ArrowRight,
      onClick: (row) => navigate(`/quotations/${row._id}`),
    },
  ];

  const stats = [
    {
      title: "Total Quotes",
      value: quotations.length,
      icon: FileText,
      colorTheme: "blue",
    },
    {
      title: "Pending Approval",
      value: quotations.filter(
        (q) => q.status === "Sent" || q.status === "Draft"
      ).length,
      icon: Clock,
      colorTheme: "yellow",
    },
    {
      title: "Accepted/Converted",
      value: quotations.filter(
        (q) => q.status === "Accepted" || q.status === "Converted"
      ).length,
      icon: CheckCircle,
      colorTheme: "mint",
    },
    {
      title: "Expired",
      value: quotations.filter((q) => q.status === "Expired").length,
      icon: XCircle,
      colorTheme: "pink",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Quotations"
        subtitle="Manage and track customer quotations and proposals"
        actions={
          writeAccess
            ? [
                {
                  label: "Create Quote",
                  icon: Plus,
                  primary: true,
                  onClick: () => navigate("/quotations/create"),
                },
              ]
            : []
        }
      />

      <StatsGrid>
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </StatsGrid>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <DataTable
          columns={columns}
          data={quotations}
          loading={loading}
          actions={actions}
          searchPlaceholder="Search by quote number or customer..."
        />
      </motion.div>
    </PageContainer>
  );
};

export default Quotations;
