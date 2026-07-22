import React, { useState, useEffect, useContext } from 'react';
import { Package, AlertTriangle, Plus, CheckCircle, Clock, CornerUpLeft, Printer, FileText, RefreshCw, Download, Box, AlertCircle, ArrowUpRight, Activity, User, Building, Bell, AlertOctagon } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { DataTable } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const MyMaterials = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [materialsList, setMaterialsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ materialId: '', requiredQuantity: 1, priority: 'Normal', warehouse: 'Main Warehouse', reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const location = useLocation();

    let pageTitle = "Material Requests";
    let pageBadge = "REQUESTS";
    let pageMode = "requests";
    
    if (location.pathname.includes('/inventory')) {
        pageTitle = "Assigned Inventory";
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
            const [reqRes, matRes] = await Promise.all([
                API.get('/stock-requests'),
                API.get('/materials')
            ]);
            setRequests(reqRes.data || []);
            setMaterialsList(matRes.data || []);
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
        { key: 'material.name', label: 'Material' },
        { key: 'requiredQuantity', label: 'Quantity' },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => (
                <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    backgroundColor: `${getStatusColor(val)}20`,
                    color: getStatusColor(val)
                }}>
                    {val}
                </span>
            )
        },
        { key: 'createdAt', label: 'Date Requested', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'reason', label: 'Reason' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => handlePrint(row)}
                        className="rd-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Print Details"
                    >
                        <Printer size={14} /> Print
                    </button>
                    {row.status === 'Delivered' && (
                        <button 
                            onClick={() => handleReceive(row.id || row._id)}
                            className="rd-btn primary"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                            Mark as Received
                        </button>
                    )}
                    {row.status === 'Completed' && (
                        <button 
                            onClick={() => handleReturn(row.id || row._id)}
                            className="rd-btn"
                            style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Request Return"
                        >
                            <CornerUpLeft size={14} /> Return
                        </button>
                    )}
                </div>
            )
        }
    ];

    const inventoryColumns = [
        { key: 'material.name', label: 'Material' },
        { key: 'material.category', label: 'Category', render: (val) => val || 'General' },
        { key: 'warehouse', label: 'Warehouse', render: () => 'Main Warehouse' },
        { key: 'requiredQuantity', label: 'Assigned Qty', render: (val) => <span style={{ fontWeight: 600 }}>{val}</span> },
        { key: 'material.quantity', label: 'Available Qty', render: (val) => val || 0 },
        { key: 'material.reservedQuantity', label: 'Reserved Qty', render: (val) => val || 0 },
        { key: 'material.lowStockThreshold', label: 'Min Level', render: (val) => val || 0 },
        { 
            key: 'material.status', 
            label: 'Status',
            render: (val, row) => {
                const stock = row.material?.quantity || 0;
                const min = row.material?.lowStockThreshold || 10;
                let statusText = 'In Stock';
                let color = '#10b981';
                let bg = '#ecfdf5';
                if (stock === 0) { statusText = 'Out of Stock'; color = '#64748b'; bg = '#f1f5f9'; }
                else if (stock <= min / 2) { statusText = 'Critical'; color = '#e11d48'; bg = '#fff1f2'; }
                else if (stock <= min) { statusText = 'Low Stock'; color = '#f59e0b'; bg = '#fffbeb'; }
                
                return (
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', backgroundColor: bg, color: color }}>
                        {statusText}
                    </span>
                );
            }
        },
        { key: 'updatedAt', label: 'Last Updated', render: (val) => new Date(val).toLocaleDateString() },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => handleReturn(row.id || row._id)}
                        className="rd-btn"
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Request Return"
                    >
                        <CornerUpLeft size={14} /> Return
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
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
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
        if (pageMode === 'inventory') return requests.filter(r => r.status === 'Completed');
        if (pageMode === 'stock') return materialsList;
        return requests;
    };

    const getRenderColumns = () => {
        if (pageMode === 'inventory') return inventoryColumns;
        if (pageMode === 'stock') return stockColumns;
        return requestColumns;
    };

    const getTableTitle = () => {
        if (pageMode === 'inventory') return "Your Assigned Materials";
        if (pageMode === 'stock') return "Available Stock Levels";
        return "Your Material Requests";
    };

    const renderInventoryWorkspace = () => {
        const assignedData = getRenderData();
        const totalAssigned = assignedData.length;
        const availableQty = assignedData.reduce((acc, row) => acc + (row.material?.quantity || 0), 0);
        const lowStockItems = assignedData.filter(row => (row.material?.quantity || 0) <= (row.material?.lowStockThreshold || 10)).length;
        const pendingRequests = requests.filter(r => ['Pending', 'Manager Approved', 'Processing'].includes(r.status)).length;
        const criticalItem = assignedData.find(row => (row.material?.quantity || 0) <= (row.material?.lowStockThreshold || 10));

        return (
            <div className="erp-inventory-workspace">
                {/* Header */}
                <div className="erp-page-header" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>{pageTitle}</h1>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="rd-btn" style={{ padding: '10px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={fetchData} title="Refresh">
                                <RefreshCw size={18} color="#64748b" />
                            </button>
                            <button className="rd-btn" style={{ padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Download size={18} color="#64748b" /> <span style={{ fontWeight: 600, color: '#334155' }}>Export</span>
                            </button>
                            <button className="rd-btn primary" onClick={() => setShowModal(true)} style={{ padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px' }}>
                                <Plus size={18} /> <span style={{ fontWeight: 600 }}>New Material Request</span>
                            </button>
                        </div>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '15px', margin: '8px 0 0 0', maxWidth: '600px', lineHeight: '1.5' }}>
                        Manage all materials assigned to you, submit stock updates, request additional inventory, and monitor stock availability.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="erp-kpi-grid">
                    <div className="erp-kpi-card" style={{ borderTop: '4px solid #4f46e5' }}>
                        <div className="erp-kpi-header">
                            <div className="erp-kpi-icon-wrapper" style={{ background: '#eef2ff' }}>
                                <Package size={24} color="#4f46e5" />
                            </div>
                            <div>
                                <p className="erp-kpi-title">Assigned Materials</p>
                                <h3 className="erp-kpi-value">{totalAssigned}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="erp-kpi-card" style={{ borderTop: '4px solid #10b981' }}>
                        <div className="erp-kpi-header">
                            <div className="erp-kpi-icon-wrapper" style={{ background: '#ecfdf5' }}>
                                <Box size={24} color="#10b981" />
                            </div>
                            <div>
                                <p className="erp-kpi-title">Available Quantity</p>
                                <h3 className="erp-kpi-value">{availableQty}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="erp-kpi-card" style={{ borderTop: '4px solid #f59e0b' }}>
                        <div className="erp-kpi-header">
                            <div className="erp-kpi-icon-wrapper" style={{ background: '#fffbeb' }}>
                                <AlertTriangle size={24} color="#f59e0b" />
                            </div>
                            <div>
                                <p className="erp-kpi-title">Low Stock Items</p>
                                <h3 className="erp-kpi-value">{lowStockItems}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="erp-kpi-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                        <div className="erp-kpi-header">
                            <div className="erp-kpi-icon-wrapper" style={{ background: '#f5f3ff' }}>
                                <Activity size={24} color="#8b5cf6" />
                            </div>
                            <div>
                                <p className="erp-kpi-title">Pending Requests</p>
                                <h3 className="erp-kpi-value">{pendingRequests}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Layout */}
                <div className="erp-inventory-layout">
                    
                    {/* LEFT COLUMN: Data Table */}
                    <div className="erp-main-column">
                        {criticalItem && (
                            <div className="erp-low-stock-alert">
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <AlertOctagon size={24} color="#e11d48" />
                                    <div>
                                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#9f1239' }}>⚠ Low Stock Alert</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#be123c' }}>
                                            <strong>{criticalItem.material?.name}</strong> is critically low. Available: <strong>{criticalItem.material?.quantity || 0}</strong> (Minimum: {criticalItem.material?.lowStockThreshold || 10})
                                        </p>
                                    </div>
                                </div>
                                <button className="rd-btn primary" onClick={() => setShowModal(true)} style={{ background: '#e11d48', border: 'none', padding: '8px 16px', fontWeight: 600 }}>
                                    Request Restock
                                </button>
                            </div>
                        )}

                        <div className="rd-panel" style={{ border: 'none', boxShadow: '0 4px 12px rgba(15,23,42,0.03)', background: '#ffffff', borderRadius: '16px' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Assigned Materials List</h2>
                            </div>
                            
                            {totalAssigned === 0 && !loading ? (
                                <div className="erp-empty-state">
                                    <div style={{ background: '#f1f5f9', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                        <Box size={40} color="#94a3b8" />
                                    </div>
                                    <h3>No Assigned Materials</h3>
                                    <p>No inventory is currently assigned to you. You can request new materials to get started.</p>
                                    <button className="rd-btn primary" onClick={() => setShowModal(true)} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 24px', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 600 }}>
                                        <Plus size={18} /> Request Material
                                    </button>
                                </div>
                            ) : (
                                <DataTable 
                                    columns={getRenderColumns()} 
                                    data={assignedData} 
                                    loading={loading}
                                    searchPlaceholder="Search materials, category..."
                                    searchKeys={['material.name', 'material.category']}
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar Overview */}
                    <div className="erp-side-column">
                        <div className="erp-sidebar-card">
                            <h3>Inventory Overview</h3>
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
                                    <span className="erp-overview-label">Total Assigned</span>
                                    <span className="erp-overview-value" style={{ color: '#4f46e5' }}>{totalAssigned} Items</span>
                                </div>
                                <div className="erp-overview-item">
                                    <span className="erp-overview-label">Low Stock</span>
                                    <span className="erp-overview-value" style={{ color: lowStockItems > 0 ? '#e11d48' : '#10b981' }}>{lowStockItems} Items</span>
                                </div>
                            </div>
                        </div>

                        <div className="erp-sidebar-card">
                            <h3>Quick Actions</h3>
                            <div className="erp-action-grid">
                                <button className="erp-action-btn primary" onClick={() => setShowModal(true)}>
                                    <Plus size={16} /> Request Material
                                </button>
                                <button className="erp-action-btn">
                                    <AlertCircle size={16} /> Report Low Stock
                                </button>
                                <button className="erp-action-btn" onClick={fetchData}>
                                    <RefreshCw size={16} /> Refresh Inventory
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
                                <div className="erp-timeline-item">
                                    <div className="erp-timeline-icon" style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}><Package size={12} /></div>
                                    <div>
                                        <div className="erp-timeline-content">New material assigned: Safety Gear</div>
                                        <div className="erp-timeline-time">Last week</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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

                <div className="rd-panel" style={{ border: 'none', boxShadow: '0 4px 12px rgba(15,23,42,0.03)', background: '#ffffff', borderRadius: '16px' }}>
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
            {pageMode === 'inventory' ? (
                <div className="rd-content" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {renderInventoryWorkspace()}
                </div>
            ) : pageMode === 'stock' ? (
                <div className="rd-content" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {renderStockWorkspace()}
                </div>
            ) : (
                <div className="rd-content" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="rd-module-header">
                        <div className="rd-module-info">
                            <div className="rd-module-title-row">
                                <span className="rd-module-title">{pageTitle}</span>
                                <span className="rd-module-badge">{pageBadge}</span>
                            </div>
                        </div>
                    </div>

                    <div className="rd-section" style={{ marginTop: '24px' }}>
                        <DataTable 
                            title={getTableTitle()}
                            subtitle={pageMode === 'stock' ? 'View and manage material stock' : 'Track the status of your material requests'}
                            columns={getRenderColumns()} 
                            data={getRenderData()} 
                            loading={loading}
                            searchPlaceholder="Search..."
                            searchKeys={pageMode === 'stock' ? ['name', 'sku', 'category'] : ['material.name', 'status', 'reason']}
                            primaryAction={pageMode !== 'stock' ? {
                                label: 'New Request',
                                icon: Plus,
                                onClick: () => setShowModal(true)
                            } : undefined}
                        />
                    </div>
                </div>
            )}

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
                                backgroundColor: '#fff', borderRadius: '24px', padding: '32px',
                                width: '100%', maxWidth: '600px', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                                <div style={{ width: 48, height: 48, background: '#eef2ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                            style={{ height: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
                                        >
                                            <option value="">Select a material</option>
                                            {materialsList.map(m => (
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
                                            style={{ height: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
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
                                            style={{ height: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
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
                                            style={{ height: '48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '0 16px', fontSize: '14px' }}
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
                                        style={{ borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', padding: '16px', fontSize: '14px', resize: 'vertical', minHeight: '100px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <button type="button" className="rd-btn secondary" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 600 }}>Cancel</button>
                                    <button type="submit" className="rd-btn primary" disabled={submitting} style={{ padding: '12px 24px', borderRadius: '10px', fontWeight: 600, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none' }}>
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
