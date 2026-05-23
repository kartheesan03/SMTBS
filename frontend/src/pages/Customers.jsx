import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Users, Plus, Mail, Phone, ExternalLink, UserCheck, Edit2, Trash2, Globe, Building2, FileText } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active'
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/customers');
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/customers/${editingId}`, formData);
            } else {
                await API.post('/customers', formData);
            }
            handleCloseModal();
            fetchCustomers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing request');
        }
    };

    const handleEdit = (customer) => {
        setEditingId(customer._id);
        setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            industry: customer.industry || '',
            website: customer.website || '',
            notes: customer.notes || '',
            status: customer.status || 'Active'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await API.delete(`/customers/${id}`);
                fetchCustomers();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting customer');
            }
        }
    };
    const handleApprove = async (id) => {
        try {
            await API.put(`/customers/${id}/approve`);
            fetchCustomers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving customer');
        }
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active' });
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div>
                    <h1 className="title-gradient">Customer Portfolio</h1>
                    <p className="text-muted">Manage established accounts and view partnership history.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary flex-center gap-10" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Add New Customer
                    </button>
                </div>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content-lg animate-pop">
                        <div className="modal-header">
                            <h2>{editingId ? 'Update Client Profile' : 'Register New Client'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Organization Name</label>
                                    <div className="input-with-icon">
                                        <Building2 size={16} />
                                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nexus Industries" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Lifecycle Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                        <option value="Active">Active</option>
                                        <option value="Lead">Lead</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending Review">Pending Review</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail size={16} />
                                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="input-with-icon">
                                        <Phone size={16} />
                                        <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Industry</label>
                                    <input type="text" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="e.g. Manufacturing" />
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <div className="input-with-icon">
                                        <Globe size={16} />
                                        <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Primary Address</label>
                                <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Internal Notes</label>
                                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Key partnership details..."></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">{editingId ? 'Update Portfolio' : 'Register Customer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="module-content">
                <div className="glass-card table-wrapper">
                    <DataTable 
                        title="Customer Portfolio Ledger"
                        headers={['Organization', 'Contact Details', 'Industry', 'Status', 'Action']}
                        data={customers}
                        renderRow={(c) => (
                            <tr key={c._id}>
                                <td>
                                    <div className="org-cell">
                                        <strong>{c.name}</strong>
                                        {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="web-link"><Globe size={12}/> Visit Site</a>}
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info-sm">
                                        <span><Mail size={12}/> {c.email}</span>
                                        <span><Phone size={12}/> {c.phone}</span>
                                    </div>
                                </td>
                                <td>{c.industry || '—'}</td>
                                <td><span className={`status-pill ${c.status?.toLowerCase().replace(/ /g, '-') || 'active'}`}>{c.status || 'Active'}</span></td>
                                <td>
                                    <div className="action-btns-row">
                                        {isAdmin && c.status === 'Pending Review' && (
                                            <button className="btn-approve-sm" onClick={() => handleApprove(c._id)} title="Approve Customer"><UserCheck size={16}/></button>
                                        )}
                                        <button className="btn-icon-edit" onClick={() => handleEdit(c)}><Edit2 size={16}/></button>
                                        <button className="btn-icon-del" onClick={() => handleDelete(c._id)}><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    />
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; }
                .table-wrapper { padding: 10px; }
                
                .org-cell { display: flex; flex-direction: column; gap: 4px; }
                .web-link { font-size: 11px; color: var(--primary); display: flex; align-items: center; gap: 4px; text-decoration: none; }
                .web-link:hover { text-decoration: underline; }

                .contact-info-sm { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: var(--text-muted); }
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.lead { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.inactive { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
                .status-pill.pending-review { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                
                .action-btns-row { display: flex; gap: 8px; }
                .btn-icon-edit { background: rgba(99, 102, 241, 0.1); color: var(--primary); padding: 8px; border-radius: 6px; }
                .btn-icon-del { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 8px; border-radius: 6px; }
                .btn-approve-sm { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 8px; border-radius: 6px; }
                .btn-approve-sm:hover { background: #10b981; color: white; }

                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content-lg { width: 90%; max-width: 700px; padding: 35px; position: relative; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; color: var(--text-muted); cursor: pointer; }
                
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .input-with-icon { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; }
                .input-with-icon input { background: none; border: none; padding: 12px 0; color: white; width: 100%; font-size: 14px; }
                
                .form-group input:not([type]), .form-group input[type="text"], .form-group input[type="email"], .form-group input[type="url"], .form-group select, .form-group textarea {
                    padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; color: white; font-size: 14px;
                }
                .form-group input::placeholder, .form-group textarea::placeholder { color: rgba(255,255,255,0.4); }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: #1e293b; color: white; }

                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }
            `}</style>
        </div>
    );
};

export default Customers;
