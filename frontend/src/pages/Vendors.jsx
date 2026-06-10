import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Truck, Plus, Star, MapPin, Mail, Phone, ExternalLink, Download, Edit, X } from 'lucide-react';
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
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [materialInput, setMaterialInput] = useState('');

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
            const filteredOrders = orders.filter(o => o.vendorId === vendor.id || o.vendor === vendor.id || (o.vendor && o.vendor.id === vendor.id));
            setVendorOrders(filteredOrders);
            const filteredMaterials = materials.filter(m => String(m.vendor?._id || m.vendor?.id || m.vendor) === String(vendor._id || vendor.id));
            setVendorMaterials(filteredMaterials);
        } catch (err) {
            console.error("Error fetching vendor data", err);
        }
    };

    const openAddModal = () => {
        setIsEditMode(false);
        setFormData({ name: '', category: 'Raw Materials', contactPerson: '', email: '', phone: '', address: '' });
        setSelectedMaterials([]);
        setMaterialInput('');
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
        setSelectedMaterials(vendor.materialsSupplied || []);
        setMaterialInput('');
        setShowModal(true);
    };

    const handleAddMaterialChip = (e) => {
        e.preventDefault();
        const value = materialInput.trim();
        if (value && !selectedMaterials.includes(value)) {
            setSelectedMaterials([...selectedMaterials, value]);
        }
        setMaterialInput('');
    };

    const handleSelectMaterial = (e) => {
        const value = e.target.value;
        if (value && !selectedMaterials.includes(value)) {
            setSelectedMaterials([...selectedMaterials, value]);
        }
        e.target.value = ""; // reset dropdown
    };

    const removeMaterialChip = (materialToRemove) => {
        setSelectedMaterials(selectedMaterials.filter(m => m !== materialToRemove));
    };

    const handleSaveVendor = async (e) => {
        e.preventDefault();
        const payload = { ...formData, materialsSupplied: selectedMaterials };
        
        try {
            if (isEditMode && selectedVendor) {
                const id = selectedVendor._id || selectedVendor.id;
                await API.put(`/vendors/${id}`, payload);
            } else {
                await API.post('/vendors', payload);
            }
            setShowModal(false);
            fetchVendors();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving vendor');
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
                    <div className="glass-card modal-content animate-pop" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h2>{isEditMode ? 'Edit Supplier' : 'Onboard New Supplier'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSaveVendor} className="modal-form">
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

                            {/* Materials Supplied Section */}
                            <div className="form-group material-section">
                                <label>Materials Supplied</label>
                                <div className="material-input-container">
                                    <div className="material-dropdown">
                                        <select onChange={handleSelectMaterial} defaultValue="">
                                            <option value="" disabled>Select from existing materials...</option>
                                            {allMaterials.map(m => (
                                                <option key={m._id || m.id} value={m.name}>{m.name} ({m.sku})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="or-divider">OR</span>
                                    <div className="material-custom">
                                        <input 
                                            type="text" 
                                            placeholder="Type custom material & press Enter..." 
                                            value={materialInput}
                                            onChange={e => setMaterialInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddMaterialChip(e);
                                                }
                                            }}
                                        />
                                        <button type="button" onClick={handleAddMaterialChip} className="add-chip-btn">Add</button>
                                    </div>
                                </div>
                                
                                {selectedMaterials.length > 0 && (
                                    <div className="chips-container">
                                        {selectedMaterials.map((mat, idx) => (
                                            <div key={idx} className="material-chip">
                                                <span>{mat}</span>
                                                <button type="button" onClick={() => removeMaterialChip(mat)}><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditMode ? 'Update Vendor' : 'Register Vendor'}</button>
                            </div>
                        </form>
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
                            <h3 style={{ fontSize: '15px', marginBottom: '15px', color: 'var(--text-primary)' }}>Materials Supplied</h3>
                            {(!selectedVendor.materialsSupplied || selectedVendor.materialsSupplied.length === 0) ? (
                                <p className="text-muted" style={{ fontSize: '13px' }}>No materials are explicitly listed for this vendor.</p>
                            ) : (
                                <div className="chips-container-readonly">
                                    {selectedVendor.materialsSupplied.map((mat, idx) => (
                                        <div key={idx} className="material-chip-readonly">{mat}</div>
                                    ))}
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

                        <div className="vendor-orders-section" style={{ marginTop: '25px' }}>
                            <h3 style={{ fontSize: '15px', marginBottom: '15px', color: 'var(--text-primary)' }}>Stock Linked Materials ({vendorMaterials.length})</h3>
                            {vendorMaterials.length === 0 ? (
                                <p className="text-muted" style={{ fontSize: '13px' }}>No linked physical inventory stock.</p>
                            ) : (
                                <div className="table-responsive" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    <table className="dt-table" style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '8px' }}>SKU</th>
                                                <th style={{ padding: '8px' }}>Material</th>
                                                <th style={{ padding: '8px' }}>Category</th>
                                                <th style={{ padding: '8px' }}>Stock</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vendorMaterials.map(m => (
                                                <tr key={m._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '8px' }}>{m.sku}</td>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{m.name}</td>
                                                    <td style={{ padding: '8px' }}>{m.category}</td>
                                                    <td style={{ padding: '8px' }}>{m.quantity} {m.unit}</td>
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
                        headers={['Vendor Name', 'Category', 'Supplied Materials', 'Status', 'Contact', 'Action']}
                        data={vendors}
                        onViewAll={fetchVendors}
                        renderRow={(v, index) => (
                            <tr key={v._id || v.id || index}>
                                <td>
                                    <strong>{v.name}</strong>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}><MapPin size={12}/> {v.address}</div>
                                </td>
                                <td><span className="cat-tag">{v.category}</span></td>
                                <td style={{ maxWidth: '250px' }}>
                                    {v.materialsSupplied && v.materialsSupplied.length > 0 ? (
                                        <div className="chips-container-readonly" style={{ flexWrap: 'wrap' }}>
                                            {v.materialsSupplied.slice(0, 3).map((mat, i) => (
                                                <span key={i} className="material-chip-readonly small">{mat}</span>
                                            ))}
                                            {v.materialsSupplied.length > 3 && (
                                                <span className="material-chip-readonly small empty">+{v.materialsSupplied.length - 3}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-muted" style={{ fontSize: '12px' }}>Not specified</span>
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
                        )}
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

                /* Materials Chips */
                .material-section { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px dashed var(--border); }
                .material-input-container { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                .material-dropdown { flex: 1; }
                .or-divider { font-size: 12px; font-weight: 700; color: var(--text-muted); }
                .material-custom { flex: 1; display: flex; align-items: center; gap: 8px; }
                .material-custom input { margin-bottom: 0; }
                .add-chip-btn { padding: 10px 16px; background: #ffffff; border: 1px solid var(--border); border-radius: 8px; font-weight: 600; font-size: 13px; color: var(--primary); cursor: pointer; transition: all 0.2s; }
                .add-chip-btn:hover { background: var(--primary-light); border-color: var(--primary); }
                
                .chips-container { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
                .material-chip { display: inline-flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid var(--primary-100); padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; color: var(--primary); box-shadow: var(--shadow-xs); }
                .material-chip button { background: transparent; border: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; transition: color 0.2s; }
                .material-chip button:hover { color: var(--danger); }
                
                .chips-container-readonly { display: flex; flex-wrap: wrap; gap: 6px; }
                .material-chip-readonly { display: inline-flex; align-items: center; background: var(--primary-50); color: var(--primary-700); padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid var(--primary-100); }
                .material-chip-readonly.small { padding: 3px 8px; font-size: 11px; }
                .material-chip-readonly.empty { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 30px; position: relative; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .vendor-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: var(--bg-body); padding: 20px; border-radius: 12px; }
                .detail-section h3 { font-size: 14px; font-weight: 700; color: var(--primary); margin: 0 0 15px 0; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
                .detail-section p { font-size: 13px; color: var(--text-secondary); margin: 8px 0; display: flex; flex-direction: column; gap: 4px; }
                .detail-section p strong { color: var(--text-primary); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 12px; background: var(--bg-card, #ffffff); border: 1px solid var(--border); border-radius: 8px; color: var(--dash-text-main, #0f172a); width: 100%; }
                .form-group select option { background: #ffffff; color: var(--dash-text-main, #0f172a); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
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
                    .material-input-container { flex-direction: column; align-items: stretch; }
                    .or-divider { text-align: center; margin: 4px 0; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Vendors;
