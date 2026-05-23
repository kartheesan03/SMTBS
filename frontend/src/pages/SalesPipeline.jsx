import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Zap, TrendingUp, Clock, 
    MoreVertical, ChevronRight, ChevronLeft,
    AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

const SalesPipeline = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const stages = [
        { name: 'Initial Contact', color: '#6366f1' },
        { name: 'Qualified Lead', color: '#8b5cf6' },
        { name: 'Negotiation', color: '#f59e0b' },
        { name: 'Closing Deal', color: '#10b981' },
    ];

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

    const updateStatus = async (id, newStatus) => {
        try {
            await API.put(`/leads/${id}`, { status: newStatus });
            fetchLeads();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStageLeads = (stageName) => {
        return leads.filter(l => l.status === stageName);
    };

    const calculateStageValue = (stageName) => {
        const stageLeads = getStageLeads(stageName);
        return stageLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val);
    };

    // Analytics
    const totalPipelineValue = leads
        .filter(l => !['Converted', 'Lost'].includes(l.status))
        .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    const convertedLeads = leads.filter(l => l.status === 'Converted');
    const avgVelocity = convertedLeads.length > 0 
        ? Math.round(convertedLeads.reduce((sum, l) => {
            const diff = new Date(l.updatedAt) - new Date(l.createdAt);
            return sum + (diff / (1000 * 60 * 60 * 24));
          }, 0) / convertedLeads.length)
        : 14; // Default placeholder

    const stagnantLeads = leads.filter(l => {
        const diff = Date.now() - new Date(l.updatedAt).getTime();
        return !['Converted', 'Lost'].includes(l.status) && diff > (7 * 24 * 60 * 60 * 1000); // 7 days
    });

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Sales Pipeline Visualization</h1>
                    <p className="text-muted">Monitor deal flow and conversion velocity across lifecycle stages.</p>
                </div>
                <div className="pipeline-summary glass-card">
                    <span className="text-muted">Total Pipeline Value:</span>
                    <strong>{formatCurrency(totalPipelineValue)}</strong>
                </div>
            </header>

            <div className="pipeline-container mt-30">
                {stages.map((s, i) => (
                    <div key={i} className="pipeline-stage glass-card" style={{ borderTop: `4px solid ${s.color}` }}>
                        <div className="stage-head">
                            <h3>{s.name}</h3>
                            <span className="stage-count">{getStageLeads(s.name).length}</span>
                        </div>
                        <div className="stage-value">
                            <Zap size={14} color={s.color}/>
                            <strong>{formatCurrency(calculateStageValue(s.name))}</strong>
                        </div>
                        
                        <div className="lead-preview-stack">
                            {getStageLeads(s.name).map((lead) => (
                                <div key={lead._id} className="lead-card animate-pop">
                                    <div className="lead-card-main">
                                        <div className="avatar-sm">{lead.name.charAt(0)}</div>
                                        <div className="lead-info">
                                            <h4>{lead.name}</h4>
                                            <p className="lead-val">{formatCurrency(lead.estimatedValue)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="lead-card-actions">
                                        {i > 0 && (
                                            <button 
                                                className="status-nav-btn"
                                                onClick={() => updateStatus(lead._id, stages[i-1].name)}
                                            >
                                                <ChevronLeft size={16}/>
                                            </button>
                                        )}
                                        
                                        <div className="terminal-actions">
                                            <button 
                                                className="term-btn win" 
                                                title="Won"
                                                onClick={() => updateStatus(lead._id, 'Converted')}
                                            >
                                                <CheckCircle size={14}/>
                                            </button>
                                            <button 
                                                className="term-btn lose" 
                                                title="Lost"
                                                onClick={() => updateStatus(lead._id, 'Lost')}
                                            >
                                                <XCircle size={14}/>
                                            </button>
                                        </div>

                                        {i < stages.length - 1 && (
                                            <button 
                                                className="status-nav-btn"
                                                onClick={() => updateStatus(lead._id, stages[i+1].name)}
                                            >
                                                <ChevronRight size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {getStageLeads(s.name).length === 0 && (
                                <div className="empty-stage-hint">No active deals</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pipeline-analytics-row mt-30">
                <div className="glass-card ana-box">
                    <TrendingUp color="#10b981" size={24}/>
                    <div>
                        <h4>Avg. Velocity</h4>
                        <p>{avgVelocity} Days to Close</p>
                    </div>
                </div>
                <div className="glass-card ana-box">
                    <Clock color={stagnantLeads.length > 0 ? "#f59e0b" : "#10b981"} size={24}/>
                    <div>
                        <h4>Pipeline Health</h4>
                        <p>{stagnantLeads.length > 0 ? `Attention Needed (${stagnantLeads.length} Stagnant)` : 'Healthy (All active)'}</p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
                
                .pipeline-summary { padding: 15px 25px; display: flex; flex-direction: column; gap: 5px; border-radius: 12px; }
                .pipeline-summary strong { font-size: 24px; color: var(--primary); }

                .pipeline-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; align-items: start; }
                .pipeline-stage { padding: 20px; display: flex; flex-direction: column; gap: 15px; min-height: 400px; }
                .stage-head { display: flex; justify-content: space-between; align-items: center; }
                .stage-head h3 { font-size: 14px; opacity: 0.9; }
                .stage-count { background: rgba(255,255,255,0.05); padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
                .stage-value { display: flex; align-items: center; gap: 8px; font-size: 18px; color: var(--text-main); }
                
                .lead-preview-stack { display: flex; flex-direction: column; gap: 12px; }
                .lead-card { 
                    background: rgba(255,255,255,0.03); 
                    border-radius: 12px; 
                    padding: 12px;
                    border: 1px solid var(--border);
                    transition: 0.2s;
                }
                .lead-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); }
                
                .lead-card-main { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                .avatar-sm { 
                    width: 32px; height: 32px; border-radius: 50%; 
                    background: var(--primary-gradient); 
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 12px; color: white;
                }
                .lead-info h4 { font-size: 14px; margin-bottom: 2px; }
                .lead-val { font-size: 12px; color: var(--primary); font-weight: 600; }

                .lead-card-actions { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding-top: 10px; border-top: 1px solid var(--border);
                }
                .status-nav-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.2s; }
                .status-nav-btn:hover { background: rgba(255,255,255,0.1); color: white; }

                .terminal-actions { display: flex; gap: 8px; }
                .term-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; transition: 0.2s; }
                .term-btn.win { color: #10b981; }
                .term-btn.lose { color: #ef4444; }
                .term-btn:hover { background: rgba(255,255,255,0.1); }

                .empty-stage-hint { 
                    text-align: center; padding: 30px 10px; color: var(--text-muted); 
                    font-size: 12px; border: 2px dashed var(--border); border-radius: 12px;
                }
                
                .pipeline-analytics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .ana-box { display: flex; align-items: center; gap: 20px; padding: 25px; }
                .ana-box h4 { font-size: 13px; color: var(--text-muted); margin-bottom: 5px; }
                .ana-box p { font-size: 18px; font-weight: 700; color: var(--text-main); }
                
                .mt-30 { margin-top: 30px; }
                
                .animate-pop { animation: pop 0.3s ease-out; }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default SalesPipeline;
