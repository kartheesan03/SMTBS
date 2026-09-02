import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Chip = ({ children, color }) => {
  const colors = {
    blue:   { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    green:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    orange: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    gray:   { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 6, padding: '4px 12px', fontSize: 13, fontWeight: 500, display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

const InfoRow = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: 18, minWidth: 24, textAlign: 'center' }}>{icon}</span>
      <div>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: 15, color: '#1e293b', fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
};

export default function PublicJobView() {
  const { jobSlug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/recruitment/public/jobs/${jobSlug}`)
      .then(res => { setJob(res.data); setLoading(false); })
      .catch(err => {
        setError(err.response?.data?.message || 'Job not found.');
        setLoading(false);
      });
  }, [jobSlug]);

  const salaryText = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    if (job.salaryMin && job.salaryMax) return `₹${Number(job.salaryMin).toLocaleString()} – ₹${Number(job.salaryMax).toLocaleString()} / month`;
    if (job.salaryMin) return `From ₹${Number(job.salaryMin).toLocaleString()} / month`;
    return `Up to ₹${Number(job.salaryMax).toLocaleString()} / month`;
  };

  const deadlineText = () => {
    if (!job.deadline) return null;
    const d = new Date(job.deadline);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Loading job details…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: '#1e293b', marginBottom: 8 }}>Job Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>{error}</p>
        <p style={{ color: '#94a3b8', fontSize: 13 }}>This position may have been filled or the link may be incorrect.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "'Inter', -apple-system, sans-serif", padding: '0 0 60px 0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .job-apply-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(79,70,229,0.4) !important; }
        .job-apply-btn:active { transform: translateY(0); }
        .skill-tag { transition: all 0.15s; }
        .skill-tag:hover { background: #e0e7ff !important; color: #3730a3 !important; }
      `}</style>

      {/* Company Header Banner */}
      <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>
            S
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>SMTBMS</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Smart Material Tracking & Business Management</div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 0' }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

          {/* Job Header */}
          <div style={{ padding: '36px 40px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <Chip color="blue">{job.type || 'Full-time'}</Chip>
                  {job.department && <Chip color="purple">{job.department}</Chip>}
                  {job.openings && <Chip color="green">{job.openings} Opening{job.openings !== 1 ? 's' : ''}</Chip>}
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>{job.title}</h1>
                {job.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: '#64748b', fontSize: 15 }}>
                    <span>📍</span> {job.location}
                  </div>
                )}
              </div>
              <button
                className="job-apply-btn"
                onClick={() => navigate(`/jobs/${jobSlug}/apply`)}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 15px rgba(79,70,229,0.3)', transition: 'all 0.2s'
                }}
              >
                Apply Now →
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 0 }}>

            {/* Main Content */}
            <div style={{ padding: '32px 40px', borderRight: '1px solid #f1f5f9' }}>

              {job.description && (
                <section style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📋</span> Job Description
                  </h2>
                  <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{job.description}</div>
                </section>
              )}

              {job.requirements && (
                <section style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>✅</span> Requirements & Qualifications
                  </h2>
                  <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{job.requirements}</div>
                </section>
              )}

              {/* Skills section parsed from comma-separated string */}
              {job.skills && (
                <section style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🛠</span> Required Skills
                  </h2>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {job.skills.split(',').map((s, i) => s.trim() && (
                      <span key={i} className="skill-tag" style={{
                        background: '#f0f4ff', color: '#4f46e5', border: '1px solid #c7d2fe',
                        borderRadius: 6, padding: '5px 12px', fontSize: 13, fontWeight: 500, cursor: 'default'
                      }}>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Apply CTA at bottom */}
              <div style={{ background: 'linear-gradient(135deg, #667eea15, #764ba215)', border: '1px solid #c7d2fe', borderRadius: 14, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>Interested in this position?</div>
                  <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>It only takes a few minutes to apply.</div>
                </div>
                <button
                  className="job-apply-btn"
                  onClick={() => navigate(`/jobs/${jobSlug}/apply`)}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px',
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(79,70,229,0.3)', transition: 'all 0.2s'
                  }}
                >
                  Apply Now →
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ padding: '28px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Job Details</h3>
              <InfoRow icon="🏢" label="Department" value={job.department} />
              <InfoRow icon="📍" label="Location" value={job.location} />
              <InfoRow icon="⏰" label="Employment Type" value={job.type} />
              <InfoRow icon="👥" label="Openings" value={job.openings ? `${job.openings} position${job.openings !== 1 ? 's' : ''}` : null} />
              <InfoRow icon="💰" label="Salary Range" value={salaryText()} />
              <InfoRow icon="📅" label="Application Deadline" value={deadlineText()} />

              <div style={{ marginTop: 24, padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>About Company</div>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>SMTBMS Solutions</div>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>ERP & Business Management Systems · India</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          Powered by SMTBMS Recruitment Platform
        </div>
      </div>
    </div>
  );
}
