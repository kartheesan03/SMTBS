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
                    <select 
                        value={formData.status || 'Active'} 
                        onChange={e => setFormData({...formData, status: e.target.value})} 
                        disabled={statusDisabled}
                    >
                        <option value="Active">Active</option>
                        <option value="Lead">Lead</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Inactive">Inactive</option>
                    </select>
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
                .page-form { display: flex; flex-direction: column; background: #ffffff; border-radius: var(--radius-lg); border: 1px solid var(--border-subtle); padding: 24px; box-shadow: var(--shadow-sm); }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; position: relative; }
                .form-group:last-child { margin-bottom: 0; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--secondary-hover); }
                
                .req { color: var(--danger); margin-left: 2px; }
                .error-text { color: var(--danger); font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
                .error-border { border-color: var(--danger) !important; box-shadow: 0 0 0 1px var(--danger) !important; }
                
                .input-with-icon { display: flex; align-items: center; gap: 10px; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 0 14px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
                .input-with-icon:focus-within { border-color: var(--primary); box-shadow: var(--ring-focus); }
                .input-with-icon input { background: none; border: none; padding: 12px 0; color: var(--text-heading); width: 100%; font-size: 14px; outline: none; font-family: 'Inter', sans-serif; }
                .input-with-icon svg { color: var(--text-muted); transition: color 0.2s; }
                .input-with-icon:focus-within svg { color: var(--primary); }
                
                .form-group input:not([type]), .form-group input[type="text"]:not(.input-with-icon input), .form-group input[type="email"]:not(.input-with-icon input), .form-group input[type="url"]:not(.input-with-icon input), .form-group select, .form-group textarea {
                    padding: 12px 14px; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-sm); color: var(--text-heading); font-size: 14px; outline: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 1px 2px rgba(0,0,0,0.02); font-family: 'Inter', sans-serif;
                }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); box-shadow: var(--ring-focus); }
                
                .form-group input:disabled, .input-with-icon input:disabled { color: var(--text-muted); cursor: not-allowed; background: #f8fafc; }
                .input-with-icon:has(input:disabled) { background: #f8fafc; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px; padding-top: 24px; border-top: 1px solid var(--border-subtle); }
                
                /* Global buttons are handled by index.css */

                @media (max-width: 768px) {
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </form>
    );
};

export default CustomerForm;
