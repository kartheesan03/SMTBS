import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Clock, CheckCircle, XCircle, Plus , Calendar} from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { HRMSKPICard } from '../components/HRMSShared';

const LeaveManagement = () => {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/leaves');
            setLeaves(res.data || []);
        } catch (err) {
            console.error('Failed to fetch leaves:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleReview = async (id, status) => {
        try {
            await API.put(`/leaves/${id}/review`, { status, reviewNote: '' });
            fetchLeaves(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || `Failed to mark leave as ${status}`);
        }
    };

    // Calculate KPIs
    const totalRequests = leaves.length;
    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const approvedCount = leaves.filter(l => l.status === 'Approved').length;
    const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;
    const approvalRate = totalRequests > 0 ? Math.round((approvedCount / totalRequests) * 100) : 0;

    // Trend generator for UI
    

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

    const getInitials = (firstName, lastName) => `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '??';

    const calculateDays = (start, end) => {
        if (!start || !end) return '—';
        const s = new Date(start);
        const e = new Date(end);
        const diffMs = e - s;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // inclusive
        return `${diffDays}d`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return '—';
        return new Date(isoString).toLocaleDateString();
    };

    // Filter Logic
    const filteredLeaves = leaves.filter(leave => {
        const emp = leave.employee || {};
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        
        const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rd-container"
        >
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Leave Management</span>
                            <span className="rd-module-badge">HRMS</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="rd-kpi-row"
                >
                    <HRMSKPICard title="Total Requests" val={totalRequests} sub="All time" color="blue" icon={FileText} />
                    <HRMSKPICard title="Pending" val={pendingCount} sub="Action required" color="orange" icon={Clock} />
                    <HRMSKPICard title="Approved" val={approvedCount} sub={`${approvalRate}% approval rate`} color="green" icon={CheckCircle} />
                    <HRMSKPICard title="Rejected" val={rejectedCount} sub="Declined leaves" color="red" icon={XCircle} />
                </motion.div>

                {/* Table Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="rd-table-card"
                >
                    <div className="rd-table-header" style={{borderBottom: 'none', flexWrap: 'wrap', gap: 16}}>
                        <div style={{display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 250, flexShrink: 0, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input
                                    type="text"
                                    className="rd-search-input"
                                    placeholder="Search employee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" onClick={() => navigate('/leave-management/apply')}>
                                <Plus size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Apply Leave
                            </button>
                        </div>
                    </div>
                    
                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                <th>Employee</th>
                                <th>Dept</th>
                                <th>Leave Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Days</th>
                                <th>Status</th>
                                <th style={{width: 140, textAlign: 'center'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading leave data...</td>
                                </tr>
                            ) : filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No leave requests found</td>
                                </tr>
                            ) : (
                                filteredLeaves.map((leave, i) => {
                                    const emp = leave.employee || {};
                                    return (
                                        <tr key={leave._id || leave.id || i}>
                                            <td>
                                                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                    <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-purple-grad)'}}>
                                                        {getInitials(emp.firstName, emp.lastName)}
                                                    </div>
                                                    <div>
                                                        <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}</div>
                                                        <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.employeeId || '—'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{color: '#64748b'}}>{emp.department || '—'}</td>
                                            <td>{getTypePill(leave.type)}</td>
                                            <td style={{fontWeight: 500}}>{formatDate(leave.startDate)}</td>
                                            <td style={{fontWeight: 500}}>{formatDate(leave.endDate)}</td>
                                            <td>
                                                <span style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{calculateDays(leave.startDate, leave.endDate)}</span>
                                            </td>
                                            <td>{getStatusBadge(leave.status)}</td>
                                            <td style={{textAlign: 'center'}}>
                                                {leave.status === 'Pending' ? (
                                                    <div style={{display: 'flex', gap: 8, justifyContent: 'center'}}>
                                                        <button
                                                            onClick={() => handleReview(leave._id || leave.id, 'Approved')}
                                                            style={{background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600}}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReview(leave._id || leave.id, 'Rejected')}
                                                            style={{background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600}}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{color: '#94a3b8', fontSize: 12}}>—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LeaveManagement;
