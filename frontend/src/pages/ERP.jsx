import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';
import { 
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
    ShoppingCart, Search, UserPlus, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, FileText, CheckCircle, Clock, AlertTriangle, Filter, Plus, ChevronRight, Eye, Download, Bell, Truck 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ERP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchNotifications } = React.useContext(NotificationContext);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('active');
    const [loading, setLoading] = useState(true);
    const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [invoiceTab, setInvoiceTab] = useState('All');
    const [customers, setCustomers] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [materials, setMaterials] = useState([]);

    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [erpStats, setErpStats] = useState({
        openOrders: 0,
        approvedOrders: 0,
        pendingInvoices: 0,
        totalExpenses: '₹0',
        totalPurchaseOrders: 0,
        orderSummary: []
    });

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders');
            console.log("Orders API:", res.data);
            
            let extractedOrders = [];
            if (Array.isArray(res.data)) {
                extractedOrders = res.data;
            } else if (res.data && Array.isArray(res.data.orders)) {
                extractedOrders = res.data.orders;
            } else if (res.data && Array.isArray(res.data.data)) {
                extractedOrders = res.data.data;
            }
            
            console.log('ERP Order List:', extractedOrders);
            setOrders(extractedOrders);
        } catch (error) {
            console.error('Failed to fetch ERP orders:', error);
            setOrders([]);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashRes, customersRes, materialsRes, vendorsRes] = await Promise.all([
                API.get('/dashboard/stats').catch(e => ({ error: true, data: [] })),
                API.get('/customers').catch(e => ({ error: true, data: [] })),
                API.get('/materials').catch(e => ({ error: true, data: [] })),
                API.get('/vendors').catch(e => ({ error: true, data: [] }))
            ]);
            
            const data = dashRes.data || {};
            
            console.log("ERP API data:", data);

            // Set states
            if (data) {
                setErpStats(data);
            }
            
            const fetchedVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : [];
            setVendors(fetchedVendors);
            
            const mappedCustomers = (Array.isArray(customersRes.data) ? customersRes.data : [])
                .map(c => ({ ...c, customerModel: 'Customer' }));
            
            console.log('Fetched Customers:', mappedCustomers);
            console.log('Fetched Vendors:', fetchedVendors);
            
            setCustomers(mappedCustomers);
            
            const fetchedMaterials = Array.isArray(materialsRes.data) ? materialsRes.data : [];
            setMaterials(fetchedMaterials);
        } catch (err) {
            console.error('Error fetching ERP data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadAll = () => {
            fetchData();
            fetchOrders();
        };
        
        loadAll();
        const interval = setInterval(loadAll, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (orders.length > 0) {
            const params = new URLSearchParams(location.search);
            const highlightId = params.get('highlightOrder');
            if (highlightId) {
                const order = orders.find(o => String(o._id || o.id) === String(highlightId));
                if (order) {
                    const historyStatuses = ['Delivered', 'Cancelled', 'Completed'];
                    if (historyStatuses.includes(order.status)) {
                        setActiveTab('history');
                    } else {
                        setActiveTab('active');
                    }
                    setTimeout(() => {
                        const el = document.getElementById(`order-row-${order._id || order.id}`);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('highlight-row-animation');
                            setTimeout(() => el.classList.remove('highlight-row-animation'), 3000);
                        }
                    }, 300);
                }
            }
        }
    }, [location.search, orders]);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh', width: '100%' }}>
                <div className="loader"></div>
            </div>
        );
    }
    const handleOrderClick = (ord) => {
        setSelectedOrderDetails(ord);
        setShowOrderDetailsModal(true);
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/orders/${id}/status`, { status: newStatus });
            fetchData();
            if (fetchNotifications) fetchNotifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating order status');
        }
    };

    const handlePaymentStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/orders/${id}/payment-status`, { paymentStatus: newStatus });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating payment status');
        }
    };

    const handleDownloadInvoice = (orderOrId) => {
        let order;
        if (typeof orderOrId === 'string' || typeof orderOrId === 'number') {
            order = orders.find(o => String(o._id) === String(orderOrId) || String(o.id) === String(orderOrId));
        } else {
            order = orderOrId;
        }

        if (!order) return;

        const doc = new jsPDF();
        const invoiceNum = order.invoiceNumber || `INV-${order.orderNumber}`;
        const customerName = order.orderType === 'purchase' ? (order.vendor?.name || 'Walk-in Vendor') : (order.customer?.name || 'Walk-in Customer');

        // Header
        doc.setFontSize(20);
        doc.text('INVOICE', 14, 22);
        doc.setFontSize(10);
        doc.text(`Invoice Number: ${invoiceNum}`, 14, 32);
        doc.text(`Order Number: ${order.orderNumber}`, 14, 38);
        doc.text(`Date: ${order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}`, 14, 44);
        doc.text(`Due Date: ${order.invoiceDueDate ? new Date(order.invoiceDueDate).toLocaleDateString() : 'N/A'}`, 14, 50);
        doc.text(`Status: ${order.paymentStatus || 'Pending'}`, 14, 56);

        // Bill To
        doc.setFontSize(12);
        doc.text('Bill To:', 14, 71);
        doc.setFontSize(10);
        doc.text(customerName, 14, 78);

        // Items Table
        const tableColumn = ["Item", "Quantity", "Price", "Total"];
        const tableRows = [];
        let grandTotal = 0;

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                let materialObj = materials.find(m => String(m._id || m.id) === String(item.material));
                let materialName = materialObj ? materialObj.name : (item.materialName || 'Material');
                let price = materialObj ? materialObj.price : (item.price || 0);

                const itemTotal = item.quantity * price;
                grandTotal += itemTotal;
                const rowData = [
                    materialName,
                    item.quantity.toString(),
                    `$${price.toLocaleString()}`,
                    `$${itemTotal.toLocaleString()}`
                ];
                tableRows.push(rowData);
            });
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 91,
        });

        const finalY = doc.lastAutoTable.finalY || 91;
        doc.setFontSize(12);
        doc.text(`Grand Total: $${grandTotal.toLocaleString()}`, 14, finalY + 10);

        doc.save(`${invoiceNum}.pdf`);
    };

    const handleSendReminder = (orderId) => {
        alert(`Payment reminder sent for Order ${orderId}`);
    };

    const handleApprove = async (id) => {
        await handleStatusChange(id, 'Confirmed');
    };

    const handleReject = async (id) => {
        await handleStatusChange(id, 'Rejected');
    };



    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const activeOrders = orders.filter(order =>
        !["Completed", "Delivered", "Cancelled"].includes(order.finalStatus || order.status)
    );

    const orderHistory = orders.filter(order =>
        ["Completed", "Delivered", "Cancelled"].includes(order.finalStatus || order.status)
    );

    const currentTabOrders = activeTab === 'history' ? orderHistory : activeOrders;
    
    const filteredOrders = statusFilter === 'All' 
        ? currentTabOrders 
        : currentTabOrders.filter(o => o.status === statusFilter);

    console.log("ERP Stats:", erpStats);
    console.log("ERP Orders:", orders);
    console.log("Active Orders:", activeOrders);
    console.log("Order History:", orderHistory);

    const hasSales = filteredOrders.some(o => o.orderType === 'sales');
    const hasPurchase = filteredOrders.some(o => o.orderType === 'purchase');
    const customerVendorHeader = (hasSales && hasPurchase) ? 'Customer / Vendor' : (hasPurchase ? 'Vendor' : 'Customer');

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    const dueTodayCount = orders.filter(o => o.expectedDeliveryDate && new Date(o.expectedDeliveryDate).toDateString() === today.toDateString() && !['Delivered', 'Completed'].includes(o.status)).length;
    
    const dueThisWeekCount = orders.filter(o => {
        if (!o.expectedDeliveryDate || ['Delivered', 'Completed'].includes(o.status)) return false;
        const edd = new Date(o.expectedDeliveryDate);
        return edd >= today && edd <= endOfWeek;
    }).length;

    const overdueCount = orders.filter(o => {
        if (!o.expectedDeliveryDate || ['Delivered', 'Completed', 'Cancelled', 'Rejected'].includes(o.status)) return false;
        return new Date(o.expectedDeliveryDate) < today;
    }).length;

    const completedDeliveriesCount = orders.filter(o => ['Delivered', 'Completed'].includes(o.status)).length;

    // --- KPI CALCULATION USING DASHBOARD STATS EXACTLY LIKE REPORTS ---
    const formatCurrencyLocal = (num) => {
        if (!num) return '₹0';
        if (typeof num === 'string' && num.includes('₹')) return num; 
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    const dashStats = erpStats?.stats || {};
    const dashCharts = erpStats?.charts || {};
    const dashMonthlyStats = dashCharts.monthlyStats || [];

    const totalOrders = dashStats.totalOrders ?? 0;
    const salesOrders = dashStats.totalSalesOrders ?? 0;
    const purchaseOrders = dashStats.totalPurchaseOrders ?? 0;
    
    const chartRevenueSum = dashMonthlyStats.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) || 0;
    const totalRevenueNum = chartRevenueSum;
    
    // Fallbacks if backend adds totalRevenue later
    const finalTotalRevenueNum = dashStats.totalRevenue ? dashStats.totalRevenue : totalRevenueNum;
    
    const totalPurchaseCostNum = dashStats.purchaseCost || dashStats.totalPurchaseCost || 0;
        
    const pendingInvoices = orders.filter(o => ['Pending', 'Overdue', 'Partially Paid'].includes(o.paymentStatus)).length;

    console.log('--- ERP KPI DATA LOGS ---');
    console.log('ERP orders response:', orders);
    console.log('ERP stats:', erpStats);

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
                    {(userInfo?.role?.toLowerCase() === 'admin' || userInfo?.role?.toLowerCase() === 'super admin' || userInfo?.role?.toLowerCase() === 'manager') && (
                        <button className="btn-primary-blue flex-center gap-8" onClick={() => navigate('/orders/create-order')}>
                            <Plus size={16} /> Create Order
                        </button>
                    )}
                </div>
            </header>

            {/* 6 Stats Cards */}
            <section className="erp-metrics-grid">
                <div className="erp-metric-card">
                    <span className="label">Total Orders</span>
                    <span className="value">{totalOrders}</span>
                </div>
                <div className="erp-metric-card border-green">
                    <span className="label text-green">Sales Orders</span>
                    <span className="value text-green">{salesOrders}</span>
                </div>
                <div className="erp-metric-card border-blue">
                    <span className="label text-blue">Purchase Orders</span>
                    <span className="value text-blue">{purchaseOrders}</span>
                </div>
                <div className="erp-metric-card border-orange cursor-pointer" onClick={() => { setShowInvoiceModal(true); setInvoiceTab('Pending'); }}>
                    <span className="label text-orange">Pending Invoices</span>
                    <span className="value text-orange">{pendingInvoices}</span>
                </div>
                <div className="erp-metric-card border-green">
                    <span className="label text-green">Total Revenue</span>
                    <span className="value text-green">{formatCurrencyLocal(finalTotalRevenueNum)}</span>
                </div>
                <div className="erp-metric-card border-blue">
                    <span className="label text-blue">Total Purchase Cost</span>
                    <span className="value text-blue">{formatCurrencyLocal(totalPurchaseCostNum)}</span>
                </div>
                <div className="erp-metric-card border-purple">
                    <span className="label text-purple" style={{ color: '#8b5cf6' }}>Orders Due Today</span>
                    <span className="value text-purple" style={{ color: '#8b5cf6' }}>{dueTodayCount}</span>
                </div>
                <div className="erp-metric-card border-blue">
                    <span className="label text-blue" style={{ color: '#3b82f6' }}>Orders Due This Week</span>
                    <span className="value text-blue" style={{ color: '#3b82f6' }}>{dueThisWeekCount}</span>
                </div>
                <div className="erp-metric-card border-red">
                    <span className="label text-red" style={{ color: '#ef4444' }}>Overdue Orders</span>
                    <span className="value text-red" style={{ color: '#ef4444' }}>{overdueCount}</span>
                </div>
                <div className="erp-metric-card border-green">
                    <span className="label text-green" style={{ color: '#10b981' }}>Completed Deliveries</span>
                    <span className="value text-green" style={{ color: '#10b981' }}>{completedDeliveriesCount}</span>
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
                                {recentPurchaseOrders.length > 0 ? (
                                    recentPurchaseOrders.map((po, idx) => (
                                        <tr key={idx}>
                                            <td><code className="po-code">{po.orderNumber}</code></td>
                                            <td className="vendor-name-cell">{po.vendor?.name || 'Walk-in Vendor'}</td>
                                            <td>
                                                <span className={`po-status-badge ${po.status.toLowerCase().replace(/ /g, '-')}`}>
                                                    {po.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No Orders Available</td>
                                    </tr>
                                )}
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
                <div className="erp-tabs p-16">
                    <button 
                        className={`erp-tab ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Orders
                    </button>
                    <button 
                        className={`erp-tab ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Order History
                    </button>
                </div>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Order Type</th>
                            <th>{customerVendorHeader}</th>
                            <th>Quantity</th>
                            <th>Amount</th>
                            <th>Order Date</th>
                            <th>Expected Delivery</th>
                            <th>Manager Approval</th>
                            <th>Employee Approval</th>
                            <th>Delivery Status</th>
                            <th>Final Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No Orders Available</td>
                            </tr>
                        ) : filteredOrders.map((ord) => {
                            const isEmp = userInfo.role === 'Employee';
                            const isSalesRole = userInfo.role === 'Sales';
                            
                            const displayStatus = (status) => {
                                const pendingStates = ['Pending', 'Awaiting Approval', 'Awaiting Stock Check'];
                                if (pendingStates.includes(status)) {
                                    return 'Pending';
                                }
                                return status;
                            };
                            
                            const getCustomerName = (order) => {
                                if (order.customerName) return order.customerName;
                                if (order.customer && order.customer.name) return order.customer.name;
                                const cId = order.customerId || order.customer;
                                const cMatch = customers.find(c => String(c.id || c._id) === String(cId));
                                return cMatch ? cMatch.name : 'Walk-in Customer';
                            };

                            const getVendorName = (order) => {
                                if (order.vendor && order.vendor.name) return order.vendor.name;
                                const vId = order.vendorId || order.vendor;
                                const vMatch = vendors.find(v => String(v.id || v._id) === String(vId));
                                return vMatch ? vMatch.name : 'Walk-in Vendor';
                            };
                            
                            const ordType = String(ord.orderType || ord.type || '').toLowerCase();
                            const amount = ord.totalAmount || ord.amount || ord.grandTotal || 0;
                            
                            const currentStatusText = displayStatus(ord.status);
                            const statusClass = currentStatusText.toLowerCase().replace(/ /g, '-');
                            
                            const renderQuantity = (order) => {
                                if (!order.items || order.items.length === 0) return '-';
                                if (order.items.length === 1) {
                                    const item = order.items[0];
                                    const mat = materials.find(m => String(m.id || m._id) === String(item.material));
                                    return `${item.quantity} ${mat?.unit || 'pcs'}`;
                                }
                                const totalQty = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }} onClick={() => handleOrderClick(order)}>{order.items.length} Items</span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total: {totalQty}</span>
                                    </div>
                                );
                            };

                            let rowClass = "";
                            if (ord.expectedDeliveryDate && !['Delivered', 'Completed', 'Cancelled', 'Rejected'].includes(ord.status)) {
                                const edd = new Date(ord.expectedDeliveryDate);
                                const todayDate = new Date();
                                todayDate.setHours(0,0,0,0);
                                const diffTime = edd - todayDate;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                
                                if (diffDays < 0) {
                                    rowClass = "row-overdue";
                                } else if (diffDays <= 3) {
                                    rowClass = "row-due-soon";
                                } else {
                                    rowClass = "row-on-schedule";
                                }
                            }

                            return (
                                <tr key={ord._id || ord.id} id={`order-row-${ord._id || ord.id}`} className={rowClass}>
                                    <td><code className="po-code" style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => handleOrderClick(ord)}>{ord.orderNumber || ord.id}</code></td>
                                    <td>
                                        {ordType === 'purchase' ? (
                                            <span className="order-type-badge purchase">Purchase Order</span>
                                        ) : (
                                            <span className="order-type-badge sales">Sales Order</span>
                                        )}
                                    </td>
                                    <td className="vendor-name-cell">
                                        {ordType === 'purchase' ? getVendorName(ord) : getCustomerName(ord)}
                                    </td>
                                    <td>{renderQuantity(ord)}</td>
                                    <td><strong>{formatCurrencyLocal(amount)}</strong></td>
                                    <td>{ord.orderDate ? new Date(ord.orderDate).toLocaleDateString() : new Date(ord.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {ord.expectedDeliveryDate ? (
                                            <span style={{ fontWeight: 600 }}>{new Date(ord.expectedDeliveryDate).toLocaleDateString()}</span>
                                        ) : (
                                            <span className="text-muted small">N/A</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${(ord.approvalStatus === 'Manager Approved' || ord.approvalStatus === 'Employee Approved' || ord.managerApproval === 'Approved') ? 'approved' : 'pending'}`}>
                                            {ord.managerApproval || ((ord.approvalStatus === 'Manager Approved' || ord.approvalStatus === 'Employee Approved') ? 'Approved' : 'Pending') || "-"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${ord.employeeApproval === 'Approved' || ord.approvalStatus === 'Employee Approved' ? 'approved' : 'not-started'}`}>
                                            {ord.employeeApproval || (ord.approvalStatus === 'Employee Approved' ? 'Approved' : 'Not Started') || "-"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${ord.deliveryStatus?.toLowerCase().replace(/ /g, '-') || 'not-started'}`}>
                                            {ord.deliveryStatus || "-"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${statusClass}`}>{ord.finalStatus || ord.status || "-"}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '200px' }}>
                                            {/* Manager Action */}
                                            {(isAdmin || userInfo.role === 'Manager' || userInfo.role === 'Super Admin') && ord.orderType === 'sales' && (ord.approvalStatus === 'Pending Manager Approval' || ord.status === 'Created' || ord.status === 'Pending Approval') && (
                                                <button className="btn-approve" onClick={() => handleStatusChange(ord._id, 'Manager Approved')}>Approve (Manager)</button>
                                            )}

                                            {/* Employee Action */}
                                            {(isAdmin || userInfo.role === 'Employee' || userInfo.role === 'Super Admin') && ord.orderType === 'sales' && ord.approvalStatus === 'Manager Approved' && (
                                                <button className="btn-workflow-confirm" style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleStatusChange(ord._id, 'Employee Approved')}>Approve Stock (Employee)</button>
                                            )}

                                            {/* Sales Actions */}
                                            {(isAdmin || isSalesRole || userInfo.role === 'Super Admin') && ord.orderType === 'sales' && ord.approvalStatus === 'Employee Approved' && ord.deliveryStatus === 'Not Started' && (
                                                <button className="btn-workflow-confirm" style={{ background: '#8b5cf6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleStatusChange(ord._id, 'Processing')}>Start Processing</button>
                                            )}

                                            {(isAdmin || isSalesRole || userInfo.role === 'Super Admin') && ord.orderType === 'sales' && ord.deliveryStatus === 'Processing' && (
                                                <button className="btn-workflow-deliver" style={{ background: '#f59e0b', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleStatusChange(ord._id, 'Shipped')}>Mark Shipped</button>
                                            )}

                                            {(isAdmin || isSalesRole || userInfo.role === 'Super Admin') && ord.orderType === 'sales' && ord.deliveryStatus === 'Shipped' && (
                                                <button className="btn-workflow-deliver" style={{ background: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleStatusChange(ord._id, 'Delivered')}>Mark Delivered</button>
                                            )}

                                            {/* Legacy non-sales logic */}
                                            {ord.orderType === 'purchase' && (ord.status === 'Pending' || ord.status === 'Awaiting Approval') && (isAdmin || userInfo.role === 'Super Admin' || userInfo.role === 'Manager') && (
                                                <button className="btn-approve" onClick={() => handleStatusChange(ord._id, 'Approved')}>Approve</button>
                                            )}

                                            {/* Track Order Button */}
                                            {ord.deliveryStatus && !['Not Started'].includes(ord.deliveryStatus) && (
                                                <button className="btn-secondary-light" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }} onClick={() => navigate(`/orders/${ord.id || ord._id}/tracking`)} title="Track Order">
                                                    <Truck size={14} />
                                                </button>
                                            )}

                                            {/* Download Invoice Button */}
                                            {(['Confirmed', 'Processing', 'Shipped', 'Delivered'].includes(ord.status) || ord.invoiceGenerated) && (
                                                <button className="btn-secondary-light" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDownloadInvoice(ord)} title="Download Invoice">
                                                    <Download size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {showOrderDetailsModal && selectedOrderDetails && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Order Details: {selectedOrderDetails.orderNumber}</h2>
                            <button className="close-btn" onClick={() => setShowOrderDetailsModal(false)}>✕</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
                                <div>
                                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>{selectedOrderDetails.orderType === 'purchase' ? 'Vendor' : 'Customer'}</p>
                                    <h3 style={{ margin: 0 }}>{selectedOrderDetails.orderType === 'purchase' ? (selectedOrderDetails.vendor?.name || 'Walk-in') : (selectedOrderDetails.customer?.name || 'Walk-in')}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Status</p>
                                    <span className={`status-badge-inline ${selectedOrderDetails.status.toLowerCase().replace(/ /g, '-')}`}>{selectedOrderDetails.status}</span>
                                </div>
                            </div>
                            
                            <h4 style={{ margin: '0 0 12px 0', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>Items Ordered</h4>
                            <table className="modern-table" style={{ fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th>Material</th>
                                        <th>SKU</th>
                                        <th style={{ textAlign: 'right' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Unit Price</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrderDetails.items && selectedOrderDetails.items.map((item, idx) => {
                                        const mat = materials.find(m => String(m.id || m._id) === String(item.material));
                                        return (
                                            <tr key={idx}>
                                                <td>{mat?.name || 'Unknown Item'}</td>
                                                <td><code style={{ fontSize: '11px', background: 'var(--bg-hover)', padding: '2px 4px', borderRadius: '4px' }}>{mat?.sku || '-'}</code></td>
                                                <td style={{ textAlign: 'right' }}><strong>{item.quantity}</strong> {mat?.unit || 'pcs'}</td>
                                                <td style={{ textAlign: 'right' }}>${item.price}</td>
                                                <td style={{ textAlign: 'right' }}><strong>${(item.quantity * item.price).toLocaleString()}</strong></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '16px' }}>Grand Total</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', paddingTop: '16px', fontSize: '15px' }}>${selectedOrderDetails.totalAmount?.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '120px', background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Order Date</p>
                                    <strong style={{ fontSize: '14px' }}>{selectedOrderDetails.orderDate ? new Date(selectedOrderDetails.orderDate).toLocaleDateString() : new Date(selectedOrderDetails.createdAt).toLocaleDateString()}</strong>
                                </div>
                                <div style={{ flex: 1, minWidth: '120px', background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Expected Delivery</p>
                                    <strong style={{ fontSize: '14px' }}>{selectedOrderDetails.expectedDeliveryDate ? new Date(selectedOrderDetails.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</strong>
                                </div>
                                <div style={{ flex: 1, minWidth: '120px', background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Delivery Status</p>
                                    <strong style={{ fontSize: '14px' }}>{selectedOrderDetails.deliveryStatus || 'Not Started'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice List Modal */}
            {showInvoiceModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-pop" style={{ maxWidth: '1000px' }}>
                        <div className="modal-header">
                            <h2>Invoices</h2>
                            <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>✕</button>
                        </div>
                        <div className="erp-tabs" style={{ paddingBottom: '16px' }}>
                            {['All', 'Pending', 'Paid', 'Overdue', 'Partially Paid'].map(tab => (
                                <button 
                                    key={tab}
                                    className={`erp-tab ${invoiceTab === tab ? 'active' : ''}`}
                                    onClick={() => setInvoiceTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="table-card" style={{ boxShadow: 'none', margin: '0', padding: '0', maxHeight: '500px', overflowY: 'auto' }}>
                            <table className="modern-table" style={{ fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th>Invoice ID</th>
                                        <th>Order ID</th>
                                        <th>Customer / Vendor</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Invoice Date</th>
                                        <th>Due Date</th>
                                        <th>Payment Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders
                                        .filter(o => invoiceTab === 'All' || o.paymentStatus === invoiceTab || (invoiceTab === 'Pending' && !o.paymentStatus))
                                        .sort((a, b) => new Date(b.invoiceDate || b.createdAt) - new Date(a.invoiceDate || a.createdAt))
                                        .map(o => (
                                        <tr key={o._id}>
                                            <td><strong>{o.invoiceNumber || `INV-${o.orderNumber}`}</strong></td>
                                            <td>{o.orderNumber}</td>
                                            <td>{o.customer?.name || o.vendor?.name || 'Walk-in'}</td>
                                            <td>{o.orderType === 'sales' ? 'Receivable' : 'Payable'}</td>
                                            <td>${(o.totalAmount || 0).toLocaleString()}</td>
                                            <td>{o.invoiceDate ? new Date(o.invoiceDate).toLocaleDateString() : new Date(o.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                {o.invoiceDueDate ? new Date(o.invoiceDueDate).toLocaleDateString() : (o.expectedDeliveryDate ? new Date(o.expectedDeliveryDate).toLocaleDateString() : 'N/A')}
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${(o.paymentStatus || 'Pending').replace(/\s+/g, '-').toLowerCase()}`}>
                                                    {o.paymentStatus || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                                                    <button className="btn-icon" onClick={() => { setShowOrderDetailsModal(true); setSelectedOrderDetails(o); }} title="View Invoice">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => handleDownloadInvoice(o._id)} title="Download PDF">
                                                        <Download size={14} />
                                                    </button>
                                                    {o.paymentStatus !== 'Paid' && (
                                                        <>
                                                            <button className="btn-icon" style={{ color: 'var(--success)' }} onClick={() => handlePaymentStatusChange(o._id, 'Paid')} title="Mark as Paid">
                                                                <CheckCircle size={14} />
                                                            </button>
                                                            <button className="btn-icon" style={{ color: 'var(--warning)' }} onClick={() => handleSendReminder(o._id)} title="Send Reminder">
                                                                <Bell size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.filter(o => invoiceTab === 'All' || o.paymentStatus === invoiceTab || (invoiceTab === 'Pending' && !o.paymentStatus)).length === 0 && (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>No invoices found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .row-overdue { background-color: rgba(239, 68, 68, 0.05); }
                .row-overdue td { border-bottom-color: rgba(239, 68, 68, 0.1); }
                .row-due-soon { background-color: rgba(245, 158, 11, 0.05); }
                .row-due-soon td { border-bottom-color: rgba(245, 158, 11, 0.1); }
                .row-on-schedule { background-color: rgba(16, 185, 129, 0.05); }
                .row-on-schedule td { border-bottom-color: rgba(16, 185, 129, 0.1); }

                .status-badge.status-paid { background-color: rgba(16, 185, 129, 0.1); color: var(--success); }
                .status-badge.status-pending { background-color: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .status-badge.status-overdue { background-color: rgba(239, 68, 68, 0.1); color: var(--danger); }
                .status-badge.status-partially-paid { background-color: rgba(59, 130, 246, 0.1); color: var(--primary); }

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
                    grid-template-columns: repeat(3, 1fr);
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
                
                /* Tabs styling */
                .erp-tabs {
                    display: flex;
                    gap: 16px;
                    border-bottom: 1px solid var(--border);
                }
                .erp-tab {
                    background: transparent;
                    border: none;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-muted);
                    padding: 8px 4px;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.2s;
                }
                .erp-tab:hover {
                    color: var(--text-secondary);
                }
                .erp-tab.active {
                    color: var(--primary);
                }
                .erp-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background-color: var(--primary);
                    border-radius: 3px 3px 0 0;
                }

                @keyframes highlightRow {
                    0% { background-color: var(--primary-100); }
                    100% { background-color: transparent; }
                }
                .highlight-row-animation {
                    animation: highlightRow 3s ease-out;
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
