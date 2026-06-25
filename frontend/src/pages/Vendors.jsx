import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import DataTable from '../components/Dashboard/DataTable';
import { Truck, Plus, Star, MapPin, Mail, Phone, ExternalLink, Download, Edit, X, PackagePlus, AlertTriangle, Trash2, History } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const Vendors = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [allMaterials, setAllMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Vendor Form Modals
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorOrders, setVendorOrders] = useState([]);
    const [vendorMaterials, setVendorMaterials] = useState([]);
    
    // Vendor Form Data
    const [formData, setFormData] = useState({
        name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', website: ''
    });
    
    // New Materials Logic (Used for Vendor Form)
    const [newMaterialsList, setNewMaterialsList] = useState([]);
    const [newMaterial, setNewMaterial] = useState({
        name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0
    });

    // Nested Material Modals for View Vendor Profile
    const [showNestedMaterialForm, setShowNestedMaterialForm] = useState(false);
    const [isNestedMaterialEdit, setIsNestedMaterialEdit] = useState(false);
    const [nestedMaterialFormData, setNestedMaterialFormData] = useState({
        id: null, name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0
    });
    const [showNestedMaterialView, setShowNestedMaterialView] = useState(false);
    const [nestedSelectedMaterial, setNestedSelectedMaterial] = useState(null);
    const [nestedMovementHistory, setNestedMovementHistory] = useState([]);
    const [loadingNestedMovements, setLoadingNestedMovements] = useState(false);

    const fetchVendors = async () => {
        try {
            const { data } = await API.get('/vendors');
            setVendors(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterials = async () => {
        try {
            const { data } = await API.get('/materials');
            setAllMaterials(data || []);
            
            // If view modal is open, refresh vendor materials
            if (showViewModal && selectedVendor) {
                const filteredMaterials = data.filter(m => 
                    String(m.vendorId) === String(selectedVendor.id || selectedVendor._id) || 
                    String(m.vendor?.id || m.vendor?._id || m.vendor) === String(selectedVendor.id || selectedVendor._id)
                );
                setVendorMaterials(filteredMaterials);
            }
        } catch (err) {
            console.error("Error fetching materials", err);
        }
    };

    useEffect(() => {
        fetchVendors();
        fetchMaterials();
    }, []);

    const handleViewVendor = async (vendor) => {
        setSelectedVendor(vendor);
        setShowViewModal(true);
        setVendorOrders([]);
        setVendorMaterials([]);
        try {
            const vId = String(vendor.id || vendor._id);
            const { data: orders } = await API.get('/orders');
            
            const filteredOrders = orders.filter(o => String(o.vendorId) === vId || String(o.vendor?.id || o.vendor?._id || o.vendor) === vId);
            setVendorOrders(filteredOrders);
            
            // Match Vendor Directory logic exactly
            const vMaterials = allMaterials.filter(m => String(m.vendorId) === vId || String(m.vendor?.id || m.vendor?._id || m.vendor) === vId);
            setVendorMaterials(vMaterials);
            
        } catch (err) {
            console.error("Error fetching vendor data", err);
        }
    };

    // VENDOR CRUD
    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', website: '' });
        setNewMaterialsList([]);
        setNewMaterial({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0 });
        setVendorMaterials([]);
        setShowModal(true);
    };

    const openEditModal = (vendor) => {
        setIsEditMode(true);
        setSelectedVendor(vendor);
        setFormData({
            name: vendor.name || '',
            category: vendor.category || '',
            contactPerson: vendor.contactPerson || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || '',
            gstNumber: vendor.gstNumber || '',
            website: vendor.website || ''
        });
        
        const existingMaterials = allMaterials.filter(m => 
            String(m.vendorId) === String(vendor.id || vendor._id) || 
            String(m.vendor?.id || m.vendor?._id || m.vendor) === String(vendor.id || vendor._id)
        );
        setVendorMaterials(existingMaterials);
        
        setNewMaterialsList([]);
        setNewMaterial({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0 });
        setShowModal(true);
    };

    const handleAddNewMaterialToList = () => {
        if (!newMaterial.name || !newMaterial.sku) {
            alert("Material Name and SKU are required!");
            return;
        }
        if (allMaterials.some(m => m.sku === newMaterial.sku) || newMaterialsList.some(m => m.sku === newMaterial.sku)) {
            alert("SKU already exists! Please use a unique SKU.");
            return;
        }
        setNewMaterialsList([...newMaterialsList, { ...newMaterial }]);
        setNewMaterial({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0 });
    };

    const removeNewMaterialFromList = (index) => {
        const list = [...newMaterialsList];
        list.splice(index, 1);
        setNewMaterialsList(list);
    };

    const handleSaveVendor = async (e) => {
        e.preventDefault();
        try {
            let finalVendorId = null;
            if (isEditMode && selectedVendor) {
                finalVendorId = selectedVendor._id || selectedVendor.id;
                await API.put(`/vendors/${finalVendorId}`, formData);
            } else {
                const { data: createdVendor } = await API.post('/vendors', formData);
                finalVendorId = createdVendor._id || createdVendor.id;
            }

            if (newMaterialsList.length > 0 && finalVendorId) {
                const materialPromises = newMaterialsList.map(mat => 
                    API.post('/materials', { ...mat, vendorId: finalVendorId })
                );
                await Promise.all(materialPromises);
            }

            setShowModal(false);
            fetchVendors();
            fetchMaterials();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving vendor or materials');
        }
    };

    const handleDeleteVendor = async (vendor) => {
        if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
            try {
                await API.delete(`/vendors/${vendor._id || vendor.id}`);
                alert('Vendor deleted successfully.');
                fetchVendors();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting vendor');
            }
        }
    };

    // NESTED MATERIAL CRUD (Inside View Modal)
    const openNestedMaterialAdd = () => {
        setIsNestedMaterialEdit(false);
        setNestedMaterialFormData({
            id: null, name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0
        });
        setShowNestedMaterialForm(true);
    };

    const openNestedMaterialEdit = (mat) => {
        setIsNestedMaterialEdit(true);
        setNestedMaterialFormData({
            id: mat._id || mat.id,
            name: mat.name,
            sku: mat.sku,
            category: mat.category || '',
            quantity: mat.quantity,
            unit: mat.unit || 'pcs',
            price: mat.price || 0
        });
        setShowNestedMaterialForm(true);
    };

    const handleNestedMaterialSave = async (e) => {
        e.preventDefault();
        try {
            const vId = selectedVendor._id || selectedVendor.id;
            const payload = { ...nestedMaterialFormData, vendorId: vId };
            
            if (isNestedMaterialEdit) {
                await API.put(`/materials/${nestedMaterialFormData.id}`, payload);
            } else {
                await API.post('/materials', payload);
            }
            setShowNestedMaterialForm(false);
            fetchMaterials(); // Global fetch will also update the view modal's materials automatically via useEffect/view logic.
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving material');
        }
    };

    const handleNestedMaterialArchive = async (mat) => {
        if (!window.confirm(`Are you sure you want to archive ${mat.name}? It will be hidden from the active list but historical data will remain intact.`)) return;
        try {
            await API.put(`/materials/${mat._id || mat.id}/archive`);
            fetchMaterials();
        } catch (error) {
            alert(error.response?.data?.message || 'Error archiving material');
        }
    };

    const openNestedMaterialView = async (mat) => {
        setNestedSelectedMaterial(mat);
        setShowNestedMaterialView(true);
        setLoadingNestedMovements(true);
        try {
            const { data } = await API.get(`/materials/${mat._id || mat.id}/movements`);
            setNestedMovementHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setNestedMovementHistory([]);
        } finally {
            setLoadingNestedMovements(false);
        }
    };

    // Exports
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Vendor Network', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        const tableData = vendors.map(v => [
            v.name, v.category, v.status || 'Vendor Created', v.contactPerson || 'N/A', v.phone || 'N/A', v.email || 'N/A'
        ]);
        doc.autoTable({
            head: [['Vendor Name', 'Category', 'Status', 'Contact Person', 'Phone', 'Email']],
            body: tableData,
            startY: 36,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save('vendors_report.pdf');
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Vendors');
        sheet.columns = [
            { header: 'Vendor Name', key: 'name', width: 25 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Contact Person', key: 'contactPerson', width: 20 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Address', key: 'address', width: 35 }
        ];
        vendors.forEach(v => {
            sheet.addRow({
                name: v.name,
                category: v.category,
                status: v.status || 'Vendor Created',
                contactPerson: v.contactPerson || '',
                phone: v.phone || '',
                email: v.email || '',
                address: v.address || ''
            });
        });
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'vendors_report.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    // Vendor Mini-Dashboard Stats
    const linkedMaterials = selectedVendor ? allMaterials.filter((m) => {
        const mVendorIdStr = String(m.vendorId || (m.vendor && (m.vendor.id || m.vendor._id)) || '');
        const sVendorIdStr = String(selectedVendor.id || selectedVendor._id || '');
        
        return mVendorIdStr === sVendorIdStr ||
               m.vendorName === selectedVendor.name ||
               m.supplierName === selectedVendor.name ||
               (m.vendor && m.vendor.name === selectedVendor.name);
    }) : [];

    const totalVendorMaterials = linkedMaterials.length;
    const totalVendorStock = linkedMaterials.reduce((sum, m) => sum + (Number(m.stockQty || m.quantity || m.stock || 0)), 0);
    const totalVendorValue = linkedMaterials.reduce((sum, m) => sum + (Number(m.stockQty || m.quantity || m.stock || 0) * Number(m.price || m.unitPrice || 0)), 0);

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Vendors Directory</h1>
                    <p className="page-subtitle">Manage supplier profiles, contact details, and procurement links.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToPDF}><Download size={16} /> PDF</button>
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToExcel}><Download size={16} /> Excel</button>
                    <button className="btn-primary flex-center gap-8" onClick={() => navigate('/vendors/add-vendor')}>
                        <Plus size={18} /> Add New Vendor
                    </button>
                </div>
            </header>

            {/* VENDOR CREATION & EDIT MODAL */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop" style={{ maxWidth: '800px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Supplier' : 'Onboard New Supplier'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        
                        <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1 }}>
                            <form id="vendorForm" onSubmit={handleSaveVendor} className="modal-form">
                                <h3 className="section-title">Supplier Information</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Vendor Name</label>
                                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Steel Supply Co" />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <input type="text" name="category" placeholder="Enter Category (e.g., Electronics, Logistics, Packaging)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Contact Person</label>
                                        <input type="text" required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Business Address</label>
                                        <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>GST / Tax Number (Optional)</label>
                                        <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} placeholder="e.g. 22AAAAA0000A1Z5" />
                                    </div>
                                    <div className="form-group">
                                        <label>Website (Optional)</label>
                                        <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://www.vendor.com" />
                                    </div>
                                </div>
                            </form>

                            {/* Existing Stock Display (Read Only) during Edit Mode */}
                            {isEditMode && (
                                <div className="material-creation-section" style={{ marginTop: '25px', borderColor: '#e2e8f0', background: '#ffffff' }}>
                                    <h3 className="section-title" style={{ marginTop: 0 }}>Existing Materials Supplied</h3>
                                    {vendorMaterials.length === 0 ? (
                                        <p className="text-muted" >No physical stock records linked yet.</p>
                                    ) : (
                                        <div className="table-responsive" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <table className="enterprise-table" >
                                                <thead>
                                                    <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                                        <th style={{ padding: '8px' }}>SKU</th>
                                                        <th style={{ padding: '8px' }}>Name</th>
                                                        <th style={{ padding: '8px' }}>Category</th>
                                                        <th style={{ padding: '8px' }}>Stock</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vendorMaterials.map(m => (
                                                        <tr key={m._id || m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '8px', fontWeight: 600 }}>{m.sku}</td>
                                                            <td style={{ padding: '8px' }}>{m.name}</td>
                                                            <td style={{ padding: '8px' }}>{m.category}</td>
                                                            <td style={{ padding: '8px' }}>{m.quantity} {m.unit}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* New Stock Creation Section */}
                            <div className="material-creation-section" style={{ marginTop: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 className="section-title" style={{ margin: 0 }}>
                                        <PackagePlus size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> 
                                        Add New Stock/Material
                                    </h3>
                                    <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>These items will be permanently linked to this vendor in the Inventory.</p>
                                </div>
                                
                                <div className="sub-form-row">
                                    <div className="form-group" style={{ flex: 2 }}>
                                        <label>Material Name</label>
                                        <input type="text" placeholder="e.g. Copper Wire" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>SKU</label>
                                        <input type="text" placeholder="SKU-100" value={newMaterial.sku} onChange={e => setNewMaterial({...newMaterial, sku: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1.5 }}>
                                        <label>Category</label>
                                        <input type="text" name="category" placeholder="Enter Category (e.g., Electronics, Logistics, Packaging)" value={newMaterial.category} onChange={e => setNewMaterial({...newMaterial, category: e.target.value})} />
                                    </div>
                                </div>
                                <div className="sub-form-row">
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Stock Qty</label>
                                        <input type="number" min="0" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: parseInt(e.target.value) || 0})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Unit</label>
                                        <input type="text" placeholder="pcs, kg, m" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Price</label>
                                        <input type="number" min="0" step="0.01" value={newMaterial.price} onChange={e => setNewMaterial({...newMaterial, price: parseFloat(e.target.value) || 0})} />
                                    </div>
                                    <div className="form-group" style={{ flex: '0 0 auto', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={handleAddNewMaterialToList} className="btn-secondary" style={{ padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600 }}>Add Item</button>
                                    </div>
                                </div>

                                {/* Pending New Materials Table */}
                                {newMaterialsList.length > 0 && (
                                    <div className="table-responsive" >
                                        <table className="enterprise-table" >
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #c7d2fe' }}>
                                                    <th style={{ padding: '8px' }}>SKU</th>
                                                    <th style={{ padding: '8px' }}>Name</th>
                                                    <th style={{ padding: '8px' }}>Category</th>
                                                    <th style={{ padding: '8px' }}>Stock</th>
                                                    <th style={{ padding: '8px' }}>Price</th>
                                                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {newMaterialsList.map((m, idx) => (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #c7d2fe' }}>
                                                        <td style={{ padding: '8px', fontWeight: 600 }}>{m.sku}</td>
                                                        <td style={{ padding: '8px' }}>{m.name}</td>
                                                        <td style={{ padding: '8px' }}>{m.category}</td>
                                                        <td style={{ padding: '8px' }}>{m.quantity} {m.unit}</td>
                                                        <td style={{ padding: '8px' }}>${m.price}</td>
                                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            <button type="button" onClick={() => removeNewMaterialFromList(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                            <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" form="vendorForm" className="btn-primary">Update Vendor & Items</button>
                        </div>
                    </div>
                </div>
            )}

            {/* VENDOR PROFILE DASHBOARD MODAL */}
            {showViewModal && selectedVendor && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop" style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header" style={{ paddingBottom: '10px' }}>
                            <div>
                                <h2 style={{ marginBottom: '4px' }}>Vendor Profile: {selectedVendor.name}</h2>
                                <span className={`status-badge-inline ${selectedVendor.status?.toLowerCase().replace(/ /g, '-') || 'vendor-created'}`}>{selectedVendor.status || 'Vendor Created'}</span>
                            </div>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>✕</button>
                        </div>
                        
                        <div style={{ overflowY: 'auto', paddingRight: '10px', flex: 1, paddingBottom: '20px' }}>
                            
                            {/* Summary Cards */}
                            <div className="vendor-summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px', marginTop: '10px' }}>
                                <div className="v-card" style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Materials</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>{totalVendorMaterials}</div>
                                </div>
                                <div className="v-card" style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Stock Qty</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>{totalVendorStock.toLocaleString()}</div>
                                </div>
                                <div className="v-card" style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Inventory Value</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>${totalVendorValue.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="vendor-detail-grid">
                                <div className="detail-section">
                                    <h3>Company Information</h3>
                                    <p><strong>Category:</strong> <span className="cat-tag">{selectedVendor.category}</span></p>
                                    <p><strong>Registered On:</strong> {new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                                </div>
                                
                                <div className="detail-section">
                                    <h3>Contact Details</h3>
                                    <p><strong>Contact Person:</strong> {selectedVendor.contactPerson || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedVendor.email || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedVendor.phone || 'N/A'}</p>
                                    <p><strong>GST Number:</strong> {selectedVendor.gstNumber || 'N/A'}</p>
                                    <p><strong>Website:</strong> {selectedVendor.website ? <a href={selectedVendor.website} target="_blank" rel="noreferrer">{selectedVendor.website}</a> : 'N/A'}</p>
                                </div>
                            </div>

                            {/* Linked Materials Table with Actions */}
                            <div className="vendor-orders-section" style={{ marginTop: '25px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-primary)' }}>Stock Linked Materials</h3>
                                    <button className="btn-primary flex-center gap-10" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={openNestedMaterialAdd}>
                                        <Plus size={14} /> Add New Stock
                                    </button>
                                </div>
                                
                                {linkedMaterials.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                        <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>No physical inventory is currently supplied by this vendor.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        <table className="enterprise-table" >
                                            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '10px' }}>SKU</th>
                                                    <th style={{ padding: '10px' }}>Material</th>
                                                    <th style={{ padding: '10px' }}>Category</th>
                                                    <th style={{ padding: '10px' }}>Stock</th>
                                                    <th style={{ padding: '10px' }}>Price</th>
                                                    <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {linkedMaterials.map(m => (
                                                    <tr key={m._id || m.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                                                        <td style={{ padding: '10px' }} onClick={() => openNestedMaterialView(m)}>{m.sku}</td>
                                                        <td style={{ padding: '10px', fontWeight: 600 }} onClick={() => openNestedMaterialView(m)}>{m.name}</td>
                                                        <td style={{ padding: '10px' }} onClick={() => openNestedMaterialView(m)}>{m.category}</td>
                                                        <td style={{ padding: '10px' }} onClick={() => openNestedMaterialView(m)}>
                                                            <span className={m.quantity === 0 ? 'text-danger' : m.quantity <= 10 ? 'text-warning' : ''}>
                                                                {m.quantity} {m.unit}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '10px' }} onClick={() => openNestedMaterialView(m)}>${m.price}</td>
                                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                                                                <button className="btn-icon view-btn" title="View Details" onClick={() => openNestedMaterialView(m)}><History size={15}/></button>
                                                                <button className="btn-icon view-btn" title="Edit Material" onClick={() => openNestedMaterialEdit(m)}><Edit size={15}/></button>
                                                                <button className="btn-icon delete-btn" title="Archive Material" onClick={() => handleNestedMaterialArchive(m)} style={{ padding: '6px', borderRadius: '6px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={15}/></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Linked Purchase Orders */}
                            <div className="vendor-orders-section" style={{ marginTop: '25px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: 'var(--text-primary)' }}>Linked Purchase Orders ({vendorOrders.length})</h3>
                                {vendorOrders.length === 0 ? (
                                    <p className="text-muted" >No purchase orders found for this vendor.</p>
                                ) : (
                                    <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <table className="enterprise-table" >
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                                                    <th style={{ padding: '10px' }}>Order No</th>
                                                    <th style={{ padding: '10px' }}>Amount</th>
                                                    <th style={{ padding: '10px' }}>Status</th>
                                                    <th style={{ padding: '10px' }}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vendorOrders.map(order => (
                                                    <tr key={order.id || order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '10px', fontWeight: 600 }}>{order.orderNumber}</td>
                                                        <td style={{ padding: '10px' }}>${(order.totalAmount || 0).toLocaleString()}</td>
                                                        <td style={{ padding: '10px' }}><span className="status-badge-inline">{order.status}</span></td>
                                                        <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-actions" style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid var(--border)' }}>
                            <button type="button" className="btn-cancel" onClick={() => setShowViewModal(false)}>Close Profile</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NESTED MODAL: Add/Edit Single Material */}
            {showNestedMaterialForm && (
                <div className="modal-overlay nested-modal" style={{ zIndex: 1200 }}>
                    <div className="glass-card modal-content animate-pop" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>{isNestedMaterialEdit ? 'Edit Stock Details' : 'Add New Stock'}</h2>
                            <button className="close-btn" onClick={() => setShowNestedMaterialForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleNestedMaterialSave} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Material Name</label>
                                    <input type="text" required value={nestedMaterialFormData.name} onChange={e => setNestedMaterialFormData({...nestedMaterialFormData, name: e.target.value})} placeholder="e.g. Copper Wire" />
                                </div>
                                <div className="form-group">
                                    <label>SKU</label>
                                    <input type="text" required value={nestedMaterialFormData.sku} onChange={e => setNestedMaterialFormData({...nestedMaterialFormData, sku: e.target.value})} placeholder="SKU-100" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" name="category" placeholder="Enter Category (e.g., Electronics, Logistics, Packaging)" value={nestedMaterialFormData.category} onChange={e => setNestedMaterialFormData({...nestedMaterialFormData, category: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Vendor</label>
                                    <input type="text" disabled value={selectedVendor?.name || ''} style={{ background: '#f1f5f9', cursor: 'not-allowed' }} />
                                    <small style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Locked to current profile.</small>
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input type="number" required min="0" value={nestedMaterialFormData.quantity} onChange={e => setNestedMaterialFormData({...nestedMaterialFormData, quantity: parseInt(e.target.value) || 0})} />
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <input type="text" required placeholder="pcs, kg, m" value={nestedMaterialFormData.unit} onChange={e => setNestedMaterialFormData({...nestedMaterialFormData, unit: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Price</label>
                                    <input type="number" required min="0" step="0.01" value={nestedMaterialFormData.price} onChange={e => setNestedMaterialFormData({...nestedMaterialFormData, price: parseFloat(e.target.value) || 0})} />
                                </div>
                            </div>
                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="btn-cancel" onClick={() => setShowNestedMaterialForm(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Material</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* NESTED MODAL: View Material Details & History */}
            {showNestedMaterialView && nestedSelectedMaterial && (
                <div className="modal-overlay nested-modal" style={{ zIndex: 1200 }}>
                    <div className="glass-card modal-content animate-pop" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Material Details: {nestedSelectedMaterial.name}</h2>
                            <button className="close-btn" onClick={() => setShowNestedMaterialView(false)}>✕</button>
                        </div>
                        <div className="vendor-detail-grid" style={{ marginBottom: '20px' }}>
                            <div className="detail-section">
                                <h3>Stock Info</h3>
                                <p><strong>SKU:</strong> <code className="sku-code">{nestedSelectedMaterial.sku}</code></p>
                                <p><strong>Category:</strong> {nestedSelectedMaterial.category}</p>
                                <p><strong>Price:</strong> ${nestedSelectedMaterial.price}</p>
                            </div>
                            <div className="detail-section">
                                <h3>Inventory Status</h3>
                                <p><strong>Stock Level:</strong> {nestedSelectedMaterial.quantity} {nestedSelectedMaterial.unit}</p>
                                <p><strong>Status:</strong> {nestedSelectedMaterial.quantity === 0 ? 'Out of Stock' : nestedSelectedMaterial.quantity <= 10 ? 'Low Stock' : 'In Stock'}</p>
                            </div>
                        </div>

                        <div className="vendor-orders-section">
                            <h3 style={{ fontSize: '15px', marginBottom: '15px', color: 'var(--text-primary)' }}>Movement History</h3>
                            {loadingNestedMovements ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading history...</div>
                            ) : nestedMovementHistory.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: 'var(--text-muted)' }}>No movement history recorded yet.</div>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    <table className="enterprise-table" >
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                                <th style={{ padding: '8px' }}>Type</th>
                                                <th style={{ padding: '8px' }}>Qty</th>
                                                <th style={{ padding: '8px' }}>Reason</th>
                                                <th style={{ padding: '8px' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {nestedMovementHistory.map(mv => (
                                                <tr key={mv._id || mv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '8px' }}>
                                                        <span style={{ fontWeight: 600, color: mv.type === 'In' ? 'var(--success)' : 'var(--danger)' }}>{mv.type}</span>
                                                    </td>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{mv.type === 'In' ? '+' : '-'}{mv.quantity}</td>
                                                    <td style={{ padding: '8px' }}>{mv.reason || '—'}</td>
                                                    <td style={{ padding: '8px' }}>{new Date(mv.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                            </div>
                        </div>
                    )}

                    <div className="module-content">
                        {loading ? (
                            <div className="flex-center p-50"><div className="spinner"></div></div>
                        ) : (
                            <div className="premium-card" style={{ overflow: 'hidden' }}>
                                <DataTable 
                                    title="Supplier Directory"
                                    headers={['Vendor Name', 'Category', 'Contact Details', 'Address', 'Status', 'Actions']}
                                    data={vendors}
                                    renderRow={(v) => (
                                        <tr key={v._id || v.id} onClick={() => handleViewVendor(v)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <div className="org-cell">
                                                    <strong>{v.name}</strong>
                                                    {v.website && <a href={v.website} target="_blank" rel="noreferrer" className="web-link" onClick={e => e.stopPropagation()}><ExternalLink size={12}/> Visit Site</a>}
                                                </div>
                                            </td>
                                            <td><span className="cat-tag">{v.category}</span></td>
                                            <td>
                                                <div className="contact-info-sm">
                                                    <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{v.contactPerson || '—'}</span>
                                                    <span><Mail size={12}/> {v.email}</span>
                                                    <span><Phone size={12}/> {v.phone}</span>
                                                </div>
                                            </td>
                                            <td><div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.address}</div></td>
                                            <td><span className={`status-badge-inline ${v.status?.toLowerCase().replace(/ /g, '-') || 'vendor-created'}`}>{v.status || 'Vendor Created'}</span></td>
                                            <td>
                                                <div className="action-btns-row" onClick={e => e.stopPropagation()}>
                                                    <button className="action-btn-sm" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-light)', color: 'var(--text-heading)', borderRadius: '6px', padding: '6px 8px' }} title="Edit Vendor" onClick={() => openEditModal(v)}><Edit size={14} /></button>
                                                    <button className="action-btn-sm" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', padding: '6px 8px' }} title="Delete Vendor" onClick={() => handleDeleteVendor(v)}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                />
                            </div>
                        )}
                    </div>

            
        </div>
    );
};

export default Vendors;
