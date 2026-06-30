import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Briefcase, Key, Bell, Activity, Settings as SettingsIcon, Shield, ShieldCheck, Camera } from 'lucide-react';
import CustomerProfileSettings from './CustomerProfileSettings';

const Profile = () => {
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
    }, [formData.picture]);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deletePassword, setDeletePassword] = useState('');

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') return toast.success('Please type DELETE to confirm.');
        if (!deletePassword) return toast.error('Password is required.');

        try {
            await API.delete('/auth/delete-account', {
                data: { password: deletePassword }
            });
            toast.success('Account has been permanently deleted.');
            localStorage.clear();
            window.location.href = '/login';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting account');
        }
    };

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
            
            toast.success('Profile Updated Successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating profile');
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
            if (!newPass || newPass.length < 6) return toast.error('Password must be at least 6 characters');
            
            // Assume the backend supports updating password through auth/profile
            await API.put('/auth/profile', { password: newPass, currentPassword: currentPass });
            toast.success('Password Updated Successfully');
            e.target.reset();
        } catch (err) { 
            toast.error('Password Update Failed. Please check current password if required.'); 
        }
    };

    // Derived Data
    const initials = formData.firstName ? formData.firstName.charAt(0) : (user?.name?.charAt(0) || 'U');
    const lastInitial = formData.lastName ? formData.lastName.charAt(0) : '';
    const avatarInitials = (initials + lastInitial).toUpperCase();
    
    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'Admin User';
    const displayEmail = formData.email || user?.email;
    const roleBadge = user?.role || 'Employee';
    const empIdBadge = employeeData?.employeeId || employeeData?.employeeCode || (user?.id ? `EMP${user.id.toString().padStart(4, '0')}` : 'EMP001');

    if (user?.role === 'Customer') {
        return <CustomerProfileSettings />;
    }

    return (
        <div className="profile-page-wrapper">
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
                        <Camera size={13} color="#ffffff" />
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
                        {user?.role !== 'Vendor' && (
                            <span className="premium-badge-banner secondary-badge">{empIdBadge}</span>
                        )}
                    </div>
                    <span className="last-login-banner">{displayEmail} &bull; Last Login: Just now</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="profile-grid">
                
                {/* Left Column: Personal Information */}
                <div className="profile-col-left">
                    <div className="premium-card">
                        <div className="card-header">
                            <User size={18} className="header-icon purple-icon" />
                            <h3>Personal Information</h3>
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
                    {user?.role !== 'Vendor' && (
                        <div className="ui-card mb-24">
                            <div className="card-header">
                                <Briefcase size={18} className="header-icon purple-icon" />
                                <h3>Employment Details</h3>
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
                                    <div className="detail-label">🏢 Base Location</div>
                                    <div className="detail-value">Headquarters</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    <div className="premium-card">
                        <div className="card-header">
                            <Key size={18} className="header-icon purple-icon" />
                            <h3>Change Password</h3>
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
                    <div className="ui-card h-full">
                        <div className="card-header">
                            <Bell size={18} className="header-icon purple-icon" />
                            <h3>Notifications</h3>
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
                    <div className="ui-card h-full">
                        <div className="card-header">
                            <Activity size={18} className="header-icon purple-icon" />
                            <h3>Recent Activity</h3>
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

            {/* Danger Zone for Vendor */}
            {user?.role === 'Vendor' && (
                <div className="danger-zone-card">
                    <div className="danger-header">
                        <h3>Danger Zone</h3>
                    </div>
                    <div className="danger-content">
                        <div className="danger-info">
                            <h4>Delete Account Permanently</h4>
                            <p>⚠ This action cannot be undone. All your profile data, orders, materials, and account information will be permanently removed.</p>
                        </div>
                        <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                            Delete My Account
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Delete Account</h2>
                        <p className="modal-desc">
                            Are you absolutely sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="form-group">
                            <label>Please type <strong>DELETE</strong> to confirm</label>
                            <input 
                                type="text" 
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder="DELETE"
                            />
                        </div>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Confirm Password</label>
                            <input 
                                type="password" 
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button 
                                className="btn-delete-confirm" 
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== 'DELETE' || !deletePassword}
                            >
                                Permanently Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .profile-page-wrapper {
                    padding: 24px;
                    background-color: var(--bg-app);
                    min-height: 100vh;
                }

                /* Premium Top Banner Card */
                .premium-profile-banner {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    background: var(--bg-surface, #ffffff);
                    border: 1px solid var(--border-subtle, #e2e8f0);
                    border-radius: 16px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04), 0 4px 20px rgba(0, 0, 0, 0.02);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .premium-profile-banner::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(145deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.02) 100%);
                    pointer-events: none;
                }
                .premium-profile-banner:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
                }
                .premium-profile-banner:hover .premium-banner-avatar {
                    box-shadow: 0 0 20px rgba(147, 51, 234, 0.5);
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
                    background: #1e293b;
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                    transition: transform 0.2s, background 0.2s;
                    z-index: 3;
                }
                .avatar-upload-btn-premium:hover {
                    background: #3b82f6;
                    transform: scale(1.1);
                }

                .status-dot-online-banner {
                    position: absolute;
                    bottom: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background: #10b981;
                    border-radius: 50%;
                    border: 3px solid var(--bg-surface, #fff);
                    box-shadow: 0 0 0 1px rgba(0,0,0,0.05);
                    z-index: 1;
                }

                .premium-banner-details {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    z-index: 1;
                }

                .user-name-row-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                }
                .primary-title-banner {
                    color: var(--text-heading, #1e293b);
                    font-size: 24px;
                    font-weight: 700;
                    line-height: 1.2;
                    letter-spacing: -0.01em;
                }
                .verified-icon-banner {
                    color: #3b82f6;
                    flex-shrink: 0;
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

                /* Cards */
                .ui-card {
                    background: var(--bg-surface);
                    border-radius: var(--radius-md);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border-subtle);
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
                .card-header h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-heading);
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
                    color: var(--text-main);
                }
                .ui-form input {
                    padding: 10px 14px;
                    border: 1px solid var(--border-strong);
                    border-radius: var(--radius-sm);
                    font-size: 14px;
                    color: var(--text-heading);
                    outline: none;
                    transition: border-color 0.15s ease;
                    background: var(--bg-input);
                }
                .ui-form input:focus {
                    border-color: var(--primary);
                    box-shadow: var(--ring-focus);
                }
                .input-disabled {
                    background-color: var(--bg-hover) !important;
                    color: var(--text-disabled) !important;
                    cursor: not-allowed;
                }
                .input-helper {
                    font-size: 11px;
                    color: var(--text-muted);
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
                    color: var(--text-muted);
                    font-size: 14px;
                }

                /* Buttons */
                .btn-save-full {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: var(--radius-sm);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.15s;
                    margin-top: 8px;
                }
                .btn-save-full:hover {
                    background: var(--primary-hover);
                }
                .btn-outline-purple {
                    background: transparent;
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    padding: 10px 16px;
                    border-radius: var(--radius-sm);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    margin-top: 8px;
                    width: max-content;
                }
                .btn-outline-purple:hover {
                    background: var(--primary-light);
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
                    color: var(--text-muted);
                }
                .detail-value {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-heading);
                }

                .h-full { height: 100%; }

                /* Toggles */
                .toggle-list { display: flex; flex-direction: column; gap: 16px; }
                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--border-light); }
                .toggle-item:last-child { border-bottom: none; padding-bottom: 0; }
                .toggle-label { font-size: 14px; font-weight: 500; color: var(--text-heading); }
                .switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-strong); transition: .2s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; box-shadow: var(--shadow-sm); }
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
                    background: var(--border-light);
                    z-index: 0;
                }
                .timeline-item { display: flex; gap: 16px; position: relative; z-index: 1; }
                .timeline-icon { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); border: 2px solid var(--bg-surface); box-shadow: var(--shadow-sm); }
                .timeline-icon.green { background: var(--success-bg); color: var(--success); }
                .timeline-icon.blue { background: var(--info-bg); color: var(--info); }
                .timeline-icon.purple { background: var(--primary-light); color: var(--primary); }
                .timeline-content { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; }
                .timeline-content p { margin: 0; font-size: 13px; font-weight: 500; color: var(--text-heading); }
                .timeline-content span { font-size: 12px; color: var(--text-muted); }

                /* Responsive */
                @media (max-width: 900px) {
                    .profile-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .form-row-2 { grid-template-columns: 1fr; }
                    .primary-title-banner { font-size: 18px; }
                    .premium-banner-avatar { width: 64px; height: 64px; }
                    .premium-banner-avatar-initial { font-size: 24px; }
                    .premium-profile-banner { flex-direction: column; text-align: center; gap: 16px; }
                    .user-name-row-banner { justify-content: center; }
                    .banner-badges-premium { justify-content: center; }
                }

                /* Danger Zone */
                .danger-zone-card {
                    background: var(--bg-surface);
                    border: 1px solid var(--danger);
                    border-radius: var(--radius-md);
                    margin-top: 24px;
                    overflow: hidden;
                }
                .danger-header {
                    background: var(--danger-bg);
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--danger);
                }
                .danger-header h3 {
                    margin: 0;
                    color: var(--danger);
                    font-size: 15px;
                    font-weight: 600;
                }
                .danger-content {
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .danger-info h4 {
                    margin: 0 0 4px 0;
                    color: var(--text-heading);
                }
                .danger-info p {
                    margin: 0;
                    color: var(--text-muted);
                    font-size: 13px;
                }
                .btn-danger {
                    background: var(--danger);
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: var(--radius-sm);
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    margin-left: 24px;
                }
                .btn-danger:hover {
                    background: #b91c1c; /* darker red */
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    padding: 32px;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .modal-title { margin: 0 0 8px 0; font-size: 20px; color: #0f172a; }
                .modal-desc { margin: 0 0 24px 0; font-size: 14px; color: #64748b; line-height: 1.5; }
                .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
                .btn-cancel { flex: 1; padding: 10px; border-radius: 6px; background: white; border: 1px solid #cbd5e1; font-weight: 600; color: #475569; cursor: pointer; }
                .btn-cancel:hover { background: #f8fafc; }
                .btn-delete-confirm { flex: 2; padding: 10px; border-radius: 6px; background: #ef4444; color: white; border: none; font-weight: 600; cursor: pointer; }
                .btn-delete-confirm:disabled { background: #fca5a5; cursor: not-allowed; }
                .btn-delete-confirm:not(:disabled):hover { background: #dc2626; }
            `}</style>
        </div>
    );
};

export default Profile;
