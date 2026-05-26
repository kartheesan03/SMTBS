import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { 
    LifeBuoy, Plus, ChevronRight, Filter, RefreshCw, 
    AlertTriangle, CheckCircle, Clock, Inbox, AlertCircle, FileText, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        customer: '',
        subject: '',
        description: '',
        priority: 'Medium'
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';
    const isSales = userInfo.role === 'Sales';

    const fetchTicketsAndCustomers = async () => {
        try {
            setLoading(true);
            const [ticketsRes, customersRes] = await Promise.all([
                API.get('/tickets'),
                API.get('/customers')
            ]);
            setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
            setCustomers(Array.isArray(customersRes.data) ? customersRes.data : []);
        } catch (err) {
            console.error('Error fetching support data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketsAndCustomers();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tickets', formData);
            setShowModal(false);
            setFormData({ customer: '', subject: '', description: '', priority: 'Medium' });
            fetchTicketsAndCustomers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating ticket');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/tickets/${id}/status`, { status: newStatus });
            fetchTicketsAndCustomers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const openCount = tickets.filter(t => t.status === 'Open').length;
    const progressCount = tickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

    return (
        <div className="support-workspace">
            {/* Breadcrumb */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">Customer Support</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title">Support Tickets</h1>
                    <p className="header-subtitle">Handle customer claims, technical issues, and dispatch tracking assistance.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-light flex-center gap-8" onClick={fetchTicketsAndCustomers}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    {['Admin', 'Sales', 'Manager'].includes(userInfo.role) && (
                        <button className="btn-primary-blue flex-center gap-8" onClick={() => setShowModal(true)}>
                            <Plus size={16} /> Open Ticket
                        </button>
                    )}
                </div>
            </header>

            {/* Metrics cards */}
            <section className="support-metrics-grid">
                <div className="support-metric-card border-red">
                    <AlertTriangle color="#ef4444" size={24} />
                    <div>
                        <span className="label text-danger">Open Tickets</span>
                        <span className="value text-danger">{openCount}</span>
                    </div>
                </div>
                <div className="support-metric-card border-amber">
                    <Clock color="#f59e0b" size={24} />
                    <div>
                        <span className="label text-warning">In Progress</span>
                        <span className="value text-warning">{progressCount}</span>
                    </div>
                </div>
                <div className="support-metric-card border-emerald">
                    <CheckCircle color="#10b981" size={24} />
                    <div>
                        <span className="label text-success">Resolved Today</span>
                        <span className="value text-success">{resolvedCount}</span>
                    </div>
                </div>
                <div className="support-metric-card">
                    <Inbox color="#3b82f6" size={24} />
                    <div>
                        <span className="label">Total Issues</span>
                        <span className="value">{tickets.length}</span>
                    </div>
                </div>
            </section>

            {/* Active Tickets List */}
            <div className="table-card mt-10">
                {loading ? (
                    <div className="loading-state flex-center">
                        <RefreshCw className="animate-spin text-primary" size={28} />
                        <span className="ml-10">Fetching ticket registers...</span>
                    </div>
                ) : (
                    <DataTable 
                        title="Customer Queries Ledger"
                        headers={['Ticket Info', 'Organization', 'Subject & Description', 'Priority', 'Status', 'Representative']}
                        data={tickets}
                        renderRow={(t) => {
                            const statusClass = t.status.toLowerCase().replace(/ /g, '-');
                            const priorityClass = t.priority.toLowerCase();

                            return (
                                <tr key={t._id}>
                                    <td>
                                        <div className="ticket-code-cell">
                                            <code className="ticket-code">{t.ticketNumber}</code>
                                            <span className="date-sub">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="org-cell">
                                            <strong>{t.customer?.name || 'Walk-in'}</strong>
                                            <span className="company-tag text-muted">{t.customer?.company || 'Direct'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="desc-cell">
                                            <strong className="subj-title">{t.subject}</strong>
                                            <p className="desc-para text-muted" title={t.description}>{t.description}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`priority-badge ${priorityClass}`}>{t.priority}</span>
                                    </td>
                                    <td>
                                        {['Admin', 'Manager', 'Sales'].includes(userInfo.role) ? (
                                            <select 
                                                value={t.status} 
                                                onChange={(e) => handleStatusChange(t._id, e.target.value)}
                                                className={`status-select-premium ${statusClass}`}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        ) : (
                                            <span className={`status-badge-inline ${statusClass}`}>{t.status}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="flex-center gap-5 text-muted" style={{justifyContent: 'flex-start', fontSize: '13px'}}>
                                            <User size={13} /> {t.assignedTo?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        }}
                    />
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-header">
                            <h2>Draft Support Ticket</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="modal-form">
                            <div className="form-group">
                                <label>Select Customer Profile</label>
                                <select 
                                    required 
                                    value={formData.customer} 
                                    onChange={e => setFormData({...formData, customer: e.target.value})}
                                >
                                    <option value="">Choose Customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.company || 'Direct'})</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subject / Headline</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Explain the summary of the issue..."
                                    value={formData.subject} 
                                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                                />
                            </div>

                            <div className="form-group">
                                <label>Detailed Description</label>
                                <textarea 
                                    rows="4" 
                                    required
                                    placeholder="Include order numbers, shipping details, or material complaints..."
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Incident Priority</label>
                                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                        <option value="Low">Low (General Query)</option>
                                        <option value="Medium">Medium (Operational Hinder)</option>
                                        <option value="High">High (Breaking Delay / Damage)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Launch Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .support-workspace {
                    padding: 24px;
                    background-color: #f1f5f9;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--dash-text-muted, #64748b);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .crumb:hover { color: #2563eb; }
                .crumb.active { color: #0f172a; cursor: default; }
                .separator { color: #94a3b8; }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; }
                .header-subtitle { font-size: 13px; color: #64748b; margin: 0; }
                
                .btn-primary-blue { background: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
                .btn-primary-blue:hover { background: #1d4ed8; transform: translateY(-1px); }
                .btn-secondary-light { background: #ffffff; border: 1px solid #e2e8f0; color: #475569; padding: 10px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; }
                .btn-secondary-light:hover { background: #f8fafc; border-color: #cbd5e1; }
                
                .support-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .support-metric-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    box-shadow: var(--dash-shadow-sm, 0 1px 3px rgba(0,0,0,0.05));
                }
                
                .border-red { border-left: 4px solid #ef4444; }
                .border-amber { border-left: 4px solid #f59e0b; }
                .border-emerald { border-left: 4px solid #10b981; }
                
                .support-metric-card .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; display: block; }
                .support-metric-card .value { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.1; }
                .text-danger { color: #ef4444 !important; }
                .text-warning { color: #f59e0b !important; }
                .text-success { color: #10b981 !important; }
                
                .table-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 8px;
                    box-shadow: var(--dash-shadow-sm);
                    overflow-x: auto;
                }
                
                .loading-state {
                    padding: 40px;
                    color: #475569;
                    min-height: 200px;
                }
                
                .ticket-code-cell { display: flex; flex-direction: column; gap: 4px; }
                .ticket-code { background: #eff6ff; color: #2563eb; padding: 3px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 12px; width: fit-content; }
                .date-sub { font-size: 11px; color: #94a3b8; }
                
                .org-cell { display: flex; flex-direction: column; gap: 2px; }
                .company-tag { font-size: 11px; }
                
                .desc-cell { max-width: 300px; }
                .subj-title { font-size: 14px; color: #1e293b; display: block; margin-bottom: 2px; }
                .desc-para { font-size: 12px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                
                .priority-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; width: fit-content; display: inline-block; }
                .priority-badge.low { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .priority-badge.medium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .priority-badge.high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .status-select-premium {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }
                
                .status-badge-inline { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
                
                .status-select-premium.open, .status-badge-inline.open { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .status-select-premium.in-progress, .status-badge-inline.in-progress { background-color: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-select-premium.resolved, .status-badge-inline.resolved { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-select-premium.closed, .status-badge-inline.closed { background-color: #f1f5f9; color: #64748b; }
                
                /* Modal Styles */
                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { background: white; border-radius: 16px; width: 90%; max-width: 500px; padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .modal-header h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
                .close-btn { background: none; border: none; font-size: 18px; color: #64748b; cursor: pointer; }
                
                .modal-form { display: flex; flex-direction: column; gap: 16px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
                .form-group input, .form-group select, .form-group textarea {
                    padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: #ffffff; color: #0f172a;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #2563eb; outline: none; }
                
                .form-row-2 { display: grid; grid-template-columns: 1fr; gap: 16px; }
                
                .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px; }
                .btn-cancel { background: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
                .btn-save { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1); }
                .btn-save:hover { background: #1d4ed8; }
                
                .animate-pop { animation: pop 0.25s ease-out; }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .mt-10 { margin-top: 10px; }
                .ml-10 { margin-left: 10px; }
                .gap-8 { gap: 8px; }
                .gap-5 { gap: 5px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
            `}</style>
        </div>
    );
};

export default Support;
