import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import DataTable from '../components/Dashboard/DataTable';
import { ShoppingCart, Plus, Filter, Search, Download } from 'lucide-react';

const ERP = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [formData, setFormData] = useState({
        customer: '',
        status: 'Pending',
        type: 'Sales',
        items: [{ material: '', quantity: 1, price: 0 }]
    });

    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = async () => {
        try {
            const [ordersRes, customersRes, materialsRes] = await Promise.all([
                API.get('/orders'),
                API.get('/customers'),
                API.get('/materials')
            ]);
            setOrders(ordersRes.data);
            setCustomers(customersRes.data);
            setMaterials(materialsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            const totalAmount = calculateTotal();
            await API.post('/orders', { ...formData, totalAmount });
            setShowModal(false);
            setFormData({ customer: '', status: 'Pending', type: 'Sales', items: [{ material: '', quantity: 1, price: 0 }] });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating order');
        }
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { material: '', quantity: 1, price: 0 }] });
    };

    const handleApprove = async (id) => {
        try {
            await API.put(`/orders/${id}/status`, { status: 'Approved' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving order');
        }
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const filteredOrders = statusFilter === 'All' 
        ? orders 
        : orders.filter(o => o.status === statusFilter);

    return (
        <div className="module-container">
            <header className="module-header glass-card">
                <div>
                    <h1 className="title-gradient">Order Management (ERP)</h1>
                    <p className="text-muted">Track procurement, logistics, and fulfillment cycles.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary flex-center gap-10" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={18} /> Filters
                    </button>
                    <button className="btn-primary flex-center gap-10" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> Create New Order
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="filter-bar glass-card animate-slide-down">
                    <div className="filter-group">
                        <label>Order Status:</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Orders</option>
                            <option value="Awaiting Approval">Awaiting Approval</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="glass-card modal-content animate-pop erp-modal">
                        <div className="modal-header">
                            <h2>Draft New Order</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateOrder} className="modal-form">
                            <div className="form-group">
                                <label>Select Customer</label>
                                <select required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})}>
                                    <option value="">Select Customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="items-section">
                                <label>Order Items</label>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <select 
                                            required 
                                            value={item.material} 
                                            onChange={e => {
                                                const mat = materials.find(m => m._id === e.target.value);
                                                const newItems = [...formData.items];
                                                newItems[index] = { ...newItems[index], material: e.target.value, price: mat?.price || 0 };
                                                setFormData({...formData, items: newItems});
                                            }}
                                        >
                                            <option value="">Select Material...</option>
                                            {materials.map(m => <option key={m._id} value={m._id}>{m.name} (${m.price})</option>)}
                                        </select>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required 
                                            value={item.quantity} 
                                            onChange={e => {
                                                const newItems = [...formData.items];
                                                newItems[index].quantity = parseInt(e.target.value);
                                                setFormData({...formData, items: newItems});
                                            }}
                                        />
                                        <span className="item-subtotal">${(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                <button type="button" className="text-btn mt-10" onClick={addItem}>+ Add Another Item</button>
                            </div>

                            <div className="order-summary-box glass-card">
                                <span>Grand Total:</span>
                                <strong>${calculateTotal().toLocaleString()}</strong>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Confirm Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="module-content">
                <div className="glass-card table-wrapper">
                    <DataTable 
                        title="Active Orders"
                        headers={['Order ID', 'Customer', 'Amount', 'Date', 'Status', 'Actions']}
                        data={filteredOrders}
                        renderRow={(ord) => (
                            <>
                                <td><span className="id-tag">{ord.orderNumber}</span></td>
                                <td>{ord.customer?.name || 'Walk-in'}</td>
                                <td><strong>${ord.totalAmount?.toLocaleString()}</strong></td>
                                <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                <td><span className={`status-pill ${ord.status.toLowerCase().replace(/ /g, '-')}`}>{ord.status}</span></td>
                                <td>
                                    {isAdmin && ord.status === 'Awaiting Approval' && (
                                        <button className="btn-approve" onClick={() => handleApprove(ord._id)}>Approve</button>
                                    )}
                                </td>
                            </>
                        )}
                    />
                </div>
            </div>            <style jsx="true">{`
                .module-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; padding: 25px; gap: 20px; }
                .header-actions { display: flex; gap: 12px; }
                .table-wrapper { padding: 20px; overflow-x: auto; -webkit-overflow-scrolling: touch; }
                .id-tag { color: var(--primary); font-family: monospace; font-weight: 700; }
                .status-pill.awaiting-approval { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-pill.confirmed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-pill.shipped { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .status-pill.delivered { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }
                .status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .btn-approve { background: var(--success); color: white; padding: 4px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; transition: 0.3s; }
                .btn-approve:hover { transform: scale(1.05); filter: brightness(1.1); }

                /* Filter Bar */
                .filter-bar { padding: 15px 25px; margin-bottom: 25px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
                .filter-group { display: flex; align-items: center; gap: 12px; }
                .filter-group label { font-size: 14px; font-weight: 600; color: var(--text-muted); }
                .filter-group select { padding: 8px 15px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 6px; color: white; min-width: 150px; }
                .filter-group select option { background: #1e293b; color: white; }

                /* Modal & ERP Forms */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 20px; }
                .modal-content { width: 100%; max-width: 700px; padding: 30px; position: relative; max-height: 90vh; overflow-y: auto; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
                .modal-form { display: flex; flex-direction: column; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
                .form-group select, .form-group input { padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; color: white; width: 100%; }
                .form-group select option { background: #1e293b; color: white; }
                
                .items-section { border: 1px solid var(--border); padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 15px; }
                .item-row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 15px; align-items: center; }
                .item-subtotal { font-weight: 700; color: var(--primary); text-align: right; }
                
                .order-summary-box { padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; font-size: 18px; gap: 15px; }
                .order-summary-box strong { color: var(--primary); font-size: 24px; }
                
                .modal-actions { display: flex; justify-content: flex-end; gap: 15px; margin-top: 10px; }
                .btn-cancel { background: transparent; color: white; border: 1px solid var(--border); padding: 12px 25px; border-radius: 8px; font-weight: 600; }
                
                .text-btn { background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; padding: 0; font-size: 14px; }
                .mt-10 { margin-top: 10px; }
                
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                
                .animate-slide-down { animation: slideDown 0.3s ease-out; overflow: hidden; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 200px; } }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                @media (max-width: 768px) {
                    .module-header { flex-direction: column; align-items: flex-start; padding: 20px; }
                    .header-actions { width: 100%; flex-direction: column; }
                    .header-actions button { width: 100%; }
                    .item-row { grid-template-columns: 1fr; gap: 10px; padding-bottom: 15px; border-bottom: 1px solid var(--border); }
                    .item-subtotal { text-align: left; }
                    .order-summary-box { flex-direction: column; align-items: flex-start; }
                    .order-summary-box strong { font-size: 20px; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; }
                    .table-wrapper { padding: 10px; }
                }
            `}</style>

        </div>
    );
};

export default ERP;
