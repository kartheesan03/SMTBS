import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import {
  Target,
  Zap,
  Handshake,
  DollarSign,
  Search,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { canWrite } from "../utils/rbac";
import { AuthContext } from "../context/AuthContext";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import { LoadingState } from "../components/DataStates";
const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = React.useContext(AuthContext);
  const writeAccess = canWrite(user);
  const fetchLeads = async () => {
    try {
      const { data } = await API.get("/customers");
      let fetchedData = Array.isArray(data) ? data : [];
      const augmentedLeads = fetchedData.map((l, idx) => {
        const statusLower = (l.status || "").toLowerCase();
        let stage = "New";
        if (statusLower === "active") stage = "Qualified";
        else if (statusLower === "contacted") stage = "Contacted";
        else if (statusLower === "negotiation") stage = "Negotiation";
        else if (statusLower === "proposal") stage = "Proposal Sent";
        else if (statusLower === "lead") stage = "New";
        return {
          ...l,
          source: l.industry || "Direct",
          stage,
          score: l.gstNumber ? 85 : l.company ? 70 : 50,
          estValue: l.company ? 150000 : 50000,
          assignedTo: l.createdBy?.name || "Sales Team",
        };
      });
      setLeads(augmentedLeads);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLeads();
  }, []);
  const hotLeads = leads.filter((l) => l.score >= 80);
  const inNegotiation = leads.filter((l) => l.stage === "Negotiation");
  const pipelineValue = leads.reduce(
    (sum, l) => sum + (Number(l.estValue) || 0),
    0
  );
  const filteredLeads = leads.filter((l) => {
    const matchesFilter = activeFilter === "All" || l.stage === activeFilter;
    const searchStr = `${l.company || ""} ${l.name || ""} ${
      l.contactPerson || ""
    } ${l.email || ""}`.toLowerCase();
    const matchesSearch =
      !searchTerm || searchStr.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const formatCurrency = (val) => {
    if (!val) return "₹0";
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
    return `₹${val.toLocaleString()}`;
  };
  const advanceLead = async (lead) => {
    if (!writeAccess) {
      toast.error("You do not have permission to modify leads.");
      return;
    }
    const stages = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation"];
    const currentIndex = stages.indexOf(lead.stage);
    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      const statusMap = {
        "New": "lead",
        "Contacted": "contacted",
        "Qualified": "active",
        "Proposal Sent": "proposal",
        "Negotiation": "negotiation"
      };
      try {
        const id = lead._id || lead.id || lead.customerId;
        await API.put(`/customers/${id}`, { status: statusMap[nextStage] });
        toast.success(`Lead advanced to ${nextStage}`);
        fetchLeads();
      } catch (err) {
        toast.error("Failed to advance lead.");
      }
    } else {
      toast.info("Lead is already at the final stage.");
    }
  };
  if (loading) return <LoadingState message="Loading..." height="100vh" />;
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
              <span className="rd-module-title">
                Lead Management Center
              </span>{" "}
              <span className="rd-module-badge">LEADS</span>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <StatsGrid>
          {" "}
          <StatsCard
            title="Total Leads"
            value={leads.length}
            colorTheme="blue"
            icon={Target}
            trendValue="All leads"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Hot Leads (≥80)"
            value={hotLeads.length}
            colorTheme="pink"
            icon={Zap}
            trendValue="High priority"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="In Negotiation"
            value={inNegotiation.length}
            colorTheme="purple"
            icon={Handshake}
            trendValue="Active talks"
            trendPositive={true}
          />{" "}
          <StatsCard
            title="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            colorTheme="mint"
            icon={DollarSign}
            trendValue="Potential revenue"
            trendPositive={true}
          />{" "}
        </StatsGrid>{" "}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rd-table-card"
        >
          {" "}
          <div
            className="rd-table-header"
            style={{
              borderBottom: "1px solid var(--rd-border)",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
            }}
          >
            {" "}
            <div>
              {" "}
              <div className="rd-table-title">Lead Register</div>{" "}
              <div className="rd-table-subtitle">
                Track and qualify incoming leads
              </div>{" "}
            </div>{" "}
            <div
              className="rd-table-actions"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "nowrap",
                gap: "16px",
                flexShrink: 0,
              }}
            >
              {" "}
              <div
                className="rd-search-bar"
                style={{ minWidth: 220, background: "#f8fafc" }}
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
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 0,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#1e293b",
                  fontWeight: 600,
                  outline: "none",
                  width: "auto",
                  flexShrink: 0,
                }}
              >
                {" "}
                <option value="All">All</option>{" "}
                <option value="New">New</option>{" "}
                <option value="Contacted">Contacted</option>{" "}
                <option value="Qualified">Qualified</option>{" "}
                <option value="Proposal Sent">Proposal Sent</option>{" "}
                <option value="Negotiation">Negotiation</option>{" "}
              </select>{" "}
              {writeAccess && (
                <button
                  className="rd-btn-solid"
                  onClick={() => navigate("/crm/add-customer?type=lead")}
                  style={{
                    background: "#0ea5e9",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  + New Lead
                </button>
              )}{" "}
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
                  <th>LEAD ID</th> <th>COMPANY</th> <th>CONTACT</th>{" "}
                  <th>SOURCE</th> <th>STAGE</th> <th>SCORE</th>{" "}
                  <th style={{ textAlign: "right" }}>EST. VALUE</th>{" "}
                  <th>ASSIGNED TO</th> <th>CREATED</th>{" "}
                  <th style={{ textAlign: "center" }}>ACTION</th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        textAlign: "center",
                        padding: 40,
                        color: "#94a3b8",
                      }}
                    >
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l, i) => {
                    const leadId =
                      l.customerId ||
                      l.id ||
                      l._id ||
                      `LED-${String(i + 1).padStart(3, "0")}`;
                    const scoreColor =
                      l.score >= 80
                        ? "#10b981"
                        : l.score >= 60
                        ? "#f59e0b"
                        : "#ef4444";
                    const scoreBg =
                      l.score >= 80
                        ? "#ecfdf5"
                        : l.score >= 60
                        ? "#fff7ed"
                        : "#fef2f2";
                    const stageColors = {
                      New: "#3b82f6",
                      Contacted: "#0ea5e9",
                      Qualified: "#10b981",
                      "Proposal Sent": "#f59e0b",
                      Negotiation: "#8b5cf6",
                    };
                    const stColor = stageColors[l.stage] || "#64748b";
                    return (
                      <tr key={l._id || l.id || leadId}>
                        {" "}
                        <td
                          style={{ fontWeight: 700, color: "#3b82f6" }}
                          data-label="Lead ID"
                        >
                          {leadId}
                        </td>{" "}
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--rd-text-main)",
                          }}
                          data-label="Company"
                        >
                          {l.company || l.name || "-"}
                        </td>{" "}
                        <td data-label="Contact">
                          {" "}
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {" "}
                            <span style={{ fontWeight: 600, color: "#475569" }}>
                              {l.name || l.contactPerson || "-"}
                            </span>{" "}
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>
                              {l.email || "-"}
                            </span>{" "}
                          </div>{" "}
                        </td>{" "}
                        <td data-label="Source">
                          {" "}
                          <span
                            style={{
                              padding: "4px 10px",
                              borderRadius: 0,
                              fontSize: 12,
                              fontWeight: 600,
                              background: "#eff6ff",
                              color: "#3b82f6",
                              border: "1px solid #bfdbfe",
                            }}
                          >
                            {" "}
                            {l.source}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td data-label="Stage">
                          {" "}
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 0,
                              fontSize: 12,
                              fontWeight: 600,
                              color: stColor,
                              border: `1.5px solid ${stColor}50`,
                            }}
                          >
                            {" "}
                            {l.stage}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td data-label="Score">
                          {" "}
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 0,
                              background: scoreBg,
                              color: scoreColor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 13,
                            }}
                          >
                            {" "}
                            {l.score}{" "}
                          </div>{" "}
                        </td>{" "}
                        <td
                          style={{
                            fontWeight: 700,
                            color: "#10b981",
                            textAlign: "right",
                          }}
                          data-label="Est. Value"
                        >
                          ₹{(l.estValue || 0).toLocaleString()}
                        </td>{" "}
                        <td
                          style={{ color: "#475569", fontWeight: 500 }}
                          data-label="Assigned To"
                        >
                          {l.assignedTo}
                        </td>{" "}
                        <td style={{ color: "#94a3b8" }} data-label="Created">
                          {l.createdAt
                            ? new Date(l.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>{" "}
                        <td style={{ textAlign: "center" }} data-label="Action">
                          {" "}
                          <button
                            className="rd-btn-compact"
                            style={{
                              background: "#0ea5e9",
                              color: "#fff",
                              border: "none",
                            }}
                            onClick={() => advanceLead(l)}
                          >
                            {" "}
                            Advance →{" "}
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

export default Leads;
