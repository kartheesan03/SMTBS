import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell 
} from 'recharts';
import { 
    Users, Target, PhoneCall, TrendingUp, 
    Search, Plus, Calendar, Clock, ArrowUpRight
} from 'lucide-react';

// Components
import StatCard from '../components/Dashboard/StatCard';
import QuickActions from '../components/Dashboard/QuickActions';
import DataTable from '../components/Dashboard/DataTable';

const SalesDashboard = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'];

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalesData();
    }, []);

    if (loading) return <div className="loading-container"><div className="loader"></div><p>Synchronizing lead pipeline...</p></div>;

    const stats = [
        { title: 'Total Leads', value: data?.stats?.totalLeads ?? 0, icon: <Users />, color: '#6366f1' },
        { title: 'Converted', value: data?.salesStats?.convertedLeads ?? 0, icon: <Target />, color: '#10b981' },
        { title: 'Follow-ups', value: 0, icon: <PhoneCall />, color: '#f59e0b' },
        { title: 'Sales Revenue', value: `$${(data?.stats?.revenue ?? 0).toLocaleString()}`, icon: <TrendingUp />, color: '#8b5cf6' },
    ];

    const quickActions = [
        { label: 'Add Lead', icon: <Plus size={20}/>, onClick: () => {} },
        { label: 'Add Customer', icon: <Users size={20}/>, onClick: () => {} },
        { label: 'Schedule Call', icon: <Calendar size={20}/>, onClick: () => {} },
    ];

    return (
        <div className="sales-wrapper">
            <header className="sales-header">
                <div>
                    <h1 className="title-gradient">Sales & CRM Dashboard</h1>
                    <p className="text-muted">Track conversions, manage customer relationships, and hit targets.</p>
                </div>
                <div className="header-meta">
                    <div className="search-bar-glass">
                        <Search size={18}/>
                        <input type="text" placeholder="Search leads or customers..." />
                    </div>
                </div>
            </header>

            <section className="sales-stats grid-4">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </section>

            <div className="sales-main-grid">
                <div className="glass-card performance-chart-box">
                    <div className="card-header-flex">
                        <h3>Conversion Trends</h3>
                    </div>
                    <div className="chart-container-s">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.charts?.monthlyStats || []}>
                                <defs>
                                    <linearGradient id="colorS" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="sales" stroke="#10b981" fill="url(#colorS)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card pipeline-box">
                    <h3>Sales Pipeline</h3>
                    <div className="pipeline-viz">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data?.salesStats?.pipelineData || []}
                                    innerRadius={50} outerRadius={70} dataKey="value"
                                >
                                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pipeline-stats">
                             {(data?.salesStats?.pipelineData || []).map((p, i) => (
                                 <div key={i} className="p-stat-item">
                                     <div className="dot" style={{ background: COLORS[i % COLORS.length] }}></div>
                                     <span>{p.name}: <strong>{p.value}</strong></span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            <section className="recent-leads mt-30">
                <DataTable 
                    title="Active Lead Tracking"
                    headers={['Lead Name', 'Email', 'Source', 'Status']}
                    data={data?.tables?.leadList || []}
                    renderRow={(l) => (
                        <>
                            <td>
                                <strong>{l.name}</strong>
                                <span className="view-more"><ArrowUpRight size={10}/></span>
                            </td>
                            <td>{l.email}</td>
                            <td>{l.source}</td>
                            <td><span className={`status-pill ${l.status ? l.status.toLowerCase() : ''}`}>{l.status || 'New'}</span></td>
                        </>
                    )}
                />
            </section>

            <div className="sales-bottom-grid mt-30">
                <div className="glass-card follow-up-card">
                    <h3>Urgent Follow-ups</h3>
                    <div className="f-list">
                         {[]} {/* Real follow-up data placeholder */}
                    </div>
                </div>
                <QuickActions actions={quickActions} />
            </div>

            <style jsx="true">{`
                .sales-wrapper { 
                    padding: 30px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 30px; 
                    background-color: var(--bg-body); 
                    min-height: 100vh; 
                    color: var(--text-primary); 
                }
                .sales-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0; letter-spacing: -0.5px; }
                .search-bar-glass { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md, 12px); box-shadow: var(--shadow-sm); transition: all 0.2s ease; }
                .search-bar-glass:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); }
                .search-bar-glass input { background: none; border: none; color: var(--text-primary); width: 250px; outline: none; font-size: 14px; }
                .search-bar-glass input::placeholder { color: var(--text-muted); }
                .search-bar-glass svg { color: var(--text-muted); }
                
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .sales-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
                
                .glass-card { 
                    background: var(--bg-card); 
                    border: 1px solid var(--border); 
                    border-radius: var(--radius-lg, 16px); 
                    padding: 24px; 
                    box-shadow: var(--shadow-sm); 
                }
                .performance-chart-box, .pipeline-box { padding: 24px; }
                .chart-container-s { height: 250px; margin-top: 24px; }
                
                .glass-card h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0; }
                .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                
                .pipeline-viz { display: flex; align-items: center; justify-content: space-around; height: 180px; margin-top: 24px; }
                .pipeline-stats { display: flex; flex-direction: column; gap: 12px; font-size: 13px; }
                .p-stat-item { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); }
                .p-stat-item strong { color: var(--text-primary); }
                .dot { width: 10px; height: 10px; border-radius: 50%; }
                
                .status-pill { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
                .status-pill.negotiation { background: var(--warning-light); color: var(--warning); }
                .status-pill.qualified { background: var(--success-light); color: var(--success); }
                .status-pill.contacted { background: var(--primary-50); color: var(--primary); }
                
                .val-text { color: var(--primary); }
                .view-more { margin-left: 8px; color: var(--primary); cursor: pointer; transition: color 0.2s; }
                .view-more:hover { color: #1d4ed8; }
                
                .follow-up-card { padding: 24px; }
                .f-list { display: flex; flex-direction: column; gap: 14px; margin-top: 20px; }
                .f-item { display: flex; align-items: center; gap: 15px; padding: 14px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: var(--radius-md, 12px); transition: all 0.2s ease; }
                .f-item:hover { border-color: var(--border-hover); background: var(--bg-card); }
                .f-item.overdue { border-left: 4px solid var(--danger); }
                .f-info { display: flex; flex-direction: column; gap: 4px; }
                .f-info span { font-size: 12px; color: var(--text-muted); }
                
                .sales-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                
                .mt-30 { margin-top: 30px; }
                .text-muted { color: var(--text-muted); }
                .badge-pill { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                .badge-pill.info { background: var(--primary-50); color: var(--primary); }

                /* Loading */
                .loading-container { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-muted); font-size: 14px; font-weight: 500; }
                .loader { width: 48px; height: 48px; border: 3px solid var(--primary-100); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .sales-main-grid, .sales-bottom-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .sales-wrapper { padding: 20px; gap: 20px; }
                    .sales-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .search-bar-glass { width: 100%; }
                    .search-bar-glass input { width: 100%; }
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                    .pipeline-viz { flex-direction: column; height: auto; gap: 24px; }
                }

                @media (max-width: 480px) {
                    .grid-4 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default SalesDashboard;
