import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Truck, Plus, Star, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', category: 'Raw Materials', contactPerson: '', email: '', phone: '', address: ''
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

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            await API.post('/vendors', formData);
            setShowModal(false);
            setFormData({ name: '', category: 'Raw Materials', contactPerson: '', email: '', phone: '', address: '' });
            fetchVendors();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding vendor');
        }
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div>
                    <h1 className="title-gradient">Vendor Network</h1>
                    <p className="text-muted">Direct procurement channels and strategic supplier relationships.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary flex-center gap-10" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add New Vendor
                    </button>
                </div>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop">
                        <div className="modal-header">
                            <h2>Onboard New Supplier</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddVendor} className="modal-form">
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
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Business Address</label>
                                <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Register Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="module-content">
                <div className="glass-card table-wrapper">
                    <DataTable 
                        title="Supplier Directory"
                        headers={['Vendor Name', 'Category', 'Status', 'Address', 'Contact', 'Email', 'Phone', 'Action']}
                        data={vendors}
                        onViewAll={fetchVendors}
                        renderRow={(v, index) => (
                            <tr key={v._id || index}>
                                <td><strong>{v.name}</strong></td>
                                <td><span className="cat-tag">{v.category}</span></td>
                                <td>
                                    <span className={`status-badge-inline ${v.status?.toLowerCase().replace(/ /g, '-') || 'vendor-created'}`}>
                                        {v.status || 'Vendor Created'}
                                    </span>
                                </td>
                                <td><div className="info-cell address-wrap"><MapPin size={14}/> <span>{v.address}</span></div></td>
                                <td>{v.contactPerson || '-'}</td>
                                <td><div className="info-cell"><Mail size={14}/> {v.email}</div></td>
                                <td><div className="info-cell"><Phone size={14}/> {v.phone}</div></td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn-icon view-btn" title="View Vendor"><ExternalLink size={16}/></button>
                                </td>
                            </tr>
                        )}
                    />
                </div>
            </div>            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; gap: 20px; }
                .table-wrapper { padding: 10px; }
                .cat-tag { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
                
                .status-badge-inline { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; display: inline-block; }
                .status-badge-inline.vendor-created { background-color: var(--primary-50, #eff6ff); color: var(--primary, #3b82f6); }
                .status-badge-inline.approved-vendor { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.receives-purchase-orders { background-color: var(--warning-light, #fef3c7); color: var(--warning, #d97706); }
                .status-badge-inline.supplies-materials { background-color: #e0f2fe; color: #0284c7; }
                .status-badge-inline.in-transit { background-color: #ffedd5; color: #ea580c; }
                .status-badge-inline.delivered { background-color: var(--success-light, #dcfce7); color: var(--success, #16a34a); }
                .status-badge-inline.completed { background-color: #d1fae5; color: #059669; }
                .info-cell { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; color: var(--text-muted); white-space: nowrap; }
                .address-wrap { max-width: 250px; white-space: normal; line-height: 1.5; word-wrap: break-word; }
                .address-wrap svg { flex-shrink: 0; margin-top: 2px; }
                .btn-icon { background: none; color: var(--primary); border: none; }
                .view-btn { padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; }
                .view-btn:hover { background: var(--primary-light); color: var(--primary); }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 30px; position: relative; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 12px; background: var(--bg-card, #ffffff); border: 1px solid var(--border); border-radius: 8px; color: var(--dash-text-main, #0f172a); width: 100%; }
                .form-group select option { background: #ffffff; color: var(--dash-text-main, #0f172a); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: var(--dash-text-main, #0f172a); border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }
                .gap-5 { gap: 5px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; padding: 20px; }
                    .header-actions { width: 100%; }
                    .header-actions button { width: 100%; }
                    .form-grid { grid-template-columns: 1fr; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                    .contact-cell { min-width: 150px; }
                }
            `}</style>
{'>'}
        </div>
    );
};

export default Vendors;
