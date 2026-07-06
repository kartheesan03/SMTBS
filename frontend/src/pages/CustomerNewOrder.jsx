import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, ShoppingCart, Calendar, FileText, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const CustomerNewOrder = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        items: [{ material: '', quantity: 1, price: 0, name: '' }],
        expectedDeliveryDate: '',
        notes: ''
    });

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const { data } = await API.get('/materials');
                setMaterials(data || []);
            } catch (err) {
                console.error('Error fetching materials:', err);
                setErrorMessage('Failed to load products/materials.');
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        if (field === 'material') {
            const selectedMat = materials.find(m => String(m.id || m._id) === String(value));
            newItems[index] = {
                ...newItems[index],
                material: value,
                name: selectedMat ? selectedMat.name : '',
                price: selectedMat ? selectedMat.price : 0
            };
        } else if (field === 'quantity') {
            newItems[index].quantity = Math.max(1, parseInt(value) || 1);
        }
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { material: '', quantity: 1, price: 0, name: '' }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Validation
            const invalidItem = formData.items.find(item => !item.material || item.quantity <= 0);
            if (invalidItem) {
                setErrorMessage('Please select a product/material and enter a valid quantity for all rows.');
                setSubmitLoading(false);
                return;
            }

            if (!formData.expectedDeliveryDate) {
                setErrorMessage('Expected Delivery Date is required.');
                setSubmitLoading(false);
                return;
            }

            const payload = {
                items: formData.items.map(i => ({
                    material: i.material,
                    quantity: i.quantity,
                    price: i.price
                })),
                totalAmount: calculateTotal(),
                expectedDeliveryDate: formData.expectedDeliveryDate,
                notes: formData.notes,
                orderDate: new Date().toISOString().split('T')[0]
            };

            await API.post('/orders/customer', payload);
            
            setSuccessMessage('Order created successfully!');
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error('Error creating customer order:', err);
            const msg = err.response?.data?.message || 'Error occurred while creating order.';
            setErrorMessage(msg);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading catalog details...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
            <header className="module-header glass-card">
                <div className="header-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button className="rd-back-btn icon-only" onClick={() => navigate('/')}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1>Create New Order</h1>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Select materials and configure your delivery request.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error/Success Banner */}
            {successMessage && (
                <div className="alert alert-success">
                    <CheckCircle2 size={18} />
                    <span>{successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger">
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="bento-grid">
                {/* Form Card (Span 8) */}
                <div className="bento-card form-card" style={{ gridColumn: 'span 8' }}>
                    <div className="card-header">
                        <h3><ShoppingCart size={18} /> Order Details</h3>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Items Rows */}
                        <div className="items-list">
                            {formData.items.map((item, index) => (
                                <div key={index} className="item-row">
                                    <div className="form-group select-group">
                                        <label>Select Product / Material</label>
                                        <select
                                            value={item.material}
                                            onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                                            required
                                        >
                                            <option value="">Select a material...</option>
                                            {materials.map(m => (
                                                <option key={m.id || m._id} value={m.id || m._id}>
                                                    {m.name} (${m.price}/unit)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group qty-group">
                                        <label>Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="price-display">
                                        <span className="price-label">Unit Price</span>
                                        <span className="price-val">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className="price-display">
                                        <span className="price-label">Subtotal</span>
                                        <span className="price-val">${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-delete-row"
                                        onClick={() => removeItem(index)}
                                        disabled={formData.items.length === 1}
                                        title="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Another Button */}
                        <button type="button" className="btn-add-item" onClick={addItem}>
                            <Plus size={16} /> Add Another Item
                        </button>

                        <hr className="divider-line" />

                        {/* Order Options */}
                        <div className="options-grid">
                            <div className="form-group">
                                <label><Calendar size={14} style={{ marginRight: '6px' }} /> Expected Delivery Date</label>
                                <input
                                    type="date"
                                    value={formData.expectedDeliveryDate}
                                    onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label><FileText size={14} style={{ marginRight: '6px' }} /> Notes / Requirements</label>
                                <textarea
                                    rows="3"
                                    placeholder="Add any specific delivery instructions, location remarks, or package specifications..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Submit Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => navigate('/')}
                                disabled={submitLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={submitLoading || formData.items.some(i => !i.material)}
                            >
                                {submitLoading ? 'Submitting Order...' : 'Submit Order'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Summary Card (Span 4) */}
                <div className="bento-card summary-card" style={{ gridColumn: 'span 4' }}>
                    <div className="card-header">
                        <h3>Order Summary</h3>
                    </div>

                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Total Items</span>
                            <strong>{formData.items.reduce((acc, curr) => acc + (curr.material ? curr.quantity : 0), 0)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>Item Types</span>
                            <strong>{formData.items.filter(i => i.material).length}</strong>
                        </div>
                        <div className="summary-row highlight">
                            <span>Estimated Total</span>
                            <span className="total-amount">${calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="info-box">
                        <p><strong>Note:</strong> Once submitted, your order status will be tracked as "Pending Approval" until sales representatives review stock availability.</p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; color: var(--text-primary); max-width: 1400px; margin: 0 auto; }
                .module-header { margin-bottom: 24px; padding: 24px; border-radius: 16px; }
                .header-top { display: flex; justify-content: space-between; align-items: center; }
                .header-top h1 { margin: 0; font-size: 26px; font-weight: 800; }
                
                .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; color: var(--text-secondary); }
                .loader { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                }

                .bento-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                }

                .card-header {
                    margin-bottom: 24px;
                    padding-bottom: 15px;
                    border-bottom: 1px dashed var(--border);
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--text-primary);
                }

                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .item-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 16px;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 16px;
                    position: relative;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .form-group select,
                .form-group input,
                .form-group textarea {
                    padding: 12px 16px;
                    border: 1px solid var(--border);
                    background: var(--bg-card);
                    color: var(--text-primary);
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-group select:focus,
                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--primary);
                }

                .select-group { flex: 2; min-width: 200px; }
                .qty-group { width: 100px; }

                .price-display {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 6px;
                    min-width: 90px;
                    padding-bottom: 12px;
                }
                .price-label {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }
                .price-val {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .btn-delete-row {
                    background: transparent;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    padding: 10px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                    margin-bottom: 4px;
                }
                .btn-delete-row:hover:not(:disabled) {
                    background: rgba(239, 68, 68, 0.1);
                }
                .btn-delete-row:disabled {
                    color: var(--text-muted);
                    cursor: not-allowed;
                    opacity: 0.5;
                }

                .btn-add-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: 1px dashed var(--border);
                    color: var(--primary);
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 8px;
                    transition: all 0.2s;
                }
                .btn-add-item:hover {
                    background: var(--bg-hover);
                    border-color: var(--primary);
                }

                .divider-line {
                    border: none;
                    border-top: 1px solid var(--border);
                    margin: 24px 0;
                }

                .options-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .options-grid .full-width {
                    grid-column: span 2;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 16px;
                }

                .summary-details {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .summary-row.highlight {
                    border-top: 1px dashed var(--border);
                    padding-top: 16px;
                    margin-top: 8px;
                    color: var(--text-primary);
                }
                .total-amount {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--primary);
                }

                .info-box {
                    background: var(--bg-body);
                    border-left: 4px solid var(--primary);
                    padding: 16px;
                    border-radius: 8px;
                    margin-top: 24px;
                    font-size: 13px;
                    line-height: 1.5;
                    color: var(--text-secondary);
                }

                .alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 24px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    font-weight: 600;
                }
                .alert-success {
                    background: rgba(34, 197, 94, 0.1);
                    color: #16a34a;
                    border: 1px solid rgba(34, 197, 94, 0.2);
                }
                .alert-danger {
                    background: rgba(239, 68, 68, 0.1);
                    color: #dc2626;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .btn-primary {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent);
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px color-mix(in srgb, var(--primary) 40%, transparent);
                }
                .btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }
                .btn-secondary {
                    background: var(--bg-body);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                    padding: 12px 24px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-secondary:hover {
                    background: var(--bg-hover);
                }

                @media (max-width: 1024px) {
                    .bento-card { grid-column: span 12 !important; }
                }

                @media (max-width: 768px) {
                    .item-row {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .qty-group { width: 100%; }
                    .price-display { padding-bottom: 0; }
                    .options-grid .full-width,
                    .options-grid > div {
                        grid-column: span 2;
                    }
                }
            `}</style>
        </div>
    );
};

export default CustomerNewOrder;
