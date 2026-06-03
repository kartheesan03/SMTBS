import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Bell, Shield, Mail, Phone, Calendar, Briefcase, Hash, CheckCircle, Activity, Settings as SettingsIcon, LogOut, MapPin } from 'lucide-react';

const Settings = () => {
    const { user, updateUser, logout } = useContext(AuthContext);
    const [employeeData, setEmployeeData] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const { data } = await API.get('/employees');
                const myEmp = data.find(emp => 
                    (emp.userId && (emp.userId === user._id || emp.userId._id === user._id)) || 
                    emp.contact === user.email ||
                    emp.email === user.email
                );
                if (myEmp) {
                    setEmployeeData(myEmp);
                    setFormData({
                        name: `${myEmp.firstName || ''} ${myEmp.lastName || ''}`.trim() || myEmp.fullName || myEmp.name || user.name,
                        email: myEmp.email || myEmp.contact || user.email
                    });
                }
            } catch (err) {
                console.error("Could not fetch employee data", err);
            }
        };
        if (user) fetchEmployeeData();
    }, [user]);

    // 5. Create a normalized profile object
    const profileData = {
        employeeId: employeeData?.employeeId || employeeData?.employeeCode || (user?.id ? `EMP-${user.id.toString().padStart(4, '0')}` : null),
        firstName: employeeData?.firstName || employeeData?.first_name || formData.name?.split(' ')[0] || user?.name?.split(' ')[0] || null,
        lastName: employeeData?.lastName || employeeData?.last_name || formData.name?.split(' ').slice(1).join(' ') || user?.name?.split(' ').slice(1).join(' ') || null,
        fullName: employeeData?.fullName || employeeData?.full_name || employeeData?.name || formData.name || user?.name || null,
        department: employeeData?.department || (user?.role === 'Admin' ? 'Management' : (user?.role === 'Sales' ? 'Sales & Marketing' : 'Operations')) || null,
        designation: employeeData?.designation || employeeData?.role || user?.role || null,
        email: employeeData?.email || employeeData?.email_address || employeeData?.contact || formData.email || user?.email || null,
        phone: employeeData?.phone || employeeData?.phone_number || (employeeData?.contact && !employeeData.contact.includes('@') ? employeeData.contact : null) || null,
        joinDate: employeeData?.joinDate || employeeData?.join_date || employeeData?.joiningDate || employeeData?.dateOfJoining || null,
        address: employeeData?.address || null,
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (employeeData) {
                const parts = formData.name.trim().split(' ');
                const firstName = parts[0] || '';
                const lastName = parts.slice(1).join(' ') || '';
                await API.put(`/employees/${employeeData._id}`, {
                    ...employeeData,
                    firstName,
                    lastName,
                    contact: formData.email
                });
                
                // Re-fetch to update immediately
                const { data: empData } = await API.get('/employees');
                const updatedEmp = empData.find(emp => emp._id === employeeData._id);
                if (updatedEmp) setEmployeeData(updatedEmp);
            }

            const { data } = await API.put('/auth/profile', formData);
            updateUser(data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            
            // Close modal logic if the user has an external modal state handler
            if (window.closeEditModal) window.closeEditModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            const pass = e.target.newPass.value;
            const confirm = e.target.confirmPass.value;
            if (pass !== confirm) return alert('Passwords do not match');
            await API.put('/auth/profile', { password: pass });
            alert('Password Updated Successfully');
            e.target.reset();
        } catch (err) { alert('Update Failed'); }
    };

    // Calculate a mock profile completion percentage
    const profileCompletion = user?.email && user?.name ? 85 : 40;

    return (
        <div className="profile-dashboard-container">
            {/* Header */}
            <div className="profile-page-header">
                <h1 className="title-gradient">My Profile</h1>
                <p className="text-muted">Manage your personal information, security, and preferences.</p>
            </div>

            {/* Hero Gradient Profile Card */}
            <div className="profile-hero-card">
                <div className="hero-gradient-bg"></div>
                <div className="hero-content">
                    <div className="hero-avatar-wrapper">
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=ffffff&color=4f46e5&size=120`} alt="Profile" className="hero-avatar" />
                        <div className="status-indicator online" title="Online"></div>
                    </div>
                    <div className="hero-details">
                        <div className="hero-title-row">
                            <h2>{profileData.fullName || 'Not Provided'}</h2>
                            <span className="role-badge">{profileData.designation || 'Not Provided'}</span>
                        </div>
                        <p className="hero-email">{profileData.email || 'Not Provided'}</p>
                    </div>
                    
                    <div className="hero-completion">
                        <div className="completion-header">
                            <span>Profile Completion</span>
                            <span className="completion-pct">{profileCompletion}%</span>
                        </div>
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="profile-main-grid">
                
                {/* LEFT COLUMN */}
                <div className="profile-left-col">
                    
                    {/* Quick Actions Card */}
                    <div className="glass-card section-card">
                        <h3 className="section-title">Quick Actions</h3>
                        <div className="quick-actions-grid">
                            <button className="qa-btn" onClick={() => document.getElementById('account-info-section').scrollIntoView({behavior: 'smooth'})}>
                                <div className="qa-icon-wrap blue"><User size={18} /></div>
                                <span>Edit Profile</span>
                            </button>
                            <button className="qa-btn" onClick={() => document.getElementById('security-section').scrollIntoView({behavior: 'smooth'})}>
                                <div className="qa-icon-wrap purple"><Shield size={18} /></div>
                                <span>Security</span>
                            </button>
                            <button className="qa-btn" onClick={() => document.getElementById('notifications-section').scrollIntoView({behavior: 'smooth'})}>
                                <div className="qa-icon-wrap orange"><Bell size={18} /></div>
                                <span>Alerts</span>
                            </button>
                            <button className="qa-btn logout-action" onClick={logout}>
                                <div className="qa-icon-wrap red"><LogOut size={18} /></div>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile Overview Card */}
                    <div className="glass-card section-card">
                        <h3 className="section-title">Profile Overview</h3>
                        <div className="overview-list">
                            <div className="overview-item">
                                <Hash size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Employee ID</span>
                                    <span className="ov-value">{profileData.employeeId || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <User size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Full Name</span>
                                    <span className="ov-value">{profileData.fullName || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <Briefcase size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Department</span>
                                    <span className="ov-value">{profileData.department || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <Briefcase size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Designation / Role</span>
                                    <span className="ov-value">{profileData.designation || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <Mail size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Email Address</span>
                                    <span className="ov-value">{profileData.email || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <Phone size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Phone Number</span>
                                    <span className="ov-value">{profileData.phone || 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <Calendar size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Join Date</span>
                                    <span className="ov-value">{profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString() : 'Not Provided'}</span>
                                </div>
                            </div>
                            <div className="overview-item">
                                <MapPin size={16} className="ov-icon" />
                                <div className="ov-details">
                                    <span className="ov-label">Address</span>
                                    <span className="ov-value">{profileData.address || 'Not Provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="profile-right-col">
                    
                    {/* Account Information Form */}
                    <div id="account-info-section" className="glass-card section-card">
                        <div className="card-header-flex">
                            <h3 className="section-title">Account Information</h3>
                            {success && <span className="success-msg animate-pop"><CheckCircle size={14}/> Saved</span>}
                        </div>
                        <form className="modern-form" onSubmit={handleUpdate}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Jane Doe" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="e.g. jane@company.com" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>System Role</label>
                                <input type="text" value={user?.role} disabled className="disabled-input" />
                                <span className="input-hint">Your role is assigned by the system administrator.</span>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>

                    {/* Security Settings */}
                    <div id="security-section" className="glass-card section-card">
                        <h3 className="section-title">Security Settings</h3>
                        <p className="section-desc">Ensure your account is using a long, random password to stay secure.</p>
                        <form className="modern-form mt-20" onSubmit={handlePasswordUpdate}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" name="newPass" required placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" name="confirmPass" required placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-secondary">Update Password</button>
                            </div>
                        </form>
                    </div>

                    {/* Notification & Activity Row */}
                    <div className="bottom-grid">
                        
                        {/* Notifications */}
                        <div id="notifications-section" className="glass-card section-card">
                            <h3 className="section-title">Notifications</h3>
                            <div className="toggle-list mt-20">
                                {[
                                    { label: 'Email Summaries', default: true },
                                    { label: 'Push Alerts', default: true },
                                    { label: 'Task Assignments', default: true },
                                    { label: 'System Updates', default: false }
                                ].map((item, i) => (
                                    <div key={i} className="toggle-item">
                                        <span className="toggle-label">{item.label}</span>
                                        <label className="switch">
                                            <input type="checkbox" defaultChecked={item.default} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card section-card">
                            <h3 className="section-title">Recent Activity</h3>
                            <div className="activity-timeline mt-20">
                                <div className="timeline-item">
                                    <div className="timeline-icon green"><Activity size={12} /></div>
                                    <div className="timeline-content">
                                        <p>Logged in successfully</p>
                                        <span>2 hours ago</span>
                                    </div>
                                </div>
                                <div className="timeline-item">
                                    <div className="timeline-icon blue"><SettingsIcon size={12} /></div>
                                    <div className="timeline-content">
                                        <p>Updated profile preferences</p>
                                        <span>Yesterday</span>
                                    </div>
                                </div>
                                <div className="timeline-item">
                                    <div className="timeline-icon purple"><Shield size={12} /></div>
                                    <div className="timeline-content">
                                        <p>Changed account password</p>
                                        <span>Last week</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <style jsx="true">{`
                .profile-dashboard-container { 
                    padding: 30px; 
                    background-color: var(--bg-body); 
                    min-height: 100vh; 
                    font-family: 'Outfit', 'Inter', sans-serif; 
                    color: var(--text-primary); 
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .profile-page-header { margin-bottom: 24px; }
                .title-gradient { font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0; letter-spacing: -0.5px; }
                .text-muted { color: var(--text-muted); font-size: 15px; margin: 0; }
                
                /* Hero Card */
                .profile-hero-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg, 20px);
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    border: 1px solid var(--border);
                    margin-bottom: 30px;
                    position: relative;
                }
                .hero-gradient-bg {
                    height: 140px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    width: 100%;
                }
                .hero-content {
                    padding: 0 30px 30px;
                    display: flex;
                    align-items: flex-end;
                    gap: 24px;
                    margin-top: -60px;
                    flex-wrap: wrap;
                }
                .hero-avatar-wrapper {
                    position: relative;
                    flex-shrink: 0;
                }
                .hero-avatar {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    border: 4px solid var(--bg-card);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    background: #fff;
                    object-fit: cover;
                }
                .status-indicator {
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 3px solid var(--bg-card);
                }
                .status-indicator.online { background-color: var(--success); }
                
                .hero-details {
                    flex: 1;
                    padding-bottom: 8px;
                    min-width: 250px;
                }
                .hero-title-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 6px;
                }
                .hero-title-row h2 {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text-primary);
                }
                .role-badge {
                    background: var(--primary-50);
                    color: var(--primary);
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .hero-email {
                    color: var(--text-secondary);
                    font-size: 15px;
                    margin: 0;
                }
                
                .hero-completion {
                    width: 280px;
                    background: var(--bg-body);
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    margin-bottom: 8px;
                }
                .completion-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 10px;
                }
                .completion-pct { color: var(--primary); }
                .progress-bar-bg {
                    height: 6px;
                    background: var(--border);
                    border-radius: 99px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 99px;
                    transition: width 1s ease-out;
                }

                /* Layout Grid */
                .profile-main-grid {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    gap: 30px;
                }
                .profile-left-col { display: flex; flex-direction: column; gap: 30px; }
                .profile-right-col { display: flex; flex-direction: column; gap: 30px; }

                /* Shared Card Styles */
                .section-card {
                    padding: 24px;
                    background: var(--bg-card);
                    border-radius: var(--radius-lg, 16px);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 20px 0;
                }
                .section-desc { font-size: 14px; color: var(--text-muted); margin: -14px 0 20px 0; }
                
                .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .card-header-flex .section-title { margin: 0; }
                .success-msg { color: var(--success); font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; background: var(--success-light); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2); }
                
                /* Quick Actions */
                .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .qa-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 16px 10px;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-primary);
                }
                .qa-btn:hover { background: var(--bg-hover); border-color: var(--primary-300, #a5b4fc); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
                .qa-btn span { font-size: 12px; font-weight: 600; }
                .qa-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .qa-icon-wrap.blue { background: #eff6ff; color: #3b82f6; }
                .qa-icon-wrap.purple { background: #f5f3ff; color: #8b5cf6; }
                .qa-icon-wrap.orange { background: #fff7ed; color: #f97316; }
                .qa-icon-wrap.red { background: #fef2f2; color: #ef4444; }
                .qa-btn.logout-action:hover { border-color: #fca5a5; background: #fef2f2; }

                /* Profile Overview List */
                .overview-list { display: flex; flex-direction: column; gap: 16px; }
                .overview-item { display: flex; align-items: flex-start; gap: 14px; }
                .ov-icon { color: var(--text-muted); margin-top: 3px; flex-shrink: 0; }
                .ov-details { display: flex; flex-direction: column; gap: 2px; }
                .ov-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
                .ov-value { font-size: 14px; font-weight: 600; color: var(--text-primary); }

                /* Modern Forms */
                .modern-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .modern-form .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
                .modern-form label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                .modern-form input { 
                    padding: 12px 16px; 
                    background: var(--bg-body); 
                    border: 1px solid var(--border); 
                    border-radius: var(--radius-md, 8px); 
                    color: var(--text-primary); 
                    font-size: 14px; 
                    transition: all 0.2s; 
                    outline: none; 
                    font-family: inherit;
                }
                .modern-form input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-50); background: var(--bg-card); }
                .disabled-input { opacity: 0.6; cursor: not-allowed; background: #f1f5f9 !important; }
                .input-hint { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
                .form-actions { display: flex; justify-content: flex-end; padding-top: 10px; }
                
                .btn-primary, .btn-secondary {
                    padding: 12px 24px;
                    border-radius: var(--radius-md, 8px);
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
                .btn-primary:hover { background: var(--primary-700, #4338ca); transform: translateY(-1px); box-shadow: 0 6px 12px -1px rgba(79, 70, 229, 0.3); }
                .btn-secondary { background: var(--bg-body); color: var(--text-primary); border: 1px solid var(--border); }
                .btn-secondary:hover { background: var(--bg-hover); border-color: var(--border-hover); }

                /* Bottom Grid */
                .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
                
                /* Toggles */
                .toggle-list { display: flex; flex-direction: column; gap: 16px; }
                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
                .toggle-item:last-child { border-bottom: none; padding-bottom: 0; }
                .toggle-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
                .switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider:before { transform: translateX(18px); }

                /* Timeline */
                .activity-timeline { display: flex; flex-direction: column; gap: 20px; position: relative; }
                .activity-timeline::before {
                    content: '';
                    position: absolute;
                    left: 12px;
                    top: 8px;
                    bottom: 8px;
                    width: 2px;
                    background: var(--border);
                    z-index: 0;
                }
                .timeline-item { display: flex; gap: 16px; position: relative; z-index: 1; }
                .timeline-icon { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--bg-card); border: 2px solid var(--bg-card); box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
                .timeline-icon.green { background: #ecfeff; color: #0891b2; }
                .timeline-icon.blue { background: #eff6ff; color: #2563eb; }
                .timeline-icon.purple { background: #f5f3ff; color: #7c3aed; }
                .timeline-content { display: flex; flex-direction: column; gap: 4px; padding-top: 3px; }
                .timeline-content p { margin: 0; font-size: 13px; font-weight: 600; color: var(--text-primary); }
                .timeline-content span { font-size: 12px; color: var(--text-muted); }

                /* Utilities & Responsive */
                .mt-20 { margin-top: 20px; }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 1024px) {
                    .profile-main-grid { grid-template-columns: 1fr; }
                    .bottom-grid { grid-template-columns: 1fr; }
                    .hero-content { flex-direction: column; align-items: center; text-align: center; margin-top: -60px; padding: 0 20px 20px; }
                    .hero-title-row { justify-content: center; }
                    .hero-completion { width: 100%; max-width: 400px; margin-top: 16px; }
                    .status-indicator { right: 16px; bottom: 12px; }
                }
                
                @media (max-width: 640px) {
                    .profile-dashboard-container { padding: 16px; }
                    .modern-form .form-row { grid-template-columns: 1fr; gap: 0; }
                    .section-card { padding: 20px; }
                    .quick-actions-grid { grid-template-columns: 1fr 1fr; }
                }
            `}</style>
        </div>
    );
};

export default Settings;

