import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    Zap, TrendingUp, Clock, 
    MoreVertical, ChevronRight, ChevronLeft,
    AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

const SalesPipeline = () => {
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const stages = [
        { name: 'Initial Contact', color: '#6366f1' },
        { name: 'Qualified Lead', color: '#8b5cf6' },
        { name: 'Proposal Sent', color: '#ec4899' },
        { name: 'Negotiation', color: '#f59e0b' },
        { name: 'Closing Deal', color: '#10b981' },
        { name: 'Won', color: '#22c55e' }
    ];

    const fetchLeads = async () => {
        try {
            const [leadsRes, statsRes] = await Promise.all([
                API.get('/leads'),
                API.get('/leads/stats')
            ]);
            setLeads(leadsRes.data);
            setStats(statsRes.data);
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
        if (stageName === 'Won') {
            return leads.filter(l => ['Won', 'Converted To Customer', 'Converted to Customer'].includes(l.status));
        }
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

    // Analytics from backend stats
    if (loading || !stats) return <div className="loading-container"><div className="loader"></div></div>;

    const { 
        pipelineValue,
        pipelineCounts,
        pipelineValueByStage,
        avgVelocity,
        stagnantLeads
    } = stats;

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Sales Pipeline Visualization</h1>
                    <p className="text-muted">Monitor deal flow and conversion velocity across lifecycle stages.</p>
                </div>
                <div className="pipeline-summary glass-card">
                    <span className="text-muted">Total Pipeline Value:</span>
                    <strong>{formatCurrency(pipelineValue)}</strong>
                </div>
            </header>

            <div className="pipeline-container mt-30">
                {stages.map((s, i) => (
                    <div key={i} className="pipeline-stage glass-card" style={{ borderTop: `4px solid ${s.color}` }}>
                        <div className="stage-head">
                            <h3>{s.name}</h3>
                            <span className="stage-count">{pipelineCounts[s.name] || 0}</span>
                        </div>
                        <div className="stage-value">
                            <Zap size={14} color={s.color}/>
                            <strong>{formatCurrency(pipelineValueByStage[s.name] || 0)}</strong>
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
                                        {i > 0 ? (
                                            <button 
                                                className="status-nav-btn"
                                                title="Move Back"
                                                onClick={() => updateStatus(lead._id, stages[i-1].name)}
                                            >
                                                <ChevronLeft size={16}/>
                                            </button>
                                        ) : ( <div style={{width: '24px'}}></div> )}
                                        
                                        <div className="terminal-actions">
                                            <button 
                                                className="term-btn win" 
                                                title="Mark Won"
                                                onClick={() => updateStatus(lead._id, 'Won')}
                                            >
                                                <CheckCircle size={16}/>
                                            </button>
                                            <button 
                                                className="term-btn lose" 
                                                title="Mark Lost"
                                                onClick={() => updateStatus(lead._id, 'Lost')}
                                            >
                                                <XCircle size={16}/>
                                            </button>
                                        </div>

                                        {i < stages.length - 1 ? (
                                            <button 
                                                className="status-nav-btn"
                                                title="Move Forward"
                                                onClick={() => updateStatus(lead._id, stages[i+1].name)}
                                            >
                                                <ChevronRight size={16}/>
                                            </button>
                                        ) : ( <div style={{width: '24px'}}></div> )}
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
                    <Clock color={stagnantLeads > 0 ? "#f59e0b" : "#10b981"} size={24}/>
                    <div>
                        <h4>Pipeline Health</h4>
                        <p>{stagnantLeads > 0 ? `Attention Needed (${stagnantLeads} Stagnant)` : 'Healthy (All active)'}</p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; display: flex; flex-direction: column; height: 100%; overflow: hidden; }
                .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; flex-shrink: 0; }
                
                .pipeline-summary { padding: 12px 20px; display: flex; flex-direction: column; gap: 4px; border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
                .pipeline-summary span { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                .pipeline-summary strong { font-size: 22px; color: var(--primary); font-weight: 800; line-height: 1; }

                /* HORIZONTAL SCROLL FOR COLUMNS */
                .pipeline-container { 
                    display: flex; 
                    gap: 24px; 
                    overflow-x: auto; 
                    overflow-y: hidden;
                    padding-bottom: 15px; 
                    flex: 1; 
                    align-items: stretch;
                    scrollbar-width: thin;
                    scrollbar-color: var(--primary) transparent;
                }
                .pipeline-container::-webkit-scrollbar { height: 8px; }
                .pipeline-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
                .pipeline-container::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }

                /* STANDARDIZED COLUMNS */
                .pipeline-stage { 
                    min-width: 320px; 
                    width: 320px; 
                    flex-shrink: 0; 
                    display: flex; 
                    flex-direction: column; 
                    padding: 0;
                    border-radius: 14px;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                    box-shadow: var(--shadow-sm);
                    overflow: hidden;
                    height: calc(100vh - 280px);
                    min-height: 450px;
                }
                
                /* STICKY HEADER INSIDE COLUMNS */
                .stage-head, .stage-value { 
                    flex-shrink: 0; 
                    padding: 16px 20px;
                    background: rgba(255,255,255,0.02);
                }
                .stage-head { 
                    display: flex; justify-content: space-between; align-items: center; 
                    border-bottom: 1px dashed rgba(255,255,255,0.05);
                }
                .stage-head h3 { font-size: 15px; font-weight: 700; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
                .stage-count { background: var(--primary-50); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; }
                
                .stage-value { 
                    display: flex; align-items: center; gap: 8px; font-size: 20px; color: var(--text-main); 
                    border-bottom: 1px solid var(--border);
                    padding-top: 10px; padding-bottom: 15px;
                }
                
                /* VERTICAL SCROLL WITHIN COLUMNS */
                .lead-preview-stack { 
                    flex: 1; 
                    overflow-y: auto; 
                    padding: 16px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 16px; 
                    scrollbar-width: thin;
                }
                .lead-preview-stack::-webkit-scrollbar { width: 4px; }
                .lead-preview-stack::-webkit-scrollbar-track { background: transparent; }
                .lead-preview-stack::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 4px; }
                
                /* IMPROVED LEAD CARD */
                .lead-card { 
                    background: var(--bg-body); 
                    border-radius: 12px; 
                    padding: 16px;
                    border: 1px solid var(--border);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .lead-card:hover { 
                    transform: translateY(-4px); 
                    box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15); 
                    border-color: var(--primary-100);
                }
                
                .lead-card-main { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
                .avatar-sm { 
                    width: 40px; height: 40px; border-radius: 10px; 
                    background: linear-gradient(135deg, var(--primary), #8b5cf6); 
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 800; font-size: 16px; color: white;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
                    flex-shrink: 0;
                }
                .lead-info { flex: 1; min-width: 0; }
                .lead-info h4 { font-size: 15px; margin: 0 0 4px 0; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .lead-val { font-size: 14px; color: var(--primary); font-weight: 700; margin: 0; }
                
                .lead-card-actions { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding-top: 14px; border-top: 1px dashed var(--border);
                }
                .status-nav-btn { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .status-nav-btn:hover { background: var(--primary); color: white; border-color: var(--primary); transform: scale(1.1); }

                .terminal-actions { display: flex; gap: 12px; }
                .term-btn { background: var(--bg-card); border: 1px solid var(--border); cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .term-btn.win { color: #10b981; }
                .term-btn.lose { color: #ef4444; }
                .term-btn.win:hover { background: #10b981; color: white; border-color: #10b981; transform: scale(1.1) rotate(5deg); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                .term-btn.lose:hover { background: #ef4444; color: white; border-color: #ef4444; transform: scale(1.1) rotate(-5deg); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

                .empty-stage-hint { 
                    text-align: center; padding: 40px 20px; color: var(--text-muted); 
                    font-size: 13px; border: 2px dashed var(--border); border-radius: 12px;
                    margin: auto 0; font-weight: 500;
                }
                
                .pipeline-analytics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex-shrink: 0; }
                .ana-box { display: flex; align-items: center; gap: 20px; padding: 24px; border-radius: 14px; box-shadow: var(--shadow-sm); }
                .ana-box h4 { font-size: 14px; color: var(--text-muted); margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
                .ana-box p { font-size: 22px; font-weight: 800; color: var(--text-main); margin: 0; line-height: 1; }
                
                .mt-30 { margin-top: 30px; }
                
                .animate-pop { animation: pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                
                @media (max-width: 1024px) {
                    .pipeline-analytics-row { grid-template-columns: 1fr; }
                    .module-container { padding: 20px; overflow: auto; }
                    .pipeline-stage { height: 500px; }
                }
                @media (max-width: 768px) {
                    .module-header { flex-direction: column; align-items: flex-start; }
                    .pipeline-summary { width: 100%; }
                    .pipeline-stage { min-width: 280px; width: 280px; }
                }
            `}</style>
        </div>
    );
};

export default SalesPipeline;
