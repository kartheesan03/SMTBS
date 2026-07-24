import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight,
    Gift, Flag, Building2, Star, Sun, AlertCircle, Check
} from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const TYPE_CONFIG = {
    National: { color: '#ef4444', bg: '#fee2e2', icon: Flag },
    Regional: { color: '#f59e0b', bg: '#fffbeb', icon: Sun },
    Company:  { color: '#6366f1', bg: '#eef2ff', icon: Building2 },
    Optional: { color: '#10b981', bg: '#ecfdf5', icon: Star },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const HolidayModal = ({ holiday, onClose, onSave }) => {
    const [form, setForm] = useState(
        holiday
            ? { name: holiday.name, date: holiday.date, type: holiday.type, description: holiday.description || '', color: holiday.color || '#6366f1', isRecurring: holiday.isRecurring || false }
            : { name: '', date: '', type: 'Company', description: '', color: '#6366f1', isRecurring: false }
    );
    const [saving, setSaving] = useState(false);

    const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const submit = async e => {
        e.preventDefault();
        if (!form.name.trim() || !form.date) return toast.error('Name and date are required');
        setSaving(true);
        try {
            if (holiday) {
                const { data } = await API.put(`/holidays/${holiday.id}`, form);
                onSave(data, 'edit');
                toast.success('Holiday updated!');
            } else {
                const { data } = await API.post('/holidays', form);
                onSave(data, 'add');
                toast.success('Holiday added!');
            }
            onClose();
        } catch { toast.error('Failed to save holiday'); }
        finally { setSaving(false); }
    };

    const inp = {
        width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
        borderRadius: 0, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a', background: '#fff'
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 0, padding: 28, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{holiday ? 'Edit Holiday' : 'Add Holiday'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Holiday Name *</label>
                        <input name="name" value={form.name} onChange={handle} placeholder="e.g. Diwali" style={inp} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Date *</label>
                            <input type="date" name="date" value={form.date} onChange={handle} style={inp} required />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Type</label>
                            <select name="type" value={form.type} onChange={handle} style={inp}>
                                {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Description</label>
                        <textarea name="description" value={form.description} onChange={handle} rows={2} placeholder="Optional note…" style={{ ...inp, resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Color</label>
                            <input type="color" name="color" value={form.color} onChange={handle} style={{ ...inp, padding: 4, height: 36, width: 60 }} />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer', marginTop: 18 }}>
                            <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handle} />
                            Recurring yearly
                        </label>
                    </div>
                    <button type="submit" disabled={saving} style={{
                        padding: '11px 0', borderRadius: 0, border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                        fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, marginTop: 4
                    }}>
                        {saving ? 'Saving…' : holiday ? 'Save Changes' : 'Add Holiday'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Mini Calendar ─────────────────────────────────────────────────────────────
const MiniCalendar = ({ year, month, holidays }) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const holidayDates = new Set(
        holidays.filter(h => {
            const d = new Date(h.date);
            return d.getFullYear() === year && d.getMonth() === month;
        }).map(h => new Date(h.date).getDate())
    );
    const holidayMap = {};
    holidays.filter(h => {
        const d = new Date(h.date);
        return d.getFullYear() === year && d.getMonth() === month;
    }).forEach(h => { holidayMap[new Date(h.date).getDate()] = h; });

    const today = new Date();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
                {DAYS.map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const isHoliday = holidayDates.has(day);
                    const h = holidayMap[day];
                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                    return (
                        <div
                            key={i}
                            title={h ? h.name : ''}
                            style={{
                                textAlign: 'center', fontSize: 11, fontWeight: isToday || isHoliday ? 700 : 400,
                                padding: '5px 2px', borderRadius: 0, cursor: isHoliday ? 'pointer' : 'default',
                                background: isHoliday ? (h?.color || '#6366f1') + '20' : isToday ? '#eef2ff' : 'transparent',
                                color: isHoliday ? (h?.color || '#6366f1') : isToday ? '#4f46e5' : '#475569',
                                border: isToday ? '1.5px solid #c7d2fe' : '1.5px solid transparent',
                                position: 'relative'
                            }}
                        >
                            {day}
                            {isHoliday && <div style={{ width: 4, height: 4, borderRadius: '0px', background: h?.color || '#6366f1', margin: '2px auto 0' }} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HolidayCalendar = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [year, setYear]         = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [showModal, setShowModal] = useState(false);
    const [editHoliday, setEditHoliday] = useState(null);
    const [filterType, setFilterType] = useState('All');

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/holidays?year=${year}`);
            setHolidays(data || []);
        } catch { setHolidays([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchHolidays(); }, [year]);

    const handleSave = (saved, action) => {
        if (action === 'add') setHolidays(prev => [...prev, saved].sort((a, b) => new Date(a.date) - new Date(b.date)));
        else setHolidays(prev => prev.map(h => h.id === saved.id ? saved : h));
    };

    const handleDelete = async id => {
        if (!window.confirm('Delete this holiday?')) return;
        try {
            await API.delete(`/holidays/${id}`);
            setHolidays(prev => prev.filter(h => h.id !== id));
            toast.success('Holiday deleted');
        } catch { toast.error('Failed to delete'); }
    };

    // Stats
    const national = holidays.filter(h => h.type === 'National').length;
    const company  = holidays.filter(h => h.type === 'Company').length;
    const optional = holidays.filter(h => h.type === 'Optional').length;
    const upcoming = holidays.filter(h => new Date(h.date) >= new Date()).length;

    // Month view holidays
    const monthHolidays = holidays.filter(h => {
        const d = new Date(h.date);
        return d.getMonth() === viewMonth && d.getFullYear() === year;
    });

    // Filtered list
    const filtered = (filterType === 'All' ? holidays : holidays.filter(h => h.type === filterType))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by month for the list view
    const grouped = {};
    filtered.forEach(h => {
        const m = new Date(h.date).getMonth();
        if (!grouped[m]) grouped[m] = [];
        grouped[m].push(h);
    });

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rd-container">
            {(showModal || editHoliday) && (
                <HolidayModal
                    holiday={editHoliday}
                    onClose={() => { setShowModal(false); setEditHoliday(null); }}
                    onSave={handleSave}
                />
            )}

            <div className="rd-content">
                {/* Header */}
                <div className="rd-module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="rd-module-title" style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>Holiday Calendar</span>
                            <span className="rd-module-badge" style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>HRMS</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {/* Year navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 0, padding: '4px 10px' }}>
                            <button onClick={() => setYear(y => y - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><ChevronLeft size={16} /></button>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', minWidth: 40, textAlign: 'center' }}>{year}</span>
                            <button onClick={() => setYear(y => y + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><ChevronRight size={16} /></button>
                        </div>
                        <button onClick={() => { setEditHoliday(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 0, border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
                            <Plus size={15} /> Add Holiday
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <StatGrid>
                    <StatCard title="Total Holidays"   value={loading ? '…' : holidays.length} colorTheme="blue"   icon={Calendar} trendValue={`In ${year}`} trendPositive={true} />
                    <StatCard title="Upcoming"         value={loading ? '…' : upcoming}         colorTheme="mint"   icon={Gift}     trendValue="Remaining this year" trendPositive={true} />
                    <StatCard title="National"         value={loading ? '…' : national}         colorTheme="peach"  icon={Flag}     trendValue="Public holidays" trendPositive={true} />
                    <StatCard title="Company Declared" value={loading ? '…' : company}          colorTheme="purple" icon={Building2} trendValue="Internal holidays" trendPositive={true} />
                </StatGrid>

                {/* Main Grid: Calendar + List */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

                    {/* ── Left: Mini Calendar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rd-table-card" style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{MONTHS[viewMonth]} {year}</span>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => setViewMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><ChevronLeft size={15} /></button>
                                    <button onClick={() => setViewMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><ChevronRight size={15} /></button>
                                </div>
                            </div>
                            <MiniCalendar year={year} month={viewMonth} holidays={holidays} />

                            {/* This month's holidays */}
                            {monthHolidays.length > 0 && (
                                <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>This Month</div>
                                    {monthHolidays.map(h => (
                                        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '0px', background: h.color || '#6366f1', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{h.name}</div>
                                                <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Legend */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rd-table-card" style={{ padding: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>Holiday Types</div>
                            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <cfg.icon size={14} color={cfg.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{type}</div>
                                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{holidays.filter(h => h.type === type).length} holiday{holidays.filter(h => h.type === type).length !== 1 ? 's' : ''}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* ── Right: Holiday List ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rd-table-card">
                        <div className="rd-table-header" style={{ borderBottom: 'none', flexWrap: 'wrap', gap: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>All Holidays — {year}</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {['All', ...Object.keys(TYPE_CONFIG)].map(t => (
                                    <button key={t} onClick={() => setFilterType(t)} style={{
                                        padding: '5px 12px', borderRadius: 0, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                        border: filterType === t ? `1.5px solid ${TYPE_CONFIG[t]?.color || '#6366f1'}` : '1.5px solid #e2e8f0',
                                        background: filterType === t ? (TYPE_CONFIG[t]?.bg || '#eef2ff') : '#fff',
                                        color: filterType === t ? (TYPE_CONFIG[t]?.color || '#4f46e5') : '#64748b',
                                        transition: 'all 0.15s'
                                    }}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <div className="rd-table-scroll">
                            <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Holiday</th>
                                        <th>Date</th>
                                        <th>Day</th>
                                        <th>Type</th>
                                        <th>Recurring</th>
                                        <th style={{ width: 80 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading holidays…</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                                                <AlertCircle size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                                                <div style={{ fontSize: 14, fontWeight: 600 }}>No holidays found</div>
                                                <div style={{ fontSize: 12, marginTop: 4 }}>Click "+ Add Holiday" to add the first one.</div>
                                            </td>
                                        </tr>
                                    ) : Object.entries(grouped).map(([monthIdx, mHols]) => (
                                        <React.Fragment key={monthIdx}>
                                            <tr>
                                                <td colSpan={6} style={{ background: '#f8fafc', padding: '8px 16px' }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                                        {MONTHS[parseInt(monthIdx)]}
                                                    </span>
                                                </td>
                                            </tr>
                                            {mHols.map(h => {
                                                const cfg = TYPE_CONFIG[h.type] || TYPE_CONFIG.Company;
                                                const d = new Date(h.date);
                                                const isPast = d < new Date();
                                                return (
                                                    <tr key={h.id} style={{ opacity: isPast ? 0.6 : 1 }}>
                                                        <td data-label="Holiday">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                <div style={{ width: 36, height: 36, borderRadius: 0, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <cfg.icon size={16} color={cfg.color} />
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, color: 'var(--rd-text-main)', fontSize: 13 }}>{h.name}</div>
                                                                    {h.description && <div style={{ fontSize: 11, color: '#94a3b8' }}>{h.description}</div>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td data-label="Date" style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                                                            {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td data-label="Day" style={{ fontSize: 13, color: '#64748b' }}>
                                                            {d.toLocaleDateString('en-IN', { weekday: 'long' })}
                                                        </td>
                                                        <td data-label="Type">
                                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 0, background: cfg.bg, color: cfg.color }}>
                                                                {h.type}
                                                            </span>
                                                        </td>
                                                        <td data-label="Recurring">
                                                            {h.isRecurring
                                                                ? <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Yearly</span>
                                                                : <span style={{ fontSize: 11, color: '#cbd5e1' }}>—</span>}
                                                        </td>
                                                        <td data-label="Actions">
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                <button onClick={() => setEditHoliday(h)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 0, padding: '5px 8px', cursor: 'pointer', color: '#475569', display: 'flex' }}><Edit2 size={13} /></button>
                                                                <button onClick={() => handleDelete(h.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 0, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default HolidayCalendar;
