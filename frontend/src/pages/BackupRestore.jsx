import React, { useState } from 'react';
import { Archive, Plus, Download, RefreshCw, Trash2, Database, FileText, CheckCircle, AlertCircle, Calendar, HardDrive, Server, Activity, Clock, Cloud, ShieldAlert } from 'lucide-react';
import './BackupRestore.css';

const BackupRestore = () => {
    const [backupData, setBackupData] = useState({
        database: true,
        uploadedFiles: true,
        documents: true,
        employeePhotos: true,
        materialImages: true,
        settings: true,
        backupType: 'full',
        backupName: `SMTBMS_Backup_${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '_')}`
    });

    const [backupHistory, setBackupHistory] = useState([
        { id: 1, date: '29 Jun', type: 'Full', size: '1.8GB', createdBy: 'Admin', status: 'Success', name: 'SMTBMS_Backup_29_June_2026' },
        { id: 2, date: '28 Jun', type: 'Database', size: '320MB', createdBy: 'System', status: 'Success', name: 'SMTBMS_Backup_28_June_2026' },
        { id: 3, date: '27 Jun', type: 'Full', size: '1.7GB', createdBy: 'Admin', status: 'Success', name: 'SMTBMS_Backup_27_June_2026' }
    ]);

    const [restoreBackup, setRestoreBackup] = useState('SMTBMS_Backup_29_June_2026');

    const [autoBackup, setAutoBackup] = useState({
        enabled: true,
        frequency: 'Daily',
        time: '23:00',
        keepLast: '30 Backups',
        storage: {
            local: true,
            gdrive: true,
            onedrive: false,
            s3: false
        }
    });

    const handleCheckboxChange = (field) => {
        setBackupData({ ...backupData, [field]: !backupData[field] });
    };

    const handleRadioChange = (type) => {
        setBackupData({ ...backupData, backupType: type });
    };

    const handleAutoStorageChange = (field) => {
        setAutoBackup({ 
            ...autoBackup, 
            storage: { ...autoBackup.storage, [field]: !autoBackup.storage[field] } 
        });
    };

    const handleCreateBackup = (e) => {
        e.preventDefault();
        const newBackup = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            type: backupData.backupType === 'full' ? 'Full' : backupData.backupType === 'db' ? 'Database' : 'Files',
            size: backupData.backupType === 'full' ? '1.8GB' : '300MB',
            createdBy: 'Admin',
            status: 'Success',
            name: backupData.backupName
        };
        setBackupHistory([newBackup, ...backupHistory]);
        alert(`Backup "${backupData.backupName}" created successfully.`);
    };

    const handleRestore = (e) => {
        e.preventDefault();
        alert(`Initiating restore from backup: ${restoreBackup}`);
    };

    return (
        <div className="page-container backup-page">
            <div className="page-header">
                <h2>Backup & Restore</h2>
            </div>
            
            {/* Stats Grid */}
            <div className="backup-stats-grid">
                <div className="premium-card stats-card">
                    <div className="stats-icon-wrapper blue">
                        <Calendar size={20} />
                    </div>
                    <div className="stats-info">
                        <span className="stats-label">Last Backup</span>
                        <span className="stats-value">29 Jun 2026</span>
                    </div>
                </div>
                <div className="premium-card stats-card">
                    <div className="stats-icon-wrapper purple">
                        <Database size={20} />
                    </div>
                    <div className="stats-info">
                        <span className="stats-label">Total Backups</span>
                        <span className="stats-value">32</span>
                    </div>
                </div>
                <div className="premium-card stats-card">
                    <div className="stats-icon-wrapper orange">
                        <HardDrive size={20} />
                    </div>
                    <div className="stats-info">
                        <span className="stats-label">Storage Used</span>
                        <span className="stats-value">28 GB</span>
                    </div>
                </div>
                <div className="premium-card stats-card">
                    <div className="stats-icon-wrapper green">
                        <Activity size={20} />
                    </div>
                    <div className="stats-info">
                        <span className="stats-label">Health</span>
                        <span className="stats-value">98%</span>
                    </div>
                </div>
            </div>

            <div className="profile-grid">
                <div className="profile-col-left">
                    {/* Create Backup */}
                    <div className="premium-card mb-24" style={{ padding: '24px' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Archive size={18} className="header-icon purple-icon" />
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Create Backup</h3>
                            </div>
                        </div>
                        
                        <div className="backup-section-divider"></div>

                        <form className="ui-form" onSubmit={handleCreateBackup}>
                            <div className="form-group mb-20">
                                <label style={{ marginBottom: '12px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Select data to include</label>
                                <div className="checkbox-grid">
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={backupData.database} onChange={() => handleCheckboxChange('database')} />
                                        <span className="checkmark"></span>
                                        Database
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={backupData.uploadedFiles} onChange={() => handleCheckboxChange('uploadedFiles')} />
                                        <span className="checkmark"></span>
                                        Uploaded Files
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={backupData.documents} onChange={() => handleCheckboxChange('documents')} />
                                        <span className="checkmark"></span>
                                        Documents
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={backupData.employeePhotos} onChange={() => handleCheckboxChange('employeePhotos')} />
                                        <span className="checkmark"></span>
                                        Employee Photos
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={backupData.materialImages} onChange={() => handleCheckboxChange('materialImages')} />
                                        <span className="checkmark"></span>
                                        Material Images
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={backupData.settings} onChange={() => handleCheckboxChange('settings')} />
                                        <span className="checkmark"></span>
                                        Settings
                                    </label>
                                </div>
                            </div>

                            <div className="form-group mb-20">
                                <label style={{ marginBottom: '12px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Backup Type</label>
                                <div className="radio-group">
                                    <label className="custom-radio">
                                        <input type="radio" name="backupType" checked={backupData.backupType === 'full'} onChange={() => handleRadioChange('full')} />
                                        <span className="radiomark"></span>
                                        Full Backup
                                    </label>
                                    <label className="custom-radio">
                                        <input type="radio" name="backupType" checked={backupData.backupType === 'db'} onChange={() => handleRadioChange('db')} />
                                        <span className="radiomark"></span>
                                        Database Only
                                    </label>
                                    <label className="custom-radio">
                                        <input type="radio" name="backupType" checked={backupData.backupType === 'files'} onChange={() => handleRadioChange('files')} />
                                        <span className="radiomark"></span>
                                        Files Only
                                    </label>
                                </div>
                            </div>

                            <div className="form-group mb-24">
                                <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Backup Name</label>
                                <input 
                                    type="text" 
                                    value={backupData.backupName} 
                                    onChange={(e) => setBackupData({...backupData, backupName: e.target.value})}
                                    className="ui-input"
                                />
                            </div>

                            <button type="submit" className="btn-save-full">
                                <Plus size={16} /> Create Backup
                            </button>
                        </form>
                    </div>

                    {/* Restore Backup */}
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <RefreshCw size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Restore Backup</h3>
                        </div>
                        
                        <div className="backup-section-divider"></div>

                        <form className="ui-form" onSubmit={handleRestore}>
                            <div className="form-group mb-20">
                                <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Select Backup</label>
                                <select 
                                    className="ui-input" 
                                    value={restoreBackup} 
                                    onChange={(e) => setRestoreBackup(e.target.value)}
                                >
                                    {backupHistory.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="warning-box mb-24">
                                <ShieldAlert size={18} className="warning-icon" />
                                <span>Restoring will overwrite current data.</span>
                            </div>

                            <button type="submit" className="btn-save-full btn-warning">
                                Restore
                            </button>
                        </form>
                    </div>
                </div>

                <div className="profile-col-right">
                    
                    {/* Automatic Backup */}
                    <div className="premium-card mb-24" style={{ padding: '24px' }}>
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Clock size={18} className="header-icon purple-icon" />
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Automatic Backup</h3>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={autoBackup.enabled} onChange={() => setAutoBackup({...autoBackup, enabled: !autoBackup.enabled})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        
                        <div className="backup-section-divider"></div>

                        <div className="ui-form" style={{ opacity: autoBackup.enabled ? 1 : 0.6, pointerEvents: autoBackup.enabled ? 'auto' : 'none' }}>
                            <div className="form-row-2 mb-20">
                                <div className="form-group">
                                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Frequency</label>
                                    <select className="ui-input" value={autoBackup.frequency} onChange={e => setAutoBackup({...autoBackup, frequency: e.target.value})}>
                                        <option>Daily</option>
                                        <option>Weekly</option>
                                        <option>Monthly</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Time</label>
                                    <input type="time" className="ui-input" value={autoBackup.time} onChange={e => setAutoBackup({...autoBackup, time: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="form-group mb-20">
                                <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Keep Last</label>
                                <select className="ui-input" value={autoBackup.keepLast} onChange={e => setAutoBackup({...autoBackup, keepLast: e.target.value})}>
                                    <option>10 Backups</option>
                                    <option>30 Backups</option>
                                    <option>50 Backups</option>
                                    <option>Unlimited</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ marginBottom: '12px', display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Storage</label>
                                <div className="checkbox-grid">
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={autoBackup.storage.local} onChange={() => handleAutoStorageChange('local')} />
                                        <span className="checkmark"></span>
                                        Local
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={autoBackup.storage.gdrive} onChange={() => handleAutoStorageChange('gdrive')} />
                                        <span className="checkmark"></span>
                                        Google Drive
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={autoBackup.storage.onedrive} onChange={() => handleAutoStorageChange('onedrive')} />
                                        <span className="checkmark"></span>
                                        OneDrive
                                    </label>
                                    <label className="custom-checkbox">
                                        <input type="checkbox" checked={autoBackup.storage.s3} onChange={() => handleAutoStorageChange('s3')} />
                                        <span className="checkmark"></span>
                                        AWS S3
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Backup History */}
                    <div className="premium-card h-full" style={{ padding: '24px' }}>
                        <div className="card-header">
                            <Server size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Backup History</h3>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="backup-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Size</th>
                                        <th>Created By</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backupHistory.map((backup, index) => (
                                        <tr key={index}>
                                            <td>{backup.date}</td>
                                            <td>
                                                <span className={`type-badge ${backup.type.toLowerCase()}`}>
                                                    {backup.type}
                                                </span>
                                            </td>
                                            <td>{backup.size}</td>
                                            <td>{backup.createdBy}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: backup.status === 'Success' ? '#10b981' : '#ef4444', fontSize: '13px', fontWeight: 500 }}>
                                                    {backup.status === 'Success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                    {backup.status}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    {index === 0 && <button className="action-btn download" title="Download"><Download size={16} /></button>}
                                                    {index === 1 && <button className="action-btn restore" title="Restore"><RefreshCw size={16} /></button>}
                                                    {index === 2 && <button className="action-btn delete" title="Delete"><Trash2 size={16} /></button>}
                                                    {index > 2 && <button className="action-btn download" title="Download"><Download size={16} /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackupRestore;
