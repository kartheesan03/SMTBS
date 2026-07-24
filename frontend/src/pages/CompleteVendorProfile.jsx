import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Building2, Mail, Phone, MapPin, Globe, Package, CheckCircle, User } from 'lucide-react';

const CompleteVendorProfile = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        category: '',
        gstNumber: '',
        website: '',
        materialsSupplied: '' // Will parse as comma separated
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // Process materials array
            const materialsArray = formData.materialsSupplied
                ? formData.materialsSupplied.split(',').map(m => m.trim()).filter(m => m !== '')
                : [];

            const payload = { ...formData, materialsSupplied: materialsArray };

            await API.post('/vendors/profile', payload);
            
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
                        <h2>Complete Your Vendor Profile</h2>
                        <p>Provide your business details to start supplying materials.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '30px' }}>
                        <div className="input-group">
                            <Building2 size={20} className="input-icon" />
                            <input type="text" name="name" placeholder="Vendor / Business Name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <User size={20} className="input-icon" />
                            <input type="text" name="contactPerson" placeholder="Contact Person Name" value={formData.contactPerson} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Mail size={20} className="input-icon" />
                            <input type="email" name="email" placeholder="Business Email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Phone size={20} className="input-icon" />
                            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <MapPin size={20} className="input-icon" />
                            <input type="text" name="address" placeholder="Business Address" value={formData.address} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Package size={20} className="input-icon" />
                            <input type="text" name="category" placeholder="Supply Category (e.g., Electronics, Raw Materials)" value={formData.category} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <Package size={20} className="input-icon" />
                            <textarea name="materialsSupplied" placeholder="Materials Supplied (comma separated, e.g. Steel, Aluminum)" value={formData.materialsSupplied} onChange={handleChange} rows="2" style={{ width: '100%', padding: '12px 12px 12px 48px', border: '1px solid var(--border)', borderRadius: '0px', background: 'var(--bg-input)', color: 'var(--text-primary)' }}></textarea>
                        </div>
                        <div className="input-group">
                            <Building2 size={20} className="input-icon" />
                            <input type="text" name="gstNumber" placeholder="GST Number (Optional)" value={formData.gstNumber} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <Globe size={20} className="input-icon" />
                            <input type="url" name="website" placeholder="Website (Optional)" value={formData.website} onChange={handleChange} />
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

export default CompleteVendorProfile;
