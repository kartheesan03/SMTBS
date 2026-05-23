import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Bell, Shield, Moon, Monitor, HardDrive, CheckCircle } from 'lucide-react';

const Settings = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [success, setSuccess] = useState(false);

    const settingSections = [
        { title: 'Account Settings', icon: <User />, desc: 'Manage your profile and account information' },
        { title: 'Notifications', icon: <Bell />, desc: 'Configure system and email alerts' },
        { title: 'Security', icon: <Shield />, desc: 'Update passwords and two-factor auth' },
        { title: 'Display', icon: <Monitor />, desc: 'Theme preferences and UI layout' },
        { title: 'System Logs', icon: <HardDrive />, desc: 'View your activity and session history' },
    ];

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put('/auth/profile', formData);
            updateUser(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        }
    };

    return (
        <div className="settings-container">
            <h1 className="title-gradient">System Settings</h1>
            <p className="text-muted">Configure your SMTBMS environment and preferences.</p>

            <div className="settings-grid">
                <div className="settings-menu glass-card">
                    {settingSections.map((s, i) => (
                        <div key={i} className={`setting-item ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                            <div className="s-icon">{s.icon}</div>
                            <div className="s-text">
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="settings-form glass-card">
                    {activeTab === 0 && (
                        <>
                            <div className="card-header-flex">
                                <h3>Profile Information</h3>
                                {success && <span className="success-msg animate-pop"><CheckCircle size={14}/> Profile Updated</span>}
                            </div>
                            <div className="profile-hero">
                                <div className="avatar-lg">
                                    <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt="User" />
                                </div>
                                <div className="hero-text">
                                    <h4>{user?.name}</h4>
                                    <p>{user?.role} Account</p>
                                </div>
                            </div>

                            <form className="mt-30" onSubmit={handleUpdate}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>System Role</label>
                                    <input type="text" value={user?.role} disabled className="disabled-input" />
                                </div>
                                <div className="btn-row">
                                    <button type="submit" className="btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </>
                    )}

                    {activeTab === 1 && (
                        <div className="settings-tab-content">
                            <h3>Notification Preferences</h3>
                            <p className="text-muted mb-20">Control how you receive alerts and system updates.</p>
                            
                            <div className="toggle-list">
                                {[
                                    { label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email', default: true },
                                    { label: 'Push Notifications', desc: 'Real-time browser alerts for immediate actions', default: true },
                                    { label: 'Order Updates', desc: 'Get notified when an order status changes', default: true },
                                    { label: 'Inventory Alerts', desc: 'Alerts when material levels fall below threshold', default: false }
                                ].map((item, i) => (
                                    <div key={i} className="toggle-item">
                                        <div className="toggle-text">
                                            <h4>{item.label}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                        <label className="switch">
                                            <input type="checkbox" defaultChecked={item.default} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div className="settings-tab-content">
                            <h3>Security & Privacy</h3>
                            <form className="mt-30" onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const pass = e.target.newPass.value;
                                    const confirm = e.target.confirmPass.value;
                                    if (pass !== confirm) return alert('Passwords do not match');
                                    await API.put('/auth/profile', { password: pass });
                                    alert('Password Updated Successfully');
                                    e.target.reset();
                                } catch (err) { alert('Update Failed'); }
                            }}>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" name="newPass" required placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" name="confirmPass" required placeholder="••••••••" />
                                </div>
                                <div className="btn-row">
                                    <button type="submit" className="btn-primary">Change Password</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 3 && (
                        <div className="settings-tab-content">
                            <h3>Display Preferences</h3>
                            <div className="display-options">
                                <div className="display-grid">
                                    <div className="display-card active">
                                        <div className="display-preview dark-preview"></div>
                                        <span>Midnight Dark (Default)</span>
                                    </div>
                                    <div className="display-card disabled">
                                        <div className="display-preview light-preview"></div>
                                        <span>Light Mode (Coming Soon)</span>
                                    </div>
                                </div>
                                <div className="form-group mt-30">
                                    <label>Sidebar Layout</label>
                                    <select defaultValue="expanded">
                                        <option value="expanded">Expanded (Full Width)</option>
                                        <option value="collapsed">Compact (Icons Only)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 4 && (
                        <div className="settings-tab-content">
                            <h3>System Logs</h3>
                            <div className="logs-ledger">
                                {[
                                    { event: 'Profile Updated', time: 'Just now', device: 'Chrome / Windows' },
                                    { event: 'Login Successful', time: '2 hours ago', device: 'Chrome / Windows' },
                                    { event: 'Password Changed', time: 'Yesterday', device: 'Chrome / Windows' },
                                    { event: 'Login Successful', time: '3 days ago', device: 'Mobile / Android' },
                                    { event: 'New Device Detected', time: '1 week ago', device: 'Safari / iPhone' }
                                ].map((log, i) => (
                                    <div key={i} className="log-row">
                                        <div className="log-info">
                                            <CheckCircle size={14} className="log-icon" />
                                            <span>{log.event}</span>
                                        </div>
                                        <span className="log-time">{log.time}</span>
                                        <span className="log-device">{log.device}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx="true">{`
                .settings-container { padding: 30px; }
                .settings-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-top: 30px; }
                .setting-item { display: flex; gap: 15px; padding: 15px; border-radius: 12px; cursor: pointer; border: 1px solid transparent; transition: 0.2s; }
                .setting-item:hover { background: rgba(255,255,255,0.03); }
                .setting-item.active { background: rgba(99, 102, 241, 0.1); border-color: var(--primary); }
                .s-icon { color: var(--text-muted); }
                .setting-item.active .s-icon { color: var(--primary); }
                .s-text h4 { font-size: 15px; margin-bottom: 4px; }
                .s-text p { font-size: 12px; color: var(--text-muted); }

                .settings-form { padding: 30px; min-height: 500px; }
                .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .success-msg { color: #10b981; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
                .profile-hero { display: flex; align-items: center; gap: 20px; padding-bottom: 30px; border-bottom: 1px solid var(--border); }
                .avatar-lg img { width: 80px; height: 80px; border-radius: 20px; }
                .mt-30 { margin-top: 30px; }
                .mb-20 { margin-bottom: 20px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group input, .form-group select { padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; }
                .form-group select option { background: #1e293b; color: white; }
                .disabled-input { opacity: 0.6; cursor: not-allowed; }
                .btn-row { margin-top: 20px; }
                .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; }
                
                /* Toggles */
                .toggle-list { display: flex; flex-direction: column; gap: 10px; }
                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--border); }
                .toggle-text h4 { font-size: 14px; margin-bottom: 4px; }
                .toggle-text p { font-size: 12px; color: var(--text-muted); }
                
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider:before { transform: translateX(20px); }

                /* Display Cards */
                .display-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .display-card { padding: 15px; border: 2px solid var(--border); border-radius: 15px; cursor: pointer; display: flex; flex-direction: column; gap: 12px; align-items: center; }
                .display-card.active { border-color: var(--primary); background: rgba(99, 102, 241, 0.05); }
                .display-card.disabled { opacity: 0.5; cursor: default; }
                .display-preview { width: 100%; height: 80px; border-radius: 8px; }
                .dark-preview { background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid rgba(255,255,255,0.1); }
                .light-preview { background: linear-gradient(135deg, #f8fafc, #e2e8f0); border: 1px solid rgba(0,0,0,0.1); }
                .display-card span { font-size: 13px; font-weight: 500; }

                /* Logs Ledger */
                .logs-ledger { display: flex; flex-direction: column; gap: 8px; }
                .log-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 15px 20px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 10px; align-items: center; font-size: 13px; }
                .log-info { display: flex; align-items: center; gap: 10px; }
                .log-icon { color: #10b981; }
                .log-time { color: var(--text-muted); }
                .log-device { color: var(--text-muted); font-family: monospace; text-align: right; }

                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            `}</style>
        </div>
    );
};

export default Settings;
