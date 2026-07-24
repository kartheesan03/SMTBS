import React, { useState, useEffect, useContext } from 'react';
import { Package, AlertTriangle, Plus, CheckCircle, Clock, CornerUpLeft, Printer, FileText, RefreshCw, Download, Box, AlertCircle, ArrowUpRight, Activity, User, Building, Bell, AlertOctagon } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { DataTable } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { StatCard, StatGrid } from '../components/ui/StatCard';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const MyMaterials = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [materialsList, setMaterialsList] = useState([]);
    const [allMaterialsList, setAllMaterialsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ materialId: '', requiredQuantity: 1, priority: 'Normal', warehouse: 'Main Warehouse', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const location = useLocation();

    let pageTitle = "Material Requests";
    let pageBadge = "REQUESTS";
    let pageMode = "requests";
    
    if (location.pathname.includes('/inventory')) {
        pageTitle = "Inventory Management";
        pageBadge = "INVENTORY";
        pageMode = "inventory";
    } else if (location.pathname.includes('/stock')) {
        pageTitle = "Stock Monitoring";
        pageBadge = "STOCK";
        pageMode = "stock";
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, matRes, allMatRes] = await Promise.all([
                API.get('/stock-requests'),
                API.get('/materials'),
                API.get('/materials/list')
            ]);
            setRequests(reqRes.data || []);
            setMaterialsList(matRes.data || []);
            setAllMaterialsList(allMatRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load your materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = { 
                ...formData, 
                reason: formData.priority !== 'Normal' ? `[${formData.priority} Priority - ${formData.warehouse}] ${formData.reason}` : formData.reason
            };
            await API.post('/stock-requests', payload);
            toast.success("Material request submitted successfully");
            setShowModal(false);
            setFormData({ materialId: '', requiredQuantity: 1, priority: 'Normal', warehouse: 'Main Warehouse', reason: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestMaterial = (materialId) => {
        setFormData({ materialId, requiredQuantity: 1, priority: 'Normal', warehouse: 'Main Warehouse', reason: '' });
        setShowModal(true);
    };


    const handleReceive = async (id) => {
        try {
            await API.put(`/stock-requests/${id}/employee-receive`);
            toast.success("Material received successfully");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to receive material");
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm("Are you sure you want to request a return for this material?")) return;
        try {
            await API.put(`/stock-requests/${id}/request-return`);
            toast.success("Return requested successfully");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to request return");
        }
    };

    const handlePrint = (row) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Material Request Receipt</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        p { margin: 8px 0; line-height: 1.5; }
                        .label { font-weight: bold; width: 120px; display: inline-block; }
                    </style>
                </head>
                <body>
                    <h2>Material Request Details</h2>
                    <p><span class="label">Material:</span> ${row.material?.name || 'N/A'}</p>
                    <p><span class="label">Quantity:</span> ${row.requiredQuantity}</p>
                    <p><span class="label">Status:</span> ${row.status}</p>
                    <p><span class="label">Date:</span> ${new Date(row.createdAt).toLocaleDateString()}</p>
                    <p><span class="label">Reason:</span> ${row.reason}</p>
                    <p style="margin-top: 40px; font-size: 12px; color: #64748b;">Printed on ${new Date().toLocaleString()}</p>
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'Manager Approved': return '#3b82f6';
            case 'Rejected': return '#ef4444';
            case 'Processing': return '#8b5cf6';
            case 'Dispatched': return '#ec4899';
            case 'Delivered': return '#10b981';
            case 'Completed': return '#059669';
            case 'Cancelled': return '#64748b';
            default: return '#64748b';
        }
    };

    const requestColumns = [
        { 
            key: 'materialName', 
            label: 'MATERIAL',
            render: (_, row) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{row.material?.name || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{row.material?.sku || 'MAT-000'}</span>
                </div>
            )
        },
        { 
            key: 'materialCategory', 
            label: 'CATEGORY',
            render: (_, row) => <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 0, display: 'inline-block' }}>{row.material?.category || 'General'}</span>
        },
        { 
            key: 'warehouse', 
            label: 'LOCATION',
            render: (_, row) => <span style={{ color: '#334155', fontSize: 13 }}>{row.warehouse || 'Main Warehouse'}</span>
        },
        { 
            key: 'requiredQuantity', 
            label: 'QTY REQUESTED',
            render: (val, row) => <span><span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{val}</span> <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{row.material?.unit || 'units'}</span></span>
        },
        { 
            key: 'materialQty', 
            label: 'AVAILABLE QTY', 
            align: 'right', 
            render: (_, row) => <span><span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{row.material?.quantity || 0}</span> <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{row.material?.unit || 'units'}</span></span>
        },
        { 
            key: 'materialReserved', 
            label: 'RESERVED QTY', 
            align: 'right', 
            render: (_, row) => <span><span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{row.material?.reservedQuantity || 0}</span> <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{row.material?.unit || 'units'}</span></span>
        },
        { 
            key: 'status', 
            label: 'STATUS',
            render: (val) => (
                <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '0px', 
                    fontSize: '11px', 
                    fontWeight: '600',
                    backgroundColor: `${getStatusColor(val)}15`,
                    color: getStatusColor(val),
                    border: `1px solid ${getStatusColor(val)}40`
                }}>
                    {val}
                </span>
            )
        },
        { 
            key: 'createdAt', 
            label: 'DATE REQUESTED', 
            render: (val) => <span style={{ fontSize: 13, color: '#64748b' }}>{new Date(val).toLocaleDateString()}</span> 
        },
        { 
            key: 'reason', 
            label: 'REASON',
            render: (val) => <span style={{ fontSize: 13, color: '#64748b' }}>{val}</span>
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '6px' }}>
                    {row.status === 'Delivered' && (
                        <button 
                            onClick={() => handleReceive(row.id || row._id)}
                            className="rd-btn-compact"
                            style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 0, background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', cursor: 'pointer' }}
                        >
                            Receive
                        </button>
                    )}
                    {row.status === 'Completed' && (
                        <button 
                            onClick={() => handleReturn(row.id || row._id)}
                            className="rd-btn-compact"
                            style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 0, background: '#fff1f2', color: '#ef4444', border: '1px solid #fecdd3', cursor: 'pointer' }}
                        >
                            Return
                        </button>
                    )}
                    <button 
                        onClick={() => handlePrint(row)}
                        className="rd-btn-compact"
                        style={{ padding: '4px 8px', fontSize: 12, borderRadius: 0, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Print"
                    >
                        <Printer size={14} />
                    </button>
                </div>
            )
        }
    ];

    const inventoryColumns = [
        { 
            key: 'materialName', 
            label: 'MATERIAL NAME',
            sortable: true,
            render: (val, row) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{val || row.material?.name}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{row.material?.sku || 'MAT-000'}</span>
                </div>
            )
        },
        { 
            key: 'materialCategory', 
            label: 'CATEGORY',
            sortable: true,
            render: (val, row) => <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 0, display: 'inline-block' }}>{val || row.material?.category || 'General'}</span>
        },
        {
            key: 'location',
            label: 'LOCATION',
            render: (_, row) => {
                const displayLoc = row.warehouse ? `${row.warehouse} / ${row.shelf || 'No Shelf'}` : (row.material?.location || null);
                if (!displayLoc) return <span style={{ color: '#cbd5e1', fontSize: 13, fontStyle: 'italic' }}>Not set</span>;
                return <span style={{ color: '#334155', fontSize: 13 }}>{displayLoc}</span>;
            }
        },
        { 
            key: 'materialQty', 
            label: 'AVAILABLE QTY', 
            align: 'center',
            sortable: true,
            render: (val, row) => <span><span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{val}</span> <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{row.material?.unit || 'units'}</span></span>
        },
        { 
            key: 'requiredQuantity', 
            label: 'ASSIGNED QTY', 
            align: 'center',
            sortable: true,
            render: (val, row) => <span><span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{val}</span> <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{row.material?.unit || 'units'}</span></span>
        },
        { 
            key: 'materialReserved', 
            label: 'RESERVED QTY', 
            align: 'center',
            sortable: true,
            render: (val, row) => <span><span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{val}</span> <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{row.material?.unit || 'units'}</span></span>
        },
        { 
            key: 'materialStatus', 
            label: 'STATUS',
            render: (val, row) => {
                const stock = row.material?.quantity || 0;
                const min = row.material?.lowStockThreshold || 10;
                let statusText = 'In Stock';
                let bg = '#ecfdf5', color = '#10b981', border = '#a7f3d0';
                if (stock === 0) { statusText = 'Out of Stock'; bg = '#fff1f2'; color = '#ef4444'; border = '#fecdd3'; }
                else if (stock <= min) { statusText = 'Low Stock'; bg = '#fffbeb'; color = '#f59e0b'; border = '#fde68a'; }
                
                return (
                    <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, borderRadius: 0 }}>
                        {statusText}
                    </span>
                );
            }
        },
        { 
            key: 'updatedAt', 
            label: 'LAST UPDATED', 
            render: (val, row) => {
                const ts = val || row.material?.updatedAt || row.updatedAt;
                const relativeTime = (dateStr) => {
                    if (!dateStr) return 'Unknown';
                    const diff = new Date() - new Date(dateStr);
                    const mins = Math.floor(diff / 60000);
                    if (mins < 60) return mins < 1 ? 'Just now' : `${mins}m ago`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h ago`;
                    return `${Math.floor(hrs / 24)}d ago`;
                };
                return (
                    <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {relativeTime(ts) === 'Just now' ? 'Just now' : relativeTime(ts)}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'ACTIONS',
            align: 'center',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button 
                        className="rd-btn-compact"
                        style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 0, background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', cursor: 'pointer' }}
                        onClick={() => {
                            setFormData({...formData, materialId: row.id || row.material?.id || row.material?._id});
                            setShowModal(true);
                        }}
                    >
                        Request
                    </button>
                </div>
            )
        }
    ];

    const getCategoryColor = (category) => {
        const colors = {
            'Raw Materials': '#3b82f6',
            'Electrical': '#eab308',
            'Plumbing': '#06b6d4',
            'Safety Gear': '#f97316',
            'Tools': '#8b5cf6',
            'Consumables': '#10b981'
        };
        return colors[category] || '#94a3b8';
    };

    const stockColumns = [
        { key: 'name', label: 'Material Name' },
        { key: 'sku', label: 'SKU' },
        { 
            key: 'category', 
            label: 'Category',
            render: (val) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="category-dot" style={{ backgroundColor: getCategoryColor(val) }}></span>
                    {val}
                </div>
            )
        },
        { 
            key: 'quantity', 
            label: 'Available Stock', 
            render: (val, row) => {
                const max = (row.lowStockThreshold || 10) * 3;
                const percent = Math.min(100, Math.max(0, ((val || 0) / max) * 100));
                let color = '#10b981';
                if ((val || 0) === 0) color = '#ef4444';
                else if ((val || 0) <= (row.lowStockThreshold || 10)) color = '#f59e0b';
                
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '600' }}>{val || 0}</span>
                            <span style={{ color: '#64748b', fontSize: '12px' }}>{row.unit || 'units'}</span>
                        </div>
                        <div className="stock-progress-container">
                            <div className="stock-progress-fill" style={{ width: `${percent}%`, backgroundColor: color }}></div>
                        </div>
                    </div>
                );
            } 
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val, row) => {
                const isLow = (row.quantity || 0) <= (row.lowStockThreshold || 10);
                const isOut = (row.quantity || 0) === 0;
                
                let bgColor = '#ecfdf5';
                let color = '#10b981';
                let label = 'In Stock';
                
                if (isOut) {
                    bgColor = '#fef2f2';
                    color = '#ef4444';
                    label = 'Out of Stock';
                } else if (isLow) {
                    bgColor = '#fffbeb';
                    color = '#f59e0b';
                    label = 'Low Stock';
                }
                
                return (
                    <span style={{ 
                        padding: '4px 12px', borderRadius: '0px', fontSize: '12px', fontWeight: '600',
                        backgroundColor: bgColor,
                        color: color,
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                        {isOut ? <AlertOctagon size={12} /> : isLow ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {label}
                    </span>
                );
            }
        }
    ];

    const getRenderData = () => {
        if (pageMode === 'inventory') {
            return materialsList.map(m => {
                const completedRequests = requests.filter(r => 
                    (r.materialId === m.id || r.material?.id === m.id || r.material?._id === m.id) && 
                    r.status === 'Completed'
                );
                const assignedQty = completedRequests.reduce((sum, r) => sum + (r.requiredQuantity || 0), 0);
                const lastRequestId = completedRequests.length > 0 ? 
                    (completedRequests[completedRequests.length - 1]._id || completedRequests[completedRequests.length - 1].id) 
                    : null;
                return {
                    id: m.id || m._id,
                    requestId: lastRequestId,
                    material: m, // keep for backward compatibility
                    materialName: m.name || m.materialName || 'Unknown',
                    materialCategory: m.category || 'General',
                    materialQty: m.quantity || 0,
                    materialReserved: m.reservedQuantity || 0,
                    materialThreshold: m.lowStockThreshold || 0,
                    requiredQuantity: assignedQty,
                    warehouse: m.warehouse,
                    shelf: m.shelf,
                    updatedAt: m.updatedAt
                };
            });
        }
        if (pageMode === 'stock') return materialsList;
        return requests;
    };

    const getRenderColumns = () => {
        if (pageMode === 'inventory') return inventoryColumns;
        if (pageMode === 'stock') return stockColumns;
        return requestColumns;
    };

    const getTableTitle = () => {
        if (pageMode === 'inventory') return "Assigned Inventory Register";
        if (pageMode === 'stock') return "Available Stock Levels";
        return "Your Material Requests";
    };

    const renderWorkspace = () => {
        const tableData = getRenderData();
        
        // Calculate KPIs reliably regardless of current pageMode
        const inventoryData = materialsList.map(m => {
            const completedRequests = requests.filter(r => 
                (r.materialId === m.id || r.material?.id === m.id || r.material?._id === m.id) && 
                r.status === 'Completed'
            );
            return {
                materialQty: m.quantity || 0,
                materialThreshold: m.lowStockThreshold || 0,
                requiredQuantity: completedRequests.reduce((sum, r) => sum + (r.requiredQuantity || 0), 0)
            };
        });
        
        const totalAssigned = materialsList.length;
        const availableQty = inventoryData.reduce((acc, row) => acc + (row.materialQty || 0), 0);
        const lowStockItems = inventoryData.filter(row => (row.materialQty || 0) <= (row.materialThreshold || 10)).length;
        const pendingRequests = requests.filter(r => ['Pending', 'Manager Approved', 'Processing'].includes(r.status)).length;
        const criticalItem = materialsList.find(m => (m.quantity || 0) <= (m.lowStockThreshold || 10));

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div className="rd-module-header" style={{ marginBottom: '24px' }}>
                    <div className="rd-module-info" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">{pageTitle}</span>
                            <span className="rd-module-badge">{pageBadge}</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <StatGrid>
                    <StatCard
                        title="Total Items" value={totalAssigned}
                        colorTheme="blue" icon={Package}
                        trendValue="Inventory tracking active"
                        trendPositive={true}
                    />
                    <StatCard
                        title="In Stock" value={availableQty}
                        colorTheme="mint" icon={CheckCircle}
                        trendValue={`${totalAssigned ? '100' : '0'}% of inventory`}
                        trendPositive={true}
                    />
                    <StatCard
                        title="Low Stock" value={lowStockItems}
                        colorTheme="yellow" icon={AlertTriangle}
                        trendValue={`${totalAssigned ? Math.round((lowStockItems / totalAssigned) * 100) : 0}% need attention`}
                        trendPositive={false}
                    />
                    <StatCard
                        title="Out of Stock" value={pendingRequests}
                        colorTheme="peach" icon={AlertCircle}
                        trendValue="0% critical"
                        trendPositive={false}
                    />
                </StatGrid>

                {/* Assigned Materials Section (Only in Requests View) */}
                {pageMode === 'requests' && (
                    <div style={{ marginBottom: '24px' }}>
                        <DataTable 
                            title="Inventory Register"
                            subtitle="Comprehensive list of all materials — location, GPS status, and quantity from a single source of truth"
                            columns={inventoryColumns}
                            data={materialsList.map(m => {
                                const completedRequests = requests.filter(r => 
                                    (r.materialId === m.id || r.material?.id === m.id || r.material?._id === m.id) && 
                                    r.status === 'Completed'
                                );
                                const assignedQty = completedRequests.reduce((sum, r) => sum + (r.requiredQuantity || 0), 0);
                                return {
                                    id: m.id || m._id,
                                    material: m,
                                    materialName: m.name || m.materialName || 'Unknown',
                                    materialCategory: m.category || 'General',
                                    materialQty: m.quantity || 0,
                                    materialReserved: m.reservedQuantity || 0,
                                    materialThreshold: m.lowStockThreshold || 0,
                                    requiredQuantity: assignedQty,
                                    warehouse: 'Main Warehouse',
                                    updatedAt: m.updatedAt
                                };
                            })}
                            loading={loading}
                            searchPlaceholder="Search materials, category..."
                            searchKeys={['materialName', 'materialCategory']}
                            primaryAction={{ label: '+ Add Material', icon: null, onClick: () => setShowModal(true) }}
                        />
                    </div>
                )}

                {/* Main 2-Column Layout (only applied for requests view) */}
                <div className={pageMode === 'requests' ? "erp-inventory-layout" : ""}>
                    
                    {/* LEFT COLUMN: Data Table */}
                    <div className={pageMode === 'requests' ? "erp-main-column" : ""}>
                        {criticalItem && (
                            <div className="erp-low-stock-alert">
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <AlertOctagon size={24} color="#e11d48" />
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#9f1239' }}>⚠ Low Stock Alert</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#be123c' }}>
                                            <strong>{criticalItem.name}</strong> is critically low. Available: <strong>{criticalItem.quantity || 0}</strong> (Minimum: {criticalItem.lowStockThreshold || 10})
                                        </p>
                                    </div>
                                </div>
                                <button className="rd-btn primary" onClick={() => setShowModal(true)} style={{ background: '#e11d48', border: 'none', padding: '8px 16px', fontWeight: 600 }}>
                                    Request Restock
                                </button>
                            </div>
                        )}

                        <DataTable 
                            title={getTableTitle()}
                            subtitle="Comprehensive list of all materials — location, GPS status, and quantity from a single source of truth"
                            columns={getRenderColumns()} 
                            data={tableData} 
                            loading={loading}
                            searchPlaceholder={pageMode === 'requests' ? 'Search requests...' : 'Search materials, category...'}
                            searchKeys={pageMode === 'requests' ? ['material.name', 'status', 'reason'] : ['materialName', 'materialCategory']}
                            primaryAction={{ label: 'New Material Request', icon: Plus, onClick: () => setShowModal(true) }}
                        />
                    </div>

                    {/* RIGHT COLUMN: Sidebar Overview */}
                    {pageMode === 'requests' && (
                        <div className="erp-side-column">
                            <div className="erp-sidebar-card">
                                <h3>Request Overview</h3>
                                <div className="erp-overview-list">
                                    <div className="erp-overview-item">
                                        <span className="erp-overview-label"><User size={16} /> Employee</span>
                                        <span className="erp-overview-value">{user?.name || 'Employee'}</span>
                                    </div>
                                    <div className="erp-overview-item">
                                        <span className="erp-overview-label"><Building size={16} /> Department</span>
                                        <span className="erp-overview-value">{user?.role || 'Operations'}</span>
                                    </div>
                                    <div className="erp-overview-item" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '4px' }}>
                                        <span className="erp-overview-label"><Box size={16} /> Assigned Warehouse</span>
                                        <span className="erp-overview-value">Main Warehouse</span>
                                    </div>
                                    <div className="erp-overview-item">
                                        <span className="erp-overview-label"><Package size={16} /> Total Requests</span>
                                        <span className="erp-overview-value" style={{ color: '#4f46e5', fontWeight: 700 }}>{requests.length} Items</span>
                                    </div>
                                    <div className="erp-overview-item">
                                        <span className="erp-overview-label"><AlertTriangle size={16} /> Pending Requests</span>
                                        <span className="erp-overview-value" style={{ color: '#10b981', fontWeight: 700 }}>{pendingRequests} Items</span>
                                    </div>
                                </div>
                            </div>

                            <div className="erp-sidebar-card">
                                <h3>Quick Actions</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                                    <button className="erp-action-btn" onClick={() => setShowModal(true)}>
                                        <Plus size={16} /> Submit New Request
                                    </button>
                                    <button className="erp-action-btn" onClick={fetchData}>
                                        <RefreshCw size={16} /> Refresh Data
                                    </button>
                                    <button className="erp-action-btn">
                                        <Clock size={16} /> View History
                                    </button>
                                </div>
                            </div>

                            <div className="erp-sidebar-card">
                                <h3><Bell size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> Recent Notifications</h3>
                                <div className="erp-timeline">
                                    <div className="erp-timeline-item">
                                        <div className="erp-timeline-icon"><CheckCircle size={12} /></div>
                                        <div>
                                            <div className="erp-timeline-content">Inventory updated successfully</div>
                                            <div className="erp-timeline-time">2 hours ago</div>
                                        </div>
                                    </div>
                                    <div className="erp-timeline-item">
                                        <div className="erp-timeline-icon" style={{ borderColor: '#10b981', color: '#10b981' }}><ArrowUpRight size={12} /></div>
                                        <div>
                                            <div className="erp-timeline-content">Material request #1042 approved</div>
                                            <div className="erp-timeline-time">Yesterday at 14:30</div>
                                        </div>
                                    </div>
                                    <div className="erp-timeline-item">
                                        <div className="erp-timeline-icon" style={{ borderColor: '#f59e0b', color: '#f59e0b' }}><AlertTriangle size={12} /></div>
                                        <div>
                                            <div className="erp-timeline-content">Low stock alert submitted</div>
                                            <div className="erp-timeline-time">3 days ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderStockWorkspace = () => {
        const stockData = materialsList;
        const totalItems = stockData.length;
        const inStock = stockData.filter(m => (m.quantity || 0) > (m.lowStockThreshold || 10)).length;
        const lowStock = stockData.filter(m => (m.quantity || 0) > 0 && (m.quantity || 0) <= (m.lowStockThreshold || 10)).length;
        const outOfStock = stockData.filter(m => (m.quantity || 0) === 0).length;

        const categoryCounts = stockData.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + 1;
            return acc;
        }, {});
        const categoryChartData = Object.keys(categoryCounts).map(key => ({
            name: key,
            value: categoryCounts[key]
        }));
        
        const topMaterialsData = [...stockData]
            .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
            .slice(0, 5)
            .map(m => ({ name: m.name, quantity: m.quantity || 0 }));
            
        const sparkData = [ {v:10}, {v:15}, {v:8}, {v:12}, {v:20}, {v:18}, {v:25} ];
        
        const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

        return (
            <div className="erp-inventory-workspace">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">{pageTitle}</span>
                            <span className="rd-module-badge">{pageBadge}</span>
                        </div>
                    </div>
                </div>
                {/* Stock KPI Strip */}
                <div className="erp-kpi-strip">
                    <div className="erp-kpi-strip-card blue">
                        <div className="erp-kpi-strip-header">
                            <h3 className="erp-kpi-strip-title">Total Items</h3>
                            <div className="erp-kpi-strip-icon-wrapper" style={{ color: '#3b82f6' }}>
                                <Box size={16} />
                            </div>
                        </div>
                        <p className="erp-kpi-strip-value">{totalItems}</p>
                        <div className="erp-kpi-strip-footer">
                            <span className="erp-kpi-strip-change positive"><ArrowUpRight size={14} /> Inventory tracking active</span>
                            <span className="erp-kpi-strip-details">Details &rarr;</span>
                        </div>
                    </div>
                    
                    <div className="erp-kpi-strip-card green">
                        <div className="erp-kpi-strip-header">
                            <h3 className="erp-kpi-strip-title">In Stock</h3>
                            <div className="erp-kpi-strip-icon-wrapper" style={{ color: '#10b981' }}>
                                <CheckCircle size={16} />
                            </div>
                        </div>
                        <p className="erp-kpi-strip-value">{inStock}</p>
                        <div className="erp-kpi-strip-footer">
                            <span className="erp-kpi-strip-change positive"><ArrowUpRight size={14} /> 100% of inventory</span>
                            <span className="erp-kpi-strip-details">Details &rarr;</span>
                        </div>
                    </div>
                    
                    <div className="erp-kpi-strip-card orange">
                        <div className="erp-kpi-strip-header">
                            <h3 className="erp-kpi-strip-title">Low Stock</h3>
                            <div className="erp-kpi-strip-icon-wrapper" style={{ color: '#f59e0b' }}>
                                <AlertTriangle size={16} />
                            </div>
                        </div>
                        <p className="erp-kpi-strip-value">{lowStock}</p>
                        <div className="erp-kpi-strip-footer">
                            <span className="erp-kpi-strip-change negative" style={{ color: '#ef4444' }}><Activity size={14} /> 0% need attention</span>
                            <span className="erp-kpi-strip-details">Details &rarr;</span>
                        </div>
                    </div>

                    <div className="erp-kpi-strip-card red">
                        <div className="erp-kpi-strip-header">
                            <h3 className="erp-kpi-strip-title">Out of Stock</h3>
                            <div className="erp-kpi-strip-icon-wrapper" style={{ color: '#ef4444' }}>
                                <AlertOctagon size={16} />
                            </div>
                        </div>
                        <p className="erp-kpi-strip-value">{outOfStock}</p>
                        <div className="erp-kpi-strip-footer">
                            <span className="erp-kpi-strip-change negative" style={{ color: '#ef4444' }}><Activity size={14} /> 0% critical</span>
                            <span className="erp-kpi-strip-details">Details &rarr;</span>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="erp-charts-grid">
                    <div className="erp-chart-card">
                        <div className="erp-chart-header">
                            <h3 className="erp-chart-title">Stock by Category</h3>
                            <p className="erp-chart-subtitle">Distribution of all inventory items</p>
                        </div>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val, name) => [val, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="erp-chart-card">
                        <div className="erp-chart-header">
                            <h3 className="erp-chart-title">Top Materials by Quantity</h3>
                            <p className="erp-chart-subtitle">Highest volume stock currently available</p>
                        </div>
                        <div style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topMaterialsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                                        {topMaterialsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="rd-panel" style={{ border: 'none', boxShadow: '0 4px 12px rgba(15,23,42,0.03)', background: '#ffffff', borderRadius: '0px' }}>
                    <DataTable 
                        title="Available Stock Levels"
                        subtitle="Detailed view of your current inventory and threshold statuses."
                        columns={stockColumns} 
                        data={stockData} 
                        loading={loading}
                        dense={true}
                        compactControls={true}
                        searchPlaceholder="Search materials by name, SKU or category..."
                        searchKeys={['name', 'sku', 'category']}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="rd-container">
            {pageMode === 'inventory' || pageMode === 'requests' ? (
                <div className="rd-content" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {renderWorkspace()}
                </div>
            ) : pageMode === 'stock' ? (
                <div className="rd-content" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {renderStockWorkspace()}
                </div>
            ) : null}

            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                backgroundColor: '#fff', borderRadius: '0px', padding: '32px',
                                width: '100%', maxWidth: '600px', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                <div style={{ width: 48, height: 48, background: '#eef2ff', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={24} color="#4f46e5" />
                                </div>
                                <div>
                                    <h2 className="rd-h2" style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Submit Material Request</h2>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Fill in the details below to request a new material.</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="rd-label" style={{ fontWeight: 600, color: '#1e293b' }}>Material <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select 
                                            className="rd-input"
                                            required
                                            value={formData.materialId}
                                            onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                                            style={{ height: '48px', borderRadius: '0px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
                                        >
                                            <option value="">Select a material</option>
                                            {allMaterialsList.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="rd-label" style={{ fontWeight: 600, color: '#1e293b' }}>Requested Quantity <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input 
                                            type="number"
                                            className="rd-input"
                                            min="1"
                                            required
                                            value={formData.requiredQuantity}
                                            onChange={(e) => setFormData({...formData, requiredQuantity: e.target.value})}
                                            style={{ height: '48px', borderRadius: '0px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label className="rd-label" style={{ fontWeight: 600, color: '#1e293b' }}>Warehouse</label>
                                        <select 
                                            className="rd-input"
                                            value={formData.warehouse}
                                            onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
                                            style={{ height: '48px', borderRadius: '0px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
                                        >
                                            <option value="Main Warehouse">Main Warehouse</option>
                                            <option value="Secondary Warehouse">Secondary Warehouse</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="rd-label" style={{ fontWeight: 600, color: '#1e293b' }}>Priority</label>
                                        <select 
                                            className="rd-input"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                            style={{ height: '48px', borderRadius: '0px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
                                        >
                                            <option value="Normal">Normal</option>
                                            <option value="High">High</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="rd-label" style={{ fontWeight: 600, color: '#1e293b' }}>Reason / Justification <span style={{ color: '#ef4444' }}>*</span></label>
                                    <textarea 
                                        className="rd-input"
                                        rows="3"
                                        required
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                        style={{ borderRadius: '0px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '16px', fontSize: '14px', resize: 'vertical', minHeight: '100px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button type="button" className="rd-btn secondary" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '0px', fontWeight: 600 }}>Cancel</button>
                                    <button type="submit" className="rd-btn primary" disabled={submitting} style={{ padding: '12px 24px', borderRadius: '0px', fontWeight: 600, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none' }}>
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyMaterials;
