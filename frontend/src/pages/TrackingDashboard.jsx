import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Search, Filter, ArrowUpRight, ArrowDownRight, Activity, ArrowRightLeft, Download, Eye, Layers, X, FileSearch } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ModuleKPICard } from '../components/ui';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
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
                <PastelKPIGrid>
                    <PastelKPICard
                        title="Total Movements" value={totalMovements.toLocaleString()}
                        colorTheme="purple" icon={Layers}
                        trendValue="All stock movements"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Units IN" value={unitsIn.toLocaleString()}
                        colorTheme="mint" icon={ArrowDownRight}
                        trendValue="Inbound stock flow"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Units OUT" value={unitsOut.toLocaleString()}
                        colorTheme="peach" icon={ArrowUpRight}
                        trendValue="Outbound stock flow"
                        trendPositive={false}
                    />
                    <PastelKPICard
                        title="Adjusted/Transfer" value={transferred.toLocaleString()}
                        colorTheme="blue" icon={ArrowRightLeft}
                        trendValue="Adjustments & transfers"
                        trendPositive={true}
                    />
                </PastelKPIGrid>

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
                    
                    <div className="rd-table-scroll">
                        <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Date & Time</th>
                                    <th>Material / Item</th>
                                    <th>Movement Type</th>
                                    <th style={{textAlign: 'right'}}>Quantity</th>
                                    <th>Reference</th>
                                    <th style={{textAlign: 'center', width: 100}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : filteredLogs.length === 0 ? (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={7} style={{textAlign: 'center', padding: '64px 20px', background: '#fafafa'}}>
                                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                                                <div style={{width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'}}>
                                                    <FileSearch size={32} color="#94a3b8" />
                                                </div>
                                                <h4 style={{margin: 0, fontSize: 16, color: '#0f172a', fontWeight: 600}}>No movements found</h4>
                                                <p style={{margin: 0, fontSize: 14, color: '#64748b', maxWidth: 300}}>We couldn't find any material movements matching your current filters. Try adjusting your search.</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ) : (
                                    filteredLogs.map(log => {
                                        const d = new Date(log.createdAt || Date.now());
                                        const tStr = (log.type || '').toUpperCase();
                                        return (
                                            <motion.tr 
                                                key={log.id || log._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ backgroundColor: '#f8fafc' }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td style={{fontWeight: 700, color: '#4f46e5'}} data-label="Tracking ID">TRK-{String(log.id || log._id).slice(-4).toUpperCase()}</td>
                                                <td data-label="Date & Time">
                                                    <div style={{fontWeight: 600, color: '#1e293b'}}>{d.toLocaleDateString()}</div>
                                                    <div style={{fontSize: 12, color: '#64748b', marginTop: 4}}>{d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </td>
                                                <td data-label="Material">
                                                    <div style={{fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis'}}>{log.materialName}</div>
                                                    <div style={{fontSize: 11, color: '#64748b', marginTop: 2}}>{log.materialSku}</div>
                                                </td>
                                                <td data-label="Movement Type">{getTypeBadge(log.type)}</td>
                                                <td style={{fontWeight: 800, fontSize: 15, color: '#0f172a', textAlign: 'right'}} data-label="Quantity">{tStr === 'IN' ? '+' : tStr === 'OUT' ? '-' : ''}{log.quantity}</td>
                                                <td style={{fontWeight: 500, color: '#64748b'}} data-label="Reference">{getRefString(log)}</td>
                                                <td style={{textAlign: 'center'}} data-label="Actions">
                                                    <button 
                                                        className="rd-btn-compact outline" 
                                                        onClick={() => {
                                                            setSelectedMovement(log);
                                                        }}
                                                    >
                                                        <Eye size={14} /> View
                                                    </button>
                                                </td>
                                            </motion.tr>
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
            <AnimatePresence>
                {selectedMovement && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rd-modal-overlay" 
                        onClick={() => setSelectedMovement(null)}
                        style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.4)' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            className="rd-modal" 
                            onClick={e => e.stopPropagation()} 
                            style={{maxWidth: 500, borderRadius: 24, boxShadow: '0 24px 60px rgba(0,0,0,0.15)'}}
                        >
                            <div className="rd-modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '24px 28px' }}>
                                <h3 style={{margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, fontWeight: 800, color: '#0f172a'}}>
                                    <div style={{ width: 40, height: 40, background: '#eef2ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Activity size={20} color="#4f46e5" /> 
                                    </div>
                                    Movement Details
                                </h3>
                                <button className="rd-icon-btn" onClick={() => setSelectedMovement(null)} style={{border: '1px solid #e2e8f0', background: '#f8fafc'}}><X size={18} color="#64748b" /></button>
                            </div>
                            <div className="rd-modal-body" style={{padding: '28px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 28}}>
                                    <div>
                                        <div style={{fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4}}>Tracking ID</div>
                                        <div style={{fontSize: 18, fontWeight: 800, color: '#0f172a'}}>TRK-{String(selectedMovement.id || selectedMovement._id).slice(-4).toUpperCase()}</div>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={{fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4}}>Date & Time</div>
                                        <div style={{fontSize: 15, fontWeight: 700, color: '#0f172a'}}>{new Date(selectedMovement.createdAt || Date.now()).toLocaleString()}</div>
                                    </div>
                                </div>
                                
                                <div style={{background: '#f8fafc', padding: 20, borderRadius: 16, marginBottom: 28, border: '1px solid #e2e8f0'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                                        <span style={{fontSize: 14, color: '#64748b', fontWeight: 600}}>Material</span>
                                        <span style={{fontWeight: 700, color: '#0f172a'}}>{selectedMovement.materialName} <span style={{color: '#94a3b8', fontWeight: 500}}>({selectedMovement.materialSku})</span></span>
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                                        <span style={{fontSize: 14, color: '#64748b', fontWeight: 600}}>Type</span>
                                        {getTypeBadge(selectedMovement.type)}
                                    </div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <span style={{fontSize: 14, color: '#64748b', fontWeight: 600}}>Quantity</span>
                                        <span style={{fontWeight: 800, fontSize: 20, color: (selectedMovement.type || '').toUpperCase() === 'IN' ? '#10b981' : (selectedMovement.type || '').toUpperCase() === 'OUT' ? '#f59e0b' : '#4f46e5'}}>
                                            {(selectedMovement.type || '').toUpperCase() === 'IN' ? '+' : (selectedMovement.type || '').toUpperCase() === 'OUT' ? '-' : ''}{selectedMovement.quantity}
                                        </span>
                                    </div>
                                </div>

                                <div style={{marginBottom: 8}}>
                                    <div style={{fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px'}}>REFERENCE / REASON</div>
                                    <div style={{fontSize: 14, color: '#1e293b', background: '#fff', padding: 16, border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 500}}>
                                        {selectedMovement.referenceOrderId ? (
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <span>Order <span style={{fontWeight: 700, color: '#0f172a'}}>ORD-{selectedMovement.referenceOrderId}</span></span>
                                                <button 
                                                    className="rd-btn-primary" 
                                                    style={{padding: '8px 16px', fontSize: 13, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', borderRadius: 8}}
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
                            <div className="rd-modal-footer" style={{padding: '20px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderBottomLeftRadius: 24, borderBottomRightRadius: 24}}>
                                <button className="rd-btn-secondary" style={{padding: '10px 24px', borderRadius: 10, fontWeight: 600}} onClick={() => setSelectedMovement(null)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SkeletonRow = () => (
    <tr style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
        <td style={{padding: '16px 24px'}}><div style={{height: 16, background: '#e2e8f0', borderRadius: 4, width: '80%'}}></div></td>
        <td style={{padding: '16px 24px'}}>
            <div style={{height: 16, background: '#e2e8f0', borderRadius: 4, width: '90%', marginBottom: 6}}></div>
            <div style={{height: 12, background: '#f1f5f9', borderRadius: 4, width: '60%'}}></div>
        </td>
        <td style={{padding: '16px 24px'}}>
            <div style={{height: 16, background: '#e2e8f0', borderRadius: 4, width: '100%', marginBottom: 6}}></div>
            <div style={{height: 12, background: '#f1f5f9', borderRadius: 4, width: '40%'}}></div>
        </td>
        <td style={{padding: '16px 24px'}}><div style={{height: 24, background: '#e2e8f0', borderRadius: 12, width: '80px'}}></div></td>
        <td style={{padding: '16px 24px'}}><div style={{height: 20, background: '#e2e8f0', borderRadius: 4, width: '40%'}}></div></td>
        <td style={{padding: '16px 24px'}}><div style={{height: 16, background: '#e2e8f0', borderRadius: 4, width: '70%'}}></div></td>
        <td style={{padding: '16px 24px'}}><div style={{height: 32, background: '#e2e8f0', borderRadius: 6, width: '100px'}}></div></td>
    </tr>
);

export default TrackingDashboard;
