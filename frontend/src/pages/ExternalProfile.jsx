import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Key, Briefcase, Settings } from 'lucide-react';

const ExternalProfile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: user?.email || '',
        phone: '',
        address: '',
        company: '',
        vendorName: '',
        contactPerson: '',
        customerType: '',
        gstNumber: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    
    const role = user?.role ? user.role.toLowerCase() : '';
    const isCustomer = role === 'customer';
    const isVendor = role === 'vendor' || role === 'vendor/supplier';

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                let data = null;
                if (isCustomer) {
                    const response = await API.get('/customers/me');
                    data = response.data;
                } else if (isVendor) {
                    const response = await API.get('/vendors/me');
                    data = response.data;
                }

                if (data) {
                    setProfileData(data);
                    setFormData({
                        name: data.name || user?.name || '',
                        email: data.email || user?.email || '',
                        phone: data.phone || data.contact || '',
                        address: data.address || '',
                        company: data.company || '',
                        vendorName: data.name || '',
                        contactPerson: data.contactPerson || '',
                        customerType: data.customerType || 'Individual',
                        gstNumber: data.gstNumber || ''
                    });
                }
            } catch (err) {
                console.error("Could not fetch profile data", err);
                // Fallback to auth context
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        name: user.name || ''
                    }));
                }
            } finally {
                setIsLoading(false);
            }
        };
        if (user && (isCustomer || isVendor)) {
            fetchProfileData();
        } else {
            setIsLoading(false);
        }
    }, [user, isCustomer, isVendor]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Update auth profile
            const authPayload = {
                name: formData.name || formData.vendorName,
                email: formData.email
            };
            const authRes = await API.put('/auth/profile', authPayload);
            updateUser(authRes.data);

            // Also update the external profile using generic update endpoint if it exists
            if (profileData && profileData._id) {
                if (isCustomer) {
                    await API.put(`/customers/${profileData._id}`, {
                        name: formData.name,
                        phone: formData.phone,
                        address: formData.address,
                        company: formData.company,
                        customerType: formData.customerType
                    });
                } else if (isVendor) {
                    await API.put(`/vendors/${profileData._id}`, {
                        name: formData.vendorName,
                        contactPerson: formData.contactPerson,
                        phone: formData.phone,
                        address: formData.address,
                        gstNumber: formData.gstNumber
                    });
                }
            }
            
            alert('Profile Updated Successfully');
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

    if (isLoading) return <div className="p-8">Loading Profile...</div>;

    const initials = (formData.name || formData.vendorName || user?.name || 'U').charAt(0).toUpperCase();
    const fullName = formData.name || formData.vendorName || user?.name || 'External User';
    const displayEmail = formData.email || user?.email;
    const roleBadge = user?.role || 'User';

    return (
        <div className="profile-page-wrapper">
            {/* Top Banner Card */}
            <div className="profile-banner-card">
                <div className="banner-avatar">
                    {initials}
                </div>
                <div className="banner-info">
                    <h2>{fullName}</h2>
                    <p className="text-email">{displayEmail}</p>
                    <div className="banner-badges">
                        <span className="badge-role">{roleBadge}</span>
                        {isCustomer && formData.customerType && <span className="badge-emp-id">{formData.customerType}</span>}
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="profile-grid">
                
                {/* Left Column: Personal/Business Information */}
                <div className="profile-col-left">
                    <div className="ui-card">
                        <div className="card-header">
                            <Briefcase size={18} className="header-icon purple-icon" />
                            <h3>Profile Information</h3>
                        </div>
                        <form className="ui-form" onSubmit={handleUpdate}>
                            {isCustomer && (
                                <>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Customer Type</label>
                                            <select value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                                                <option value="Individual">Individual</option>
                                                <option value="Company">Company</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Company Name</label>
                                            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {isVendor && (
                                <>
                                    <div className="form-group">
                                        <label>Vendor / Company Name</label>
                                        <input type="text" value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} required />
                                    </div>
                                    <div className="form-row-2">
                                        <div className="form-group">
                                            <label>Contact Person</label>
                                            <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} required />
                                        </div>
                                        <div className="form-group">
                                            <label>GST / Tax Number</label>
                                            <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} disabled className="input-disabled" />
                                <span className="input-helper">Email cannot be changed</span>
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                            
                            <button type="submit" className="btn-save-full">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Change Password */}
                <div className="profile-col-right">
                    
                    <div className="ui-card">
                        <div className="card-header">
                            <Key size={18} className="header-icon purple-icon" />
                            <h3>Security Settings</h3>
                        </div>
                        <form className="ui-form" onSubmit={handlePasswordUpdate}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" name="currentPass" placeholder="Enter current password" />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" name="newPass" placeholder="Enter new password" minLength={6} />
                            </div>
                            <button type="submit" className="btn-outline-purple">Update Password</button>
                        </form>
                    </div>

                </div>
            </div>

            <style jsx="true">{`
                .profile-page-wrapper {
                    padding: 24px;
                    background-color: #f8fafc;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                }

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
                    background: #8b5cf6;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: 1px;
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
                .badge-emp-id {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
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
                
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }
                .purple-icon {
                    color: #7c3aed;
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                }

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
                .ui-form input, .ui-form select {
                    padding: 10px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #334155;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .ui-form input:focus, .ui-form select:focus {
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

                .btn-save-full {
                    width: 100%;
                    background: #7c3aed;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    margin-top: 8px;
                }
                .btn-save-full:hover {
                    background: #6d28d9;
                }
                .btn-outline-purple {
                    background: transparent;
                    color: #7c3aed;
                    border: 1px solid #7c3aed;
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
                    background: #f5f3ff;
                }

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

export default ExternalProfile;
