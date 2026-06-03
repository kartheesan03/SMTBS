import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { 
    ChevronRight, RefreshCw, AlertTriangle, CheckCircle, Clock, Inbox, User, HelpCircle, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [faqSearch, setFaqSearch] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const [formData, setFormData] = useState({
        customer: '',
        subject: '',
        description: '',
        priority: 'Low',
        category: 'General'
    });

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    const faqs = [
        {
            question: "How do I register a new employee under SMTBMS?",
            answer: "To register a new employee, go to the Employee Management page (HRMS) from the sidebar, click the \"Add Employee\" button, fill in the employee's first name, last name, department, designation, and contact info, and click \"Create Profile\". This will automatically set up their system user login as well."
        },
        {
            question: "What is the \"Low Stock Alert\" trigger threshold?",
            answer: "The default low stock warning threshold is set to 10 units for most materials. You can configure individual material thresholds directly on the Materials Tracking module under each item's details. If quantity falls below the threshold, an automated in-app system warning is instantly triggered for Warehouse Stock Controllers and Admins."
        },
        {
            question: "How do manual database backups work in SMTBMS?",
            answer: "SMTBMS schedules full automated database backups to our cloud storage vaults every night. For manual backups, administrators can trigger the backup runner task inside the System Settings module under the Maintenance tab to download a raw database export instantly."
        },
        {
            question: "How can I connect the Slack Notifications workspace integration?",
            answer: "Go to System Settings -> Integrations tab, find the Slack integration card, and click \"Connect\". You will be redirected to choose your target channel and authorize the SMTBMS webhook to stream instant notifications for stock warnings and critical order updates."
        }
    ];

    const filteredFaqs = faqs.filter(faq => 
        faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );

    const fetchTicketsAndCustomers = async () => {
        setLoading(true);
        
        // 1. Fetch tickets
        try {
            const ticketsRes = await API.get('/tickets');
            setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        } catch (err) {
            console.error('Error fetching support tickets:', err);
        }

        // 2. Fetch leads only (shown under "Customers (CRM)" in sidebar)
        try {
            const leadsRes = await API.get('/leads');
            const fetchedLeads = (Array.isArray(leadsRes.data) ? leadsRes.data : [])
                .map(l => ({ ...l, customerModel: 'Lead', company: l.name }));
            setCustomers(fetchedLeads);
        } catch (err) {
            console.error('Error fetching support leads:', err);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchTicketsAndCustomers();
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            
            const selectedCust = customers.find(c => String(c._id) === String(formData.customer));
            const ticketPayload = {
                ...formData,
                customerModel: selectedCust?.customerModel || 'Customer'
            };
            
            await API.post('/tickets', ticketPayload);
            setFormData({ customer: '', subject: '', description: '', priority: 'Low', category: 'General' });
            fetchTicketsAndCustomers();
            alert('Support Ticket submitted successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating ticket');
        } finally {
            setSubmitting(false);
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
                <span className="crumb active">Help & Support</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title flex-center gap-8" style={{justifyContent: 'flex-start'}}>
                        <span>🤝</span> Help & Support Desk
                    </h1>
                    <p className="header-subtitle">Explore user manuals, review common operational queries, or submit help tickets.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-light flex-center gap-8" onClick={fetchTicketsAndCustomers}>
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Desk
                    </button>
                </div>
            </header>

            {/* Support Desk Two-Column Layout */}
            <div className="support-two-column-grid">
                
                {/* Left Column: FAQ Accordions */}
                <div className="support-column-card card-faq">
                    <div className="card-heading-section">
                        <h2 className="card-title">Knowledge Base FAQs</h2>
                        <p className="card-subtitle">Search system reference details instantly to guide operations.</p>
                    </div>

                    <div className="faq-search-wrapper">
                        <Search size={16} className="faq-search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search FAQ articles..." 
                            value={faqSearch}
                            onChange={e => setFaqSearch(e.target.value)}
                            className="faq-search-input"
                        />
                    </div>

                    <div className="accordion-list">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, idx) => {
                                const isExpanded = expandedFaq === idx;
                                return (
                                    <div key={idx} className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
                                        <button 
                                            type="button" 
                                            className="accordion-header"
                                            onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                                        >
                                            <span className="faq-question">{faq.question}</span>
                                            <span className="arrow-icon">{isExpanded ? '▲' : '▼'}</span>
                                        </button>
                                        {isExpanded && (
                                            <div className="accordion-content animate-slide-down">
                                                <p>{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-faq-results">
                                <HelpCircle size={24} className="text-muted mb-8" />
                                <p className="text-muted">No FAQ articles found matching your query.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Inline Ticket Submission Form */}
                <div className="support-column-card card-form">
                    <div className="card-heading-section">
                        <h2 className="card-title">Submit Helpdesk Support Ticket</h2>
                        <p className="card-subtitle">Report system issues or request access logs directly from admins.</p>
                    </div>

                    <form onSubmit={handleCreateTicket} className="inline-ticket-form">
                        <div className="form-group">
                            <label className="form-label">Select Customer Profile</label>
                            <select 
                                required 
                                value={formData.customer} 
                                onChange={e => setFormData({...formData, customer: e.target.value})}
                                className="form-input"
                            >
                                <option value="" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Choose Customer...</option>
                                {customers.map(c => (
                                    <option key={c._id} value={c._id} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                                        {c.name}{c.company && c.company !== c.name ? ` (${c.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Subject / Issue Title</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="e.g. ERP procurement API error"
                                value={formData.subject} 
                                onChange={e => setFormData({...formData, subject: e.target.value})} 
                                className="form-input"
                            />
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select 
                                    value={formData.category} 
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    className="form-input"
                                >
                                    <option value="General" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>General</option>
                                    <option value="Technical" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Technical</option>
                                    <option value="Billing" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Billing</option>
                                    <option value="Other" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select 
                                    value={formData.priority} 
                                    onChange={e => setFormData({...formData, priority: e.target.value})}
                                    className="form-input"
                                >
                                    <option value="Low" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Low</option>
                                    <option value="Medium" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Medium</option>
                                    <option value="High" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>High</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea 
                                rows="3" 
                                required
                                placeholder="Detail the issue or request instructions here..."
                                value={formData.description} 
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="form-input textarea-fixed"
                            />
                        </div>

                        <button type="submit" className="btn-submit-ticket" disabled={submitting}>
                            {submitting ? 'Launching Ticket...' : 'Submit Ticket'}
                        </button>
                    </form>
                </div>
            </div>

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
                        <span className="label text-success">Resolved/Closed</span>
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

            {/* Active Tickets List (Wide Span Ledger) */}
            <div className="table-card">
                {loading ? (
                    <div className="loading-state flex-center">
                        <RefreshCw className="animate-spin text-primary" size={28} />
                        <span className="ml-10">Fetching ticket registers...</span>
                    </div>
                ) : (
                    <DataTable 
                        title="Customer Queries Ledger"
                        headers={['Ticket Info', 'Organization', 'Subject & Details', 'Priority', 'Status', 'Representative']}
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
                                            {t.customer?.company && t.customer.company !== t.customer.name && (
                                                <span className="company-tag text-muted">{t.customer.company}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="desc-cell">
                                            <div className="subj-header-inline">
                                                <strong className="subj-title">{t.subject}</strong>
                                                <span className="category-pill-small">{t.category || 'General'}</span>
                                            </div>
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
                                                <option value="Open" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Open</option>
                                                <option value="In Progress" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>In Progress</option>
                                                <option value="Resolved" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Resolved</option>
                                                <option value="Closed" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Closed</option>
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

            <style jsx="true">{`
                .support-workspace {
                    padding: 30px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .crumb:hover { color: var(--primary); }
                .crumb.active { color: var(--text-primary); cursor: default; }
                .separator { color: var(--text-muted); }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
                .header-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
                
                .btn-secondary-light { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); padding: 10px 18px; border-radius: var(--radius-md, 8px); font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); }
                .btn-secondary-light:hover { background: var(--bg-hover); border-color: var(--border-hover); color: var(--text-primary); }
                
                /* Two-Column Support Section */
                .support-two-column-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 25px;
                }
                
                .support-column-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 28px;
                    box-shadow: var(--shadow-sm);
                }
                
                .card-heading-section {
                    margin-bottom: 24px;
                }
                
                .card-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 6px 0;
                }
                
                .card-subtitle {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0;
                }
                
                /* FAQ Accordion Column */
                .faq-search-wrapper {
                    position: relative;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                }
                
                .faq-search-icon {
                    position: absolute;
                    left: 16px;
                    color: var(--text-muted);
                    pointer-events: none;
                }
                
                .faq-search-input {
                    width: 100%;
                    padding: 12px 16px 12px 44px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-full, 9999px);
                    font-size: 14px;
                    background: var(--bg-body);
                    color: var(--text-primary);
                    outline: none;
                    transition: all 0.2s;
                }
                
                .faq-search-input:focus {
                    border-color: var(--primary);
                    background: var(--bg-card);
                    box-shadow: 0 0 0 3px var(--primary-50);
                }
                
                .accordion-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .accordion-item {
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    overflow: hidden;
                    transition: all 0.2s;
                    background: var(--bg-card);
                }
                
                .accordion-item.expanded {
                    border-color: var(--border-hover);
                    box-shadow: var(--shadow-sm);
                }
                
                .accordion-header {
                    width: 100%;
                    padding: 18px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--bg-card);
                    border: none;
                    outline: none;
                    cursor: pointer;
                    text-align: left;
                    font-weight: 700;
                    font-size: 14px;
                    color: var(--text-primary);
                    transition: background 0.2s;
                }
                
                .accordion-header:hover {
                    background: var(--bg-hover);
                }
                
                .arrow-icon {
                    font-size: 10px;
                    color: var(--text-muted);
                    transition: transform 0.2s;
                }
                
                .accordion-content {
                    padding: 0 20px 20px 20px;
                    background: var(--bg-card);
                    border-top: none;
                    color: var(--text-secondary);
                    font-size: 14px;
                    line-height: 1.6;
                }
                
                .no-faq-results {
                    padding: 40px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .mb-8 { margin-bottom: 8px; }
                
                /* Ticket Submission Form Column */
                .inline-ticket-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .form-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .form-input {
                    padding: 12px 16px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 8px);
                    font-size: 14px;
                    background: var(--bg-body) !important;
                    color: var(--text-primary) !important;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .form-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-50);
                }
                
                .support-workspace select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    padding-right: 40px;
                }
                
                .support-workspace select option {
                    background-color: var(--bg-body) !important;
                    color: var(--text-primary) !important;
                }
                
                .form-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 18px;
                }
                
                .textarea-fixed {
                    resize: vertical;
                    min-height: 100px;
                }
                
                .btn-submit-ticket {
                    background: var(--primary);
                    color: #ffffff;
                    border: none;
                    padding: 14px 20px;
                    border-radius: var(--radius-full, 9999px);
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                    text-align: center;
                    margin-top: 8px;
                }
                
                .btn-submit-ticket:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 12px -1px rgba(37, 99, 235, 0.3);
                }
                
                .btn-submit-ticket:disabled {
                    background: #93c5fd;
                    cursor: not-allowed;
                }
                
                /* Metrics cards */
                .support-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .support-metric-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .support-metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .border-red { border-left: 4px solid var(--danger); }
                .border-amber { border-left: 4px solid var(--warning); }
                .border-emerald { border-left: 4px solid var(--success); }
                
                .support-metric-card .label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
                .support-metric-card .value { font-size: 26px; font-weight: 800; color: var(--text-primary); line-height: 1.1; }
                .text-danger { color: var(--danger) !important; }
                .text-warning { color: var(--warning) !important; }
                .text-success { color: var(--success) !important; }
                
                /* Table Ledger */
                .table-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 12px;
                    box-shadow: var(--shadow-sm);
                    overflow-x: auto;
                }
                
                .loading-state {
                    padding: 40px;
                    color: var(--text-muted);
                    min-height: 200px;
                }
                
                .ticket-code-cell { display: flex; flex-direction: column; gap: 4px; }
                .ticket-code { background: var(--primary-50); color: var(--primary); padding: 4px 8px; border-radius: 6px; font-family: monospace; font-weight: 700; font-size: 13px; width: fit-content; }
                .date-sub { font-size: 12px; color: var(--text-muted); }
                
                .org-cell { display: flex; flex-direction: column; gap: 2px; }
                .company-tag { font-size: 12px; }
                
                .desc-cell { max-width: 320px; }
                .subj-header-inline { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
                .subj-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
                .category-pill-small { font-size: 11px; font-weight: 700; background: var(--bg-hover); color: var(--text-secondary); padding: 3px 8px; border-radius: 6px; }
                .desc-para { font-size: 13px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary); }
                
                .priority-badge { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; width: fit-content; display: inline-block; }
                .priority-badge.low { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .priority-badge.medium { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .priority-badge.high { background: var(--danger-light); color: var(--danger); }
                
                .status-select-premium {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    padding: 6px 30px 6px 12px; /* Extra padding for arrow */
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                }
                
                .status-badge-inline { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; display: inline-block; }
                
                .status-select-premium.open, .status-badge-inline.open { background-color: var(--danger-light); color: var(--danger); border-color: rgba(239, 68, 68, 0.2); }
                .status-select-premium.in-progress, .status-badge-inline.in-progress { background-color: rgba(245, 158, 11, 0.1); color: var(--warning); border-color: rgba(245, 158, 11, 0.2); }
                .status-select-premium.resolved, .status-badge-inline.resolved { background-color: var(--success-light); color: var(--success); border-color: rgba(16, 185, 129, 0.2); }
                .status-select-premium.closed, .status-badge-inline.closed { background-color: var(--bg-hover); color: var(--text-secondary); border-color: var(--border); }
                
                .animate-slide-down { animation: slideDown 0.25s ease-out; }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-8 { gap: 8px; }
                .gap-5 { gap: 5px; }

                @media (max-width: 1024px) {
                    .support-two-column-grid { grid-template-columns: 1fr; }
                    .support-metrics-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .support-workspace { padding: 16px; }
                    .module-header { flex-direction: column; align-items: flex-start; gap: 16px; }
                    .support-metrics-grid { grid-template-columns: 1fr; }
                    .form-row-2 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Support;
