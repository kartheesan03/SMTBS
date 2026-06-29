import React, { useState } from 'react';
import { Database, Download, ArrowUpRight, CloudDownload, Trash2, ShieldAlert, FileText, Settings, AlertTriangle } from 'lucide-react';
import './BackupRestore.css';

const BackupRestore = () => {
    const [autoBackup, setAutoBackup] = useState(true);

    const historyData = [
        { id: 'BK-2206', name: 'Daily Auto Backup', type: 'Automatic', size: '1.84 GB', date: '23 Jun 2026, 02:00', status: 'Completed' },
        { id: 'BK-2205', name: 'Daily Auto Backup', type: 'Automatic', size: '1.83 GB', date: '22 Jun 2026, 02:00', status: 'Completed' },
        { id: 'BK-2204', name: 'Pre-upgrade Snapshot', type: 'Manual', size: '1.81 GB', date: '21 Jun 2026, 14:22', status: 'Completed' },
        { id: 'BK-2203', name: 'Daily Auto Backup', type: 'Automatic', size: '1.79 GB', date: '20 Jun 2026, 02:00', status: 'Completed' },
        { id: 'BK-2202', name: 'Daily Auto Backup', type: 'Automatic', size: '—', date: '19 Jun 2026, 02:00', status: 'Failed' },
        { id: 'BK-2201', name: 'Daily Auto Backup', type: 'Automatic', size: '1.77 GB', date: '18 Jun 2026, 02:00', status: 'Completed' },
    ];

    return (
        <div className="backup-restore-container">
            {/* Header */}
            <div className="backup-header-section">
                <div className="backup-header-left">
                    <div className="backup-header-icon">
                        <Database size={28} className="header-icon" />
                    </div>
                    <div className="backup-header-text">
                        <span className="backup-eyebrow">DATA PROTECTION</span>
                        <h1>Backup & Restore</h1>
                        <p>Protect your data with scheduled backups and one-click restores.</p>
                    </div>
                </div>
                <div className="backup-header-actions">
                    <button className="btn-download-latest">
                        <CloudDownload size={18} />
                        Download Latest
                    </button>
                    <button className="btn-backup-now">
                        <Database size={18} />
                        Backup Now
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="backup-kpi-grid">
                <div className="backup-kpi-card kpi-green">
                    <div className="kpi-top">
                        <span className="kpi-title">LAST SUCCESSFUL BACKUP</span>
                        <div className="kpi-arrow"><ArrowUpRight size={16} /></div>
                    </div>
                    <div className="kpi-value">
                        <div className="kpi-main">23 Jun<br/>2026</div>
                        <div className="kpi-sub">02:00</div>
                    </div>
                    <div className="kpi-bg-icon kpi-bg-database"></div>
                </div>

                <div className="backup-kpi-card kpi-teal">
                    <div className="kpi-top">
                        <span className="kpi-title">TOTAL STORAGE USED</span>
                        <div className="kpi-arrow"><ArrowUpRight size={16} /></div>
                    </div>
                    <div className="kpi-value">
                        <div className="kpi-main">9.04<br/>GB</div>
                        <div className="kpi-sub">6 snapshots stored</div>
                    </div>
                    <div className="kpi-bg-icon kpi-bg-storage"></div>
                </div>

                <div className="backup-kpi-card kpi-blue">
                    <div className="kpi-top">
                        <span className="kpi-title">BACKUP FREQUENCY</span>
                        <div className="kpi-arrow"><ArrowUpRight size={16} /></div>
                    </div>
                    <div className="kpi-value">
                        <div className="kpi-main-single">Daily</div>
                        <div className="kpi-sub">Automated backups on</div>
                    </div>
                    <div className="kpi-bg-icon kpi-bg-stack"></div>
                </div>

                <div className="backup-kpi-card kpi-purple">
                    <div className="kpi-top">
                        <span className="kpi-title">RETENTION POLICY</span>
                        <div className="kpi-arrow"><ArrowUpRight size={16} /></div>
                    </div>
                    <div className="kpi-value">
                        <div className="kpi-main-single">30<br/>days</div>
                        <div className="kpi-sub">Older backups auto-purged</div>
                    </div>
                    <div className="kpi-bg-icon kpi-bg-circle"></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="backup-main-grid">
                {/* Left Column - History */}
                <div className="backup-history-card">
                    <div className="card-header">
                        <FileText size={20} className="card-title-icon" />
                        <h2>Backup History</h2>
                    </div>
                    
                    <div className="backup-table-wrapper">
                        <table className="backup-table">
                            <thead>
                                <tr>
                                    <th>BACKUP</th>
                                    <th>TYPE</th>
                                    <th>SIZE</th>
                                    <th>CREATED</th>
                                    <th>STATUS</th>
                                    <th className="th-actions"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="backup-name">{item.name}</div>
                                            <div className="backup-id">{item.id}</div>
                                        </td>
                                        <td>{item.type}</td>
                                        <td>{item.size}</td>
                                        <td>
                                            <div className="backup-date">{item.date.split(',')[0]},</div>
                                            <div className="backup-time">{item.date.split(',')[1]}</div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status === 'Completed' ? <span className="status-dot green"></span> : <span className="status-dot red"></span>}
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="td-actions">
                                            <button className="action-btn download-btn"><CloudDownload size={16} /></button>
                                            <button className="action-btn delete-btn"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column - Settings & Warning */}
                <div className="backup-sidebar">
                    <div className="backup-settings-card">
                        <div className="card-header">
                            <Settings size={20} className="card-title-icon" />
                            <h2>Backup Settings</h2>
                        </div>
                        
                        <div className="settings-toggle-group">
                            <div className="toggle-info">
                                <h3>Automatic Backups</h3>
                                <p>Run scheduled backups automatically</p>
                            </div>
                            <div className="toggle-switch-container">
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={autoBackup}
                                        onChange={() => setAutoBackup(!autoBackup)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="settings-field">
                            <label>FREQUENCY</label>
                            <select defaultValue="Daily" className="br-select">
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        <div className="settings-field">
                            <label>RETENTION POLICY</label>
                            <select defaultValue="30 days" className="br-select">
                                <option value="7 days">7 days</option>
                                <option value="14 days">14 days</option>
                                <option value="30 days">30 days</option>
                                <option value="60 days">60 days</option>
                            </select>
                        </div>
                    </div>

                    <div className="backup-warning-card">
                        <div className="warning-icon-wrapper">
                            <ShieldAlert size={24} />
                        </div>
                        <div className="warning-content">
                            <h3>Restoring overwrites live data</h3>
                            <p>Always create a fresh manual backup before restoring an older snapshot, in case you need to undo the restore.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;
