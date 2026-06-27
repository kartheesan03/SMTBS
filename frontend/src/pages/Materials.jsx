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
            toast.error(error.response?.data?.message || 'Error processing material');
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
            toast.success('Please select a material SKU to simulate scanning.');
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
            toast.success(`Scan Successful!\nSKU: ${mat.sku} (${mat.name})\nStock replenished (+10 ${mat.unit || 'pcs'}) from supplier: ${mat.vendor?.name || 'Internal/Unknown'}.`);
            setShowScanner(false);
            fetchMaterialsAndStats();
            if (fetchNotifications) fetchNotifications();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating stock from scan');
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
        <div className="page-container">
            {/* Actions Section */}
            <div className="page-header">
                <div className="header-content">
                    <h1>Material Tracking</h1>
                    <p>Monitor stock, in-transit items, low stock alerts, and barcode/QR movements.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    <button className="btn-secondary" onClick={exportToPDF}><Download size={16} /> PDF</button>
                    <button className="btn-secondary" onClick={exportToExcel}><Download size={16} /> Excel</button>
                    <button className="btn-secondary" style={{color: 'var(--primary)', borderColor: 'var(--primary)'}} onClick={() => { if (materials.length > 0) setScanSKU(materials[0].sku); setShowScanner(true); }}>
                        <Camera size={16} /> Scan Item
                    </button>
                    <button className="btn-primary" onClick={() => { setEditId(null); setFormData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: '' }); setShowNewCategoryInput(false); setShowModal(true); }}>
                        <Plus size={16} /> Add Material
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="module-kpi-section">
                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Material Types</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                            <Box size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.totalMaterialTypes.toLocaleString()}</div>
                </div>

                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Stock Quantity</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.totalStockQuantity.toLocaleString()}</div>
                </div>

                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">In Transit</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(245,158,11,0.1)', color: '#F59E0B'}}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.inTransitCount}</div>
                </div>

                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Low Stock Items</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(239,68,68,0.1)', color: '#EF4444'}}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{materialStats.lowStockCount}</div>
                </div>
            </div>


            {/* Filters Section */}
            {showFilters && (
                <div className="page-header" style={{background: 'var(--bg-surface-hover)', padding: '16px', marginTop: '-12px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                    <div className="global-search" style={{width: '300px', background: 'var(--bg-body)'}}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by name or SKU..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', outline: 'none', color: 'var(--text-main)'}}
                        value={catFilter} 
                        onChange={e => setCatFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Data Table Section */}
            <div className="module-data-section">
                {loading ? (
                    <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>No materials found.</div>
                ) : (
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Material Name</th>
                                <th>Category</th>
                                <th>Vendor/Supplier</th>
                                <th>Stock Level</th>
                                <th>Status</th>
                                <th>Unit Price</th>
                                <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMaterials.map((item) => (
                                <tr key={item._id}>
                                    <td><code style={{background: 'var(--bg-hover)', padding: '4px 6px', borderRadius: '4px', fontSize: '12px'}}>{item.sku}</code></td>
                                    <td><strong>{item.name}</strong></td>
                                    <td>{item.category}</td>
                                    <td>{item.vendor?.name || '-'}</td>
                                    <td><strong>{item.quantity}</strong> {item.unit}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                            background: item.quantity === 0 ? 'rgba(239,68,68,0.1)' : item.quantity <= item.lowStockThreshold ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                                            color: item.quantity === 0 ? '#EF4444' : item.quantity <= item.lowStockThreshold ? '#F59E0B' : '#10B981'
                                        }}>
                                            {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td>${item.price}</td>
                                    <td style={{textAlign: 'right'}}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                            <button className="icon-btn" title="Barcode & QR Code" onClick={() => { setSelectedMaterialForCode(item); setShowGenerator(true); }}><QrCode size={14} /></button>
                                            <button className="icon-btn" title="Movement History" onClick={() => openMovementHistory(item)}><History size={14} /></button>
                                            {(item.quantity <= item.lowStockThreshold) && (
                                                <button className="icon-btn" title="Request Stock" onClick={() => handleRequestStockClick(item)}><Send size={14} /></button>
                                            )}
                                            <button className="icon-btn" title="Edit Item" onClick={() => handleEditClick(item)}><Edit2 size={14} /></button>
                                            {!isEmployee && (
                                                <button className="icon-btn" style={{color: 'var(--danger)'}} title="Delete Item" onClick={() => handleDeleteClick(item)}><Trash2 size={14} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                            <h2 style={{margin: 0}}>{editId ? 'Edit Material Record' : 'Add New Material'}</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleFormSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Material Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Aluminum 7075" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>SKU</label>
                                    <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. AL-7075-B" style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Category</label>
                                    {!showNewCategoryInput ? (
                                        <select value={formData.category} onChange={e => { if (e.target.value === '__add_new__') { setShowNewCategoryInput(true); setFormData({ ...formData, category: '' }); } else { setFormData({ ...formData, category: e.target.value }); } }} required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}>
                                            <option value="">Select Category</option>
                                            {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            <option value="__add_new__" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>+ Add New Category...</option>
                                        </select>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="text" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Enter new category" autoFocus style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                            <button type="button" onClick={() => { setShowNewCategoryInput(false); setFormData({ ...formData, category: '' }); }} className="btn-secondary" style={{ padding: '0 12px' }}>✕</button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Quantity</label>
                                    <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Unit (kg, pcs, liters)</label>
                                    <input type="text" required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Unit Price ($)</label>
                                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Vendor/Supplier</label>
                                    <select value={formData.vendorId} onChange={e => setFormData({ ...formData, vendorId: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}}>
                                        <option value="">No Supplier Assigned</option>
                                        {vendors.map(v => <option key={v.id || v._id} value={v.id || v._id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={{display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px'}}>Low Stock Alert Threshold</label>
                                    <input type="number" required value={formData.lowStockThreshold} onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none'}} />
                                </div>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)'}}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Record</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialTracking;
