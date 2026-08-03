import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Loader, Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import "../components/AdminDashboard/AdminDashboardRedesign.css";

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    type: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const today = new Date().toISOString().split("T")[0];

  const calcDays = (s, e) => {
    if (!s || !e) return 0;
    return Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      showToast("Please select both start and end dates.", false);
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      showToast("End date must be on or after start date.", false);
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/leaves", form);
      showToast("Leave application submitted successfully.");
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      showToast(err.response?.data?.message || "Submission failed.", false);
      setSubmitting(false);
    }
  };

  const daysCount = calcDays(form.startDate, form.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rd-container"
    >
      <div className="rd-content">
        {toast && (
          <div className={`lv-toast ${toast.ok ? "ok" : "err"}`}>
            {toast.ok ? <Check size={15} /> : <AlertTriangle size={15} />}
            {toast.msg}
          </div>
        )}
        <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ marginBottom: "28px" }}>
            <PageHeader
              title="New Leave Application"
              badge="HRMS"
              subtitle="Submit a new request for time off"
              showBack={true}
            />
          </div>

          {/* Duration Summary Banner */}
          <div className="lv-duration-banner">
            <div className="lv-duration-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="lv-duration-info">
              <span className="lv-duration-label">Total Duration</span>
              <span className="lv-duration-value">
                {daysCount > 0 ? `${daysCount} Day${daysCount > 1 ? "s" : ""}` : "Select dates"}
              </span>
            </div>
            <div className="lv-duration-type-chip">
              {form.type} Leave
            </div>
          </div>

          {/* Form Card */}
          <div className="lv-pro-card">
            <form onSubmit={handleSubmit}>
              {/* Section: Leave Details */}
              <div className="lv-section">
                <div className="lv-section-header">
                  <div className="lv-section-icon blue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <span>Leave Details</span>
                </div>
                <div className="lv-field-row">
                  <div className="lv-field">
                    <label>Leave Type <span className="lv-required">*</span></label>
                    <div className="lv-select-wrap">
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                      >
                        <option value="Annual">Annual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Casual">Casual Leave</option>
                        <option value="Unpaid">Unpaid Leave</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Schedule */}
              <div className="lv-section">
                <div className="lv-section-header">
                  <div className="lv-section-icon green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <span>Schedule</span>
                </div>
                <div className="lv-field-row two-col">
                  <div className="lv-field">
                    <label>Start Date <span className="lv-required">*</span></label>
                    <input
                      type="date"
                      min={today}
                      required
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="lv-field">
                    <label>End Date <span className="lv-required">*</span></label>
                    <input
                      type="date"
                      min={form.startDate || today}
                      required
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Reason */}
              <div className="lv-section last">
                <div className="lv-section-header">
                  <div className="lv-section-icon amber">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="17" y1="10" x2="3" y2="10"/>
                      <line x1="21" y1="6" x2="3" y2="6"/>
                      <line x1="21" y1="14" x2="3" y2="14"/>
                      <line x1="17" y1="18" x2="3" y2="18"/>
                    </svg>
                  </div>
                  <span>Reason / Remarks</span>
                </div>
                <div className="lv-field-row">
                  <div className="lv-field full">
                    <textarea
                      rows={4}
                      placeholder="Briefly explain the reason for your leave request..."
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="lv-actions">
                <button
                  type="button"
                  className="lv-btn-cancel"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lv-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="lv-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <style>{`
          /* ── Toast ── */
          .lv-toast {
            position: fixed;
            bottom: 28px;
            right: 28px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            z-index: 9999;
            animation: lvSlideUp 0.3s ease;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          }
          .lv-toast.ok {
            background: #ecfdf5;
            border: 1px solid #10b981;
            color: #059669;
          }
          .lv-toast.err {
            background: #fef2f2;
            border: 1px solid #ef4444;
            color: #dc2626;
          }

          /* ── Duration Banner ── */
          .lv-duration-banner {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px 20px;
            background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
            border: 1px solid #dbeafe;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          .lv-duration-icon {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            background: #2563eb;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .lv-duration-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex: 1;
          }
          .lv-duration-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
          }
          .lv-duration-value {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            line-height: 1.2;
          }
          .lv-duration-type-chip {
            padding: 6px 14px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            white-space: nowrap;
          }

          /* ── Card ── */
          .lv-pro-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02);
            overflow: hidden;
          }

          /* ── Sections ── */
          .lv-section {
            padding: 24px 28px;
            border-bottom: 1px solid #f1f5f9;
          }
          .lv-section.last {
            border-bottom: none;
          }
          .lv-section-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
          }
          .lv-section-icon {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .lv-section-icon.blue {
            background: #eff6ff;
            color: #2563eb;
          }
          .lv-section-icon.green {
            background: #f0fdf4;
            color: #16a34a;
          }
          .lv-section-icon.amber {
            background: #fffbeb;
            color: #d97706;
          }

          /* ── Fields ── */
          .lv-field-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .lv-field-row.two-col {
            grid-template-columns: 1fr 1fr;
          }
          .lv-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .lv-field.full {
            grid-column: 1 / -1;
          }
          .lv-field label {
            font-size: 13px;
            font-weight: 500;
            color: #475569;
          }
          .lv-required {
            color: #ef4444;
          }
          .lv-field input,
          .lv-field textarea {
            padding: 10px 14px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            color: #111827;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s;
            width: 100%;
            box-sizing: border-box;
          }
          .lv-field input {
            height: 42px;
          }
          .lv-field textarea {
            resize: vertical;
            min-height: 100px;
          }
          .lv-field input:focus,
          .lv-field textarea:focus,
          .lv-select-wrap select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
          }

          /* ── Select ── */
          .lv-select-wrap {
            position: relative;
          }
          .lv-select-wrap select {
            width: 100%;
            padding: 10px 38px 10px 14px;
            background: #ffffff;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            color: #111827;
            font-size: 14px;
            font-family: inherit;
            height: 42px;
            appearance: none;
            cursor: pointer;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .lv-select-wrap::after {
            content: "";
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            width: 14px;
            height: 14px;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
            background-size: contain;
            background-repeat: no-repeat;
          }

          /* ── Actions ── */
          .lv-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 20px 28px;
            background: #f9fafb;
            border-top: 1px solid #f1f5f9;
          }
          .lv-btn-cancel {
            background: #ffffff;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 10px 22px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
          }
          .lv-btn-cancel:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }
          .lv-btn-submit {
            background: linear-gradient(135deg, #2563eb, #4f46e5);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            font-family: inherit;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
          }
          .lv-btn-submit:hover {
            background: linear-gradient(135deg, #1d4ed8, #4338ca);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
            transform: translateY(-1px);
          }
          .lv-btn-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          /* ── Animations ── */
          .lv-spin {
            animation: lvSpin 1s linear infinite;
          }
          @keyframes lvSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes lvSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* ── Responsive ── */
          @media (max-width: 640px) {
            .lv-section { padding: 20px 18px; }
            .lv-field-row.two-col { grid-template-columns: 1fr; }
            .lv-actions { flex-direction: column; padding: 16px 18px; }
            .lv-actions button { width: 100%; justify-content: center; }
            .lv-duration-banner { flex-wrap: wrap; }
          }
        `}</style>
      </div>
    </motion.div>
  );
};

export default ApplyLeave;
