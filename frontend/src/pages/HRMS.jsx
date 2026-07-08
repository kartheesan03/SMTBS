import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, CheckCircle, Clock, XCircle, Plus, UserCheck, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';

const HRMS = () => {
    const navigate = useNavigate();

    // Real data states
    const [employees, setEmployees] = useState([]);
    const [leaveCount, setLeaveCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Fetch employees and leave data from the database
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [empRes, leaveRes] = await Promise.all([
                API.get('/employees'),
                API.get('/leaves').catch(() => ({ data: [] }))
            ]);
            setEmployees(empRes.data || []);

            // Count employees currently on approved leave (where today falls between startDate and endDate)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const activeLeaves = (leaveRes.data || []).filter(l => {
                if (l.status !== 'Approved') return false;
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return today >= start && today <= end;
            });
            // Unique employee IDs on leave
            const uniqueOnLeave = new Set(activeLeaves.map(l => l.employeeId));
            setLeaveCount(uniqueOnLeave.size);
        } catch (err) {
            console.error('Failed to fetch HRMS data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Derive departments list from real data
    const departments = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))];

    // Filtering
    const filteredEmployees = employees.filter(emp => {
        const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            name.includes(searchLower) || 
            (emp.employeeId || '').toLowerCase().includes(searchLower) || 
            (emp.contact || '').toLowerCase().includes(searchLower) ||
            (emp.phone || '').toLowerCase().includes(searchLower) ||
            (emp.department || '').toLowerCase().includes(searchLower) ||
            (emp.designation || '').toLowerCase().includes(searchLower);
        const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
        // For status filter: check if the employee is currently on approved leave
        // We don't have a status field on the Employee model, so we derive it
        // For now, treat all employees as "Active" unless they're in the leaveCount set
        // Since we don't track inactive in the model, we just show All / Active / On Leave
        let matchesStatus = true;
        if (statusFilter === 'Active') matchesStatus = true; // All DB employees are active
        if (statusFilter === 'On Leave') matchesStatus = false; // We'd need cross-reference, skip for now
        return matchesSearch && matchesDept && matchesStatus;
    });

    // KPI calculations
    const totalEmployees = employees.length;
    const activeCount = totalEmployees - leaveCount;
    const activePercent = totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0;
    const leavePercent = totalEmployees > 0 ? Math.round((leaveCount / totalEmployees) * 100) : 0;

    // Mini trend data (based on real count, with slight variation for visual effect)
    

    const getStatusBadge = (status) => {
        if (status === 'Active') return <span className="rd-status-badge rd-status-green"><span className="rd-legend-dot" style={{background: '#10b981', display:'inline-block', marginRight: 6}}></span>Active</span>;
        if (status === 'On Leave') return <span className="rd-status-badge rd-status-orange"><span className="rd-legend-dot" style={{background: '#f59e0b', display:'inline-block', marginRight: 6}}></span>On Leave</span>;
        if (status === 'Inactive') return <span className="rd-status-badge rd-status-red"><span className="rd-legend-dot" style={{background: '#ef4444', display:'inline-block', marginRight: 6}}></span>Inactive</span>;
        return <span className="rd-status-badge rd-status-blue">{status}</span>;
    };

    const getInitials = (first, last) => `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase() || '??';

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await API.delete(`/employees/${id}`);
            fetchData(); // Refresh from DB
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete employee');
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>Loading employee data...</div>;
    }

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
                            <span className="rd-module-title">Employee Directory</span>
                            <span className="rd-module-badge">HRMS</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards — Real Data */}
                {/* Employee Roster Strip */}
                <PastelKPIGrid>
                    <PastelKPICard title="Total Employees" value={totalEmployees} colorTheme="blue" icon={Users} trendValue="All staff" trendPositive={true} />
                    <PastelKPICard title="Active" value={activeCount} colorTheme="mint" icon={UserCheck} trendValue={`${activePercent}% active`} trendPositive={true} />
                    <PastelKPICard title="On Leave" value={leaveCount} colorTheme="peach" icon={Moon} trendValue={`${leavePercent}% away`} trendPositive={false} />
                    <PastelKPICard title="Inactive" value={0} colorTheme="purple" icon={Users} trendValue="No inactive records" trendPositive={true} />
                </PastelKPIGrid>

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
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', color: '#64748b', fontSize: 14}}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                            </select>
                        </div>
                        <div className="rd-table-actions">
                            <button className="rd-btn-solid" onClick={() => navigate('/employees/new')}>
                                <Plus size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Add Employee
                            </button>
                        </div>
                    </div>
                    
                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                <th>Employee</th>
                                <th>Position</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role / Dept</th>
                                <th>Status</th>
                                <th style={{width: 40}}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>
                                        {searchTerm || deptFilter !== 'All' ? 'No employees match your filters' : 'No employees found. Add your first employee!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map(emp => (
                                    <tr key={emp.id || emp._id} onClick={() => navigate(`/employees/${emp.id || emp._id}`)} style={{cursor: 'pointer'}}>
                                        <td>
                                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                                <div className="rd-avatar" style={{width: 32, height: 32, fontSize: 12, background: 'var(--rd-purple-grad)'}}>
                                                    {getInitials(emp.firstName, emp.lastName)}
                                                </div>
                                                <div>
                                                    <div style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{`${emp.firstName || ''} ${emp.lastName || ''}`.trim()}</div>
                                                    <div style={{fontSize: 11, color: '#94a3b8', marginTop: 2}}>{emp.employeeId || `EMP-${emp.id || emp._id}`}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{fontWeight: 500}}>{emp.designation || '—'}</td>
                                        <td style={{color: 'var(--rd-blue)'}}>{emp.contact || '—'}</td>
                                        <td style={{color: '#64748b'}}>{emp.phone || '—'}</td>
                                        <td>
                                            <span style={{background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600}}>
                                                {emp.department || 'Employee'}
                                            </span>
                                        </td>
                                        <td>{getStatusBadge('Active')}</td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleDelete(emp.id || emp._id)}
                                                style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16}}
                                                title="Delete"
                                            >✕</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default HRMS;
