import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, Clock, Search, Filter, AlertCircle, TrendingDown } from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css'; // Uses rd-container, rd-module-header etc.

const LIMITS = { Annual: 18, Sick: 10, Casual: 6 };

const LeaveBalance = () => {
    const [employees, setEmployees] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both employees and leaves to calculate balances
                const [empRes, leaveRes] = await Promise.all([
                    API.get('/employees'),
                    API.get('/leaves')
                ]);
                
                setEmployees(empRes.data || []);
                setLeaves(leaveRes.data || []);
            } catch (err) {
                console.error("Failed to load leave balances:", err);
                setError("Failed to load leave balances. Make sure you have the required permissions.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Calculate Balances ──
    const employeeBalances = employees.map(emp => {
        const empLeaves = leaves.filter(l => l.employee?._id === emp._id && l.status === 'Approved');
        
        const used = { Annual: 0, Sick: 0, Casual: 0, Unpaid: 0 };
        
        empLeaves.forEach(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            if (used[l.type] !== undefined) {
                used[l.type] += days;
            }
        });

        return {
            ...emp,
            used,
            balances: {
                Annual: Math.max(0, LIMITS.Annual - used.Annual),
                Sick: Math.max(0, LIMITS.Sick - used.Sick),
                Casual: Math.max(0, LIMITS.Casual - used.Casual),
            },
            totalUsed: used.Annual + used.Sick + used.Casual
        };
    });

    // ── Filtering ──
    const filtered = employeeBalances.filter(e => {
        const nameMatch = `${e.firstName} ${e.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const deptMatch = (e.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || deptMatch;
    });

    // ── Aggregates for KPI Cards ──
    const totalStaff = employees.length;
    const totalLeavesTaken = employeeBalances.reduce((acc, curr) => acc + curr.totalUsed, 0);
    const avgLeavesTaken = totalStaff ? Math.round(totalLeavesTaken / totalStaff) : 0;
    
    // Who is currently on leave?
    const today = new Date();
    today.setHours(0,0,0,0);
    const currentlyOnLeave = leaves.filter(l => {
        const s = new Date(l.startDate);
        const e = new Date(l.endDate);
        s.setHours(0,0,0,0);
        e.setHours(0,0,0,0);
        return l.status === 'Approved' && s <= today && e >= today;
    }).length;

    // ── Progress Bar Helper ──
    const renderProgressBar = (used, total, colorHex) => {
        const percentage = Math.min(100, Math.round((used / total) * 100));
        return (
            <div style={{ width: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#64748b' }}>
                    <span>{used} used</span>
                    <span>{total - used} left</span>
                </div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: colorHex, borderRadius: 10 }}></div>
                </div>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rd-container">
            <div className="rd-content">
                {/* ── Header ── */}
                <div className="rd-module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="rd-module-title" style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0 }}>Leave Balance</span>
                            <span className="rd-module-badge" style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>HRMS</span>
                        </div>
                    </div>
                </div>

                {/* ── KPIs ── */}
                <PastelKPIGrid columns={4}>
                    <PastelKPICard title="Total Staff Tracked" value={loading ? '…' : totalStaff} colorTheme="blue" icon={Users} trendValue="Active profiles" trendPositive={true} />
                    <PastelKPICard title="Total Leaves Taken" value={loading ? '…' : totalLeavesTaken} colorTheme="peach" icon={TrendingDown} trendValue="Company wide" trendPositive={false} />
                    <PastelKPICard title="Avg Leaves / Employee" value={loading ? '…' : avgLeavesTaken} colorTheme="purple" icon={CheckCircle} trendValue="Per employee" trendPositive={true} />
                    <PastelKPICard title="Currently On Leave" value={loading ? '…' : currentlyOnLeave} colorTheme="yellow" icon={Clock} trendValue="Away today" trendPositive={false} />
                </PastelKPIGrid>

                {error ? (
                    <div style={{ background: '#fef2f2', color: '#ef4444', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rd-table-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Employee Accruals</h3>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search employee or dept..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ padding: '8px 12px 8px 32px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, width: 220, outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className="rd-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Annual Leave (18)</th>
                                        <th>Sick Leave (10)</th>
                                        <th>Casual Leave (6)</th>
                                        <th>Unpaid Taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Calculating balances...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No employees found.</td></tr>
                                    ) : (
                                        filtered.map(emp => (
                                            <tr key={emp._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>
                                                            {emp.firstName?.[0]}{emp.lastName?.[0] || ''}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{emp.firstName} {emp.lastName}</div>
                                                            <div style={{ fontSize: 11, color: '#64748b' }}>{emp.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{emp.department || 'N/A'}</span></td>
                                                <td>{renderProgressBar(emp.used.Annual, LIMITS.Annual, '#3b82f6')}</td>
                                                <td>{renderProgressBar(emp.used.Sick, LIMITS.Sick, '#ef4444')}</td>
                                                <td>{renderProgressBar(emp.used.Casual, LIMITS.Casual, '#10b981')}</td>
                                                <td>
                                                    <span style={{ fontWeight: 700, color: emp.used.Unpaid > 0 ? '#ef4444' : '#64748b', fontSize: 13 }}>
                                                        {emp.used.Unpaid} days
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default LeaveBalance;
