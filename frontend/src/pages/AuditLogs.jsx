import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Search, Filter, RefreshCw } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalLogs: 0, todayLogs: 0 });
    const [filter, setFilter] = useState({ module: '', action: '' });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [logsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/audit-logs', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: filter
                }),
                axios.get('http://localhost:5000/api/audit-logs/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setLogs(logsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return '#10b981';
            case 'UPDATE': return '#3b82f6';
            case 'DELETE': return '#ef4444';
            case 'APPROVE': return '#8b5cf6';
            case 'REJECT': return '#f59e0b';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={24} color="#3b82f6" />
                        System Audit Logs
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Monitor all system activity and security events</p>
                </div>
                <button 
                    onClick={fetchLogs}
                    style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Total Events Logged</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>{stats.totalLogs}</div>
                </div>
                <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Events Today</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#3b82f6', marginTop: '8px' }}>{stats.todayLogs}</div>
                </div>
                <div style={{ flex: 2, background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Filter size={20} color="#64748b" />
                    <select 
                        value={filter.module} 
                        onChange={(e) => setFilter({...filter, module: e.target.value})}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 1 }}
                    >
                        <option value="">All Modules</option>
                        <option value="Order">Orders</option>
                        <option value="Material">Materials</option>
                        <option value="User">Users</option>
                    </select>
                    <select 
                        value={filter.action} 
                        onChange={(e) => setFilter({...filter, action: e.target.value})}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', flex: 1 }}
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="APPROVE">APPROVE</option>
                    </select>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>TIMESTAMP</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>USER</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>ACTION</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>MODULE</th>
                            <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '13px' }}>DESCRIPTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No audit logs found.</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '14px' }}>{log.userName || 'System'}</div>
                                    {log.changes?.role && <div style={{ fontSize: '12px', color: '#64748b' }}>Role: {log.changes.role}</div>}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        background: `${getActionColor(log.action)}15`, 
                                        color: getActionColor(log.action),
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#475569', fontWeight: 500 }}>
                                    {log.module}
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                                    {log.description}
                                    {log.changes && log.changes.oldStatus && log.changes.newStatus && (
                                        <div style={{ fontSize: '12px', marginTop: '4px', color: '#64748b', background: '#f8fafc', padding: '6px', borderRadius: '4px' }}>
                                            Status: <span style={{ textDecoration: 'line-through' }}>{log.changes.oldStatus}</span> &rarr; <span style={{ fontWeight: 600 }}>{log.changes.newStatus}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;
