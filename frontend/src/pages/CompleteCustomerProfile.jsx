import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Building2, Mail, Phone, MapPin, Globe, FileText, CheckCircle } from 'lucide-react';

const CompleteCustomerProfile = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        industry: '',
        address: '',
        website: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await API.post('/customers/profile', formData);
            // Refresh user to get updated isProfileComplete status
            const { data } = await API.get('/auth/me');
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="split-card" style={{ maxWidth: '800px', width: '90%', margin: '40px auto' }}>
                <div className="form-section" style={{ width: '100%', padding: '40px' }}>
                    <div className="header-box">
                        <div className="icon-wrapper"><CheckCircle size={28} /></div>
                        <h2>Complete Your Customer Profile</h2>
                        <p>Tell us a bit more about you and your organization.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '30px' }}>
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Building2 size={20} className="input-icon" />
                            <input type="text" name="company" placeholder="Organization/Company Name" value={formData.company} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Mail size={20} className="input-icon" />
                            <input type="email" name="email" placeholder="Contact Email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Phone size={20} className="input-icon" />
                            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <MapPin size={20} className="input-icon" />
                            <input type="text" name="address" placeholder="Primary Address" value={formData.address} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Globe size={20} className="input-icon" />
                            <input type="url" name="website" placeholder="Website (Optional)" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <Building2 size={20} className="input-icon" />
                            <input type="text" name="industry" placeholder="Industry" value={formData.industry} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <FileText size={20} className="input-icon" />
                            <textarea name="notes" placeholder="Internal Notes / Additional Info (Optional)" value={formData.notes} onChange={handleChange} rows="3" style={{ width: '100%', padding: '12px 12px 12px 48px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-input)', color: 'var(--text-primary)' }}></textarea>
                        </div>
                        
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Complete Profile'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompleteCustomerProfile;

// Note: Add 'User' to lucide-react imports if not there
import { User } from 'lucide-react';
