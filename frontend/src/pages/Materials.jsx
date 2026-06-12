import React, { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
    Plus, Search, Filter, Edit2, Trash2, Box, Package,
    TrendingUp, AlertTriangle, ChevronRight, QrCode, Camera, History, Download, X, Send
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const MaterialTracking = () => {
    const { user } = useContext(AuthContext);
    const { fetchNotifications } = useContext(NotificationContext);
    const userRole = user?.role ? user.role.toLowerCase() : '';
    const isEmployee = userRole === 'employee';

    const navigate = useNavigate();
    const location = useLocation();
    const [materials, setMaterials] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [materialStats, setMaterialStats] = useState({ totalMaterialTypes: 0, totalStockQuantity: 0, lowStockCount: 0, inTransitCount: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', quantity: 0,
        lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: ''
    });

    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestFormData, setRequestFormData] = useState({ materialId: '', materialName: '', currentStock: 0, requiredQuantity: 1, reason: '' });

    const [catFilter, setCatFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    // QR & Barcode Simulator States
    const [showScanner, setShowScanner] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [selectedMaterialForCode, setSelectedMaterialForCode] = useState(null);
    const [scanSKU, setScanSKU] = useState('');

    // Movement History States
    const [showMovementModal, setShowMovementModal] = useState(false);
    const [movementHistory, setMovementHistory] = useState([]);
    const [movementMaterial, setMovementMaterial] = useState(null);
    const [loadingMovements, setLoadingMovements] = useState(false);

    // Toast States
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    // Deletion / Archiving States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deleteDependencies, setDeleteDependencies] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const showToast = (message, type = 'error') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(''), 5000);
    };

    const fetchMaterialsAndStats = async () => {
        try {
            const [materialsRes, statsRes, vendorsRes] = await Promise.all([
                API.get('/materials'),
                API.get('/dashboard/stats'),
                API.get('/vendors')
            ]);
            setMaterials(materialsRes.data);
            setVendors(vendorsRes.data);
            if (statsRes.data && statsRes.data.materialStats) {
                setMaterialStats(statsRes.data.materialStats);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterialsAndStats();
        if (location.state?.openModal) {
            setShowModal(true);
            window.history.replaceState({}, document.title);
        }
    }, []);

    const handleEditClick = (item) => {
        setEditId(item._id);
        setShowNewCategoryInput(false);
        setFormData({
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            lowStockThreshold: item.lowStockThreshold,
            unit: item.unit,
            price: item.price,
            vendorId: item.vendor?._id || item.vendor?.id || ''
        });
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            quantity: Number(formData.quantity),
            lowStockThreshold: Number(formData.lowStockThreshold),
            price: Number(formData.price)
        };
        try {
            if (editId) {
                await API.put(`/materials/${editId}`, submissionData);
            } else {
                await API.post('/materials', submissionData);
            }
            setShowModal(false);
            setEditId(null);
            setShowNewCategoryInput(false);
            setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: '' });
            fetchMaterialsAndStats();
            if (fetchNotifications) fetchNotifications();
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing material');
        }
    };

    const handleRequestStockClick = (item) => {
        setRequestFormData({
            materialId: item._id,
            materialName: item.name,
            currentStock: item.quantity,
            requiredQuantity: 1,
            reason: ''
        });
        setShowRequestModal(true);
    };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/stock-requests', {
                materialId: requestFormData.materialId,
                requiredQuantity: Number(requestFormData.requiredQuantity),
                reason: requestFormData.reason
            });
            setShowRequestModal(false);
            showToast('Stock request sent to Manager successfully!', 'success');
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error sending stock request';
            showToast(errorMessage, 'error');
            console.error('Request submission error:', error.response?.data);
        }
    };

    const handleDeleteClick = (material) => {
        setDeleteCandidate(material);
        setDeleteDependencies(null);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await API.delete(`/materials/${deleteCandidate._id}`);
            fetchMaterialsAndStats();
            showToast('Material permanently deleted.', 'success');
            setShowDeleteModal(false);
            setDeleteCandidate(null);
        } catch (error) {
            if (error.response?.status === 409 && error.response.data?.dependencies) {
                setDeleteDependencies(error.response.data.dependencies);
            } else {
                showToast(error.response?.data?.message || 'Error deleting material', 'error');
                setShowDeleteModal(false);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleArchive = async () => {
        setIsDeleting(true);
        try {
            await API.put(`/materials/${deleteCandidate._id}/archive`);
            fetchMaterialsAndStats();
            showToast('Material archived safely.', 'success');
            setShowDeleteModal(false);
            setDeleteCandidate(null);
            setDeleteDependencies(null);
        } catch (error) {
            showToast(error.response?.data?.message || 'Error archiving material', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // Simulated scanner logic: Increments stock level in backend database by 10 units!
    const handleSimulateScan = async () => {
        if (!scanSKU) {
            alert('Please select a material SKU to simulate scanning.');
            return;
        }

        const mat = materials.find(m => m.sku === scanSKU);
        if (!mat) return;

        try {
            const updatedQty = mat.quantity + 10;
            await API.put(`/materials/${mat._id}`, {
                ...mat,
                quantity: updatedQty
            });
            alert(`Scan Successful!\nSKU: ${mat.sku} (${mat.name})\nStock replenished (+10 ${mat.unit || 'pcs'}) from supplier: ${mat.vendor?.name || 'Internal/Unknown'}.`);
            setShowScanner(false);
            fetchMaterialsAndStats();
            if (fetchNotifications) fetchNotifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating stock from scan');
        }
    };

    // Movement History
    const openMovementHistory = async (material) => {
        setMovementMaterial(material);
        setShowMovementModal(true);
        setLoadingMovements(true);
        try {
            const { data } = await API.get(`/materials/${material._id}/movements`);
            setMovementHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setMovementHistory([]);
        } finally {
            setLoadingMovements(false);
        }
    };

    // Export functions
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Material Inventory Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        const tableData = filteredMaterials.map(m => [
            m.sku, m.name, m.category, m.quantity + ' ' + (m.unit || ''), m.status || 'In Stock', '₹' + m.price
        ]);
        doc.autoTable({
            head: [['SKU', 'Name', 'Category', 'Stock', 'Status', 'Price']],
            body: tableData,
            startY: 36,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save('materials_report.pdf');
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Materials');
        sheet.columns = [
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Category', key: 'category', width: 18 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Price', key: 'price', width: 12 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Vendor', key: 'vendor', width: 25 },
        ];
        filteredMaterials.forEach(m => {
            sheet.addRow({ sku: m.sku, name: m.name, category: m.category, quantity: m.quantity, unit: m.unit, price: m.price, status: m.status || 'In Stock', vendor: m.vendor?.name || '' });
        });
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'materials_report.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (m.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCat = catFilter === 'All' || m.category === catFilter;
        return matchesSearch && matchesCat;
    });

    const defaultCategories = [
        'Chemicals', 'Consumables', 'Construction', 'Electrical',
        'Electronics', 'Metals', 'Plastics', 'Plumbing',
        'Raw Material', 'Sheet Metal', 'Structural Steel'
    ];

    const availableCategories = Array.from(new Set([
        ...defaultCategories,
        ...materials.map(m => m.category).filter(Boolean)
    ])).sort();

    return (
        <div className="materials-workspace">
            {/* Breadcrumb Header */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">Material Tracking</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title">Material Tracking</h1>
                    <p className="header-subtitle">Monitor stock, in-transit items, low stock alerts, and barcode/QR movements.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToPDF}><Download size={16} /> PDF</button>
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToExcel}><Download size={16} /> Excel</button>
                    <button className="btn-secondary-light flex-center gap-8" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="btn-secondary-light flex-center gap-8 text-indigo" onClick={() => { if (materials.length > 0) setScanSKU(materials[0].sku); setShowScanner(true); }}>
                        <Camera size={16} /> Scan Item
                    </button>
                    <button className="btn-primary-blue flex-center gap-8" onClick={() => { setEditId(null); setShowNewCategoryInput(false); setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: '' }); setShowModal(true); }}>
                        <Plus size={16} /> Add Material
                    </button>
                </div>
            </header>

            {/* Metric Summary Cards */}
            <section className="mat-metrics-grid">
                <div className="mat-metric-card">
                    <span className="mat-metric-label">Total Material Types</span>
                    <span className="mat-metric-val">{materialStats.totalMaterialTypes.toLocaleString()}</span>
                </div>
                <div className="mat-metric-card">
                    <span className="mat-metric-label">Total Stock Quantity</span>
                    <span className="mat-metric-val">{materialStats.totalStockQuantity.toLocaleString()}</span>
                </div>
                <div className="mat-metric-card">
                    <span className="mat-metric-label">In Transit</span>
                    <span className="mat-metric-val">{materialStats.inTransitCount}</span>
                </div>
                <div className="mat-metric-card border-red">
                    <span className="mat-metric-label text-red">Low Stock Items</span>
                    <span className="mat-metric-val text-red">{materialStats.lowStockCount}</span>
                </div>
            </section>

            {/* Filter group dropdown */}
            {showFilters && (
                <div className="filter-panel animate-slide-down">
                    <div className="filter-group">
                        <label>Category:</label>
                        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option value="All">All Categories</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Search group */}
            <div className="search-group-row">
                <div className="search-bar">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Main Materials Table */}
            <div className="table-card">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Material Name</th>
                            <th>Category</th>
                            <th>Vendor/Supplier</th>
                            <th>Stock Level</th>
                            <th>Status</th>
                            <th>Unit Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMaterials.map((item) => (
                            <tr key={item._id}>
                                <td><code className="sku-code">{item.sku}</code></td>
                                <td className="mat-name-cell">{item.name}</td>
                                <td>{item.category}</td>
                                <td>{item.vendor?.name || '-'}</td>
                                <td><strong>{item.quantity}</strong> {item.unit}</td>
                                <td>
                                    <span className={`status-badge-premium ${item.quantity === 0
                                            ? 'out'
                                            : item.quantity <= item.lowStockThreshold
                                                ? 'low'
                                                : 'ok'
                                        }`}>
                                        {item.quantity === 0
                                            ? 'Out of Stock'
                                            : item.quantity <= item.lowStockThreshold
                                                ? 'Low Stock'
                                                : 'In Stock'
                                        }
                                    </span>
                                </td>
                                <td>${item.price}</td>
                                <td>
                                    <div className="actions-flex">
                                        <button className="action-btn code" title="Barcode & QR Code" onClick={() => { setSelectedMaterialForCode(item); setShowGenerator(true); }}><QrCode size={14} /></button>
                                        <button className="action-btn" title="Movement History" onClick={() => openMovementHistory(item)}><History size={14} /></button>
                                        {(item.quantity <= item.lowStockThreshold) && (
                                            <button className="action-btn text-indigo" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }} title="Request Stock" onClick={() => handleRequestStockClick(item)}><Send size={14} /></button>
                                        )}
                                        <button className="action-btn edit" title="Edit Item" onClick={() => handleEditClick(item)}><Edit2 size={14} /></button>
                                        {!isEmployee && (
                                            <button className="action-btn delete" title="Delete Item" onClick={() => handleDeleteClick(item)}><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMaterials.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>No materials found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Material Record' : 'Add New Material'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Material Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Aluminum 7075" />
                                </div>
                                <div className="form-group">
                                    <label>SKU (Stock Keeping Unit)</label>
                                    <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. AL-7075-B" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    {!showNewCategoryInput ? (
                                        <select
                                            value={formData.category}
                                            onChange={e => {
                                                if (e.target.value === '__add_new__') {
                                                    setShowNewCategoryInput(true);
                                                    setFormData({ ...formData, category: '' });
                                                } else {
                                                    setFormData({ ...formData, category: e.target.value });
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {availableCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__add_new__" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ Add New Category...</option>
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                required
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                placeholder="Enter new category name"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategoryInput(false);
                                                    setFormData({ ...formData, category: '' });
                                                }}
                                                className="btn-cancel"
                                                style={{ padding: '0 12px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Unit (kg, pcs, liters)</label>
                                    <input type="text" required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Unit Price ($)</label>
                                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Vendor/Supplier</label>
                                    <select value={formData.vendorId} onChange={e => setFormData({ ...formData, vendorId: e.target.value })}>
                                        <option value="">No Supplier Assigned</option>
                                        {vendors.map(v => (
                                            <option key={v.id || v._id} value={v.id || v._id}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Low Stock Alert Threshold</label>
                                    <input type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Request Stock Modal */}
            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Request Stock Replenishment</h2>
                            <button className="close-btn" onClick={() => setShowRequestModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleRequestSubmit} className="modal-form">
                            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="form-group">
                                    <label>Material</label>
                                    <input type="text" disabled value={`${requestFormData.materialName} (Current Stock: ${requestFormData.currentStock})`} />
                                </div>
                                <div className="form-group">
                                    <label>Required Quantity</label>
                                    <input type="number" min="1" required value={requestFormData.requiredQuantity} onChange={e => setRequestFormData({ ...requestFormData, requiredQuantity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Reason / Message</label>
                                    <textarea required rows="3" placeholder="e.g., Required for upcoming order..." value={requestFormData.reason} onChange={e => setRequestFormData({ ...requestFormData, reason: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowRequestModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary-blue"><Send size={14} /> Send Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR/Barcode Generator Modal */}
            {showGenerator && selectedMaterialForCode && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h2>Material Barcode & QR Code</h2>
                            <button className="close-btn" onClick={() => setShowGenerator(false)}>✕</button>
                        </div>
                        <div className="code-generator-body" style={{ padding: '15px 0' }}>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{selectedMaterialForCode.name}</h3>
                            <span className="sku-code" style={{ display: 'inline-block', marginBottom: '20px' }}>{selectedMaterialForCode.sku}</span>

                            {/* Simulated 1D Barcode */}
                            <div className="barcode-simulation" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', height: '60px', width: '180px', background: '#000000', padding: '2px', gap: '3px' }}>
                                    <div style={{ flex: 2, background: '#ffffff' }}></div>
                                    <div style={{ flex: 1, background: '#000000' }}></div>
                                    <div style={{ flex: 3, background: '#ffffff' }}></div>
                                    <div style={{ flex: 1, background: '#000000' }}></div>
                                    <div style={{ flex: 2, background: '#ffffff' }}></div>
                                    <div style={{ flex: 4, background: '#000000' }}></div>
                                    <div style={{ flex: 1, background: '#ffffff' }}></div>
                                    <div style={{ flex: 2, background: '#000000' }}></div>
                                    <div style={{ flex: 3, background: '#ffffff' }}></div>
                                    <div style={{ flex: 2, background: '#000000' }}></div>
                                    <div style={{ flex: 1, background: '#ffffff' }}></div>
                                    <div style={{ flex: 4, background: '#000000' }}></div>
                                </div>
                                <span style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: '8px', color: '#64748b', fontWeight: 'bold', letterSpacing: '2px' }}>*{selectedMaterialForCode.sku}*</span>
                            </div>

                            {/* Simulated 2D QR Code */}
                            <div className="qr-simulation" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{ position: 'relative', width: '130px', height: '130px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                    {/* Corner anchors */}
                                    <div style={{ gridColumn: '1/3', gridRow: '1/3', background: '#0f172a', border: '2px solid #ffffff' }}></div>
                                    <div style={{ gridColumn: '6/8', gridRow: '1/3', background: '#0f172a', border: '2px solid #ffffff' }}></div>
                                    <div style={{ gridColumn: '1/3', gridRow: '6/8', background: '#0f172a', border: '2px solid #ffffff' }}></div>
                                    {/* Random dots */}
                                    <div style={{ background: '#0f172a' }}></div><div style={{ background: '#ffffff' }}></div>
                                    <div style={{ background: '#0f172a' }}></div><div style={{ background: '#0f172a' }}></div>
                                    <div style={{ background: '#ffffff' }}></div><div style={{ background: '#0f172a' }}></div>
                                    <div style={{ background: '#0f172a' }}></div><div style={{ background: '#ffffff' }}></div>
                                    <div style={{ background: '#0f172a' }}></div><div style={{ background: '#0f172a' }}></div>
                                </div>
                                <span style={{ fontSize: '11px', marginTop: '8px', color: '#64748b', fontWeight: 'bold' }}>Scan for Inventory Access</span>
                            </div>

                            <button type="button" className="btn-save" style={{ width: '100%' }} onClick={() => { alert('Simulated Code Download Successful!'); setShowGenerator(false); }}>Download Tag</button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR/Barcode Scanner Simulator Modal */}
            {showScanner && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '450px' }}>
                        <div className="modal-header">
                            <h2>Simulated Item Scanner</h2>
                            <button className="close-btn" onClick={() => setShowScanner(false)}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Scanning Screen Container */}
                            <div className="scanner-screen" style={{ position: 'relative', height: '220px', background: '#0f172a', borderRadius: '12px', border: '2px solid #6366f1', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                                <div style={{ border: '2px dashed rgba(255,255,255,0.4)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
                                    <Camera size={44} className="text-indigo" style={{ marginBottom: '8px', opacity: 0.8 }} />
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1' }}>ALIGN BARCODE / QR IN CENTER</span>
                                </div>

                                {/* Animated scanline */}
                                <div className="scanline" style={{ position: 'absolute', left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, transparent, #ef4444, transparent)', boxShadow: '0 0 12px #ef4444' }}></div>
                            </div>

                            <div className="form-group">
                                <label>Select SKU to Scan</label>
                                <select value={scanSKU} onChange={e => setScanSKU(e.target.value)}>
                                    {materials.map(m => (
                                        <option key={m._id} value={m.sku}>{m.sku} - {m.name} ({m.quantity} {m.unit || 'pcs'} in stock)</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                                💡 <strong>Replenishment Simulation:</strong> Scanning an item simulates a physical barcode reading at the warehouse entry gate, immediately adding <strong>10 units</strong> to stock.
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowScanner(false)}>Cancel</button>
                                <button type="button" className="btn-save flex-center gap-8" style={{ background: '#6366f1' }} onClick={handleSimulateScan}>
                                    <Camera size={14} /> Simulate Scan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete/Archive Confirmation Modal */}
            {showDeleteModal && deleteCandidate && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '450px' }}>
                        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: deleteDependencies ? 'var(--warning)' : 'var(--danger)' }}>
                                <AlertTriangle size={24} />
                                {deleteDependencies ? 'Cannot Delete Material' : 'Confirm Deletion'}
                            </h2>
                            <button className="close-btn" onClick={() => { setShowDeleteModal(false); setDeleteDependencies(null); }}>✕</button>
                        </div>
                        <div style={{ padding: '20px 0' }}>
                            <p style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-secondary)' }}>
                                {deleteDependencies ? (
                                    <>
                                        This material <strong>({deleteCandidate.name})</strong> is linked to existing records and cannot be permanently deleted.
                                    </>
                                ) : (
                                    <>
                                        Are you sure you want to permanently delete <strong>{deleteCandidate.name}</strong>? This action cannot be undone.
                                    </>
                                )}
                            </p>

                            {deleteDependencies && (
                                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#b45309', fontSize: '14px' }}>Dependencies found:</h4>
                                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', fontSize: '13px' }}>
                                        {deleteDependencies.movementsCount > 0 && (
                                            <li><strong>{deleteDependencies.movementsCount}</strong> stock movement(s)</li>
                                        )}
                                        {deleteDependencies.orderNumbers && deleteDependencies.orderNumbers.length > 0 && (
                                            <li>Linked to Orders: <strong>{deleteDependencies.orderNumbers.join(', ')}</strong></li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {deleteDependencies && (
                                <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-primary)' }}>
                                    You can <strong>Archive</strong> this material instead. It will be hidden from the active list but historical data will remain intact.
                                </p>
                            )}
                        </div>
                        <div className="modal-actions" style={{ marginTop: '0' }}>
                            <button type="button" className="btn-cancel" onClick={() => { setShowDeleteModal(false); setDeleteDependencies(null); }} disabled={isDeleting}>Cancel</button>
                            {deleteDependencies ? (
                                <button type="button" className="btn-save" style={{ background: 'var(--warning)', color: '#000', border: 'none' }} onClick={handleArchive} disabled={isDeleting}>
                                    {isDeleting ? 'Archiving...' : 'Archive Instead'}
                                </button>
                            ) : (
                                <button type="button" className="btn-save" style={{ background: 'var(--danger)', border: 'none' }} onClick={confirmDelete} disabled={isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Movement History Modal */}
            {showMovementModal && movementMaterial && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Movement History — {movementMaterial.name}</h2>
                            <button className="close-btn" onClick={() => setShowMovementModal(false)}>✕</button>
                        </div>
                        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>SKU: <code className="sku-code">{movementMaterial.sku}</code> · Current Stock: <strong>{movementMaterial.quantity} {movementMaterial.unit}</strong></div>
                        {loadingMovements ? (
                            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
                        ) : movementHistory.length === 0 ? (
                            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>No movement history recorded for this material yet.</div>
                        ) : (
                            <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="modern-table" style={{ fontSize: 13 }}>
                                    <thead><tr><th>Type</th><th>Qty</th><th>Before</th><th>After</th><th>Reason</th><th>By</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {movementHistory.map(mv => (
                                            <tr key={mv._id || mv.id}>
                                                <td><span className={`status-badge-premium ${mv.type === 'In' ? 'ok' : mv.type === 'Out' ? 'out' : 'low'}`}>{mv.type}</span></td>
                                                <td><strong>{mv.type === 'In' ? '+' : '-'}{mv.quantity}</strong></td>
                                                <td>{mv.previousQuantity ?? '—'}</td>
                                                <td>{mv.newQuantity ?? '—'}</td>
                                                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mv.reason || '—'}</td>
                                                <td>{mv.performedBy?.name || 'System'}</td>
                                                <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{mv.createdAt ? new Date(mv.createdAt).toLocaleDateString() : '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className={`toast-notification ${toastType}`}>
                    {toastType === 'error' ? <AlertTriangle size={18} /> : null}
                    <span>{toastMessage}</span>
                    <button className="toast-close" onClick={() => setToastMessage('')}><X size={14} /></button>
                </div>
            )}

            <style jsx="true">{`
                .materials-workspace {
                    padding: 24px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                
                .crumb { cursor: pointer; transition: color 0.2s; }
                .crumb:hover { color: var(--primary); }
                .crumb.active { color: var(--text-primary); cursor: default; }
                .separator { color: var(--text-muted); opacity: 0.5; }
                
                .module-header { display: flex; justify-content: space-between; align-items: center; }
                .header-title { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0; letter-spacing: -0.5px; }
                .header-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
                
                .header-actions { display: flex; gap: 12px; }
                .btn-primary-blue { background: var(--primary); color: #ffffff; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); display: inline-flex; align-items: center; cursor: pointer; border: none; transition: all 0.2s; }
                .btn-primary-blue:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
                .btn-secondary-light { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); padding: 10px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; cursor: pointer; transition: all 0.2s; }
                .btn-secondary-light:hover { background: var(--bg-hover); border-color: var(--border-hover); color: var(--text-primary); }

                .text-indigo { color: var(--primary) !important; }
                .action-btn.code:hover { background: var(--primary); color: #ffffff; border-color: var(--primary); }

                .mat-metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .mat-metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); padding: 24px; display: flex; flex-direction: column; gap: 8px; box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s; }
                .mat-metric-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
                .border-red { border-color: var(--danger-light); }
                .mat-metric-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                .mat-metric-val { font-size: 28px; font-weight: 800; color: var(--text-primary); }
                .text-red { color: var(--danger); }

                .search-group-row { display: flex; align-items: center; }
                .search-bar { position: relative; flex: 1; display: flex; align-items: center; }
                .search-icon { position: absolute; left: 16px; color: var(--text-muted); }
                .search-bar input { width: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md, 12px); padding: 12px 16px 12px 46px; color: var(--text-primary); font-size: 14px; box-shadow: var(--shadow-sm); transition: all 0.2s; outline: none; }
                .search-bar input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); }

                .filter-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md, 12px); padding: 16px 24px; box-shadow: var(--shadow-sm); margin-bottom: -4px; }
                .filter-group { display: flex; align-items: center; gap: 12px; }
                .filter-group label { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
                .filter-group select { background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: var(--text-primary); min-width: 180px; outline: none; font-size: 14px; cursor: pointer; transition: border-color 0.2s; }
                .filter-group select:focus { border-color: var(--primary); }

                .table-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); padding: 8px; box-shadow: var(--shadow-sm); overflow-x: auto; }
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { text-align: left; padding: 16px 20px; color: var(--text-muted); font-weight: 700; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid var(--bg-body); letter-spacing: 0.5px; }
                .modern-table td { padding: 16px 20px; border-bottom: 1px solid var(--bg-body); font-size: 14px; color: var(--text-primary); font-weight: 500; }
                .modern-table tbody tr { transition: background-color 0.2s; }
                .modern-table tbody tr:hover td { background-color: var(--bg-hover); }
                
                .sku-code { background: var(--primary-50); color: var(--primary); padding: 6px 10px; border-radius: 6px; font-family: monospace; font-weight: 700; border: 1px solid var(--primary-100); font-size: 13px; }
                .mat-name-cell { font-weight: 700; color: var(--text-primary); }
                
                .status-badge-premium { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
                .status-badge-premium.ok { background-color: var(--success-light); color: var(--success); }
                .status-badge-premium.low { background-color: var(--warning-light); color: var(--warning); }
                .status-badge-premium.out { background-color: var(--danger-light); color: var(--danger); }
                
                .actions-flex { display: flex; gap: 8px; }
                .action-btn { background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 8px; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .action-btn:hover { background: var(--primary); color: #ffffff; border-color: var(--primary); transform: translateY(-1px); }
                .action-btn.delete:hover { background: var(--danger); border-color: var(--danger); color: white; }
                
                .empty-state { padding: 48px; text-align: center; color: var(--text-muted); font-size: 15px; font-weight: 500; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); width: 100%; max-width: 600px; padding: 28px; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
                .modal-header h2 { font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
                
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
                .form-group input, .form-group select { background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; color: var(--text-primary); font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); }
                .full-width { grid-column: 1 / -1; }
                
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
                .btn-cancel { background: var(--bg-body); border: 1px solid var(--border); color: var(--text-secondary); padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
                .btn-cancel:hover { background: var(--bg-hover); border-color: var(--border-hover); color: var(--text-primary); }
                .btn-save { background: var(--primary); color: #ffffff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
                .btn-save:hover { background: #1d4ed8; transform: translateY(-1px); }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-8 { gap: 8px; }

                .scanline { position: absolute; left: 0; width: 100%; height: 4px; background: linear-gradient(to right, transparent, var(--danger), transparent); box-shadow: 0 0 12px var(--danger); animation: scan 2.5s linear infinite; }
                @keyframes scan { 0% { top: 0px; } 50% { top: 220px; } 100% { top: 0px; } }
                .animate-pop { animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-slide-down { animation: slideDown 0.2s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                
                .toast-notification { position: fixed; bottom: 24px; right: 24px; padding: 16px 20px; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: white; z-index: 9999; animation: slideUp 0.3s ease-out; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .toast-notification.error { background: var(--danger); }
                .toast-notification.success { background: var(--success); }
                .toast-close { background: none; border: none; color: white; cursor: pointer; opacity: 0.8; padding: 0; display: flex; }
                .toast-close:hover { opacity: 1; }
                @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                @media (max-width: 768px) {
                    .mat-metrics-grid { grid-template-columns: repeat(2, 1fr); }
                    .form-grid { grid-template-columns: 1fr; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .header-actions { width: 100%; flex-wrap: wrap; }
                    .header-actions button { flex: 1; min-width: 140px; }
                }
                
                @media (max-width: 480px) {
                    .mat-metrics-grid { grid-template-columns: 1fr; }
                    .header-actions button { min-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default MaterialTracking;
