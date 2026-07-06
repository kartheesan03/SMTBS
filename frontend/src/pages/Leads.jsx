import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Target, Zap, Handshake, DollarSign, Search, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import toast from 'react-hot-toast';

const Leads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLeads = async () => {
        try {
            const { data } = await API.get('/customers');
            let fetchedData = Array.isArray(data) ? data : [];
            
            // All customers are potential leads — augment with computed fields
            const augmentedLeads = fetchedData.map((l, idx) => {
                // Derive lead stage from status or notes
                const statusLower = (l.status || '').toLowerCase();
                let stage = 'New';
                if (statusLower === 'active') stage = 'Qualified';
                else if (statusLower === 'contacted') stage = 'Contacted';
                else if (statusLower === 'negotiation') stage = 'Negotiation';
                else if (statusLower === 'proposal') stage = 'Proposal Sent';
                else if (statusLower === 'lead') stage = 'New';

                return {
                    ...l,
                    source: l.industry || 'Direct',
                    stage,
                    score: l.gstNumber ? 85 : (l.company ? 70 : 50),
                    estValue: l.company ? 150000 : 50000,
                    assignedTo: l.createdBy?.name || 'Sales Team'
                };
            });

            setLeads(augmentedLeads);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load leads.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const hotLeads = leads.filter(l => l.score >= 80);
    const inNegotiation = leads.filter(l => l.stage === 'Negotiation');
    const pipelineValue = leads.reduce((sum, l) => sum + (Number(l.estValue) || 0), 0);

    const filteredLeads = leads.filter(l => {
        const matchesFilter = activeFilter === 'All' || l.stage === activeFilter;
        const searchStr = `${l.company || ''} ${l.name || ''} ${l.contactPerson || ''} ${l.email || ''}`.toLowerCase();
        const matchesSearch = !searchTerm || searchStr.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatCurrency = (val) => {
        if (!val) return '₹0';
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
        return `₹${val.toLocaleString()}`;
    };

    

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Lead Management Center</span>
                            <span className="rd-module-badge">LEADS</span>
                        </div>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="rd-kpi-row"
                >
                    <LeadKPICard title="Total Leads" val={leads.length} color="blue" icon={Target} />
                    <LeadKPICard title="Hot Leads (≥80)" val={hotLeads.length} color="red" icon={Zap} />
                    <LeadKPICard title="In Negotiation" val={inNegotiation.length} color="purple" icon={Handshake} />
                    <LeadKPICard title="Pipeline Value" val={formatCurrency(pipelineValue)} color="green" icon={DollarSign} />
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rd-table-card"
                >
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Lead Register</div>
                            <div className="rd-table-subtitle">Track and qualify incoming leads</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 250, flexShrink: 0, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            <select 
                                value={activeFilter} 
                                onChange={e => setActiveFilter(e.target.value)}
                                style={{padding: '8px 16px', borderRadius: 20, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontWeight: 600, outline: 'none'}}
                            >
                                <option value="All">All</option>
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Negotiation">Negotiation</option>
                            </select>
                            <button className="rd-btn-solid" style={{background: '#0ea5e9'}}>+ New Lead</button>
                        </div>
                    </div>

                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                <th>LEAD ID</th>
                                <th>COMPANY</th>
                                <th>CONTACT</th>
                                <th>SOURCE</th>
                                <th>STAGE</th>
                                <th>SCORE</th>
                                <th>EST. VALUE</th>
                                <th>ASSIGNED TO</th>
                                <th>CREATED</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr><td colSpan={10} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No leads found</td></tr>
                            ) : filteredLeads.map((l, i) => {
                                const leadId = l.customerId || l.id || l._id || `LED-${String(i + 1).padStart(3, '0')}`;
                                const scoreColor = l.score >= 80 ? '#10b981' : l.score >= 60 ? '#f59e0b' : '#ef4444';
                                const scoreBg = l.score >= 80 ? '#ecfdf5' : l.score >= 60 ? '#fff7ed' : '#fef2f2';
                                
                                const stageColors = {
                                    'New': '#3b82f6',
                                    'Contacted': '#0ea5e9',
                                    'Qualified': '#10b981',
                                    'Proposal Sent': '#f59e0b',
                                    'Negotiation': '#8b5cf6'
                                };
                                const stColor = stageColors[l.stage] || '#64748b';

                                return (
                                    <tr key={l._id || l.id || leadId}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{leadId}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{l.company || l.name || '-'}</td>
                                        <td>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <span style={{fontWeight: 600, color: '#475569'}}>{l.name || l.contactPerson || '-'}</span>
                                                <span style={{fontSize: 12, color: '#94a3b8'}}>{l.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe'}}>
                                                {l.source}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: stColor, border: `1.5px solid ${stColor}50`}}>
                                                {l.stage}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{width: 32, height: 32, borderRadius: 8, background: scoreBg, color: scoreColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13}}>
                                                {l.score}
                                            </div>
                                        </td>
                                        <td style={{fontWeight: 700, color: '#10b981'}}>₹{(l.estValue || 0).toLocaleString()}</td>
                                        <td style={{color: '#475569', fontWeight: 500}}>{l.assignedTo}</td>
                                        <td style={{color: '#94a3b8'}}>{l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}</td>
                                        <td>
                                            <button className="rd-btn-solid" style={{padding: '6px 14px', fontSize: 13, background: '#0ea5e9'}}>
                                                Advance →
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                    </motion.div>
            </div>
        </motion.div>
    );
};

const LeadKPICard = ({ title, val, trend, color, icon: Icon, data }) => {
    const gradients = {
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        red: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        purple: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        green: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)'
    };
    const iconBgs = { blue: '#dbeafe', red: '#ffe4e6', purple: '#f3e8ff', green: '#ccfbf1' };
    const iconColors = { blue: '#3b82f6', red: '#ef4444', purple: '#a855f7', green: '#14b8a6' };
    const barColors = { blue: '#93c5fd', red: '#fca5a5', purple: '#d8b4fe', green: '#99f6e4' };
    const valColors = { blue: '#1d4ed8', red: '#dc2626', purple: '#7e22ce', green: '#0f766e' };

    
    const themeClass = color ? `ent-theme-${color}` : 'ent-theme-primary';
return (
        <div className={`ent-module-card ${typeof themeClass !== 'undefined' ? themeClass : (color ? `ent-theme-${color}` : 'ent-theme-primary')}`}>
            <div>
                <div className="ent-card-header">
                    <span className="ent-card-title">{title}</span>
                    <div className="ent-card-icon-wrapper">
                        {Icon && <Icon size={18} strokeWidth={2.5} />}
                    </div>
                </div>
                <div className="ent-card-value">{val}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ent-text-secondary)', marginBottom: '12px' }}>
                    {'Monitoring Level'}
                </div>
            </div>
            
            <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                    Updated Today
                </div>
            </div>
        </div>
    );
};

export default Leads;
