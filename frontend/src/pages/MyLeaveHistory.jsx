import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PageHeader from '../components/PageHeader';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, CheckCircle, XCircle, Search, AlertCircle, Users } from 'lucide-react';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const MyLeaveHistory = () => {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyLeaves = async () => {
            try {
                const res = await API.get('/leaves/my');
                setLeaves(res.data || []);
            } catch (err) {
                console.error('Failed to fetch leaves:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyLeaves();
    }, []);

    const LIMITS = { Annual: 18, Sick: 10, Casual: 6 };

    // Calculate balances based on approved and pending leaves so users don't over-apply
    const calculateBalances = () => {
        const used = { Annual: 0, Sick: 0, Casual: 0, Unpaid: 0 };
        const activeLeaves = leaves.filter(l => l.status === 'Approved' || l.status === 'Pending');
        
        activeLeaves.forEach(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            if (used[l.type] !== undefined) {
                used[l.type] += days;
            }
        });

        return {
            Annual: { used: used.Annual, left: Math.max(0, LIMITS.Annual - used.Annual), total: LIMITS.Annual, color: '#10b981' },
            Sick: { used: used.Sick, left: Math.max(0, LIMITS.Sick - used.Sick), total: LIMITS.Sick, color: '#ef4444' },
            Casual: { used: used.Casual, left: Math.max(0, LIMITS.Casual - used.Casual), total: LIMITS.Casual, color: '#3b82f6' }
        };
    };

    const balances = calculateBalances();



    const getStatusBadge = (status) => {
        if (status === 'Approved') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Approved</span>;
        if (status === 'Rejected') return <span className="rd-status-badge rd-status-red"><span className="rd-legend-dot" style={{background: '#ef4444', display:'inline-block', marginRight: 6}}></span>Rejected</span>;
        if (status === 'Pending') return <span className="rd-status-badge rd-status-orange"><span className="rd-legend-dot" style={{background: '#f59e0b', display:'inline-block', marginRight: 6}}></span>Pending</span>;
        return <span className="rd-status-badge rd-status-blue">{status}</span>;
    };

    const getTypePill = (type) => {
        if (type === 'Casual') return <span style={{background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
        if (type === 'Sick') return <span style={{background: '#fdf2f8', color: '#ec4899', border: '1px solid #fbcfe8', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
        if (type === 'Annual') return <span style={{background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
        return <span style={{background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>{type}</span>;
    };

    const calculateDays = (start, end) => {
        if (!start || !end) return '—';
        const diffMs = new Date(end) - new Date(start);
        return `${Math.ceil(diffMs / 86400000) + 1}d`;
    };

    const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString() : '—';

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rd-container">
            <div className="rd-content">
                <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <PageHeader title="Leave Management" badge="HRMS" subtitle="Track your past and pending leave requests" />
                    <button 
                        onClick={() => navigate('/leave-management/apply')}
                        style={{ 
                            background: '#3b82f6', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '10px 18px', 
                            borderRadius: 8, 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            cursor: 'pointer', 
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                    >
                        <Calendar size={18} /> Apply Leave
                    </button>
                </div>

                {!loading && (
                    <div style={{ marginBottom: 24 }}>
                        <PastelKPIGrid>
                            <PastelKPICard 
                                title="Annual Leave" 
                                value={`${balances.Annual.left} left`} 
                                colorTheme="mint" 
                                icon={CheckCircle} 
                                trendValue={`${balances.Annual.used} used | ${balances.Annual.total} total`} 
                                trendPositive={true} 
                            />
                            <PastelKPICard 
                                title="Sick Leave" 
                                value={`${balances.Sick.left} left`} 
                                colorTheme="peach" 
                                icon={AlertCircle} 
                                trendValue={`${balances.Sick.used} used | ${balances.Sick.total} total`} 
                                trendPositive={true} 
                            />
                            <PastelKPICard 
                                title="Casual Leave" 
                                value={`${balances.Casual.left} left`} 
                                colorTheme="blue" 
                                icon={Users} 
                                trendValue={`${balances.Casual.used} used | ${balances.Casual.total} total`} 
                                trendPositive={true} 
                            />
                        </PastelKPIGrid>
                    </div>
                )}

                <div className="rd-table-card">
                    <div className="rd-table-scroll">
                        <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Leave Type</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading your leave history...</td>
                                    </tr>
                                ) : leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>You have no leave history.</td>
                                    </tr>
                                ) : (
                                    leaves.map((leave, i) => (
                                        <tr key={leave._id || i}>
                                            <td data-label="Leave Type">{getTypePill(leave.type)}</td>
                                            <td style={{fontWeight: 500}} data-label="From">{formatDate(leave.startDate)}</td>
                                            <td style={{fontWeight: 500}} data-label="To">{formatDate(leave.endDate)}</td>
                                            <td data-label="Days">
                                                <span style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{calculateDays(leave.startDate, leave.endDate)}</span>
                                            </td>
                                            <td data-label="Reason" style={{maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                {leave.reason || '—'}
                                            </td>
                                            <td data-label="Status">{getStatusBadge(leave.status)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MyLeaveHistory;
