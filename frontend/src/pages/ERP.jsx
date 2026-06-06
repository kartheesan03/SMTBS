import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
    ShoppingCart, Plus, Filter, Search, Download, ChevronRight, 
    FileText, UserPlus, DollarSign, Calendar
} from 'lucide-react';

const ERP = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [formData, setFormData] = useState({
        customer: '',
        vendor: '',
        status: 'Pending',
        orderType: 'sales',
        items: [{ material: '', quantity: 1, price: 0 }]
    });

    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [erpStats, setErpStats] = useState({
        openOrders: 0,
        approvedOrders: 0,
        pendingInvoices: 18,
        totalExpenses: '₹1.25 Cr',
        totalPurchaseOrders: 0,
        orderSummary: []
    });

    const fetchData = async () => {
        try {
            const [ordersRes, leadsRes, customersRes, materialsRes, statsRes, vendorsRes] = await Promise.all([
                API.get('/orders'),
                API.get('/leads'),
                API.get('/customers'),
                API.get('/materials'),
                API.get('/erp/stats'),
                API.get('/vendors')
            ]);
            setOrders(ordersRes.data);
            if (statsRes.data) {
                setErpStats(statsRes.data);
            }
            setVendors(vendorsRes.data);
            
            const mappedCustomers = (Array.isArray(customersRes.data) ? customersRes.data : [])
                .map(c => ({ ...c, customerModel: 'Customer' }));
            
            setCustomers(mappedCustomers);
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
            if (formData.orderType === 'sales') {
                const custExists = customers.find(c => String(c.id || c._id) === String(formData.customer));
                if (!custExists) {
                    alert("Selected customer/material does not exist.");
                    return;
                }
            }

            for (const item of formData.items) {
                const matExists = materials.find(m => String(m.id || m._id) === String(item.material));
                if (!matExists) {
                    alert("Selected customer/material does not exist.");
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
            console.log("ORDER PAYLOAD:", payload);

            await API.post('/orders', payload);
            setShowModal(false);
            setFormData({ customer: '', vendor: '', status: 'Pending', orderType: 'sales', items: [{ material: '', quantity: 1, price: 0 }] });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating order');
        }
    };

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { material: '', quantity: 1, price: 0 }] });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/orders/${id}/status`, { status: newStatus });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating order status');
        }
    };

    const handleApprove = async (id) => {
        await handleStatusChange(id, 'Approved');
    };

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const filteredOrders = statusFilter === 'All' 
        ? orders 
        : orders.filter(o => o.status === statusFilter);

    // Purchase Order summary donut data from API
    const poSummaryData = erpStats.orderSummary && erpStats.orderSummary.length > 0 ? erpStats.orderSummary : [
        { name: 'Draft', value: 0, percentage: '0%', color: '#2563eb' },
        { name: 'Approved', value: 0, percentage: '0%', color: '#10b981' },
        { name: 'Received', value: 0, percentage: '0%', color: '#f59e0b' },
        { name: 'Cancelled', value: 0, percentage: '0%', color: '#ef4444' }
    ];

    const recentPurchaseOrders = orders
        .filter(o => o.orderType === 'purchase' || o.vendor)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    return (
        <div className="erp-workspace">
            {/* Breadcrumb */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">ERP Operations</span>
            </div>

            <header className="module-header">
                <div>
                    <h1 className="header-title">ERP Operations</h1>
                    <p className="header-subtitle">Handle procurement, inventory, orders, vendors, finances and analytics.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary-light flex-center gap-8" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    {['Admin', 'HR', 'Manager', 'Sales'].includes(userInfo.role) && (
                        <button className="btn-primary-blue flex-center gap-8" onClick={() => setShowModal(true)}>
                            <Plus size={16} /> Create Order
                        </button>
                    )}
                </div>
            </header>

            {/* 4 Stats Cards */}
            <section className="erp-metrics-grid">
                <div className="erp-metric-card">
                    <span className="label" title="Includes both Sales & Purchase orders">Open Orders (All)</span>
                    <span className="value">{erpStats.openOrders}</span>
                </div>
                <div className="erp-metric-card">
                    <span className="label">Total Purchase Orders</span>
                    <span className="value">{erpStats.totalPurchaseOrders}</span>
                </div>
                <div className="erp-metric-card border-orange">
                    <span className="label text-orange">Pending Invoices</span>
                    <span className="value text-orange">{erpStats.pendingInvoices}</span>
                </div>
                <div className="erp-metric-card border-teal">
                    <span className="label text-teal">Total Expenses</span>
                    <span className="value text-teal">{erpStats.totalExpenses}</span>
                </div>
            </section>

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Donut summary */}
                <div className="chart-card">
                    <h3 className="card-title">Purchase Order Summary</h3>
                    <div className="distribution-container">
                        <div className="donut-chart-box">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie 
                                        data={poSummaryData}
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {poSummaryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-label-box">
                                <span className="donut-val">{poSummaryData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                                <span className="donut-lbl">Total</span>
                            </div>
                        </div>
                        <div className="distribution-legend">
                            {poSummaryData.map((dept, idx) => (
                                <div key={idx} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: dept.color }}></span>
                                    <span className="name">{dept.name}</span>
                                    <span className="val">{dept.value} ({dept.percentage})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Purchase Orders */}
                <div className="chart-card">
                    <h3 className="card-title">Recent Purchase Orders</h3>
                    <div className="po-list">
                        <table className="po-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Vendor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPurchaseOrders.map((po, idx) => (
                                    <tr key={idx}>
                                        <td><code className="po-code">{po.orderNumber}</code></td>
                                        <td className="vendor-name-cell">{po.vendor?.name || 'Walk-in Vendor'}</td>
                                        <td>
                                            <span className={`po-status-badge ${po.status.toLowerCase().replace(/ /g, '-')}`}>
                                                {po.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Active Orders List */}
            {showFilters && (
                <div className="filter-panel animate-slide-down">
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

            <div className="table-card">
                <h3 className="card-title p-16">All Active Orders</h3>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Type</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Last Updated By</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((ord) => {
                            const isEmp = userInfo.role === 'Employee';
                            const isSalesRole = userInfo.role === 'Sales';
                            
                            const displayStatus = (status) => {
                                const pendingStates = ['Pending', 'Awaiting Approval', 'Awaiting Stock Check'];
                                if (pendingStates.includes(status)) {
                                    return 'Pending';
                                }
                                return status;
                            };
                            
                            const currentStatusText = displayStatus(ord.status);
                            const statusClass = currentStatusText.toLowerCase().replace(/ /g, '-');
                            
                            return (
                                <tr key={ord._id}>
                                    <td><code className="po-code">{ord.orderNumber}</code></td>
                                    <td>
                                        {ord.orderType === 'purchase' ? (
                                            <span className="order-type-badge purchase">Purchase Order</span>
                                        ) : (
                                            <span className="order-type-badge sales">Sales Order</span>
                                        )}
                                    </td>
                                    <td className="vendor-name-cell">{ord.customer?.name || ord.vendor?.name || 'Walk-in'}</td>
                                    <td><strong>${ord.totalAmount?.toLocaleString()}</strong></td>
                                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {ord.updatedBy?.name || ord.createdBy?.name || 'System'}
                                    </td>
                                    <td>
                                        {isAdmin ? (
                                            <select 
                                                value={displayStatus(ord.status)} 
                                                onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                                                className={`status-select-premium ${statusClass}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Ready for Delivery">Ready for Delivery</option>
                                                <option value="Low Stock Alert">Low Stock Alert</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        ) : (
                                            <span className={`status-badge-inline ${statusClass}`}>{displayStatus(ord.status)}</span>
                                        )}
                                    </td>
                                    <td>
                                        {/* Employee Workflow Stock Check Controls */}
                                        {(isEmp || isAdmin) && ord.status === 'Awaiting Stock Check' && (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn-workflow-confirm" onClick={() => handleStatusChange(ord._id, 'Ready for Delivery')}>Confirm Stock</button>
                                                <button className="btn-workflow-alert" onClick={() => handleStatusChange(ord._id, 'Low Stock Alert')}>Alert Low Stock</button>
                                            </div>
                                        )}

                                        {/* Sales Deliver Control */}
                                        {(isSalesRole || isAdmin) && ord.status === 'Ready for Delivery' && (
                                            <button className="btn-workflow-deliver" onClick={() => handleStatusChange(ord._id, 'Delivered')}>Deliver to Customer</button>
                                        )}

                                        {/* General Approve Button for All roles */}
                                        {(ord.status === 'Pending' || ord.status === 'Awaiting Approval' || ord.status === 'Awaiting Stock Check') && (
                                            <button className="btn-approve" onClick={() => handleApprove(ord._id)}>Approve</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop">
                        <div className="modal-header">
                            <h2>Draft New Order</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCreateOrder} className="modal-form">
                            <div className="form-group">
                                <label>Order Type</label>
                                <select required value={formData.orderType} onChange={e => {
                                    setFormData({...formData, orderType: e.target.value, customer: '', vendor: '', items: [{ material: '', quantity: 1, price: 0 }]});
                                }}>
                                    <option value="sales">Sales Order</option>
                                    <option value="purchase">Purchase Order</option>
                                </select>
                            </div>

                            {formData.orderType === 'sales' ? (
                                <div className="form-group">
                                    <label>Select Customer</label>
                                    <select required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})}>
                                        <option value="">Select Customer...</option>
                                        {customers.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.customerModel})</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Select Vendor</label>
                                    <select required value={formData.vendor} onChange={e => {
                                        setFormData({...formData, vendor: e.target.value, items: [{ material: '', quantity: 1, price: 0 }]});
                                    }}>
                                        <option value="">Select Vendor...</option>
                                        {vendors.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            )}
                            
                            <div className="items-section">
                                <label>Order Items</label>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <select 
                                            required 
                                            value={item.material} 
                                            onChange={e => {
                                                const mat = materials.find(m => String(m.id || m._id) === e.target.value);
                                                const newItems = [...formData.items];
                                                newItems[index] = { ...newItems[index], material: e.target.value, price: mat?.price || 0 };
                                                setFormData({...formData, items: newItems});
                                            }}
                                        >
                                            <option value="">Select Material...</option>
                                            {materials
                                                .filter(m => formData.orderType === 'sales' || !formData.vendor || String(m.vendor?.id || m.vendor?._id || m.vendor) === String(formData.vendor))
                                                .map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name} (${m.price})</option>)}
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
                                <button type="button" className="text-btn" onClick={addItem}>+ Add Another Item</button>
                            </div>

                            <div className="order-summary-box">
                                <span>Grand Total:</span>
                                <strong>${calculateTotal().toLocaleString()}</strong>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Confirm Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .erp-workspace {
                    padding: 24px;
                    background-color: var(--bg-body);
                    min-height: 100vh;
                    color: var(--text-primary);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .crumb:hover {
                    color: var(--primary);
                }
                
                .crumb.active {
                    color: var(--text-primary);
                    cursor: default;
                }
                
                .separator {
                    color: var(--text-muted);
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }
                
                .header-subtitle {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0;
                }
                
                .btn-primary-blue {
                    background: var(--primary);
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    display: inline-flex;
                    align-items: center;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-primary-blue:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }
                
                .btn-secondary-light {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    display: inline-flex;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .btn-secondary-light:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                    border-color: var(--border-hover);
                }

                /* Stats Cards styling */
                .erp-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .erp-metric-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    box-shadow: var(--shadow-sm);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .erp-metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .border-orange { border-bottom: 3px solid var(--warning); }
                .border-teal { border-bottom: 3px solid var(--success); }
                
                .erp-metric-card .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .erp-metric-card .value {
                    font-size: 28px;
                    font-weight: 800;
                    color: var(--text-primary);
                    line-height: 1;
                }
                
                .text-orange { color: var(--warning); }
                .text-teal { color: var(--success); }

                /* Charts Row */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1.2fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                }
                
                .card-title {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 20px 0;
                }
                
                .card-title.p-16 {
                    padding: 20px 20px 0 20px;
                }
                
                .distribution-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }
                
                .donut-chart-box {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    flex-shrink: 0;
                }
                
                .donut-label-box {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .donut-val {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--text-primary);
                }
                
                .donut-lbl {
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .distribution-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    flex: 1;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 13px;
                }
                
                .legend-item .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                
                .legend-item .name {
                    font-weight: 600;
                    color: var(--text-secondary);
                    flex: 1;
                }
                
                .legend-item .val {
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .po-list {
                    max-height: 200px;
                    overflow-y: auto;
                }
                
                .po-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .po-table th {
                    text-align: left;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 12px 16px;
                    border-bottom: 2px solid var(--border);
                    letter-spacing: 0.5px;
                }
                
                .po-table td {
                    padding: 12px 16px;
                    font-size: 14px;
                    color: var(--text-primary);
                    border-bottom: 1px dashed var(--border);
                }
                
                .po-code {
                    background: var(--primary-50);
                    color: var(--primary);
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-weight: 700;
                    font-size: 12px;
                }
                
                .vendor-name-cell {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .po-status-badge {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .po-status-badge.approved { background-color: var(--success-light); color: var(--success); }
                .po-status-badge.received { background-color: var(--primary-50); color: var(--primary); }
                .po-status-badge.draft { background-color: var(--bg-hover); color: var(--text-secondary); }

                /* Active Orders Table styling */
                .table-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    padding: 8px;
                    box-shadow: var(--shadow-sm);
                    overflow-x: auto;
                }
                
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .modern-table th {
                    text-align: left;
                    padding: 16px 20px;
                    color: var(--text-muted);
                    font-weight: 700;
                    font-size: 11px;
                    text-transform: uppercase;
                    border-bottom: 2px solid var(--border);
                    letter-spacing: 0.5px;
                }
                
                .modern-table td {
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    font-size: 14px;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                
                .modern-table tbody tr:hover td {
                    background-color: var(--bg-hover);
                }
                
                .order-type-badge {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .order-type-badge.purchase { background-color: rgba(59, 130, 246, 0.1); color: #3b82f6; } /* Blue/orange style */
                .order-type-badge.sales { background-color: rgba(16, 185, 129, 0.1); color: #10b981; } /* Green/purple style */

                .status-select-premium {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s;
                }
                .status-select-premium:focus {
                    border-color: var(--primary);
                }
                
                .status-badge-inline {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 6px 10px;
                    border-radius: 20px;
                    display: inline-block;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .status-badge-inline.pending { background-color: var(--warning-light); color: var(--warning); }
                .status-badge-inline.approved { background-color: var(--success-light); color: var(--success); }
                .status-badge-inline.confirmed { background-color: var(--success-light); color: var(--success); }
                .status-badge-inline.shipped { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.delivered { background-color: var(--success-light); color: var(--success); }
                .status-badge-inline.cancelled { background-color: var(--danger-light); color: var(--danger); }
                .status-badge-inline.awaiting-stock-check { background-color: var(--primary-50); color: var(--primary); }
                .status-badge-inline.ready-for-delivery { background-color: var(--success-light); color: var(--success); }
                .status-badge-inline.low-stock-alert { background-color: var(--danger-light); color: var(--danger); }
                
                .btn-approve {
                    background: var(--success-light);
                    color: var(--success);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-approve:hover {
                    background: color-mix(in srgb, var(--success) 20%, transparent);
                }

                .btn-workflow-confirm {
                    background: var(--success-light);
                    color: var(--success);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-workflow-confirm:hover { background: color-mix(in srgb, var(--success) 20%, transparent); }

                .btn-workflow-alert {
                    background: var(--danger-light);
                    color: var(--danger);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-workflow-alert:hover { background: color-mix(in srgb, var(--danger) 20%, transparent); }

                .btn-workflow-deliver {
                    background: var(--primary-50);
                    color: var(--primary);
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .btn-workflow-deliver:hover { background: color-mix(in srgb, var(--primary) 20%, transparent); }
                
                /* Filter Panel */
                .filter-panel {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    padding: 20px;
                    box-shadow: var(--shadow-sm);
                }
                
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .filter-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-secondary);
                }
                
                .filter-group select {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 10px 16px;
                    color: var(--text-primary);
                    min-width: 180px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .filter-group select:focus {
                    border-color: var(--primary);
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }
                
                .modal-content {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    width: 100%;
                    max-width: 650px;
                    padding: 32px;
                    box-shadow: var(--shadow-lg);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 16px;
                }
                
                .modal-header h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 20px;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .close-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }
                
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .form-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-secondary);
                }
                
                .form-group select, .form-group input {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 12px 16px;
                    color: var(--text-primary);
                    font-size: 14px;
                    width: 100%;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group select:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-50);
                    background: var(--bg-card);
                }
                .form-group select { appearance: none; padding-right: 40px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; }
                
                .items-section {
                    border: 1px solid var(--border);
                    padding: 20px;
                    border-radius: var(--radius-md, 12px);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: var(--bg-body);
                }
                
                .item-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 16px;
                    align-items: center;
                }
                
                .item-subtotal {
                    font-weight: 700;
                    color: var(--primary);
                    text-align: right;
                    font-size: 16px;
                }
                
                .order-summary-box {
                    padding: 16px 20px;
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md, 12px);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 16px;
                }
                
                .order-summary-box strong {
                    color: var(--primary);
                    font-size: 24px;
                    font-weight: 800;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .btn-cancel {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-cancel:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                    border-color: var(--border-hover);
                }
                
                .btn-save {
                    background: var(--primary);
                    color: #ffffff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    border: none;
                    cursor: pointer;
                    transition: 0.2s;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
                
                .btn-save:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }
                
                .text-btn {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-weight: 700;
                    cursor: pointer;
                    padding: 8px 0;
                    font-size: 14px;
                    text-align: left;
                    display: inline-block;
                }
                .text-btn:hover {
                    text-decoration: underline;
                }

                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-8 { gap: 8px; }

                .animate-pop { animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                .animate-slide-down { animation: slideDown 0.2s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .erp-metrics-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .item-row {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .item-subtotal {
                        text-align: left;
                    }
                    .order-summary-box {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                    .erp-workspace { padding: 16px; }
                }
                
                @media (max-width: 480px) {
                    .erp-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default ERP;
