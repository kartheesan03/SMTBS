import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, UserPlus, Mail, Phone, ExternalLink, Filter, 
    ChevronRight, Search, Plus, Calendar, DollarSign
} from 'lucide-react';

const CRM = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', source: 'Web', status: 'Initial Contact', estimatedValue: 0
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
            setFormData({ name: '', email: '', source: 'Web', status: 'Initial Contact', estimatedValue: 0 });
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating lead');
        }
    };

    const handleViewLead = (lead) => {
        setSelectedLead({ ...lead });
        setShowLeadModal(true);
    };

    const handleUpdateLead = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/leads/${selectedLead._id}`, selectedLead);
            setShowLeadModal(false);
            fetchLeads();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating lead');
        }
    };

    // Reference Mockup metrics
    const totalLeads = leads.length || 620;
    const pipelineValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) || 3200000; // Mock 3.2M
    const openDealsCount = 180;
    const wonDealsCount = 45;

    const recentActivities = [
        { desc: 'New lead from Website', time: '10 mins ago', type: 'web' },
        { desc: 'Meeting scheduled with Acme Corp', time: '1 hour ago', type: 'meet' },
        { desc: 'Proposal sent to Tech Solutions', time: '2 hours ago', type: 'prop' },
        { desc: 'Deal won with Global Industries', time: '3 hours ago', type: 'won' }
    ];

    return (
        <div className="crm-workspace">
            {/* Breadcrumb */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">CRM Management</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title">CRM Dashboard</h1>
                    <p className="header-subtitle">Manage leads, customer interactions, and sales pipelines.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary-blue flex-center gap-8" onClick={() => setShowModal(true)}>
                        <UserPlus size={16} /> Add New Lead
                    </button>
                </div>
            </header>

            {/* 4 Stats Cards */}
            <section className="crm-metrics-grid">
                <div className="crm-metric-card">
                    <span className="label">Total Leads</span>
                    <span className="value">{totalLeads}</span>
                </div>
                <div className="crm-metric-card">
                    <span className="label">Pipeline Value</span>
                    <span className="value">${pipelineValue.toLocaleString()}</span>
                </div>
                <div className="crm-metric-card border-orange">
                    <span className="label text-orange">Open Deals</span>
                    <span className="value text-orange">{openDealsCount}</span>
                </div>
                <div className="crm-metric-card border-green">
                    <span className="label text-green">Won Deals</span>
                    <span className="value text-green">{wonDealsCount}</span>
                </div>
            </section>

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Custom Funnel Chart */}
                <div className="chart-card">
                    <h3 className="card-title">Sales Pipeline</h3>
                    <div className="funnel-container">
                        <div className="funnel-stage stage-initial">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Initial Contact</span>
                            <span className="stage-value">620</span>
                        </div>
                        <div className="funnel-stage stage-qualified">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Qualified</span>
                            <span className="stage-value">320</span>
                        </div>
                        <div className="funnel-stage stage-proposal">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Proposal</span>
                            <span className="stage-value">180</span>
                        </div>
                        <div className="funnel-stage stage-negotiation">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Negotiation</span>
                            <span className="stage-value">89</span>
                        </div>
                        <div className="funnel-stage stage-closing-deal">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Closing Deal</span>
                            <span className="stage-value">65</span>
                        </div>
                        <div className="funnel-stage stage-won">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Won</span>
                            <span className="stage-value">45</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="chart-card">
                    <h3 className="card-title">Recent Activities</h3>
                    <div className="activities-list">
                        {recentActivities.map((act, idx) => (
                            <div key={idx} className="activity-row">
                                <span className={`act-icon ${act.type}`}>📞</span>
                                <div className="info">
                                    <span className="desc">{act.desc}</span>
                                    <span className="time">{act.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="table-card">
                <h3 className="card-title p-16">All Active Leads</h3>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Contact Info</th>
                            <th>Source</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.filter(l => ['Initial Contact', 'Qualified Lead', 'Proposal Sent', 'Negotiation', 'Closing Deal', 'Won'].includes(l.status)).map((lead) => (
                            <tr key={lead._id}>
                                <td className="lead-name-cell">{lead.name}</td>
                                <td>
                                    <div className="contact-cell">
                                        <span><Mail size={12} style={{ marginRight: '4px' }} /> {lead.email}</span>
                                    </div>
                                </td>
                                <td>{lead.source}</td>
                                <td><strong>${(lead.estimatedValue || 0).toLocaleString()}</strong></td>
                                <td>
                                    <span className={`status-badge-inline ${lead.status?.toLowerCase().replace(/ /g, '-') || 'initial-contact'}`}>
                                        {lead.status || 'Initial Contact'}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex-center gap-6">
                                        <button className="action-btn" onClick={() => handleViewLead(lead)} title="View/Edit Lead">
                                            <ExternalLink size={14}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
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
                                <button type="submit" className="btn-save">Register Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View/Edit Lead Modal */}
            {showLeadModal && selectedLead && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-header">
                            <h2>Lead Details</h2>
                            <button className="close-btn" onClick={() => setShowLeadModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateLead} className="modal-form">
                            <div className="form-group">
                                <label>Customer Name</label>
                                <input type="text" required value={selectedLead.name} onChange={e => setSelectedLead({...selectedLead, name: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Contact Info (Email)</label>
                                <input type="email" required value={selectedLead.email} onChange={e => setSelectedLead({...selectedLead, email: e.target.value})} />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Lead Source</label>
                                    <select value={selectedLead.source} onChange={e => setSelectedLead({...selectedLead, source: e.target.value})}>
                                        <option value="Web">Web Form</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Direct">Direct Contact</option>
                                        <option value="Event">Marketing Event</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Estimated Value ($)</label>
                                    <input type="number" value={selectedLead.estimatedValue} onChange={e => setSelectedLead({...selectedLead, estimatedValue: Number(e.target.value)})} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Status</label>
                                    <select value={selectedLead.status} onChange={e => setSelectedLead({...selectedLead, status: e.target.value})}>
                                        <option value="Initial Contact">Initial Contact</option>
                                        <option value="Qualified Lead">Qualified Lead</option>
                                        <option value="Proposal Sent">Proposal Sent</option>
                                        <option value="Negotiation">Negotiation</option>
                                        <option value="Closing Deal">Closing Deal</option>
                                        <option value="Won">Won</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notes / Follow-up Details</label>
                                <textarea 
                                    rows="3" 
                                    value={selectedLead.notes || ''} 
                                    onChange={e => setSelectedLead({...selectedLead, notes: e.target.value})} 
                                    placeholder="Add notes or follow-up details..."
                                    className="textarea-input"
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowLeadModal(false)}>Close</button>
                                <button type="submit" className="btn-save">Update Lead</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .crm-workspace {
                    padding: 24px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .crumb:hover {
                    color: var(--primary);
                }
                
                .crumb.active {
                    color: var(--text-primary);
                    cursor: default;
                }
                
                .separator {
                    color: var(--text-muted);
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }
                
                .header-subtitle {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0;
                }
                
                .btn-primary-blue {
                    background: var(--primary);
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    display: inline-flex;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-primary-blue:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }

                /* Stats Cards styling */
                .crm-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .crm-metric-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .crm-metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .border-orange { border-bottom: 3px solid var(--warning); }
                .border-green { border-bottom: 3px solid var(--success); }
                
                .crm-metric-card .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .crm-metric-card .value {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }
                
                .text-orange { color: var(--warning); }
                .text-green { color: var(--success); }

                /* Charts Row */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                }
                
                .card-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 20px 0;
                }
                
                .card-title.p-16 {
                    padding: 20px 20px 0 20px;
                }

                /* Sales Pipeline (Custom Funnel Chart) Styling */
                .funnel-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 10px 0;
                }
                
                .funnel-stage {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    border-radius: 8px;
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 700;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .funnel-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.95;
                    z-index: 1;
                }
                
                .stage-name, .stage-value {
                    position: relative;
                    z-index: 2;
                }
                
                .stage-initial { width: 100%; }
                .stage-initial .funnel-bg { background-color: var(--primary); opacity: 0.7; }
                
                .stage-qualified { width: 90%; }
                .stage-qualified .funnel-bg { background-color: var(--primary); opacity: 0.8; }
                
                .stage-proposal { width: 80%; }
                .stage-proposal .funnel-bg { background-color: var(--primary); opacity: 0.9; }
                
                .stage-negotiation { width: 70%; }
                .stage-negotiation .funnel-bg { background-color: var(--primary); }
                
                .stage-closing-deal { width: 65%; }
                .stage-closing-deal .funnel-bg { background-color: var(--primary); }
                
                .stage-won { width: 60%; }
                .stage-won .funnel-bg { background-color: var(--success); }

                /* Activities List styling */
                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .activity-row {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 12px 0;
                    border-bottom: 1px dashed var(--border);
                }
                
                .activity-row:last-child {
                    border-bottom: none;
                }
                
                .act-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }
                
                .activity-row .info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .activity-row .desc {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .activity-row .time {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                /* Leads Table styling */
                .table-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 8px;
                    box-shadow: var(--shadow-sm);
                    overflow-x: auto;
                }
                
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .modern-table th {
                    text-align: left;
                    padding: 16px 20px;
                    color: var(--text-muted);
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    border-bottom: 2px solid var(--border);
                    letter-spacing: 0.5px;
                }
                
                .modern-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    font-size: 14px;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                
                .modern-table tbody tr:hover td {
                    background-color: var(--bg-hover);
                }
                
                .lead-name-cell {
                    font-weight: 700 !important;
                    color: var(--text-primary);
                }
                
                .contact-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-size: 13px;
                    color: var(--text-muted);
                }
                
                .status-badge-inline {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 6px 10px;
                    border-radius: 20px;
                    display: inline-block;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .status-badge-inline.initial-contact { background-color: var(--primary-50); color: var(--primary); }
                .status-badge-inline.qualified-lead { background-color: var(--primary-50); color: var(--primary); }
                .status-badge-inline.proposal-sent { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.negotiation { background-color: var(--warning-light); color: var(--warning); }
                .status-badge-inline.closing-deal { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.won { background-color: var(--success-light); color: var(--success); }
                .status-badge-inline.lost { background-color: var(--danger-light); color: var(--danger); }
                .status-badge-inline.converted-to-customer { background-color: var(--success-light); color: var(--success); }
                
                .btn-approve {
                    background: var(--success-light);
                    color: var(--success);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .btn-approve:hover {
                    background: color-mix(in srgb, var(--success) 20%, transparent);
                }
                
                .action-btn {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 8px;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s;
                }
                
                .action-btn:hover {
                    background: var(--primary-50);
                    color: var(--primary);
                    border-color: var(--primary);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                
                .modal-content {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    width: 100%;
                    max-width: 600px;
                    padding: 32px;
                    box-shadow: var(--shadow-lg);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 16px;
                }
                
                .modal-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .close-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }
                
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .form-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-secondary);
                }
                
                .form-group select, .form-group input {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 14px;
                    width: 100%;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group select:focus, .textarea-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-50);
                    background: var(--bg-card);
                }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                
                .textarea-input {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 14px;
                    width: 100%;
                    outline: none;
                    transition: border-color 0.2s;
                    resize: vertical;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .btn-cancel {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-cancel:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                    border-color: var(--border-hover);
                }
                
                .btn-save {
                    background: var(--primary);
                    color: #ffffff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    border: none;
                    cursor: pointer;
                    transition: 0.2s;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
                
                .btn-save:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-8 { gap: 8px; }
                .gap-6 { gap: 6px; }

                .animate-pop { animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .crm-metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .crm-workspace { padding: 16px; }
                }
                
                @media (max-width: 480px) {
                    .crm-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default CRM;
