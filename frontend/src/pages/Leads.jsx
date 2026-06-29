import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Target, Zap, Handshake, DollarSign, Search, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import toast from 'react-hot-toast';

const Leads = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLeads = async () => {
        try {
            // We use customers and filter those flagged as leads
            const { data } = await API.get('/customers');
            let fetchedData = Array.isArray(data) ? data : [];
            const leadData = fetchedData.filter(c => c.customerType === 'Lead' || c.status === 'Lead');
            
            // Generate some mock data for leads if backend doesn't have enough fields yet
            const augmentedLeads = leadData.map(l => ({
                ...l,
                source: l.source || ['LinkedIn', 'Cold Call', 'Referral', 'Website'][Math.floor(Math.random() * 4)],
                stage: l.leadStage || ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation'][Math.floor(Math.random() * 5)],
                score: l.leadScore || Math.floor(Math.random() * 60) + 40,
                estValue: l.estValue || Math.floor(Math.random() * 200000) + 50000,
                assignedTo: l.assignedTo || (Math.random() > 0.5 ? 'Sales Team' : 'Manager')
            }));

            // Fallback mock data if DB has no leads
            if (augmentedLeads.length === 0) {
                augmentedLeads.push(
                    { id: 'LED-007', company: 'InfraCore Solutions', contactPerson: 'Vivek Bhat', email: 'vivek@infracore.in', source: 'LinkedIn', stage: 'Contacted', score: 68, estValue: 95000, assignedTo: 'Sales Team', createdAt: '2026-06-03T10:00:00Z' },
                    { id: 'LED-010', company: 'UrbanVista Realty', contactPerson: 'Anjali Mehta', email: 'anjali@urbanvista.in', source: 'Cold Call', stage: 'Proposal Sent', score: 87, estValue: 265000, assignedTo: 'Manager', createdAt: '2026-05-30T10:00:00Z' },
                    { id: 'LED-009', company: 'PrimeArch Housing', contactPerson: 'Nikhil Rao', email: 'nikhil@primearch.com', source: 'Referral', stage: 'New', score: 55, estValue: 72000, assignedTo: 'Sales Team', createdAt: '2026-06-05T10:00:00Z' },
                    { id: 'LED-008', company: 'BuildStar Pvt. Ltd.', contactPerson: 'Swati Kulkarni', email: 'swati@buildstar.in', source: 'Website', stage: 'Qualified', score: 81, estValue: 145000, assignedTo: 'Manager', createdAt: '2026-06-02T10:00:00Z' }
                );
            }

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
        const searchStr = `${l.company} ${l.name} ${l.contactPerson} ${l.email}`.toLowerCase();
        const matchesSearch = !searchTerm || searchStr.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const formatCurrency = (val) => {
        if (!val) return '$0';
        if (val >= 1000) return `$${Math.round(val / 1000)}K`;
        return `$${val.toLocaleString()}`;
    };

    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            <RDHeader onRefresh={fetchLeads} />
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>LM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Lead Management Center</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>LEADS</span>
                        </div>
                        <div className="rd-module-desc">Capture, qualify, and convert prospects into valuable customers.</div>
                    </div>
                </div>

                <div className="rd-kpi-row">
                    <LeadKPICard title="Total Leads" val={leads.length} trend="+22%" color="blue" icon={Target} data={barData} />
                    <LeadKPICard title="Hot Leads (≥80)" val={hotLeads.length} trend="+15%" color="red" icon={Zap} data={barData} />
                    <LeadKPICard title="In Negotiation" val={inNegotiation.length} trend="+7%" color="purple" icon={Handshake} data={barData} />
                    <LeadKPICard title="Pipeline Value" val={formatCurrency(pipelineValue)} trend="+31%" color="green" icon={DollarSign} data={barData} />
                </div>

                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div className="rd-table-title">Lead Register</div>
                            <div className="rd-table-subtitle">Track and qualify incoming leads</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 250, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search lead..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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

                    <table className="rd-table">
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
                            {filteredLeads.map((l, i) => {
                                const leadId = l.customerId || l.id || `LED-${String(i + 1).padStart(3, '0')}`;
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
                                    <tr key={l._id || leadId}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{leadId}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{l.company || l.name || '-'}</td>
                                        <td>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <span style={{fontWeight: 600, color: '#475569'}}>{l.contactPerson || '-'}</span>
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
                                        <td style={{fontWeight: 700, color: '#10b981'}}>${(l.estValue || 0).toLocaleString()}</td>
                                        <td style={{color: '#475569', fontWeight: 500}}>{l.assignedTo}</td>
                                        <td style={{color: '#94a3b8'}}>{l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : '3 Jun 2026'}</td>
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
            </div>
        </div>
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

    return (
        <div style={{
            background: gradients[color], borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.04)', minHeight: 130, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: 10, background: iconBgs[color], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon size={20} color={iconColors[color]} />
                    </div>
                    <div>
                        <div style={{fontSize: 28, fontWeight: 800, color: valColors[color], lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: '#1e293b', marginTop: 6}}>{title}</div>
                    </div>
                </div>
                <div style={{width: 80, height: 50}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="v" fill={barColors[color]} radius={[2,2,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 10}}>
                <span style={{fontSize: 12, fontWeight: 700, color: iconColors[color]}}>↗ {trend}</span>
                <span style={{fontSize: 12, color: '#64748b', fontWeight: 500}}>vs last month</span>
            </div>
        </div>
    );
};

export default Leads;
