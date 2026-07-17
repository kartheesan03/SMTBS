import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { motion } from 'framer-motion';
import {
    BookOpen, Users, TrendingUp, Award, Play, CheckCircle,
    Search, Plus, Star, Target, Layers, Code, Heart,
    MessageSquare, Shield, Calendar, User, Zap, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'all',         label: 'All',            icon: Layers },
    { id: 'technical',   label: 'Technical',       icon: Code },
    { id: 'leadership',  label: 'Leadership',      icon: Target },
    { id: 'compliance',  label: 'Compliance',      icon: Shield },
    { id: 'soft-skills', label: 'Soft Skills',     icon: MessageSquare },
    { id: 'health',      label: 'Health & Safety', icon: Heart },
];

const STATUS_STYLE = {
    'Completed':   { color: '#059669', bg: '#ecfdf5' },
    'In Progress': { color: '#2563eb', bg: '#eff6ff' },
    'Not Started': { color: '#64748b', bg: '#f1f5f9' },
};

const BADGE_STYLE = {
    'Mandatory': { color: '#dc2626', bg: '#fee2e2' },
    'New':       { color: '#059669', bg: '#ecfdf5' },
    'Popular':   { color: '#2563eb', bg: '#eff6ff' },
    'Top Rated': { color: '#7c3aed', bg: '#f5f3ff' },
};

// ── Add Course Modal ──────────────────────────────────────────────────────────
const AddCourseModal = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        title: '', description: '', category: 'technical',
        instructor: '', duration: '', capacity: 30,
        badge: '', color: '#3b82f6', dueDate: '', rating: 0
    });
    const [saving, setSaving] = useState(false);
    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async e => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');
        setSaving(true);
        try {
            const { data } = await API.post('/training/courses', form);
            toast.success('Course created!');
            onSave(data);
            onClose();
        } catch {
            toast.error('Failed to create course');
        } finally { setSaving(false); }
    };

    const inp = {
        width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
        borderRadius: 8, fontSize: 13, outline: 'none',
        boxSizing: 'border-box', color: '#0f172a', background: '#fff'
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: 28, width: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Add New Course</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Course Title *</label>
                        <input name="title" value={form.title} onChange={handle} placeholder="e.g. Advanced Excel & Data Analysis" style={inp} required />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Description</label>
                        <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Brief course description..." style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Category</label>
                            <select name="category" value={form.category} onChange={handle} style={inp}>
                                <option value="technical">Technical</option>
                                <option value="leadership">Leadership</option>
                                <option value="compliance">Compliance</option>
                                <option value="soft-skills">Soft Skills</option>
                                <option value="health">Health & Safety</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Badge</label>
                            <select name="badge" value={form.badge} onChange={handle} style={inp}>
                                <option value="">None</option>
                                <option value="Mandatory">Mandatory</option>
                                <option value="New">New</option>
                                <option value="Popular">Popular</option>
                                <option value="Top Rated">Top Rated</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Instructor</label>
                            <input name="instructor" value={form.instructor} onChange={handle} placeholder="Instructor name" style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Duration</label>
                            <input name="duration" value={form.duration} onChange={handle} placeholder="e.g. 8 hrs" style={inp} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Capacity</label>
                            <input type="number" name="capacity" value={form.capacity} onChange={handle} min={1} style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Due Date</label>
                            <input type="date" name="dueDate" value={form.dueDate} onChange={handle} style={inp} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Color</label>
                            <input type="color" name="color" value={form.color} onChange={handle} style={{ ...inp, padding: 4, height: 38 }} />
                        </div>
                    </div>
                    <button type="submit" disabled={saving} style={{
                        padding: '11px 0', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                        fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
                    }}>
                        {saving ? 'Creating…' : 'Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const TrainingDevelopment = () => {
    const { user } = useContext(AuthContext);

    const [courses, setCourses]       = useState([]);
    const [stats, setStats]           = useState({});
    const [myProgress, setMyProgress] = useState({});
    const [loading, setLoading]       = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [enrollingId, setEnrollingId] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [c, s, p] = await Promise.all([
                API.get('/training/courses').catch(() => ({ data: [] })),
                API.get('/training/stats').catch(() => ({ data: {} })),
                API.get('/training/my-progress').catch(() => ({ data: {} })),
            ]);
            setCourses(c.data || []);
            setStats(s.data || {});
            setMyProgress(p.data || {});
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleEnroll = async courseId => {
        setEnrollingId(courseId);
        try {
            await API.post(`/training/courses/${courseId}/enroll`);
            toast.success('Enrolled successfully!');
            fetchAll();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Enrollment failed');
        } finally { setEnrollingId(null); }
    };

    const filtered = courses.filter(c => {
        const matchCat  = activeCategory === 'all' || c.category === activeCategory;
        const matchSrch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.instructor || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSrch;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            {showAddModal && (
                <AddCourseModal
                    onClose={() => setShowAddModal(false)}
                    onSave={newCourse => setCourses(prev => [newCourse, ...prev])}
                />
            )}

            <div className="rd-content">
                {/* ── Module Header ── */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Training &amp; Development</span>
                            <span className="rd-module-badge">HRMS</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="rd-btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <Plus size={15} /> Add Course
                        </button>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <PastelKPIGrid>
                    <PastelKPICard
                        title="Total Courses"
                        value={stats.totalCourses ?? 0}
                        colorTheme="blue"
                        icon={BookOpen}
                        trendValue="All categories"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Enrolled Employees"
                        value={stats.enrolledEmployees ?? 0}
                        colorTheme="purple"
                        icon={Users}
                        trendValue="Across all courses"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Avg. Completion"
                        value={`${stats.avgCompletion ?? 0}%`}
                        colorTheme="mint"
                        icon={TrendingUp}
                        trendValue="Overall completion rate"
                        trendPositive={(stats.avgCompletion ?? 0) >= 60}
                    />
                    <PastelKPICard
                        title="Certifications"
                        value={stats.certifications ?? 0}
                        colorTheme="yellow"
                        icon={Award}
                        trendValue="Courses completed"
                        trendPositive={true}
                    />
                </PastelKPIGrid>

                {/* ── Table / Course Section ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rd-table-card"
                >
                    {/* Table header: search + category filter */}
                    <div className="rd-table-header" style={{ borderBottom: 'none', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                            <div className="rd-search-bar" style={{ minWidth: 240, flexShrink: 0, background: '#fff' }}>
                                <Search size={16} color="#94a3b8" />
                                <input
                                    type="text"
                                    className="rd-search-input"
                                    placeholder="Search courses or instructors…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {/* Category pills */}
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none' }}>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 5,
                                            padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                            border: activeCategory === cat.id ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
                                            background: activeCategory === cat.id ? '#eef2ff' : '#fff',
                                            color: activeCategory === cat.id ? '#4f46e5' : '#64748b',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            flexShrink: 0, whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <cat.icon size={12} />{cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Course table */}
                    <div className="rd-table-scroll">
                        <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Category</th>
                                    <th>Instructor</th>
                                    <th>Duration</th>
                                    <th style={{ width: 100 }}>Enrolled</th>
                                    <th style={{ width: 130 }}>My Progress</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th style={{ width: 120 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                                            Loading training data…
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                                            <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                                            <div style={{ fontSize: 15, fontWeight: 600 }}>No courses found</div>
                                            <div style={{ fontSize: 13, marginTop: 4 }}>
                                                {courses.length === 0
                                                    ? 'Click "+ Add Course" to create your first training course.'
                                                    : 'Try a different category or search term.'}
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map((course, i) => {
                                    const ss = STATUS_STYLE[course.myStatus] || STATUS_STYLE['Not Started'];
                                    const bs = course.badge ? (BADGE_STYLE[course.badge] || { color: '#2563eb', bg: '#eff6ff' }) : null;
                                    const isEnrolling = enrollingId === course.id;
                                    const catLabel = CATEGORIES.find(c => c.id === course.category)?.label || course.category;

                                    return (
                                        <tr key={course.id || i}>
                                            {/* Course name */}
                                            <td data-label="Course">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: 10,
                                                        background: `${course.color || '#3b82f6'}18`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                        borderLeft: `3px solid ${course.color || '#3b82f6'}`
                                                    }}>
                                                        <BookOpen size={15} color={course.color || '#3b82f6'} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--rd-text-main)', fontSize: 13 }}>{course.title}</div>
                                                        {bs && (
                                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: bs.bg, color: bs.color }}>
                                                                {course.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Category */}
                                            <td data-label="Category">
                                                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                                    {catLabel}
                                                </span>
                                            </td>
                                            {/* Instructor */}
                                            <td data-label="Instructor" style={{ fontSize: 13, color: '#475569' }}>
                                                {course.instructor ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <User size={12} color="#94a3b8" />{course.instructor}
                                                    </span>
                                                ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                            {/* Duration */}
                                            <td data-label="Duration" style={{ fontSize: 13, color: '#475569' }}>
                                                {course.duration ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <Calendar size={12} color="#94a3b8" />{course.duration}
                                                    </span>
                                                ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                            {/* Enrolled */}
                                            <td data-label="Enrolled" style={{ fontSize: 13, color: '#475569' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <Users size={12} color="#94a3b8" />
                                                    {course.enrolled || 0}/{course.capacity || 30}
                                                </span>
                                            </td>
                                            {/* Progress bar */}
                                            <td data-label="My Progress">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ flex: 1, height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', minWidth: 60 }}>
                                                        <div style={{ width: `${course.myProgress || 0}%`, height: '100%', background: course.color || '#3b82f6', borderRadius: 4 }} />
                                                    </div>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--rd-text-main)', width: 28 }}>
                                                        {course.myProgress || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Status badge */}
                                            <td data-label="Status">
                                                <span className={`ui-badge ${course.myStatus === 'Completed' ? 'success' : course.myStatus === 'In Progress' ? 'primary' : 'default'}`}>
                                                    {course.myStatus || 'Not Started'}
                                                </span>
                                            </td>
                                            {/* Due Date */}
                                            <td data-label="Due Date" style={{ fontSize: 12, color: '#64748b' }}>
                                                {course.dueDate
                                                    ? new Date(course.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : <span style={{ color: '#cbd5e1' }}>—</span>}
                                            </td>
                                            {/* Action */}
                                            <td data-label="Action">
                                                <button
                                                    onClick={() => course.myStatus === 'Not Started' && handleEnroll(course.id)}
                                                    disabled={isEnrolling || course.myStatus !== 'Not Started'}
                                                    style={{
                                                        padding: '6px 12px', borderRadius: 7, border: 'none',
                                                        background: course.myStatus === 'Completed'
                                                            ? '#ecfdf5'
                                                            : course.myStatus === 'In Progress'
                                                                ? '#eff6ff'
                                                                : `${course.color || '#6366f1'}15`,
                                                        color: course.myStatus === 'Completed' ? '#059669'
                                                            : course.myStatus === 'In Progress' ? '#2563eb'
                                                                : (course.color || '#6366f1'),
                                                        fontWeight: 700, fontSize: 11,
                                                        cursor: course.myStatus === 'Not Started' && !isEnrolling ? 'pointer' : 'default',
                                                        display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                                                        opacity: isEnrolling ? 0.6 : 1
                                                    }}
                                                >
                                                    {isEnrolling ? 'Enrolling…'
                                                        : course.myStatus === 'Completed' ? <><CheckCircle size={12} /> Certified</>
                                                            : course.myStatus === 'In Progress' ? <><Play size={12} /> Continue</>
                                                                : <><Zap size={12} /> Enroll</>}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TrainingDevelopment;
