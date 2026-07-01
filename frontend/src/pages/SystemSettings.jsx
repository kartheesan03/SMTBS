import React, { useState } from 'react';
import { Settings, Shield, RefreshCw, BarChart2, Lock, Cpu, AlertTriangle, Trash2, Calendar as CalendarIcon, UploadCloud, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import './SystemSettings.css';

const SystemSettings = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'Light');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'English');
    const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || 'Asia/Kolkata');
    const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
    const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');

    const [sysPrefs, setSysPrefs] = useState(() => {
        const saved = localStorage.getItem('sysPrefs');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing sysPrefs", e);
            }
        }
        return {
            autoBackup: true,
            analytics: true,
            maintenance: false,
            developerMode: false
        };
    });

    const handleToggle = (key) => {
        setSysPrefs(prev => {
            const newValue = !prev[key];
            const labels = {
                autoBackup: 'Automatic Backup',
                analytics: 'Analytics & Tracking',
                maintenance: 'Maintenance Mode',
                developerMode: 'Developer Mode'
            };
            toast.success(`${labels[key]} ${newValue ? 'enabled' : 'disabled'} successfully`);
            return { ...prev, [key]: newValue };
        });
    };

    const handleSave = () => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('language', language);
        localStorage.setItem('timezone', timezone);
        localStorage.setItem('dateFormat', dateFormat);
        localStorage.setItem('currency', currency);
        localStorage.setItem('sysPrefs', JSON.stringify(sysPrefs));
        
        if (theme === 'Dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
        
        window.dispatchEvent(new Event('settingsUpdated'));
        toast.success("System settings saved successfully");
    };

    const handleAction = (actionType) => {
        switch (actionType) {
            case 'clear_cache':
                toast.success('System cache cleared successfully');
                break;
            case 'export':
                toast.success('System data export initiated');
                break;
            case 'reset':
                toast.success('System settings restored to defaults');
                break;
            case 'wipe':
                toast.error('This action requires Super Admin confirmation');
                break;
            default:
                break;
        }
    };

    return (
        <div className="ss-container">
            {/* Header */}
            <div className="ss-header-row">
                <div className="ss-title">
                    <h2>System Settings</h2>
                    <p>Manage your system preferences and configurations</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="ss-grid">
                {/* Left Column - Display & Locale */}
                <div className="ss-card">
                    <div className="ss-card-header">
                        <div className="ss-icon-box ss-blue-light">
                            <Settings size={18} color="#3b82f6" />
                        </div>
                        <div>
                            <h3>Display & Locale</h3>
                            <p>Customize the look and feel of the system</p>
                        </div>
                    </div>

                    <div className="ss-form">
                        <div className="ss-form-row">
                            <div className="ss-form-group">
                                <label>THEME</label>
                                <div className="ss-select-wrapper">
                                    <span className="ss-select-icon">🌞</span>
                                    <select value={theme} onChange={e => setTheme(e.target.value)}>
                                        <option>Light</option>
                                        <option>Dark</option>
                                        <option>System</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ss-form-group">
                                <label>LANGUAGE</label>
                                <div className="ss-select-wrapper">
                                    <select value={language} onChange={e => setLanguage(e.target.value)}>
                                        <option>English</option>
                                        <option>Spanish</option>
                                        <option>French</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="ss-form-row">
                            <div className="ss-form-group">
                                <label>TIMEZONE</label>
                                <div className="ss-select-wrapper">
                                    <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                                        <option>Asia/Kolkata</option>
                                        <option>America/New_York</option>
                                        <option>Europe/London</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ss-form-group">
                                <label>DATE FORMAT</label>
                                <div className="ss-select-wrapper">
                                    <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                                        <option>DD/MM/YYYY</option>
                                        <option>MM/DD/YYYY</option>
                                        <option>YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="ss-form-group">
                            <label>DEFAULT CURRENCY</label>
                            <div className="ss-select-wrapper">
                                <select value={currency} onChange={e => setCurrency(e.target.value)}>
                                    <option>INR</option>
                                    <option>USD</option>
                                    <option>EUR</option>
                                    <option>GBP</option>
                                </select>
                            </div>
                        </div>

                        <button className="ss-btn-save" onClick={handleSave}>
                            <Shield size={16} /> Save Settings
                        </button>
                    </div>
                </div>

                {/* Right Column - System Controls */}
                <div className="ss-card">
                    <div className="ss-card-header">
                        <div className="ss-icon-box ss-purple-light">
                            <Shield size={18} color="#8b5cf6" />
                        </div>
                        <div>
                            <h3>System Controls</h3>
                            <p>Control system-wide features and access</p>
                        </div>
                    </div>

                    <div className="ss-toggle-list">
                        <div className="ss-toggle-item">
                            <div className="ss-item-left">
                                <div className="ss-item-icon ss-purple-lighter">
                                    <RefreshCw size={16} color="#8b5cf6" />
                                </div>
                                <div className="ss-item-text">
                                    <h4>Automatic Backup</h4>
                                    <p>Daily cloud backup of all data</p>
                                </div>
                            </div>
                            <label className="ss-switch ss-purple">
                                <input type="checkbox" checked={sysPrefs.autoBackup} onChange={() => handleToggle('autoBackup')} />
                                <span className="ss-slider"></span>
                            </label>
                        </div>

                        <div className="ss-toggle-item">
                            <div className="ss-item-left">
                                <div className="ss-item-icon ss-cyan-lighter">
                                    <BarChart2 size={16} color="#06b6d4" />
                                </div>
                                <div className="ss-item-text">
                                    <h4>Analytics & Tracking</h4>
                                    <p>Share anonymous usage data</p>
                                </div>
                            </div>
                            <label className="ss-switch ss-cyan">
                                <input type="checkbox" checked={sysPrefs.analytics} onChange={() => handleToggle('analytics')} />
                                <span className="ss-slider"></span>
                            </label>
                        </div>

                        <div className="ss-toggle-item">
                            <div className="ss-item-left">
                                <div className="ss-item-icon ss-gray-light">
                                    <Lock size={16} color="#94a3b8" />
                                </div>
                                <div className="ss-item-text">
                                    <h4>Maintenance Mode</h4>
                                    <p>Disable access for non-admins</p>
                                </div>
                            </div>
                            <label className="ss-switch ss-gray">
                                <input type="checkbox" checked={sysPrefs.maintenance} onChange={() => handleToggle('maintenance')} />
                                <span className="ss-slider"></span>
                            </label>
                        </div>

                        <div className="ss-toggle-item">
                            <div className="ss-item-left">
                                <div className="ss-item-icon ss-gray-light">
                                    <Cpu size={16} color="#94a3b8" />
                                </div>
                                <div className="ss-item-text">
                                    <h4>Developer / Debug Mode</h4>
                                    <p>Verbose logging and dev tools</p>
                                </div>
                            </div>
                            <label className="ss-switch ss-gray">
                                <input type="checkbox" checked={sysPrefs.developerMode} onChange={() => handleToggle('developerMode')} />
                                <span className="ss-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="ss-danger-zone">
                <div className="ss-dz-header">
                    <div className="ss-dz-icon">
                        <AlertTriangle size={18} color="#ef4444" />
                    </div>
                    <div>
                        <h3 className="ss-text-red">Danger Zone</h3>
                        <p>Irreversible and sensitive actions</p>
                    </div>
                </div>

                <div className="ss-dz-grid">
                    <div className="ss-dz-card blue" onClick={() => handleAction('clear_cache')} style={{cursor: 'pointer'}}>
                        <div className="ss-dz-card-icon">
                            <RefreshCw size={16} />
                        </div>
                        <h4>Clear Cache</h4>
                        <p>Remove system cache</p>
                    </div>

                    <div className="ss-dz-card green" onClick={() => handleAction('export')} style={{cursor: 'pointer'}}>
                        <div className="ss-dz-card-icon">
                            <UploadCloud size={16} />
                        </div>
                        <h4>Export Data</h4>
                        <p>Export system data</p>
                    </div>

                    <div className="ss-dz-card orange" onClick={() => handleAction('reset')} style={{cursor: 'pointer'}}>
                        <div className="ss-dz-card-icon">
                            <Settings size={16} />
                        </div>
                        <h4>Reset Defaults</h4>
                        <p>Restore default settings</p>
                    </div>

                    <div className="ss-dz-card red" onClick={() => handleAction('wipe')} style={{cursor: 'pointer'}}>
                        <div className="ss-dz-card-icon">
                            <AlertTriangle size={16} />
                        </div>
                        <h4>Wipe & Reinstall</h4>
                        <p>Reset entire system</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
