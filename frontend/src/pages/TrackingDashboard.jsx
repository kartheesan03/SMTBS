import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Search, Filter, ArrowUpRight, ArrowDownRight, Activity, 
    ArrowRightLeft, Download, Layers, FileSearch, MapPin, 
    Package, Truck, Building2, Calendar, Clock, User, Hash, Edit, Printer, Share2, FileText, CheckCircle2, ChevronRight
} from 'lucide-react';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [materialDetails, setMaterialDetails] = useState(null);
    const [materialTimeline, setMaterialTimeline] = useState([]);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/materials/movements/all');
            setMovements(data || []);
            
            // Auto-select first item if exists and no selection
            const valid = (data || []).filter(log => !(log.type === 'Adjustment' && (!log.quantity || log.quantity === 0)));
            if (valid.length > 0) {
                setSelectedMovement(valid[0]);
            }
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

    useEffect(() => {
        if (selectedMovement && (selectedMovement.materialId || selectedMovement.material)) {
            const mId = selectedMovement.materialId || selectedMovement.material;
            // Fetch complete material data and history
            Promise.all([
                API.get(`/materials/${mId}`).catch(() => ({ data: null })),
                API.get(`/materials/${mId}/timeline`).catch(() => ({ data: [] }))
            ]).then(([matRes, timeRes]) => {
                setMaterialDetails(matRes.data);
                setMaterialTimeline(timeRes.data || []);
            });
        } else {
            setMaterialDetails(null);
            setMaterialTimeline([]);
        }
    }, [selectedMovement]);

    const totalMovements = movements.length;
    const countIn = movements.filter(m => (m.type || '').toUpperCase() === 'IN').length;
    const countOut = movements.filter(m => (m.type || '').toUpperCase() === 'OUT').length;
    const countTransferred = movements.filter(m => (m.type || '').toUpperCase() === 'ADJUSTMENT' || (m.type || '').toUpperCase() === 'TRANSFER').length;
    const pending = movements.filter(m => (m.status || '').toUpperCase() === 'PENDING').length;

    const validMovements = movements.filter(log => !(log.type === 'Adjustment' && (!log.quantity || log.quantity === 0)));

    const getRefString = (m) => {
        if (m.referenceOrderId) {
            const tStr = (m.type || '').toUpperCase();
            return `${tStr === 'OUT' ? 'SO' : 'PO'}-${String(m.referenceOrderId).slice(-4).toUpperCase()}`;
        }
        if (m.reason) return m.reason.substring(0, 20);
        return 'N/A';
    };

    const getPO = (m) => {
        const tStr = (m.type || '').toUpperCase();
        if (m.referenceOrderId) return `${tStr === 'OUT' ? 'SO' : 'PO'}-${String(m.referenceOrderId).slice(-4).toUpperCase()}`;
        return '-';
    };

    const filteredLogs = validMovements.filter(m => {
        const t = (m.type || '').toUpperCase();
        const matchesFilter = filter === 'All' || 
            (filter === 'IN' && t === 'IN') || 
            (filter === 'OUT' && t === 'OUT') || 
            (filter === 'TRANSFER' && (t === 'TRANSFER' || t === 'ADJUSTMENT'));
            
        const idStr = `MOV-${String(m.id || m._id).slice(-4)}`;
        const refStr = getRefString(m);
        const nameStr = m.materialName || '';
        
        const matchesSearch = !searchTerm || 
            idStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
            refStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nameStr.toLowerCase().includes(searchTerm.toLowerCase());
            
        return matchesFilter && matchesSearch;
    });

    const getTypeColor = (type) => {
        const t = (type || '').toUpperCase();
        if (t === 'IN') return { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' };
        if (t === 'OUT') return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
        return { bg: '#e0e7ff', text: '#4f46e5', border: '#c7d2fe' };
    };

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
            {/* Header & KPI Summary */}
            <div style={{ marginBottom: 24 }}>
                <PageHeader 
                    title="Movement Tracking" 
                    badge="MATERIAL TRACKING" 
                    subtitle="Monitor real-time material movements and transfers." 
                />
                
                <PastelKPIGrid columns={5}>
                    <PastelKPICard 
                        title="Total Movements" 
                        value={totalMovements} 
                        icon={Layers} 
                        colorTheme="blue" 
                        trendValue="Active tracking"
                        trendPositive={true}
                    />
                    <PastelKPICard 
                        title="IN Movements" 
                        value={countIn} 
                        icon={ArrowDownRight} 
                        colorTheme="mint" 
                        trendValue="Receiving"
                        trendPositive={true}
                    />
                    <PastelKPICard 
                        title="OUT Movements" 
                        value={countOut} 
                        icon={ArrowUpRight} 
                        colorTheme="peach" 
                        trendValue="Dispatching"
                        trendPositive={false}
                    />
                    <PastelKPICard 
                        title="Transfers" 
                        value={countTransferred} 
                        icon={ArrowRightLeft} 
                        colorTheme="yellow" 
                        trendValue="Internal moves"
                        trendPositive={true}
                    />
                    <PastelKPICard 
                        title="Pending" 
                        value={pending} 
                        icon={Clock} 
                        colorTheme="purple" 
                        trendValue="Awaiting action"
                        trendPositive={false}
                    />
                </PastelKPIGrid>
            </div>

            {/* Master Detail Layout */}
            <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 200px)', minHeight: 600 }}>
                
                {/* Left Panel: Master List */}
                <div style={{ width: '38%', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fff', zIndex: 10 }}>
                        <div style={{ display: 'flex', background: '#f8fafc', borderRadius: 12, padding: '10px 16px', alignItems: 'center', gap: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                            <Search size={18} color="#94a3b8" />
                            <input 
                                type="text" 
                                placeholder="Search tracking ID or material..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14, color: '#0f172a', fontWeight: 500 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            {['All', 'IN', 'OUT', 'TRANSFER'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{ 
                                        padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                                        background: filter === f ? '#0f172a' : '#f1f5f9', 
                                        color: filter === f ? '#fff' : '#64748b',
                                        border: 'none', transition: 'all 0.2s'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                        {loading ? (
                            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                        ) : filteredLogs.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <FileSearch size={40} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No movements found</div>
                            </div>
                        ) : (
                            filteredLogs.map(log => {
                                const isSelected = selectedMovement && (selectedMovement.id || selectedMovement._id) === (log.id || log._id);
                                const typeStr = (log.type || '').toUpperCase();
                                const colors = getTypeColor(typeStr);
                                const d = new Date(log.createdAt || Date.now());

                                return (
                                    <div 
                                        key={log.id || log._id}
                                        onClick={() => setSelectedMovement(log)}
                                        style={{
                                            padding: '16px', marginBottom: 8, borderRadius: 14, cursor: 'pointer',
                                            background: isSelected ? '#eff6ff' : '#fff',
                                            border: `1px solid ${isSelected ? '#bfdbfe' : '#f1f5f9'}`,
                                            borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                                            transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: 16
                                        }}
                                    >
                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Package size={20} color="#64748b" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.materialName || 'Unknown Material'}
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: 12, color: colors.text }}>
                                                    {typeStr === 'IN' ? '+' : typeStr === 'OUT' ? '-' : ''}{log.quantity}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    MOV-{String(log.id || log._id).slice(-4).toUpperCase()}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                                                    {d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel: Detail Dashboard */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflowY: 'auto' }}>
                    {selectedMovement ? (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={selectedMovement.id || selectedMovement._id}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                                style={{ padding: 32 }}
                            >
                                {/* Action Header */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 32 }}>
                                    <button style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Edit size={14}/> Edit</button>
                                    <button style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Printer size={14}/> Print</button>
                                    <button style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><FileText size={14}/> PDF</button>
                                    <button style={{ padding: '8px 16px', background: '#3b82f6', border: '1px solid #2563eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Share2 size={14}/> Share</button>
                                </div>

                                {/* Material Profile Card */}
                                <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 40 }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 20, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                        <Package size={40} color="#475569" />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{selectedMovement.materialName || 'Unknown Material'}</h2>
                                            <span style={{ padding: '4px 10px', background: getTypeColor((selectedMovement.type || '').toUpperCase()).bg, color: getTypeColor((selectedMovement.type || '').toUpperCase()).text, borderRadius: 99, fontSize: 11, fontWeight: 700, border: `1px solid ${getTypeColor((selectedMovement.type || '').toUpperCase()).border}` }}>
                                                {(selectedMovement.type || '').toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>MOV-{String(selectedMovement.id || selectedMovement._id).slice(-4).toUpperCase()}</span>
                                            <span style={{ width: 4, height: 4, borderRadius: 2, background: '#cbd5e1' }}></span>
                                            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Hash size={14}/> {selectedMovement.materialSku || (materialDetails?.sku) || 'N/A'}</span>
                                            {materialDetails?.category && (
                                                <>
                                                    <span style={{ width: 4, height: 4, borderRadius: 2, background: '#cbd5e1' }}></span>
                                                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{materialDetails.category}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Flow */}
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 20 }}>Movement Flow</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                                <Building2 size={24} color="#64748b" />
                                            </div>
                                            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#334155' }}>
                                                {selectedMovement.source || (selectedMovement.type === 'IN' ? selectedMovement.materialVendorName || materialDetails?.vendorName || 'External Source' : materialDetails?.warehouse || 'Internal Warehouse')}
                                            </div>
                                        </div>
                                        
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                            <div style={{ width: '100%', height: 2, background: '#e2e8f0', position: 'absolute', top: 28, zIndex: 0 }}></div>
                                            <div style={{ width: 40, height: 40, borderRadius: 20, background: '#e0e7ff', border: '4px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                                <Truck size={18} color="#4f46e5" />
                                            </div>
                                            <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: 99 }}>
                                                {(selectedMovement.materialGpsStatus || selectedMovement.status || 'COMPLETED').toUpperCase()}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, flex: 1 }}>
                                            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                                <MapPin size={24} color="#64748b" />
                                            </div>
                                            <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#334155' }}>
                                                {selectedMovement.destination || (selectedMovement.type === 'OUT' ? 'External Destination' : materialDetails?.warehouse || 'Internal Warehouse')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
                                    {[
                                        { label: 'Movement Qty', value: `${selectedMovement.quantity} ${materialDetails?.unit || ''}`, icon: Layers, valColor: '#0f172a' },
                                        { label: 'Current Stock', value: `${materialDetails?.quantity !== undefined ? materialDetails.quantity : (selectedMovement.materialQuantity || 0)} ${materialDetails?.unit || ''}`, icon: Package, valColor: '#059669' },
                                        { label: 'Warehouse / Shelf', value: materialDetails?.location || materialDetails?.warehouse ? `${materialDetails.warehouse || ''} ${materialDetails.shelf ? '/ ' + materialDetails.shelf : ''}` : 'N/A', icon: Building2, valColor: '#0f172a' },
                                        { label: 'Handler / Ref', value: selectedMovement.user || getRefString(selectedMovement) || 'System', icon: User, valColor: '#7c3aed' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                                <item.icon size={16} color="#94a3b8" />
                                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                                            </div>
                                            <div style={{ fontSize: 18, fontWeight: 700, color: item.valColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Timeline */}
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>Material History</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 8 }}>
                                        {materialTimeline.length > 0 ? materialTimeline.map((step, i, arr) => (
                                            <div key={step.id || i} style={{ display: 'flex', gap: 20, position: 'relative', paddingBottom: i === arr.length - 1 ? 0 : 24 }}>
                                                {i !== arr.length - 1 && (
                                                    <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: '#e2e8f0' }}></div>
                                                )}
                                                <div style={{ position: 'relative', zIndex: 1, width: 24, height: 24, borderRadius: 12, background: '#f8fafc', border: `4px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: -2, boxShadow: '0 0 0 1px #e2e8f0' }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: 3, background: '#94a3b8' }}></div>
                                                </div>
                                                <div style={{ flex: 1, marginTop: -4 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{step.action || 'UPDATE'}</div>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{new Date(step.date).toLocaleDateString()} {step.time}</div>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#64748b' }}>{step.description || 'Action performed'} <span style={{ fontSize: 11, color: '#cbd5e1', marginLeft: 8 }}>by {step.user || 'System'}</span></div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div style={{ padding: '20px 0', color: '#94a3b8', fontSize: 14 }}>No history available for this material.</div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <Package size={64} color="#e2e8f0" style={{ marginBottom: 16 }} />
                            <div style={{ fontSize: 18, fontWeight: 600, color: '#64748b' }}>Select a movement</div>
                            <div style={{ fontSize: 14 }}>Click on any item in the master list to view details</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackingDashboard;
