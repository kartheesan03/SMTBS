import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import { UserPlus, Package } from 'lucide-react';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { FormSection, FormGroup, Input, Select } from '../components/ui';

const AddVendor = ({ isEditMode = false }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', website: '', status: 'Active', materialsSupplied: [], rating: 0
    });
    const [newMaterial, setNewMaterial] = useState('');
    const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
    const [editingMaterialData, setEditingMaterialData] = useState(null);
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
            const vendor = data.vendor || data; // Fallback in case the API changes
            setFormData({
                name: vendor.name || '', 
                category: vendor.category || '', 
                contactPerson: vendor.contactPerson || '', 
                email: vendor.email || '', 
                phone: vendor.phone || '', 
                address: vendor.address || '', 
                gstNumber: vendor.gstNumber || '', 
                website: vendor.website || '',
                status: vendor.status || 'Active',
                rating: vendor.rating || 0,
                materialsSupplied: data.materials ? data.materials : (vendor.materialsSupplied || []).map(m => typeof m === 'string' ? { name: m } : m)
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
                { label: 'Procurement', path: '/erp' },
                { label: 'Vendors', path: '/vendors' },
                { label: isEditMode ? 'Edit' : 'New' }
            ]}
            onSave={handleSubmit}
            onCancel={() => navigate(-1)}
            isEditMode={isEditMode}
            loading={loading}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '0px', color: '#4f46e5' }}>
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
                {error && <div className="error-alert" style={{color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '0px', marginBottom: '16px'}}>{error}</div>}
                
                <div className="ui-grid-2">
                    <FormSection title="Company Information">
                        <FormGroup label="Company Name" required>
                            <Input 
                                type="text" 
                                value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. Sri Lakshmi Steel Traders"}
                            />
                        </FormGroup>
                        <FormGroup label="Category" required>
                            <Input 
                                type="text" 
                                value={formData.category} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. Steel & Metals"} 
                            />
                        </FormGroup>
                        <FormGroup label="GST Number">
                            <Input 
                                type="text" 
                                value={formData.gstNumber} 
                                onChange={e => setFormData({...formData, gstNumber: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. 33AAAAA0000A1Z5"} 
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
                        <FormGroup label="Rating (0-5)">
                            <Input 
                                type="number" 
                                min="0" 
                                max="5" 
                                step="0.5" 
                                value={formData.rating} 
                                onChange={e => setFormData({...formData, rating: parseFloat(e.target.value) || 0})} 
                                placeholder="0" 
                            />
                        </FormGroup>
                    </FormSection>

                    <FormSection title="Contact Information">
                        <FormGroup label="Primary Contact Person">
                            <Input 
                                type="text" 
                                value={formData.contactPerson} 
                                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. Ravi Shankar"} 
                            />
                        </FormGroup>
                        <FormGroup label="Email Address" required>
                            <Input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. ravi@srilakshmisteel.in"} 
                            />
                        </FormGroup>
                        <FormGroup label="Phone Number">
                            <Input 
                                type="text" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. 9865432100"} 
                            />
                        </FormGroup>
                        <FormGroup label="Website">
                            <Input 
                                type="url" 
                                value={formData.website} 
                                onChange={e => setFormData({...formData, website: e.target.value})} 
                                placeholder={isEditMode ? "" : "e.g. https://www.srilakshmisteel.in"} 
                            />
                        </FormGroup>
                    </FormSection>
                </div>
                <FormSection title="Location">
                    <FormGroup label="Address">
                        <Input 
                            type="text" 
                            value={formData.address} 
                            onChange={e => setFormData({...formData, address: e.target.value})} 
                            placeholder={isEditMode ? "" : "e.g. SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021"} 
                        />
                    </FormGroup>
                </FormSection>
                <FormSection title="Materials Supplied">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                        <button 
                            type="button" 
                            className="btn-primary"
                            onClick={() => {
                                setEditingMaterialData({ name: '', sku: '', category: '', quantity: 0, lowStockThreshold: 10, unit: 'pcs', price: 0, warehouse: '', shelf: '' });
                                setEditingMaterialIndex(-1);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add New Material
                        </button>
                    </div>
                    
                    {formData.materialsSupplied && formData.materialsSupplied.length > 0 ? (
                        <div className="enterprise-table-container" style={{ marginTop: '16px', overflowX: 'auto' }}>
                            <table className="enterprise-table" style={{ whiteSpace: 'normal', minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Material Name</th>
                                        <th style={{ width: '15%' }}>SKU / Barcode</th>
                                        <th style={{ width: '15%' }}>Category</th>
                                        <th style={{ width: '15%' }}>Quantity</th>
                                        <th style={{ width: '10%' }}>Unit Price</th>
                                        <th style={{ width: '15%' }}>Location</th>
                                        <th style={{ textAlign: 'right', width: '10%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.materialsSupplied.map((mat, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Package size={16} style={{ color: '#64748b', flexShrink: 0 }} /> 
                                                    <span style={{ wordBreak: 'break-word' }}>{mat.name}</span>
                                                </div>
                                            </td>
                                            <td>{mat.sku || '-'}</td>
                                            <td>{mat.category || '-'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{mat.quantity || 0} {mat.unit || 'pcs'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>₹{mat.price || 0}</td>
                                            <td>{mat.warehouse ? `${mat.warehouse}${mat.shelf ? ` - ${mat.shelf}` : ''}` : '-'}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                                    <button 
                                                        type="button"
                                                        className="btn-secondary action-btn-sm"
                                                        onClick={() => {
                                                            setEditingMaterialData({...mat});
                                                            setEditingMaterialIndex(i);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '0px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                                                        onClick={() => setFormData({...formData, materialsSupplied: formData.materialsSupplied.filter((_, idx) => idx !== i)})}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '0px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                            No materials added yet. Click "Add New Material" to link materials to this vendor.
                        </div>
                    )}
                </FormSection>

                {editingMaterialIndex !== null && editingMaterialData && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: '#fff', borderRadius: '0px', width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
                            <h3 style={{ margin: '0 0 20px 0' }}>{editingMaterialIndex === -1 ? 'Add New Material' : 'Edit Material'}</h3>
                            
                            <div className="ui-grid-2">
                                <FormGroup label="Material Name" required>
                                    <Input value={editingMaterialData.name} onChange={e => setEditingMaterialData({...editingMaterialData, name: e.target.value})} />
                                </FormGroup>
                                <FormGroup label="SKU / Barcode">
                                    <Input value={editingMaterialData.sku} onChange={e => setEditingMaterialData({...editingMaterialData, sku: e.target.value})} />
                                </FormGroup>
                                <FormGroup label="Category">
                                    <Input value={editingMaterialData.category} onChange={e => setEditingMaterialData({...editingMaterialData, category: e.target.value})} />
                                </FormGroup>
                                <FormGroup label="Initial Quantity">
                                    <Input type="number" value={editingMaterialData.quantity} onChange={e => setEditingMaterialData({...editingMaterialData, quantity: Number(e.target.value)})} />
                                </FormGroup>
                                <FormGroup label="Low Stock Threshold">
                                    <Input type="number" value={editingMaterialData.lowStockThreshold} onChange={e => setEditingMaterialData({...editingMaterialData, lowStockThreshold: Number(e.target.value)})} />
                                </FormGroup>
                                <FormGroup label="Unit of Measure">
                                    <Input value={editingMaterialData.unit} onChange={e => setEditingMaterialData({...editingMaterialData, unit: e.target.value})} placeholder="e.g. pcs, kg, liters" />
                                </FormGroup>
                                <FormGroup label="Unit Price (₹)">
                                    <Input type="number" value={editingMaterialData.price} onChange={e => setEditingMaterialData({...editingMaterialData, price: Number(e.target.value)})} />
                                </FormGroup>
                            </div>
                            
                            <div className="ui-grid-2" style={{ marginTop: '16px' }}>
                                <FormGroup label="Warehouse / Storage Area">
                                    <Input value={editingMaterialData.warehouse} onChange={e => setEditingMaterialData({...editingMaterialData, warehouse: e.target.value})} />
                                </FormGroup>
                                <FormGroup label="Shelf / Bin">
                                    <Input value={editingMaterialData.shelf} onChange={e => setEditingMaterialData({...editingMaterialData, shelf: e.target.value})} />
                                </FormGroup>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setEditingMaterialIndex(null)}>Cancel</button>
                                <button type="button" className="btn-primary" onClick={() => {
                                    if (!editingMaterialData.name) {
                                        toast.error("Material Name is required");
                                        return;
                                    }
                                    const newList = [...formData.materialsSupplied];
                                    if (editingMaterialIndex === -1) {
                                        newList.push(editingMaterialData);
                                    } else {
                                        newList[editingMaterialIndex] = editingMaterialData;
                                    }
                                    setFormData({...formData, materialsSupplied: newList});
                                    setEditingMaterialIndex(null);
                                }}>Save Material</button>
                            </div>
                        </div>
                    </div>
                )}
                <button type="submit" style={{ display: 'none' }}>Submit</button>
            </form>
        </StandardPageLayout>
    );
};

export default AddVendor;
