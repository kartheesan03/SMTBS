import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Briefcase, Key } from 'lucide-react';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [employeeData, setEmployeeData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: '',
        address: ''
    });

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
                    // Attempt to parse first and last name safely
                    let fName = myEmp.firstName || myEmp.first_name;
                    let lName = myEmp.lastName || myEmp.last_name;
                    
                    if (!fName && !lName) {
                        const nameParts = (myEmp.fullName || myEmp.name || user?.name || '').split(' ');
                        fName = nameParts[0] || '';
                        lName = nameParts.slice(1).join(' ') || '';
                    }

                    setFormData({
                        firstName: fName || '',
                        lastName: lName || '',
                        email: myEmp.email || myEmp.contact || user.email || '',
                        phone: myEmp.phone || myEmp.phone_number || (myEmp.contact && !myEmp.contact.includes('@') ? myEmp.contact : '') || '',
                        address: myEmp.address || ''
                    });
                } else if (user) {
                    const nameParts = (user.name || '').split(' ');
                    setFormData(prev => ({
                        ...prev,
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || ''
                    }));
                }
            } catch (err) {
                console.error("Could not fetch employee data", err);
            }
        };
        if (user) fetchEmployeeData();
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            if (employeeData) {
                await API.put(`/employees/${employeeData._id}`, {
                    ...employeeData,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    fullName: `${formData.firstName} ${formData.lastName}`.trim(),
                    phone: formData.phone,
                    address: formData.address,
                    contact: formData.email
                });
            }
            
            // Update auth profile if needed
            const authPayload = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email
            };
            const { data } = await API.put('/auth/profile', authPayload);
            updateUser(data);
            
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
        <div className="profile-page-wrapper">
            {/* Top Banner Card */}
            <div className="profile-banner-card">
                <div className="banner-avatar">
                    {avatarInitials}
                </div>
                <div className="banner-info">
                    <h2>{fullName}</h2>
                    <p className="text-email">{displayEmail}</p>
                    <div className="banner-badges">
                        <span className="badge-role">{roleBadge}</span>
                        <span className="badge-emp-id">{empIdBadge}</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="profile-grid">
                
                {/* Left Column: Personal Information */}
                <div className="profile-col-left">
                    <div className="ui-card">
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
                                <div className="detail-label">Status</div>
                                <div className="detail-value"><span className="badge-active">active</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="ui-card">
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

            <style jsx="true">{`
                .profile-page-wrapper {
                    padding: 24px;
                    background-color: #f8fafc;
                    min-height: 100vh;
                    font-family: 'Inter', sans-serif;
                }

                /* Top Banner Card */
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

                /* Grid Layout */
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                /* Cards */
                .ui-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                }
                .mb-24 { margin-bottom: 24px; }
                
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
                    padding-left: 36px;
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
                    background: #7c3aed;
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

export default Profile;
