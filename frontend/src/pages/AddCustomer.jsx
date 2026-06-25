import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft } from 'lucide-react';
import CustomerForm from '../components/CustomerForm';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: '', customerType: 'Individual'
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
        <div className="page-container">
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
                    <CustomerForm 
                        formData={formData}
                        setFormData={setFormData}
                        formErrors={formErrors}
                        setFormErrors={setFormErrors}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/crm')}
                        isLoading={isLoading}
                        emailDisabled={false}
                        statusDisabled={false}
                        saveButtonText="Save Customer"
                    />
                </div>
            </div>

            <style jsx="true">{`
                /* layout handled by .page-container */
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; }
                
                .form-wrapper { padding: 30px; max-width: 800px; margin: 0 auto; background: #ffffff; border-radius: 12px; }
                
                .btn-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: #f1f5f9; color: #475569; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-back:hover { background: #e2e8f0; color: #0f172a; }

                @media (max-width: 768px) {
                    .page-container { padding: 16px 12px; }
                    .form-wrapper { padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default AddCustomer;
