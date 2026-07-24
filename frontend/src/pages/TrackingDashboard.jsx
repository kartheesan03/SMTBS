import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Search, Filter, ArrowUpRight, ArrowDownRight, Activity, 
    ArrowRightLeft, Download, Layers, FileSearch, MapPin, 
    Package, Truck, Building2, Calendar, Clock, User, Hash, Edit, Printer, Share2, FileText, CheckCircle2, ChevronRight, MoreHorizontal, Box,
    RefreshCw, QrCode, BarChart2, AlertCircle, TrendingUp, TrendingDown, Link as LinkIcon, ThumbsUp, Zap
} from 'lucide-react';
import API from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { AuthContext } from '../context/AuthContext';
import { CONSTANTS } from '../utils/constants';

const TrackingDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const initialSearch = queryParams.get('search') || '';

    const { user } = useContext(AuthContext);
    const currentUserRole = user?.role || 'Employee';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [movements, setMovements] = useState([]);
    const [materialsList, setMaterialsList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedMaterialId, setSelectedMaterialId] = useState(null);
    const [materialDetails, setMaterialDetails] = useState(null);
    const [materialTimeline, setMaterialTimeline] = useState([]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [matsRes, movsRes] = await Promise.all([
                API.get('/materials'),
                API.get('/materials/movements/all')
            ]);
            
            const mats = matsRes.data || [];
            const movs = movsRes.data || [];
            
            setMaterialsList(mats);
            setMovements(movs);
            
            // Auto-select material based on search or first available
            let initialSelectionId = mats.length > 0 ? (mats[0]._id || mats[0].id) : null;
            
            if (initialSearch && mats.length > 0) {
                const searchLower = initialSearch.toLowerCase().trim();
                const matchedMat = mats.find(m => 
                    (m.sku && m.sku.toLowerCase().trim() === searchLower) || 
                    (m.name && m.name.toLowerCase().trim() === searchLower) ||
                    (m.sku && m.sku.toLowerCase().includes(searchLower)) ||
                    (m.name && m.name.toLowerCase().includes(searchLower))
                );
                if (matchedMat) {
                    initialSelectionId = matchedMat._id || matchedMat.id;
                }
            }
            
            if (initialSelectionId) {
                setSelectedMaterialId(initialSelectionId);
            }
        } catch (error) {
            console.error("Failed to fetch tracking data:", error);
            toast.error("Failed to load tracking data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (selectedMaterialId) {
            Promise.all([
                API.get(`/materials/${selectedMaterialId}`).catch(() => ({ data: null })),
                API.get(`/materials/${selectedMaterialId}/timeline`).catch(() => ({ data: [] }))
            ]).then(([matRes, timeRes]) => {
                setMaterialDetails(matRes.data);
                setMaterialTimeline(timeRes.data || []);
            });
        } else {
            setMaterialDetails(null);
            setMaterialTimeline([]);
        }
    }, [selectedMaterialId]);

    // Derived Data for the Command Center
    const currentMaterialMovements = movements.filter(m => m.materialId === selectedMaterialId || m.material === selectedMaterialId);
    
    const isLowStock = materialDetails && materialDetails.quantity <= (materialDetails.lowStockThreshold || 10);
    const isOutOfStock = materialDetails && materialDetails.quantity === 0;
    
    let statusText = 'In Stock';
    let statusColor = '#10b981'; // Green
    let statusBg = '#d1fae5';
    
    if (isOutOfStock) {
        statusText = 'Out of Stock';
        statusColor = '#ef4444'; // Red
        statusBg = '#fee2e2';
    } else if (isLowStock) {
        statusText = 'Low Stock';
        statusColor = '#f59e0b'; // Orange
        statusBg = '#fef3c7';
    } else if (materialDetails?.status === 'Reserved') {
        statusText = 'Reserved';
        statusColor = '#3b82f6'; // Blue
        statusBg = '#dbeafe';
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Sub-components for sections
    
    const renderMaterialSummary = () => (
        <div className="mcc-section" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 120, height: 120, borderRadius: 0, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={48} color="#94a3b8" />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                            {materialDetails?.name || 'Select a material'}
                        </h2>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Hash size={14}/> {materialDetails?.sku || 'N/A'}
                            </span>
                            <span style={{ fontSize: 14, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Layers size={14}/> {materialDetails?.category || 'Uncategorized'}
                            </span>
                            <span style={{ fontSize: 14, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Truck size={14}/> {materialDetails?.supplier || 'N/A'}
                            </span>
                        </div>
                    </div>
                    <span className="mcc-badge" style={{ background: statusBg, color: statusColor }}>
                        <span style={{ width: 6, height: 6, borderRadius: 0, background: statusColor }}></span>
                        {statusText}
                    </span>
                </div>
                
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 32 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Location</div>
                        <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={14} color="#3b82f6"/> 
                            {materialDetails?.warehouse || 'Unassigned'} 
                            {materialDetails?.rack ? ` • ${String(materialDetails.rack).toLowerCase().includes('rack') ? '' : 'Rack '}${materialDetails.rack}` : ''}
                            {materialDetails?.shelf ? ` • ${String(materialDetails.shelf).toLowerCase().includes('shelf') ? '' : 'Shelf '}${materialDetails.shelf}` : ''}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Last Updated</div>
                        <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={14} color="#64748b"/>
                            {formatDate(materialDetails?.updatedAt)} {formatTime(materialDetails?.updatedAt)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderKPICards = () => {
        const outMovs = currentMaterialMovements.filter(m => (m.type || '').toUpperCase() === 'OUT').length;
        const inMovs = currentMaterialMovements.filter(m => (m.type || '').toUpperCase() === 'IN').length;
        const transferred = currentMaterialMovements.filter(m => (m.type || '').toUpperCase() === 'ADJUSTMENT' || (m.type || '').toUpperCase() === 'TRANSFER').length;
        const pending = currentMaterialMovements.filter(m => (m.status || '').toUpperCase() === 'PENDING').length;

        return (
            <div className="mcc-kpi-grid">
                <div className="mcc-kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                        <Box size={16} color="#3b82f6" /> <span style={{ fontSize: 13, fontWeight: 600 }}>Available Stock</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{materialDetails?.quantity || 0} <span style={{fontSize: 14, color: '#94a3b8', fontWeight: 600}}>{materialDetails?.unit || 'pcs'}</span></div>
                    <div style={{ fontSize: 12, color: materialDetails?.quantity > 0 ? '#10b981' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={12}/> {materialDetails?.quantity > 0 ? 'In stock' : 'Out of stock'}</div>
                </div>
                <div className="mcc-kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                        <Layers size={16} color="#f59e0b" /> <span style={{ fontSize: 13, fontWeight: 600 }}>Total Movements</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{currentMaterialMovements.length}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Recorded history</div>
                </div>
                <div className="mcc-kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                        <ArrowDownRight size={16} color="#10b981" /> <span style={{ fontSize: 13, fontWeight: 600 }}>IN Movements</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{inMovs}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Stock additions</div>
                </div>
                <div className="mcc-kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                        <ArrowUpRight size={16} color="#dc2626" /> <span style={{ fontSize: 13, fontWeight: 600 }}>OUT Movements</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{outMovs}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Stock reductions</div>
                </div>
                <div className="mcc-kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                        <ArrowRightLeft size={16} color="#8b5cf6" /> <span style={{ fontSize: 13, fontWeight: 600 }}>Transfers / Adj.</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{transferred}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Internal moves</div>
                </div>
                <div className="mcc-kpi-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                        <Clock size={16} color="#f59e0b" /> <span style={{ fontSize: 13, fontWeight: 600 }}>Pending</span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{pending}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Awaiting action</div>
                </div>
            </div>
        );
    };

    const renderWarehouseInfo = () => {
        const currentWarehouse = materialDetails?.warehouse;
        let uniqueRacks = [...new Set(materialsList.filter(m => m.warehouse === currentWarehouse && m.rack).map(m => parseInt(m.rack)))].sort((a,b)=>a-b);
        if (uniqueRacks.length === 0 && materialDetails?.rack) uniqueRacks.push(parseInt(materialDetails.rack));
        
        return (
        <div className="mcc-section">
            <h3 className="mcc-section-title"><Building2 size={18} color="#3b82f6" /> Warehouse Information</h3>
            <div className="mcc-info-grid" style={{ marginBottom: 20 }}>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Warehouse Name</span>
                    <span className="mcc-info-value">{materialDetails?.warehouse || 'Unassigned'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Zone</span>
                    <span className="mcc-info-value">{materialDetails?.zone || 'Unassigned'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Rack & Shelf</span>
                    <span className="mcc-info-value">
                        {(!materialDetails?.rack && !materialDetails?.shelf) ? '-' : 
                         [
                             materialDetails?.rack ? (String(materialDetails.rack).toLowerCase().includes('rack') ? materialDetails.rack : `Rack ${materialDetails.rack}`) : null,
                             materialDetails?.shelf ? (String(materialDetails.shelf).toLowerCase().includes('shelf') || String(materialDetails.shelf).toLowerCase().includes('rack') ? materialDetails.shelf : `Shelf ${materialDetails.shelf}`) : null
                         ].filter(Boolean).join(' / ')}
                    </span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Bin</span>
                    <span className="mcc-info-value">{materialDetails?.bin ? (String(materialDetails.bin).toLowerCase().includes('bin') ? materialDetails.bin : `Bin ${materialDetails.bin}`) : '-'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Current Temperature</span>
                    <span className="mcc-info-value">{materialDetails?.temperature ? `${materialDetails.temperature}°C` : 'N/A'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Humidity</span>
                    <span className="mcc-info-value">{materialDetails?.humidity ? `${materialDetails.humidity}%` : 'N/A'}</span>
                </div>
            </div>
            {uniqueRacks.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Visual Map (Warehouse Racks)</div>
                    <div style={{ width: '100%', background: '#f8fafc', borderRadius: 0, border: '1px solid #e2e8f0', padding: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
                            {uniqueRacks.map(r => {
                                const isCurrentRack = r === parseInt(materialDetails?.rack);
                                return (
                                    <div key={r} style={{ 
                                        height: 60, 
                                        background: isCurrentRack ? '#eff6ff' : '#fff', 
                                        border: `2px solid ${isCurrentRack ? '#3b82f6' : '#e2e8f0'}`,
                                        borderRadius: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: isCurrentRack ? '#2563eb' : '#64748b' }}>Rack {r}</span>
                                        {isCurrentRack && (
                                            <div style={{ position: 'absolute', top: -6, right: -6, width: 14, height: 14, background: '#ef4444', borderRadius: '0px', border: '2px solid #fff' }}></div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#64748b', justifyContent: 'center', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '0px', background: '#ef4444' }}></div> Target Location</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 12, borderRadius: 0, border: '2px solid #3b82f6', background: '#eff6ff' }}></div> Current Rack</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    };

    const renderSupplierInfo = () => (
        <div className="mcc-section">
            <h3 className="mcc-section-title"><Truck size={18} color="#f59e0b" /> Supplier Information</h3>
            <div className="mcc-info-grid">
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Supplier Name</span>
                    <span className="mcc-info-value">{materialDetails?.supplier || 'N/A'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Contact</span>
                    <span className="mcc-info-value">{materialDetails?.supplierContact || 'N/A'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Delivery Performance</span>
                    <span className="mcc-info-value">{materialDetails?.supplierPerformance ? `${materialDetails.supplierPerformance}%` : 'N/A'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Last Purchase Date</span>
                    <span className="mcc-info-value">{materialDetails?.lastPurchaseDate ? formatDate(materialDetails.lastPurchaseDate) : 'N/A'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Average Lead Time</span>
                    <span className="mcc-info-value">{materialDetails?.leadTime ? `${materialDetails.leadTime} Days` : 'N/A'}</span>
                </div>
                <div className="mcc-info-item">
                    <span className="mcc-info-label">Supplier Rating</span>
                    <span className="mcc-info-value">{materialDetails?.supplierRating ? `${materialDetails.supplierRating} / 5.0` : 'N/A'}</span>
                </div>
            </div>
        </div>
    );

    const renderInventoryAnalytics = () => (
        <div className="mcc-section">
            <h3 className="mcc-section-title"><BarChart2 size={18} color="#0ea5e9" /> Inventory Analytics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {materialDetails?.maxStock && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Stock Level Progress</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{materialDetails?.quantity || 0} / {materialDetails?.maxStock}</span>
                        </div>
                        <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 0, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(((materialDetails?.quantity || 0)/materialDetails.maxStock)*100, 100)}%`, height: '100%', background: '#3b82f6', borderRadius: 0 }}></div>
                        </div>
                    </div>
                )}
                
                <div className="mcc-info-grid">
                    <div className="mcc-info-item">
                        <span className="mcc-info-label">Reorder Level</span>
                        <span className="mcc-info-value">{materialDetails?.lowStockThreshold || 'N/A'} Units</span>
                    </div>
                    <div className="mcc-info-item">
                        <span className="mcc-info-label">Inventory Health</span>
                        <span className="mcc-info-value" style={{color: materialDetails?.quantity > (materialDetails?.lowStockThreshold || 10) ? '#10b981' : '#f59e0b'}}>{materialDetails?.quantity > (materialDetails?.lowStockThreshold || 10) ? 'Healthy' : 'Needs Attention'}</span>
                    </div>
                    <div className="mcc-info-item">
                        <span className="mcc-info-label">Incoming</span>
                        <span className="mcc-info-value">{materialDetails?.incoming || 0} Units</span>
                    </div>
                    <div className="mcc-info-item">
                        <span className="mcc-info-label">Outgoing (Reserved)</span>
                        <span className="mcc-info-value">{materialDetails?.reserved || 0} Units</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocsAndQR = () => (
        <div className="mcc-section">
            <h3 className="mcc-section-title"><FileText size={18} color="#8b5cf6" /> Documents & QR</h3>
            <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ width: 100, height: 100, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
                    <QrCode size={40} color="#0f172a" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>SCAN ME</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {materialDetails?.documents && materialDetails.documents.length > 0 ? (
                        materialDetails.documents.map((doc, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: 0, cursor: 'pointer' }}>
                                <FileText size={16} color="#3b82f6" />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', flex: 1 }}>{doc.name || `Document ${idx+1}`}</span>
                                <Download size={14} color="#64748b" />
                            </div>
                        ))
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 0, border: '1px solid #f1f5f9' }}>
                            <FileText size={16} color="#cbd5e1" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>No documents attached</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderAIInsights = () => {
        if (!materialDetails) return null;
        const lowStock = materialDetails.lowStockThreshold || 10;
        const qty = materialDetails.quantity || 0;
        const isCritical = qty <= lowStock;
        
        return (
            <div className="mcc-section" style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)', borderColor: '#bae6fd' }}>
                <h3 className="mcc-section-title" style={{ borderBottomColor: '#bae6fd' }}><Zap size={18} color="#0284c7" fill="#0284c7" /> Automated Insights</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: 0 }}>
                        {isCritical ? <AlertCircle size={16} color="#ef4444" style={{ marginTop: 2 }} /> : <ThumbsUp size={16} color="#10b981" style={{ marginTop: 2 }} />}
                        <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, lineHeight: 1.5 }}>
                            {isCritical 
                                ? `Stock is at or below the reorder level (${lowStock}). Consider reordering immediately.`
                                : `Inventory levels are currently healthy and above the reorder threshold (${lowStock}).`}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderWorkflowTimeline = () => {
        // Use real timeline from backend if available
        let stages = [];
        if (materialTimeline && materialTimeline.length > 0) {
            stages = materialTimeline.map(t => ({
                title: t.status,
                status: 'Completed',
                user: t.user || 'System',
                date: formatDate(t.timestamp || t.date || t.createdAt),
                time: formatTime(t.timestamp || t.date || t.createdAt),
                remarks: t.notes || '-'
            }));
        } else {
            // Fallback for when there's no backend timeline
            stages = [
                { title: 'Material Created', status: 'Completed', user: 'Admin', date: formatDate(materialDetails?.createdAt), time: formatTime(materialDetails?.createdAt), remarks: 'Initial registration' }
            ];
        }

        const getColorForStatus = (s) => {
            if (s === 'Completed') return '#10b981';
            if (s === 'Current') return '#3b82f6';
            if (s === 'Waiting') return '#f59e0b';
            if (s === 'Rejected/Hold') return '#ef4444';
            return '#cbd5e1'; // Upcoming
        };

        return (
            <div className="mcc-section">
                <h3 className="mcc-section-title"><CheckCircle2 size={18} color="#10b981" /> Workflow Timeline</h3>
                <div className="mcc-timeline">
                    {stages.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>No timeline data available.</div>
                    ) : (
                        stages.map((stage, i) => (
                            <div className="mcc-timeline-item" key={i}>
                                <div className="mcc-timeline-dot" style={{ background: getColorForStatus(stage.status) }}></div>
                                <div className="mcc-timeline-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: stage.status === 'Upcoming' ? '#94a3b8' : '#0f172a' }}>{stage.title}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: getColorForStatus(stage.status), padding: '2px 8px', background: `${getColorForStatus(stage.status)}20`, borderRadius: 0 }}>{stage.status}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={12}/> {stage.user}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12}/> {stage.date} {stage.time && `• ${stage.time}`}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                                        <strong>Remarks:</strong> {stage.remarks}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const renderRecentActivities = () => {
        return (
            <div className="mcc-section">
                <h3 className="mcc-section-title"><Activity size={18} color="#f43f5e" /> Recent Activities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {currentMaterialMovements.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>No recent activities found.</div>
                    ) : (
                        currentMaterialMovements.slice(0, 5).map(m => {
                            const typeStr = (m.type || '').toUpperCase();
                            let icon = <ArrowRightLeft size={14} color="#64748b" />;
                            let bg = '#f1f5f9';
                            if (typeStr === 'IN') { icon = <ArrowDownRight size={14} color="#059669" />; bg = '#d1fae5'; }
                            if (typeStr === 'OUT') { icon = <ArrowUpRight size={14} color="#dc2626" />; bg = '#fee2e2'; }
                            
                            return (
                                <div key={m.id || m._id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{typeStr} • {m.quantity} {materialDetails?.unit || ''}</span>
                                            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{formatTime(m.createdAt || m.date || m.timestamp)}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                                            {m.reason || (m.referenceOrderId ? `Order Ref: ${m.referenceOrderId}` : '-')}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loader" style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '0px', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className="mcc-container">
            {/* Header */}
            <div className="mcc-header">
                <div className="rd-module-title-row">
                    <h1 className="rd-module-title" style={{ margin: 0, fontSize: 24 }}>Movement Tracking</h1>
                    <span className="rd-module-badge">ERP DASHBOARD</span>
                </div>
                <div className="mcc-actions">
                    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 0, padding: '0 12px' }}>
                        <Search size={16} color="#94a3b8" />
                        <select 
                            value={selectedMaterialId || ''} 
                            onChange={(e) => setSelectedMaterialId(e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '10px', fontSize: 14, fontWeight: 600, color: '#0f172a', outline: 'none', width: 200 }}
                        >
                            <option value="">Search material...</option>
                            {materialsList.map(m => (
                                <option key={m.id || m._id} value={m.id || m._id}>{m.sku} - {m.name}</option>
                            ))}
                        </select>
                    </div>
                    <button className="mcc-btn" onClick={fetchDashboardData}><RefreshCw size={16} /> Refresh</button>
                    <button className="mcc-btn"><Download size={16} /> Export</button>
                    <button className="mcc-btn"><Printer size={16} /> Print</button>
                </div>
            </div>

            {!selectedMaterialId || !materialDetails ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>
                    <Package size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                    <h3 style={{ fontSize: 18, color: '#475569', margin: '0 0 8px 0' }}>No Material Selected</h3>
                    <p style={{ fontSize: 14 }}>Please select a material from the dropdown above to view its Movement Tracking details.</p>
                </div>
            ) : (
                <>
                    {/* Top Section */}
                    {renderMaterialSummary()}
                    
                    {/* KPI Cards */}
                    {renderKPICards()}

                    {/* Main Content Layout */}
                    <div className="mcc-main-grid">
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {renderWarehouseInfo()}
                            {renderSupplierInfo()}
                            {renderDocsAndQR()}
                            {renderAIInsights()}
                        </div>

                        {/* Right Column */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {renderWorkflowTimeline()}
                            {renderRecentActivities()}
                            {renderInventoryAnalytics()}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrackingDashboard;
