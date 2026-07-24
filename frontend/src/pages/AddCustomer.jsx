import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { User } from 'lucide-react';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { FormSection, FormGroup, Input, Select } from '../components/ui';

const AddCustomer = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', industry: '', website: '', notes: '', status: 'Active', customerType: 'Individual', company: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [error, setError] = useState('');

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
                customerType: data.customerType || 'Individual',
                company: data.company || ''
            });
        } catch (err) {
            toast.error('Failed to fetch customer data');
            navigate('/customers');
        } finally {
            setIsFetching(false);
        }
    };

    const validateForm = () => {
        if (!formData.name || formData.name.trim().length < 2) {
            setError('Organization or Contact name must be at least 2 characters.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            setError('Please enter a valid phone number (at least 10 digits).');
            return false;
        }
        if (!formData.industry || formData.industry.trim().length === 0) {
            setError('Industry is required.');
            return false;
        }
        if (!formData.address || formData.address.trim().length === 0) {
            setError('Primary address is required.');
            return false;
        }
        
        setError('');
        return true;
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
                navigate(`/customers/${res.data._id || res.data.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving customer');
            setError(err.response?.data?.message || 'Error saving customer');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;

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
            loading={isLoading}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '0px', color: '#4f46e5' }}>
                        <User size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? formData.name : 'New Customer'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Please provide detailed information for the new customer profile.</p>
                    </div>
                </div>
            }
        >
            <form id="customer-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '0px', marginBottom: '16px'}}>{error}</div>}
                
                <div className="ui-grid-2">
                    <FormSection title="Account Details">
                        <FormGroup label="Customer Type" required>
                            <Select 
                                value={formData.customerType} 
                                onChange={e => setFormData({...formData, customerType: e.target.value})} 
                                options={[
                                    { value: 'Individual', label: 'Individual' },
                                    { value: 'Corporate', label: 'Corporate / B2B' },
                                    { value: 'Government', label: 'Government' },
                                ]}
                            />
                        </FormGroup>
                        <FormGroup label="Status">
                            <Select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value})} 
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'Lead', label: 'Lead' },
                                    { value: 'At Risk', label: 'At Risk' },
                                    { value: 'Inactive', label: 'Inactive' }
                                ]}
                            />
                        </FormGroup>
                        <FormGroup label="Primary Contact Name" required>
                            <Input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. Rajan"}
                            />
                        </FormGroup>
                        <FormGroup label="Company Name">
                            <Input 
                                type="text" 
                                value={formData.company} 
                                onChange={e => setFormData({...formData, company: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. Kovai Builders Pvt Ltd"} 
                            />
                        </FormGroup>
                    </FormSection>

                    <FormSection title="Contact Information">
                        <FormGroup label="Email Address" required>
                            <Input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. info@kovaibuilders.in"} 
                            />
                        </FormGroup>
                        <FormGroup label="Phone Number" required>
                            <Input 
                                type="text" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. 9843210001"} 
                            />
                        </FormGroup>
                        <FormGroup label="Industry" required>
                            <Input 
                                type="text" 
                                value={formData.industry} 
                                onChange={e => setFormData({...formData, industry: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. Real Estate"} 
                            />
                        </FormGroup>
                        <FormGroup label="Website">
                            <Input 
                                type="url" 
                                value={formData.website} 
                                onChange={e => setFormData({...formData, website: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. kovaibuilders.in"} 
                            />
                        </FormGroup>
                    </FormSection>
                </div>
                <FormSection title="Location">
                    <FormGroup label="Address" required>
                        <Input 
                            type="text" 
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                            placeholder={isEditMode ? "" : "e.g. Race Course Road, Coimbatore, Tamil Nadu 641018"} 
                        />
                    </FormGroup>
                </FormSection>
                <button type="submit" style={{ display: 'none' }}>Submit</button>
            </form>
        </StandardPageLayout>
    );
};

export default AddCustomer;
