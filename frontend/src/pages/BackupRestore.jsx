import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Database, Download, ArrowUpRight, CloudDownload, Trash2, ShieldAlert, FileText, Settings, AlertTriangle, RefreshCw } from 'lucide-react';
import './BackupRestore.css';

const BackupRestore = () => {
    const [autoBackup, setAutoBackup] = useState(true);
    const [historyData, setHistoryData] = useState([]);
    const [stats, setStats] = useState({ totalBackups: 0, lastBackup: null, storageUsed: '0 MB' });
    const [loading, setLoading] = useState(true);

    const fetchBackups = async () => {
        try {
            setLoading(true);
            const [listRes, statsRes] = await Promise.all([
                API.get('/backup/list'),
                API.get('/backup/statistics'),
                new Promise(resolve => setTimeout(resolve, 600)) // Artificial delay for visual feedback
            ]);
            setHistoryData(listRes.data || []);
            setStats(statsRes.data || { totalBackups: 0, lastBackup: null, storageUsed: '0 MB' });
        } catch (error) {
            console.error('Failed to load backups', error);
            toast.error('Failed to load backup data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleBackupNow = async () => {
        const loadingToast = toast.loading('Creating backup...');
        try {
            await API.post('/backup/create', { backupType: 'Full' });
            toast.success('Backup created successfully', { id: loadingToast });
            fetchBackups();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create backup', { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this backup?')) {
            try {
                await API.delete(`/backup/delete/${id}`);
                toast.success('Backup deleted');
                fetchBackups();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete backup');
            }
        }
    };

    const handleDownload = async (id, filename) => {
        try {
            const response = await API.get(`/backup/download/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'backup.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download backup');
        }
    };

    const handleRestore = async (id) => {
        if (window.confirm('WARNING: Restoring this backup will overwrite all current live data. This action cannot be undone. Are you sure you want to proceed?')) {
            const loadingToast = toast.loading('Restoring data from backup...');
            try {
                await API.post(`/backup/restore/${id}`);
                toast.success('Backup restored successfully. Please refresh the page.', { id: loadingToast });
                fetchBackups();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to restore backup', { id: loadingToast });
            }
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return { date: '-', time: '-' };
        const d = new Date(dateString);
        return {
            date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const lastBackupInfo = formatDateTime(stats.lastBackup);

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
                    <button className="btn-download-latest" onClick={fetchBackups} disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
                        Refresh
                    </button>
                    <button className="btn-backup-now" onClick={handleBackupNow}>
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
                        <div className="kpi-main">{lastBackupInfo.date.replace(/ /g, '\n')}</div>
                        <div className="kpi-sub">{lastBackupInfo.time}</div>
                    </div>
                    <div className="kpi-bg-icon kpi-bg-database"></div>
                </div>

                <div className="backup-kpi-card kpi-teal">
                    <div className="kpi-top">
                        <span className="kpi-title">TOTAL STORAGE USED</span>
                        <div className="kpi-arrow"><ArrowUpRight size={16} /></div>
                    </div>
                    <div className="kpi-value">
                        <div className="kpi-main">{stats.storageUsed.replace(' ', '\n')}</div>
                        <div className="kpi-sub">{stats.totalBackups} snapshots stored</div>
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
                                {loading ? (
                                    <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px'}}>Loading...</td></tr>
                                ) : historyData.length === 0 ? (
                                    <tr><td colSpan={6} style={{textAlign: 'center', padding: '40px'}}>No backups found</td></tr>
                                ) : (
                                    historyData.map((item, index) => {
                                        const dt = formatDateTime(item.createdAt);
                                        return (
                                            <tr key={item._id || index}>
                                                <td>
                                                    <div className="backup-name">{item.backupName}</div>
                                                    <div className="backup-id">{String(item._id || '').substring(0, 8) || `BK-${index}`}</div>
                                                </td>
                                                <td>{item.backupType || 'Full'}</td>
                                                <td>{item.fileSize || '-'}</td>
                                                <td>
                                                    <div className="backup-date">{dt.date},</div>
                                                    <div className="backup-time">{dt.time}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${(item.status || 'Success').toLowerCase()}`}>
                                                        {item.status === 'Success' ? <span className="status-dot green"></span> : <span className="status-dot red"></span>}
                                                        {item.status || 'Success'}
                                                    </span>
                                                </td>
                                                <td className="td-actions">
                                                    <div className="td-actions-wrapper" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                                        <button onClick={() => handleDownload(item._id, item.backupName)} title="Download" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer' }}>
                                                            <CloudDownload size={16} style={{ width: '16px', height: '16px', minWidth: '16px', strokeWidth: 2, display: 'block' }} />
                                                        </button>
                                                        <button onClick={() => handleRestore(item._id)} title="Restore" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid #fef3c7', background: '#fffbeb', color: '#f59e0b', cursor: 'pointer' }}>
                                                            <RefreshCw size={16} style={{ width: '16px', height: '16px', minWidth: '16px', strokeWidth: 2, display: 'block' }} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item._id)} title="Delete" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}>
                                                            <Trash2 size={16} style={{ width: '16px', height: '16px', minWidth: '16px', strokeWidth: 2, display: 'block' }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
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
