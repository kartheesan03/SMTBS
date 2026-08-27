import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import UserAvatar from "../components/UserAvatar";
import {
  Search,
  TrendingUp,
  Star,
  ThumbsUp,
  ThumbsDown,
  Award,
  MoreHorizontal,
  X,
  Edit3,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { motion } from "framer-motion";
import API from "../api/axios";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";

const TeamPerformance = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const menuRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setOpenMenuId(null);
    try {
      const [empRes, taskRes, attRes] = await Promise.all([
        API.get("/employees"),
        API.get("/tasks"),
        API.get("/attendance/all").catch(() => ({ data: [] })),
      ]);
      setEmployees(empRes.data || []);
      setTasks(taskRes.data || []);
      setAttendance(attRes.data?.employeeAttendanceList || attRes.data || []);
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const perfData = employees.map((emp) => {
    const userIdStr = String(emp.userId?._id || emp.userId || emp.id || "");
    const empTasks = tasks.filter((t) => {
      let assigned = t.assignedTo;
      if (typeof assigned === "string") {
        try { assigned = JSON.parse(assigned); } catch (e) { assigned = []; }
      }
      if (!Array.isArray(assigned)) assigned = [];
      return assigned.some((id) => String(id) === userIdStr);
    });
    const totalTasks = empTasks.length;
    let completedTasks = 0;
    empTasks.forEach((t) => {
      let completions = t.completions;
      if (typeof completions === "string") {
        try { completions = JSON.parse(completions); } catch (e) { completions = []; }
      }
      if (!Array.isArray(completions)) completions = [];
      const userComp = completions.find((c) => String(c.user) === userIdStr);
      if (userComp && userComp.status === "Completed") completedTasks++;
    });
    let taskScore = 0;
    if (totalTasks > 0) taskScore = Math.round((completedTasks / totalTasks) * 100);
    const targetScore = totalTasks > 0 ? Math.max(0, Math.min(100, Math.round(taskScore * 0.8))) : 0;
    const empAttendance = attendance.filter(
      (a) => String(a.employeeId?._id || a.employeeId || a.employee) === String(emp.id)
    );
    let attendanceScore = 0;
    if (empAttendance.length > 0) {
      const present = empAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
      attendanceScore = Math.round((present / empAttendance.length) * 100);
    }
    const overall = totalTasks > 0 ? Math.round((taskScore + attendanceScore + targetScore) / 3) : 0;
    let rating = "N/A";
    if (overall >= 90) rating = "Excellent";
    else if (overall >= 75) rating = "Good";
    else if (overall >= 60) rating = "Average";
    else if (totalTasks > 0) rating = "Below Average";
    let appraisal = "N/A";
    if (rating === "Excellent") appraisal = "12%";
    else if (rating === "Good") appraisal = "8%";
    else if (rating === "Average") appraisal = "4%";
    else if (rating === "Below Average") appraisal = "0%";
    let overrides = emp.performanceOverrides;
    if (typeof overrides === 'string') {
      try { overrides = JSON.parse(overrides); } catch (e) { overrides = null; }
    }
    overrides = overrides || {};

    return {
      dbId: emp.id || emp._id,
      id: emp.employeeId,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
      dept: emp.department || "General",
      kpi: overrides.taskScore !== undefined ? overrides.taskScore : taskScore,
      attendance: overrides.attendanceScore !== undefined ? overrides.attendanceScore : attendanceScore,
      targets: overrides.targetScore !== undefined ? overrides.targetScore : targetScore,
      overall: overrides.overall !== undefined ? overrides.overall : overall,
      rating: overrides.rating !== undefined ? overrides.rating : rating,
      appraisal: overrides.appraisal !== undefined ? overrides.appraisal : appraisal,
      notes: overrides.notes || ""
    };
  });

  const teamAvg = perfData.length > 0
    ? Math.round(perfData.reduce((sum, p) => sum + p.overall, 0) / perfData.length) : 0;
  const excellentCount = perfData.filter((p) => p.rating === "Excellent").length;
  const goodCount = perfData.filter((p) => p.rating === "Good").length;
  const belowAvgCount = perfData.filter((p) => p.rating === "Below Average" || p.rating === "Average").length;

  const renderMiniBar = (val, color) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 4, background: "#f1f5f9", borderRadius: 0, overflow: "hidden" }}>
        <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 0 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rd-text-main)", width: 28 }}>{val}</span>
    </div>
  );

  const renderCircularProgress = (val, color) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (val / 100) * circumference;
    return (
      <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="40" height="40" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
          <circle cx="20" cy="20" r={radius} fill="transparent" stroke={color} strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
        </svg>
        <span style={{ position: "absolute", fontSize: 11, fontWeight: 800, color }}>{val}</span>
      </div>
    );
  };

  const departments = ["All", ...new Set(perfData.map((p) => p.dept))];
  const filteredData = perfData.filter((record) => {
    const matchesSearch = !searchTerm ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All" || record.dept === deptFilter;
    const matchesRating = ratingFilter === "All Ratings" || record.rating === ratingFilter ||
      (ratingFilter === "Average" && record.rating === "Below Average");
    return matchesSearch && matchesDept && matchesRating;
  });

  /* ── Edit Performance Modal helper ── */
  const renderEditModal = () => {
    if (!editModal) return null;
    const ts  = Math.min(100, Math.max(0, editModal.taskScore  ?? editModal.emp.kpi));
    const att = Math.min(100, Math.max(0, editModal.attendance ?? editModal.emp.attendance));
    const tgt = Math.min(100, Math.max(0, editModal.targetScore ?? 0));
    const calcOvr = Math.round((ts + att + tgt) / 3);
    const ovr = editModal.overall !== undefined ? editModal.overall : calcOvr;

    let calcRtg = "N/A";
    if (ovr >= 90) calcRtg = "Excellent";
    else if (ovr >= 75) calcRtg = "Good";
    else if (ovr >= 60) calcRtg = "Average";
    else if (ts > 0 || att > 0) calcRtg = "Below Average";
    const rtg = editModal.rating !== undefined ? editModal.rating : calcRtg;

    let calcApr = "N/A";
    if (rtg === "Excellent") calcApr = "12%";
    else if (rtg === "Good") calcApr = "8%";
    else if (rtg === "Average") calcApr = "4%";
    else if (rtg === "Below Average") calcApr = "0%";
    const apr = editModal.appraisal !== undefined ? editModal.appraisal : calcApr;

    const rtgClr = { Excellent: "#10b981", Good: "#3b82f6", Average: "#f59e0b", "Below Average": "#ef4444", "N/A": "#94a3b8" }[rtg] || "#94a3b8";

    const Slider = ({ label, value, color, onChg }) => (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</span>
          <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${color}40` }}>
            <input 
              type="text" 
              value={value} 
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) onChg(Math.min(100, Math.max(0, v)));
                else if (e.target.value === '') onChg(0);
              }}
              style={{ 
                width: 36, textAlign: "center", fontSize: 16, fontWeight: 700, color: "#0f172a", 
                border: "none", outline: "none", background: "transparent", padding: 0, margin: 0 
              }}
            />
          </div>
        </div>
        <input type="range" min={0} max={100} value={value}
          onChange={e => onChg(Number(e.target.value))}
          style={{ width: "100%", accentColor: color, cursor: "pointer", margin: 0, height: 12 }} />
      </div>
    );

    return (
      <div onClick={() => setEditModal(null)} style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "#fff", borderRadius: 18, padding: "28px 32px",
          width: "100%", maxWidth: 520,
          boxShadow: "0 24px 60px rgba(15,23,42,0.2)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>Edit Performance</h2>
              <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>
                {editModal.emp.name} · {editModal.emp.id} · {editModal.emp.dept}
              </p>
            </div>
            <button onClick={() => setEditModal(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 20 }} />

          {/* Editable sliders */}
          <Slider label="Task Score"       value={ts}  color="#6366f1" onChg={v => setEditModal(p => ({ ...p, taskScore: v }))} />
          <Slider label="Attendance (Est)" value={att} color="#10b981" onChg={v => setEditModal(p => ({ ...p, attendance: v }))} />
          <Slider label="Target Score"     value={tgt} color="#f59e0b" onChg={v => setEditModal(p => ({ ...p, targetScore: v }))} />

          <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0 18px" }} />

          {/* Live summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            {/* Overall */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Overall</label>
              <input 
                type="text"
                value={ovr}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setEditModal(p => ({ ...p, overall: val }));
                  else if (e.target.value === '') setEditModal(p => ({ ...p, overall: 0 }));
                }}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6,
                  fontSize: 14, fontWeight: 600, color: "#0f172a", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            {/* Rating */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Rating</label>
              <input
                type="text"
                value={rtg}
                onChange={e => setEditModal(p => ({ ...p, rating: e.target.value }))}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6,
                  fontSize: 14, fontWeight: 600, color: "#0f172a", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
            {/* Est. Appraisal */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Est. Appraisal</label>
              <input
                type="text"
                value={apr}
                onChange={e => setEditModal(p => ({ ...p, appraisal: e.target.value }))}
                style={{
                  width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 6,
                  fontSize: 14, fontWeight: 600, color: "#0f172a", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Performance Notes</label>
            <textarea rows={3} placeholder="Add reviewer notes, feedback, or remarks..."
              value={editModal.notes}
              onChange={e => setEditModal(prev => ({ ...prev, notes: e.target.value }))}
              style={{
                width: "100%", border: "1px solid #e2e8f0", borderRadius: 8,
                padding: "10px 14px", fontSize: 13, color: "#0f172a",
                resize: "vertical", outline: "none", fontFamily: "inherit",
                boxSizing: "border-box", background: "#f8fafc",
              }} />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setEditModal(null)}
              style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 500, color: "#64748b", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={async () => {
              try {
                await API.put(`/employees/${editModal.emp.dbId}/performance`, {
                  taskScore: ts, attendanceScore: att, targetScore: tgt,
                  overall: ovr, rating: rtg, appraisal: apr, notes: editModal.notes,
                });
                toast.success(`Performance updated for ${editModal.emp.name}`);
                setEditModal(null);
                fetchData();
              } catch {
                toast.error("Failed to update performance. Please try again.");
              }
            }} style={{
              padding: "9px 20px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rd-container"
      >
        <div className="rd-content">
          {/* Module Header */}
          <PageHeader
            title="Performance Reviews"
            badge="HRMS"
            subtitle="Track, evaluate, and improve employee performance against defined goals and KPIs."
          />

          {/* KPI Cards */}
          <StatsGrid>
            <StatsCard title="Team Avg. Score" value={`${teamAvg}%`} colorTheme="blue" icon={TrendingUp} trendValue="Overall performance" trendPositive={teamAvg >= 75} />
            <StatsCard title="Excellent" value={excellentCount} colorTheme="mint" icon={Award} trendValue="Score ≥ 90" trendPositive={true} />
            <StatsCard title="Good" value={goodCount} colorTheme="yellow" icon={ThumbsUp} trendValue="Score 75–89" trendPositive={true} />
            <StatsCard title="Below Average" value={belowAvgCount} colorTheme="peach" icon={ThumbsDown} trendValue="Score < 75" trendPositive={false} />
          </StatsGrid>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="rd-table-card">
            <div className="rd-table-header" style={{ borderBottom: "none", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div className="rd-search-bar" style={{ minWidth: 250, flexShrink: 0, background: "#fff" }}>
                  <Search size={16} color="#94a3b8" />
                  <input type="text" className="rd-search-input" placeholder="Search employee..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                  style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 0, outline: "none", background: "#fff", color: "#64748b", fontSize: 14 }}>
                  {departments.map((d) => <option key={d} value={d}>{d === "All" ? "All Depts" : d}</option>)}
                </select>
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}
                  style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 0, outline: "none", background: "#fff", color: "#64748b", fontSize: 14 }}>
                  <option value="All Ratings">All Ratings</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Avg / Below</option>
                </select>
              </div>
            </div>

            <div className="rd-table-scroll">
              <table className="rd-table rd-table-responsive" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th style={{ width: 140 }}>Task Score</th>
                    <th style={{ width: 140 }}>Attendance (Est)</th>
                    <th style={{ width: 140 }}>Target Score</th>
                    <th>Overall</th>
                    <th>Rating</th>
                    <th>Est. Appraisal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Loading performance data...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No performance data found</td></tr>
                  ) : (
                    filteredData.map((emp, i) => (
                      <tr key={emp.id || i}>
                        <td data-label="Employee">
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <UserAvatar name={emp.name} size={32} fontSize={12} />
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--rd-text-main)" }}>{emp.name}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{emp.id}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Department">
                          <span style={{
                            background: emp.dept === "Finance" || emp.dept === "Sales" ? "#fff7ed" : "#ecfdf5",
                            color: emp.dept === "Finance" || emp.dept === "Sales" ? "#f59e0b" : "#10b981",
                            padding: "4px 10px", borderRadius: 0, fontSize: 12, fontWeight: 600,
                          }}>{emp.dept}</span>
                        </td>
                        <td data-label="Task Score">{renderMiniBar(emp.kpi, "#3b82f6")}</td>
                        <td data-label="Attendance">{renderMiniBar(emp.attendance, "#10b981")}</td>
                        <td data-label="Target Score">{renderMiniBar(emp.targets, "#8b5cf6")}</td>
                        <td data-label="Overall">
                          {renderCircularProgress(emp.overall, emp.overall >= 85 ? "#10b981" : emp.overall >= 60 ? "#f59e0b" : "#ef4444")}
                        </td>
                        <td data-label="Rating">
                          <span className={`ui-badge ${emp.rating === "Excellent" ? "success" : emp.rating === "Good" ? "primary" : "warning"}`}>
                            {emp.rating}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: "#10b981" }} data-label="Est. Appraisal">{emp.appraisal}</td>
                        <td data-label="Actions" style={{ position: "relative" }}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === emp.dbId ? null : emp.dbId)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px 8px", borderRadius: "6px", display: "flex", alignItems: "center" }}
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {openMenuId === emp.dbId && (
                            <div ref={menuRef} style={{
                              position: "absolute", right: 8, top: "100%", zIndex: 100,
                              background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px",
                              boxShadow: "0 8px 24px rgba(15,23,42,0.12)", minWidth: 170, overflow: "hidden",
                            }}>
                              <button
                                onClick={() => { setEditModal({ emp, taskScore: emp.kpi, attendance: emp.attendance, targetScore: emp.targets, overall: emp.overall, rating: emp.rating, appraisal: emp.appraisal, notes: emp.notes || "" }); setOpenMenuId(null); }}
                                style={{ width: "100%", background: "none", border: "none", padding: "10px 16px", textAlign: "left", fontSize: 13, fontWeight: 500, color: "#0f172a", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                onMouseLeave={e => e.currentTarget.style.background = "none"}
                              >
                                <Edit3 size={14} color="#6366f1" />
                                Edit Performance
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Performance Modal */}
      {renderEditModal()}
    </>
  );
};

export default TeamPerformance;