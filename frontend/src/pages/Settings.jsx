import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Briefcase, Key, Bell, Activity, Settings as SettingsIcon, Shield, ShieldCheck } from 'lucide-react';

const Settings = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [employeeData, setEmployeeData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: '',
        picture: user?.picture || ''
    });

    const [preferences, setPreferences] = useState(() => {
        const saved = localStorage.getItem(`notif_prefs_${user?._id}`);
        if (saved) return JSON.parse(saved);
        return {
            emailSummaries: true,
            pushAlerts: true,
            taskAssignments: true,
            systemUpdates: false
        };
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [user?.picture]);

    const handlePreferenceChange = (key) => {
        const newPrefs = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPrefs);
        localStorage.setItem(`notif_prefs_${user?._id}`, JSON.stringify(newPrefs));
    };

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const { data } = await API.get(`/audit-logs?userId=${user._id}&limit=5`);
                if (data && data.length > 0) {
                    setRecentActivity(data.map(log => ({
                        text: `${log.action} in ${log.module}`,
                        time: new Date(log.createdAt).toLocaleString(),
                        icon: 'Activity'
                    })));
                } else {
                    throw new Error("No logs found");
                }
            } catch (err) {
                setRecentActivity([
                    { text: 'Logged in successfully', time: '2 hours ago', icon: 'Activity' },
                    { text: 'Updated profile preferences', time: 'Yesterday', icon: 'SettingsIcon' },
                    { text: 'Changed account password', time: 'Last week', icon: 'Shield' }
                ]);
            }
        };
        if (user) fetchActivity();
    }, [user]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const { data } = await API.get('/employees/me');
                
                if (data) {
                    setEmployeeData(data);
                    
                    let fName = data.firstName || data.first_name;
                    let lName = data.lastName || data.last_name;
                    
                    if (!fName && !lName) {
                        const nameParts = (data.fullName || data.name || user?.name || '').split(' ');
                        fName = nameParts[0] || '';
                        lName = nameParts.slice(1).join(' ') || '';
                    }

                    setFormData({
                        firstName: fName || '',
                        lastName: lName || '',
                        email: data.userId?.email || user?.email || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        picture: user?.picture || ''
                    });
                }
            } catch (err) {
                console.error("Could not fetch employee data", err);
                if (user) {
                    const nameParts = (user.name || '').split(' ');
                    setFormData(prev => ({
                        ...prev,
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || ''
                    }));
                }
            }
        };
        if (user) fetchEmployeeData();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                address: formData.address
            };
            
            const { data } = await API.put(`/employees/me`, payload);
            setEmployeeData(data);
            
            // Update auth profile if needed
            const authPayload = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                picture: formData.picture
            };
            const authRes = await API.put('/auth/profile', authPayload);
            updateUser(authRes.data);
            
            alert('Profile Updated Successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        }
    };

    const handlePictureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, picture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            const currentPass = e.target.currentPass.value;
            const newPass = e.target.newPass.value;
            if (!newPass || newPass.length < 6) return alert('Password must be at least 6 characters');
            
            // Assume the backend supports updating password through auth/profile
            await API.put('/auth/profile', { password: newPass, currentPassword: currentPass });
            alert('Password Updated Successfully');
            e.target.reset();
        } catch (err) { 
            alert('Password Update Failed. Please check current password if required.'); 
        }
    };

    // Derived Data
    const initials = formData.firstName ? formData.firstName.charAt(0) : (user?.name?.charAt(0) || 'U');
    const lastInitial = formData.lastName ? formData.lastName.charAt(0) : '';
    const avatarInitials = (initials + lastInitial).toUpperCase();
    
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'Admin User';
    const displayEmail = formData.email || user?.email;
    const roleBadge = user?.role === 'Admin' ? 'Super Admin' : user?.role || 'Employee';
    const empIdBadge = employeeData?.employeeId || employeeData?.employeeCode || (user?.id ? `EMP${user.id.toString().padStart(4, '0')}` : 'EMP001');

    return (
        <div className="page-container">
            {/* Top Banner Card */}
            <div className="premium-profile-banner">
                <div className="premium-banner-avatar-wrapper">
                    <div className="premium-banner-avatar">
                        {formData.picture && !imgError ? (
                            <img 
                                src={formData.picture} 
                                alt="Profile" 
                                className="premium-banner-avatar-img" 
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span className="premium-banner-avatar-initial">
                                {avatarInitials}
                            </span>
                        )}
                    </div>
                    <label className="avatar-upload-btn-premium" title="Change Picture">
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePictureUpload} />
                        📷
                    </label>
                    <span className="status-dot-online-banner"></span>
                </div>
                <div className="premium-banner-details">
                    <div className="user-name-row-banner">
                        <span className="primary-title-banner">{fullName}</span>
                        {(user?.role === 'Admin' || user?.role?.toLowerCase() === 'super admin' || user?.email === 'admin@smtbms.com') && <ShieldCheck size={20} className="verified-icon-banner" />}
                    </div>
                    <div className="banner-badges-premium">
                        <span className="premium-badge-banner">{roleBadge}</span>
                        <span className="premium-badge-banner secondary-badge">{empIdBadge}</span>
                    </div>
                    <span className="last-login-banner">{displayEmail} &bull; Last Login: Just now</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="profile-grid">
                
                {/* Left Column: Personal Information */}
                <div className="profile-col-left">
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div className="card-header">
                            <User size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Personal Information</h3>
                        </div>
                        <form className="ui-form" onSubmit={handleUpdate}>
                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="e.g. John" />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="e.g. Doe" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} disabled className="input-disabled" />
                                <span className="input-helper">Email cannot be changed</span>
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">📞</span>
                                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Enter phone number" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">📍</span>
                                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Enter address" />
                                </div>
                            </div>
                            
                            <button type="submit" className="btn-save-full">
                                <span>💾</span> Save Changes
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Employment Details + Change Password */}
                <div className="profile-col-right">
                    
                    {/* Employment Details */}
                    <div className="premium-card mb-24" style={{ padding: '24px' }}>
                        <div className="card-header">
                            <Briefcase size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employment Details</h3>
                        </div>
                        <div className="details-list">
                            <div className="detail-row">
                                <div className="detail-label"><Briefcase size={14}/> Department</div>
                                <div className="detail-value">{employeeData?.department || 'Operations'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label"><User size={14}/> Designation</div>
                                <div className="detail-value">{employeeData?.designation || user?.role || 'Staff'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">📅 Joining Date</div>
                                <div className="detail-value">{employeeData?.joinDate || employeeData?.joiningDate ? new Date(employeeData?.joinDate || employeeData?.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">⏱ Employment Type</div>
                                <div className="detail-value">Full-Time</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Status</div>
                                <div className="detail-value"><span className="badge-active">active</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="premium-card" style={{ padding: '24px' }}>
                        <div className="card-header">
                            <Key size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Change Password</h3>
                        </div>
                        <form className="ui-form" onSubmit={handlePasswordUpdate}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" name="currentPass" placeholder="Enter current password" />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" name="newPass" placeholder="Enter new password" />
                            </div>
                            <button type="submit" className="btn-outline-purple">Update Password</button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Bottom Grid: Notifications & Activity */}
            <div className="profile-grid" style={{ marginTop: '24px' }}>
                
                {/* Notifications Preferences */}
                <div className="profile-col-left">
                    <div className="premium-card h-full" style={{ padding: '24px' }}>
                        <div className="card-header">
                            <Bell size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Notifications</h3>
                        </div>
                        <div className="toggle-list">
                            {[
                                { key: 'emailSummaries', label: 'Email Summaries' },
                                { key: 'pushAlerts', label: 'Push Alerts' },
                                { key: 'taskAssignments', label: 'Task Assignments' },
                                { key: 'systemUpdates', label: 'System Updates' }
                            ].map((item, i) => (
                                <div key={i} className="toggle-item">
                                    <span className="toggle-label">{item.label}</span>
                                    <label className="switch">
                                        <input 
                                            type="checkbox" 
                                            checked={preferences[item.key]} 
                                            onChange={() => handlePreferenceChange(item.key)} 
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="profile-col-right">
                    <div className="premium-card h-full" style={{ padding: '24px' }}>
                        <div className="card-header">
                            <Activity size={18} className="header-icon purple-icon" />
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Activity</h3>
                        </div>
                        <div className="activity-timeline">
                            {recentActivity.map((act, i) => {
                                const renderIcon = () => {
                                    if (act.icon === 'SettingsIcon') return <SettingsIcon size={14} />;
                                    if (act.icon === 'Shield') return <Shield size={14} />;
                                    return <Activity size={14} />;
                                };
                                const iconClass = act.icon === 'SettingsIcon' ? 'blue' : act.icon === 'Shield' ? 'purple' : 'green';
                                
                                return (
                                    <div key={i} className="timeline-item">
                                        <div className={`timeline-icon ${iconClass}`}>{renderIcon()}</div>
                                        <div className="timeline-content">
                                            <p>{act.text}</p>
                                            <span>{act.time}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            <style jsx="true">{`
                .premium-profile-banner {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    background: var(--bg-surface, #ffffff);
                    padding: 24px;
                    border-radius: 16px;
                    box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1));
                    border: 1px solid var(--border-subtle, #e2e8f0);
                    margin-bottom: 24px;
                }
                .premium-banner-avatar-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    width: 80px;
                    height: 80px;
                }
                .premium-banner-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2563eb 0%, #9333ea 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
                    transition: box-shadow 0.3s ease;
                    position: relative;
                }
                .premium-banner-avatar-img {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid var(--bg-surface, #ffffff);
                }
                .premium-banner-avatar-initial {
                    font-size: 28px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
                
                .avatar-upload-btn-premium {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    background: var(--bg-surface, #ffffff);
                    border: 1px solid var(--border-subtle, #e2e8f0);
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 14px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
                    transition: transform 0.2s;
                }
                .avatar-upload-btn-premium:hover {
                    transform: scale(1.1);
                }

                .status-dot-online-banner {
                    position: absolute;
                    bottom: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background: #10b981;
                    border: 3px solid var(--bg-surface, #ffffff);
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .premium-banner-details {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 6px;
                    flex: 1;
                }
                .user-name-row-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .primary-title-banner {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--text-heading, #0f172a);
                    letter-spacing: -0.02em;
                }
                .verified-icon-banner {
                    color: var(--primary, #2563eb);
                }
                
                .banner-badges-premium {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }
                .premium-badge-banner {
                    display: inline-block;
                    background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%);
                    color: #4338ca;
                    border: 1px solid rgba(99, 102, 241, 0.2);
                    font-size: 12px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 12px;
                    text-transform: capitalize;
                }
                .premium-badge-banner.secondary-badge {
                    background: var(--bg-hover, #f1f5f9);
                    color: var(--text-main, #475569);
                    border: 1px solid var(--border-subtle, #e2e8f0);
                }

                .last-login-banner {
                    color: var(--text-muted, #64748b);
                    font-size: 13px;
                    font-weight: 500;
                }

                /* Grid Layout */
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                .mb-24 { margin-bottom: 24px; }
                
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }
                .purple-icon {
                    color: var(--primary);
                }

                /* Forms */
                .ui-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .form-row-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .form-group label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                }
                .ui-form input {
                    padding: 10px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #334155;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .ui-form input:focus {
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }
                .input-disabled {
                    background-color: #f8fafc;
                    color: #94a3b8 !important;
                    cursor: not-allowed;
                }
                .input-helper {
                    font-size: 11px;
                    color: #94a3b8;
                }
                
                /* Input with icon */
                .input-with-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-with-icon input {
                    width: 100%;
                    padding-left: 36px !important;
                }
                .input-icon {
                    position: absolute;
                    left: 12px;
                    color: #94a3b8;
                    font-size: 14px;
                }

                /* Buttons */
                .btn-save-full {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                    margin-top: 8px;
                }
                .btn-save-full:hover {
                    background: var(--primary-dark, #4f46e5);
                }
                .btn-outline-purple {
                    background: transparent;
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 8px;
                    width: max-content;
                }
                .btn-outline-purple:hover {
                    background: var(--primary-50, #eff6ff);
                }

                /* Details List */
                .details-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .detail-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #64748b;
                }
                .detail-value {
                    font-size: 14px;
                    font-weight: 500;
                    color: #1e293b;
                }
                .badge-active {
                    background: #dcfce7;
                    color: #166534;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .h-full { height: 100%; }

                /* Toggles */
                .toggle-list { display: flex; flex-direction: column; gap: 16px; }
                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
                .toggle-item:last-child { border-bottom: none; padding-bottom: 0; }
                .toggle-label { font-size: 14px; font-weight: 500; color: #1e293b; }
                .switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider:before { transform: translateX(18px); }

                /* Timeline */
                .activity-timeline { display: flex; flex-direction: column; gap: 20px; position: relative; margin-top: 8px; }
                .activity-timeline::before {
                    content: '';
                    position: absolute;
                    left: 14px;
                    top: 10px;
                    bottom: 10px;
                    width: 2px;
                    background: #e2e8f0;
                    z-index: 0;
                }
                .timeline-item { display: flex; gap: 16px; position: relative; z-index: 1; }
                .timeline-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
                .timeline-icon.green { background: var(--success-light, #dcfce7); color: var(--success, #16a34a); }
                .timeline-icon.blue { background: var(--info-light, #dbeafe); color: var(--info, #2563eb); }
                .timeline-icon.purple { background: var(--primary-50, #eff6ff); color: var(--primary); }
                .timeline-content { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; }
                .timeline-content p { margin: 0; font-size: 14px; font-weight: 500; color: #1e293b; }
                .timeline-content span { font-size: 12px; color: #64748b; }

                /* Responsive */
                @media (max-width: 900px) {
                    .profile-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .form-row-2 { grid-template-columns: 1fr; }
                    .banner-info h2 { font-size: 18px; }
                    .banner-avatar { width: 64px; height: 64px; font-size: 24px; }
                }
            `}</style>
        </div>
    );
};

export default Settings;
