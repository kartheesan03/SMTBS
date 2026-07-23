import React, { useState } from 'react';
import { 
    DollarSign, 
    Percent, 
    Calculator, 
    Clock, 
    Save, 
    CreditCard,
    FileText,
    Calendar
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import './AttendanceSettings.css'; // Reusing identical CSS for settings grid and switches
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const PayrollSettings = () => {
    const [settings, setSettings] = useState({
        payrollCycle: 'Monthly',
        paymentDay: 'Last Working Day',
        hraPercentage: '40',
        daPercentage: '10',
        enableProvidentFund: true,
        pfPercentage: '12',
        enableHealthInsurance: true,
        healthInsuranceFixed: '500',
        overtimeRateMultiplier: '1.5',
        autoGeneratePayslips: true
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
            setToast('Payroll policies saved successfully!');
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
                title="Payroll Settings" 
                subtitle="Configure compensation cycles, statutory deductions, and standard allowances."
            />

            <div className="settings-grid">
                
                {/* Payroll Cycle Card */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                            <Calendar size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Payroll Cycle</h3>
                            <p>Determine when and how salaries are processed</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-group">
                        <label>Processing Frequency</label>
                        <select 
                            className="settings-input"
                            name="payrollCycle"
                            value={settings.payrollCycle}
                            onChange={handleChange}
                        >
                            <option>Monthly</option>
                            <option>Bi-Weekly</option>
                            <option>Weekly</option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label>Default Payment Date</label>
                        <select 
                            className="settings-input"
                            name="paymentDay"
                            value={settings.paymentDay}
                            onChange={handleChange}
                        >
                            <option>Last Working Day</option>
                            <option>1st of the Month</option>
                            <option>5th of the Month</option>
                            <option>15th of the Month</option>
                        </select>
                    </div>

                    <div className="toggle-switch-wrapper" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '8px' }}>
                        <div className="toggle-label-content">
                            <span className="main-label">Auto-Generate Payslips</span>
                            <span className="sub-label">Automatically email payslips upon disbursement</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="autoGeneratePayslips"
                                checked={settings.autoGeneratePayslips}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                {/* Standard Allowances */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: 'var(--dash-primary-light, #eff6ff)', color: 'var(--dash-primary, #3b82f6)' }}>
                            <Percent size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Standard Allowances</h3>
                            <p>Default components added to Basic Salary</p>
                        </div>
                    </div>
                    
                    <div className="settings-form-row">
                        <div className="settings-form-group">
                            <label>HRA (% of Basic)</label>
                            <input 
                                type="number" 
                                name="hraPercentage"
                                className="settings-input" 
                                value={settings.hraPercentage}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="settings-form-group">
                            <label>DA (% of Basic)</label>
                            <input 
                                type="number" 
                                name="daPercentage"
                                className="settings-input" 
                                value={settings.daPercentage}
                                onChange={handleChange}
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                    
                    <div className="settings-form-group" style={{ marginTop: '4px' }}>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>
                            These percentages act as defaults when creating new employee compensation plans, but can be overridden per individual.
                        </p>
                    </div>
                </div>

                {/* Statutory Deductions */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                            <Calculator size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Statutory Deductions</h3>
                            <p>Taxes, provident funds, and insurance</p>
                        </div>
                    </div>

                    <div className="toggle-switch-wrapper">
                        <div className="toggle-label-content">
                            <span className="main-label">Provident Fund (PF)</span>
                            <span className="sub-label">Deduct PF automatically from gross salary</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="enableProvidentFund"
                                checked={settings.enableProvidentFund}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    
                    {settings.enableProvidentFund && (
                        <div className="settings-form-group" style={{ marginTop: '12px', animation: 'fadeIn 0.2s' }}>
                            <label>Employee PF Contribution (%)</label>
                            <input 
                                type="number" 
                                name="pfPercentage"
                                className="settings-input" 
                                value={settings.pfPercentage}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    )}

                    <div className="toggle-switch-wrapper" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
                        <div className="toggle-label-content">
                            <span className="main-label">Health Insurance</span>
                            <span className="sub-label">Standard monthly deduction for health cover</span>
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                name="enableHealthInsurance"
                                checked={settings.enableHealthInsurance}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {settings.enableHealthInsurance && (
                        <div className="settings-form-group" style={{ marginTop: '12px', animation: 'fadeIn 0.2s' }}>
                            <label>Fixed Monthly Deduction ($)</label>
                            <input 
                                type="number" 
                                name="healthInsuranceFixed"
                                className="settings-input" 
                                value={settings.healthInsuranceFixed}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    )}
                </div>

                {/* Overtime Policies */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <div className="settings-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <Clock size={20} />
                        </div>
                        <div className="settings-card-title">
                            <h3>Overtime Pay Rate</h3>
                            <p>Multiplier applied to standard hourly wages</p>
                        </div>
                    </div>

                    <div className="settings-form-group">
                        <label>Rate Multiplier (e.g. 1.5x)</label>
                        <input 
                            type="number" 
                            name="overtimeRateMultiplier"
                            className="settings-input" 
                            value={settings.overtimeRateMultiplier}
                            onChange={handleChange}
                            step="0.1"
                            min="1.0"
                        />
                        <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                            If base rate is $20/hr, a 1.5x multiplier results in $30/hr for overtime.
                        </p>
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

export default PayrollSettings;
