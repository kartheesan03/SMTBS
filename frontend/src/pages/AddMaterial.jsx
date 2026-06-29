import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';

const AddMaterial = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: ''
    });
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEditMode);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const { data } = await API.get('/vendors');
                setVendors(data || []);
            } catch (err) {
                console.error("Error fetching vendors", err);
            }
        };
        fetchDependencies();
        
        if (isEditMode && id) {
            fetchMaterial();
        }
    }, [isEditMode, id]);

    const fetchMaterial = async () => {
        try {
            const { data } = await API.get(`/materials/${id}`);
            setFormData({
                name: data.name || '', 
                sku: data.sku || '', 
                category: data.category || '', 
                quantity: data.quantity || 0, 
                lowStockThreshold: data.lowStockThreshold || 10, 
                unit: data.unit || 'pcs', 
                price: data.price || 0, 
                vendorId: data.vendorId || (data.vendor && data.vendor._id) || ''
            });
        } catch (err) {
            toast.error('Failed to fetch material data');
            navigate('/materials');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                await API.put(`/materials/${id}`, formData);
                toast.success('Material updated successfully');
                navigate(`/materials/${id}`);
            } else {
                const res = await API.post('/materials', formData);
                toast.success('Material created successfully');
                navigate(`/materials/${res.data._id || res.data.id}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving material');
            toast.error(err.response?.data?.message || 'Error saving material');
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <StandardPageLayout
            title={isEditMode ? "Edit Material" : "Add New Material"}
            subtitle={isEditMode ? "Update inventory item details." : "Register a new material for inventory tracking."}
            breadcrumbs={[
                { label: 'Procurement', path: '/materials' },
                { label: 'Materials', path: '/materials' },
                { label: isEditMode ? 'Edit' : 'New' }
            ]}
            onSave={handleSubmit}
            onCancel={() => navigate('/materials')}
            isEditMode={isEditMode}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? formData.name : 'New Material Record'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Complete material and stock threshold details below.</p>
                    </div>
                </div>
            }
        >
            <div className="standard-section">
                <div className="standard-section-header">Basic Information</div>
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}
                
                <form id="material-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Material Name *</label>
                            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Steel Pipe 12mm" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>SKU / Barcode *</label>
                            <input type="text" required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. SP-12MM-001" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Category *</label>
                            <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Raw Materials" style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Vendor (Optional)</label>
                            <select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}>
                                <option value="">Select a Vendor</option>
                                {vendors.map(v => (
                                    <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>
            </div>

            <div className="standard-section">
                <div className="standard-section-header">Inventory & Pricing</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Initial Quantity *</label>
                        <input type="number" min="0" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Low Stock Threshold *</label>
                        <input type="number" min="0" required value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Unit of Measure *</label>
                        <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} required style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}>
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="kg">Kilograms (kg)</option>
                            <option value="ltr">Liters (ltr)</option>
                            <option value="boxes">Boxes</option>
                            <option value="meters">Meters (m)</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Unit Price (₹) *</label>
                        <input type="number" min="0" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default AddMaterial;
