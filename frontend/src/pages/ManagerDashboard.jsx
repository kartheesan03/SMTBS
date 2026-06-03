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
                .manager-wrapper { 
                    padding: 30px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 30px; 
                    background-color: var(--bg-body); 
                    min-height: 100vh; 
                    color: var(--text-primary); 
                }
                .manager-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0; letter-spacing: -0.5px; }
                .search-box-glass { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md, 12px); box-shadow: var(--shadow-sm); transition: all 0.2s ease; }
                .search-box-glass:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); }
                .search-box-glass input { background: none; border: none; color: var(--text-primary); width: 250px; outline: none; font-size: 14px; }
                .search-box-glass input::placeholder { color: var(--text-muted); }
                .search-box-glass svg { color: var(--text-muted); }
                
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .manager-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }

                .glass-card { 
                    background: var(--bg-card); 
                    border: 1px solid var(--border); 
                    border-radius: var(--radius-lg, 16px); 
                    padding: 24px; 
                    box-shadow: var(--shadow-sm); 
                }
                .main-chart-box, .approval-queue { padding: 24px; }
                .chart-container-m { height: 250px; margin-top: 24px; }
                
                .glass-card h3 { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0; }
                .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                .req-list { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
                .req-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--bg-hover); border: 1px solid var(--border); border-radius: var(--radius-md, 12px); transition: all 0.2s ease; }
                .req-item:hover { border-color: var(--border-hover); background: var(--bg-card); }
                .r-type { font-size: 11px; text-transform: uppercase; color: var(--primary); font-weight: 700; display: block; margin-bottom: 4px; }
                .req-meta strong { font-size: 14px; color: var(--text-primary); }
                .req-meta p { font-size: 12px; color: var(--text-muted); margin: 4px 0 0 0; }
                
                .req-actions { display: flex; gap: 12px; }
                .btn-approve { background: var(--success-light); border: 1px solid transparent; color: var(--success); padding: 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
                .btn-approve:hover { background: var(--success); color: white; transform: translateY(-1px); }
                .btn-reject { background: var(--danger-light); border: 1px solid transparent; color: var(--danger); padding: 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; }
                .btn-reject:hover { background: var(--danger); color: white; transform: translateY(-1px); }
                .view-all-link { background: none; border: none; color: var(--primary); font-size: 13px; font-weight: 700; margin-top: 20px; display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 0; transition: color 0.2s ease; }
                .view-all-link:hover { color: #1d4ed8; }

                .badge-pill { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
                .badge-pill.success { background: var(--success-light); color: var(--success); }
                
                .progress-cell { display: flex; align-items: center; gap: 12px; min-width: 150px; }
                .p-bar { flex: 1; height: 8px; background: var(--bg-body); border-radius: 10px; overflow: hidden; }
                .p-fill { height: 100%; background: var(--primary); transition: 0.5s ease; box-shadow: 0 0 10px rgba(37, 99, 235, 0.4); border-radius: 10px; }
                .progress-cell span { font-size: 13px; font-weight: 700; color: var(--text-primary); min-width: 40px; }
                
                .status-tag { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
                .status-tag.completed { background: var(--success-light); color: var(--success); }
                .status-tag.processing { background: var(--warning-light); color: var(--warning); }
                .status-tag.in-transit { background: var(--primary-50); color: var(--primary); }

                .mt-30 { margin-top: 30px; }
                .id-font { font-family: monospace; color: var(--primary); font-weight: 700; font-size: 14px; background: var(--primary-50); padding: 4px 8px; border-radius: 6px; }
                .text-muted { color: var(--text-muted); }

                /* Loading */
                .loading-container { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: var(--text-muted); font-size: 14px; font-weight: 500; }
                .loader { width: 48px; height: 48px; border: 3px solid var(--primary-100); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .manager-main-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .manager-wrapper { padding: 20px; gap: 20px; }
                    .manager-header { flex-direction: column; align-items: flex-start; gap: 15px; }
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
