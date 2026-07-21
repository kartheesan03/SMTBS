import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import PasswordInput from '../components/ui/PasswordInput';
import { User, Building2, Key, MapPin, Globe, Phone, Mail, FileText, Activity, AlertTriangle, X, Calendar, Edit2, Save, ShieldCheck, Camera } from 'lucide-react';
import CustomerForm from '../components/CustomerForm';

const CustomerProfileSettings = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [user?.picture]);

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        status: '',
        email: '',
        phone: '',
        industry: '',
        website: '',
        address: '',
        gstNumber: '',
        notes: '',
        picture: ''
    });

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const { data } = await API.get('/customers/profile');
                if (data) {
                    setCustomerData(data);
                    setFormData({
                        name: data.name || user?.name || '',
                        company: data.company === 'Pending Details' ? 'Individual Customer' : (data.company || 'Individual Customer'),
                        status: data.status || '',
                        email: data.email || user?.email || '',
                        phone: data.phone || '',
                        industry: data.industry || '',
                        website: data.website || '',
                        address: data.address || '',
                        gstNumber: data.gstNumber || '',
                        notes: data.notes || '',
                        picture: user?.picture || ''
                    });
                }
            } catch (err) {
                console.error("Could not fetch customer data", err);
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || '',
                        email: user.email || ''
                    }));
                }
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchCustomerData();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.company || payload.company === 'Pending Details') payload.company = 'Individual Customer';
            const { data } = await API.put(`/customers/profile`, payload);
            setCustomerData(data);
            
            // Update auth context name or email if changed
            if (formData.name !== user.name || formData.email !== user.email || formData.picture !== user.picture) {
                const authRes = await API.put('/auth/profile', { name: formData.name, email: formData.email, picture: formData.picture });
                updateUser(authRes.data);
            }
            
            setIsEditing(false);
            toast.success('Profile updated and synced with CRM successfully.');
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
            
            await API.put('/auth/profile', { password: newPass, currentPassword: currentPass });
            toast.success('Password Updated Successfully');
            e.target.reset();
        } catch (err) { 
            toast.error('Password Update Failed. Please check current password if required.'); 
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        if (deleteConfirmText !== 'DELETE') return;
        setIsDeleting(true);
        try {
            await API.delete('/auth/delete-account', {
                data: { password: deletePassword }
            });
            toast.success('Your account has been permanently deleted.');
            updateUser(null);
            localStorage.clear();
            // Redirect will naturally happen because of context/routing
            window.location.href = '/login';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error deleting account. Please check your password.');
            setIsDeleting(false);
        }
    };

    const initials = formData.name ? formData.name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || 'C');

    if (loading) {
        return <div className="loading-container"><div className="loader"></div><p>Loading Profile...</p></div>;
    }

    return (
        <div className="profile-page-wrapper">
            {/* Top Banner Card */}
            <div className="premium-profile-banner" style={{ marginBottom: '24px' }}>
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
                                {initials}
                            </span>
                        )}
                    </div>
                    <label className="avatar-upload-btn-premium" title="Change Picture">
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePictureUpload} />
                        <Camera size={14} color="#64748b" />
                    </label>
                    <span className="status-dot-online-banner"></span>
                </div>
                <div className="premium-banner-details">
                    <div className="user-name-row-banner">
                        <span className="primary-title-banner">{formData.name || user?.name}</span>
                        <ShieldCheck size={20} className="verified-icon-banner" />
                    </div>
                    <div className="banner-badges-premium">
                        <span className="premium-badge-banner">Customer</span>
                        <span className="premium-badge-banner secondary-badge" style={{ display: 'flex', alignItems: 'center' }}>
                            <Building2 size={12} style={{marginRight: '4px'}}/> {formData.company || 'Individual Customer'}
                        </span>
                        <span className="premium-badge-banner secondary-badge" style={{ display: 'flex', alignItems: 'center' }}>
                            <Calendar size={12} style={{marginRight: '4px'}}/> Joined: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                    </div>
                    <span className="last-login-banner">{user?.email}</span>
                </div>
                {!isEditing && (
                    <button className="btn-outline-purple" onClick={() => setIsEditing(true)} style={{marginLeft: 'auto', marginTop: 0}}>
                        <Edit2 size={16} style={{marginRight: '6px', verticalAlign: 'text-bottom'}} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-grid">
                {/* Left Column: Customer Details */}
                <div className="profile-col-left">
                    <div className="premium-card">
                        <div className="card-header">
                            <Building2 size={18} className="header-icon purple-icon" />
                            <h3>Organization Profile</h3>
                        </div>
                        
                        {!isEditing ? (
                            <div className="profile-read-only">
                                <div className="info-row"><label>Full Name</label><span>{formData.name}</span></div>
                                <div className="info-row"><label>Company Name</label><span>{formData.company || 'Individual Customer'}</span></div>
                                <div className="info-row"><label>Email Address</label><span>{user?.email}</span></div>
                                <div className="info-row"><label>Phone Number</label><span>{formData.phone || 'Not provided'}</span></div>
                                <div className="info-row"><label>GST Number</label><span>{formData.gstNumber || 'Not provided'}</span></div>
                                <div className="info-row"><label>Address</label><span>{formData.address || 'Not provided'}</span></div>
                            </div>
                        ) : (
                            <CustomerForm 
                                formData={formData}
                                setFormData={setFormData}
                                onSubmit={handleUpdate}
                                onCancel={() => setIsEditing(false)}
                                isLoading={loading}
                                emailDisabled={false}
                                statusDisabled={false}
                                saveButtonText="Save Changes"
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Password Settings */}
                <div className="profile-col-right">
                    <div className="premium-card">
                        <div className="card-header">
                            <Key size={18} className="header-icon purple-icon" />
                            <h3>Password Settings</h3>
                        </div>
                        <form className="ui-form" onSubmit={handlePasswordUpdate}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <PasswordInput name="currentPass" placeholder="Enter current password" />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <PasswordInput name="newPass" placeholder="Enter new password" />
                            </div>
                            <button type="submit" className="btn-outline-purple">Update Password</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="danger-zone-card" style={{marginTop: '24px'}}>
                <div className="card-header" style={{marginBottom: '16px'}}>
                    <AlertTriangle size={18} className="header-icon red-icon" />
                    <h3 style={{color: '#dc2626'}}>Danger Zone</h3>
                </div>
                <div className="danger-content">
                    <div className="danger-text">
                        <h4>Delete Account Permanently</h4>
                        <p>⚠ This action cannot be undone. All customer profile data, orders, addresses, support tickets, and account information will be permanently removed.</p>
                    </div>
                    <button type="button" className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content danger-modal">
                        <div className="modal-header">
                            <h3 style={{color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px'}}><AlertTriangle size={18}/> Delete Account</h3>
                            <button className="btn-close" onClick={() => {setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword('');}}><X size={18}/></button>
                        </div>
                        <form onSubmit={handleDeleteAccount} className="modal-body">
                            <p style={{color: '#475569', marginBottom: '16px', lineHeight: '1.5', fontSize: '14px'}}>
                                You are about to permanently delete your account. This action is irreversible.
                            </p>
                            <div className="form-group" style={{marginBottom: '16px'}}>
                                <label>Please type <strong>DELETE</strong> to confirm:</label>
                                <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" required />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <PasswordInput value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your password" required />
                            </div>
                            <div className="modal-actions" style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                                <button type="button" className="btn-cancel" onClick={() => {setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword('');}} disabled={isDeleting}>Cancel</button>
                                <button type="submit" className="btn-danger" disabled={deleteConfirmText !== 'DELETE' || !deletePassword || isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .profile-page-wrapper {
                    padding: 24px;
                    background-color: #f8fafc;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                }

                .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: var(--text-secondary); }
                .loader { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
                @keyframes spin { to { transform: rotate(360deg); } }

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

                .profile-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                .profile-read-only { display: flex; flex-direction: column; gap: 16px; }
                .info-row { display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
                .info-row:last-child { border-bottom: none; padding-bottom: 0; }
                .info-row label { font-size: 13px; font-weight: 600; color: #64748b; }
                .info-row span { font-size: 15px; font-weight: 500; color: #1e293b; }

                .ui-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                }
                .card-divider {
                    height: 1px;
                    background: #e2e8f0;
                    margin: 24px 0;
                }
                
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }
                .purple-icon {
                    color: #2563eb;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .btn-outline-purple {
                    background: transparent;
                    color: #2563eb;
                    border: 1px solid #2563eb;
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
                    background: #eff6ff;
                }

                .danger-zone-card {
                    background: #fff1f2;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid #fecdd3;
                }
                .danger-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                }
                .danger-text h4 { margin: 0 0 6px 0; color: #9f1239; font-size: 16px; font-weight: 600; }
                .danger-text p { margin: 0; color: #be123c; font-size: 14px; font-weight: 500; }
                .btn-danger {
                    background: #e11d48;
                    color: white;
                    border: none;
                    padding: 10px 18px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                    white-space: nowrap;
                }
                .btn-danger:hover:not(:disabled) { background: #be123c; }
                .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
                .red-icon { color: #dc2626; }

                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }
                .modal-content {
                    background: #ffffff;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
                }
                .danger-modal {
                    border-top: 4px solid #e11d48;
                }
                .modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 24px; border-bottom: 1px solid #e2e8f0;
                }
                .modal-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
                .btn-close { background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 4px; transition: 0.2s; }
                .btn-close:hover { background: #f1f5f9; color: #475569; }
                .modal-body { padding: 24px; }
                .btn-cancel {
                    background: #ffffff; color: #475569; border: 1px solid #cbd5e1;
                    padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 14px; transition: 0.2s;
                }
                .btn-cancel:hover:not(:disabled) { background: #f8fafc; border-color: #94a3b8; color: #0f172a; }
                .btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

                @media (max-width: 900px) {
                    .profile-grid { grid-template-columns: 1fr; }
                    .form-row-2 { grid-template-columns: 1fr; }
                }
                @media (max-width: 600px) {
                    .banner-info h2 { font-size: 18px; }
                    .banner-avatar { width: 64px; height: 64px; font-size: 24px; }
                    .banner-badges { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .danger-content { flex-direction: column; align-items: flex-start; }
                    .btn-danger { width: 100%; text-align: center; justify-content: center; display: flex; }
                }
            `}</style>
        </div>
    );
};

export default CustomerProfileSettings;
