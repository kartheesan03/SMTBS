import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/ui';
import { motion } from 'framer-motion';

const CreateQuotation = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we came from a specific customer
    const searchParams = new URLSearchParams(location.search);
    const defaultCustomerId = searchParams.get('customerId');

    const [customers, setCustomers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customer: defaultCustomerId || '',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default
        notes: '',
        termsAndConditions: 'Quotation valid until the specified date. All prices are final unless changed by mutual agreement.',
        items: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, matRes] = await Promise.all([
                    API.get('/customers'),
                    API.get('/materials')
                ]);
                setCustomers(custRes.data);
                
                // Only materials that have price
                const validMats = matRes.data.filter(m => m.price || m.cost);
                setMaterials(validMats);
            } catch (err) {
                toast.error('Failed to load customers or materials');
            }
        };
        fetchData();
    }, []);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { material: '', quantity: 1, unitPrice: 0, discountPercent: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        
        if (field === 'material') {
            const selectedMat = materials.find(m => m._id === value || m.id === value);
            if (selectedMat) {
                newItems[index].materialName = selectedMat.name;
                newItems[index].unitPrice = selectedMat.price || selectedMat.cost || 0;
            }
        }
        
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotals = () => {
        let subTotal = 0;
        formData.items.forEach(item => {
            const price = parseFloat(item.unitPrice) || 0;
            const qty = parseInt(item.quantity) || 0;
            const disc = parseFloat(item.discountPercent) || 0;
            subTotal += (price * qty) * (1 - (disc / 100));
        });
        return { subTotal, grandTotal: subTotal }; // Assuming 0 tax for now
    };

    const { subTotal, grandTotal } = calculateTotals();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.customer) return toast.error('Please select a customer');
        if (formData.items.length === 0) return toast.error('Please add at least one item');
        
        // Validate items
        const hasInvalidItem = formData.items.some(i => !i.material || !i.quantity || i.quantity < 1);
        if (hasInvalidItem) return toast.error('Please ensure all items have a material and quantity >= 1');

        setLoading(true);
        try {
            const customerObj = customers.find(c => c._id === formData.customer || c.id === formData.customer);
            
            const payload = {
                ...formData,
                customerName: customerObj?.name || 'Unknown Customer',
                subTotal,
                grandTotal
            };

            await API.post('/quotations', payload);
            toast.success('Quotation created successfully');
            navigate('/quotations');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create quotation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Create Quotation" 
                subtitle="Generate a new sales quote for a customer"
                actions={[
                    { label: 'Cancel', icon: ArrowLeft, onClick: () => navigate('/quotations') },
                    { label: 'Save Quote', icon: Save, primary: true, onClick: handleSubmit, disabled: loading }
                ]}
            />

            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="ui-card">
                <form onSubmit={handleSubmit} className="ui-form">
                    
                    <div className="ui-grid-2">
                        <div className="ui-form-group">
                            <label>Customer <span style={{color: 'red'}}>*</span></label>
                            <select 
                                value={formData.customer} 
                                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                                required
                            >
                                <option value="">Select a Customer</option>
                                {customers.map(c => (
                                    <option key={c._id || c.id} value={c._id || c.id}>{c.name} ({c.email})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="ui-form-group">
                            <label>Valid Until <span style={{color: 'red'}}>*</span></label>
                            <input 
                                type="date" 
                                value={formData.validUntil}
                                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="ui-form-group" style={{marginTop: '24px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                            <h3 style={{margin: 0, fontSize: '16px', fontWeight: '600'}}>Line Items</h3>
                            <button type="button" className="btn-secondary" onClick={handleAddItem} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px'}}>
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        {formData.items.length === 0 ? (
                            <div style={{padding: '30px', textAlign: 'center', background: '#F9FAFB', borderRadius: '0px', border: '1px dashed #D1D5DB'}}>
                                <p style={{color: '#6B7280', margin: 0}}>No items added yet. Click 'Add Item' to start building the quote.</p>
                            </div>
                        ) : (
                            <div style={{overflowX: 'auto'}}>
                                <table className="ui-table">
                                    <thead>
                                        <tr>
                                            <th>Material</th>
                                            <th style={{width: '100px'}}>Quantity</th>
                                            <th style={{width: '150px'}}>Unit Price (₹)</th>
                                            <th style={{width: '100px'}}>Discount (%)</th>
                                            <th style={{width: '150px'}}>Line Total (₹)</th>
                                            <th style={{width: '60px'}}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, index) => {
                                            const itemTotal = (item.quantity * item.unitPrice) * (1 - (item.discountPercent / 100));
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <select 
                                                            value={item.material} 
                                                            onChange={(e) => handleItemChange(index, 'material', e.target.value)}
                                                            required
                                                            style={{width: '100%', padding: '8px', borderRadius: '0px', border: '1px solid #D1D5DB'}}
                                                        >
                                                            <option value="">Select Material</option>
                                                            {materials.map(m => (
                                                                <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({m.sku})</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" min="1" 
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            style={{width: '100%', padding: '8px', borderRadius: '0px', border: '1px solid #D1D5DB'}}
                                                        />
                                                    </td>
                                                    <td style={{fontWeight: '500', color: '#475569'}}>
                                                        {Number(item.unitPrice || 0).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" min="0" max="100"
                                                            value={item.discountPercent}
                                                            onChange={(e) => handleItemChange(index, 'discountPercent', e.target.value)}
                                                            style={{width: '100%', padding: '8px', borderRadius: '0px', border: '1px solid #D1D5DB'}}
                                                        />
                                                    </td>
                                                    <td style={{fontWeight: '500'}}>{itemTotal.toFixed(2)}</td>
                                                    <td>
                                                        <button type="button" onClick={() => handleRemoveItem(index)} style={{background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px'}}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB'}}>
                        <div style={{width: '300px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                                <span style={{color: '#6B7280'}}>Subtotal:</span>
                                <span>₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                                <span style={{color: '#6B7280'}}>Tax (0%):</span>
                                <span>₹0.00</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #E5E7EB', fontWeight: 'bold', fontSize: '18px'}}>
                                <span>Grand Total:</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="ui-form-group" style={{marginTop: '24px'}}>
                        <label>Notes (Internal/External)</label>
                        <textarea 
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows={3}
                            placeholder="Add any specific notes for this quote..."
                        />
                    </div>

                </form>
            </motion.div>
        </PageContainer>
    );
};

export default CreateQuotation;
