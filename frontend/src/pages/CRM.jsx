import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { Briefcase, UserPlus, Mail, Phone, ExternalLink, Filter } from 'lucide-react';

const CRM = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', source: 'Web', status: 'Awaiting Review', estimatedValue: 0
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const fetchLeads = async () => {
        try {
            const { data } = await API.get('/leads');
            setLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAddLead = async (e) => {
        e.preventDefault();
        try {
            await API.post('/leads', formData);
            setShowModal(false);
            setFormData({ name: '', email: '', source: 'Web', status: 'Awaiting Review', estimatedValue: 0 });
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating lead');
        }
    };

    const handleConvert = async (id) => {
        try {
            await API.put(`/leads/${id}/convert`);
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.message || 'Conversion failed');
        }
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div>
                    <h1 className="title-gradient">Customer Relationship (CRM)</h1>
                    <p className="text-muted">Manage leads, customer interactions, and sales pipelines.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary flex-center gap-10" onClick={() => setShowModal(true)}><UserPlus size={18} /> Add New Lead</button>
                </div>
            </header>

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop">
                        <div className="modal-header">
                            <h2>Capture Potential Lead</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddLead} className="modal-form">
                            <div className="form-group">
                                <label>Business/Contact Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Starlink Corp" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Lead Source</label>
                                    <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                                        <option value="Web">Web Form</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Direct">Direct Contact</option>
                                        <option value="Event">Marketing Event</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estimated Value ($)</label>
                                    <input type="number" value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Register Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="crm-grid">
                <div className="glass-card stat-mini">
                    <p>Total Active Leads</p>
                    <h3>{leads.length}</h3>
                </div>
                <div className="glass-card stat-mini">
                    <p>Pipeline Value</p>
                    <h3>${leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="glass-card stat-mini">
                    <p>New (Last 7d)</p>
                    <h3>{leads.filter(l => new Date(l.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}</h3>
                </div>
            </div>

            <div className="module-content mt-30">
                <div className="glass-card table-wrapper">
                    <DataTable 
                        title="Lead Pipeline"
                        headers={['Customer Name', 'Contact Info', 'Source', 'Value', 'Status', 'Actions']}
                        data={leads}
                        renderRow={(lead) => (
                            <>
                                <td><strong>{lead.name}</strong></td>
                                <td><div className="contact-cell"><span><Mail size={12}/> {lead.email}</span></div></td>
                                <td>{lead.source}</td>
                                <td>${(lead.estimatedValue || 0).toLocaleString()}</td>
                                <td><span className={`status-pill ${lead.status?.toLowerCase().replace(/ /g, '-') || 'awaiting-review'}`}>{lead.status || 'Awaiting Review'}</span></td>
                                <td>
                                    <div className="flex-center gap-5">
                                        {isAdmin && lead.status === 'Awaiting Review' && (
                                            <button className="btn-table-action" onClick={() => handleConvert(lead._id)}>Quick Convert</button>
                                        )}
                                        <button className="btn-icon"><ExternalLink size={14}/></button>
                                    </div>
                                </td>
                            </>
                        )}
                    />
                </div>
            </div>
            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; gap: 20px; }
                .crm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .stat-mini { padding: 20px; text-align: center; }
                .stat-mini p { color: var(--text-muted); font-size: 13px; margin-bottom: 5px; }
                .stat-mini h3 { font-size: 24px; color: var(--primary); }
                .contact-cell { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text-muted); }
                .btn-icon { background: none; color: var(--primary); }
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
                .status-pill.qualified-lead { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.negotiation { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.closing-deal { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                .status-pill.initial-contact { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }
                .status-pill.awaiting-review { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.converted-to-vendor { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .status-pill.converted { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .status-pill.lost { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .btn-table-action { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; }
                .btn-table-action:hover { background: #10b981; color: white; }
                .gap-5 { gap: 5px; }
                .mt-30 { margin-top: 30px; }
                .table-wrapper { padding: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 600px; padding: 30px; position: relative; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; }
                .form-group select option { background: #1e293b; color: white; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-container { padding: 15px; }
                    .module-header { flex-direction: column; align-items: flex-start; padding: 20px; }
                    .header-actions { width: 100%; }
                    .header-actions button { width: 100%; }
                    .crm-grid { grid-template-columns: 1fr; }
                    .form-grid { grid-template-columns: 1fr; }
                    .modal-content { padding: 20px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default CRM;
