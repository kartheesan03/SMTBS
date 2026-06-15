import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { PackagePlus, X, Save, ArrowLeft } from 'lucide-react';

const AddVendor = () => {
    const navigate = useNavigate();
    
    // Vendor Form Data
    const [formData, setFormData] = useState({
        name: '', category: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', website: ''
    });
    
    // New Materials Logic
    const [newMaterialsList, setNewMaterialsList] = useState([]);
    const [newMaterial, setNewMaterial] = useState({
        name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleAddNewMaterialToList = () => {
        if (!newMaterial.name || !newMaterial.sku) {
            alert("Material Name and SKU are required!");
            return;
        }
        if (newMaterialsList.some(m => m.sku === newMaterial.sku)) {
            alert("SKU already exists in the list! Please use a unique SKU.");
            return;
        }
        setNewMaterialsList([...newMaterialsList, { ...newMaterial }]);
        setNewMaterial({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', price: 0 });
    };

    const removeNewMaterialFromList = (index) => {
        const list = [...newMaterialsList];
        list.splice(index, 1);
        setNewMaterialsList(list);
    };

    const handleSaveVendor = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data: createdVendor } = await API.post('/vendors', formData);
            const finalVendorId = createdVendor._id || createdVendor.id;

            if (newMaterialsList.length > 0 && finalVendorId) {
                const materialPromises = newMaterialsList.map(mat => 
                    API.post('/materials', { ...mat, vendorId: finalVendorId })
                );
                await Promise.all(materialPromises);
            }

            navigate('/vendors');
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving vendor or materials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-back" onClick={() => navigate('/vendors')}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="title-gradient">Onboard New Supplier</h1>
                        <p className="text-muted">Register a new vendor and their initial materials stock.</p>
                    </div>
                </div>
            </header>

            <div className="module-content">
                <div className="glass-card form-wrapper" style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', background: '#ffffff', borderRadius: '12px' }}>
                    <form id="vendorForm" onSubmit={handleSaveVendor} className="page-form">
                        <h3 className="section-title">Supplier Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Vendor Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Steel Supply Co" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input type="text" name="category" placeholder="Enter Category (e.g., Electronics, Logistics, Packaging)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input type="text" required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Business Address</label>
                                <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>GST / Tax Number (Optional)</label>
                                <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} placeholder="e.g. 22AAAAA0000A1Z5" />
                            </div>
                            <div className="form-group">
                                <label>Website (Optional)</label>
                                <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://www.vendor.com" />
                            </div>
                        </div>

                        {/* New Stock Creation Section */}
                        <div className="material-creation-section" style={{ marginTop: '25px', paddingTop: '25px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 className="section-title" style={{ margin: 0 }}>
                                    <PackagePlus size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> 
                                    Add New Stock/Material
                                </h3>
                                <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>These items will be permanently linked to this vendor in the Inventory.</p>
                            </div>
                            
                            <div className="sub-form-row">
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Material Name</label>
                                    <input type="text" placeholder="e.g. Copper Wire" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>SKU</label>
                                    <input type="text" placeholder="SKU-100" value={newMaterial.sku} onChange={e => setNewMaterial({...newMaterial, sku: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1.5 }}>
                                    <label>Category</label>
                                    <input type="text" name="category" placeholder="Enter Category (e.g., Electronics, Logistics, Packaging)" value={newMaterial.category} onChange={e => setNewMaterial({...newMaterial, category: e.target.value})} />
                                </div>
                            </div>
                            <div className="sub-form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Stock Qty</label>
                                    <input type="number" min="0" value={newMaterial.quantity} onChange={e => setNewMaterial({...newMaterial, quantity: parseInt(e.target.value) || 0})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Unit</label>
                                    <input type="text" placeholder="pcs, kg, m" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Price</label>
                                    <input type="number" min="0" step="0.01" value={newMaterial.price} onChange={e => setNewMaterial({...newMaterial, price: parseFloat(e.target.value) || 0})} />
                                </div>
                                <div className="form-group" style={{ flex: '0 0 auto', justifyContent: 'flex-end', paddingTop: '22px' }}>
                                    <button type="button" onClick={handleAddNewMaterialToList} className="btn-secondary" style={{ padding: '11px 20px', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', fontWeight: 600 }}>Add Item</button>
                                </div>
                            </div>

                            {/* Pending New Materials Table */}
                            {newMaterialsList.length > 0 && (
                                <div className="table-responsive" style={{ marginTop: '15px', border: '1px solid #c7d2fe', borderRadius: '8px', overflow: 'hidden' }}>
                                    <table className="dt-table" style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', background: '#eef2ff' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #c7d2fe' }}>
                                                <th style={{ padding: '8px' }}>SKU</th>
                                                <th style={{ padding: '8px' }}>Name</th>
                                                <th style={{ padding: '8px' }}>Category</th>
                                                <th style={{ padding: '8px' }}>Stock</th>
                                                <th style={{ padding: '8px' }}>Price</th>
                                                <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newMaterialsList.map((m, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #c7d2fe' }}>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{m.sku}</td>
                                                    <td style={{ padding: '8px' }}>{m.name}</td>
                                                    <td style={{ padding: '8px' }}>{m.category}</td>
                                                    <td style={{ padding: '8px' }}>{m.quantity} {m.unit}</td>
                                                    <td style={{ padding: '8px' }}>${m.price}</td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button type="button" onClick={() => removeNewMaterialFromList(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate('/vendors')}>
                                <X size={18} /> Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                <Save size={18} /> {isLoading ? 'Saving...' : 'Register Vendor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; padding: 25px; }
                
                .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 20px; }
                
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .sub-form-row { display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
                
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                
                .form-group input, .form-group select {
                    padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; color: #0f172a; font-size: 14px; outline: none; transition: all 0.2s;
                }
                .form-group input:focus, .form-group select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); background: #ffffff; }
                .form-group input::placeholder { color: #94a3b8; }
                
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='gray' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
                .btn-cancel { display: flex; align-items: center; gap: 8px; background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-cancel:hover { background: #f8fafc; color: #0f172a; border-color: #94a3b8; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; background: #6366f1; color: #ffffff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s; }
                .btn-primary:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                .btn-back { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: #f1f5f9; color: #475569; border: none; cursor: pointer; transition: all 0.2s; }
                .btn-back:hover { background: #e2e8f0; color: #0f172a; }

                @media (max-width: 768px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .sub-form-row { flex-direction: column; }
                    .module-container { padding: 15px; }
                    .form-wrapper { padding: 20px !important; }
                }
            `}</style>
        </div>
    );
};

export default AddVendor;
