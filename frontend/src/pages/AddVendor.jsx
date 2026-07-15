import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { UserPlus } from 'lucide-react';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { FormSection, FormGroup, Input, Select } from '../components/ui';

const AddVendor = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', website: '', status: 'Active'
    });
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode && id) {
            fetchVendor();
        }
    }, [isEditMode, id]);

    const fetchVendor = async () => {
        try {
            const { data } = await API.get(`/vendors/${id}`);
            setFormData({
                name: data.name || '', 
                category: data.category || '', 
                contactPerson: data.contactPerson || '', 
                email: data.email || '', 
                phone: data.phone || '', 
                address: data.address || '', 
                gstNumber: data.gstNumber || '', 
                website: data.website || '',
                status: data.status || 'Active'
            });
        } catch (err) {
            toast.error('Failed to fetch vendor data');
            navigate('/vendors');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.category || !formData.email) {
            setError("Please fill all required fields.");
            toast.error("Please fill all required fields.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await API.put(`/vendors/${id}`, formData);
                toast.success('Vendor updated successfully');
                navigate(`/vendors/${id}`);
            } else {
                const res = await API.post('/vendors', formData);
                toast.success('Vendor created successfully');
                navigate(`/vendors/${res.data._id || res.data.id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving vendor');
            toast.error(err.response?.data?.message || 'Error saving vendor');
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;

    return (
        <StandardPageLayout
            title={isEditMode ? "Edit Vendor" : "Add New Vendor"}
            subtitle={isEditMode ? "Update supplier details." : "Register a new vendor/supplier."}
            breadcrumbs={[
                { label: 'Procurement', path: '/vendors' },
                { label: 'Vendors', path: '/vendors' },
                { label: isEditMode ? 'Edit' : 'New' }
            ]}
            onSave={handleSubmit}
            onCancel={() => navigate('/vendors')}
            isEditMode={isEditMode}
            loading={loading}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? formData.name : 'New Vendor Profile'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Please complete all required fields below.</p>
                    </div>
                </div>
            }
        >
            <form id="vendor-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}
                
                <FormSection title="Company Information">
                    <div className="ui-grid-2">
                        <FormGroup label="Company Name" required>
                            <Input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Steel Supply Co"
                            />
                        </FormGroup>
                        <FormGroup label="Category" required>
                            <Input 
                                type="text" 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                placeholder="e.g. Metals, Plastics, Services" 
                            />
                        </FormGroup>
                        <FormGroup label="GST Number">
                            <Input 
                                type="text" 
                                value={formData.gstNumber} 
                                onChange={e => setFormData({...formData, gstNumber: e.target.value})} 
                                placeholder="e.g. 27AAAAA0000A1Z5" 
                            />
                        </FormGroup>
                        <FormGroup label="Status">
                            <Select 
                                value={formData.status} 
                                onChange={e => setFormData({...formData, status: e.target.value})} 
                                options={[
                                    { value: 'Active', label: 'Active' },
                                    { value: 'On Hold', label: 'On Hold' },
                                    { value: 'Inactive', label: 'Inactive' }
                                ]}
                            />
                        </FormGroup>
                    </div>
                </FormSection>

                <FormSection title="Contact Information">
                    <div className="ui-grid-2">
                        <FormGroup label="Primary Contact Person">
                            <Input 
                                type="text" 
                                value={formData.contactPerson} 
                                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                                placeholder="e.g. Jane Doe"
                            />
                        </FormGroup>
                        <FormGroup label="Email Address" required>
                            <Input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                placeholder="e.g. sales@steelsupply.com" 
                            />
                        </FormGroup>
                        <FormGroup label="Phone Number">
                            <Input 
                                type="text" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder="e.g. +91 9876543210" 
                            />
                        </FormGroup>
                        <FormGroup label="Website">
                            <Input 
                                type="url" 
                                value={formData.website} 
                                onChange={e => setFormData({...formData, website: e.target.value})} 
                                placeholder="e.g. https://www.steelsupply.com" 
                            />
                        </FormGroup>
                    </div>
                    <FormGroup label="Address">
                        <Input 
                            type="text" 
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                            placeholder="Full address" 
                        />
                    </FormGroup>
                </FormSection>
                <button type="submit" style={{ display: 'none' }}>Submit</button>
            </form>
        </StandardPageLayout>
    );
};

export default AddVendor;
