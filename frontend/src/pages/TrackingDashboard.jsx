import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search, Filter, ArrowUpRight, ArrowDownRight, Activity, ArrowRightLeft, Download, Eye, Layers, X } from 'lucide-react';
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
    const [selectedMovement, setSelectedMovement] = useState(null);

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

    // Dynamic Trend generators removed as per requirement
    
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
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Movement Tracking</span>
                            <span className="rd-module-badge">MOVEMENTS</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <TrackingKPICard title="Total Movements" val={totalMovements.toLocaleString()} color="purple" icon={Layers} />
                    <TrackingKPICard title="Units IN" val={unitsIn.toLocaleString()} color="green" icon={ArrowDownRight} />
                    <TrackingKPICard title="Units OUT" val={unitsOut.toLocaleString()} color="orange" icon={ArrowUpRight} />
                    <TrackingKPICard title="Adjusted/Transfer" val={transferred.toLocaleString()} color="blue" icon={ArrowRightLeft} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Movement Log</div>
                            <div className="rd-table-subtitle">Real-time log of all material stock movements</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 280, flexShrink: 0, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" style={{flexShrink: 0}} />
                                <input 
                                    type="text" 
                                    className="rd-search-input" 
                                    placeholder="Search by TRK, Ref or Mat..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{textOverflow: 'ellipsis'}}
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
                    
                    <div style={{overflowX: 'auto', width: '100%'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
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
                                        <td colSpan={7} style={{textAlign: 'center', padding: 32, color: '#94a3b8', whiteSpace: 'normal'}}>Loading movement logs...</td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{textAlign: 'center', padding: 32, color: '#94a3b8', whiteSpace: 'normal'}}>No movements found</td>
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
                                                    <div style={{fontWeight: 600, color: 'var(--rd-text-main)', overflow: 'hidden', textOverflow: 'ellipsis'}}>{log.materialName}</div>
                                                    <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{log.materialSku}</div>
                                                </td>
                                                <td>{getTypeBadge(log.type)}</td>
                                                <td style={{fontWeight: 700, fontSize: 16}}>{tStr === 'IN' ? '+' : tStr === 'OUT' ? '-' : ''}{log.quantity}</td>
                                                <td style={{fontWeight: 500, color: '#64748b'}}>{getRefString(log)}</td>
                                                <td>
                                                    <button 
                                                        className="rd-btn-link" 
                                                        style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'}}
                                                        onClick={() => {
                                                            setSelectedMovement(log);
                                                        }}
                                                    >
                                                        <Eye size={14} /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
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

            {/* Detailed View Modal */}
            {selectedMovement && (
                <div className="rd-modal-overlay" onClick={() => setSelectedMovement(null)}>
                    <div className="rd-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 500}}>
                        <div className="rd-modal-header">
                            <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: 8}}>
                                <Activity size={20} color="var(--rd-blue)" /> 
                                Movement Details
                            </h3>
                            <button className="rd-icon-btn" onClick={() => setSelectedMovement(null)} style={{border: 'none'}}><X size={20} /></button>
                        </div>
                        <div className="rd-modal-body" style={{padding: 24}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 24}}>
                                <div>
                                    <div style={{fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Tracking ID</div>
                                    <div style={{fontSize: 16, fontWeight: 700, color: '#0f172a'}}>TRK-{String(selectedMovement.id || selectedMovement._id).slice(-4).toUpperCase()}</div>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <div style={{fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase'}}>Date & Time</div>
                                    <div style={{fontSize: 14, fontWeight: 600, color: '#0f172a'}}>{new Date(selectedMovement.createdAt || Date.now()).toLocaleString()}</div>
                                </div>
                            </div>
                            
                            <div style={{background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #e2e8f0'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                                    <span style={{fontSize: 13, color: '#64748b', fontWeight: 500}}>Material</span>
                                    <span style={{fontWeight: 700}}>{selectedMovement.materialName} ({selectedMovement.materialSku})</span>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                                    <span style={{fontSize: 13, color: '#64748b', fontWeight: 500}}>Type</span>
                                    {getTypeBadge(selectedMovement.type)}
                                </div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span style={{fontSize: 13, color: '#64748b', fontWeight: 500}}>Quantity</span>
                                    <span style={{fontWeight: 800, fontSize: 18, color: (selectedMovement.type || '').toUpperCase() === 'IN' ? '#10b981' : (selectedMovement.type || '').toUpperCase() === 'OUT' ? '#f59e0b' : '#3b82f6'}}>
                                        {(selectedMovement.type || '').toUpperCase() === 'IN' ? '+' : (selectedMovement.type || '').toUpperCase() === 'OUT' ? '-' : ''}{selectedMovement.quantity}
                                    </span>
                                </div>
                            </div>

                            <div style={{marginBottom: 24}}>
                                <div style={{fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8}}>REFERENCE / REASON</div>
                                <div style={{fontSize: 14, color: '#0f172a', background: '#fff', padding: 12, border: '1px solid #e2e8f0', borderRadius: 6}}>
                                    {selectedMovement.referenceOrderId ? (
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <span>Order ORD-{selectedMovement.referenceOrderId}</span>
                                            <button 
                                                className="rd-btn-primary" 
                                                style={{padding: '6px 12px', fontSize: 12}}
                                                onClick={() => navigate(`/orders/${selectedMovement.referenceOrderId}`)}
                                            >
                                                View Order
                                            </button>
                                        </div>
                                    ) : (
                                        selectedMovement.reason || 'Manual stock adjustment'
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="rd-modal-footer" style={{padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end'}}>
                            <button className="rd-btn-secondary" onClick={() => setSelectedMovement(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrackingKPICard = ({ title, val, color, icon: Icon }) => {
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
        </div>
    );
};

export default TrackingDashboard;
