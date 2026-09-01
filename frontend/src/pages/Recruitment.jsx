import PageHeader from '../components/PageHeader';
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Briefcase, Users, Calendar, CheckCircle, Plus, Search, Trash2, Edit2, X, ChevronDown, Star, MapPin, Clock, UserPlus, AlertCircle, ArrowRight, Building2, Eye } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { StatsCard, StatsGrid } from "../components/ui/StatsCard";
import "../components/AdminDashboard/AdminDashboardRedesign.css";
const STAGE_CONFIG = {
  Applied: {
    color: "#64748b",
    bg: "#f1f5f9",
    cls: "default"
  },
  Screening: {
    color: "#2563eb",
    bg: "#eff6ff",
    cls: "primary"
  },
  Interview: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    cls: "primary"
  },
  Offer: {
    color: "#f59e0b",
    bg: "#fffbeb",
    cls: "warning"
  },
  Hired: {
    color: "#059669",
    bg: "#ecfdf5",
    cls: "success"
  },
  Rejected: {
    color: "#ef4444",
    bg: "#fee2e2",
    cls: "danger"
  }
};
const JOB_STATUS = {
  Open: {
    color: "#059669",
    bg: "#ecfdf5"
  },
  "On Hold": {
    color: "#f59e0b",
    bg: "#fffbeb"
  },
  Closed: {
    color: "#64748b",
    bg: "#f1f5f9"
  },
  Filled: {
    color: "#2563eb",
    bg: "#eff6ff"
  }
};
const STAGES = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];
const JobModal = ({ job, onClose, onSave }) => {
  const modalRef = useRef(null);
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const [form, setForm] = useState(job ? {
    title: job.title,
    department: job.department || "",
    location: job.location || "",
    type: job.type || "Full-time",
    status: job.status === "On Hold" ? "Draft" : (job.status === "Open" ? "Published" : job.status),
    description: job.description || "",
    requirements: job.requirements || "",
    skills: job.skills || "",
    minExperience: job.minExperience || "",
    salaryMin: job.salaryMin || "",
    salaryMax: job.salaryMax || "",
    deadline: job.deadline || "",
    openings: job.openings || 1
  } : {
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    status: "Draft",
    description: "",
    requirements: "",
    skills: "",
    minExperience: "",
    salaryMin: "",
    salaryMax: "",
    deadline: "",
    openings: 1
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Job title is required";
    if (!form.department.trim()) errs.department = "Department is required";
    if (!form.type) errs.type = "Employment type is required";
    if (!form.openings || form.openings < 1) errs.openings = "At least 1 opening required";
    if (!form.description.trim()) errs.description = "Job description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (statusOverride) => {
    if (statusOverride === "Published" && !validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!form.title.trim()) {
      setErrors({ title: "Job title is required" });
      toast.error("Job title is required");
      return;
    }
    setSaving(true);
    let apiStatus = statusOverride || form.status;
    if (apiStatus === "Draft") apiStatus = "On Hold";
    if (apiStatus === "Published") apiStatus = "Open";

    const payload = { 
      ...form, 
      status: apiStatus,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : null,
      salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : null,
      openings: form.openings ? parseInt(form.openings, 10) : 1,
      deadline: form.deadline ? form.deadline : null
    };
    
    try {
      if (job) {
        const { data } = await API.put(`/recruitment/jobs/${job.id}`, payload);
        onSave(data, "edit", false);
        toast.success("Job updated!");
      } else {
        const { data } = await API.post("/recruitment/jobs", payload);
        const wasPublished = statusOverride === "Published";
        onSave(data, "add", wasPublished);
        toast.success(wasPublished ? "Job published!" : "Job saved as draft!");
      }
      onClose();
    } catch (err) {
      console.error('createJob error:', err?.response?.data || err?.message || err);
      toast.error(err?.response?.data?.message || "Failed to save job posting");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 };
  const reqStar = { color: "#ef4444", marginLeft: 2 };
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, outline: "none", boxSizing: "border-box", color: "#0f172a", background: "#fff",
    transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit"
  };
  const inputFocus = (e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)"; };
  const inputBlur = (e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; };
  const errBorder = { borderColor: "#fca5a5" };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px"
    }}>
      <div onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        tabIndex={-1} ref={modalRef}
        style={{
          background: "#fff", borderRadius: 14, width: "100%", maxWidth: 680,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 64px)",
          overflow: "hidden", outline: "none"
        }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#0f172a" }}>
              {job ? "Edit Job Posting" : "Create Job Posting"}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", fontWeight: 400 }}>
              {job ? "Update the details of this position" : "Fill in the details to create a new job posting"}
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", cursor: "pointer", color: "#64748b", padding: 6, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseOver={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
            onMouseOut={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.color = "#64748b"; }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ height: 1, background: "#e2e8f0" }} />

        {/* Scrollable body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, minHeight: 0 }}>
          {/* Job Title */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Job Title<span style={reqStar}>*</span></label>
            <input name="title" value={form.title} onChange={handle}
              placeholder="e.g. Senior Software Engineer, Operations Manager"
              style={{ ...inputStyle, ...(errors.title ? errBorder : {}) }}
              onFocus={inputFocus} onBlur={inputBlur} />
            {errors.title && <span style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.title}</span>}
          </div>

          {/* Department + Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Department<span style={reqStar}>*</span></label>
              <input name="department" value={form.department} onChange={handle}
                placeholder="e.g. Engineering, HR, Sales"
                style={{ ...inputStyle, ...(errors.department ? errBorder : {}) }}
                onFocus={inputFocus} onBlur={inputBlur} />
              {errors.department && <span style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.department}</span>}
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input name="location" value={form.location} onChange={handle}
                placeholder="e.g. Chennai, Remote, Hybrid"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          {/* Type + Openings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Employment Type<span style={reqStar}>*</span></label>
              <select name="type" value={form.type} onChange={handle}
                style={{ ...inputStyle, ...(errors.type ? errBorder : {}) }}
                onFocus={inputFocus} onBlur={inputBlur}>
                {["Full-time", "Part-time", "Contract", "Internship"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Number of Openings<span style={reqStar}>*</span></label>
              <input type="text" inputMode="numeric" name="openings" value={form.openings}
                onChange={handle} placeholder="1"
                style={{ ...inputStyle, ...(errors.openings ? errBorder : {}) }}
                onFocus={inputFocus} onBlur={inputBlur} />
              {errors.openings && <span style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.openings}</span>}
            </div>
          </div>

          {/* Salary Range + Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Salary Min (₹)</label>
              <input type="text" inputMode="numeric" name="salaryMin" value={form.salaryMin}
                onChange={handle} placeholder="300000" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={labelStyle}>Salary Max (₹)</label>
              <input type="text" inputMode="numeric" name="salaryMax" value={form.salaryMax}
                onChange={handle} placeholder="600000" style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={labelStyle}>Application Deadline</label>
              <input type="date" name="deadline" value={form.deadline} onChange={handle}
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0 20px" }} />

          {/* Job Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Job Description<span style={reqStar}>*</span></label>
            <textarea name="description" value={form.description} onChange={handle} rows={4}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 100, ...(errors.description ? errBorder : {}) }}
              onFocus={inputFocus} onBlur={inputBlur} />
            {errors.description && <span style={{ fontSize: 12, color: "#ef4444", marginTop: 4, display: "block" }}>{errors.description}</span>}
          </div>

          {/* Required Skills + Min Experience */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Required Skills</label>
              <input name="skills" value={form.skills} onChange={handle}
                placeholder="e.g. React, Node.js, SQL"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label style={labelStyle}>Minimum Experience</label>
              <input name="minExperience" value={form.minExperience} onChange={handle}
                placeholder="e.g. 3 years, Fresher"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>

          {/* Requirements / qualifications */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Requirements / Qualifications</label>
            <textarea name="requirements" value={form.requirements} onChange={handle} rows={3}
              placeholder="e.g. Bachelor's degree in CS, 5+ years of experience in supply chain management..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
              onFocus={inputFocus} onBlur={inputBlur} />
          </div>

          {/* Job Status */}
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Job Status</label>
            <select name="status" value={form.status} onChange={handle}
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur}>
              {["Draft", "Published"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Esc to close</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{
                padding: "0 18px", height: 38, borderRadius: 7, border: "1px solid #cbd5e1", background: "#fff",
                fontSize: 14, fontWeight: 500, color: "#334155", cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#f8fafc"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#fff"; }}>
              Cancel
            </button>
            {!job && (
              <button type="button" onClick={() => submit("Draft")} disabled={saving}
                style={{
                  padding: "0 18px", height: 38, borderRadius: 7, border: "1px solid #cbd5e1", background: "#fff",
                  fontSize: 14, fontWeight: 500, color: "#334155", cursor: saving ? "not-allowed" : "pointer",
                  transition: "all 0.2s", opacity: saving ? 0.7 : 1
                }}
                onMouseOver={e => { if (!saving) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#fff"; }}>
                {saving ? "Saving…" : "Save as Draft"}
              </button>
            )}
            <button type="button" onClick={() => submit(job ? form.status : "Published")} disabled={saving}
              style={{
                padding: "0 20px", height: 38, borderRadius: 7, border: "none",
                background: "#4f46e5", fontSize: 14, fontWeight: 500, color: "#fff",
                cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s",
                opacity: saving ? 0.7 : 1
              }}
              onMouseOver={e => { if (!saving) e.currentTarget.style.background = "#4338ca"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#4f46e5"; }}>
              {saving ? "Saving…" : job ? "Save Changes" : "Publish Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const CandidateModal = ({
  jobs,
  candidate,
  onClose,
  onSave
}) => {
  const [form, setForm] = useState(candidate ? {
    jobId: candidate.jobId,
    name: candidate.name,
    email: candidate.email || "",
    phone: candidate.phone || "",
    stage: candidate.stage,
    source: candidate.source || "",
    notes: candidate.notes || "",
    rating: candidate.rating || 0
  } : {
    jobId: jobs[0]?.id || "",
    name: "",
    email: "",
    phone: "",
    stage: "Applied",
    source: "",
    notes: "",
    rating: 0
  });
  const [saving, setSaving] = useState(false);
  const handle = e => setForm(f => ({
    ...f,
    [e.target.name]: e.target.value
  }));
  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (candidate) {
        const {
          data
        } = await API.put(`/recruitment/candidates/${candidate.id}`, form);
        onSave(data, "edit");
        toast.success("Candidate updated!");
      } else {
        const {
          data
        } = await API.post("/recruitment/candidates", form);
        onSave(data, "add");
        toast.success("Candidate added!");
      }
      onClose();
    } catch {
      toast.error("Failed to save candidate");
    } finally {
      setSaving(false);
    }
  };
  const inp = {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 0,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    color: "#0f172a",
    background: "#fff"
  };
  return <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}>
      <div style={{
      background: "#fff",
      borderRadius: 0,
      padding: 28,
      width: 480,
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
    }}>
        <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
      }}>
          <h2 style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 800,
          color: "#0f172a"
        }}>
            {candidate ? "Update Candidate" : "Add Candidate"}
          </h2>
          <button onClick={onClose} style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#64748b"
        }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} style={{
        display: "flex",
        flexDirection: "column",
        gap: 13
      }}>
          <div>
            <label style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            display: "block",
            marginBottom: 5
          }}>
              Applying For *
            </label>
            <select name="jobId" value={form.jobId} onChange={handle} style={inp}>
              {jobs.map(j => <option key={j.id} value={j.id}>
                  {j.title}
                </option>)}
            </select>
          </div>
          <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12
        }}>
            <div>
              <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              display: "block",
              marginBottom: 5
            }}>
                Full Name *
              </label>
              <input name="name" value={form.name} onChange={handle} placeholder="Candidate name" style={inp} required />
            </div>
            <div>
              <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              display: "block",
              marginBottom: 5
            }}>
                Email
              </label>
              <input type="email" name="email" value={form.email} onChange={handle} placeholder="email@example.com" style={inp} />
            </div>
          </div>
          <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12
        }}>
            <div>
              <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              display: "block",
              marginBottom: 5
            }}>
                Phone
              </label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" style={inp} />
            </div>
            <div>
              <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              display: "block",
              marginBottom: 5
            }}>
                Stage
              </label>
              <select name="stage" value={form.stage} onChange={handle} style={inp}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              display: "block",
              marginBottom: 5
            }}>
                Source
              </label>
              <input name="source" value={form.source} onChange={handle} placeholder="LinkedIn" style={inp} />
            </div>
          </div>
          <div>
            <label style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            display: "block",
            marginBottom: 5
          }}>
              Notes
            </label>
            <textarea name="notes" value={form.notes} onChange={handle} rows={2} placeholder="Interview notes, observations…" style={{
            ...inp,
            resize: "vertical"
          }} />
          </div>
          <div>
            <label style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#475569",
            display: "block",
            marginBottom: 5
          }}>
              Rating (1-5)
            </label>
            <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10
          }}>
              <div style={{
              display: "flex",
              gap: 4
            }}>
                {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => setForm(f => ({
                ...f,
                rating: n
              }))} style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 4,
                transition: "transform 0.15s ease",
                transform: form.rating >= n ? "scale(1.15)" : "scale(1)"
              }} title={`Rate ${n} out of 5`}>
                    <Star size={24} fill={form.rating >= n ? "#f59e0b" : "none"} color={form.rating >= n ? "#f59e0b" : "#cbd5e1"} strokeWidth={1.5} />
                  </button>)}
              </div>
              <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: form.rating > 0 ? "#f59e0b" : "#94a3b8",
              minWidth: 28
            }}>
                {form.rating > 0 ? `${form.rating}/5` : "—"}
              </span>
            </div>
          </div>
          <button type="submit" disabled={saving} style={{
          padding: "11px 0",
          borderRadius: 0,
          border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1
        }}>
            {saving ? "Saving…" : candidate ? "Update Candidate" : "Add Candidate"}
          </button>
        </form>
      </div>
    </div>;
};

/* ─────────── Publish Success Modal ─────────── */
const PublishSuccessModal = ({ job, onClose }) => {
  const publicUrl = `${window.location.origin}/jobs/${job.slug}`;
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '32px 32px 24px', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🎉</div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 800 }}>Job Published!</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 14 }}>{job.title} is now live and accepting applications.</p>
        </div>
        <div style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Public URL</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#4f46e5', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {publicUrl}
              </div>
              <button onClick={copyLink} style={{ flexShrink: 0, padding: '10px 16px', background: copied ? '#10b981' : '#f1f5f9', border: '1.5px solid ' + (copied ? '#10b981' : '#e2e8f0'), borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: copied ? '#fff' : '#475569', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close</button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              View Job →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const Recruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [jobModal, setJobModal] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [candModal, setCandModal] = useState(false);
  const [editCand, setEditCand] = useState(null);
  const [publishedJob, setPublishedJob] = useState(null);
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [j, c, s] = await Promise.all([API.get("/recruitment/jobs").catch(() => ({
        data: []
      })), API.get("/recruitment/candidates").catch(() => ({
        data: []
      })), API.get("/recruitment/stats").catch(() => ({
        data: {}
      }))]);
      setJobs(j.data || []);
      setCandidates(c.data || []);
      setStats(s.data || {});
    } catch {} finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAll();
  }, []);
  const handleJobSave = (saved, action, wasPublished) => {
    if (action === "add") setJobs(prev => [saved, ...prev]); else setJobs(prev => prev.map(j => j.id === saved.id ? saved : j));
    if (wasPublished && saved.slug) {
      setPublishedJob(saved);
    }
    fetchAll();
  };
  const handleCandSave = (saved, action) => {
    if (action === "add") setCandidates(prev => [saved, ...prev]);else setCandidates(prev => prev.map(c => c.id === saved.id ? saved : c));
    fetchAll();
  };
  const deleteJob = async id => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await API.delete(`/recruitment/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success("Deleted");
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };
  const deleteCand = async id => {
    if (!window.confirm("Remove this candidate?")) return;
    try {
      await API.delete(`/recruitment/candidates/${id}`);
      setCandidates(prev => prev.filter(c => c.id !== id));
      fetchAll();
      toast.success("Removed");
    } catch {
      toast.error("Delete failed");
    }
  };
  const moveStage = async (cand, stage) => {
    try {
      const {
        data
      } = await API.put(`/recruitment/candidates/${cand.id}`, {
        stage
      });
      setCandidates(prev => prev.map(c => c.id === cand.id ? {
        ...c,
        stage
      } : c));
      fetchAll();
    } catch {
      toast.error("Update failed");
    }
  };
  const filteredJobs = jobs.filter(j => (j.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || (j.department || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCands = candidates.filter(c => {
    const matchSearch = (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (c.job?.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = stageFilter === "All" || c.stage === stageFilter;
    return matchSearch && matchStage;
  });
  const pipelineCounts = STAGES.reduce((acc, s) => ({
    ...acc,
    [s]: candidates.filter(c => c.stage === s).length
  }), {});
  return <motion.div initial={{
    opacity: 0,
    y: 15
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4
  }} className="rd-container">
      {/* Modals */}
      {(jobModal || editJob) && <JobModal job={editJob} onClose={() => {
      setJobModal(false);
      setEditJob(null);
    }} onSave={handleJobSave} />}
      {(candModal || editCand) && <CandidateModal jobs={jobs} candidate={editCand} onClose={() => {
      setCandModal(false);
      setEditCand(null);
    }} onSave={handleCandSave} />}
      {publishedJob && <PublishSuccessModal job={publishedJob} onClose={() => setPublishedJob(null)} />}
      <div className="rd-content">
        {/* ── Header ── */}
        <PageHeader title="Recruitment" actions={[
          { label: "Post Job", icon: Plus, primary: true, onClick: () => setJobModal(true), style: { height: 40, borderRadius: 7, fontWeight: 500, fontSize: 14 } }
        ]} />
        {/* ── KPI Cards ── */}
        <StatsGrid>
          <StatsCard title="Open Positions" value={loading ? "…" : stats.openJobs || 0} colorTheme="blue" icon={Briefcase} trendValue="Active job postings" trendPositive={true} />
          <StatsCard title="Total Applicants" value={loading ? "…" : stats.totalApplied || 0} colorTheme="purple" icon={Users} trendValue="All applications" trendPositive={true} />
          <StatsCard title="In Interview" value={loading ? "…" : stats.interviews || 0} colorTheme="yellow" icon={Calendar} trendValue="Scheduled interviews" trendPositive={true} />
          <StatsCard title="Hired" value={loading ? "…" : stats.hired || 0} colorTheme="mint" icon={CheckCircle} trendValue="Successfully placed" trendPositive={true} />
        </StatsGrid>
        {/* ── Pipeline strip ── */}
        <motion.div initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.15
      }} style={{
        marginBottom: 20
      }}>
          <div style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          borderRadius: 0,
          padding: "12px 16px",
          boxShadow: "0 4px 15px rgba(15,23,42,0.03)",
          border: "1px solid #e2e8f0",
          overflowX: "auto",
          gap: 4
        }}>
            {STAGES.map((stage, idx) => {
            const cfg = STAGE_CONFIG[stage];
            return <React.Fragment key={stage}>
                  <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 0,
                background: cfg.bg,
                flex: 1,
                minWidth: 140,
                border: `1px solid ${cfg.color}30`
              }}>
                    <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: "0px",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 10px ${cfg.color}20`
                }}>
                      <span style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: cfg.color
                  }}>
                        {pipelineCounts[stage] || 0}
                      </span>
                    </div>
                    <div>
                      <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1e293b"
                  }}>
                        {stage}
                      </div>
                      <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: cfg.color
                  }}>
                        Candidates
                      </div>
                    </div>
                  </div>
                  {idx < STAGES.length - 1 && <div style={{
                color: "#cbd5e1",
                padding: "0 4px",
                flexShrink: 0
              }}>
                      <ArrowRight size={20} strokeWidth={3} />
                    </div>}
                </React.Fragment>;
          })}
          </div>
        </motion.div>
        {/* ── Tabs ── */}
        <div style={{
        display: "flex",
        gap: 4,
        borderBottom: "2px solid #f1f5f9",
        marginBottom: 0
      }}>
          {["jobs", "candidates"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{
          padding: "10px 20px",
          border: "none",
          background: "none",
          fontSize: 13,
          fontWeight: 700,
          color: activeTab === tab ? "#4f46e5" : "#64748b",
          borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
          cursor: "pointer",
          textTransform: "capitalize",
          marginBottom: -2,
          transition: "all 0.15s"
        }}>
              {tab === "jobs" ? `Job Postings (${jobs.length})` : `Candidates (${candidates.length})`}
            </button>)}
        </div>
        {/* ── Content ── */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="rd-table-card">
          <div className="rd-table-header" style={{
          borderBottom: "none",
          flexWrap: "wrap",
          gap: 10
        }}>
            <div className="rd-search-bar" style={{
            minWidth: 240,
            background: "#fff"
          }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" className="rd-search-input" placeholder={activeTab === "jobs" ? "Search jobs or departments…" : "Search candidates or jobs…"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {activeTab === "candidates" && <div style={{
            display: "flex",
            gap: 6,
            flexWrap: "nowrap",
            overflowX: "auto",
            scrollbarWidth: "none"
          }}>
                {["All", ...STAGES].map(s => {
              const cfg = STAGE_CONFIG[s];
              return <button key={s} onClick={() => setStageFilter(s)} style={{
                padding: "5px 12px",
                borderRadius: 0,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
                border: stageFilter === s ? `1.5px solid ${cfg?.color || "#6366f1"}` : "1.5px solid #e2e8f0",
                background: stageFilter === s ? cfg?.bg || "#eef2ff" : "#fff",
                color: stageFilter === s ? cfg?.color || "#4f46e5" : "#64748b"
              }}>
                      {s}
                    </button>;
            })}
              </div>}
          </div>
          <div className="rd-table-scroll">
            {/* ── Jobs Table ── */}
            {activeTab === "jobs" && <table className="rd-table rd-table-responsive" style={{
            width: "100%"
          }}>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Department</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Openings</th>
                    <th>Applicants</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th style={{
                  width: 80
                }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr>
                      <td colSpan={9} style={{
                  textAlign: "center",
                  padding: 40,
                  color: "#94a3b8"
                }}>
                        Loading…
                      </td>
                    </tr> : filteredJobs.length === 0 ? <tr>
                      <td colSpan={9} style={{
                  textAlign: "center",
                  padding: 48,
                  color: "#94a3b8"
                }}>
                        <AlertCircle size={32} style={{
                    opacity: 0.3,
                    marginBottom: 10
                  }} />
                        <div style={{
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                          No job postings yet
                        </div>
                        <div style={{
                    fontSize: 12,
                    marginTop: 4
                  }}>
                          Click "+ Post Job" to create one.
                        </div>
                      </td>
                    </tr> : filteredJobs.map(job => {
                const sc = JOB_STATUS[job.status] || JOB_STATUS.Open;
                return <tr key={job.id}>
                          <td data-label="Job Title">
                            <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}>
                              <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 0,
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}>
                                <Briefcase size={16} color="#6366f1" />
                              </div>
                              <div>
                                <div style={{
                          fontWeight: 700,
                          color: "var(--rd-text-main)",
                          fontSize: 13
                        }}>
                                  {job.title}
                                </div>
                                {job.salaryMin && <div style={{
                          fontSize: 10,
                          color: "#94a3b8"
                        }}>
                                    ₹{(job.salaryMin / 100000).toFixed(1)}L – ₹
                                    {(job.salaryMax / 100000).toFixed(1)}L
                                  </div>}
                              </div>
                            </div>
                          </td>
                          <td data-label="Department" style={{
                    fontSize: 13,
                    color: "#475569"
                  }}>
                            {job.department ? <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5
                    }}>
                                <Building2 size={12} color="#94a3b8" />
                                {job.department}
                              </span> : <span style={{
                      color: "#cbd5e1"
                    }}>—</span>}
                          </td>
                          <td data-label="Location" style={{
                    fontSize: 13,
                    color: "#475569"
                  }}>
                            {job.location ? <span style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5
                    }}>
                                <MapPin size={12} color="#94a3b8" />
                                {job.location}
                              </span> : <span style={{
                      color: "#cbd5e1"
                    }}>—</span>}
                          </td>
                          <td data-label="Type">
                            <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 9px",
                      borderRadius: 0,
                      background: "#f1f5f9",
                      color: "#475569"
                    }}>
                              {job.type}
                            </span>
                          </td>
                          <td data-label="Openings" style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0f172a",
                    textAlign: "center"
                  }}>
                            {job.openings}
                          </td>
                          <td data-label="Applicants" style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#6366f1",
                    textAlign: "center"
                  }}>
                            {job.totalCandidates}
                          </td>
                          <td data-label="Deadline" style={{
                    fontSize: 12,
                    color: "#64748b"
                  }}>
                            {job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    }) : <span style={{
                      color: "#cbd5e1"
                    }}>—</span>}
                          </td>
                          <td data-label="Status">
                            <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 0,
                      background: sc.bg,
                      color: sc.color
                    }}>
                              {job.status}
                            </span>
                          </td>
                          <td data-label="Actions">
                            <div style={{
                      display: "flex",
                      gap: 6
                    }}>
                              {(job.status === "Open" || job.status === "Published") && (
                                <button onClick={() => setPublishedJob(job)} title="View Public Job" style={{
                                  background: "#f1f5f9",
                                  border: "none",
                                  borderRadius: 0,
                                  padding: "5px 8px",
                                  cursor: "pointer",
                                  color: "#6366f1",
                                  display: "flex"
                                }}>
                                  <Eye size={13} />
                                </button>
                              )}
                              <button onClick={() => setEditJob(job)} style={{
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: 0,
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: "#475569",
                        display: "flex"
                      }}>
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => deleteJob(job.id)} style={{
                        background: "#fee2e2",
                        border: "none",
                        borderRadius: 0,
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: "#ef4444",
                        display: "flex"
                      }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>;
              })}
                </tbody>
              </table>}
            {/* ── Candidates Table ── */}
            {activeTab === "candidates" && <table className="rd-table rd-table-responsive" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied For</th>
                    <th>Contact</th>
                    <th>Experience</th>
                    <th>Resume</th>
                    <th>Source</th>
                    <th style={{ width: 130 }}>Stage</th>
                    <th>Applied On</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Loading…</td></tr>
                    : filteredCands.length === 0
                    ? <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                        <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                        <div style={{ fontSize: 14, fontWeight: 600 }}>No candidates found</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>Add a candidate or change the filter.</div>
                      </td></tr>
                    : filteredCands.map(c => {
                const cfg = STAGE_CONFIG[c.stage] || STAGE_CONFIG.Applied;
                const stageIdx = STAGES.indexOf(c.stage);
                return <tr key={c.id}>
                          <td data-label="Candidate">
                            <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10
                    }}>
                              <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: "0px",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                                {(c.name || "?").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{
                          fontWeight: 700,
                          color: "var(--rd-text-main)",
                          fontSize: 13
                        }}>
                                  {c.name}
                                </div>
                                {c.email && <div style={{
                          fontSize: 10,
                          color: "#94a3b8"
                        }}>
                                    {c.email}
                                  </div>}
                              </div>
                            </div>
                          </td>
                          <td data-label="Job" style={{
                    fontSize: 12,
                    color: "#475569",
                    fontWeight: 600
                  }}>
                            {c.job?.title || "—"}
                          </td>
                          <td data-label="Contact" style={{
                    fontSize: 12,
                    color: "#64748b"
                  }}>
                            {c.phone || <span style={{
                      color: "#cbd5e1"
                    }}>—</span>}
                          </td>
                          <td data-label="Experience" style={{ fontSize: 12, color: "#475569" }}>
                            {c.experience || <span style={{ color: "#cbd5e1" }}>—</span>}
                          </td>
                          <td data-label="Resume">
                            {c.resume
                              ? <a href={`http://localhost:5000${c.resume}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: "#4f46e5", background: "#eef2ff", padding: "3px 10px", borderRadius: 5, textDecoration: "none", whiteSpace: "nowrap" }}>📄 View</a>
                              : <span style={{ color: "#cbd5e1" }}>—</span>}
                          </td>
                          <td data-label="Source">
                            {c.source ? <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 0,
                      background: "#f1f5f9",
                      color: "#475569"
                    }}>
                                {c.source}
                              </span> : <span style={{
                      color: "#cbd5e1"
                    }}>—</span>}
                          </td>
                          <td data-label="Stage">
                            <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}>
                              <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 0,
                        background: cfg.bg,
                        color: cfg.color,
                        flexShrink: 0
                      }}>
                                {c.stage}
                              </span>
                              {/* Quick advance */}
                              {stageIdx < STAGES.length - 2 && <button onClick={() => moveStage(c, STAGES[stageIdx + 1])} title={`Move to ${STAGES[stageIdx + 1]}`} style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        display: "flex",
                        padding: 2
                      }}>
                                  <ArrowRight size={12} />
                                </button>}
                            </div>
                          </td>
                          <td data-label="Rating">
                            <div style={{
                      display: "flex",
                      gap: 2
                    }}>
                              {[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} fill={c.rating >= n ? "#f59e0b" : "none"} color={c.rating >= n ? "#f59e0b" : "#e2e8f0"} />)}
                            </div>
                          </td>
                          <td data-label="Applied" style={{
                    fontSize: 11,
                    color: "#94a3b8"
                  }}>
                            {new Date(c.appliedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                          </td>
                          <td data-label="Actions">
                            <div style={{
                      display: "flex",
                      gap: 6
                    }}>
                              <button onClick={() => setEditCand(c)} style={{
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: 0,
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: "#475569",
                        display: "flex"
                      }}>
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => deleteCand(c.id)} style={{
                        background: "#fee2e2",
                        border: "none",
                        borderRadius: 0,
                        padding: "5px 8px",
                        cursor: "pointer",
                        color: "#ef4444",
                        display: "flex"
                      }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>;
              })}
                </tbody>
              </table>}
          </div>
        </motion.div>
      </div>
    </motion.div>;
};
export default Recruitment;