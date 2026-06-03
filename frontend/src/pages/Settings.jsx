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
                .settings-container { padding: 30px; background-color: var(--bg-body); min-height: 100vh; font-family: 'Outfit', sans-serif; color: var(--text-primary); }
                .title-gradient { font-size: 26px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
                .text-muted { color: var(--text-muted); }
                .settings-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-top: 30px; }
                
                .settings-menu { padding: 16px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 8px; }
                .setting-item { display: flex; gap: 15px; padding: 15px; border-radius: var(--radius-md, 10px); cursor: pointer; border: 1px solid transparent; transition: all 0.2s; color: var(--text-primary); }
                .setting-item:hover { background: var(--bg-hover); }
                .setting-item.active { background: var(--primary-50); border-color: var(--primary); }
                .s-icon { color: var(--text-muted); padding-top: 2px; }
                .setting-item.active .s-icon { color: var(--primary); }
                .s-text h4 { font-size: 15px; font-weight: 700; margin: 0 0 4px 0; }
                .s-text p { font-size: 12px; color: var(--text-muted); margin: 0; }

                .settings-form { padding: 30px; min-height: 500px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg, 16px); box-shadow: var(--shadow-sm); }
                .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .card-header-flex h3 { font-size: 20px; font-weight: 800; margin: 0; color: var(--text-primary); }
                .success-msg { color: var(--success); font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; background: var(--success-light); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2); }
                .profile-hero { display: flex; align-items: center; gap: 20px; padding-bottom: 30px; border-bottom: 1px dashed var(--border); }
                .avatar-lg img { width: 80px; height: 80px; border-radius: 20px; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2); border: 2px solid var(--bg-body); }
                .hero-text h4 { font-size: 22px; font-weight: 800; margin: 0 0 4px 0; color: var(--text-primary); }
                .hero-text p { font-size: 14px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0; }
                
                .mt-30 { margin-top: 30px; }
                .mb-20 { margin-bottom: 20px; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
                .form-group label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                .form-group input, .form-group select { padding: 12px 16px; background: var(--bg-body) !important; border: 1px solid var(--border) !important; border-radius: var(--radius-md, 8px) !important; color: var(--text-primary) !important; font-size: 14px; transition: border-color 0.2s; outline: none; box-shadow: none !important; }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 3px var(--primary-50) !important; }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                .form-group select option { background: var(--bg-body) !important; color: var(--text-primary) !important; }
                .disabled-input { opacity: 0.6; cursor: not-allowed; }
                .btn-row { margin-top: 24px; display: flex; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--border); }
                .btn-primary { background: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-full, 9999px); font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
                .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 6px 12px -1px rgba(37, 99, 235, 0.3); }
                .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; }
                
                /* Tab Content */
                .settings-tab-content h3 { font-size: 20px; font-weight: 800; margin: 0 0 8px 0; color: var(--text-primary); }
                
                /* Toggles */
                .toggle-list { display: flex; flex-direction: column; gap: 12px; }
                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-body); border-radius: var(--radius-md, 10px); border: 1px solid var(--border); color: var(--text-primary); transition: all 0.2s; }
                .toggle-item:hover { border-color: var(--border-hover); box-shadow: var(--shadow-sm); }
                .toggle-text h4 { font-size: 14px; font-weight: 700; margin: 0 0 4px 0; }
                .toggle-text p { font-size: 13px; color: var(--text-muted); margin: 0; }
                
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider:before { transform: translateX(20px); }

                /* Display Cards */
                .display-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
                .display-card { padding: 16px; border: 2px solid var(--border); border-radius: var(--radius-md, 12px); cursor: pointer; display: flex; flex-direction: column; gap: 12px; align-items: center; background: var(--bg-body); transition: all 0.2s; }
                .display-card:hover:not(.disabled) { border-color: var(--border-hover); transform: translateY(-2px); }
                .display-card.active { border-color: var(--primary); background: var(--primary-50); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1); }
                .display-card.disabled { opacity: 0.5; cursor: default; }
                .display-preview { width: 100%; height: 80px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .dark-preview { background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid rgba(255,255,255,0.1); }
                .light-preview { background: linear-gradient(135deg, #f8fafc, #e2e8f0); border: 1px solid rgba(0,0,0,0.1); }
                .display-card span { font-size: 13px; font-weight: 700; color: var(--text-primary); }

                /* Logs Ledger */
                .logs-ledger { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
                .log-row { display: grid; grid-template-columns: 2fr 1fr 1fr; padding: 16px 20px; background: var(--bg-body); border: 1px solid var(--border); border-radius: var(--radius-md, 10px); align-items: center; font-size: 13px; color: var(--text-primary); transition: background 0.2s; }
                .log-row:hover { background: var(--bg-hover); }
                .log-info { display: flex; align-items: center; gap: 10px; font-weight: 600; }
                .log-icon { color: var(--success); flex-shrink: 0; }
                .log-time { color: var(--text-secondary); font-size: 12px; }
                .log-device { color: var(--text-muted); font-family: 'JetBrains Mono', monospace; text-align: right; font-size: 12px; }

                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                
                @media (max-width: 768px) {
                    .settings-container { padding: 16px; }
                    .settings-grid { grid-template-columns: 1fr; gap: 20px; }
                    .form-row { grid-template-columns: 1fr; gap: 0; }
                    .display-grid { grid-template-columns: 1fr; }
                    .log-row { grid-template-columns: 1fr; gap: 8px; padding: 14px; }
                    .log-device { text-align: left; }
                }
            `}</style>
        </div>
    );
};

export default Settings;
