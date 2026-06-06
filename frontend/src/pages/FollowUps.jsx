import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { PhoneCall, Mail, Calendar, Clock, CheckCircle, AlertCircle, Plus, Filter, RefreshCw, X, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FollowUps = () => {
    const navigate = useNavigate();
    const [followups, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [toast, setToast] = useState(null);
    const [isLinked, setIsLinked] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Call',
        time: '',
        phone: '',
        email: '',
        notes: '',
        status: 'Pending'
    });

    const showToast = (msg, isSuccess = true) => {
        setToast({ msg, isSuccess });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchFollowUps = async () => {
        try {
            setLoading(true);
            const res = await API.get('/follow-ups');
            setFollowups(res.data);
            
            // Also fetch leads and customers for the Add modal
            const [leadsRes, custRes] = await Promise.all([
                API.get('/leads').catch(() => ({ data: [] })),
                API.get('/customers').catch(() => ({ data: [] }))
            ]);
            setLeads(leadsRes.data);
            setCustomers(custRes.data);
        } catch (err) {
            console.error('Error fetching follow-ups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const handleSaveFollowUp = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.name) return alert('Customer/Lead name is required.');
        if (!formData.type) return alert('Interaction Type is required.');
        if (!formData.time) return alert('Scheduled Date & Time is required.');

        try {
            if (editingId) {
                await API.put(`/follow-ups/${editingId}`, formData);
                showToast('Follow-up updated successfully!');
            } else {
                await API.post('/follow-ups', formData);
                showToast('Follow-up created successfully!');
            }
            closeModal();
            fetchFollowUps();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error saving follow-up', false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setIsLinked(false);
        setFormData({
            name: '',
            type: 'Call',
            time: '',
            phone: '',
            email: '',
            notes: '',
            status: 'Pending'
        });
    };

    const handleEditClick = async (id) => {
        try {
            setLoading(true);
            const res = await API.get(`/follow-ups/${id}`);
            const data = res.data;
            setFormData({
                name: data.name || '',
                type: data.type || 'Call',
                time: data.time || '',
                phone: data.phone || '',
                email: data.email || '',
                notes: data.notes || '',
                status: data.status || 'Pending'
            });
            
            // Check if it's linked to an existing customer/lead
            const linked = leads.find(l => l.name === data.name) || customers.find(c => c.name === data.name);
            setIsLinked(!!linked);
            
            setEditingId(id);
            setShowModal(true);
        } catch (err) {
            showToast('Failed to load follow-up data from database.', false);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (id) => {
        try {
            await API.put(`/follow-ups/${id}/status`, { status: 'Completed' });
            fetchFollowUps();
            showToast('Follow-up marked as completed!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error updating status', false);
        }
    };

    const overdueCount = followups.filter(f => f.status === 'Overdue').length;
    const pendingCount = followups.filter(f => f.status === 'Pending').length;
    
    // Completed Today
    const todayStr = new Date().toDateString();
    const completedCount = followups.filter(f => {
        if (f.status !== 'Completed') return false;
        const updatedDate = new Date(f.updatedAt || f.createdAt || Date.now()).toDateString();
        return updatedDate === todayStr;
    }).length;

    // Handle selecting a lead/customer to auto-fill phone/email
    const handlePersonSelect = (e) => {
        const val = e.target.value;
        if (!val) {
            setFormData(prev => ({...prev, name: ''}));
            setIsLinked(false);
            return;
        }
        
        let person = leads.find(l => l.name === val) || customers.find(c => c.name === val);
        if (person) {
            setFormData(prev => ({
                ...prev, 
                name: person.name, 
                phone: person.phone || person.contactNumber || prev.phone, 
                email: person.email || prev.email
            }));
            setIsLinked(true);
        } else {
            setFormData(prev => ({...prev, name: val}));
            setIsLinked(false);
        }
    };

    return (
        <div className="module-container">
            {toast && (
                <div className={`toast-notification ${toast.isSuccess ? 'success' : 'error'}`}>
                    {toast.isSuccess ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            {/* Breadcrumbs */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <span className="separator">/</span>
                <span className="crumb" onClick={() => navigate('/crm')}>CRM</span>
                <span className="separator">/</span>
                <span className="crumb active">Follow-ups</span>
            </div>

            <header className="module-header mt-15">
                <div>
                    <h1 className="title-gradient">Sales Follow-ups</h1>
                    <p className="text-muted">Manage interaction schedules and engagement priorities for your leads.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary flex-center gap-8" onClick={fetchFollowUps}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button className="btn-primary-blue flex-center gap-8" onClick={() => { setEditingId(null); setShowModal(true); }}>
                        <Plus size={16} /> Add Follow-up
                    </button>
                </div>
            </header>

            <div className="alerts-summary-row mt-30">
                <div className="glass-card alert-summary shadow-red">
                    <AlertCircle color="#ef4444" size={24}/>
                    <div>
                        <h3>Overdue Interactions</h3>
                        <p className="val text-danger">{overdueCount} Alerts</p>
                    </div>
                </div>
                <div className="glass-card alert-summary shadow-amber">
                    <Clock color="#f59e0b" size={24}/>
                    <div>
                        <h3>Pending Schedules</h3>
                        <p className="val text-warning">{pendingCount} Active</p>
                    </div>
                </div>
                <div className="glass-card alert-summary shadow-emerald">
                    <CheckCircle color="#10b981" size={24}/>
                    <div>
                        <h3>Completed Today</h3>
                        <p className="val text-success">{completedCount} Logged</p>
                    </div>
                </div>
            </div>

            <div className="module-content mt-30">
                {loading ? (
                    <div className="loading-card flex-center">
                        <RefreshCw className="animate-spin text-primary" size={28} />
                        <span className="ml-10">Fetching communication logs...</span>
                    </div>
                ) : (
                    <DataTable 
                        title="Communication Ledger"
                        headers={['Customer/Lead', 'Contact Type', 'Scheduled Time', 'Details & Notes', 'Status', 'Actions']}
                        data={followups}
                        renderRow={(a) => (
                            <tr key={a._id || a.id}>
                                <td>
                                    <div className="client-info">
                                        <strong>{a.name}</strong>
                                        <span className="client-contact text-muted">
                                            {a.phone || a.email || 'No contact provided'}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div className={`contact-type-chip ${a.type.toLowerCase()}`}>
                                        {a.type === 'Call' ? <PhoneCall size={13}/> : a.type === 'Email' ? <Mail size={13}/> : <Calendar size={13}/>}
                                        {a.type}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-center gap-5" style={{justifyContent: 'flex-start', color: 'var(--text-main)'}}>
                                        <Calendar size={13} className="text-muted"/> {a.time}
                                    </div>
                                </td>
                                <td>
                                    <div className="notes-preview text-muted" title={a.notes}>
                                        {a.notes || 'No description added'}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-pill ${a.status.toLowerCase()}`}>{a.status}</span>
                                </td>
                                <td>
                                    <div className="flex-center gap-8" style={{justifyContent: 'flex-start'}}>
                                        {a.status !== 'Completed' ? (
                                            <button className="btn-done" onClick={() => handleMarkComplete(a._id || a.id)}>
                                                <CheckCircle size={14}/> Mark Handled
                                            </button>
                                        ) : (
                                            <span className="text-success flex-center gap-5" style={{fontSize: '12px', fontWeight: 600}}>
                                                <CheckCircle size={14}/> Handled
                                            </span>
                                        )}
                                        {a.phone && (
                                            <a href={`tel:${a.phone}`} className="btn-call" title="Call">
                                                <PhoneCall size={14} /> Call
                                            </a>
                                        )}
                                        <button className="btn-edit" title="Edit/View" onClick={() => handleEditClick(a._id || a.id)}>
                                            View / Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-header">
                            <h2>{editingId ? 'Edit Follow-up Action' : 'Draft Follow-up Action'}</h2>
                            <button type="button" className="close-btn" onClick={closeModal}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSaveFollowUp} className="modal-form">
                            <div className="form-group">
                                <label>Client Name / Lead</label>
                                <div className="input-with-button">
                                    <input 
                                        type="text" 
                                        list="crm-contacts"
                                        required 
                                        placeholder="e.g. John Doe"
                                        value={formData.name} 
                                        onChange={handlePersonSelect} 
                                        readOnly={isLinked}
                                        className={isLinked ? 'read-only-input' : ''}
                                    />
                                    {isLinked && (
                                        <button 
                                            type="button" 
                                            className="btn-clear-link"
                                            onClick={() => {
                                                setIsLinked(false);
                                                setFormData(prev => ({...prev, name: ''}));
                                            }}
                                            title="Clear linked record"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <datalist id="crm-contacts">
                                    <optgroup label="Leads">
                                        {leads.map(l => <option key={`lead-${l._id}`} value={l.name} />)}
                                    </optgroup>
                                    <optgroup label="Customers">
                                        {customers.map(c => <option key={`cust-${c._id}`} value={c.name} />)}
                                    </optgroup>
                                </datalist>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Interaction Type</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                        <option value="Call">Phone Call</option>
                                        <option value="Email">Email Pitch</option>
                                        <option value="Meeting">Direct Meeting</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Scheduled Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={formData.time} 
                                        onChange={e => setFormData({...formData, time: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Phone Number (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. +91 98765 43210"
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address (Optional)</label>
                                    <input 
                                        type="email" 
                                        placeholder="e.g. client@company.com"
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})} 
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Action Notes & Purpose</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Explain the follow-up requirements..."
                                    value={formData.notes} 
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label>Initial Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="Pending">Pending (Scheduled)</option>
                                    <option value="Overdue">Overdue (Delayed action)</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-save">{editingId ? 'Save Changes' : 'Save Schedule'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .module-container { padding: 30px; position: relative; }
                .breadcrumb-nav { display: flex; gap: 8px; font-size: 12px; font-weight: 600; color: var(--text-muted); }
                .breadcrumb-nav .crumb { cursor: pointer; transition: color 0.2s; }
                .breadcrumb-nav .crumb:hover { color: #2563eb; }
                .breadcrumb-nav .crumb.active { color: var(--text-main); cursor: default; }
                .breadcrumb-nav .separator { color: rgba(255, 255, 255, 0.15); }
                
                .module-header { display: flex; justify-content: space-between; align-items: center; }
                .header-actions { display: flex; gap: 10px; }
                
                /* Toast */
                .toast-notification { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; align-items: center; gap: 10px; padding: 16px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); animation: slideIn 0.3s ease-out; }
                .toast-notification.success { background: #10b981; color: white; }
                .toast-notification.error { background: #ef4444; color: white; }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                /* Modal Specific */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
                .modal-content { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); position: relative; }
                .modal-header h2 { margin: 0; font-size: 18px; color: var(--text-primary); font-weight: 700; }
                .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; position: absolute; right: 20px; top: 20px; }
                .close-btn:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-main); }
                
                .modal-form { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border); border-radius: 8px; color: var(--text-main); font-size: 14px; outline: none; transition: all 0.2s; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; background: rgba(255, 255, 255, 0.05); }
                
                .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 600px) { .form-row-2 { grid-template-columns: 1fr; } }
                
                .input-with-button { display: flex; align-items: center; gap: 10px; }
                .read-only-input { background: rgba(0, 0, 0, 0.2) !important; color: var(--text-muted) !important; cursor: not-allowed; }
                .btn-clear-link { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 8px; padding: 0 12px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
                .btn-clear-link:hover { background: #ef4444; color: #fff; }

                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; padding-top: 20px; border-top: 1px solid var(--border); }
                .btn-cancel { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-main); padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-cancel:hover { background: rgba(255, 255, 255, 0.1); }
                .btn-save { background: #2563eb; border: none; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-save:hover { background: #1d4ed8; }
                
                .btn-primary-blue { background: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                .btn-primary-blue:hover { background: #1d4ed8; transform: translateY(-1px); }
                .btn-secondary { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-main); padding: 10px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; }
                .btn-secondary:hover { background: rgba(255, 255, 255, 0.08); }

                .alerts-summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .alert-summary { display: flex; align-items: center; gap: 20px; padding: 20px; border-radius: 12px; }
                .alert-summary h3 { font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
                .alert-summary .val { font-size: 20px; font-weight: 800; }
                
                .shadow-red { border-left: 4px solid #ef4444; }
                .shadow-amber { border-left: 4px solid #f59e0b; }
                .shadow-emerald { border-left: 4px solid #10b981; }
                
                .loading-card { background: var(--glass); border: 1px solid var(--border); padding: 40px; border-radius: 16px; min-height: 200px; color: var(--text-main); }
                
                .client-info { display: flex; flex-direction: column; gap: 2px; }
                .client-contact { font-size: 12px; }
                
                .contact-type-chip { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-muted); width: fit-content; padding: 4px 8px; border-radius: 6px; background: rgba(255, 255, 255, 0.05); }
                .contact-type-chip.call { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
                .contact-type-chip.email { color: #7c3aed; background: rgba(124, 58, 237, 0.1); }
                .contact-type-chip.meeting { color: #10b981; background: rgba(16, 185, 129, 0.1); }
                
                .notes-preview { max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
                
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
                .status-pill.overdue { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                
                .btn-done { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #10b981; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
                .btn-done:hover { background: #10b981; color: #ffffff; }

                .btn-call { background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); color: #3b82f6; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; text-decoration: none; transition: all 0.2s; }
                .btn-call:hover { background: #3b82f6; color: #ffffff; }

                .btn-edit { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-muted); font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
                .btn-edit:hover { background: rgba(255, 255, 255, 0.1); color: var(--text-main); }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .mt-15 { margin-top: 15px; }
                .mt-30 { margin-top: 30px; }
                .ml-10 { margin-left: 10px; }
                .gap-8 { gap: 8px; }
                .gap-5 { gap: 5px; }
            `}</style>
        </div>
    );
};

export default FollowUps;
