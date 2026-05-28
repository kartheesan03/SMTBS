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
        status: 'Pending',
        type: 'Sales',
        items: [{ material: '', quantity: 1, price: 0 }]
    });

    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const fetchData = async () => {
        try {
            const [ordersRes, leadsRes, materialsRes] = await Promise.all([
                API.get('/orders'),
                API.get('/leads'),
                API.get('/materials')
            ]);
            setOrders(ordersRes.data);
            setCustomers((Array.isArray(leadsRes.data) ? leadsRes.data : [])
                .map(l => ({ ...l, customerModel: 'Lead' })));
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
            const selectedCust = customers.find(c => c._id === formData.customer);
            
            await API.post('/orders', { 
                ...formData, 
                customerModel: selectedCust?.customerModel || 'Customer',
                totalAmount 
            });
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

    // Mock/Dynamic stats based on reference image
    const openOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Awaiting Approval').length || 89;
    const totalVendors = 45;
    const pendingInvoices = 18;
    const totalExpensesVal = "₹1.25 Cr";

    // Purchase Order summary donut data
    const poSummaryData = [
        { name: 'Draft', value: 15, percentage: '16.9%', color: '#2563eb' },
        { name: 'Approved', value: 40, percentage: '44.9%', color: '#10b981' },
        { name: 'Received', value: 25, percentage: '28.1%', color: '#f59e0b' },
        { name: 'Cancelled', value: 9, percentage: '10.1%', color: '#ef4444' }
    ];

    const recentPurchaseOrders = [
        { id: `PO-${new Date().getFullYear()}-126`, vendor: 'ABC Traders', status: 'Approved' },
        { id: `PO-${new Date().getFullYear()}-125`, vendor: 'Global Supplies', status: 'Received' },
        { id: `PO-${new Date().getFullYear()}-124`, vendor: 'Bulbous Pvt Ltd', status: 'Received' },
        { id: `PO-${new Date().getFullYear()}-123`, vendor: 'Steel Corp', status: 'Draft' }
    ];

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
                    <span className="label">Open Orders</span>
                    <span className="value">{openOrdersCount}</span>
                </div>
                <div className="erp-metric-card">
                    <span className="label">Total Vendors</span>
                    <span className="value">{totalVendors}</span>
                </div>
                <div className="erp-metric-card border-orange">
                    <span className="label text-orange">Pending Invoices</span>
                    <span className="value text-orange">{pendingInvoices}</span>
                </div>
                <div className="erp-metric-card border-teal">
                    <span className="label text-teal">Total Expenses</span>
                    <span className="value text-teal">{totalExpensesVal}</span>
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
                                <span className="donut-val">{openOrdersCount}</span>
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
                                        <td><code className="po-code">{po.id}</code></td>
                                        <td className="vendor-name-cell">{po.vendor}</td>
                                        <td>
                                            <span className={`po-status-badge ${po.status.toLowerCase()}`}>
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
                    background-color: #f1f5f9;
                    min-height: 100vh;
                    color: var(--dash-text-main);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .breadcrumb-nav {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--dash-text-muted);
                }
                
                .crumb {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                
                .crumb:hover {
                    color: #2563eb;
                }
                
                .crumb.active {
                    color: #0f172a;
                    cursor: default;
                }
                
                .separator {
                    color: #94a3b8;
                }
                
                .module-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }
                
                .header-subtitle {
                    font-size: 13px;
                    color: var(--dash-text-muted);
                    margin: 0;
                }
                
                .btn-primary-blue {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                    display: inline-flex;
                    align-items: center;
                }
                
                .btn-primary-blue:hover {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }
                
                .btn-secondary-light {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    padding: 10px 16px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                    display: inline-flex;
                    align-items: center;
                }
                
                .btn-secondary-light:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }

                /* Stats Cards styling */
                .erp-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                
                .erp-metric-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .border-orange { border-color: #fef3c7; }
                .border-teal { border-color: #ccfbf1; }
                
                .erp-metric-card .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--dash-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                
                .erp-metric-card .value {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1;
                }
                
                .text-orange { color: #f59e0b; }
                .text-teal { color: #0d9488; }

                /* Charts Row */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1.2fr;
                    gap: 20px;
                }
                
                .chart-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .card-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                }
                
                .card-title.p-16 {
                    padding: 16px 16px 0 16px;
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
                    font-size: 22px;
                    font-weight: 800;
                    color: #0f172a;
                }
                
                .donut-lbl {
                    font-size: 10px;
                    color: var(--dash-text-muted);
                    font-weight: 600;
                }
                
                .distribution-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex: 1;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    font-size: 11px;
                }
                
                .legend-item .dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    margin-right: 8px;
                    flex-shrink: 0;
                }
                
                .legend-item .name {
                    font-weight: 600;
                    color: #475569;
                    flex: 1;
                }
                
                .legend-item .val {
                    font-weight: 700;
                    color: #0f172a;
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
                    color: #64748b;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 8px 12px;
                    border-bottom: 2px solid #f1f5f9;
                }
                
                .po-table td {
                    padding: 10px 12px;
                    font-size: 13px;
                    color: #334155;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .po-code {
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-weight: 700;
                }
                
                .vendor-name-cell {
                    font-weight: 600;
                    color: #0f172a;
                }
                
                .po-status-badge {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                
                .po-status-badge.approved { background-color: #ecfdf5; color: #10b981; }
                .po-status-badge.received { background-color: #eff6ff; color: #2563eb; }
                .po-status-badge.draft { background-color: #f1f5f9; color: #64748b; }

                /* Active Orders Table styling */
                .table-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 8px;
                    box-shadow: var(--dash-shadow-sm);
                    overflow-x: auto;
                }
                
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .modern-table th {
                    text-align: left;
                    padding: 14px 16px;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    border-bottom: 2px solid #f1f5f9;
                }
                
                .modern-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                    color: #1e293b;
                }
                
                .modern-table tbody tr:hover td {
                    background-color: #f8fafc;
                }
                
                .status-select-premium {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 6px 12px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    color: #1e293b;
                }
                
                .status-badge-inline {
                    font-size: 11px;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 6px;
                }
                
                .status-badge-inline.pending { background-color: #fffbeb; color: #f59e0b; }
                .status-badge-inline.approved { background-color: #ecfdf5; color: #10b981; }
                .status-badge-inline.confirmed { background-color: #ecfdf5; color: #10b981; }
                .status-badge-inline.shipped { background-color: #f5f3ff; color: #7c3aed; }
                .status-badge-inline.delivered { background-color: #f0fdfa; color: #0d9488; }
                .status-badge-inline.cancelled { background-color: #fef2f2; color: #ef4444; }
                .status-badge-inline.awaiting-stock-check { background-color: rgba(37, 99, 235, 0.1); color: #2563eb; }
                .status-badge-inline.ready-for-delivery { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-badge-inline.low-stock-alert { background-color: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                .btn-approve {
                    background: #10b981;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .btn-workflow-confirm {
                    background: #10b981;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-workflow-confirm:hover { background: #059669; }

                .btn-workflow-alert {
                    background: #ef4444;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-workflow-alert:hover { background: #dc2626; }

                .btn-workflow-deliver {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-workflow-deliver:hover { background: #1d4ed8; }
                
                .btn-approve:hover {
                    background: #059669;
                }

                /* Filter Panel */
                .filter-panel {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 16px;
                    box-shadow: var(--dash-shadow-sm);
                }
                
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .filter-group label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #475569;
                }
                
                .filter-group select {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 8px 12px;
                    color: #1e293b;
                    min-width: 160px;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1100;
                    padding: 20px;
                }
                
                .modal-content {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    width: 100%;
                    max-width: 600px;
                    padding: 24px;
                    box-shadow: var(--dash-shadow-lg);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 12px;
                }
                
                .modal-header h2 {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 18px;
                    cursor: pointer;
                }
                
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                
                .form-group label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                }
                
                .form-group select, .form-group input {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px;
                    color: #1e293b;
                    font-size: 13px;
                    width: 100%;
                }
                
                .items-section {
                    border: 1px solid #e2e8f0;
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .item-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 12px;
                    align-items: center;
                }
                
                .item-subtotal {
                    font-weight: 700;
                    color: #2563eb;
                    text-align: right;
                }
                
                .order-summary-box {
                    padding: 12px 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 15px;
                }
                
                .order-summary-box strong {
                    color: #2563eb;
                    font-size: 20px;
                }
                
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 10px;
                }
                
                .btn-cancel {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                }
                
                .btn-save {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 13px;
                }
                
                .btn-save:hover {
                    background: #1d4ed8;
                }
                
                .text-btn {
                    background: none;
                    border: none;
                    color: #2563eb;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 0;
                    font-size: 13px;
                    text-align: left;
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
                        gap: 8px;
                    }
                    .item-subtotal {
                        text-align: left;
                    }
                    .order-summary-box {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 6px;
                    }
                }
                
                @media (max-width: 480px) {
                    .erp-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default ERP;
