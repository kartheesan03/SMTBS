import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search, Filter, ArrowUpRight, ArrowDownRight, Activity, ArrowRightLeft, Download, Eye, Layers } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import toast from 'react-hot-toast';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/materials/movements/all');
            setMovements(data || []);
        } catch (error) {
            console.error("Failed to fetch movements:", error);
            toast.error("Failed to load tracking data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    // KPIs based on movements
    const totalMovements = movements.length;
    const unitsIn = movements.filter(m => (m.type || '').toUpperCase() === 'IN').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const unitsOut = movements.filter(m => (m.type || '').toUpperCase() === 'OUT').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const transferred = movements.filter(m => (m.type || '').toUpperCase() === 'ADJUSTMENT' || (m.type || '').toUpperCase() === 'TRANSFER').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    // Dynamic Trend generators
    const makeTrend = (base) => Array.from({length: 8}, () => ({v: Math.max(0, base + Math.floor(Math.random() * (base * 0.2) - (base * 0.1)))}));

    const getTypeBadge = (type) => {
        const t = (type || '').toUpperCase();
        if (t === 'IN') return <span className="rd-status-badge rd-status-green" style={{width: 80, textAlign: 'center'}}>↓ IN</span>;
        if (t === 'OUT') return <span className="rd-status-badge rd-status-orange" style={{width: 80, textAlign: 'center'}}>↑ OUT</span>;
        if (t === 'ADJUSTMENT' || t === 'TRANSFER') return <span className="rd-status-badge rd-status-blue" style={{width: 80, textAlign: 'center'}}>↔ ADJ/TRF</span>;
        return <span>{t}</span>;
    };

    const getRefString = (m) => {
        if (m.referenceOrderId) return `ORD-${m.referenceOrderId}`;
        if (m.reason) return m.reason.substring(0, 20);
        return 'N/A';
    };

    const filteredLogs = movements.filter(m => {
        const t = (m.type || '').toUpperCase();
        const matchesFilter = filter === 'All' || 
            (filter === 'IN' && t === 'IN') || 
            (filter === 'OUT' && t === 'OUT') || 
            (filter === 'TRANSFER' && (t === 'TRANSFER' || t === 'ADJUSTMENT'));
            
        const idStr = `TRK-${String(m.id || m._id).slice(-4)}`;
        const refStr = getRefString(m);
        const nameStr = m.materialName || '';
        
        const matchesSearch = !searchTerm || 
            idStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
            refStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nameStr.toLowerCase().includes(searchTerm.toLowerCase());
            
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="rd-container">
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
                    <TrackingKPICard title="Total Movements" val={totalMovements.toLocaleString()} trend="+15.2%" trendDir="up" color="purple" data={makeTrend(totalMovements || 40)} icon={Layers} />
                    <TrackingKPICard title="Units IN" val={unitsIn.toLocaleString()} trend="+24.5%" trendDir="up" color="green" data={makeTrend(unitsIn || 20)} icon={ArrowDownRight} />
                    <TrackingKPICard title="Units OUT" val={unitsOut.toLocaleString()} trend="-5.4%" trendDir="down" color="orange" data={makeTrend(unitsOut || 20)} icon={ArrowUpRight} />
                    <TrackingKPICard title="Adjusted/Transfer" val={transferred.toLocaleString()} trend="+8.1%" trendDir="up" color="blue" data={makeTrend(transferred || 10)} icon={ArrowRightLeft} />
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
                                <input 
                                    type="text" 
                                    className="rd-search-input" 
                                    placeholder="Search by TRK, Ref or Mat..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
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
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading movement logs...</td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No movements found</td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => {
                                    const d = new Date(log.createdAt || Date.now());
                                    const tStr = (log.type || '').toUpperCase();
                                    return (
                                        <tr key={log.id || log._id}>
                                            <td style={{fontWeight: 700, color: '#3b82f6'}}>TRK-{String(log.id || log._id).slice(-4).toUpperCase()}</td>
                                            <td>
                                                <div style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{d.toLocaleDateString()}</div>
                                                <div style={{fontSize: 12, color: '#94a3b8', marginTop: 4}}>{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                            <td>
                                                <div style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{log.materialName}</div>
                                                <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{log.materialSku}</div>
                                            </td>
                                            <td>{getTypeBadge(log.type)}</td>
                                            <td style={{fontWeight: 700, fontSize: 16}}>{tStr === 'IN' ? '+' : tStr === 'OUT' ? '-' : ''}{log.quantity}</td>
                                            <td style={{fontWeight: 500, color: '#64748b'}}>{getRefString(log)}</td>
                                            <td>
                                                <button className="rd-btn-link" style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 6}}>
                                                    <Eye size={14} /> View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    
                    {!loading && filteredLogs.length > 0 && (
                        <div className="rd-table-footer">
                            <span>Showing {filteredLogs.length} entries</span>
                            <div style={{display: 'flex', gap: 8}}>
                                <button className="rd-icon-btn" style={{width: 32, height: 32}} disabled>{"<"}</button>
                                <button className="rd-icon-btn" style={{width: 32, height: 32, background: 'var(--rd-blue)', color: 'white', borderColor: 'var(--rd-blue)'}}>1</button>
                                <button className="rd-icon-btn" style={{width: 32, height: 32}} disabled>{">"}</button>
                            </div>
                        </div>
                    )}
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
