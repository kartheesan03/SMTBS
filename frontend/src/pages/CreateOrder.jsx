import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, User, Truck, Edit } from 'lucide-react';

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
            if (orderType === 'sales') {
                const [materialsRes, entityRes] = await Promise.all([
                    API.get('/materials'),
                    API.get(`/customers/${customerId}`)
                ]);
                setMaterials(materialsRes.data);
                setSelectedEntity(entityRes.data);
            } else {
                const [vendorMatsRes, entityRes] = await Promise.all([
                    API.get(`/vendors/${vendorId}/materials`),
                    API.get(`/vendors/${vendorId}`)
                ]);
                setMaterials(vendorMatsRes.data);
                setSelectedEntity(entityRes.data.vendor);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load details. Redirecting...");
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

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            for (const item of formData.items) {
                const matExists = materials.find(m => String(m.id || m._id) === String(item.material));
                if (!matExists) {
                    alert("Selected material does not exist.");
                    return;
                }
                if (!item.quantity || item.quantity <= 0) {
                    alert("Invalid quantity.");
                    return;
                }
            }

            const totalAmount = calculateTotal();
            
            const payload = {
                ...formData,
                orderType,
                totalAmount,
                status: orderType === 'sales' ? 'Created' : 'Pending',
            };

            if (orderType === 'sales') {
                payload.customer = selectedEntity.id || selectedEntity._id;
                payload.customerModel = selectedEntity.customerModel || 'Customer';
            } else {
                payload.vendor = selectedEntity.id || selectedEntity._id;
            }

            await API.post('/orders', payload);
            navigate('/erp');
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating order');
        }
    };

    if (loading) return <div className="page-container">Loading...</div>;

    const isSales = orderType === 'sales';

    return (
        <div className="page-container">
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/erp')}>ERP Operations</span>
                <span className="separator">/</span>
                <span className="crumb" onClick={() => navigate('/orders/select-type')}>Select Order Type</span>
                <span className="separator">/</span>
                <span className="crumb" onClick={() => navigate(isSales ? '/erp/customers/select' : '/erp/vendors/select')}>
                    Select {isSales ? 'Customer' : 'Vendor'}
                </span>
                <span className="separator">/</span>
                <span className="crumb active">Create {isSales ? 'Sales' : 'Purchase'} Order</span>
            </div>

            <header className="module-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <button className="btn-icon" onClick={() => navigate(isSales ? '/erp/customers/select' : '/erp/vendors/select')} style={{ background: 'var(--bg-hover)', borderRadius: '50%', padding: '8px' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="header-title" style={{ margin: 0 }}>Create {isSales ? 'Customer Sales Order' : 'Vendor Purchase Order'}</h1>
                    </div>
                    <p className="header-subtitle">Fill in the details to generate a new order.</p>
                </div>
            </header>

            <div className="module-content" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Left Side: Form */}
                <div className="premium-card" style={{ flex: '1 1 600px', padding: '30px', maxWidth: '800px' }}>
                    
                    {/* Read-Only Entity Card */}
                    <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ background: isSales ? '#e0e7ff' : '#dcfce7', color: isSales ? '#4f46e5' : '#10b981', padding: '12px', borderRadius: '50%' }}>
                                {isSales ? <User size={24} /> : <Truck size={24} />}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0' }}>Selected {isSales ? 'Customer' : 'Vendor'}</h3>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{isSales ? (selectedEntity.company || selectedEntity.name) : selectedEntity.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', lineHeight: '1.5' }}>
                                    {isSales ? 'Customer' : 'Vendor'} ID: {selectedEntity.id || selectedEntity._id} <br/>
                                    Contact Person: {isSales ? selectedEntity.name : (selectedEntity.contactPerson || selectedEntity.name)} <br/>
                                    Email: {selectedEntity.email || 'N/A'} <br/>
                                    Phone: {selectedEntity.phone || 'N/A'} <br/>
                                    {!isSales && (
                                        <>Materials Supplied: {materials.length > 0 ? materials.map(m => m.name).join(', ') : 'None'}</>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button 
                            type="button" 
                            className="btn-secondary-light" 
                            onClick={() => navigate(isSales ? '/erp/customers/select' : '/erp/vendors/select')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                        >
                            <Edit size={12} /> Change
                        </button>
                    </div>

                    <form onSubmit={handleCreateOrder} className="modal-form">
                        
                        <div className="items-section" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Order Items</label>
                            {formData.items.map((item, index) => (
                                <div key={index} className="item-row" style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <select 
                                        required 
                                        value={item.material} 
                                        style={{ flex: 2, minWidth: '150px', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                        onChange={e => {
                                            const mat = materials.find(m => String(m.id || m._id) === e.target.value);
                                            const newItems = [...formData.items];
                                            newItems[index] = { ...newItems[index], material: e.target.value, price: mat?.price || 0 };
                                            setFormData({...formData, items: newItems});
                                        }}
                                    >
                                        <option value="">Select Material...</option>
                                        {(!isSales && materials.length === 0) ? (
                                            <option value="" disabled>No materials assigned to this vendor.</option>
                                        ) : (
                                            materials.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>)
                                        )}
                                    </select>
                                    
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty:</span>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required 
                                            placeholder="Qty"
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                            value={item.quantity} 
                                            onChange={e => {
                                                const newItems = [...formData.items];
                                                newItems[index].quantity = parseInt(e.target.value);
                                                setFormData({...formData, items: newItems});
                                            }}
                                        />
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Price:</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            required 
                                            placeholder="Unit Price"
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                            value={item.price} 
                                            onChange={e => {
                                                const newItems = [...formData.items];
                                                newItems[index].price = parseFloat(e.target.value) || 0;
                                                setFormData({...formData, items: newItems});
                                            }}
                                        />
                                    </div>

                                    <span className="item-subtotal" style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>
                                        ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                            <button type="button" className="text-btn" onClick={addItem} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>
                                + Add Another Item
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: '20px', flex: 1 }}>
                                <label>Order Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.orderDate || ''} 
                                    onChange={e => setFormData({...formData, orderDate: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '20px', flex: 1 }}>
                                <label>Expected Delivery Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.expectedDeliveryDate || ''} 
                                    onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Notes / Remarks</label>
                            <textarea 
                                rows="3" 
                                value={formData.notes || ''} 
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                placeholder="Enter any additional notes..."
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', resize: 'vertical' }}
                            />
                        </div>

                        <div className="order-summary-box" style={{ background: 'var(--bg-hover)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Grand Total:</span>
                            <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn-cancel" onClick={() => navigate('/erp')} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-save"
                                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                disabled={
                                    formData.items.length === 0 ||
                                    formData.items.some(i => !i.material || i.quantity <= 0) ||
                                    !formData.expectedDeliveryDate
                                }
                            >
                                Confirm Order
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <style jsx="true">{`
                .module-container {
                    padding: 24px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                }
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    margin-bottom: 20px;
                }
                .crumb { cursor: pointer; }
                .crumb.active { color: var(--text-primary); cursor: default; }
                .module-header { margin-bottom: 24px; }
                .header-title { font-size: 26px; font-weight: 800; }
                .header-subtitle { color: var(--text-muted); margin-top: 4px; }
                .glass-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                .btn-secondary-light {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .btn-secondary-light:hover {
                    background: var(--bg-card);
                }
            `}</style>
        </div>
    );
};

export default CreateOrder;
