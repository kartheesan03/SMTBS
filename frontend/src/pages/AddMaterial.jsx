import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { Package } from 'lucide-react';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { FormSection, FormGroup, Input, Select, SearchableSelect } from '../components/ui';

const AddMaterial = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, vendorId: '',
        warehouse: '', shelf: ''
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
                vendorId: data.vendorId || (data.vendor && data.vendor._id) || '',
                warehouse: data.warehouse || '',
                shelf: data.shelf || ''
            });
        } catch (err) {
            toast.error('Failed to fetch material data');
            navigate('/materials');
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.sku || !formData.category || !formData.unit) {
            setError("Please fill all required fields.");
            toast.error("Please fill all required fields.");
            return;
        }

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

    if (isFetching) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;

    const vendorOptions = vendors.map(v => ({ value: v._id || v.id, label: v.name }));

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
            loading={loading}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>{isEditMode ? formData.name : 'New Material Record'}</h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Complete material and stock threshold details below.</p>
                    </div>
                </div>
            }
        >
            <form id="material-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}
                
                <FormSection title="Basic Information">
                    <div className="ui-grid-2">
                        <FormGroup label="Material Name" required>
                            <Input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Steel Pipe 12mm"
                            />
                        </FormGroup>
                        <FormGroup label="SKU / Barcode" required>
                            <Input 
                                type="text" 
                                value={formData.sku} 
                                onChange={e => setFormData({...formData, sku: e.target.value})} 
                                placeholder="e.g. SP-12MM-001" 
                            />
                        </FormGroup>
                        <FormGroup label="Category" required>
                            <Input 
                                type="text" 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                placeholder="e.g. Raw Materials" 
                            />
                        </FormGroup>
                        <FormGroup label="Vendor (Optional)">
                            <SearchableSelect 
                                options={vendorOptions}
                                value={formData.vendorId}
                                onChange={(val) => setFormData({...formData, vendorId: val})}
                                placeholder="Search & Select a Vendor"
                            />
                        </FormGroup>
                    </div>
                </FormSection>

                <FormSection title="Inventory & Pricing">
                    <div className="ui-grid-2">
                        <FormGroup label="Initial Quantity" required>
                            <Input 
                                type="number" 
                                min="0" 
                                value={formData.quantity} 
                                onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} 
                            />
                        </FormGroup>
                        <FormGroup label="Low Stock Threshold" required>
                            <Input 
                                type="number" 
                                min="0" 
                                value={formData.lowStockThreshold} 
                                onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} 
                            />
                        </FormGroup>
                        <FormGroup label="Unit of Measure" required>
                            <Select 
                                value={formData.unit} 
                                onChange={e => setFormData({...formData, unit: e.target.value})} 
                                options={[
                                    { value: 'pcs', label: 'Pieces (pcs)' },
                                    { value: 'kg', label: 'Kilograms (kg)' },
                                    { value: 'ltr', label: 'Liters (ltr)' },
                                    { value: 'boxes', label: 'Boxes' },
                                    { value: 'meters', label: 'Meters (m)' },
                                ]}
                            />
                        </FormGroup>
                        <FormGroup label="Unit Price (₹)" required>
                            <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={formData.price} 
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                            />
                        </FormGroup>
                    </div>
                </FormSection>
                <FormSection title="Location Details">
                    <div className="ui-grid-2">
                        <FormGroup label="Warehouse / Storage Area">
                            <Input 
                                type="text" 
                                value={formData.warehouse} 
                                onChange={e => setFormData({...formData, warehouse: e.target.value})} 
                                placeholder="e.g. Warehouse A"
                            />
                        </FormGroup>
                        <FormGroup label="Shelf / Bin (Optional)">
                            <Input 
                                type="text" 
                                value={formData.shelf} 
                                onChange={e => setFormData({...formData, shelf: e.target.value})} 
                                placeholder="e.g. Shelf 4" 
                            />
                        </FormGroup>
                    </div>
                </FormSection>
                <button type="submit" style={{ display: 'none' }}>Submit</button>
            </form>
        </StandardPageLayout>
    );
};

export default AddMaterial;
