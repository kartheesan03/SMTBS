import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
    BarChart, Bar, Cell 
} from 'recharts';
import { 
    ShoppingCart, CheckSquare, Clock, Package, 
    TrendingUp, Filter, Search, UserPlus, CheckCircle, XCircle, ArrowUpRight
} from 'lucide-react';

// Components
import StatCard from '../components/Dashboard/StatCard';
import QuickActions from '../components/Dashboard/QuickActions';
import DataTable from '../components/Dashboard/DataTable';

const ManagerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchManagerData = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchManagerData();
    }, []);

    if (loading) return <div className="loading-container"><div className="loader"></div><p>Aggregating operational data...</p></div>;

    const stats = [
        { title: 'Total Orders', value: data?.stats?.totalOrders ?? 0, icon: <ShoppingCart />, color: '#6366f1' },
        { title: 'Active Tasks', value: 0, icon: <CheckSquare />, color: '#10b981' },
        { title: 'Pending Approval', value: 0, icon: <Clock />, color: '#f59e0b' },
        { title: 'Material Usage', value: '0%', icon: <Package />, color: '#8b5cf6' },
    ];

    const quickActions = [
        { label: 'Assign Task', icon: <UserPlus size={20}/>, onClick: () => {} },
        { label: 'Approve Request', icon: <CheckCircle size={20}/>, onClick: () => {} },
        { label: 'View Reports', icon: <TrendingUp size={20}/>, onClick: () => {} },
    ];

    return (
        <div className="manager-wrapper">
            <header className="manager-header">
                <div>
                    <h1 className="title-gradient">Business Operations Manager</h1>
                    <p className="text-muted">High-level oversight of orders, projects, and team output.</p>
                </div>
                <div className="header-meta">
                    <div className="search-box-glass">
                        <Search size={18}/>
                        <input type="text" placeholder="Track order or task..." />
                    </div>
                </div>
            </header>

            <section className="manager-stats grid-4">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </section>

            <div className="manager-main-grid">
                <div className="glass-card main-chart-box">
                    <div className="card-header-flex">
                        <h3>Order Trends vs Fulfillment</h3>
                        <div className="flex-center gap-10">
                            <span className="badge-pill success">+12.5% vs Last Month</span>
                        </div>
                    </div>
                    <div className="chart-container-m">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.charts?.monthlyStats || []}>
                                <defs>
                                    <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorV)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card approval-queue">
                    <h3>Pending Approvals</h3>
                    <div className="req-list">
                         <p className="text-muted text-center" style={{padding: '20px'}}>No pending approvals in the queue.</p>
                    </div>
                    <button className="view-all-link">View all 0 requests <ArrowUpRight size={14}/></button>
                </div>
            </div>

            <section className="orders-overview-m mt-30">
                <DataTable 
                    title="Active Projects & Orders"
                    headers={['Order ID', 'Customer', 'Progress', 'Deadline', 'Status']}
                    data={data?.tables?.recentOrders || []}
                    renderRow={(o) => (
                        <>
                        <>
                            <td><span className="id-font">{o.orderNumber}</span></td>
                            <td>{o.customer?.name || 'Walk-in'}</td>
                            <td>
                                <div className="progress-cell">
                                    <div className="p-bar"><div className="p-fill" style={{width: `100%`}}></div></div>
                                    <span>100%</span>
                                </div>
                            </td>
                            <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td><span className={`status-tag ${o.status.toLowerCase().replace(' ', '-')}`}>{o.status}</span></td>
                        </>
                        </>
                    )}
                />
            </section>

            <style jsx="true">{`
                .manager-wrapper { padding: 30px; display: flex; flex-direction: column; gap: 30px; }
                .manager-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .search-box-glass { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: rgba(255,255,255,0.03); border-radius: 12px; }
                .search-box-glass input { background: none; border: none; color: white; width: 250px; }
                
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .manager-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }

                .main-chart-box, .approval-queue { padding: 25px; }
                .chart-container-m { height: 250px; margin-top: 20px; }
                
                .req-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
                .req-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 10px; }
                .r-type { font-size: 10px; text-transform: uppercase; color: var(--primary); font-weight: 700; display: block; }
                .req-meta strong { font-size: 14px; }
                .req-meta p { font-size: 12px; color: var(--text-muted); }
                
                .req-actions { display: flex; gap: 8px; }
                .btn-approve { background: none; color: #10b981; }
                .btn-reject { background: none; color: #ef4444; }
                .view-all-link { background: none; color: var(--primary); font-size: 13px; font-weight: 600; margin-top: 15px; display: flex; align-items: center; gap: 5px; }

                .badge-pill { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }
                .badge-pill.success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                
                .progress-cell { display: flex; align-items: center; gap: 10px; min-width: 150px; }
                .p-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
                .p-fill { height: 100%; background: var(--primary); transition: 0.5s ease; shadow: 0 0 10px var(--primary); }
                
                .status-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-tag.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-tag.processing { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-tag.in-transit { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

                .mt-30 { margin-top: 30px; }
                .id-font { font-family: monospace; color: var(--primary); font-weight: 700; }

                @media (max-width: 1024px) {
                    .manager-main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .manager-wrapper { padding: 15px; gap: 20px; }
                    .manager-header { flex-direction: column; align-items: flex-start; }
                    .search-box-glass { width: 100%; }
                    .search-box-glass input { width: 100%; }
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 480px) {
                    .grid-4 { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
};

export default ManagerDashboard;
