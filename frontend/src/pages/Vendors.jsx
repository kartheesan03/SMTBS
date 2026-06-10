import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Truck, Plus, Star, MapPin, Mail, Phone, ExternalLink, Download, Edit, X, PackagePlus } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [allMaterials, setAllMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorOrders, setVendorOrders] = useState([]);
    const [vendorMaterials, setVendorMaterials] = useState([]);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '', category: 'Raw Materials', contactPerson: '', email: '', phone: '', address: ''
    });
    
    // New Materials Logic
    const [newMaterialsList, setNewMaterialsList] = useState([]);
    const [newMaterial, setNewMaterial] = useState({
        name: '', sku: '', category: 'Raw Materials', quantity: 0, unit: 'pcs', price: 0
    });

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
            const [{ data: orders }, { data: materials }] = await Promise.all([
                API.get('/orders'),
                API.get('/materials')
            ]);
            const filteredOrders = orders.filter(o => String(o.vendorId) === String(vendor.id || vendor._id) || String(o.vendor?.id || o.vendor?._id || o.vendor) === String(vendor.id || vendor._id));
            setVendorOrders(filteredOrders);
            const filteredMaterials = materials.filter(m => String(m.vendorId) === String(vendor.id || vendor._id) || String(m.vendor?.id || m.vendor?._id || m.vendor) === String(vendor.id || vendor._id));
            setVendorMaterials(filteredMaterials);
        } catch (err) {
            console.error("Error fetching vendor data", err);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', category: 'Raw Materials', contactPerson: '', email: '', phone: '', address: '' });
        setNewMaterialsList([]);
        setNewMaterial({ name: '', sku: '', category: 'Raw Materials', quantity: 0, unit: 'pcs', price: 0 });
        setVendorMaterials([]);
        setShowModal(true);
    };

    const openEditModal = (vendor) => {
        setIsEditMode(true);
        setSelectedVendor(vendor);
        setFormData({
            name: vendor.name || '',
            category: vendor.category || 'Raw Materials',
            contactPerson: vendor.contactPerson || '',
            email: vendor.email || '',
            phone: vendor.phone || '',
            address: vendor.address || ''
        });
        
        // Find existing physical stock linked to this vendor
        const existingMaterials = allMaterials.filter(m => 
            String(m.vendorId) === String(vendor.id || vendor._id) || 
            String(m.vendor?.id || m.vendor?._id || m.vendor) === String(vendor.id || vendor._id)
        );
        setVendorMaterials(existingMaterials);
        
        setNewMaterialsList([]);
        setNewMaterial({ name: '', sku: '', category: 'Raw Materials', quantity: 0, unit: 'pcs', price: 0 });
        setShowModal(true);
    };

    const handleAddNewMaterialToList = () => {
        if (!newMaterial.name || !newMaterial.sku) {
            alert("Material Name and SKU are required!");
            return;
        }
        // Check if SKU exists locally before sending to API
        if (allMaterials.some(m => m.sku === newMaterial.sku) || newMaterialsList.some(m => m.sku === newMaterial.sku)) {
            alert("SKU already exists! Please use a unique SKU.");
            return;
        }
        
        setNewMaterialsList([...newMaterialsList, { ...newMaterial }]);
        setNewMaterial({ name: '', sku: '', category: 'Raw Materials', quantity: 0, unit: 'pcs', price: 0 });
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

            // If there are new materials to add, loop and create them
            if (newMaterialsList.length > 0 && finalVendorId) {
                const materialPromises = newMaterialsList.map(mat => 
                    API.post('/materials', { ...mat, vendorId: finalVendorId })
                );
                await Promise.all(materialPromises);
            }

            setShowModal(false);
            fetchVendors();
            fetchMaterials(); // refresh globally to update main datatable counts
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving vendor or materials');
        }
    };

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

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div>
                    <h1 className="title-gradient">Vendor Network</h1>
                    <p className="text-muted">Direct procurement channels and strategic supplier relationships.</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary flex-center gap-10" onClick={exportToPDF} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                        <Download size={16} /> PDF
                    </button>
                    <button className="btn-secondary flex-center gap-10" onClick={exportToExcel} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                        <Download size={16} /> Excel
                    </button>
                    <button className="btn-primary flex-center gap-10" onClick={openAddModal}>
                        <Plus size={18} /> Add New Vendor
                    </button>
                </div>
            </header>

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
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option value="Raw Materials">Raw Materials</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Polymers">Polymers</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Packaging">Packaging</option>
                                        </select>
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
                            </form>

                            {/* Existing Stock Display (Read Only) during Edit Mode */}
                            {isEditMode && (
                                <div className="material-creation-section" style={{ marginTop: '25px', borderColor: '#e2e8f0', background: '#ffffff' }}>
                                    <h3 className="section-title" style={{ marginTop: 0 }}>Existing Materials Supplied</h3>
                                    {vendorMaterials.length === 0 ? (
                                        <p className="text-muted" style={{ fontSize: '13px' }}>No physical stock records linked yet.</p>
                                    ) : (
                                        <div className="table-responsive" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                            <table className="dt-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
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
                                        <select value={newMaterial.category} onChange={e => setNewMaterial({...newMaterial, category: e.target.value})}>
                                            <option value="Raw Materials">Raw Materials</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Polymers">Polymers</option>
                                            <option value="Packaging">Packaging</option>
                                        </select>
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
                                    <div className="table-responsive" style={{ marginTop: '15px', border: '1px solid #c7d2fe', borderRadius: '8px', overflow: 'hidden' }}>
                                        <table className="dt-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', background: '#eef2ff' }}>
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
                            {/* Uses the external form submit */}
                            <button type="submit" form="vendorForm" className="btn-primary">{isEditMode ? 'Update Vendor & Items' : 'Register Vendor & Items'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showViewModal && selectedVendor && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>Vendor Profile: {selectedVendor.name}</h2>
                            <button className="close-btn" onClick={() => setShowViewModal(false)}>✕</button>
                        </div>
                        
                        <div className="vendor-detail-grid">
                            <div className="detail-section">
                                <h3>Company Information</h3>
                                <p><strong>Category:</strong> <span className="cat-tag">{selectedVendor.category}</span></p>
                                <p><strong>Status:</strong> <span className={`status-badge-inline ${selectedVendor.status?.toLowerCase().replace(/ /g, '-') || 'vendor-created'}`}>{selectedVendor.status || 'Vendor Created'}</span></p>
                                <p><strong>Registered On:</strong> {new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                            </div>
                            
                            <div className="detail-section">
                                <h3>Contact Details</h3>
                                <p><strong>Contact Person:</strong> {selectedVendor.contactPerson || 'N/A'}</p>
                                <p><strong>Email:</strong> {selectedVendor.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {selectedVendor.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> {selectedVendor.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="vendor-orders-section" style={{ marginTop: '25px' }}>
                            <h3 style={{ fontSize: '15px', marginBottom: '15px', color: 'var(--text-primary)' }}>Stock Linked Materials ({vendorMaterials.length})</h3>
                            {vendorMaterials.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: '13px' }}>No physical inventory is currently supplied by this vendor.</p>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                    <table className="dt-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '8px' }}>SKU</th>
                                                <th style={{ padding: '8px' }}>Material</th>
                                                <th style={{ padding: '8px' }}>Category</th>
                                                <th style={{ padding: '8px' }}>Stock</th>
                                                <th style={{ padding: '8px' }}>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendorMaterials.map(m => (
                                                <tr key={m._id || m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '8px' }}>{m.sku}</td>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{m.name}</td>
                                                    <td style={{ padding: '8px' }}>{m.category}</td>
                                                    <td style={{ padding: '8px' }}>{m.quantity} {m.unit}</td>
                                                    <td style={{ padding: '8px' }}>${m.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="vendor-orders-section" style={{ marginTop: '25px' }}>
                            <h3 style={{ fontSize: '15px', marginBottom: '15px', color: 'var(--text-primary)' }}>Linked Purchase Orders ({vendorOrders.length})</h3>
                            {vendorOrders.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: '13px' }}>No purchase orders found for this vendor.</p>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    <table className="dt-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '8px' }}>Order No</th>
                                                <th style={{ padding: '8px' }}>Amount</th>
                                                <th style={{ padding: '8px' }}>Status</th>
                                                <th style={{ padding: '8px' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendorOrders.map(order => (
                                                <tr key={order.id || order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{order.orderNumber}</td>
                                                    <td style={{ padding: '8px' }}>${(order.totalAmount || 0).toLocaleString()}</td>
                                                    <td style={{ padding: '8px' }}><span className="status-badge-inline">{order.status}</span></td>
                                                    <td style={{ padding: '8px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-actions" style={{ marginTop: '25px' }}>
                            <button type="button" className="btn-cancel" onClick={() => setShowViewModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="module-content">
                <div className="glass-card table-wrapper">
                    <DataTable 
                        title="Supplier Directory"
                        headers={['Vendor Name', 'Category', 'Materials Supplied', 'Status', 'Contact', 'Action']}
                        data={vendors}
                        onViewAll={fetchVendors}
                        renderRow={(v, index) => {
                            const vId = String(v._id || v.id);
                            // Filter globally matched materials for this row
                            const vMaterials = allMaterials.filter(m => String(m.vendorId) === vId || String(m.vendor?.id || m.vendor?._id || m.vendor) === vId);
                            
                            return (
                                <tr key={v._id || v.id || index}>
                                    <td>
                                        <strong>{v.name}</strong>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}><MapPin size={12}/> {v.address}</div>
                                    </td>
                                    <td><span className="cat-tag">{v.category}</span></td>
                                    <td style={{ maxWidth: '250px' }}>
                                        {vMaterials.length > 0 ? (
                                            <div className="chips-container-readonly" style={{ flexWrap: 'wrap' }}>
                                                {vMaterials.slice(0, 2).map((mat, i) => (
                                                    <span key={i} className="material-chip-readonly small">{mat.name} ({mat.sku})</span>
                                                ))}
                                                {vMaterials.length > 2 && (
                                                    <span className="material-chip-readonly small empty">+{vMaterials.length - 2} items</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted" style={{ fontSize: '12px' }}>No stock linked</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${v.status?.toLowerCase().replace(/ /g, '-') || 'vendor-created'}`}>
                                            {v.status || 'Vendor Created'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="info-cell">{v.contactPerson || '-'}</div>
                                        <div className="info-cell" style={{ fontSize: '11px' }}><Mail size={12}/> {v.email}</div>
                                        <div className="info-cell" style={{ fontSize: '11px' }}><Phone size={12}/> {v.phone}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="btn-icon view-btn" title="View Vendor" onClick={() => handleViewVendor(v)}><ExternalLink size={16}/></button>
                                            <button className="btn-icon view-btn" title="Edit Vendor" onClick={() => openEditModal(v)}><Edit size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }}
                    />
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; gap: 20px; }
                .table-wrapper { padding: 10px; }
                .cat-tag { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
                
                .status-badge-inline { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; display: inline-block; }
                .status-badge-inline.vendor-created { background-color: var(--primary-50, #eff6ff); color: var(--primary, #3b82f6); }
                .status-badge-inline.approved-vendor { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.purchase-order-received { background-color: var(--warning-light, #fef3c7); color: var(--warning, #d97706); }
                .status-badge-inline.materials-supplied { background-color: #e0f2fe; color: #0284c7; }
                .status-badge-inline.in-transit { background-color: #ffedd5; color: #ea580c; }
                .status-badge-inline.delivered { background-color: var(--success-light, #dcfce7); color: var(--success, #16a34a); }
                .status-badge-inline.completed { background-color: #d1fae5; color: #059669; }
                
                .info-cell { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: var(--text-muted); white-space: nowrap; margin-bottom: 4px; }
                .address-wrap { max-width: 250px; white-space: normal; line-height: 1.5; word-wrap: break-word; }
                .address-wrap svg { flex-shrink: 0; margin-top: 2px; }
                
                .btn-icon { background: none; color: var(--primary); border: none; }
                .view-btn { padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
                .view-btn:hover { background: var(--primary-light); color: var(--primary); }

                /* Physical Materials Sub-form Styles */
                .section-title { font-size: 14px; font-weight: 700; color: var(--dash-text-main, #0f172a); margin: 0 0 15px 0; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
                .material-creation-section { background: #f8fafc; padding: 18px; border-radius: 12px; border: 1px dashed #cbd5e1; }
                .sub-form-row { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-end; }
                
                .chips-container-readonly { display: flex; flex-wrap: wrap; gap: 6px; }
                .material-chip-readonly { display: inline-flex; align-items: center; background: var(--primary-50); color: var(--primary-700); padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid var(--primary-100); }
                .material-chip-readonly.small { padding: 3px 8px; font-size: 11px; }
                .material-chip-readonly.empty { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 30px; position: relative; max-height: 90vh; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .vendor-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: var(--bg-body); padding: 20px; border-radius: 12px; }
                .detail-section h3 { font-size: 14px; font-weight: 700; color: var(--primary); margin: 0 0 15px 0; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
                .detail-section p { font-size: 13px; color: var(--text-secondary); margin: 8px 0; display: flex; flex-direction: column; gap: 4px; }
                .detail-section p strong { color: var(--text-primary); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 10px 12px; background: var(--bg-card, #ffffff); border: 1px solid var(--border); border-radius: 8px; color: var(--dash-text-main, #0f172a); width: 100%; font-size: 13px; }
                .form-group select option { background: #ffffff; color: var(--dash-text-main, #0f172a); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; }
                .btn-cancel { background: transparent; color: var(--dash-text-main, #0f172a); border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-cancel:hover { background: #f1f5f9; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; padding: 20px; }
                    .header-actions { width: 100%; flex-wrap: wrap; }
                    .header-actions button { flex: 1; }
                    .form-grid { grid-template-columns: 1fr; }
                    .sub-form-row { flex-direction: column; align-items: stretch; gap: 8px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Vendors;
