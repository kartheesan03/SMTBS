import React, { useEffect, useState, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell 
} from 'recharts';
import { 
    Users, CheckCircle, XCircle, Calendar, Clock, 
    FileText, UserPlus, DollarSign, Bell, Search, Filter 
} from 'lucide-react';

// Components
import StatCard from '../components/Dashboard/StatCard';
import QuickActions from '../components/Dashboard/QuickActions';
import DataTable from '../components/Dashboard/DataTable';

const HRDashboard = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

    useEffect(() => {
        const fetchHRData = async () => {
            try {
                const { data } = await API.get('/dashboard/stats');
                setData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHRData();
    }, []);

    if (loading) return <div className="loading-container"><div className="loader"></div><p>Accessing Human Resources Management...</p></div>;

    const stats = [
        { title: 'Total Workforce', value: data?.stats?.totalEmployees ?? 0, icon: <Users />, color: '#6366f1' },
        { title: 'Present Today', value: data?.hrStats?.presentToday ?? 0, icon: <CheckCircle />, color: '#10b981' },
        { title: 'On Leave', value: data?.hrStats?.onLeave ?? 0, icon: <Calendar />, color: '#ef4444' },
        { title: 'Pending Leave', value: data?.stats?.pendingRequests ?? 0, icon: <Clock />, color: '#f59e0b' },
    ];

    const quickActions = [
        { label: 'Add Employee', icon: <UserPlus size={20}/>, onClick: () => {} },
        { label: 'Approve Leave', icon: <CheckCircle size={20}/>, onClick: () => {} },
        { label: 'Generate Payroll', icon: <DollarSign size={20}/>, onClick: () => {} },
    ];

    return (
        <div className="hr-wrapper">
            <header className="hr-header">
                <div>
                    <h1 className="title-gradient">HR Management Dashboard</h1>
                    <p className="text-muted">Overview of workforce attendance, leaves, and operational stability.</p>
                </div>
                <div className="hr-nav-actions">
                    <div className="hr-search glass-card">
                        <Search size={18}/>
                        <input type="text" placeholder="Search employee records..." />
                    </div>
                </div>
            </header>

            <section className="hr-stats grid-4">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </section>

            <div className="hr-main-grid">
                <div className="glass-card chart-section">
                    <div className="card-header-between">
                        <h3>Workforce Attendance (Monthly)</h3>
                        <button className="text-btn">Full Report</button>
                    </div>
                    <div className="chart-container-hr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.charts?.attendanceHistory || []}>
                                <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
                                <YAxis fontSize={12} stroke="#94a3b8" />
                                <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                <Bar dataKey="p" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card pie-section">
                    <h3>Leave Distribution</h3>
                    <div className="pie-container-hr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={data?.charts?.leaveDistribution || []}
                                    innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="v"
                                >
                                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <section className="tables-section-hr mt-30">
                <DataTable 
                    title="Pending Leave Requests"
                    headers={['Employee', 'Type', 'Duration', 'Reason', 'Actions']}
                    data={data?.tables?.pendingLeaves || []}
                    renderRow={(l) => (
                        <>
                            <td><strong>{l.employee?.userId?.name || 'Unknown'}</strong></td>
                            <td>{l.type}</td>
                            <td>{l.duration} Days</td>
                            <td className="text-muted">{l.reason}</td>
                            <td>
                                <div className="action-btns-flex">
                                    <button className="btn-approve-sm"><CheckCircle size={14}/> Approve</button>
                                    <button className="btn-reject-sm"><XCircle size={14}/> Reject</button>
                                </div>
                            </td>
                        </>
                    )}
                />
            </section>

            <div className="hr-bottom-grid mt-30">
                <div className="glass-card events-card">
                    <h3>Upcoming Events</h3>
                    <div className="events-list">
                        {[]} {/* To be populated from real event data */}
                    </div>
                </div>
                <QuickActions actions={quickActions} />
            </div>

            <style jsx="true">{`
                .hr-wrapper { padding: 30px; display: flex; flex-direction: column; gap: 30px; }
                .hr-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; }
                .hr-search { display: flex; align-items: center; gap: 10px; padding: 10px 20px; width: 300px; }
                .hr-search input { background: none; border: none; color: white; width: 100%; }
                
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
                .hr-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
                
                .chart-section, .pie-section { padding: 25px; }
                .chart-container-hr { height: 250px; margin-top: 20px; }
                .pie-container-hr { height: 200px; margin-top: 20px; }
                
                .card-header-between { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
                .text-btn { background: none; color: var(--primary); font-size: 13px; font-weight: 600; }
                
                .action-btns-flex { display: flex; gap: 8px; flex-wrap: wrap; }
                .btn-approve-sm { background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 12px; padding: 5px 12px; border-radius: 6px; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
                .btn-reject-sm { background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 12px; padding: 5px 12px; border-radius: 6px; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
                
                .hr-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .events-card { padding: 25px; }
                .events-list { margin-top: 15px; display: flex; flex-direction: column; gap: 10px; }
                .event-item { display: flex; align-items: center; gap: 10px; font-size: 14px; }
                .e-dot { width: 8px; height: 8px; border-radius: 50%; }
                .e-dot.info { background: var(--primary); }
                .e-dot.success { background: #10b981; }
                
                .mt-30 { margin-top: 30px; }
                .loader { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .hr-main-grid, .hr-bottom-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .hr-wrapper { padding: 15px; gap: 20px; }
                    .hr-header { flex-direction: column; align-items: flex-start; }
                    .hr-search { width: 100%; }
                    .grid-4 { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 480px) {
                    .grid-4 { grid-template-columns: 1fr; }
                    .card-header-between { flex-direction: column; align-items: flex-start; }
                }
            `}</style>
        </div>
    );
};

export default HRDashboard;
