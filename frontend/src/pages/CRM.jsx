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
                        <div className="funnel-stage stage-leads">
                            <span className="funnel-bg"></span>
                            <span className="stage-name">Leads</span>
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
                        {leads.map((lead) => (
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
                                    <span className={`status-badge-inline ${lead.status?.toLowerCase().replace(/ /g, '-') || 'awaiting-review'}`}>
                                        {lead.status || 'Awaiting Review'}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex-center gap-6">
                                        {isAdmin && lead.status === 'Awaiting Review' && (
                                            <button className="btn-approve" onClick={() => handleConvert(lead._id)}>Quick Convert</button>
                                        )}
                                        <button className="action-btn"><ExternalLink size={14}/></button>
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

            <style jsx="true">{`
                .crm-workspace {
                    padding: 24px;
                    background-color: var(--dash-bg);
                    min-height: 100vh;
                    color: var(--dash-text-main);
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
                    color: var(--dash-text-muted);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .crumb:hover {
                    color: #2563eb;
                }
                
                .crumb.active {
                    color: #0f172a;
                    cursor: default;
                }
                
                .separator {
                    color: #94a3b8;
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                
                .header-subtitle {
                    font-size: 13px;
                    color: var(--dash-text-muted);
                    margin: 0;
                }
                
                .btn-primary-blue {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    display: inline-flex;
                    align-items: center;
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
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .border-orange { border-color: #fef3c7; }
                .border-green { border-color: #bbf7d0; }
                
                .crm-metric-card .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--dash-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .crm-metric-card .value {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                
                .text-orange { color: #f59e0b; }
                .text-green { color: #10b981; }

                /* Charts Row */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .card-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                }
                
                .card-title.p-16 {
                    padding: 16px 16px 0 16px;
                }

                /* Sales Pipeline (Custom Funnel Chart) Styling */
                .funnel-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 10px 0;
                }
                
                .funnel-stage {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    border-radius: 6px;
                    color: #ffffff;
                    font-size: 11px;
                    font-weight: 700;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                }
                
                .funnel-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.9;
                    z-index: 1;
                }
                
                .stage-name, .stage-value {
                    position: relative;
                    z-index: 2;
                }
                
                .stage-leads { width: 100%; }
                .stage-leads .funnel-bg { background-color: #0284c7; }
                
                .stage-qualified { width: 90%; }
                .stage-qualified .funnel-bg { background-color: #0ea5e9; }
                
                .stage-proposal { width: 80%; }
                .stage-proposal .funnel-bg { background-color: #eab308; }
                
                .stage-negotiation { width: 70%; }
                .stage-negotiation .funnel-bg { background-color: #f97316; }
                
                .stage-won { width: 60%; }
                .stage-won .funnel-bg { background-color: #10b981; }

                /* Activities List styling */
                .activities-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .activity-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 0;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .activity-row:last-child {
                    border-bottom: none;
                }
                
                .act-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .activity-row .info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .activity-row .desc {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e293b;
                }
                
                .activity-row .time {
                    font-size: 11px;
                    color: var(--dash-text-muted);
                }

                /* Leads Table styling */
                .table-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 8px;
                    box-shadow: var(--dash-shadow-sm);
                    overflow-x: auto;
                }
                
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .modern-table th {
                    text-align: left;
                    padding: 14px 16px;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    border-bottom: 2px solid #f1f5f9;
                }
                
                .modern-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1e293b;
                }
                
                .modern-table tbody tr:hover td {
                    background-color: #f8fafc;
                }
                
                .lead-name-cell {
                    font-weight: 600;
                    color: #0f172a;
                }
                
                .contact-cell {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    font-size: 12px;
                    color: #64748b;
                }
                
                .status-badge-inline {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 6px;
                    display: inline-block;
                }
                
                .status-badge-inline.awaiting-review { background-color: #fffbeb; color: #f59e0b; }
                .status-badge-inline.qualified-lead { background-color: #ecfdf5; color: #10b981; }
                .status-badge-inline.negotiation { background-color: #fffbeb; color: #f59e0b; }
                .status-badge-inline.closing-deal { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.converted { background-color: #ecfdf5; color: #10b981; }
                .status-badge-inline.lost { background-color: #fef2f2; color: #ef4444; }
                
                .btn-approve {
                    background: #10b981;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                }
                
                .btn-approve:hover {
                    background: #059669;
                }
                
                .action-btn {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 6px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .action-btn:hover {
                    background: #2563eb;
                    color: #ffffff;
                    border-color: #2563eb;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100;
                    padding: 20px;
                }
                
                .modal-content {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    padding: 24px;
                    box-shadow: var(--dash-shadow-lg);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 12px;
                }
                
                .modal-header h2 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 18px;
                    cursor: pointer;
                }
                
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .form-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                }
                
                .form-group select, .form-group input {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px;
                    color: #1e293b;
                    font-size: 13px;
                    width: 100%;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 10px;
                }
                
                .btn-cancel {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                }
                
                .btn-save {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                }
                
                .btn-save:hover {
                    background: #1d4ed8;
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
                }
                
                @media (max-width: 480px) {
                    .crm-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default CRM;
