import React, { useState, useEffect, useContext } from "react";
import {
  Plus,
  Folder,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  X,
  Calendar,
} from "lucide-react";
import API from "../api/axios";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import PageHeader from "../components/PageHeader";
import { AuthContext } from "../context/AuthContext";
import { canWrite } from "../utils/rbac";
import toast from "react-hot-toast";

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    manager: "",
    deadline: "",
    status: "Planning",
    priority: "Medium",
    color: "#3b82f6",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Project name is required");
    setSubmitting(true);
    try {
      await API.post("/projects", { ...form, progress: 0 });
      toast.success("Project created!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 0,
    fontSize: 14,
    color: "#0f172a",
    outline: "none",
    background: "#f8fafc",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 0,
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            New Project
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Project Name *
            </label>
            <input
              required
              style={inputStyle}
              placeholder="e.g. ERP Phase 2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Manager
            </label>
            <input
              style={inputStyle}
              placeholder="e.g. Ramesh Kumar"
              value={form.manager}
              onChange={(e) => setForm({ ...form, manager: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Status
              </label>
              <select
                style={inputStyle}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Planning</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delayed</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Priority
              </label>
              <select
                style={inputStyle}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <Calendar size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                Deadline
              </label>
              <input
                type="date"
                style={inputStyle}
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Color
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((c) => (
                  <div
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: c,
                      cursor: "pointer",
                      border: form.color === c ? "3px solid #0f172a" : "2px solid transparent",
                      boxSizing: "border-box",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 20px",
                border: "1px solid #e2e8f0",
                borderRadius: 0,
                background: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                color: "#64748b",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "9px 20px",
                border: "none",
                borderRadius: 0,
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useContext(AuthContext);
  const writeAccess = canWrite(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get("/projects");
      setProjectsList(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 size={16} color="#10b981" />;
      case "In Progress":
        return <Clock size={16} color="#3b82f6" />;
      case "Planning":
        return <Folder size={16} color="#f59e0b" />;
      case "Delayed":
        return <AlertCircle size={16} color="#ef4444" />;
      default:
        return <Folder size={16} color="#64748b" />;
    }
  };

  return (
    <div
      className="content-area"
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "calc(100vh - 70px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <PageHeader
          title="Projects"
          badge="PROJECTS"
          subtitle="Manage all active and past projects across departments."
        />
        {writeAccess && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 0,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            <Plus size={16} /> New Project
          </button>
        )}
      </div>
      <div
        className="dashboard-panel"
        style={{ padding: "20px", marginBottom: 24, display: "flex", gap: 16 }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={18}
            color="#94a3b8"
            style={{ position: "absolute", left: 12, top: 10 }}
          />
          <input
            type="text"
            placeholder="Search projects by name or manager..."
            style={{
              width: "100%",
              padding: "10px 10px 10px 38px",
              borderRadius: 0,
              border: "1px solid #e2e8f0",
              fontSize: 14,
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 0,
            cursor: "pointer",
            color: "#475569",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <Filter size={16} /> Filter
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {loading ? (
          <p style={{ color: "#64748b" }}>Loading projects...</p>
        ) : (
          projectsList
            .filter(
              (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.manager &&
                  p.manager.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((project) => (
              <div
                key={project.id}
                className="dashboard-panel"
                style={{
                  padding: "20px",
                  borderTop: `4px solid ${project.color || "#3b82f6"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    {project.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px",
                      backgroundColor: "#f1f5f9",
                      borderRadius: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#475569",
                    }}
                  >
                    {getStatusIcon(project.status)}
                    <span>{project.status}</span>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                      Progress
                    </span>
                    <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
                      {project.progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      backgroundColor: "#e2e8f0",
                      borderRadius: 0,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                        borderRadius: 0,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        marginBottom: 4,
                      }}
                    >
                      Deadline
                    </div>
                    <div style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "Not set"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        marginBottom: 4,
                      }}
                    >
                      Manager
                    </div>
                    <div style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                      {project.manager || "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};

export default Projects;
