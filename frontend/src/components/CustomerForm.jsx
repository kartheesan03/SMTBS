import React from 'react';
import { Building2, Mail, Phone, Globe, Save, X, User, FileText } from 'lucide-react';

const CustomerForm = ({ 
    formData, 
    setFormData, 
    formErrors = {}, 
    setFormErrors = () => {}, 
    onSubmit, 
    onCancel, 
    isLoading, 
    emailDisabled = false,
    statusDisabled = false,
    saveButtonText = "Save Changes"
}) => {
    return (
        <form onSubmit={onSubmit} className="page-form">
            <div className="form-grid">
                <div className="form-group">
                    <label>Full Name <span className="req">*</span></label>
                    <div className={`input-with-icon ${formErrors.name ? 'error-border' : ''}`}>
                        <User size={16} />
                        <input 
                            type="text" 
                            value={formData.name || ''} 
                            onChange={e => { 
                                setFormData({...formData, name: e.target.value}); 
                                if(formErrors.name) setFormErrors({...formErrors, name: null}); 
                            }} 
                            placeholder="John Doe" 
                            required 
                        />
                    </div>
                    {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                    <label>Organization Name / Company Name</label>
                    <div className="input-with-icon">
                        <Building2 size={16} />
                        <input 
                            type="text" 
                            value={formData.company || ''} 
                            onChange={e => setFormData({...formData, company: e.target.value})} 
                            placeholder="e.g. Acme Corporation" 
                        />
                    </div>
                </div>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label>Lifecycle Status</label>
                    <input 
                        type="text" 
                        value={formData.status || ''} 
                        onChange={e => setFormData({...formData, status: e.target.value})} 
                        placeholder="e.g. Active, Prospect, Inactive" 
                        disabled={statusDisabled}
                    />
                </div>
                <div className="form-group">
                    <label>Email Address {!emailDisabled && <span className="req">*</span>}</label>
                    <div className={`input-with-icon ${formErrors.email ? 'error-border' : ''}`}>
                        <Mail size={16} />
                        <input 
                            type="email" 
                            value={formData.email || ''} 
                            onChange={e => { 
                                setFormData({...formData, email: e.target.value}); 
                                if(formErrors.email) setFormErrors({...formErrors, email: null}); 
                            }} 
                            placeholder="contact@acmecorp.com" 
                            disabled={emailDisabled}
                            required={!emailDisabled}
                        />
                    </div>
                    {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label>Phone Number <span className="req">*</span></label>
                    <div className={`input-with-icon ${formErrors.phone ? 'error-border' : ''}`}>
                        <Phone size={16} />
                        <input 
                            type="text" 
                            value={formData.phone || ''} 
                            onChange={e => { 
                                setFormData({...formData, phone: e.target.value}); 
                                if(formErrors.phone) setFormErrors({...formErrors, phone: null}); 
                            }} 
                            placeholder="+1 (555) 123-4567" 
                            required 
                        />
                    </div>
                    {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                    <label>Industry</label>
                    <input 
                        type="text" 
                        value={formData.industry || ''} 
                        onChange={e => setFormData({...formData, industry: e.target.value})} 
                        placeholder="e.g. Manufacturing, Retail" 
                    />
                </div>
            </div>

            <div className="form-grid">
                <div className="form-group">
                    <label>Website (Optional)</label>
                    <div className="input-with-icon">
                        <Globe size={16} />
                        <input 
                            type="url" 
                            value={formData.website || ''} 
                            onChange={e => setFormData({...formData, website: e.target.value})} 
                            placeholder="https://www.acmecorp.com" 
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>GST Number (Optional)</label>
                    <div className="input-with-icon">
                        <FileText size={16} />
                        <input 
                            type="text" 
                            value={formData.gstNumber || ''} 
                            onChange={e => setFormData({...formData, gstNumber: e.target.value})} 
                            placeholder="e.g. 22AAAAA0000A1Z5" 
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label>Primary Address <span className="req">*</span></label>
                <div className={`input-with-icon ${formErrors.address ? 'error-border' : ''}`}>
                    <input 
                        type="text" 
                        value={formData.address || ''} 
                        onChange={e => { 
                            setFormData({...formData, address: e.target.value}); 
                            if(formErrors.address) setFormErrors({...formErrors, address: null}); 
                        }} 
                        placeholder="123 Business Rd, Tech Park, City, ZIP" 
                        required 
                    />
                </div>
                {formErrors.address && <span className="error-text">{formErrors.address}</span>}
            </div>

            <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onCancel}>
                    <X size={18} /> Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                    <Save size={18} /> {isLoading ? 'Saving...' : saveButtonText}
                </button>
            </div>

            <style jsx="true">{`
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
                
                .form-group input:not([type]), .form-group input[type="text"], .form-group input[type="email"], .form-group input[type="url"], .form-group select, .form-group textarea, .form-group input:disabled {
                    padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 15px; outline: none; transition: all 0.2s;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); background: #ffffff; }
                .form-group input:disabled { color: #94a3b8; cursor: not-allowed; }
                .input-with-icon input:disabled { color: #94a3b8; cursor: not-allowed; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
                .btn-cancel { display: flex; align-items: center; gap: 8px; background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-cancel:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; background: #6366f1; color: #ffffff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                @media (max-width: 768px) {
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </form>
    );
};

export default CustomerForm;
