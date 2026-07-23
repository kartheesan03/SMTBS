import React, { useState } from 'react';
import { 
    CalendarDays, 
    Clock, 
    Settings, 
    CheckSquare, 
    Save, 
    Briefcase,
    Activity,
    AlertTriangle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import './AttendanceSettings.css'; // Reusing identical CSS for settings grid and switches
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const LeaveSettings = () => {
    const [settings, setSettings] = useState({
        annualLeave: '18',
        sickLeave: '12',
        casualLeave: '6',
        accrualType: 'Yearly Upfront',
        carryForwardUnused: true,
        maxCarryForward: '5',
        requireMultiLevelApproval: false,
        noticePeriodAnnual: '14',
        allowUnpaidLeave: true
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
            setToast('Leave policies saved successfully!');
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
                title="Leave Policies" 
                subtitle="Configure employee leave entitlements, accrual rules, and approval workflows."
            />

            <div className="settings-grid">
                
                {/* Entitlements Card */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                            <CalendarDays size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Default Entitlements</h3>
                            <p>Standard annual days off by type</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-row">
                        <div className="settings-form-group">
                            <label>Annual/Vacation Leave</label>
                            <input 
                                type="number" 
                                name="annualLeave"
                                className="settings-input" 
                                value={settings.annualLeave}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                        <div className="settings-form-group">
                            <label>Sick Leave</label>
                            <input 
                                type="number" 
                                name="sickLeave"
                                className="settings-input" 
                                value={settings.sickLeave}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="settings-form-group">
                        <label>Casual / Personal Leave</label>
                        <input 
                            type="number" 
                            name="casualLeave"
                            className="settings-input" 
                            value={settings.casualLeave}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>
                </div>

                {/* Accrual Rules */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: 'var(--dash-primary-light, #eff6ff)', color: 'var(--dash-primary, #3b82f6)' }}>
                            <Activity size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Accrual & Carry Forward</h3>
                            <p>How and when leave balances are updated</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-group">
                        <label>Accrual Type</label>
                        <select 
                            className="settings-input"
                            name="accrualType"
                            value={settings.accrualType}
                            onChange={handleChange}
                        >
                            <option>Yearly Upfront</option>
                            <option>Monthly Accrual</option>
                            <option>Quarterly Accrual</option>
                        </select>
                    </div>

                    <div className="toggle-switch-wrapper" style={{ marginTop: '16px' }}>
                        <div className="toggle-label-content">
                            <span className="main-label">Carry Forward Unused Leaves</span>
                            <span className="sub-label">Allow rolling over unused balances to next year</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="carryForwardUnused"
                                checked={settings.carryForwardUnused}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    
                    {settings.carryForwardUnused && (
                        <div className="settings-form-group" style={{ marginTop: '12px', animation: 'fadeIn 0.2s' }}>
                            <label>Maximum Days to Carry Forward</label>
                            <input 
                                type="number" 
                                name="maxCarryForward"
                                className="settings-input" 
                                value={settings.maxCarryForward}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    )}
                </div>

                {/* Approval & Usage Restrictions */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <CheckSquare size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Approval Workflows</h3>
                            <p>Rules for requesting and approving time off</p>
                        </div>
                    </div>

                    <div className="settings-form-group">
                        <label>Advance Notice Required (Days)</label>
                        <input 
                            type="number" 
                            name="noticePeriodAnnual"
                            className="settings-input" 
                            value={settings.noticePeriodAnnual}
                            onChange={handleChange}
                            min="0"
                        />
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Minimum days of notice required for Annual Leave requests.</p>
                    </div>

                    <div className="toggle-switch-wrapper" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                        <div className="toggle-label-content">
                            <span className="main-label">Multi-level Approval</span>
                            <span className="sub-label">Require both Manager and HR approval</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="requireMultiLevelApproval"
                                checked={settings.requireMultiLevelApproval}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="toggle-switch-wrapper" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                        <div className="toggle-label-content">
                            <span className="main-label">Allow Unpaid Leave (LWP)</span>
                            <span className="sub-label">Permit Leave Without Pay when balances are exhausted</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="allowUnpaidLeave"
                                checked={settings.allowUnpaidLeave}
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

export default LeaveSettings;
