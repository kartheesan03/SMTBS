import React, { useState } from 'react';
import { 
    Clock, 
    AlertCircle, 
    Shield, 
    MapPin, 
    Save, 
    Calendar,
    Briefcase
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import './AttendanceSettings.css';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const AttendanceSettings = () => {
    const [settings, setSettings] = useState({
        shiftStart: '09:00',
        shiftEnd: '18:00',
        gracePeriod: '15',
        halfDayThreshold: '120',
        overtimeMinimum: '60',
        enableGeoFencing: false,
        enableIpWhitelist: true,
        ipWhitelist: '192.168.1.0/24'
    });

    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setToast('Attendance policy settings saved successfully!');
            setTimeout(() => setToast(null), 3000);
        }, 800);
    };

    return (
        <div className="attendance-settings-container">
            {toast && (
                <div className="toast-notification success">
                    {toast}
                </div>
            )}
            
            <PageHeader 
                title="Attendance Policy" 
                subtitle="Configure shift timings, grace periods, and tracking constraints for your organization."
            />

            <div className="settings-grid">
                
                {/* Working Hours Card */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: 'var(--dash-primary-light, #eff6ff)', color: 'var(--dash-primary, #3b82f6)' }}>
                            <Clock size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Working Hours</h3>
                            <p>Standard shift timings for employees</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-row">
                        <div className="settings-form-group">
                            <label>Shift Start Time</label>
                            <input 
                                type="time" 
                                name="shiftStart"
                                className="settings-input" 
                                value={settings.shiftStart}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="settings-form-group">
                            <label>Shift End Time</label>
                            <input 
                                type="time" 
                                name="shiftEnd"
                                className="settings-input" 
                                value={settings.shiftEnd}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="settings-form-group">
                        <label>Weekend Days</label>
                        <select className="settings-input">
                            <option>Saturday & Sunday</option>
                            <option>Sunday Only</option>
                            <option>Friday & Saturday</option>
                            <option>Custom</option>
                        </select>
                    </div>
                </div>

                {/* Grace Periods & Exceptions */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <AlertCircle size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Grace & Half-Day Rules</h3>
                            <p>Tolerance limits for late arrivals</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-group">
                        <label>Late Arrival Grace Period (Minutes)</label>
                        <input 
                            type="number" 
                            name="gracePeriod"
                            className="settings-input" 
                            value={settings.gracePeriod}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                    <div className="settings-form-group">
                        <label>Half-Day Threshold (Minutes Late)</label>
                        <input 
                            type="number" 
                            name="halfDayThreshold"
                            className="settings-input" 
                            value={settings.halfDayThreshold}
                            onChange={handleChange}
                            min="0"
                        />
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Employees arriving this late will be marked as Half-Day.</p>
                    </div>
                </div>

                {/* Overtime Policies */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                            <Briefcase size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Overtime Policy</h3>
                            <p>Rules for calculating extra hours</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-group">
                        <label>Minimum Overtime Qualification (Minutes)</label>
                        <input 
                            type="number" 
                            name="overtimeMinimum"
                            className="settings-input" 
                            value={settings.overtimeMinimum}
                            onChange={handleChange}
                            min="0"
                        />
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Hours worked beyond this limit post shift-end will be counted as OT.</p>
                    </div>
                </div>

                {/* Security & Tracking */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                            <Shield size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Security & Check-in</h3>
                            <p>Network and location restrictions</p>
                        </div>
                    </div>
                    
                    <div className="toggle-switch-wrapper">
                        <div className="toggle-label-content">
                            <span className="main-label">IP Whitelisting</span>
                            <span className="sub-label">Restrict web check-ins to office networks</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="enableIpWhitelist"
                                checked={settings.enableIpWhitelist}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    
                    {settings.enableIpWhitelist && (
                        <div className="settings-form-group" style={{ marginTop: '12px', animation: 'fadeIn 0.2s' }}>
                            <label>Allowed IP Addresses / Ranges</label>
                            <input 
                                type="text" 
                                name="ipWhitelist"
                                className="settings-input" 
                                value={settings.ipWhitelist}
                                onChange={handleChange}
                                placeholder="e.g. 192.168.1.1, 10.0.0.0/8"
                            />
                        </div>
                    )}

                    <div className="toggle-switch-wrapper" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                        <div className="toggle-label-content">
                            <span className="main-label">Mobile Geo-Fencing</span>
                            <span className="sub-label">Require location matching for mobile apps</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="enableGeoFencing"
                                checked={settings.enableGeoFencing}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

            </div>

            <div className="settings-footer">
                <button className="settings-btn-cancel">Discard Changes</button>
                <button className="settings-btn-save" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : (
                        <>
                            <Save size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-top' }} />
                            Save Configuration
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AttendanceSettings;
