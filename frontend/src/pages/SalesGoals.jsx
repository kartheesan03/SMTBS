import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  AlertTriangle,
  TrendingUp,
  Search,
  Calendar,
  ChevronRight,
} from "lucide-react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  PageContainer,
  PageHeader,
  DataTable,
  DetailViewContainer,
} from "../components/ui";
const ProgressBar = ({ pct, label, status }) => {
  let color = "#3b82f6";
  if (status === "Achieved") color = "#10b981";
  else if (status === "At Risk") color = "#f59e0b";
  else if (status === "Failed") color = "#ef4444";
  return (
    <div style={{ marginTop: "16px" }}>
      {" "}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {" "}
        <span style={{ color: "#475569" }}>{label}</span>{" "}
        <span style={{ color }}>{pct}%</span>{" "}
      </div>{" "}
      <div
        style={{
          width: "100%",
          height: "8px",
          background: "#e2e8f0",
          borderRadius: "0px",
          overflow: "hidden",
        }}
      >
        {" "}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: color, borderRadius: "0px" }}
        />{" "}
      </div>{" "}
    </div>
  );
};
const CreateGoalModal = ({ onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    assignedTo: "",
    period: "Monthly",
    startDate: "",
    endDate: "",
    targetAmount: "",
    targetOrders: "",
  });
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/auth/users");
        setUsers(data);
      } catch (err) {
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/sales-goals", formData);
      toast.success("Sales Goal created!");
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create goal");
      setSubmitting(false);
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: "#fff",
          padding: "32px",
          borderRadius: "0px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        {" "}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          {" "}
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Create Sales Goal
          </h2>{" "}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            &times;
          </button>{" "}
        </div>{" "}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {" "}
          <div>
            {" "}
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Assign To
            </label>{" "}
            <select
              required
              className="ui-input"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
            >
              {" "}
              <option value="">Select User...</option>{" "}
              {users.map((u) => (
                <option key={u.id || u._id} value={u.id || u._id}>
                  {u.name}
                </option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {" "}
            <div>
              {" "}
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Period
              </label>{" "}
              <select
                required
                className="ui-input"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
              >
                {" "}
                <option>Monthly</option> <option>Quarterly</option>{" "}
                <option>Yearly</option> <option>Custom</option>{" "}
              </select>{" "}
            </div>{" "}
            <div>
              {" "}
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Target Revenue (₹)
              </label>{" "}
              <input
                type="number"
                required
                className="ui-input"
                placeholder="e.g. 50000"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
              />{" "}
            </div>{" "}
          </div>{" "}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {" "}
            <div>
              {" "}
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Start Date
              </label>{" "}
              <input
                type="date"
                required
                className="ui-input"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                End Date
              </label>{" "}
              <input
                type="date"
                required
                className="ui-input"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />{" "}
            </div>{" "}
          </div>{" "}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {" "}
            <button type="button" className="ui-btn-outline" onClick={onClose}>
              Cancel
            </button>{" "}
            <button
              type="submit"
              className="ui-btn-primary"
              disabled={submitting}
            >
              {" "}
              {submitting ? "Creating..." : "Create Goal"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </motion.div>{" "}
    </div>
  );
};
const SalesGoals = () => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/sales-goals/progress");
      setGoals(data);
    } catch (error) {
      toast.error("Failed to load sales goals");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGoals();
  }, []);
  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <PageContainer>
      <PageHeader
        title="Sales Goals & Targets"
        badge="SALES GOALS & TARGETS"
        subtitle="Set, monitor, and evaluate sales goals and performance targets."
        actions={[
          {
            label: "New Goal",
            icon: Plus,
            primary: true,
            onClick: () => setShowModal(true),
          },
        ]}
      />
      <DetailViewContainer>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              background: "#fff",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
            }}
          >
            <Target size={48} color="#94a3b8" style={{ marginBottom: "16px" }} />
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0f172a" }}>
              No active goals
            </h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              Get started by creating a new sales target for your team.
            </p>
            <button
              className="ui-btn-primary"
              style={{ marginTop: "24px" }}
              onClick={() => setShowModal(true)}
            >
              Create First Goal
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "24px",
            }}
          >
            {goals.map((goal) => {
              const statusColors = {
                "Achieved": { bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)", text: "#065f46", lightBg: "#d1fae5" },
                "At Risk": { bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", text: "#92400e", lightBg: "#fef3c7" },
                "Failed": { bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", text: "#991b1b", lightBg: "#fee2e2" },
                "On Track": { bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", text: "#1e40af", lightBg: "#dbeafe" }
              };
              const colors = statusColors[goal.status] || statusColors["On Track"];

              return (
                <motion.div
                  key={goal._id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
                    border: "1px solid #f1f5f9",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "6px",
                      background: colors.bg,
                    }}
                  />
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(goal.assignedTo?.name || 'User')}&background=f1f5f9&color=475569&bold=true&rounded=true`}
                        alt="avatar"
                        style={{ width: "42px", height: "42px", borderRadius: "50%" }}
                      />
                      <div>
                        <h3 style={{ margin: "0 0 2px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                          {goal.assignedTo?.name || "Unassigned"}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "12px", fontWeight: 500 }}>
                          <Calendar size={12} />
                          {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: colors.lightBg,
                      color: colors.text,
                      letterSpacing: "0.5px"
                    }}>
                      {goal.status}
                    </span>
                  </div>

                  <div style={{ 
                    background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)", 
                    borderRadius: "16px", 
                    padding: "20px", 
                    marginBottom: "20px" 
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Target size={14} /> Revenue Target
                      </span>
                      <span style={{ fontSize: "16px", color: "#0f172a", fontWeight: 700 }}>
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <TrendingUp size={14} /> Achieved
                      </span>
                      <span style={{ fontSize: "24px", background: colors.bg, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 }}>
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", fontWeight: 700 }}>
                      <span style={{ color: "#475569" }}>Progress</span>
                      <span style={{ color: colors.text }}>{goal.progressPct}%</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progressPct}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{ height: "100%", background: colors.bg, borderRadius: "8px" }}
                      />
                    </div>
                  </div>

                  {goal.targetOrders > 0 && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                      <span>Deal Target: <strong style={{color:"#0f172a"}}>{goal.targetOrders}</strong></span>
                      <span>Deals Closed: <strong style={{color:"#0f172a"}}>{goal.currentOrders}</strong></span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}{" "}
      </DetailViewContainer>{" "}
      {showModal && (
        <CreateGoalModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchGoals();
          }}
        />
      )}{" "}
    </PageContainer>
  );
};
export default SalesGoals;
