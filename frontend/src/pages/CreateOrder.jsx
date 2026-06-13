import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const CreateOrder = () => {
    const navigate = useNavigate();
    const { userInfo } = useContext(AuthContext);

    const [customers, setCustomers] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    const [formData, setFormData] = useState({
        customer: '',
        status: 'Created',
        orderType: 'sales',
        items: [{ material: '', quantity: 1, price: 0 }],
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [customersRes, materialsRes] = await Promise.all([
                API.get('/customers'),
                API.get('/materials')
            ]);
            setCustomers(customersRes.data);
            setMaterials(materialsRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
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
            if (formData.orderType === 'sales') {
                const custExists = customers.find(c => String(c.id || c._id) === String(formData.customer));
                if (!custExists) {
                    alert("Selected customer does not exist.");
                    return;
                }
            }

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
            const selectedCust = customers.find(c => String(c.id || c._id) === String(formData.customer));

            const payload = {
                ...formData,
                customerModel: selectedCust?.customerModel || 'Customer',
                totalAmount
            };

            await API.post('/orders', payload);
            navigate('/orders'); // After successful order creation, redirect back to: /orders
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating order');
        }
    };

    return (
        <div className="erp-workspace">
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/erp')}>ERP Operations</span>
                <span className="separator">/</span>
                <span className="crumb active">Create Order</span>
            </div>

            <header className="module-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <button className="btn-icon" onClick={() => navigate('/orders')} style={{ background: 'var(--bg-hover)', borderRadius: '50%', padding: '8px' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="header-title" style={{ margin: 0 }}>Create Customer Sales Order</h1>
                    </div>
                    <p className="header-subtitle">Fill in the details to generate a new order.</p>
                </div>
            </header>

            <div className="module-content">
                <div className="glass-card" style={{ padding: '30px', maxWidth: '800px' }}>
                    <form onSubmit={handleCreateOrder} className="modal-form">
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Select Customer</label>
                            <select 
                                required 
                                value={formData.customer} 
                                onChange={e => setFormData({...formData, customer: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                            >
                                <option value="">Select Customer...</option>
                                {(!customers || customers.length === 0) ? (
                                    <option value="" disabled>No customers available</option>
                                ) : (
                                    customers.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.customerModel || 'Customer'})</option>)
                                )}
                            </select>
                        </div>
                        
                        <div className="items-section" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Order Items</label>
                            {formData.items.map((item, index) => (
                                <div key={index} className="item-row" style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'center' }}>
                                    <select 
                                        required 
                                        value={item.material} 
                                        style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                        onChange={e => {
                                            const mat = materials.find(m => String(m.id || m._id) === e.target.value);
                                            const newItems = [...formData.items];
                                            newItems[index] = { ...newItems[index], material: e.target.value, price: mat?.price || 0 };
                                            setFormData({...formData, items: newItems});
                                        }}
                                    >
                                        <option value="">Select Material...</option>
                                        {materials.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name} (${m.price})</option>)}
                                    </select>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        required 
                                        placeholder="Qty"
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                                        value={item.quantity} 
                                        onChange={e => {
                                            const newItems = [...formData.items];
                                            newItems[index].quantity = parseInt(e.target.value);
                                            setFormData({...formData, items: newItems});
                                        }}
                                    />
                                    <span className="item-subtotal" style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                            <button type="button" className="text-btn" onClick={addItem} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }}>
                                + Add Another Item
                            </button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Order Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.orderDate || ''} 
                                onChange={e => setFormData({...formData, orderDate: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label>Expected Delivery Date</label>
                            <input 
                                type="date" 
                                required 
                                value={formData.expectedDeliveryDate || ''} 
                                onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}
                            />
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
                            <strong style={{ fontSize: '20px', color: 'var(--primary)' }}>${calculateTotal().toLocaleString()}</strong>
                        </div>

                        <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn-cancel" onClick={() => navigate('/orders')} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-save"
                                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                                disabled={
                                    !formData.customer ||
                                    formData.items.length === 0 ||
                                    formData.items.some(i => !i.material || i.quantity <= 0) ||
                                    !formData.expectedDeliveryDate
                                }
                            >
                                Save/Create Order
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style jsx="true">{`
                .erp-workspace {
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
            `}</style>
        </div>
    );
};

export default CreateOrder;
