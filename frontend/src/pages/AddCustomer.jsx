import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import CustomerForm from '../components/CustomerForm';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';

const AddCustomer = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active', customerType: 'Individual'
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode && id) {
            fetchCustomer();
        }
    }, [isEditMode, id]);

    const fetchCustomer = async () => {
        try {
            const { data } = await API.get(`/customers/${id}`);
            setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                industry: data.industry || '',
                website: data.website || '',
                notes: data.notes || '',
                status: data.status || 'Active',
                customerType: data.customerType || 'Individual'
            });
        } catch (err) {
            toast.error('Failed to fetch customer data');
            navigate('/customers');
        } finally {
            setIsFetching(false);
        }
    };

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

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            if (isEditMode) {
                await API.put(`/customers/${id}`, formData);
                toast.success('Customer updated successfully');
                navigate(`/customers/${id}`);
            } else {
                const res = await API.post('/customers', formData);
                toast.success('Customer created successfully');
                navigate(`/customers/${res.data._id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving customer');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <StandardPageLayout
            title={isEditMode ? "Edit Customer" : "Add New Customer"}
            subtitle={isEditMode ? "Update customer profile information" : "Create a new customer profile in the CRM."}
            breadcrumbs={[
                { label: 'CRM', path: '/customers' },
                { label: 'Customers', path: '/customers' },
                { label: isEditMode ? 'Edit' : 'New' }
            ]}
            onSave={handleSubmit}
            onCancel={() => navigate('/customers')}
            isEditMode={isEditMode}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? formData.name : 'New Customer'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Fill in the primary details below to {isEditMode ? 'update' : 'register'} the customer.</p>
                    </div>
                </div>
            }
        >
            <div className="standard-section">
                <div className="standard-section-header">Customer Information</div>
                <CustomerForm 
                    formData={formData}
                    setFormData={setFormData}
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                    onSubmit={e => { e.preventDefault(); handleSubmit(); }}
                    onCancel={() => navigate('/customers')}
                    isLoading={isLoading}
                    emailDisabled={false}
                    statusDisabled={false}
                    saveButtonText={isEditMode ? "Update Customer" : "Save Customer"}
                    hideActions={true} /* Let StandardPageLayout handle the buttons */
                />
            </div>
        </StandardPageLayout>
    );
};

export default AddCustomer;
