import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Building2, Key, MapPin, Globe, Phone, Mail, FileText, Activity, AlertTriangle, X, Calendar, Edit2, Save } from 'lucide-react';
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

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        status: '',
        phone: '',
        industry: '',
        website: '',
        address: '',
        gstNumber: '',
        notes: ''
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
                        phone: data.phone || '',
                        industry: data.industry || '',
                        website: data.website || '',
                        address: data.address || '',
                        gstNumber: data.gstNumber || '',
                        notes: data.notes || ''
                    });
                }
            } catch (err) {
                console.error("Could not fetch customer data", err);
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || ''
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
            
            // Update auth context name if changed
            if (formData.name !== user.name) {
                const authRes = await API.put('/auth/profile', { name: formData.name });
                updateUser(authRes.data);
            }
            
            setIsEditing(false);
            alert('Customer Profile Updated Successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            const currentPass = e.target.currentPass.value;
            const newPass = e.target.newPass.value;
            if (!newPass || newPass.length < 6) return alert('Password must be at least 6 characters');
            
            await API.put('/auth/profile', { password: newPass, currentPassword: currentPass });
            alert('Password Updated Successfully');
            e.target.reset();
        } catch (err) { 
            alert('Password Update Failed. Please check current password if required.'); 
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
            alert('Your account has been permanently deleted.');
            updateUser(null);
            localStorage.clear();
            // Redirect will naturally happen because of context/routing
            window.location.href = '/login';
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting account. Please check your password.');
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
            <div className="profile-banner-card">
                <div className="banner-avatar">
                    {user?.picture ? <img src={user.picture} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : initials}
                </div>
                <div className="banner-info">
                    <h2>{formData.name || user?.name}</h2>
                    <p className="text-email">{user?.email}</p>
                    <div className="banner-badges">
                        <span className="badge-role">Customer</span>
                        <span className="badge-company"><Building2 size={12} style={{marginRight: '4px'}}/> {formData.company || 'Individual Customer'}</span>
                        <span className="badge-date" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                            <Calendar size={12} style={{marginRight: '4px'}}/> Joined: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                    </div>
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
                    <div className="ui-card">
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
                                emailDisabled={true}
                                statusDisabled={true}
                                saveButtonText="Save Changes"
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Password Settings */}
                <div className="profile-col-right">
                    <div className="ui-card">
                        <div className="card-header">
                            <Key size={18} className="header-icon purple-icon" />
                            <h3>Password Settings</h3>
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
                            <div className="form-group" style={{marginBottom: '24px'}}>
                                <label>Enter your password to verify:</label>
                                <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your password" required />
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

                .profile-banner-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    margin-bottom: 24px;
                }
                .banner-avatar {
                    width: 80px;
                    height: 80px;
                    background: #2563eb;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .banner-info {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .banner-info h2 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #1e293b;
                }
                .text-email {
                    margin: 0;
                    font-size: 14px;
                    color: #64748b;
                }
                .banner-badges {
                    display: flex;
                    gap: 12px;
                    margin-top: 4px;
                }
                .badge-role {
                    background: #dcfce7;
                    color: #166534;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .badge-company {
                    background: #eff6ff;
                    color: #1d4ed8;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                }

                .profile-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

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
