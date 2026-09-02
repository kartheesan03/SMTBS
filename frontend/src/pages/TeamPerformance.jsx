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

const MetricSlider = ({ label, value, color, onChg }) => {
  const [localVal, setLocalVal] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setLocalVal(String(value));
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    let v = parseInt(localVal, 10);
    if (isNaN(v)) v = 0;
    v = Math.min(100, Math.max(0, v));
    setLocalVal(String(v));
    onChg(v);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center" }}>
          <input 
            type="text" 
            value={isFocused ? localVal : value} 
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.target.blur();
              }
            }}
            onChange={e => {
              setLocalVal(e.target.value);
            }}
            style={{ 
              width: 48, textAlign: "center", fontSize: 15, fontWeight: 600, color: "#0f172a", 
              border: "1px solid #cbd5e1", outline: "none", background: "#ffffff", padding: "4px 8px", margin: 0,
              borderRadius: "6px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          />
          <span style={{ fontSize: 14, color: "#64748b", fontWeight: 400, marginLeft: 8 }}>/ 100</span>
        </div>
      </div>
    </div>
  );
};

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


    return (
      <div onClick={() => setEditModal(null)} style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 20px"
      }}>
        <div onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') setEditModal(null); }}
          tabIndex={-1} ref={el => {
            if (el && !el.contains(document.activeElement)) el.focus();
          }}
          style={{
          background: "#ffffff", borderRadius: 14, width: "100%", maxWidth: 680,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column",
          maxHeight: "calc(100vh - 64px)", overflow: "hidden",
          outline: "none"
        }}>
          {/* Header */}
          <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0f172a", margin: 0 }}>Edit Performance</h2>
            <button onClick={() => setEditModal(null)}
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", color: "#64748b", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}>
              <X size={18} />
            </button>
          </div>
          
          <div style={{ height: 1, background: "#e2e8f0" }} />

          {/* Context Strip */}
          <div style={{ background: "#f8fafc", padding: "12px 28px", borderBottom: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              {editModal.emp.id} &nbsp;|&nbsp; {editModal.emp.name} &nbsp;|&nbsp; {editModal.emp.dept}
            </span>
          </div>

          <div style={{ padding: "28px", overflowY: "auto", flex: 1, minHeight: 0 }}>
            {/* PERFORMANCE METRICS */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 24px" }}>
              Performance Metrics
            </h3>
            
            <MetricSlider label="Task Score"       value={ts}  color="#6366f1" onChg={v => setEditModal(p => ({ ...p, taskScore: v, overall: undefined, rating: undefined, appraisal: undefined }))} />
            <MetricSlider label="Attendance (Est.)" value={att} color="#10b981" onChg={v => setEditModal(p => ({ ...p, attendance: v, overall: undefined, rating: undefined, appraisal: undefined }))} />
            <MetricSlider label="Target Score"     value={tgt} color="#f59e0b" onChg={v => setEditModal(p => ({ ...p, targetScore: v, overall: undefined, rating: undefined, appraisal: undefined }))} />

            <div style={{ height: 1, background: "#e2e8f0", margin: "32px 0 28px" }} />

            {/* PERFORMANCE SUMMARY */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 20px" }}>
              Performance Summary
            </h3>
            
            <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
              {/* Overall */}
              <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Overall</label>
                <input 
                  type="text" value={ovr}
                  onChange={e => {
                    const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                    if (!isNaN(val)) setEditModal(p => ({ ...p, overall: val, rating: undefined, appraisal: undefined }));
                  }}
                  style={{ width: "100%", padding: 0, border: "none", background: "transparent", fontSize: 16, fontWeight: 600, color: "#0f172a", outline: "none" }}
                />
              </div>
              {/* Rating */}
              <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Rating</label>
                <input type="text" value={rtg}
                  onChange={e => setEditModal(p => ({ ...p, rating: e.target.value }))}
                  style={{ width: "100%", padding: 0, border: "none", background: "transparent", fontSize: 16, fontWeight: 600, color: rtgClr, outline: "none" }}
                />
              </div>
              {/* Est. Appraisal */}
              <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Est. Appraisal</label>
                <input type="text" value={apr}
                  onChange={e => setEditModal(p => ({ ...p, appraisal: e.target.value }))}
                  style={{ width: "100%", padding: 0, border: "none", background: "transparent", fontSize: 16, fontWeight: 600, color: "#10b981", outline: "none" }}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: "0 0 16px" }}>
                Reviewer Notes
              </h3>
              <textarea placeholder="Add reviewer notes, feedback, or remarks..."
                value={editModal.notes || ""}
                onChange={e => setEditModal(prev => ({ ...prev, notes: e.target.value }))}
                style={{
                  width: "100%", border: "1px solid #cbd5e1", borderRadius: 8,
                  padding: "12px 16px", fontSize: 14, color: "#334155",
                  resize: "none", outline: "none", fontFamily: "inherit",
                  boxSizing: "border-box", height: 100, transition: "border-color 0.2s",
                  lineHeight: 1.6, display: "block"
                }} 
                onFocus={e => e.currentTarget.style.borderColor = "#6366f1"}
                onBlur={e => e.currentTarget.style.borderColor = "#cbd5e1"}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff" }}>
            <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Esc to close</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setEditModal(null)}
                style={{ 
                  padding: "0 20px", height: 38, borderRadius: 6, border: "1px solid #cbd5e1", background: "#ffffff", 
                  fontSize: 14, fontWeight: 500, color: "#334155", cursor: "pointer", transition: "all 0.2s" 
                }}
                onMouseOver={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#0f172a"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = "#334155"; }}>
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
                padding: "0 20px", height: 38, borderRadius: 6, border: "none",
                background: "#4f46e5",
                fontSize: 14, fontWeight: 500, color: "#ffffff", cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#4338ca"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#4f46e5"; }}>
                Save Changes
              </button>
            </div>
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