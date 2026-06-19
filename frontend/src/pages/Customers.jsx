import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Users, Plus, Mail, Phone, ExternalLink, UserCheck, Edit2, Trash2, Globe, Building2, FileText, ArrowLeft, ShoppingCart, MessageSquare, LifeBuoy, Calendar, Clock, PhoneCall, Send, StickyNote, X, Download, Search } from 'lucide-react';
import CustomerForm from '../components/CustomerForm';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';

const Customers = ({ directoryOnly }) => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: '', customerType: 'Individual'
    });
    const [formErrors, setFormErrors] = useState({});

    // Detail view state
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [customerOrders, setCustomerOrders] = useState([]);
    const [customerTickets, setCustomerTickets] = useState([]);
    const [customerComms, setCustomerComms] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Communication form state
    const [showCommModal, setShowCommModal] = useState(false);
    const [commForm, setCommForm] = useState({
        type: 'Call', subject: '', notes: '', contactDate: new Date().toISOString().split('T')[0]
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/customers');
            let fetchedData = Array.isArray(data) ? data : [];
            if (directoryOnly) {
                fetchedData = fetchedData.filter(c => c.status !== 'Lead' && c.customerType !== 'Lead');
            }
            setCustomers(fetchedData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const openCustomerDetail = async (customer) => {
        setSelectedCustomer(customer);
        setActiveTab('profile');
        setLoadingDetail(true);
        try {
            const [ordersRes, ticketsRes, commsRes] = await Promise.all([
                API.get(`/customers/${customer._id}/orders`),
                API.get(`/customers/${customer._id}/tickets`),
                API.get(`/communications/customer/${customer._id}`)
            ]);
            setCustomerOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
            setCustomerTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
            setCustomerComms(Array.isArray(commsRes.data) ? commsRes.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetail(false);
        }
    };

    const closeCustomerDetail = () => {
        setSelectedCustomer(null);
        setCustomerOrders([]);
        setCustomerTickets([]);
        setCustomerComms([]);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name || formData.name.trim().length < 2) errors.name = 'Organization name must be at least 2 characters.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) errors.email = 'Please enter a valid email address.';
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) errors.phone = 'Please enter a valid phone number (at least 10 digits).';
        if (!formData.industry || formData.industry.trim().length === 0) errors.industry = 'Industry is required.';
        if (!formData.address || formData.address.trim().length === 0) errors.address = 'Primary address is required.';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            if (editingId) {
                await API.put(`/customers/${editingId}`, formData);
                alert("Customer profile updated and synchronized successfully.");
            } else {
                await API.post('/customers', formData);
                alert("Customer created successfully.");
            }
            handleCloseModal();
            fetchCustomers();
            if (editingId && selectedCustomer && editingId === selectedCustomer._id) {
                const updatedRes = await API.get(`/customers/${editingId}`);
                setSelectedCustomer(updatedRes.data);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing request');
        }
    };

    const handleEdit = (customer) => {
        setEditingId(customer._id || customer.id);
        setFormData({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            industry: customer.industry || '',
            website: customer.website || '',
            notes: customer.notes || '',
            status: customer.status || '',
            customerType: customer.customerType || 'Individual',
            company: customer.company || '',
            gstNumber: customer.gstNumber || ''
        });
        setFormErrors({});
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await API.delete(`/customers/${id}`);
                fetchCustomers();
                if (selectedCustomer?._id === id) closeCustomerDetail();
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
        setFormData({ name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: '', customerType: 'Individual' });
        setFormErrors({});
    };

    // Communication handlers
    const handleAddComm = async (e) => {
        e.preventDefault();
        try {
            await API.post('/communications', {
                customerId: selectedCustomer._id,
                ...commForm
            });
            const { data } = await API.get(`/communications/customer/${selectedCustomer._id}`);
            setCustomerComms(Array.isArray(data) ? data : []);
            setShowCommModal(false);
            setCommForm({ type: 'Call', subject: '', notes: '', contactDate: new Date().toISOString().split('T')[0] });
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding communication');
        }
    };

    const handleDeleteComm = async (id) => {
        if (window.confirm('Delete this communication log?')) {
            try {
                await API.delete(`/communications/${id}`);
                setCustomerComms(prev => prev.filter(c => (c._id || c.id) !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting communication');
            }
        }
    };

    // Export functions
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Customers (CRM) Report', 14, 22);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableData = customers.map(c => [
            c.name, c.company || 'Individual Customer', c.email, c.phone || '—', c.industry || '—', c.status || 'Active'
        ]);
        doc.autoTable({
            head: [['Full Name', 'Organization Name', 'Email', 'Phone', 'Industry', 'Status']],
            body: tableData,
            startY: 36,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save('customers_report.pdf');
    };

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Customers');
        sheet.columns = [
            { header: 'Full Name', key: 'name', width: 25 },
            { header: 'Organization Name', key: 'company', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 18 },
            { header: 'Industry', key: 'industry', width: 22 },
            { header: 'Address', key: 'address', width: 40 },
            { header: 'Website', key: 'website', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
        ];
        customers.forEach(c => {
            sheet.addRow({
                name: c.name, company: c.company || 'Individual Customer', email: c.email, phone: c.phone || '', industry: c.industry || '',
                address: c.address || '', website: c.website || '', status: c.status || 'Active'
            });
        });
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'customers_report.xlsx'; a.click();
        URL.revokeObjectURL(url);
    };

    const getCommIcon = (type) => {
        switch (type) {
            case 'Call': return <PhoneCall size={14} />;
            case 'Email': return <Send size={14} />;
            case 'Meeting': return <Users size={14} />;
            case 'Note': return <StickyNote size={14} />;
            default: return <MessageSquare size={14} />;
        }
    };

    // ── DETAIL VIEW ──
    if (selectedCustomer) {
        return (
            <div className="module-container">
                <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="btn-secondary-light" onClick={closeCustomerDetail} style={{ padding: '8px 12px' }}><ArrowLeft size={18} /></button>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>{selectedCustomer.name}</h1>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>{selectedCustomer.industry || 'Customer'} · <span className={`status-pill ${selectedCustomer.status?.toLowerCase().replace(/ /g, '-') || 'active'}`}>{selectedCustomer.status || 'Active'}</span></p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary-light flex-center gap-8" onClick={() => handleEdit(selectedCustomer)}><Edit2 size={16} /> Edit</button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="detail-tabs">
                    {[
                        { key: 'profile', label: 'Profile', icon: <Building2 size={16} /> },
                        { key: 'orders', label: `Orders (${customerOrders.length})`, icon: <ShoppingCart size={16} /> },
                        { key: 'communications', label: `Communications (${customerComms.length})`, icon: <MessageSquare size={16} /> },
                        { key: 'tickets', label: `Tickets (${customerTickets.length})`, icon: <LifeBuoy size={16} /> }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                <div className="module-content">
                    {loadingDetail ? (
                        <div className="dashboard-card-3d" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer details...</div>
                    ) : (
                        <>
                            {/* PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <div className="dashboard-card-3d" style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: 20, fontWeight: 700, fontSize: 16 }}>Contact Information</h3>
                                    <div className="profile-grid">
                                        <div className="profile-item"><Mail size={16} /><div><span className="profile-label">Email</span><span className="profile-value">{selectedCustomer.email || '—'}</span></div></div>
                                        <div className="profile-item"><UserCheck size={16} /><div><span className="profile-label">Type</span><span className="profile-value">{selectedCustomer.customerType || 'Individual'}</span></div></div>
                                        <div className="profile-item"><Phone size={16} /><div><span className="profile-label">Phone</span><span className="profile-value">{selectedCustomer.phone || '—'}</span></div></div>
                                        <div className="profile-item"><Building2 size={16} /><div><span className="profile-label">Industry</span><span className="profile-value">{selectedCustomer.industry || '—'}</span></div></div>
                                        <div className="profile-item"><Globe size={16} /><div><span className="profile-label">Website</span><span className="profile-value">{selectedCustomer.website ? <a href={selectedCustomer.website} target="_blank" rel="noreferrer">{selectedCustomer.website}</a> : '—'}</span></div></div>
                                        <div className="profile-item" style={{ gridColumn: '1 / -1' }}><FileText size={16} /><div><span className="profile-label">Address</span><span className="profile-value">{selectedCustomer.address || '—'}</span></div></div>
                                        {selectedCustomer.notes && (
                                            <div className="profile-item" style={{ gridColumn: '1 / -1' }}><StickyNote size={16} /><div><span className="profile-label">Notes</span><span className="profile-value">{selectedCustomer.notes}</span></div></div>
                                        )}
                                    </div>

                                    {/* Quick stats */}
                                    <div className="customer-quick-stats">
                                        <div className="quick-stat-card">
                                            <ShoppingCart size={20} />
                                            <div><span className="qs-value">{customerOrders.length}</span><span className="qs-label">Total Orders</span></div>
                                        </div>
                                        <div className="quick-stat-card">
                                            <MessageSquare size={20} />
                                            <div><span className="qs-value">{customerComms.length}</span><span className="qs-label">Communications</span></div>
                                        </div>
                                        <div className="quick-stat-card">
                                            <LifeBuoy size={20} />
                                            <div><span className="qs-value">{customerTickets.length}</span><span className="qs-label">Support Tickets</span></div>
                                        </div>
                                        <div className="quick-stat-card">
                                            <Calendar size={20} />
                                            <div><span className="qs-value">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString() : '—'}</span><span className="qs-label">Customer Since</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="dashboard-card-3d" style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: 16, fontWeight: 700, fontSize: 16 }}>Order History</h3>
                                    {customerOrders.length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No orders found for this customer.</p>
                                    ) : (
                                        <div className="dashboard-card-3d" style={{ overflowX: 'auto', padding: '24px' }}>
                                            <table className="enterprise-table">
                                                <thead><tr><th>Order #</th><th>Type</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                                                <tbody>
                                                    {customerOrders.map(o => (
                                                        <tr key={o._id || o.id}>
                                                            <td><strong>{o.orderNumber}</strong></td>
                                                            <td><span className={`type-badge ${o.orderType}`}>{o.orderType === 'sales' ? 'Sales' : 'Purchase'}</span></td>
                                                            <td>{o.items?.length || 0} items</td>
                                                            <td style={{ fontWeight: 600 }}>₹{(o.totalAmount || 0).toLocaleString()}</td>
                                                            <td><span className={`status-pill ${o.status?.toLowerCase().replace(/ /g, '-') || 'pending'}`}>{o.status}</span></td>
                                                            <td className="text-muted">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* COMMUNICATIONS TAB */}
                            {activeTab === 'communications' && (
                                <div className="dashboard-card-3d" style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <h3 style={{ fontWeight: 700, fontSize: 16 }}>Communication Log</h3>
                                        <button className="btn-primary flex-center gap-10" onClick={() => setShowCommModal(true)}><Plus size={16} /> Add Entry</button>
                                    </div>
                                    {customerComms.length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No communication logs yet. Click "Add Entry" to start tracking.</p>
                                    ) : (
                                        <div className="comm-timeline">
                                            {customerComms.map(c => (
                                                <div key={c._id || c.id} className="comm-entry">
                                                    <div className={`comm-icon ${c.type?.toLowerCase()}`}>{getCommIcon(c.type)}</div>
                                                    <div className="comm-body">
                                                        <div className="comm-header-row">
                                                            <div>
                                                                <span className="comm-type-badge">{c.type}</span>
                                                                <strong>{c.subject}</strong>
                                                            </div>
                                                            <div className="comm-meta">
                                                                <span className="text-muted">{c.contactDate ? new Date(c.contactDate).toLocaleDateString() : '—'}</span>
                                                                <button className="btn-icon-del-sm" onClick={() => handleDeleteComm(c._id || c.id)} title="Delete"><Trash2 size={13} /></button>
                                                            </div>
                                                        </div>
                                                        {c.notes && <p className="comm-notes">{c.notes}</p>}
                                                        {c.createdBy && <span className="comm-author">by {c.createdBy.name || 'System'}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TICKETS TAB */}
                            {activeTab === 'tickets' && (
                                <div className="dashboard-card-3d" style={{ padding: '24px' }}>
                                    <h3 style={{ marginBottom: 16, fontWeight: 700, fontSize: 16 }}>Support Tickets</h3>
                                    {customerTickets.length === 0 ? (
                                        <p className="text-muted" style={{ textAlign: 'center', padding: 30 }}>No support tickets found for this customer.</p>
                                    ) : (
                                        <div className="dashboard-card-3d" style={{ overflowX: 'auto', padding: '24px' }}>
                                            <table className="enterprise-table">
                                                <thead><tr><th>Ticket #</th><th>Subject</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Date</th></tr></thead>
                                                <tbody>
                                                    {customerTickets.map(t => (
                                                        <tr key={t._id || t.id}>
                                                            <td><strong>{t.ticketNumber}</strong></td>
                                                            <td>{t.subject}</td>
                                                            <td><span className={`priority-badge ${t.priority?.toLowerCase()}`}>{t.priority}</span></td>
                                                            <td><span className={`status-pill ${t.status?.toLowerCase().replace(/ /g, '-')}`}>{t.status}</span></td>
                                                            <td>{t.assignedTo?.name || '—'}</td>
                                                            <td className="text-muted">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Add Communication Modal */}
                {showCommModal && (
                    <div className="modal-overlay">
                        <div className="glass-card modal-content-lg animate-pop">
                            <div className="modal-header">
                                <h2>Add Communication Log</h2>
                                <button className="close-btn" onClick={() => setShowCommModal(false)}>✕</button>
                            </div>
                            <form onSubmit={handleAddComm} className="modal-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select value={commForm.type} onChange={e => setCommForm({...commForm, type: e.target.value})}>
                                            <option value="Call">Call</option>
                                            <option value="Email">Email</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Note">Note</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="date" value={commForm.contactDate} onChange={e => setCommForm({...commForm, contactDate: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input type="text" required value={commForm.subject} onChange={e => setCommForm({...commForm, subject: e.target.value})} placeholder="e.g. Follow-up on delivery schedule" />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea rows="3" value={commForm.notes} onChange={e => setCommForm({...commForm, notes: e.target.value})} placeholder="Details about this communication..."></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowCommModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Add Log Entry</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Customer Modal (reused in Detail View) */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="glass-card modal-content-lg animate-pop">
                            <div className="modal-header">
                                <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>✕</button>
                            </div>
                            <div style={{ padding: '30px' }}>
                                <CustomerForm 
                                    formData={formData}
                                    setFormData={setFormData}
                                    formErrors={formErrors}
                                    setFormErrors={setFormErrors}
                                    onSubmit={handleSubmit}
                                    onCancel={handleCloseModal}
                                    isLoading={false}
                                    emailDisabled={false}
                                    statusDisabled={false}
                                    saveButtonText={editingId ? 'Update Customer' : 'Save Customer'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <style jsx="true">{`
                    .module-container { padding: 30px; }
                    .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; padding: 25px; }
                    .btn-back { background: var(--bg-hover, #f1f5f9); color: var(--text-primary); padding: 10px; border-radius: 10px; display: flex; align-items: center; transition: all 0.2s; }
                    .btn-back:hover { background: var(--primary-50, #eef2ff); color: var(--primary); }
                    .btn-secondary { background: var(--bg-hover, #f1f5f9); color: var(--text-primary); padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; transition: all 0.2s; }
                    .btn-secondary:hover { background: var(--primary-50, #eef2ff); color: var(--primary); }

                    .detail-tabs { display: flex; gap: 4px; margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 4px; }
                    .tab-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; color: var(--text-muted); background: none; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
                    .tab-btn:hover { color: var(--text-primary); background: var(--bg-hover, #f1f5f9); }
                    .tab-btn.active { background: var(--primary); color: white; font-weight: 600; }

                    .detail-profile { padding: 25px; }
                    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .profile-item { display: flex; gap: 12px; align-items: flex-start; color: var(--text-muted); }
                    .profile-item svg { margin-top: 2px; flex-shrink: 0; }
                    .profile-label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px; }
                    .profile-value { display: block; font-size: 14px; color: var(--text-primary); }
                    .profile-value a { color: var(--primary); text-decoration: none; }
                    .profile-value a:hover { text-decoration: underline; }

                    .customer-quick-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border); }
                    .quick-stat-card { display: flex; align-items: center; gap: 14px; padding: 16px; background: var(--bg-body, #f8fafc); border-radius: 10px; border: 1px solid var(--border); }
                    .quick-stat-card svg { color: var(--primary); }
                    .qs-value { display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
                    .qs-label { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }

                    .detail-table-wrapper { overflow-x: auto; }
                    .detail-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                    .detail-table th { text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); border-bottom: 2px solid var(--border); }
                    .detail-table td { padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-primary); }
                    .detail-table tr:hover { background: var(--bg-hover, #f8fafc); }
                    .type-badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
                    .type-badge.sales { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
                    .type-badge.purchase { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }
                    .priority-badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                    .priority-badge.high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                    .priority-badge.medium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .priority-badge.low { background: rgba(16, 185, 129, 0.1); color: #10b981; }

                    .comm-timeline { display: flex; flex-direction: column; gap: 12px; }
                    .comm-entry { display: flex; gap: 14px; padding: 16px; border-radius: 10px; background: var(--bg-body, #f8fafc); border: 1px solid var(--border); transition: all 0.2s; }
                    .comm-entry:hover { border-color: var(--primary-200, #c7d2fe); }
                    .comm-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                    .comm-icon.call { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                    .comm-icon.email { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
                    .comm-icon.meeting { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }
                    .comm-icon.note { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .comm-body { flex: 1; min-width: 0; }
                    .comm-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
                    .comm-header-row strong { font-size: 14px; }
                    .comm-type-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: var(--bg-card); border: 1px solid var(--border); margin-right: 8px; }
                    .comm-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
                    .comm-notes { font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; }
                    .comm-author { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
                    .btn-icon-del-sm { background: none; color: var(--text-muted); padding: 4px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
                    .btn-icon-del-sm:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                    /* Modal Styles */
                    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; overflow-y: auto; }
                    .modal-content-lg { width: 100%; max-width: 650px; background: #ffffff; border-radius: 12px; margin: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; }
                    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 30px; border-bottom: 1px solid var(--border); background: #ffffff; }
                    .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
                    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s; line-height: 1; display: flex; align-items: center; justify-content: center; }
                    .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
                    .modal-form { display: flex; flex-direction: column; padding: 30px; background: #ffffff; }
                    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
                    .form-group:last-child { margin-bottom: 0; }
                    .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                    .req { color: #ef4444; margin-left: 2px; }
                    .error-text { color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 500; }
                    .error-border { border-color: #ef4444 !important; }
                    .input-with-icon { display: flex; align-items: center; gap: 10px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; transition: border-color 0.2s; }
                    .input-with-icon:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); background: var(--bg-card); }
                    .input-with-icon input { background: none; border: none; padding: 12px 0; color: var(--text-primary); width: 100%; font-size: 14px; outline: none; }
                    .form-group input:not([type]), .form-group input[type="text"], .form-group input[type="email"], .form-group input[type="url"], .form-group input[type="date"], .form-group select, .form-group textarea { padding: 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border-color 0.2s; }
                    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); background: var(--bg-card); }
                    .form-group input::placeholder, .form-group textarea::placeholder { color: var(--text-muted); }
                    .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                    .form-group select option { background: #ffffff; color: #0f172a; }
                    .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; padding-top: 24px; border-top: 1px solid var(--border); }
                    .btn-cancel { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                    .btn-cancel:hover { background: #f8fafc; color: #0f172a; }
                    .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                    @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                    .flex-center { display: flex; align-items: center; justify-content: center; }
                    .gap-10 { gap: 10px; }
                    .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                    .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                    .status-pill.lead { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .status-pill.inactive { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
                    .status-pill.pending-review { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .status-pill.pending-approval { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                    .status-pill.confirmed { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
                    .status-pill.processing { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }
                    .status-pill.shipped { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
                    .status-pill.delivered { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                    .status-pill.rejected, .status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                    .status-pill.open { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
                    .status-pill.in-progress { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }
                    .status-pill.resolved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                    .status-pill.closed { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

                    @media (max-width: 768px) {
                        .detail-tabs { overflow-x: auto; }
                        .profile-grid { grid-template-columns: 1fr; }
                        .customer-quick-stats { grid-template-columns: 1fr 1fr; }
                        .form-grid { grid-template-columns: 1fr; }
                    }
                `}</style>
            </div>
        );
    }

    // ── LIST VIEW ──
    return (
        <div className="module-container">
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>{directoryOnly ? 'Customer Directory' : 'Customers (CRM)'}</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>{directoryOnly ? 'Manage your active customer base.' : 'Manage your customers, leads, and tracking.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-light)', marginRight: '10px' }}>
                        <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                        <input 
                            type="text" 
                            placeholder="Search customers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', width: '200px' }}
                        />
                    </div>
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToPDF} title="Export PDF"><Download size={16} /> PDF</button>
                    <button className="btn-secondary-light flex-center gap-8" onClick={exportToExcel} title="Export Excel"><Download size={16} /> Excel</button>
                    <button className="btn-primary flex-center gap-8" onClick={() => { setEditingId(null); setFormData({ name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active', customerType: 'Individual', company: '', gstNumber: '' }); setFormErrors({}); setShowModal(true); }}>
                        <Plus size={18} /> Add New Customer
                    </button>
                </div>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content-lg animate-pop">
                        <div className="modal-header">
                            <h2>{editingId ? 'Edit Customer' : 'Add New Customer'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>✕</button>
                        </div>
                        <div style={{ padding: '30px' }}>
                            <CustomerForm 
                                formData={formData}
                                setFormData={setFormData}
                                formErrors={formErrors}
                                setFormErrors={setFormErrors}
                                onSubmit={handleSubmit}
                                onCancel={handleCloseModal}
                                isLoading={false}
                                emailDisabled={false}
                                statusDisabled={false}
                                saveButtonText={editingId ? 'Update Customer' : 'Save Customer'}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="module-content">
                {loading ? (
                    <div className="flex-center" style={{ minHeight: '400px' }}><div className="spinner"></div></div>
                ) : (
                    <div className="dashboard-card-3d" style={{ overflow: 'hidden' }}>
                    <DataTable
                        title={directoryOnly ? "Directory Listing" : "All Customers"}
                        headers={directoryOnly 
                            ? ['Full Name', 'Organization Name', 'Contact Details', 'Industry', 'Action']
                            : ['Full Name', 'Organization Name', 'Contact Details', 'Industry', 'Status', 'Action']
                        }
                        data={directoryOnly ? customers.filter(c => c.status === 'Active') : customers}
                        renderRow={(c) => {
                            if (!((c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()))) return null;
                            return (
                                <tr key={c._id} onClick={() => openCustomerDetail(c)} style={{ cursor: 'pointer' }}>
                                <td><strong>{c.name}</strong></td>
                                <td>
                                    <div className="org-cell">
                                        <strong>{c.company || 'Individual Customer'}</strong>
                                        {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="web-link" onClick={e => e.stopPropagation()}><Globe size={12}/> Visit Site</a>}
                                    </div>
                                </td>
                                <td>
                                    <div className="contact-info-sm">
                                        <span><Mail size={12}/> {c.email}</span>
                                        <span><Phone size={12}/> {c.phone}</span>
                                    </div>
                                </td>
                                <td>{c.industry || '—'}</td>
                                {!directoryOnly && <td><span className={`status-pill ${c.status?.toLowerCase().replace(/ /g, '-') || 'active'}`}>{c.status || 'Active'}</span></td>}
                                <td>
                                    <div className="action-btns-row" onClick={e => e.stopPropagation()}>
                                        {isAdmin && c.status === 'Pending Review' && (
                                            <button className="action-btn-sm" style={{ background: 'var(--bg-app)', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', padding: '6px 8px' }} onClick={() => handleApprove(c._id)} title="Approve Customer"><UserCheck size={14}/></button>
                                        )}
                                        <button className="action-btn-sm" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-light)', color: 'var(--text-heading)', borderRadius: '6px', padding: '6px 8px' }} onClick={() => handleEdit(c)}><Edit2 size={14}/></button>
                                        <button className="action-btn-sm" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', padding: '6px 8px' }} onClick={() => handleDelete(c._id)}><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                            );
                        }}
                    />
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; }
                .header-actions { display: flex; align-items: center; gap: 10px; }
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
                .btn-export { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; background: var(--bg-hover, #f1f5f9); color: var(--text-primary); cursor: pointer; transition: all 0.2s; }
                .btn-export:hover { background: var(--primary-50, #eef2ff); color: var(--primary); }

                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; overflow-y: auto; }
                .modal-content-lg { width: 100%; max-width: 650px; background: #ffffff; border-radius: 12px; margin: auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); overflow: hidden; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 24px 30px; border-bottom: 1px solid var(--border); background: #ffffff; }
                .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px; border-radius: 6px; transition: background 0.2s; line-height: 1; display: flex; align-items: center; justify-content: center; }
                .close-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
                
                .modal-form { display: flex; flex-direction: column; padding: 30px; background: #ffffff; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
                .form-group:last-child { margin-bottom: 0; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
                
                .req { color: #ef4444; margin-left: 2px; }
                .error-text { color: #ef4444; font-size: 11px; margin-top: 4px; font-weight: 500; }
                .error-border { border-color: #ef4444 !important; }
                
                .input-with-icon { display: flex; align-items: center; gap: 10px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; padding: 0 12px; transition: border-color 0.2s; }
                .input-with-icon:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); background: var(--bg-card); }
                .input-with-icon input { background: none; border: none; padding: 12px 0; color: var(--text-primary); width: 100%; font-size: 14px; outline: none; }
                
                .form-group input:not([type]), .form-group input[type="text"], .form-group input[type="email"], .form-group input[type="url"], .form-group select, .form-group textarea {
                    padding: 12px; background: var(--bg-body); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; outline: none; transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); background: var(--bg-card); }
                .form-group input::placeholder, .form-group textarea::placeholder { color: var(--text-muted); }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: #ffffff; color: #0f172a; }

                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; padding-top: 24px; border-top: 1px solid var(--border); }
                .btn-cancel { background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-cancel:hover { background: #f8fafc; color: #0f172a; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .header-actions { flex-wrap: wrap; }
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Customers;
