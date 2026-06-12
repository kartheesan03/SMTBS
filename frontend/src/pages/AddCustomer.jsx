import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Building2, Mail, Phone, Globe, ArrowLeft, Save, X } from 'lucide-react';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active', customerType: 'Individual'
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = () => {
        const errors = {};
        if (!formData.name || formData.name.trim().length < 2) errors.name = 'Organization name must be at least 2 characters.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) errors.email = 'Please enter a valid email address.';
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) errors.phone = 'Please enter a valid phone number (at least 10 digits).';
        if (!formData.industry || formData.industry.trim().length === 0) errors.industry = 'Industry is required.';
        if (!formData.address || formData.address.trim().length === 0) errors.address = 'Primary address is required.';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            await API.post('/customers', formData);
            navigate('/crm');
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating customer');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-back" onClick={() => navigate('/crm')}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="title-gradient">Add New Customer</h1>
                        <p className="text-muted">Create a new customer profile in the CRM.</p>
                    </div>
                </div>
            </header>

            <div className="module-content">
                <div className="glass-card form-wrapper">
                    <form onSubmit={handleSubmit} className="page-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Organization Name <span className="req">*</span></label>
                                <div className={`input-with-icon ${formErrors.name ? 'error-border' : ''}`}>
                                    <Building2 size={16} />
                                    <input type="text" value={formData.name} onChange={e => { setFormData({...formData, name: e.target.value}); if(formErrors.name) setFormErrors({...formErrors, name: null}); }} placeholder="e.g. Acme Corporation" />
                                </div>
                                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Lifecycle Status</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                    <option value="Active">Active</option>
                                    <option value="Lead">Lead</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending Review">Pending Review</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Email Address <span className="req">*</span></label>
                                <div className={`input-with-icon ${formErrors.email ? 'error-border' : ''}`}>
                                    <Mail size={16} />
                                    <input type="email" value={formData.email} onChange={e => { setFormData({...formData, email: e.target.value}); if(formErrors.email) setFormErrors({...formErrors, email: null}); }} placeholder="contact@acmecorp.com" />
                                </div>
                                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Phone Number <span className="req">*</span></label>
                                <div className={`input-with-icon ${formErrors.phone ? 'error-border' : ''}`}>
                                    <Phone size={16} />
                                    <input type="text" value={formData.phone} onChange={e => { setFormData({...formData, phone: e.target.value}); if(formErrors.phone) setFormErrors({...formErrors, phone: null}); }} placeholder="+1 (555) 123-4567" />
                                </div>
                                {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Industry <span className="req">*</span></label>
                                <input type="text" className={formErrors.industry ? 'error-border' : ''} value={formData.industry} onChange={e => { setFormData({...formData, industry: e.target.value}); if(formErrors.industry) setFormErrors({...formErrors, industry: null}); }} placeholder="e.g. Manufacturing, Software, Retail" />
                                {formErrors.industry && <span className="error-text">{formErrors.industry}</span>}
                            </div>
                            <div className="form-group">
                                <label>Website</label>
                                <div className="input-with-icon">
                                    <Globe size={16} />
                                    <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://www.acmecorp.com" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Primary Address <span className="req">*</span></label>
                            <input type="text" className={formErrors.address ? 'error-border' : ''} value={formData.address} onChange={e => { setFormData({...formData, address: e.target.value}); if(formErrors.address) setFormErrors({...formErrors, address: null}); }} placeholder="123 Business Rd, Tech Park, City, ZIP" />
                            {formErrors.address && <span className="error-text">{formErrors.address}</span>}
                        </div>

                        <div className="form-group">
                            <label>Internal Notes</label>
                            <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Key partnership details..."></textarea>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/crm')}>
                                <X size={18} /> Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                <Save size={18} /> {isLoading ? 'Saving...' : 'Save Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; }
                
                .form-wrapper { padding: 30px; max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; }
                .page-form { display: flex; flex-direction: column; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
                .form-group:last-child { margin-bottom: 0; }
                .form-group label { font-size: 13px; font-weight: 600; color: #475569; }
                
                .req { color: #ef4444; margin-left: 2px; }
                .error-text { color: #ef4444; font-size: 12px; margin-top: 4px; font-weight: 500; }
                .error-border { border-color: #ef4444 !important; }
                
                .input-with-icon { display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px; transition: all 0.2s; }
                .input-with-icon:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); background: #ffffff; }
                .input-with-icon input { background: none; border: none; padding: 12px 0; color: #0f172a; width: 100%; font-size: 15px; outline: none; }
                
                .form-group input:not([type]), .form-group input[type="text"], .form-group input[type="email"], .form-group input[type="url"], .form-group select, .form-group textarea {
                    padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 15px; outline: none; transition: all 0.2s;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); background: #ffffff; }
                .form-group input::placeholder, .form-group textarea::placeholder { color: #94a3b8; }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
                .btn-cancel { display: flex; align-items: center; gap: 8px; background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-cancel:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; background: #6366f1; color: #ffffff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                .btn-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: #f1f5f9; color: #475569; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-back:hover { background: #e2e8f0; color: #0f172a; }

                @media (max-width: 768px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .module-container { padding: 15px; }
                    .form-wrapper { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default AddCustomer;
