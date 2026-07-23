import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { User, Truck, Edit2, Plus, Trash2 } from 'lucide-react';

const CreateOrder = () => {
    const navigate = useNavigate();
    const { orderType } = useParams(); // 'sales' or 'purchase'
    const [searchParams] = useSearchParams();
    const customerId = searchParams.get('customerId');
    const vendorId = searchParams.get('vendorId');
    const { userInfo } = useContext(AuthContext);

    const [materials, setMaterials] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        items: [{ material: '', quantity: 1, price: 0 }],
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: ''
    });

    const isSales = orderType === 'sales';

    useEffect(() => {
        if (!['sales', 'purchase'].includes(orderType)) {
            navigate('/orders/select-type');
            return;
        }
        if (orderType === 'sales' && !customerId) {
            navigate('/erp/customers/select');
            return;
        }
        if (orderType === 'purchase' && !vendorId) {
            navigate('/erp/vendors/select');
            return;
        }
        fetchData();
    }, [orderType, customerId, vendorId]);

    const fetchData = async () => {
        try {
            if (isSales) {
                const [materialsRes, entityRes] = await Promise.all([
                    API.get('/materials'),
                    API.get(`/customers/${customerId}`)
                ]);
                setMaterials(materialsRes.data || []);
                setSelectedEntity(entityRes.data);
            } else {
                const [vendorMatsRes, entityRes] = await Promise.all([
                    API.get(`/vendors/${vendorId}/materials`),
                    API.get(`/vendors/${vendorId}`)
                ]);
                setMaterials(vendorMatsRes.data || []);
                setSelectedEntity(entityRes.data.vendor || entityRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load details. Redirecting...");
            navigate('/orders/select-type');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { material: '', quantity: 1, price: 0 }] });
    };

    const removeItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleCreateOrder = async () => {
        try {
            for (const item of formData.items) {
                const matExists = materials.find(m => String(m.id || m._id) === String(item.material));
                if (!matExists) {
                    toast.error("Selected material does not exist.");
                    return;
                }
                if (!item.quantity || item.quantity <= 0) {
                    toast.error("Invalid quantity.");
                    return;
                }
            }

            const totalAmount = calculateTotal();
            
            const payload = {
                ...formData,
                orderType,
                totalAmount,
                status: isSales ? 'Created' : 'Pending',
            };

            if (isSales) {
                payload.customer = selectedEntity.id || selectedEntity._id;
                payload.customerModel = selectedEntity.customerModel || 'Customer';
            } else {
                payload.vendor = selectedEntity.id || selectedEntity._id;
            }

            await API.post('/orders', payload);
            toast.success("Order Created Successfully!");
            navigate('/erp');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating order');
        }
    };

    if (loading) return <div className="flex-center" style={{minHeight:'100vh'}}><div className="loader"></div></div>;
    if (!selectedEntity) return null;

    return (
        <StandardPageLayout
            title={`Create ${isSales ? 'Sales' : 'Purchase'} Order`}
            subtitle="Fill in the details to generate a new order."
            breadcrumbs={[
                { label: 'ERP', path: '/erp' },
                { label: 'Create Order', path: '/orders/select-type' },
                { label: isSales ? 'Sales' : 'Purchase' }
            ]}
            onSave={handleCreateOrder}
            onCancel={() => navigate('/erp')}
            isEditMode={false}
            infoCard={
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '12px', background: isSales ? '#e0e7ff' : '#dcfce7', borderRadius: '50%', color: isSales ? '#4f46e5' : '#10b981' }}>
                        {isSales ? <User size={24} /> : <Truck size={24} />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>
                            {isSales ? (selectedEntity.company || selectedEntity.name) : selectedEntity.name}
                        </h4>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                            ID: {selectedEntity.id || selectedEntity._id} | {selectedEntity.email || 'No email provided'} | {selectedEntity.phone || 'No phone provided'}
                        </p>
                    </div>
                    <button 
                        type="button" 
                        onClick={() => navigate(isSales ? '/erp/customers/select' : '/erp/vendors/select')}
                        style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
                    >
                        <Edit2 size={14} /> Change {isSales ? 'Customer' : 'Vendor'}
                    </button>
                </div>
            }
        >
            <div className="standard-section">
                <div className="standard-section-header">Order Items</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#475569', fontWeight: 600 }}>Material / Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#475569', fontWeight: 600, width: '120px' }}>Quantity</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#475569', fontWeight: 600, width: '150px' }}>Unit Price (₹)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#475569', fontWeight: 600, width: '150px' }}>Total (₹)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.items.map((item, index) => (
                                <tr key={index} style={{ borderBottom: index === formData.items.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select 
                                            required 
                                            value={item.material} 
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                                            onChange={e => {
                                                const mat = materials.find(m => String(m.id || m._id) === e.target.value);
                                                const newItems = [...formData.items];
                                                newItems[index] = { ...newItems[index], material: e.target.value, price: mat?.price || 0 };
                                                setFormData({...formData, items: newItems});
                                            }}
                                        >
                                            <option value="">Select Material...</option>
                                            {(!isSales && materials.length === 0) ? (
                                                <option value="" disabled>No materials available for this vendor.</option>
                                            ) : (
                                                materials.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name} - ₹{m.price || 0}</option>)
                                            )}
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required 
                                            value={item.quantity} 
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', textAlign: 'right' }}
                                            onChange={e => {
                                                const newItems = [...formData.items];
                                                newItems[index] = { ...newItems[index], quantity: Number(e.target.value) };
                                                setFormData({...formData, items: newItems});
                                            }} 
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#475569' }}>
                                        {Number(item.price || 0).toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                                        {(item.quantity * item.price).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => formData.items.length > 1 ? removeItem(index) : null}
                                            disabled={formData.items.length === 1}
                                            style={{ background: 'none', border: 'none', color: formData.items.length === 1 ? '#cbd5e1' : '#ef4444', cursor: formData.items.length === 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#3b82f6', border: '1px dashed #bfdbfe', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        <Plus size={14} /> Add Another Item
                    </button>
                    <div style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#64748b' }}>Grand Total:</span>
                        <span style={{ fontWeight: 'bold', color: '#0f172a' }}>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="standard-section">
                <div className="standard-section-header">Order Logistics & Notes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Order Date *</label>
                        <input type="date" required value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Expected Delivery Date *</label>
                        <input type="date" required value={formData.expectedDeliveryDate} min={formData.orderDate} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Internal Notes</label>
                        <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Add any special instructions or remarks here..." style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default CreateOrder;
