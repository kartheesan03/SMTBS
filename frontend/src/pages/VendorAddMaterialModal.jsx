import React, { useState, useEffect } from "react";
import { X, Package, Search } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const VendorAddMaterialModal = ({ vendor, onClose, onSuccess }) => {
    const [mode, setMode] = useState('new'); // 'new' or 'existing'
    const [loading, setLoading] = useState(false);
    
    // Existing search
    const [searchQuery, setSearchQuery] = useState("");
    const [allMaterials, setAllMaterials] = useState([]);
    const [selectedMaterialId, setSelectedMaterialId] = useState("");
    const [supplierPrice, setSupplierPrice] = useState("");
    const [leadTime, setLeadTime] = useState("");

    // New Material Form
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "",
        quantity: 0,
        lowStockThreshold: 10,
        unit: "pcs",
        price: "",
        warehouse: "",
        shelf: ""
    });

    useEffect(() => {
        if (mode === 'existing') {
            fetchMaterials();
        }
    }, [mode]);

    const fetchMaterials = async () => {
        try {
            const { data } = await API.get('/materials');
            setAllMaterials(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateNew = async () => {
        if (!formData.name) {
            return toast.error("Material Name is required");
        }
        
        setLoading(true);
        try {
            // 1. Create the material
            const { data: newMaterial } = await API.post('/materials', {
                ...formData,
                vendorId: vendor.id || vendor._id // Legacy support
            });
            
            // 2. Link via Junction table (supplier-specific price if provided, else use global)
            await API.post(`/vendors/${vendor.id || vendor._id}/materials`, {
                materialId: newMaterial.id || newMaterial._id,
                supplierPrice: formData.price || 0,
                leadTime: leadTime || 7,
                minOrderQty: 1
            });
            
            toast.success("Material created and linked successfully");
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create material");
        } finally {
            setLoading(false);
        }
    };

    const handleLinkExisting = async () => {
        if (!selectedMaterialId) {
            return toast.error("Please select a material");
        }
        
        setLoading(true);
        try {
            await API.post(`/vendors/${vendor.id || vendor._id}/materials`, {
                materialId: selectedMaterialId,
                supplierPrice: supplierPrice || 0,
                leadTime: leadTime || 7,
                minOrderQty: 1
            });
            
            toast.success("Material linked successfully");
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to link material");
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = allMaterials.filter(m => 
        (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (m.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: '20px'
        }}>
            <div style={{
                background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Add Material</h2>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                            Supplier: <span style={{ fontWeight: 500, color: '#4f46e5' }}>{vendor.name} ({vendor.vendorCode})</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
                        <button 
                            onClick={() => setMode('new')}
                            style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'new' ? '#fff' : 'transparent', color: mode === 'new' ? '#0f172a' : '#64748b', fontWeight: mode === 'new' ? 600 : 500, borderRadius: '6px', cursor: 'pointer', boxShadow: mode === 'new' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                        >
                            Create New Material
                        </button>
                        <button 
                            onClick={() => setMode('existing')}
                            style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'existing' ? '#fff' : 'transparent', color: mode === 'existing' ? '#0f172a' : '#64748b', fontWeight: mode === 'existing' ? 600 : 500, borderRadius: '6px', cursor: 'pointer', boxShadow: mode === 'existing' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                        >
                            Link Existing Material
                        </button>
                    </div>

                    {mode === 'new' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="ui-grid-2">
                                <div className="form-group">
                                    <label>Material Name *</label>
                                    <input type="text" className="ui-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. MS Plate 10mm" />
                                </div>
                                <div className="form-group">
                                    <label>SKU / Barcode</label>
                                    <input type="text" className="ui-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="e.g. MS-PL-010" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" className="ui-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Steel Plates" />
                                </div>
                                <div className="form-group">
                                    <label>Unit of Measure</label>
                                    <select className="ui-input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="ton">Tons</option>
                                        <option value="ltr">Liters</option>
                                        <option value="mtr">Meters</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Initial Quantity</label>
                                    <input type="number" className="ui-input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Low Stock Threshold</label>
                                    <input type="number" className="ui-input" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Supplier Price (₹)</label>
                                    <input type="number" className="ui-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label>Lead Time (Days)</label>
                                    <input type="number" className="ui-input" value={leadTime} onChange={e => setLeadTime(e.target.value)} placeholder="e.g. 7" />
                                </div>
                                <div className="form-group">
                                    <label>Warehouse</label>
                                    <input type="text" className="ui-input" value={formData.warehouse} onChange={e => setFormData({...formData, warehouse: e.target.value})} placeholder="e.g. WH-A" />
                                </div>
                                <div className="form-group">
                                    <label>Shelf / Bin</label>
                                    <input type="text" className="ui-input" value={formData.shelf} onChange={e => setFormData({...formData, shelf: e.target.value})} placeholder="e.g. Rack 3" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label>Search Material</label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
                                    <input 
                                        type="text" 
                                        className="ui-input" 
                                        style={{ paddingLeft: '36px' }} 
                                        placeholder="Type to search..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                {filteredMaterials.map(m => (
                                    <div 
                                        key={m.id || m._id}
                                        onClick={() => setSelectedMaterialId(m.id || m._id)}
                                        style={{ 
                                            padding: '12px 16px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer',
                                            background: selectedMaterialId === (m.id || m._id) ? '#eff6ff' : '#fff',
                                            display: 'flex', alignItems: 'center', gap: '12px'
                                        }}
                                    >
                                        <Package size={16} color={selectedMaterialId === (m.id || m._id) ? '#3b82f6' : '#64748b'} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{m.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>{m.sku || 'No SKU'} • Current Qty: {m.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                                {filteredMaterials.length === 0 && (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No materials found.</div>
                                )}
                            </div>

                            <div className="ui-grid-2">
                                <div className="form-group">
                                    <label>Supplier Price (₹)</label>
                                    <input type="number" className="ui-input" value={supplierPrice} onChange={e => setSupplierPrice(e.target.value)} placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label>Lead Time (Days)</label>
                                    <input type="number" className="ui-input" value={leadTime} onChange={e => setLeadTime(e.target.value)} placeholder="e.g. 7" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn btn-primary" onClick={mode === 'new' ? handleCreateNew : handleLinkExisting} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Material'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorAddMaterialModal;
