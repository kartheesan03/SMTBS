import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';

const AddVendor = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', website: ''
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
                website: data.website || ''
            });
        } catch (err) {
            toast.error('Failed to fetch vendor data');
            navigate('/vendors');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async () => {
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

    if (isFetching) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

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
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? formData.name : 'New Vendor Profile'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Please complete all required fields below.</p>
                    </div>
                </div>
            }
        >
            <div className="standard-section">
                <div className="standard-section-header">Company Information</div>
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}
                
                <form id="vendor-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Company Name *</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Steel Supply Co" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Category *</label>
                            <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Electronics, Packaging" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>GST/Tax ID</label>
                            <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} placeholder="Tax Identification Number" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Website</label>
                            <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://www.example.com" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                    </div>
                </form>
            </div>

            <div className="standard-section">
                <div className="standard-section-header">Contact Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Contact Person *</label>
                        <input type="text" required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="Primary contact name" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Email Address *</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@supplier.com" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Phone Number *</label>
                        <input type="tel" pattern="[0-9\-\+\s\(\)]+" maxLength="15" title="Valid phone number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210" required style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Full Address *</label>
                        <textarea rows="3" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Company location and address..." style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}></textarea>
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default AddVendor;
