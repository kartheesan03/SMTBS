import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search, Filter, ArrowUpRight, ArrowDownRight, Activity, ArrowRightLeft, Download, Eye, Layers } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    const trendData1 = [{v: 40},{v: 45},{v: 42},{v: 50},{v: 48},{v: 55},{v: 60}];
    const trendData2 = [{v: 10},{v: 15},{v: 25},{v: 20},{v: 30},{v: 25},{v: 35}];
    const trendData3 = [{v: 30},{v: 20},{v: 25},{v: 22},{v: 18},{v: 24},{v: 20}];
    const trendData4 = [{v: 5},{v: 8},{v: 12},{v: 10},{v: 15},{v: 14},{v: 18}];

    const logsData = [
        { id: 'TRK-1042', date: 'Oct 24, 2026', time: '14:30', mat: 'MacBook Pro M3', type: 'IN', qty: 50, ref: 'PO-2026-089', user: 'Admin User' },
        { id: 'TRK-1041', date: 'Oct 24, 2026', time: '11:15', mat: 'Ergonomic Chair', type: 'OUT', qty: 12, ref: 'REQ-HR-004', user: 'Jane Smith' },
        { id: 'TRK-1040', date: 'Oct 23, 2026', time: '16:45', mat: '4K Monitor', type: 'TRANSFER', qty: 5, ref: 'TRF-NY-SF', user: 'Admin User' },
        { id: 'TRK-1039', date: 'Oct 23, 2026', time: '09:20', mat: 'Wireless Mouse', type: 'OUT', qty: 25, ref: 'REQ-IT-102', user: 'Mark Johnson' },
        { id: 'TRK-1038', date: 'Oct 22, 2026', time: '15:10', mat: 'Standing Desk', type: 'IN', qty: 10, ref: 'PO-2026-088', user: 'Jane Smith' },
    ];

    const getTypeBadge = (type) => {
        if (type === 'IN') return <span className="rd-status-badge rd-status-green" style={{width: 80, textAlign: 'center'}}>↓ IN</span>;
        if (type === 'OUT') return <span className="rd-status-badge rd-status-orange" style={{width: 80, textAlign: 'center'}}>↑ OUT</span>;
        if (type === 'TRANSFER') return <span className="rd-status-badge rd-status-blue" style={{width: 80, textAlign: 'center'}}>↔ TRANSFER</span>;
        return <span>{type}</span>;
    };

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon">
                        <Activity size={32} />
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-badge" style={{background: '#fef2f2', color: '#ef4444', borderColor: '#fecaca'}}>MOVEMENTS</span>
                            <span className="rd-module-title">Movement Tracking</span>
                        </div>
                        <div className="rd-module-desc">Track all inventory IN/OUT activities, transfers, and historical movement logs.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <TrackingKPICard title="Total Movements" val="3,842" trend="+15.2%" trendDir="up" color="purple" data={trendData1} icon={Layers} />
                    <TrackingKPICard title="Units IN" val="1,250" trend="+24.5%" trendDir="up" color="green" data={trendData2} icon={ArrowDownRight} />
                    <TrackingKPICard title="Units OUT" val="842" trend="-5.4%" trendDir="down" color="orange" data={trendData3} icon={ArrowUpRight} />
                    <TrackingKPICard title="Transferred" val="325" trend="+8.1%" trendDir="up" color="blue" data={trendData4} icon={ArrowRightLeft} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header">
                        <div>
                            <div className="rd-table-title">Movement Log</div>
                            <div className="rd-table-subtitle">Real-time log of all material stock movements</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 250, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search by TRK or Ref..." />
                            </div>
                            <button className="rd-icon-btn"><Filter size={18} /></button>
                            <button className="rd-icon-btn" style={{color: 'var(--rd-blue)', borderColor: 'var(--rd-blue)'}}><Download size={18} /></button>
                        </div>
                    </div>
                    
                    <div style={{padding: '16px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--rd-border)'}}>
                        {['All', 'IN', 'OUT', 'TRANSFER'].map(f => (
                            <div key={f} className={`rd-filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f} Movements
                            </div>
                        ))}
                    </div>
                    
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>Tracking ID</th>
                                <th>Date & Time</th>
                                <th>Material / Item</th>
                                <th>Movement Type</th>
                                <th>Quantity</th>
                                <th>Reference</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logsData.filter(m => filter === 'All' || m.type === filter).map(log => (
                                <tr key={log.id}>
                                    <td style={{fontWeight: 700, color: '#3b82f6'}}>{log.id}</td>
                                    <td>
                                        <div style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{log.date}</div>
                                        <div style={{fontSize: 12, color: '#94a3b8', marginTop: 4}}>{log.time} by {log.user}</div>
                                    </td>
                                    <td style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{log.mat}</td>
                                    <td>{getTypeBadge(log.type)}</td>
                                    <td style={{fontWeight: 700, fontSize: 16}}>{log.type === 'IN' ? '+' : log.type === 'OUT' ? '-' : ''}{log.qty}</td>
                                    <td style={{fontWeight: 500, color: '#64748b'}}>{log.ref}</td>
                                    <td>
                                        <button className="rd-btn-link" style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 6}}>
                                            <Eye size={14} /> View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="rd-table-footer">
                        <span>Showing 1 to 5 of 3,842 entries</span>
                        <div style={{display: 'flex', gap: 8}}>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}} disabled>{"<"}</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32, background: 'var(--rd-blue)', color: 'white', borderColor: 'var(--rd-blue)'}}>1</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}}>2</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}}>3</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}}>{">"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TrackingKPICard = ({ title, val, trend, trendDir, color, data, icon: Icon }) => {
    return (
        <div className={`rd-kpi-card ${color}`} style={{minHeight: 140, padding: 20}}>
            <div className="rd-kpi-header">
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <span style={{fontSize: 13, fontWeight: 600, opacity: 0.9}}>{title}</span>
                    <span style={{fontSize: 28, fontWeight: 800}}>{val}</span>
                </div>
                <div className="rd-kpi-icon-box" style={{width: 40, height: 40}}>
                    <Icon size={20} color="#fff" />
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600}}>
                    {trendDir === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trend} <span style={{opacity: 0.7, fontWeight: 400, marginLeft: 4}}>vs last month</span>
                </div>
                <div style={{width: 60, height: 30}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TrackingDashboard;
