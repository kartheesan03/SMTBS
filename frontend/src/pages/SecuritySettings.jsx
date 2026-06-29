import React, { useState } from 'react';
import { ClipboardList, RefreshCw, Download, ArrowUpRight, Users, FileText, Target, Shield, Search, ChevronDown, LogIn, Edit, Trash2 } from 'lucide-react';
import './SecuritySettings.css';

const SecuritySettings = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const auditLogs = [
        {
            id: 1,
            user: 'Admin User',
            action: 'Login',
            actionColor: 'green',
            module: 'Authentication',
            detail: 'Signed in from Chrome on Windows',
            time: '23 Jun 2026, 23:31',
            icon: <LogIn size={16} color="#10b981" />
        },
        {
            id: 2,
            user: 'Priya Nair',
            action: 'Update',
            actionColor: 'orange',
            module: 'Material Tracking',
            detail: 'Updated stock count for SKU-4471 (Copper Wire 2mm)',
            time: '23 Jun 2026, 22:54',
            icon: <Edit size={16} color="#f59e0b" />
        },
        {
            id: 3,
            user: 'System',
            action: 'Delete',
            actionColor: 'red',
            module: 'User Management',
            detail: 'Removed inactive user account (ID: 1042)',
            time: '23 Jun 2026, 21:15',
            icon: <Trash2 size={16} color="#ef4444" />
        }
    ];

    return (
        <div className="sec-container">
            {/* Header */}
            <div className="sec-header-row">
                <div className="sec-header-left">
                    <div className="sec-header-icon">
                        <ClipboardList size={24} color="#8b5cf6" />
                    </div>
                    <div>
                        <span className="sec-pre-title">SECURITY & COMPLIANCE</span>
                        <h2>Audit Logs</h2>
                        <p>A complete, timestamped trail of activity across SMTBMS.</p>
                    </div>
                </div>
                <div className="sec-header-actions">
                    <button className="sec-btn-outline">
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button className="sec-btn-primary">
                        <Download size={14} /> Export Logs
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="sec-kpi-grid">
                {/* Total Events */}
                <div className="sec-kpi-card purple">
                    <div className="sec-kpi-top">
                        <span className="sec-kpi-title">TOTAL EVENTS (24H)</span>
                        <div className="sec-kpi-arrow"><ArrowUpRight size={14} /></div>
                    </div>
                    <div className="sec-kpi-content">
                        <div className="sec-kpi-info">
                            <h3>12</h3>
                            <p>Across all modules</p>
                        </div>
                        <div className="sec-kpi-icon-large">
                            <Users size={48} />
                        </div>
                    </div>
                </div>

                {/* Failed Logins */}
                <div className="sec-kpi-card pink">
                    <div className="sec-kpi-top">
                        <span className="sec-kpi-title">FAILED LOGINS</span>
                        <div className="sec-kpi-arrow"><ArrowUpRight size={14} /></div>
                    </div>
                    <div className="sec-kpi-content">
                        <div className="sec-kpi-info">
                            <h3>2</h3>
                            <p>Flagged for review</p>
                        </div>
                        <div className="sec-kpi-icon-large">
                            <FileText size={48} />
                        </div>
                    </div>
                </div>

                {/* Records Created */}
                <div className="sec-kpi-card blue">
                    <div className="sec-kpi-top">
                        <span className="sec-kpi-title">RECORDS CREATED</span>
                        <div className="sec-kpi-arrow"><ArrowUpRight size={14} /></div>
                    </div>
                    <div className="sec-kpi-content">
                        <div className="sec-kpi-info">
                            <h3>2</h3>
                            <p>New entries added</p>
                        </div>
                        <div className="sec-kpi-icon-large">
                            <Target size={48} />
                        </div>
                    </div>
                </div>

                {/* Records Deleted */}
                <div className="sec-kpi-card yellow">
                    <div className="sec-kpi-top">
                        <span className="sec-kpi-title">RECORDS DELETED</span>
                        <div className="sec-kpi-arrow"><ArrowUpRight size={14} /></div>
                    </div>
                    <div className="sec-kpi-content">
                        <div className="sec-kpi-info">
                            <h3>1</h3>
                            <p>Removed by admins</p>
                        </div>
                        <div className="sec-kpi-icon-large">
                            <Shield size={48} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs List Section */}
            <div className="sec-logs-container">
                <div className="sec-logs-toolbar">
                    <div className="sec-search-bar">
                        <Search size={16} color="#94a3b8" />
                        <input 
                            type="text" 
                            placeholder="Search by user, module, or det..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="sec-filter-dropdown">
                        <select>
                            <option>All</option>
                            <option>Login</option>
                            <option>Update</option>
                            <option>Delete</option>
                        </select>
                    </div>
                    <div className="sec-logs-count">
                        12 events
                    </div>
                </div>

                <div className="sec-logs-list">
                    {auditLogs.map(log => (
                        <div key={log.id} className="sec-log-row">
                            <div className="sec-log-left">
                                <div className={`sec-log-icon-bg ${log.actionColor}`}>
                                    {log.icon}
                                </div>
                                <div className="sec-log-info">
                                    <div className="sec-log-user-row">
                                        <h4>{log.user}</h4>
                                        <span className={`sec-badge ${log.actionColor}`}>{log.action}</span>
                                        <span className="sec-log-module">&bull; {log.module}</span>
                                    </div>
                                    <p className="sec-log-detail">{log.detail}</p>
                                </div>
                            </div>
                            <div className="sec-log-right">
                                <span className="sec-log-time">{log.time}</span>
                                <ChevronDown size={16} color="#94a3b8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
