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
                .sales-wrapper { padding: 30px; display: flex; flex-direction: column; gap: 30px; }
                .sales-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .search-bar-glass { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: rgba(255,255,255,0.03); border-radius: 12px; }
                .search-bar-glass input { background: none; border: none; color: white; width: 250px; }
                
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .sales-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
                
                .performance-chart-box, .pipeline-box { padding: 25px; }
                .chart-container-s { height: 250px; margin-top: 20px; }
                
                .pipeline-viz { display: flex; align-items: center; justify-content: space-around; height: 180px; }
                .pipeline-stats { display: flex; flex-direction: column; gap: 10px; font-size: 13px; }
                .p-stat-item { display: flex; align-items: center; gap: 10px; color: var(--text-muted); }
                .dot { width: 8px; height: 8px; border-radius: 50%; }
                
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-pill.negotiation { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.qualified { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.contacted { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
                
                .val-text { color: var(--primary); }
                .view-more { margin-left: 8px; color: var(--primary); cursor: pointer; }
                
                .follow-up-card { padding: 25px; }
                .f-list { display: flex; flex-direction: column; gap: 12px; margin-top: 15px; }
                .f-item { display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 10px; }
                .f-item.overdue { border-left: 3px solid #ef4444; }
                .f-info { display: flex; flex-direction: column; }
                .f-info span { font-size: 11px; color: var(--text-muted); }
                
                .mt-30 { margin-top: 30px; }
                .badge-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                .badge-pill.info { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

                @media (max-width: 1024px) {
                    .sales-main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .sales-wrapper { padding: 15px; gap: 20px; }
                    .sales-header { flex-direction: column; align-items: flex-start; }
                    .search-bar-glass { width: 100%; }
                    .search-bar-glass input { width: 100%; }
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                    .pipeline-viz { flex-direction: column; height: auto; gap: 20px; }
                }

                @media (max-width: 480px) {
                    .grid-4 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default SalesDashboard;
