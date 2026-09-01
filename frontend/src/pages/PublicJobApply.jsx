import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const InputField = ({ label, name, type = 'text', value, onChange, required, placeholder, accept, as }) => {
  const baseStyle = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 15, color: '#1e293b', background: '#fff', outline: 'none', transition: 'border 0.2s',
    fontFamily: 'inherit'
  };
  const focusStyle = { border: '1.5px solid #4f46e5' };

  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={4}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...baseStyle, ...(focused ? focusStyle : {}), resize: 'vertical', minHeight: 100 }}
        />
      ) : type === 'file' ? (
        <input
          type="file"
          name={name}
          onChange={onChange}
          required={required}
          accept={accept}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...baseStyle, ...(focused ? focusStyle : {}), padding: '9px 14px', cursor: 'pointer' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...baseStyle, ...(focused ? focusStyle : {}) }}
        />
      )}
    </div>
  );
};

const SuccessScreen = ({ jobTitle, onBack }) => (
  <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', sans-serif" }}>
    <div style={{ background: '#fff', borderRadius: 20, padding: '52px 48px', textAlign: 'center', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', width: '100%' }}>
      <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36 }}>
        ✓
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Application Submitted!</h2>
      <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6, marginBottom: 8 }}>
        Thank you for applying to <strong>{jobTitle}</strong>.
      </p>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>
        Our HR team will review your application and reach out to you if you're shortlisted.
      </p>
      <button
        onClick={onBack}
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
          border: 'none', borderRadius: 10, padding: '13px 32px', fontSize: 15, fontWeight: 700,
          cursor: 'pointer', width: '100%'
        }}
      >
        View Job Listing
      </button>
    </div>
  </div>
);

export default function PublicJobApply() {
  const { jobSlug } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    skills: '',
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/recruitment/public/jobs/${jobSlug}`)
      .then(res => { setJob(res.data); setLoading(false); })
      .catch(() => { setError('Job not found or no longer available.'); setLoading(false); });
  }, [jobSlug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0] || null);
    if (validationErrors.resume) setValidationErrors(prev => ({ ...prev, resume: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!resumeFile) errs.resume = 'Please upload your resume';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return; }

    setSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (resumeFile) data.append('resume', resumeFile);

    try {
      await axios.post(`${API_BASE}/api/recruitment/public/jobs/${jobSlug}/apply`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen jobTitle={job?.title} onBack={() => navigate(`/jobs/${jobSlug}`)} />;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (error && !job) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: '#1e293b' }}>Position Unavailable</h2>
        <p style={{ color: '#64748b' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "'Inter', -apple-system, sans-serif", padding: '0 0 60px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate(`/jobs/${jobSlug}`)}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to Job
          </button>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Applying for: <strong style={{ color: '#fff' }}>{job?.title}</strong>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '36px auto 0', padding: '0 20px' }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

          {/* Form Header */}
          <div style={{ padding: '32px 40px 24px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderBottom: '1px solid #e2e8f0' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Submit Your Application</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
              {job?.title} {job?.department ? `· ${job.department}` : ''} {job?.location ? `· ${job.location}` : ''}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '32px 40px' }}>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#b91c1c', fontSize: 14, marginBottom: 24 }}>
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <InputField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
                  {validationErrors.firstName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{validationErrors.firstName}</p>}
                </div>
                <div>
                  <InputField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
                  {validationErrors.lastName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{validationErrors.lastName}</p>}
                </div>
                <div>
                  <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
                  {validationErrors.email && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{validationErrors.email}</p>}
                </div>
                <div>
                  <InputField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                  {validationErrors.phone && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{validationErrors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Professional Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <InputField label="Years of Experience" name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 3 years" />
                <InputField label="Skills (comma-separated)" name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Node.js, SQL" />
              </div>
            </div>

            {/* Resume */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
                Documents
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Resume / CV <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ border: '2px dashed #c7d2fe', borderRadius: 10, padding: '20px 16px', textAlign: 'center', background: '#f8f8ff', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'block' }}>
                      {resumeFile ? (
                        <div>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                          <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14 }}>{resumeFile.name}</div>
                          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Click to replace</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>📎</div>
                          <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: 14 }}>Click to upload your resume</div>
                          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>PDF, DOC, DOCX · Max 10MB</div>
                        </div>
                      )}
                    </label>
                  </div>
                  {validationErrors.resume && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{validationErrors.resume}</p>}
                </div>
                <InputField label="Cover Letter (Optional)" name="coverLetter" as="textarea" value={form.coverLetter} onChange={handleChange} placeholder="Tell us why you'd be a great fit for this role…" />
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
              <button
                type="button"
                onClick={() => navigate(`/jobs/${jobSlug}`)}
                style={{ padding: '12px 24px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#fff', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 32px', background: submitting ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer', minWidth: 160
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          Powered by SMTBMS Recruitment Platform
        </div>
      </div>
    </div>
  );
}
