import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { Bookmark, Users, Newspaper, Calendar, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../../../api/auth';

const FeedProfileCard = ({ onCreatePost, onGoAnalytics }) => {
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        bio: user?.bio || '',
        birthday: user?.birthday || '',
        skills: user?.skills || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updated = await updateProfile(formData);
            updateUser(updated.user);
            toast.success('Profile updated successfully!');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to update profile', error);
            toast.error('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    // ERP-style sections mimicking LI
    const analyticsLinks = [
        { label: 'Pending Approvals', value: 5, action: () => navigate(`/social/profile/${user?._id || user?.id}`) },
    ];

    const bottomLinks = [
        { icon: Bookmark,   label: 'Saved Materials',  action: () => { console.log('Clicked: Saved Materials'); navigate('/documents'); } },
        { icon: Users,      label: 'Departments',      action: () => { console.log('Clicked: Departments'); navigate('/social/network'); } },
        { icon: Newspaper,  label: 'Announcements',    action: () => { console.log('Clicked: Announcements'); navigate('/feed'); } },
        { icon: Calendar,   label: 'Deliveries',       action: () => { console.log('Clicked: Deliveries'); navigate('/support'); } },
    ];

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Section 1: Profile Info */}
                    <div style={{
                        height: '60px', 
                        display: 'flex'
                    }}>
                        <div style={{ flex: '2', backgroundColor: '#d9e2e8' }}></div>
                        <div style={{ flex: '1', backgroundColor: '#c7d5df' }}></div>
                    </div>
                    
                    <div style={{ padding: '0 16px 16px 16px', position: 'relative', textAlign: 'left' }}>
                        <div onClick={() => navigate(`/social/profile/${user?._id || user?.id}`)}
                             style={{ marginTop: '-36px', marginBottom: '12px', borderRadius: '50%', border: '2px solid #ffffff', backgroundColor: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', cursor: 'pointer' }}>
                            <Avatar user={user} size={68} />
                        </div>
                        
                        <h3 onClick={() => navigate(`/social/profile/${user?._id || user?.id}`)}
                            style={{ margin: '0 0 4px', color: '#191919', fontSize: '16px', fontWeight: 'bold', lineHeight: '1.25', cursor: 'pointer', textDecoration: 'none' }}
                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}>
                            {user?.name || 'Loading...'}
                        </h3>
                        
                        <p style={{ margin: '0 0 4px', color: '#666666', fontSize: '13px', lineHeight: '1.33' }}>
                            {user?.bio || user?.role || user?.department || 'Employee'}
                        </p>
                        
                        <p style={{ margin: '0 0 16px', color: '#666666', fontSize: '12.5px', lineHeight: '1.33' }}>
                            {user?.location || 'Company Headquarters'}
                        </p>
                        
                        <div onClick={() => {
                                 console.log('Clicked: Edit Profile');
                                 setFormData({
                                    name: user?.name || '',
                                    bio: user?.bio || '',
                                    birthday: user?.birthday || '',
                                    skills: user?.skills || ''
                                 });
                                 setIsModalOpen(true);
                             }}
                             style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 12px', border: '1px dashed #d1d5db', borderRadius: '16px', backgroundColor: 'transparent', cursor: 'pointer' }}>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#666666' }}>Edit Profile</span>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#e5e7eb' }}></div>

                    {/* Section 2: Analytics */}
                    <div style={{ padding: '12px 0' }}>
                        <div 
                            style={{ padding: '4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.15s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f2ef'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{ color: '#666666', fontSize: '13px', fontWeight: '600' }}>Profile viewers</span>
                            <span style={{ color: '#0a66c2', fontSize: '13px', fontWeight: 'bold' }}>5</span>
                        </div>
                        
                        <div 
                            onClick={() => { console.log('Clicked: View all analytics'); onGoAnalytics && onGoAnalytics(); }} 
                            style={{ padding: '4px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background-color 0.15s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f2ef'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span style={{ color: '#0a66c2', fontSize: '13px', fontWeight: '600' }}>View all analytics</span>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '1px', backgroundColor: '#e5e7eb' }}></div>

                    {/* Section 3: Links */}
                    <div style={{ padding: '12px 0' }}>
                        {bottomLinks.map((link, idx) => (
                            <div key={idx} onClick={link.action}
                                 style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background-color 0.15s' }}
                                 onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f2ef'}
                                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <link.icon size={16} color="#666666" style={{ fill: link.icon === Bookmark ? '#666666' : 'none' }} />
                                <span style={{ color: '#191919', fontSize: '13.5px', fontWeight: '600' }}>{link.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => !isSaving && setIsModalOpen(false)}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#191919' }}>Edit Intro</h2>
                            <button onClick={() => !isSaving && setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} color="#666" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #191919', borderRadius: '4px', fontSize: '14px' }} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>Headline / Bio</label>
                                <input type="text" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="e.g. Software Engineer at SMTBMS" style={{ width: '100%', padding: '8px 12px', border: '1px solid #191919', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>Birthday</label>
                                <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #191919', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#666' }}>Skills (comma separated)</label>
                                <input type="text" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="e.g. React, Node.js, Supply Chain" style={{ width: '100%', padding: '8px 12px', border: '1px solid #191919', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                                <button type="button" onClick={() => !isSaving && setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '16px', border: '1px solid #666', background: 'transparent', color: '#666', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={isSaving} style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', background: '#0a66c2', color: 'white', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default FeedProfileCard;
