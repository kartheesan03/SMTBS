import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Clock, CheckCircle, XCircle, Calendar, ChevronLeft, ChevronRight,
    Play, Square, Timer, TrendingUp, Activity, Search, Download,
    AlertCircle, BarChart2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

/* ─────────────────────────── helpers ─────────────────────────── */
const MONTHS = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

const parseDateTime = (ts, base) => {
    if (!ts) return null;
    if (ts.includes('T') || (ts.includes('-') && ts.includes(':') && ts.length > 10)) {
        const d = new Date(ts);
        if (!isNaN(d)) return d;
    }
    const dp = base ? base.split('T')[0] : new Date().toISOString().split('T')[0];
    const d = new Date(`${dp} ${ts}`);
    return isNaN(d) ? null : d;
};

const fmtTime = (ts, base) => {
    if (!ts) return '—';
    const d = parseDateTime(ts, base);
    if (!d) return '—';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fmtDate = (ds) => {
    if (!ds) return '—';
    return new Date(ds).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calcHrs = (ci, co, base) => {
    const s = parseDateTime(ci, base);
    const e = parseDateTime(co, base);
    if (!s || !e) return null;
    const h = (e - s) / 36e5;
    return h > 0 ? h : null;
};

/* ─────────────────────────── Status Badge ─────────────────────── */
const STATUS_META = {
    Present:    { bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
    Late:       { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04' },
    Absent:     { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
    'On Leave': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    '-':        { bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
};
const StatusBadge = ({ status }) => {
    const s = STATUS_META[status] || STATUS_META['-'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 20,
            background: s.bg, color: s.color, fontSize: 12, fontWeight: 700
        }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
            {status === '-' ? 'Not Checked In' : status}
        </span>
    );
};

/* ─────────────────────────── Today Hero Card ──────────────────── */
const TodayCard = ({ status, timer, onCheckIn, onCheckOut, busy }) => {
    const isActive    = status?.checkIn && !status?.checkOut;
    const isCompleted = status?.checkIn && status?.checkOut;
    const bg = isActive    ? 'linear-gradient(135deg,#1e3a5f,#1e40af)'
             : isCompleted ? 'linear-gradient(135deg,#064e3b,#065f46)'
             :               'linear-gradient(135deg,#1e293b,#334155)';
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
                background: bg, borderRadius: 24, padding: '32px',
                color: '#fff', position: 'relative', overflow: 'hidden',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 20, marginBottom: 24,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
        >
            {/* decorative blobs */}
            <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:-60, right:80, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Timer size={18} />
                    </div>
                    <span style={{ fontSize:13, fontWeight:600, opacity:0.8, textTransform:'uppercase', letterSpacing:0.5 }}>
                        {isCompleted ? 'Shift Completed' : isActive ? 'Active Session' : "Today's Attendance"}
                    </span>
                    {isActive && <span style={{ background:'#ef4444', fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:20 }}>LIVE</span>}
                </div>
                <div style={{ fontSize:40, fontWeight:900, letterSpacing:-2, lineHeight:1 }}>{timer}</div>
                <div style={{ display:'flex', gap:24, marginTop:16, flexWrap:'wrap' }}>
                    {[
                        { label:'Check In',  val: fmtTime(status?.checkIn,  status?.date) },
                        { label:'Check Out', val: fmtTime(status?.checkOut, status?.date) },
                        { label:'Status',    val: status?.status || '—' },
                    ].map((item, i, arr) => (
                        <React.Fragment key={item.label}>
                            <div>
                                <p style={{ margin:'0 0 2px', fontSize:11, opacity:0.6, textTransform:'uppercase', letterSpacing:0.5, fontWeight:600 }}>{item.label}</p>
                                <p style={{ margin:0, fontSize:17, fontWeight:700 }}>{item.val}</p>
                            </div>
                            {i < arr.length-1 && <div style={{ width:1, background:'rgba(255,255,255,0.15)' }} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div style={{ position:'relative', zIndex:1 }}>
                {!status?.checkIn ? (
                    <button onClick={onCheckIn} disabled={busy} style={{
                        display:'flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:12,
                        border:'none', background:'#22c55e', color:'#fff', fontWeight:700, fontSize:15,
                        cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
                        boxShadow:'0 4px 16px rgba(34,197,94,0.4)'
                    }}>
                        <Play size={18} fill="currentColor" /> {busy ? 'Processing…' : 'Check In'}
                    </button>
                ) : !status?.checkOut ? (
                    <button onClick={onCheckOut} disabled={busy} style={{
                        display:'flex', alignItems:'center', gap:8, padding:'12px 28px', borderRadius:12,
                        border:'none', background:'#ef4444', color:'#fff', fontWeight:700, fontSize:15,
                        cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1,
                        boxShadow:'0 4px 16px rgba(239,68,68,0.4)'
                    }}>
                        <Square size={18} fill="currentColor" /> {busy ? 'Processing…' : 'Check Out'}
                    </button>
                ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:12, background:'rgba(255,255,255,0.12)', fontWeight:700 }}>
                        <CheckCircle size={18} /> Shift Done!
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ─────────────────────────── Attendance Table (Daily) ─────────── */
const AttendanceTable = ({ rows, showDate = true }) => {
    if (!rows || rows.length === 0) return (
        <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
            <Calendar size={40} style={{ marginBottom:12, opacity:0.3 }} />
            <p style={{ margin:0, fontSize:15, fontWeight:500 }}>No records found</p>
        </div>
    );
    const todayStr = new Date().toISOString().split('T')[0];
    return (
        <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Inter,sans-serif' }}>
                <thead>
                    <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                        {showDate && <th style={TH}>DATE</th>}
                        <th style={TH}>CHECK IN</th>
                        <th style={TH}>CHECK OUT</th>
                        <th style={TH}>HOURS</th>
                        <th style={TH}>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => {
                        const hrs      = calcHrs(r.checkIn, r.checkOut, r.date);
                        const isToday  = (r.date || '').split('T')[0] === todayStr;
                        const rowBg    = isToday ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#fafafa';
                        return (
                            <tr key={r._id || i}
                                style={{ borderBottom:'1px solid #f8fafc', background:rowBg, transition:'background 0.15s' }}
                                onMouseEnter={e=>e.currentTarget.style.background='#f0f9ff'}
                                onMouseLeave={e=>e.currentTarget.style.background=rowBg}
                            >
                                {showDate && (
                                    <td style={TD}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            {isToday && <span style={{ background:'#3b82f6', color:'#fff', fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20 }}>TODAY</span>}
                                            <span style={{ fontWeight:isToday?700:500, color:isToday?'#1e40af':'#374151' }}>
                                                {fmtDate(r.date)}
                                            </span>
                                        </div>
                                    </td>
                                )}
                                <td style={TD}><span style={{ fontWeight:600, color:r.checkIn?'#16a34a':'#94a3b8' }}>{fmtTime(r.checkIn,r.date)}</span></td>
                                <td style={TD}><span style={{ fontWeight:600, color:r.checkOut?'#dc2626':'#94a3b8' }}>{fmtTime(r.checkOut,r.date)}</span></td>
                                <td style={TD}><span style={{ fontWeight:700, color:hrs?'#6366f1':'#94a3b8', fontSize:14 }}>{hrs?`${hrs.toFixed(1)}h`:'—'}</span></td>
                                <td style={TD}><StatusBadge status={r.status||'-'} /></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
const TH = { padding:'12px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:'0.07em', textTransform:'uppercase', whiteSpace:'nowrap' };
const TD = { padding:'14px 20px', fontSize:14, whiteSpace:'nowrap' };

/* ─────────────────────────── Monthly Table (all days) ─────────── */
const STATUS_ROW_META = {
    Present:     { bg:'#f0fdf4', dot:'#16a34a', color:'#166534' },
    Late:        { bg:'#fefce8', dot:'#ca8a04', color:'#854d0e' },
    Absent:      { bg:'#fef2f2', dot:'#dc2626', color:'#991b1b' },
    'On Leave':  { bg:'#eff6ff', dot:'#3b82f6', color:'#1e40af' },
    Sunday:      { bg:'#f8fafc', dot:'#cbd5e1', color:'#94a3b8' },
    'No Record': { bg:'#fff',    dot:'#e2e8f0', color:'#cbd5e1' },
    '-':         { bg:'#fff',    dot:'#e2e8f0', color:'#cbd5e1' },
};
const MonthlyTable = ({ rows, todayStr }) => {
    if (!rows || rows.length === 0) return (
        <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
            <Calendar size={40} style={{ marginBottom:12, opacity:0.3 }} />
            <p style={{ margin:0, fontSize:14, fontWeight:500 }}>No records for this period</p>
        </div>
    );
    return (
        <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Inter,sans-serif' }}>
                <thead>
                    <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                        <th style={TH}>DATE</th>
                        <th style={TH}>DAY</th>
                        <th style={TH}>CHECK IN</th>
                        <th style={TH}>CHECK OUT</th>
                        <th style={TH}>HOURS</th>
                        <th style={TH}>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => {
                        const hrs       = calcHrs(r.checkIn, r.checkOut, r.date);
                        const isToday   = (r.date||'').split('T')[0] === todayStr;
                        const meta      = STATUS_ROW_META[r.status] || STATUS_ROW_META['-'];
                        const isSun     = r.status === 'Sunday';
                        const noRecord  = r.status === 'No Record';
                        const rowBg     = isToday ? '#eff6ff' : meta.bg;
                        const dayName   = new Date(r.date).toLocaleDateString('en-IN',{weekday:'short'});
                        return (
                            <tr key={r._id || r.date || i}
                                style={{ borderBottom:'1px solid #f1f5f9', background:rowBg, transition:'background 0.15s', opacity:isSun?0.55:1 }}
                                onMouseEnter={e=>e.currentTarget.style.background=isToday?'#dbeafe':'#f8fafc'}
                                onMouseLeave={e=>e.currentTarget.style.background=rowBg}
                            >
                                <td style={TD}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                        {isToday && <span style={{ background:'#3b82f6', color:'#fff', fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20 }}>TODAY</span>}
                                        <span style={{ fontWeight:isToday?700:600, color:isToday?'#1e40af':isSun?'#94a3b8':'#374151' }}>
                                            {fmtDate(r.date)}
                                        </span>
                                    </div>
                                </td>
                                <td style={TD}>
                                    <span style={{ fontSize:12, fontWeight:600, color:isSun?'#94a3b8':'#64748b' }}>{dayName}</span>
                                </td>
                                <td style={TD}>
                                    <span style={{ fontWeight:600, color:r.checkIn?'#16a34a':'#cbd5e1' }}>
                                        {r.checkIn ? fmtTime(r.checkIn,r.date) : '—'}
                                    </span>
                                </td>
                                <td style={TD}>
                                    <span style={{ fontWeight:600, color:r.checkOut?'#dc2626':'#cbd5e1' }}>
                                        {r.checkOut ? fmtTime(r.checkOut,r.date) : '—'}
                                    </span>
                                </td>
                                <td style={TD}>
                                    <span style={{ fontWeight:700, color:hrs?'#6366f1':'#cbd5e1', fontSize:14 }}>
                                        {hrs ? `${hrs.toFixed(1)}h` : '—'}
                                    </span>
                                </td>
                                <td style={TD}>
                                    {isSun || noRecord ? (
                                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:20, background:meta.bg, color:meta.color, fontSize:12, fontWeight:600 }}>
                                            <span style={{ width:7, height:7, borderRadius:'50%', background:meta.dot }} />
                                            {r.status}
                                        </span>
                                    ) : (
                                        <StatusBadge status={r.status||'-'} />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

/* ─────────────────────────── Daily Tab ────────────────────────── */
const DailyTab = ({ myHistory }) => {
    const [selDate, setSelDate] = useState(new Date().toISOString().split('T')[0]);
    const goDay = (d) => {
        const nd = new Date(selDate);
        nd.setDate(nd.getDate() + d);
        setSelDate(nd.toISOString().split('T')[0]);
    };
    const isFuture = new Date(selDate) > new Date(new Date().toISOString().split('T')[0]);
    const record = myHistory.find(h => (h.date || '').split('T')[0] === selDate);
    const rows = record ? [record] : [];

    return (
        <div>
            {/* Navigator */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <button onClick={() => goDay(-1)} style={NAV_BTN}><ChevronLeft size={15} /></button>
                <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid #e2e8f0', borderRadius:10, padding:'8px 14px', background:'#f8fafc' }}>
                    <Calendar size={15} color="#3b82f6" />
                    <input type="date" value={selDate} max={new Date().toISOString().split('T')[0]}
                        onChange={e => setSelDate(e.target.value)}
                        style={{ border:'none', background:'transparent', outline:'none', fontSize:13, fontWeight:600, color:'#1e293b', cursor:'pointer' }} />
                </div>
                <button onClick={() => goDay(1)} disabled={isFuture} style={{ ...NAV_BTN, color: isFuture ? '#cbd5e1' : '#64748b', cursor: isFuture ? 'not-allowed' : 'pointer' }}>
                    <ChevronRight size={15} />
                </button>
                <span style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>
                    {new Date(selDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                </span>
            </div>

            {/* Table */}
            <div style={CARD}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:8 }}>
                    <Calendar size={16} color="#3b82f6" />
                    <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#1e293b' }}>Attendance Record</h3>
                </div>
                {isFuture ? (
                    <div style={{ textAlign:'center', padding:'48px 0', color:'#94a3b8' }}>
                        <AlertCircle size={36} style={{ marginBottom:10, opacity:0.3 }} />
                        <p style={{ margin:0, fontSize:14 }}>No data for future dates</p>
                    </div>
                ) : (
                    <AttendanceTable rows={rows} showDate={true} />
                )}
                {!isFuture && !record && (
                    <div style={{ padding:'0 20px 20px', fontSize:13, color:'#94a3b8', textAlign:'center' }}>
                        No attendance recorded for this date
                    </div>
                )}
            </div>
        </div>
    );
};
const NAV_BTN = { width:34, height:34, border:'1px solid #e2e8f0', borderRadius:8, background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b', flexShrink:0 };
const CARD = { background:'#fff', border:'1px solid #f1f5f9', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' };

/* ─────────────────────────── Monthly Tab ───────────────────────── */
const MonthlyTab = ({ myHistory }) => {
    const now = new Date();
    const [year, setYear]   = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth()); // 0-indexed
    const [search, setSearch] = useState('');

    const prevMonth = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
    const nextMonth = () => {
        if (year===now.getFullYear()&&month===now.getMonth()) return;
        if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);
    };
    const atCurrentMonth = year===now.getFullYear()&&month===now.getMonth();

    const daysInMonth  = new Date(year, month+1, 0).getDate();
    const todayStr     = now.toISOString().split('T')[0];
    const todayDay     = now.getDate();
    const limitDay     = atCurrentMonth ? todayDay : daysInMonth;

    // Build a map from day-number → record from API history
    const histMap = {};
    myHistory.forEach(h => {
        if (!h.date) return;
        const d = new Date(h.date);
        if (d.getFullYear() === year && d.getMonth() === month) {
            histMap[d.getDate()] = h;
        }
    });

    // Generate FULL month rows (all days up to today/end-of-month)
    const allRows = Array.from({ length: limitDay }, (_, i) => {
        const day      = i + 1;
        const dateObj  = new Date(year, month, day);
        const isSun    = dateObj.getDay() === 0;
        const dateStr  = dateObj.toISOString().split('T')[0];
        const rec      = histMap[day];
        if (rec) return rec;
        // Synthesise a row for days without a record
        return {
            date:     dateStr,
            checkIn:  null,
            checkOut: null,
            status:   isSun ? 'Sunday' : 'No Record',
            _synthetic: true,
        };
    }).reverse(); // newest first

    // Stats — only from real (non-synthetic) records
    const realRows = allRows.filter(r => !r._synthetic);
    const present  = realRows.filter(r => r.status==='Present' || r.status==='Late').length;
    const absent   = realRows.filter(r => r.status==='Absent').length;
    const onLeave  = realRows.filter(r => r.status==='On Leave').length;
    const totalHrs = realRows.reduce((s,r)=>s+(calcHrs(r.checkIn,r.checkOut,r.date)||0),0);

    // Work days Mon–Sat up to today
    let workDays = 0;
    for (let d=1; d<=limitDay; d++) {
        if (new Date(year,month,d).getDay() !== 0) workDays++;
    }
    const pct = workDays>0 ? Math.round((present/workDays)*100) : 0;
    const pctColor = pct>=90?'#22c55e':pct>=75?'#f59e0b':'#ef4444';

    // Chart data — all days
    const chartData = Array.from({length:daysInMonth},(_,i)=>{
        const d=i+1, rec=histMap[d];
        return { d:`${d}`, h:rec?parseFloat((calcHrs(rec.checkIn,rec.checkOut,rec.date)||0).toFixed(1)):0 };
    });

    // Filter for table search
    const filtered = allRows.filter(r => {
        if (!search) return true;
        return fmtDate(r.date).toLowerCase().includes(search.toLowerCase()) ||
               (r.status||'').toLowerCase().includes(search.toLowerCase());
    });

    const exportCSV = () => {
        const lines=[['Date','Check In','Check Out','Hours','Status']];
        allRows.filter(r=>!r._synthetic).forEach(r=>lines.push([
            fmtDate(r.date),
            fmtTime(r.checkIn,r.date),
            fmtTime(r.checkOut,r.date),
            (calcHrs(r.checkIn,r.checkOut,r.date)||0).toFixed(1),
            r.status||'-'
        ]));
        const csv=lines.map(l=>l.map(c=>`"${c}"`).join(',')).join('\n');
        const a=document.createElement('a');
        a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
        a.download=`attendance_${MONTHS[month]}_${year}.csv`;
        a.click();
    };

    return (
        <div>
            {/* Month Nav */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button onClick={prevMonth} style={NAV_BTN}><ChevronLeft size={15} /></button>
                    <span style={{ fontSize:17, fontWeight:800, color:'#1e293b', minWidth:180, textAlign:'center' }}>
                        {MONTHS[month]} {year}
                    </span>
                    <button onClick={nextMonth} disabled={atCurrentMonth}
                        style={{...NAV_BTN, color:atCurrentMonth?'#cbd5e1':'#64748b', cursor:atCurrentMonth?'not-allowed':'pointer'}}>
                        <ChevronRight size={15} />
                    </button>
                </div>
                <button onClick={exportCSV} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',border:'none',borderRadius:8,background:'#3b82f6',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer' }}>
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
                {[
                    { label:'Present', val:present, color:'#22c55e', bg:'#f0fdf4' },
                    { label:'Absent',  val:absent,  color:'#ef4444', bg:'#fef2f2' },
                    { label:'On Leave',val:onLeave, color:'#3b82f6', bg:'#eff6ff' },
                    { label:'Total Hours', val:`${totalHrs.toFixed(1)}h`, color:'#8b5cf6', bg:'#f5f3ff' },
                    { label:'Attendance %', val:`${pct}%`, color:pctColor, bg:`${pctColor}18` },
                ].map(k=>(
                    <div key={k.label} style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:12, padding:'14px 18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                        <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5 }}>{k.label}</p>
                        <p style={{ margin:0, fontSize:22, fontWeight:900, color:k.color }}>{k.val}</p>
                    </div>
                ))}
            </div>

            {/* Work Hours Chart */}
            <div style={{ ...CARD, padding:'20px 24px', marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                    <BarChart2 size={16} color="#6366f1" />
                    <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#1e293b' }}>Daily Work Hours — {MONTHS[month]} {year}</h3>
                </div>
                <div style={{ height:160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{top:4,right:8,left:-24,bottom:0}}>
                            <defs>
                                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="d" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} dy={6} interval={1} />
                            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} unit="h" />
                            <Tooltip formatter={v=>[`${v}h`,'Hours']} contentStyle={{borderRadius:8,border:'1px solid #e2e8f0',fontSize:12}} />
                            <Area type="monotone" dataKey="h" stroke="#6366f1" strokeWidth={2.5} fill="url(#hGrad)" dot={{r:2.5,fill:'#6366f1'}} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Records Table */}
            <div style={CARD}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <Calendar size={15} color="#3b82f6" />
                        <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#1e293b' }}>Monthly Records</h3>
                        <span style={{ background:'#f1f5f9', color:'#64748b', fontSize:12, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>
                            {limitDay} days
                        </span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, border:'1px solid #e2e8f0', borderRadius:8, padding:'6px 12px', background:'#f8fafc' }}>
                        <Search size={13} color="#94a3b8" />
                        <input placeholder="Filter by date or status…" value={search} onChange={e=>setSearch(e.target.value)}
                            style={{ border:'none', background:'transparent', outline:'none', fontSize:13, color:'#1e293b', width:200 }} />
                    </div>
                </div>
                <MonthlyTable rows={filtered} todayStr={todayStr} />
            </div>
        </div>
    );
};

/* ─────────────────────────── Main Component ───────────────────── */
const Attendance = () => {
    const { user } = useContext(AuthContext);
    const [status,    setStatus]    = useState(null);
    const [myHistory, setMyHistory] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [busy,      setBusy]      = useState(false);
    const [timer,     setTimer]     = useState('0h 0m 0s');
    const [activeTab, setActiveTab] = useState('daily');
    const [stats,     setStats]     = useState({ present:0, avg:'0h', streak:0 });

    /* live timer */
    useEffect(() => {
        let iv;
        if (status?.checkIn && !status?.checkOut) {
            iv = setInterval(() => {
                const start = parseDateTime(status.checkIn, status.date);
                if (!start) return;
                const diff = Date.now() - start;
                const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
                setTimer(`${h}h ${m}m ${s}s`);
            }, 1000);
        } else if (status?.checkIn && status?.checkOut) {
            const hrs = calcHrs(status.checkIn, status.checkOut, status.date);
            setTimer(hrs ? `${Math.floor(hrs)}h ${Math.round((hrs%1)*60)}m` : '—');
        } else {
            setTimer('0h 0m 0s');
        }
        return () => clearInterval(iv);
    }, [status]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [sRes, hRes] = await Promise.all([
                API.get('/attendance/status'),
                API.get('/attendance/my-history'),
            ]);
            setStatus(sRes.data);
            const today = new Date().toISOString().split('T')[0];
            let hist = hRes.data || [];
            // Replace or prepend today's record using live status data
            const todayIdx = hist.findIndex(h=>(h.date||'').split('T')[0]===today);
            const todayRec = {
                date:     today,
                status:   sRes.data?.status || '-',
                checkIn:  sRes.data?.checkIn  || null,
                checkOut: sRes.data?.checkOut || null,
            };
            if (todayIdx >= 0) {
                hist = [...hist];
                hist[todayIdx] = { ...hist[todayIdx], ...todayRec };
            } else if (sRes.data) {
                hist = [todayRec, ...hist];
            }
            setMyHistory(hist);

            // compute stats
            const nowD = new Date();
            const thisMonth = hist.filter(h=>{
                if(!h.date)return false;
                const d=new Date(h.date);
                return d.getFullYear()===nowD.getFullYear()&&d.getMonth()===nowD.getMonth();
            });
            const presentDays = thisMonth.filter(h=>h.status==='Present'||h.status==='Late').length;
            const withH = hist.filter(h=>h.checkIn&&h.checkOut);
            const totH  = withH.reduce((s,h)=>s+(calcHrs(h.checkIn,h.checkOut,h.date)||0),0);
            const avg   = withH.length>0?`${(totH/withH.length).toFixed(1)}h`:'0h';
            let streak=0;
            const sorted=[...hist].sort((a,b)=>new Date(b.date)-new Date(a.date));
            for(const h of sorted){ if(h.status==='Present'||h.status==='Late')streak++;else break; }
            setStats({ present:presentDays, avg, streak });
        } catch(err){ console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCheckIn = async () => {
        setBusy(true);
        try {
            const { data } = await API.post('/attendance/checkin');
            setStatus(data); await fetchData();
            toast.success('Checked in successfully!');
        } catch(err){ toast.error(err.response?.data?.message||'Check-in failed'); }
        finally { setBusy(false); }
    };

    const handleCheckOut = async () => {
        setBusy(true);
        try {
            const { data } = await API.post('/attendance/checkout');
            setStatus(data); await fetchData();
            toast.success('Checked out successfully!');
        } catch(err){ toast.error(err.response?.data?.message||'Check-out failed'); }
        finally { setBusy(false); }
    };

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:14 }}>
            <div style={{ width:36, height:36, border:'3px solid #e2e8f0', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Loading your attendance…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const tabs = [
        { id:'daily',   label:'Daily View',   icon:Calendar   },
        { id:'monthly', label:'Monthly View', icon:TrendingUp },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="attendance-module"
            style={{ fontFamily:'Inter,sans-serif', background:'#f8fafc', minHeight:'100vh', padding:'28px 32px', boxSizing:'border-box' }}
        >
            <div style={{ maxWidth:1100, margin:'0 auto' }}>

                {/* Page Header */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom:20 }}
                >
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                        <h1 style={{ margin:0, fontSize:28, fontWeight:800, color:'#0f172a' }}>Attendance Tracker</h1>
                        <span style={{ background:'#4f46e5', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 12px', borderRadius:20, letterSpacing:0.5 }}>HRMS</span>
                    </div>
                    <p style={{ margin:0, fontSize:14, color:'#64748b' }}>Your personal attendance records · {user?.name || ''}</p>
                </motion.div>

                {/* Mini KPIs */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:16, marginBottom:24 }}>
                    {[
                        { label:'Present This Month', val:stats.present, icon:CheckCircle, color:'#4f46e5', bg:'#eef2ff' },
                        { label:'Avg Hours / Day',    val:stats.avg,     icon:Activity,    color:'#6366f1', bg:'#f5f3ff' },
                        { label:'Current Streak',     val:`${stats.streak} days`, icon:TrendingUp, color:'#f59e0b', bg:'#fffbeb' },
                    ].map((k, idx)=>(
                        <motion.div 
                            key={k.label} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (idx * 0.1) }}
                            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
                            style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:20, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 4px 15px rgba(0,0,0,0.02)', transition: 'box-shadow 0.2s ease' }}
                        >
                            <div style={{ width:48, height:48, borderRadius:14, background:k.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <k.icon size={22} color={k.color} />
                            </div>
                            <div>
                                <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:0.5 }}>{k.label}</p>
                                <p style={{ margin:0, fontSize:24, fontWeight:900, color:'#0f172a' }}>{k.val}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Today Card */}
                <TodayCard status={status} timer={timer} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} busy={busy} />

                {/* Tabs */}
                <div style={{ display:'flex', gap:4, background:'#f1f5f9', borderRadius:10, padding:4, width:'fit-content', marginBottom:22 }}>
                    {tabs.map(t=>(
                        <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                            display:'flex', alignItems:'center', gap:7, padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer',
                            background: activeTab===t.id?'#fff':'transparent',
                            color: activeTab===t.id?'#1e293b':'#64748b',
                            fontWeight: activeTab===t.id?700:500, fontSize:13,
                            boxShadow: activeTab===t.id?'0 1px 4px rgba(0,0,0,0.1)':'none',
                            transition:'all 0.2s', fontFamily:'Inter,sans-serif'
                        }}>
                            <t.icon size={15} />{t.label}
                        </button>
                    ))}
                </div>

                {activeTab==='daily'   && <DailyTab   myHistory={myHistory} />}
                {activeTab==='monthly' && <MonthlyTab myHistory={myHistory} />}

            </div>
        </motion.div>
    );
};

export default Attendance;
