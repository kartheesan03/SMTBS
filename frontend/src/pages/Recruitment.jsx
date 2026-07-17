import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase, Users, Calendar, CheckCircle, Plus, Search,
    Trash2, Edit2, X, ChevronDown, Star, MapPin, Clock,
    UserPlus, AlertCircle, ArrowRight, Building2
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

// ── Config ────────────────────────────────────────────────────────────────────
const STAGE_CONFIG = {
    Applied:   { color: '#64748b', bg: '#f1f5f9', cls: 'default' },
    Screening: { color: '#2563eb', bg: '#eff6ff', cls: 'primary' },
    Interview: { color: '#7c3aed', bg: '#f5f3ff', cls: 'primary' },
    Offer:     { color: '#f59e0b', bg: '#fffbeb', cls: 'warning' },
    Hired:     { color: '#059669', bg: '#ecfdf5', cls: 'success' },
    Rejected:  { color: '#ef4444', bg: '#fee2e2', cls: 'danger'  },
};

const JOB_STATUS = {
    Open:    { color: '#059669', bg: '#ecfdf5' },
    'On Hold': { color: '#f59e0b', bg: '#fffbeb' },
    Closed:  { color: '#64748b', bg: '#f1f5f9' },
    Filled:  { color: '#2563eb', bg: '#eff6ff' },
};

const STAGES = ['Applied','Screening','Interview','Offer','Hired','Rejected'];

// ── Job Modal ─────────────────────────────────────────────────────────────────
const JobModal = ({ job, onClose, onSave }) => {
    const [form, setForm] = useState(job ? {
        title: job.title, department: job.department || '', location: job.location || '',
        type: job.type, status: job.status, description: job.description || '',
        requirements: job.requirements || '', salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '', deadline: job.deadline || '', openings: job.openings || 1
    } : { title: '', department: '', location: '', type: 'Full-time', status: 'Open', description: '', requirements: '', salaryMin: '', salaryMax: '', deadline: '', openings: 1 });
    const [saving, setSaving] = useState(false);
    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');
        setSaving(true);
        try {
            if (job) {
                const { data } = await API.put(`/recruitment/jobs/${job.id}`, form);
                onSave(data, 'edit'); toast.success('Job updated!');
            } else {
                const { data } = await API.post('/recruitment/jobs', form);
                onSave(data, 'add'); toast.success('Job posted!');
            }
            onClose();
        } catch { toast.error('Failed to save job posting'); }
        finally { setSaving(false); }
    };

    const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{job ? 'Edit Job Posting' : 'Post New Job'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Job Title *</label>
                        <input name="title" value={form.title} onChange={handle} placeholder="e.g. Warehouse Manager, Procurement Officer" style={inp} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Department</label>
                            <input name="department" value={form.department} onChange={handle} placeholder="e.g. Supply Chain, Logistics" style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Location</label>
                            <input name="location" value={form.location} onChange={handle} placeholder="e.g. Main Warehouse / Chennai" style={inp} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Type</label>
                            <select name="type" value={form.type} onChange={handle} style={inp}>
                                {['Full-time','Part-time','Contract','Internship'].map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Status</label>
                            <select name="status" value={form.status} onChange={handle} style={inp}>
                                {['Open','On Hold','Closed','Filled'].map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Openings</label>
                            <input type="number" name="openings" value={form.openings} onChange={handle} min={1} style={inp} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Salary Min (₹)</label>
                            <input type="number" name="salaryMin" value={form.salaryMin} onChange={handle} placeholder="300000" style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Salary Max (₹)</label>
                            <input type="number" name="salaryMax" value={form.salaryMax} onChange={handle} placeholder="600000" style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Deadline</label>
                            <input type="date" name="deadline" value={form.deadline} onChange={handle} style={inp} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Description</label>
                        <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Job description..." style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Requirements</label>
                        <textarea name="requirements" value={form.requirements} onChange={handle} rows={2} placeholder="e.g. 5+ years in material handling, inventory tracking software..." style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <button type="submit" disabled={saving} style={{ padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving…' : job ? 'Save Changes' : 'Post Job'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Candidate Modal ───────────────────────────────────────────────────────────
const CandidateModal = ({ jobs, candidate, onClose, onSave }) => {
    const [form, setForm] = useState(candidate ? {
        jobId: candidate.jobId, name: candidate.name, email: candidate.email || '',
        phone: candidate.phone || '', stage: candidate.stage, source: candidate.source || '', notes: candidate.notes || '', rating: candidate.rating || 0
    } : { jobId: jobs[0]?.id || '', name: '', email: '', phone: '', stage: 'Applied', source: '', notes: '', rating: 0 });
    const [saving, setSaving] = useState(false);
    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Name is required');
        setSaving(true);
        try {
            if (candidate) {
                const { data } = await API.put(`/recruitment/candidates/${candidate.id}`, form);
                onSave(data, 'edit'); toast.success('Candidate updated!');
            } else {
                const { data } = await API.post('/recruitment/candidates', form);
                onSave(data, 'add'); toast.success('Candidate added!');
            }
            onClose();
        } catch { toast.error('Failed to save candidate'); }
        finally { setSaving(false); }
    };

    const inp = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{candidate ? 'Update Candidate' : 'Add Candidate'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Applying For *</label>
                        <select name="jobId" value={form.jobId} onChange={handle} style={inp}>
                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Full Name *</label>
                            <input name="name" value={form.name} onChange={handle} placeholder="Candidate name" style={inp} required />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Email</label>
                            <input type="email" name="email" value={form.email} onChange={handle} placeholder="email@example.com" style={inp} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Phone</label>
                            <input name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Stage</label>
                            <select name="stage" value={form.stage} onChange={handle} style={inp}>
                                {STAGES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Source</label>
                            <input name="source" value={form.source} onChange={handle} placeholder="LinkedIn" style={inp} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handle} rows={2} placeholder="Interview notes, observations…" style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Rating (1-5)</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {[1,2,3,4,5].map(n => (
                                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                                    <Star size={20} fill={form.rating >= n ? '#f59e0b' : 'none'} color={form.rating >= n ? '#f59e0b' : '#e2e8f0'} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <button type="submit" disabled={saving} style={{ padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving…' : candidate ? 'Update Candidate' : 'Add Candidate'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Recruitment = () => {
    const [jobs, setJobs]             = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats]           = useState({});
    const [loading, setLoading]       = useState(true);
    const [activeTab, setActiveTab]   = useState('jobs');
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState('All');
    const [jobModal, setJobModal]     = useState(false);
    const [editJob, setEditJob]       = useState(null);
    const [candModal, setCandModal]   = useState(false);
    const [editCand, setEditCand]     = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [j, c, s] = await Promise.all([
                API.get('/recruitment/jobs').catch(() => ({ data: [] })),
                API.get('/recruitment/candidates').catch(() => ({ data: [] })),
                API.get('/recruitment/stats').catch(() => ({ data: {} })),
            ]);
            setJobs(j.data || []);
            setCandidates(c.data || []);
            setStats(s.data || {});
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleJobSave = (saved, action) => {
        if (action === 'add') setJobs(prev => [saved, ...prev]);
        else setJobs(prev => prev.map(j => j.id === saved.id ? saved : j));
        fetchAll(); // refresh stats
    };

    const handleCandSave = (saved, action) => {
        if (action === 'add') setCandidates(prev => [saved, ...prev]);
        else setCandidates(prev => prev.map(c => c.id === saved.id ? saved : c));
        fetchAll();
    };

    const deleteJob = async id => {
        if (!window.confirm('Delete this job posting?')) return;
        try { await API.delete(`/recruitment/jobs/${id}`); setJobs(prev => prev.filter(j => j.id !== id)); toast.success('Deleted'); fetchAll(); }
        catch { toast.error('Delete failed'); }
    };

    const deleteCand = async id => {
        if (!window.confirm('Remove this candidate?')) return;
        try { await API.delete(`/recruitment/candidates/${id}`); setCandidates(prev => prev.filter(c => c.id !== id)); fetchAll(); toast.success('Removed'); }
        catch { toast.error('Delete failed'); }
    };

    const moveStage = async (cand, stage) => {
        try {
            const { data } = await API.put(`/recruitment/candidates/${cand.id}`, { stage });
            setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, stage } : c));
            fetchAll();
        } catch { toast.error('Update failed'); }
    };

    const filteredJobs = jobs.filter(j =>
        (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCands = candidates.filter(c => {
        const matchSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStage = stageFilter === 'All' || c.stage === stageFilter;
        return matchSearch && matchStage;
    });

    // Pipeline counts
    const pipelineCounts = STAGES.reduce((acc, s) => ({ ...acc, [s]: candidates.filter(c => c.stage === s).length }), {});

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rd-container">
            {/* Modals */}
            {(jobModal || editJob) && <JobModal job={editJob} onClose={() => { setJobModal(false); setEditJob(null); }} onSave={handleJobSave} />}
            {(candModal || editCand) && <CandidateModal jobs={jobs} candidate={editCand} onClose={() => { setCandModal(false); setEditCand(null); }} onSave={handleCandSave} />}

            <div className="rd-content">
                {/* ── Header ── */}
                <div className="rd-module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="rd-module-title" style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>Recruitment</span>
                            <span className="rd-module-badge" style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>HRMS</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => { setEditCand(null); setCandModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            <UserPlus size={15} /> Add Candidate
                        </button>
                        <button onClick={() => { setEditJob(null); setJobModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
                            <Plus size={15} /> Post Job
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <PastelKPIGrid>
                    <PastelKPICard title="Open Positions"  value={loading ? '…' : stats.openJobs || 0}     colorTheme="blue"   icon={Briefcase}    trendValue="Active job postings" trendPositive={true} />
                    <PastelKPICard title="Total Applicants" value={loading ? '…' : stats.totalApplied || 0} colorTheme="purple" icon={Users}         trendValue="All applications"   trendPositive={true} />
                    <PastelKPICard title="In Interview"    value={loading ? '…' : stats.interviews || 0}    colorTheme="yellow" icon={Calendar}      trendValue="Scheduled interviews" trendPositive={true} />
                    <PastelKPICard title="Hired"           value={loading ? '…' : stats.hired || 0}          colorTheme="mint"   icon={CheckCircle}  trendValue="Successfully placed" trendPositive={true} />
                </PastelKPIGrid>

                {/* ── Pipeline strip ── */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 16, padding: '12px 16px', boxShadow: '0 4px 15px rgba(15,23,42,0.03)', border: '1px solid #e2e8f0', overflowX: 'auto', gap: 4 }}>
                        {STAGES.map((stage, idx) => {
                            const cfg = STAGE_CONFIG[stage];
                            return (
                                <React.Fragment key={stage}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 12, background: cfg.bg, flex: 1, minWidth: 140, border: `1px solid ${cfg.color}30` }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px ${cfg.color}20` }}>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: cfg.color }}>{pipelineCounts[stage] || 0}</span>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{stage}</div>
                                            <div style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>Candidates</div>
                                        </div>
                                    </div>
                                    {idx < STAGES.length - 1 && (
                                        <div style={{ color: '#cbd5e1', padding: '0 4px', flexShrink: 0 }}>
                                            <ArrowRight size={20} strokeWidth={3} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #f1f5f9', marginBottom: 0 }}>
                    {['jobs','candidates'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: '10px 20px', border: 'none', background: 'none', fontSize: 13, fontWeight: 700,
                            color: activeTab === tab ? '#4f46e5' : '#64748b',
                            borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
                            cursor: 'pointer', textTransform: 'capitalize', marginBottom: -2, transition: 'all 0.15s'
                        }}>
                            {tab === 'jobs' ? `Job Postings (${jobs.length})` : `Candidates (${candidates.length})`}
                        </button>
                    ))}
                </div>

                {/* ── Content ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rd-table-card">
                    <div className="rd-table-header" style={{ borderBottom: 'none', flexWrap: 'wrap', gap: 10 }}>
                        <div className="rd-search-bar" style={{ minWidth: 240, background: '#fff' }}>
                            <Search size={16} color="#94a3b8" />
                            <input type="text" className="rd-search-input" placeholder={activeTab === 'jobs' ? 'Search jobs or departments…' : 'Search candidates or jobs…'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        {activeTab === 'candidates' && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
                                {['All', ...STAGES].map(s => {
                                    const cfg = STAGE_CONFIG[s];
                                    return (
                                        <button key={s} onClick={() => setStageFilter(s)} style={{
                                            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                                            border: stageFilter === s ? `1.5px solid ${cfg?.color || '#6366f1'}` : '1.5px solid #e2e8f0',
                                            background: stageFilter === s ? (cfg?.bg || '#eef2ff') : '#fff',
                                            color: stageFilter === s ? (cfg?.color || '#4f46e5') : '#64748b',
                                        }}>{s}</button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rd-table-scroll">
                        {/* ── Jobs Table ── */}
                        {activeTab === 'jobs' && (
                            <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
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
                                        <th style={{ width: 80 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading…</td></tr>
                                    ) : filteredJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                                                <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>No job postings yet</div>
                                                <div style={{ fontSize: 12, marginTop: 4 }}>Click "+ Post Job" to create one.</div>
                                            </td>
                                        </tr>
                                    ) : filteredJobs.map(job => {
                                        const sc = JOB_STATUS[job.status] || JOB_STATUS.Open;
                                        return (
                                            <tr key={job.id}>
                                                <td data-label="Job Title">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <Briefcase size={16} color="#6366f1" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: 'var(--rd-text-main)', fontSize: 13 }}>{job.title}</div>
                                                            {job.salaryMin && <div style={{ fontSize: 10, color: '#94a3b8' }}>₹{(job.salaryMin/100000).toFixed(1)}L – ₹{(job.salaryMax/100000).toFixed(1)}L</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Department" style={{ fontSize: 13, color: '#475569' }}>
                                                    {job.department ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Building2 size={12} color="#94a3b8" />{job.department}</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                                <td data-label="Location" style={{ fontSize: 13, color: '#475569' }}>
                                                    {job.location ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} color="#94a3b8" />{job.location}</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                                <td data-label="Type"><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, background: '#f1f5f9', color: '#475569' }}>{job.type}</span></td>
                                                <td data-label="Openings" style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>{job.openings}</td>
                                                <td data-label="Applicants" style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', textAlign: 'center' }}>{job.totalCandidates}</td>
                                                <td data-label="Deadline" style={{ fontSize: 12, color: '#64748b' }}>
                                                    {job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                                <td data-label="Status">
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: sc.bg, color: sc.color }}>{job.status}</span>
                                                </td>
                                                <td data-label="Actions">
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => setEditJob(job)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#475569', display: 'flex' }}><Edit2 size={13} /></button>
                                                        <button onClick={() => deleteJob(job.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {/* ── Candidates Table ── */}
                        {activeTab === 'candidates' && (
                            <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Applied For</th>
                                        <th>Contact</th>
                                        <th>Source</th>
                                        <th style={{ width: 130 }}>Stage</th>
                                        <th>Rating</th>
                                        <th>Applied On</th>
                                        <th style={{ width: 80 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading…</td></tr>
                                    ) : filteredCands.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                                                <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>No candidates found</div>
                                                <div style={{ fontSize: 12, marginTop: 4 }}>Add a candidate or change the filter.</div>
                                            </td>
                                        </tr>
                                    ) : filteredCands.map(c => {
                                        const cfg = STAGE_CONFIG[c.stage] || STAGE_CONFIG.Applied;
                                        const stageIdx = STAGES.indexOf(c.stage);
                                        return (
                                            <tr key={c.id}>
                                                <td data-label="Candidate">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                                            {(c.name || '?').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: 'var(--rd-text-main)', fontSize: 13 }}>{c.name}</div>
                                                            {c.email && <div style={{ fontSize: 10, color: '#94a3b8' }}>{c.email}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Job" style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{c.job?.title || '—'}</td>
                                                <td data-label="Contact" style={{ fontSize: 12, color: '#64748b' }}>{c.phone || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                                                <td data-label="Source">
                                                    {c.source ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: '#475569' }}>{c.source}</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                                                </td>
                                                <td data-label="Stage">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{c.stage}</span>
                                                        {/* Quick advance */}
                                                        {stageIdx < STAGES.length - 2 && (
                                                            <button onClick={() => moveStage(c, STAGES[stageIdx + 1])} title={`Move to ${STAGES[stageIdx+1]}`} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 2 }}>
                                                                <ArrowRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td data-label="Rating">
                                                    <div style={{ display: 'flex', gap: 2 }}>
                                                        {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={c.rating >= n ? '#f59e0b' : 'none'} color={c.rating >= n ? '#f59e0b' : '#e2e8f0'} />)}
                                                    </div>
                                                </td>
                                                <td data-label="Applied" style={{ fontSize: 11, color: '#94a3b8' }}>
                                                    {new Date(c.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td data-label="Actions">
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => setEditCand(c)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#475569', display: 'flex' }}><Edit2 size={13} /></button>
                                                        <button onClick={() => deleteCand(c.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Recruitment;
