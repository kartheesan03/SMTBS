import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';
import { MapPin, Briefcase, Award, GraduationCap, Edit, MessageSquare, UserPlus } from 'lucide-react';
import './SocialProfile.css';

const SocialProfile = () => {
    const { id } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get(`/social/profile/${id}`);
                setProfileData(data);
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="profile-loading">Loading Profile...</div>;
    if (!profileData) return <div className="profile-error">Profile not found</div>;

    const { user, employee } = profileData;

    return (
        <div className="social-profile-container">
            {/* Header Section */}
            <div className="profile-header-card">
                <div className="profile-cover-large"></div>
                <div className="profile-header-content">
                    <div className="profile-avatar-large">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-actions">
                        <button className="connect-btn-large"><UserPlus size={18} /> Connect</button>
                        <button className="message-btn-large"><MessageSquare size={18} /> Message</button>
                    </div>
                    <div className="profile-main-info">
                        <h2>{user?.username}</h2>
                        <h3>{employee?.designation || user?.role || 'Employee'}</h3>
                        <div className="profile-meta">
                            <span><Briefcase size={16} /> {employee?.department || 'General'}</span>
                            <span><MapPin size={16} /> {employee?.location || 'HQ'}</span>
                        </div>
                        <p className="connections-count">500+ Connections</p>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="profile-section-card">
                <div className="section-header">
                    <h4>About</h4>
                    <button className="edit-btn"><Edit size={16} /></button>
                </div>
                <p className="about-text">
                    Passionate professional dedicated to driving organizational success through cross-functional collaboration and continuous innovation.
                </p>
            </div>

            {/* Experience Section */}
            <div className="profile-section-card">
                <div className="section-header">
                    <h4>Experience</h4>
                    <button className="edit-btn"><Edit size={16} /></button>
                </div>
                <div className="experience-list">
                    <div className="experience-item">
                        <div className="experience-icon"><Briefcase size={20} /></div>
                        <div className="experience-details">
                            <strong>{employee?.designation || 'Current Role'}</strong>
                            <span>SMTBMS Inc. • Full-time</span>
                            <span className="experience-date">Jan 2022 - Present</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Section */}
            <div className="profile-section-card">
                <div className="section-header">
                    <h4>Skills</h4>
                    <button className="edit-btn"><Edit size={16} /></button>
                </div>
                <div className="skills-tags">
                    <span className="skill-tag">Project Management</span>
                    <span className="skill-tag">Leadership</span>
                    <span className="skill-tag">Data Analysis</span>
                    <span className="skill-tag">Communication</span>
                </div>
            </div>
        </div>
    );
};

export default SocialProfile;
