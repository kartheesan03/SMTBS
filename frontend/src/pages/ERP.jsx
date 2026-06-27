import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';
import { 
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { 
    ShoppingCart, Search, UserPlus, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, FileText, CheckCircle, Clock, XCircle, Send, AlertTriangle, Filter, Plus, ChevronRight, Eye, Download, Bell, Truck, Trash2
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });
    const [erpStats, setErpStats] = useState({});

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

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
    }, []);

    // Reset page to 1 when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, activeTab]);

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
            fetchOrders();
            if (fetchNotifications) fetchNotifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating order status');
        }
    };

    const handlePaymentStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/orders/${id}/payment-status`, { paymentStatus: newStatus });
            fetchData();
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating payment status');
        }
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await API.delete(`/orders/${id}`);
            fetchData();
            fetchOrders();
            if (fetchNotifications) fetchNotifications();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting order');
        }
    };

    const handleEmployeePurchaseApproval = async (id, action) => {
        try {
            await API.post(`/orders/${id}/employee-approve`, { action });
            fetchData();
            fetchOrders();
            if (fetchNotifications) fetchNotifications();
            alert(`Purchase order ${action.toLowerCase()}ed successfully!`);
        } catch (err) {
            alert(err.response?.data?.message || `Error trying to ${action.toLowerCase()} order`);
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
        const isPurchase = order.orderType === 'purchase';

        let billToName = isPurchase ? 'Unassigned' : 'Unassigned';
        let billToEmail = '';
        let billToPhone = '';
        let billToAddress = '';

        if (isPurchase) {
            billToName = 
                order.vendor?.companyName ||
                order.vendor?.name ||
                order.vendorName ||
                order.companyName ||
                'Unassigned';
                
            billToEmail = order.vendor?.email || order.vendorEmail || '';
            billToPhone = order.vendor?.phone || order.vendorPhone || '';
            billToAddress = order.vendor?.address || order.vendorAddress || '';
        } else {
            billToName = 
                order.customer?.company ||
                order.customer?.companyName ||
                order.customer?.name ||
                order.customerName ||
                order.companyName ||
                'Unassigned';
                
            billToEmail = order.customer?.email || order.customerEmail || '';
            billToPhone = order.customer?.phone || order.customerPhone || '';
            billToAddress = order.customer?.address || order.customerAddress || '';
        }

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
        doc.text(billToName, 14, 78);
        
        let yPos = 84;
        if (billToEmail) {
            doc.text(`Email: ${billToEmail}`, 14, yPos);
            yPos += 5;
        }
        if (billToPhone) {
            doc.text(`Phone: ${billToPhone}`, 14, yPos);
            yPos += 5;
        }
        if (billToAddress) {
            const splitAddress = doc.splitTextToSize(`Address: ${billToAddress}`, 80);
            doc.text(splitAddress, 14, yPos);
            yPos += (splitAddress.length * 5);
        }
        
        const tableStartY = Math.max(91, yPos + 5);

        // Items Table
        const tableColumn = ["Item", "Quantity", "Price", "Total"];
        const tableRows = [];
        let grandTotal = 0;

        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                let materialName = item.material?.name || item.materialName || 'Material';
                let price = item.price || item.material?.price || 0;

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
            startY: tableStartY,
        });

        const finalY = doc.lastAutoTable.finalY || tableStartY;
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



    const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo.role === 'Admin';

    const activeOrders = orders.filter(order =>
        !["Completed", "Delivered", "Cancelled"].includes(order.finalStatus || order.status)
    );

    const orderHistory = orders.filter(order =>
        ["Completed", "Delivered", "Cancelled"].includes(order.finalStatus || order.status)
    );

    const currentTabOrders = activeTab === 'history' ? orderHistory : activeOrders;
    
    // Apply search
    const searchedOrders = currentTabOrders.filter(o => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const oId = (o.orderNumber || '').toLowerCase();
        const cName = (o.customer?.name || o.customer?.company || o.customerName || '').toLowerCase();
        const vName = (o.vendor?.name || o.vendor?.companyName || o.vendorName || '').toLowerCase();
        return oId.includes(term) || cName.includes(term) || vName.includes(term);
    });

    const filteredOrders = statusFilter === 'All' 
        ? searchedOrders 
        : searchedOrders.filter(o => o.status === statusFilter);

    // Sorting logic
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'customerOrVendor') {
            aVal = a.orderType === 'sales' ? (a.customer?.company || a.customer?.name || '') : (a.vendor?.companyName || a.vendor?.name || '');
            bVal = b.orderType === 'sales' ? (b.customer?.company || b.customer?.name || '') : (b.vendor?.companyName || b.vendor?.name || '');
        } else if (sortConfig.key === 'totalAmount') {
            aVal = Number(a.totalAmount || a.amount || a.grandTotal || 0);
            bVal = Number(b.totalAmount || b.amount || b.grandTotal || 0);
        } else if (sortConfig.key === 'orderDate' || sortConfig.key === 'createdAt') {
            aVal = new Date(a.orderDate || a.createdAt).getTime();
            bVal = new Date(b.orderDate || b.createdAt).getTime();
        } else if (sortConfig.key === 'expectedDeliveryDate') {
            aVal = a.expectedDeliveryDate ? new Date(a.expectedDeliveryDate).getTime() : 0;
            bVal = b.expectedDeliveryDate ? new Date(b.expectedDeliveryDate).getTime() : 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalItems = sortedOrders.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedOrders = sortedOrders.slice(startIndex, startIndex + pageSize);

    console.log("ERP Stats:", erpStats);
    console.log("ERP Orders:", orders);
    console.log("Active Orders:", activeOrders);
    console.log("Order History:", orderHistory);

    const hasSales = filteredOrders.some(o => o.orderType === 'sales');
    const hasPurchase = filteredOrders.some(o => o.orderType === 'purchase');
    const customerVendorHeader = (hasSales && hasPurchase) ? 'Organization / Vendor' : (hasPurchase ? 'Vendor' : 'Organization / Company');

    const purchaseOrdersList = orders.filter(o => o.orderType === 'purchase');
    const totalPo = purchaseOrdersList.length;
    const poDraftCount = purchaseOrdersList.filter(o => ['Pending Approval', 'Awaiting Approval', 'Created', 'Pending'].includes(o.status)).length;
    const poApprovedCount = purchaseOrdersList.filter(o => ['Approved', 'Confirmed', 'Processing', 'Shipped', 'Ready for Delivery'].includes(o.status)).length;
    const poReceivedCount = purchaseOrdersList.filter(o => ['Delivered', 'Completed', 'Received'].includes(o.status)).length;
    const poCancelledCount = purchaseOrdersList.filter(o => ['Cancelled', 'Rejected'].includes(o.status)).length;

    const poSummaryData = [
        { name: 'Draft', value: poDraftCount, percentage: totalPo > 0 ? Math.round((poDraftCount / totalPo) * 100) + '%' : '0%', color: '#2563eb' },
        { name: 'Approved', value: poApprovedCount, percentage: totalPo > 0 ? Math.round((poApprovedCount / totalPo) * 100) + '%' : '0%', color: '#10b981' },
        { name: 'Received', value: poReceivedCount, percentage: totalPo > 0 ? Math.round((poReceivedCount / totalPo) * 100) + '%' : '0%', color: '#f59e0b' },
        { name: 'Cancelled', value: poCancelledCount, percentage: totalPo > 0 ? Math.round((poCancelledCount / totalPo) * 100) + '%' : '0%', color: '#ef4444' }
    ];

    const activePoStatuses = poSummaryData.filter(d => d.value > 0);

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
    const cancelledOrdersCount = orders.filter(o => ['Cancelled', 'Rejected'].includes(o.status)).length;

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

    const validOrders = orders.filter(o => !['Cancelled', 'Rejected'].includes(o.status));
    const totalOrders = validOrders.length;
    const salesOrders = validOrders.filter(o => o.orderType === 'sales').length;
    const purchaseOrders = validOrders.filter(o => o.orderType === 'purchase').length;
    
    const chartRevenueSum = dashMonthlyStats.reduce((sum, m) => sum + (Number(m.revenue) || 0), 0) || 0;
    const totalRevenueNum = chartRevenueSum;
    
    // Fallbacks if backend adds totalRevenue later
    const finalTotalRevenueNum = orders.filter(o => o.orderType === 'sales' && !['Cancelled', 'Rejected'].includes(o.status)).reduce((sum, o) => sum + (Number(o.totalAmount || o.amount || 0)), 0);
    
    const totalPurchaseCostNum = orders.filter(o => o.orderType === 'purchase' && !['Cancelled', 'Rejected'].includes(o.status)).reduce((sum, o) => sum + (Number(o.totalAmount || o.amount || 0)), 0);
        
    const pendingInvoices = validOrders.filter(o => !o.paymentStatus || ['Pending', 'Overdue', 'Partially Paid'].includes(o.paymentStatus)).length;

    console.log('--- ERP KPI DATA LOGS ---');
    console.log('ERP orders response:', orders);
    console.log('ERP stats:', erpStats);

    return (
        <div className="page-container">
            {/* Actions Section */}
            <div className="page-header">
                <div className="header-content">
                    <h1>ERP Operations</h1>
                    <p>Manage procurement, sales orders, and invoices.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    {(userInfo?.role?.toLowerCase() === 'admin' || userInfo?.role?.toLowerCase() === 'super admin' || userInfo?.role?.toLowerCase() === 'manager' || userInfo?.role?.toLowerCase() === 'hr') && (
                        <button className="btn-primary" onClick={() => navigate('/orders/select-type')}>
                            <Plus size={16} /> Create Order
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Section */}
            <div className="module-kpi-section">
                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Total Orders</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{totalOrders}</div>
                </div>

                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Sales Orders</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>
                            <ArrowUpRight size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{salesOrders}</div>
                </div>

                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Purchase Orders</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(245,158,11,0.1)', color: '#F59E0B'}}>
                            <ArrowDownRight size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{purchaseOrders}</div>
                </div>

                <div className="premium-card">
                    <div className="kpi-header">
                        <span className="kpi-title">Pending Invoices</span>
                        <div className="kpi-icon-wrapper" style={{background: 'rgba(239,68,68,0.1)', color: '#EF4444'}}>
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="kpi-value">{pendingInvoices}</div>
                </div>
            </div>


            {/* Filters Section */}
            {showFilters && (
                <div className="page-header" style={{background: 'var(--bg-surface-hover)', padding: '16px', marginTop: '-12px', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
                    <div className="global-search" style={{width: '300px', background: 'var(--bg-body)'}}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        style={{padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-body)', outline: 'none', color: 'var(--text-main)'}}
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                    >
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
            )}

            {/* Data Table Section */}
            <div className="module-data-section">
                <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                    <button className={`btn-secondary ${activeTab === 'active' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('active')} style={activeTab === 'active' ? {background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)'} : {}}>Active Orders</button>
                    <button className={`btn-secondary ${activeTab === 'history' ? 'btn-primary' : ''}`} onClick={() => setActiveTab('history')} style={activeTab === 'history' ? {background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)'} : {}}>Order History</button>
                </div>
                <div className="table-container">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('orderNumber')} style={{ cursor: 'pointer' }}>Order ID {sortConfig.key === 'orderNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('orderType')} style={{ cursor: 'pointer' }}>Type</th>
                                <th onClick={() => handleSort('customerOrVendor')} style={{ cursor: 'pointer' }}>Organization</th>
                                <th>Amount</th>
                                <th onClick={() => handleSort('orderDate')} style={{ cursor: 'pointer' }}>Order Date</th>
                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map((ord) => {
                                const customerOrVendor = ord.orderType === 'sales' 
                                    ? (ord.customer?.company || ord.customer?.name || 'Walk-in')
                                    : (ord.vendor?.companyName || ord.vendor?.name || 'Walk-in');
                                
                                const amount = ord.totalAmount || ord.amount || ord.grandTotal || 0;
                                
                                return (
                                    <tr key={ord._id || ord.id}>
                                        <td><span style={{fontWeight: 600, color: 'var(--primary)', cursor: 'pointer'}} onClick={() => handleOrderClick(ord)}>{ord.orderNumber || ord.id}</span></td>
                                        <td>
                                            <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: ord.orderType === 'sales' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', color: ord.orderType === 'sales' ? '#10B981' : '#3B82F6'}}>
                                                {ord.orderType === 'sales' ? 'SALES' : 'PURCHASE'}
                                            </span>
                                        </td>
                                        <td>{customerOrVendor}</td>
                                        <td><strong>{formatCurrencyLocal(amount)}</strong></td>
                                        <td>{ord.orderDate ? new Date(ord.orderDate).toLocaleDateString() : new Date(ord.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span style={{padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-hover)', color: 'var(--text-main)'}}>
                                                {ord.finalStatus || ord.status || "-"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                {/* Track Order Button */}
                                                {((ord.deliveryStatus && !['Not Started'].includes(ord.deliveryStatus)) || ['Cancelled', 'Rejected'].includes(ord.status)) && (
                                                    <button className="icon-btn" onClick={() => navigate(`/orders/${ord.id || ord._id}/tracking`)} title="Track Order">
                                                        <Truck size={14} />
                                                    </button>
                                                )}

                                                {/* Download Invoice Button */}
                                                {(['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'].includes(ord.status) || ord.invoiceGenerated) && (
                                                    <button className="icon-btn" onClick={() => handleDownloadInvoice(ord)} title="Download Invoice">
                                                        <Download size={14} />
                                                    </button>
                                                )}

                                                {/* Delete Action (Admin/Manager) */}
                                                {(isAdmin || userInfo.role === 'Manager' || userInfo.role === 'Super Admin') && (
                                                    <button className="icon-btn" style={{color: 'var(--danger)'}} onClick={() => handleDeleteOrder(ord._id || ord.id)} title="Delete Order">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                                        No orders found matching the current criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 0 && (
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px'}}>
                        <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems}</span>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <button className="btn-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                            <span style={{fontSize: '13px', fontWeight: 600}}>Page {currentPage} of {totalPages}</span>
                            <button className="btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showOrderDetailsModal && selectedOrderDetails && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'}}>
                    <div style={{background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                            <h2 style={{margin: 0}}>Order Details</h2>
                            <button className="icon-btn" onClick={() => setShowOrderDetailsModal(false)}><XCircle size={20}/></button>
                        </div>
                        <p><strong>Order ID:</strong> {selectedOrderDetails.orderNumber}</p>
                        <p><strong>Status:</strong> {selectedOrderDetails.status}</p>
                        <p><strong>Total Amount:</strong> {formatCurrencyLocal(selectedOrderDetails.totalAmount)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ERP;
