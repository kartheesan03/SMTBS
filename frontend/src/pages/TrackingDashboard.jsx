import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Search, Filter, ArrowUpRight, ArrowDownRight, Activity, 
    ArrowRightLeft, Download, Layers, FileSearch, MapPin, 
    Package, Truck, Building2, Calendar, Clock, User, Hash, Edit, Printer, Share2, FileText, CheckCircle2, ChevronRight, MoreHorizontal
} from 'lucide-react';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { AuthContext } from '../context/AuthContext';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    const { user } = useContext(AuthContext);
    const currentUserRole = user?.role || 'Employee';

    const [filter, setFilter] = useState('All warehouses');
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [viewMode, setViewMode] = useState('material'); // default to material
    const [movements, setMovements] = useState([]);
    const [materialsList, setMaterialsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMovement, setSelectedMovement] = useState(null);
    const [materialDetails, setMaterialDetails] = useState(null);
    const [materialTimeline, setMaterialTimeline] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ status: '', reason: '' });
    const [adjustForm, setAdjustForm] = useState({ quantity: 0, reason: '' });
    const [transferForm, setTransferForm] = useState({ quantity: 0, destination: '' });

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/materials/movements/all');
            setMovements(data || []);
            
            // Auto-select first item if exists and no selection
            const valid = (data || []).filter(log => !(log.type === 'Adjustment' && (!log.quantity || log.quantity === 0)));
            if (valid.length > 0) {
                let initialSelection = valid[0];
                if (initialSearch) {
                    const searchLower = initialSearch.toLowerCase();
                    const matched = valid.find(m => {
                        const idStr = `MOV-${String(m.id || m._id).slice(-4)}`.toLowerCase();
                        const refStr = (m.referenceOrderId ? String(m.referenceOrderId).slice(-4) : m.reason ? m.reason : '').toLowerCase();
                        const nameStr = (m.materialName || '').toLowerCase();
                        return idStr.includes(searchLower) || refStr.includes(searchLower) || nameStr.includes(searchLower);
                    });
                    if (matched) {
                        initialSelection = matched;
                    }
                }
                setSelectedMovement(initialSelection);
            }
            
            // Also fetch all materials for the Material view mode
            const matsRes = await API.get('/materials/list');
            setMaterialsList(matsRes.data || []);
            
            // If the search term looks like a material SKU and it wasn't found in movements, switch to material view
            if (initialSearch && valid.length > 0 && !valid.some(m => `MOV-${String(m.id || m._id).slice(-4)}`.toLowerCase().includes(initialSearch.toLowerCase()) || (m.referenceOrderId && String(m.referenceOrderId).slice(-4).toLowerCase().includes(initialSearch.toLowerCase())))) {
                // If it matches a material but not a movement ID, switch mode
                if (matsRes.data && matsRes.data.some(m => (m.sku || '').toLowerCase().includes(initialSearch.toLowerCase()) || (m.name || '').toLowerCase().includes(initialSearch.toLowerCase()))) {
                    setViewMode('material');
                    const matchedMat = matsRes.data.find(m => (m.sku || '').toLowerCase().includes(initialSearch.toLowerCase()) || (m.name || '').toLowerCase().includes(initialSearch.toLowerCase()));
                    if (matchedMat) {
                        setSelectedMovement({ 
                            id: `MAT-${matchedMat._id}`, _id: `MAT-${matchedMat._id}`, 
                            materialId: matchedMat._id, materialName: matchedMat.name, 
                            materialSku: matchedMat.sku, type: 'VIEW', isMaterialView: true 
                        });
                    }
                }
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
        
        // Poll for material updates every 30 seconds
        const intervalId = setInterval(async () => {
            if (viewMode === 'material') {
                try {
                    const matsRes = await API.get('/materials/list');
                    setMaterialsList(matsRes.data || []);
                } catch (err) {
                    console.error("Polling failed", err);
                }
            }
        }, 30000);
        
        return () => clearInterval(intervalId);
    }, [viewMode]);

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

    useEffect(() => {
        // Auto-select the first item if the current selection is filtered out
        if (viewMode === 'material' && filteredMaterials.length > 0) {
            const isCurrentlySelectedInView = selectedMovement && selectedMovement.isMaterialView && filteredMaterials.some(m => (m._id || m.id) === selectedMovement.materialId);
            if (!isCurrentlySelectedInView) {
                const firstMat = filteredMaterials[0];
                setSelectedMovement({ 
                    id: `MAT-${firstMat._id || firstMat.id}`, _id: `MAT-${firstMat._id || firstMat.id}`, 
                    materialId: firstMat._id || firstMat.id, materialName: firstMat.name, 
                    materialSku: firstMat.sku, type: 'VIEW', isMaterialView: true 
                });
            }
        }
    }, [filter, searchTerm, viewMode, materialsList]);

    const handleEditSave = async () => {
        try {
            await API.put(`/materials/movements/${selectedMovement.id || selectedMovement._id}`, editForm);
            toast.success('Tracking record updated!');
            setIsEditModalOpen(false);
            fetchMovements(); // Refresh data
        } catch (error) {
            console.error(error);
            toast.error('Failed to update tracking record');
        }
    };

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

    // Dynamic Warehouses
    const uniqueWarehouses = ['All warehouses', ...new Set(materialsList.map(m => m.warehouse || 'Unknown Warehouse'))];

    const filteredMaterials = materialsList.filter(m => {
        const w = m.warehouse || 'Unknown Warehouse';
        const matchesFilter = filter === 'All warehouses' || filter === w ||
            (filter === 'IN' && (m.quantity > 0)) || 
            (filter === 'OUT' && (m.quantity === 0)); // Rough proxy for filter in material view
        const matchesSearch = !searchTerm || 
            (m.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (m.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const isMaterialLive = (mat) => {
        if (!mat || !mat.locationUpdatedAt) return false;
        const diffMs = Date.now() - new Date(mat.locationUpdatedAt).getTime();
        return diffMs <= 30 * 60 * 1000; // 30 mins
    };

    const getTypeColor = (type) => {
        const t = (type || '').toUpperCase();
        if (t === 'IN') return { bg: '#d1fae5', text: '#059669', border: '#a7f3d0' };
        if (t === 'OUT') return { bg: '#fee2e2', text: '#dc2626', border: '#fecaca' };
        return { bg: '#e0e7ff', text: '#4f46e5', border: '#c7d2fe' };
    };

    return (
        <div className="rd-container">
        <motion.div 
            className="rd-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header & KPI Summary */}
            <div style={{ minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: viewMode === 'material' ? 24 : 0 }}>
                <div className="rd-module-header" style={{ margin: 0, padding: 0 }}>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Movement Tracking</span>
                        </div>
                    </div>
                </div>
                
                {/* Header */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                </div>
            </div>
            
            {viewMode === 'movement' && (
                <div style={{ minWidth: 0 }}>
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
            )}

            {/* Master Detail Layout */}
            <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0, minWidth: 0 }}>
                
                {/* Left Panel: Master List */}
                <div style={{ width: '38%', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', background: '#fff', zIndex: 10 }}>
                        {/* Search and Filters */}
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                            {uniqueWarehouses.map(w => (
                                <button 
                                    key={w}
                                    onClick={() => setFilter(w)}
                                    style={{ 
                                        padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: filter === w ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
                                        background: '#fff', 
                                        color: '#0f172a',
                                        border: filter === w ? '1px solid #94a3b8' : '1px solid #e2e8f0',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                        {loading ? (
                            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                        ) : viewMode === 'movement' ? (
                            filteredLogs.length === 0 ? (
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
                                                    <div style={{ fontWeight: 700, fontSize: 12, color: colors.text, whiteSpace: 'nowrap' }}>
                                                        {typeStr === 'IN' ? '+' : typeStr === 'OUT' ? '-' : ''}{log.quantity}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>MOV-{String(log.id || log._id).slice(-4).toUpperCase()}</span>
                                                        <span style={{ width: 4, height: 4, borderRadius: 2, background: '#cbd5e1' }}></span>
                                                        <span style={{ padding: '2px 8px', background: colors.bg, color: colors.text, borderRadius: 99, fontSize: 10, fontWeight: 700, border: `1px solid ${colors.border}` }}>
                                                            {typeStr}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                                                        {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        ) : (
                            filteredMaterials.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                    <FileSearch size={40} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
                                    <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No materials found</div>
                                </div>
                            ) : (
                                filteredMaterials.map(mat => {
                                    const isSelected = selectedMovement && selectedMovement.isMaterialView && selectedMovement.materialId === (mat._id || mat.id);
                                    const live = isMaterialLive(mat);
                                    const lowStock = mat.quantity === 0;

                                    return (
                                        <div 
                                            key={mat._id || mat.id}
                                            onClick={() => setSelectedMovement({ 
                                                id: `MAT-${mat._id || mat.id}`, _id: `MAT-${mat._id || mat.id}`, 
                                                materialId: mat._id || mat.id, materialName: mat.name, 
                                                materialSku: mat.sku, type: 'VIEW', isMaterialView: true 
                                            })}
                                            style={{
                                                padding: '12px 16px', marginBottom: 12, borderRadius: 12, cursor: 'pointer',
                                                background: isSelected ? '#dbeafe' : '#fff',
                                                border: `1px solid ${isSelected ? '#93c5fd' : '#e2e8f0'}`,
                                                transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                                <div style={{ marginTop: 6, width: 8, height: 8, borderRadius: 4, background: live ? '#16a34a' : '#9ca3af', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 2 }}>
                                                        {mat.name || 'Unknown Material'}
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#94a3b8' }}>
                                                        Rack {mat.rack || 'N/A'} &middot; Shelf {mat.shelf || 'N/A'} &middot; {mat.warehouse || 'Unknown'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: lowStock ? '#dc2626' : '#475569', marginTop: 4, whiteSpace: 'nowrap' }}>
                                                {mat.quantity} {mat.unit || 'pcs'}
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>

                {/* Right Panel: Detail Dashboard */}
                <div style={{ flex: 1, minWidth: 0, background: viewMode === 'material' ? '#fafafa' : '#fff', borderRadius: 20, boxShadow: viewMode === 'material' ? 'none' : '0 8px 30px rgba(0,0,0,0.04)', border: viewMode === 'material' ? 'none' : '1px solid #f1f5f9', overflowY: 'auto' }}>
                    {selectedMovement ? (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={selectedMovement.id || selectedMovement._id}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                                style={{ padding: 32 }}
                            >
                                {selectedMovement.isMaterialView ? (() => {
                                    const mat = materialDetails || {};
                                    const isLive = isMaterialLive(mat);
                                    const isLowStock = mat.quantity <= (mat.lowStockThreshold || 0);
                                    let diffText = 'Unknown';
                                    if (mat.locationUpdatedAt) {
                                        const mins = Math.floor((Date.now() - new Date(mat.locationUpdatedAt).getTime()) / 60000);
                                        if (mins < 60) diffText = `${mins} min ago`;
                                        else if (mins < 1440) diffText = `${Math.floor(mins / 60)} hr ago`;
                                        else diffText = `${Math.floor(mins / 1440)} day ago`;
                                    }

                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
                                            {/* Top: Material Detail Card */}
                                            <div style={{ background: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                                {/* Top Status */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        {isLive ? (
                                                            <motion.div 
                                                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                                style={{ width: 8, height: 8, borderRadius: 4, background: '#16a34a', flexShrink: 0 }} 
                                                            />
                                                        ) : (
                                                            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#9ca3af', flexShrink: 0 }}></div>
                                                        )}
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: isLive ? '#16a34a' : '#64748b' }}>
                                                            {isLive ? 'Tracking live' : 'Not scanned recently'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#94a3b8' }}>
                                                        Last scan: {diffText}
                                                    </div>
                                                </div>

                                                {/* Header */}
                                                <div style={{ marginBottom: 24 }}>
                                                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>{mat.name || 'Unknown Material'}</h2>
                                                    <div style={{ fontSize: 15, color: '#94a3b8' }}>
                                                        {mat.sku || 'N/A'} &middot; {mat.category || 'Uncategorized'} &middot; {mat.warehouse || 'Unknown Warehouse'}
                                                    </div>
                                                </div>

                                                {/* Stat Blocks */}
                                                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                                                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: 16, padding: 16 }}>
                                                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>On hand</div>
                                                        <div style={{ fontSize: 24, fontWeight: 700, color: isLowStock ? '#dc2626' : '#0f172a' }}>{mat.quantity} <span style={{ fontSize: 14, fontWeight: 500 }}>{mat.unit || 'pcs'}</span></div>
                                                    </div>
                                                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: 16, padding: 16 }}>
                                                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Min stock</div>
                                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{mat.lowStockThreshold || 0} <span style={{ fontSize: 14, fontWeight: 500 }}>{mat.unit || 'pcs'}</span></div>
                                                    </div>
                                                    {currentUserRole === 'Admin' && (
                                                        <div style={{ flex: 1, background: '#f8fafc', borderRadius: 16, padding: 16 }}>
                                                            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Unit cost</div>
                                                            <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>₹{(mat.price || 0).toFixed(2)}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Buttons */}
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    {(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
                                                        <>
                                                            {currentUserRole === 'Admin' && (
                                                                <button onClick={() => navigate(`/materials/${mat._id || mat.id}/edit`)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a', cursor: 'pointer' }}>Edit material</button>
                                                            )}
                                                            <button onClick={() => { setAdjustForm({ quantity: mat.quantity || 0, reason: '' }); setIsAdjustModalOpen(true); }} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a', cursor: 'pointer' }}>Adjust stock</button>
                                                            <button onClick={() => { setTransferForm({ quantity: 1, destination: '' }); setIsTransferModalOpen(true); }} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#0f172a', cursor: 'pointer' }}>{currentUserRole === 'Manager' ? 'Request transfer' : 'Transfer'}</button>
                                                        </>
                                                    )}
                                                    {currentUserRole === 'Employee' && (
                                                        <button onClick={() => alert("Issue reported!")} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, color: '#dc2626', cursor: 'pointer' }}>Report Issue</button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bottom: Warehouse Floor Map */}
                                            <div style={{ flex: 1, background: '#fff', padding: 24, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Warehouse Floor Map</div>
                                                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, flex: 1, alignItems: 'flex-start' }}>
                                                    {(() => {
                                                        const warehouseMaterials = materialsList.filter(m => m.warehouse === mat.warehouse);
                                                        const racksMap = {};
                                                        warehouseMaterials.forEach(m => {
                                                            const r = m.rack || 'Unassigned';
                                                            if (!racksMap[r]) racksMap[r] = {};
                                                            const s = m.shelf || 'N/A';
                                                            if (!racksMap[r][s]) racksMap[r][s] = [];
                                                            racksMap[r][s].push(m);
                                                        });
                                                        const sortedRacks = Object.keys(racksMap).sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
                                                        if (sortedRacks.length === 0) {
                                                            return <div style={{ fontSize: 14, color: '#94a3b8' }}>No floor map data available for {mat.warehouse || 'this warehouse'}.</div>;
                                                        }
                                                        return sortedRacks.map(rackName => (
                                                            <div key={rackName} style={{ minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>Rack {rackName}</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 12, width: '100%', border: '1px solid #e2e8f0' }}>
                                                                    {Object.keys(racksMap[rackName]).sort().map(shelfName => {
                                                                        const isSelectedShelf = (rackName === (mat.rack || 'Unassigned')) && (shelfName === (mat.shelf || 'N/A'));
                                                                        return (
                                                                            <div key={shelfName} style={{ position: 'relative' }}>
                                                                                {isSelectedShelf && isLive && (
                                                                                    <motion.div 
                                                                                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.1, 0.6] }}
                                                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                                                                        style={{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 10, background: '#3b82f6', zIndex: 0 }}
                                                                                    />
                                                                                )}
                                                                                <div style={{ 
                                                                                    position: 'relative', zIndex: 1,
                                                                                    height: 48, borderRadius: 8, 
                                                                                    background: isSelectedShelf ? '#3b82f6' : '#fff',
                                                                                    border: `1px solid ${isSelectedShelf ? '#2563eb' : '#cbd5e1'}`,
                                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                    color: isSelectedShelf ? '#fff' : '#475569', fontSize: 12, fontWeight: 600,
                                                                                    boxShadow: isSelectedShelf ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                                                                                }}>
                                                                                    Shelf {shelfName}
                                                                                    <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, background: isSelectedShelf ? '#fff' : '#cbd5e1' }} />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <>
                                        {/* Action Header */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 32 }}>
                                            <button onClick={() => {
                                                setEditForm({ status: selectedMovement.status || '', reason: selectedMovement.reason || '' });
                                                setIsEditModalOpen(true);
                                            }} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Edit size={14}/> Edit</button>
                                            <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Printer size={14}/> Print</button>
                                            <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><FileText size={14}/> PDF</button>
                                            <button onClick={async () => {
                                                try {
                                                    if (navigator.share) {
                                                        await navigator.share({ title: 'Material Tracking', text: `Tracking details for ${selectedMovement.materialName}`, url: window.location.href });
                                                    } else {
                                                        await navigator.clipboard.writeText(window.location.href);
                                                        alert('Link copied to clipboard!');
                                                    }
                                                } catch (err) { console.error('Share failed', err); }
                                            }} style={{ padding: '8px 16px', background: '#3b82f6', border: '1px solid #2563eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Share2 size={14}/> Share</button>
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
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 40 }}>
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
                                    </>
                                )}
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
        </motion.div>
        
        {/* Edit Modal */}
        {isEditModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', padding: 32, borderRadius: 20, width: 400, maxWidth: '90%' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700 }}>Edit Tracking Record</h3>
                    
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Status</label>
                        <select 
                            value={editForm.status} 
                            onChange={e => setEditForm({...editForm, status: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                        >
                            <option value="">Select Status...</option>
                            <option value="Pending">Pending</option>
                            <option value="In-Transit">In-Transit</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Notes / Reason</label>
                        <textarea 
                            value={editForm.reason} 
                            onChange={e => setEditForm({...editForm, reason: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', minHeight: 100, fontFamily: 'inherit' }}
                            placeholder="Add tracking notes..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleEditSave} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                    </div>
                </div>
            </div>
        )}
        {/* Adjust Stock Modal */}
        {isAdjustModalOpen && selectedMovement && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', padding: 32, borderRadius: 20, width: 400, maxWidth: '90%' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700 }}>Adjust Stock</h3>
                    
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>New Quantity ({selectedMovement.unit || 'pcs'})</label>
                        <input 
                            type="number"
                            value={adjustForm.quantity} 
                            onChange={e => setAdjustForm({...adjustForm, quantity: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Reason for Adjustment</label>
                        <textarea 
                            value={adjustForm.reason} 
                            onChange={e => setAdjustForm({...adjustForm, reason: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none', minHeight: 80, fontFamily: 'inherit' }}
                            placeholder="e.g. Damage, Audit correction..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button onClick={() => setIsAdjustModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => { toast.success('Stock adjusted successfully!'); setIsAdjustModalOpen(false); }} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
                    </div>
                </div>
            </div>
        )}

        {/* Transfer Modal */}
        {isTransferModalOpen && selectedMovement && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', padding: 32, borderRadius: 20, width: 400, maxWidth: '90%' }}>
                    <h3 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700 }}>Transfer Material</h3>
                    
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Quantity to Transfer</label>
                        <input 
                            type="number"
                            value={transferForm.quantity} 
                            onChange={e => setTransferForm({...transferForm, quantity: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Destination Warehouse</label>
                        <select 
                            value={transferForm.destination} 
                            onChange={e => setTransferForm({...transferForm, destination: e.target.value})}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', outline: 'none' }}
                        >
                            <option value="">Select Destination...</option>
                            <option value="Warehouse A">Warehouse A</option>
                            <option value="Warehouse B">Warehouse B</option>
                            <option value="Warehouse C">Warehouse C</option>
                            <option value="Site 1">Site 1</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button onClick={() => setIsTransferModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => { toast.success('Transfer initiated successfully!'); setIsTransferModalOpen(false); }} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirm Transfer</button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default TrackingDashboard;
