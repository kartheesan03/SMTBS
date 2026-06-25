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
        <div className="module-container">
            {/* Breadcrumb */}
            <div className="breadcrumb-nav">
                <span className="crumb" onClick={() => navigate('/')}>Dashboard</span>
                <ChevronRight size={14} className="separator" />
                <span className="crumb active">ERP Operations</span>
            </div>

            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-heading)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>ERP Operations</h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>Handle procurement, inventory, orders, vendors, finances and analytics.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="search-bar" style={{ position: 'relative', width: '250px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <button className="btn-secondary-light flex-center gap-8" onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} /> Filters
                    </button>
                    {(userInfo?.role?.toLowerCase() === 'admin' || userInfo?.role?.toLowerCase() === 'super admin' || userInfo?.role?.toLowerCase() === 'manager' || userInfo?.role?.toLowerCase() === 'hr') && (
                        <button className="btn-primary flex-center gap-8" onClick={() => navigate('/orders/select-type')}>
                            <Plus size={16} /> Create Order
                        </button>
                    )}
                </div>
            </header>

            {/* KPI Cards Grid */}
            {/* KPI Cards Grid */}
            <section className="erp-metrics-grid">
                {/* 1. Total Orders (Blue) */}
                <div className="kpi-gradient-card bg-blue">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><ShoppingCart size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +12%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{totalOrders}</h2>
                        <span className="kpi-label-text">Total Orders</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 C20,20 30,30 50,15 C65,5 80,25 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+12%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 2. Sales Orders (Green) */}
                <div className="kpi-gradient-card bg-green">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><ArrowUpRight size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +21%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{salesOrders}</h2>
                        <span className="kpi-label-text">Sales Orders</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 C15,25 25,15 40,20 C60,25 70,10 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+21%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 3. Purchase Orders (Orange) */}
                <div className="kpi-gradient-card bg-orange">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><ArrowDownRight size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▼ 8%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{purchaseOrders}</h2>
                        <span className="kpi-label-text">Purchase Orders</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,5 C20,10 30,5 50,15 C70,25 80,20 100,28" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="28" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">-8%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 4. Pending Invoices (Red) */}
                <div className="kpi-gradient-card bg-red cursor-pointer highlight-hover" onClick={() => { setShowInvoiceModal(true); setInvoiceTab('Pending'); }}>
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><AlertTriangle size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▼ 15%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{pendingInvoices}</h2>
                        <span className="kpi-label-text">Pending Invoices</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,10 C20,15 30,15 50,25 C70,35 80,25 100,28" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="28" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">-15%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 5. Total Revenue (Span 2, Blue) */}
                <div className="kpi-gradient-card bg-blue span-2">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><DollarSign size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +18%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{formatCurrencyLocal(finalTotalRevenueNum)}</h2>
                        <span className="kpi-label-text">Total Revenue</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,30 C30,20 50,25 70,10 C85,0 95,15 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+18%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 6. Total Purchase Cost (Span 2, Orange) */}
                <div className="kpi-gradient-card bg-orange span-2">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><DollarSign size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▼ 4%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{formatCurrencyLocal(totalPurchaseCostNum)}</h2>
                        <span className="kpi-label-text">Total Purchase Cost</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,5 C30,15 50,5 70,20 C85,30 95,15 100,25" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="25" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">-4%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 7. Due Today */}
                <div className="kpi-gradient-card bg-green">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><Clock size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +2%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{dueTodayCount}</h2>
                        <span className="kpi-label-text">Due Today</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 C20,25 30,15 50,20 C70,25 80,10 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+2%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 8. Due This Week */}
                <div className="kpi-gradient-card bg-blue">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><Calendar size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +5%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{dueThisWeekCount}</h2>
                        <span className="kpi-label-text">Due This Week</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,20 C20,15 30,25 50,15 C70,5 80,15 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+5%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 9. Overdue Orders */}
                <div className="kpi-gradient-card bg-red">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><AlertTriangle size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +8%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{overdueCount}</h2>
                        <span className="kpi-label-text">Overdue Orders</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 C20,20 30,30 50,15 C70,0 80,20 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+8%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>

                {/* 10. Completed */}
                <div className="kpi-gradient-card bg-green">
                    <div className="card-top-row">
                        <div className="kpi-glass-icon"><CheckCircle size={20} strokeWidth={2.5}/></div>
                        <div className="kpi-top-right">
                            <span className="kpi-trend-pill">▲ +14%</span>
                            <span className="kpi-dots">•••</span>
                        </div>
                    </div>
                    <div className="card-middle">
                        <h2 className="kpi-val">{completedDeliveriesCount}</h2>
                        <span className="kpi-label-text">Completed</span>
                    </div>
                    <div className="card-bottom-row">
                        <svg className="kpi-mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
                            <path d="M0,25 C20,20 30,30 50,15 C65,5 80,25 100,5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
                            <circle cx="100" cy="5" r="3" fill="white" />
                        </svg>
                        <div className="kpi-trend-footer">
                            <span className="kpi-vs">VS LAST MO.</span>
                            <span className="kpi-pct">+14%</span>
                        </div>
                    </div>
                    <div className="kpi-deco-circle"></div>
                </div>
            </section>

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Purchase Order Summary */}
                <div className="dashboard-card-3d po-summary-card" style={{ padding: '24px' }}>
                    <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Purchase Order Summary</h3>
                    
                    {/* Summary mini cards */}
                    <div className="po-summary-cards-grid">
                        <div className="po-summary-mini-card">
                            <span className="mini-card-label">Total Orders</span>
                            <span className="mini-card-value">{totalPo}</span>
                        </div>
                        <div className="po-summary-mini-card approved">
                            <span className="mini-card-label">Approved Orders</span>
                            <span className="mini-card-value">{poApprovedCount}</span>
                        </div>
                        <div className="po-summary-mini-card pending">
                            <span className="mini-card-label">Pending Orders</span>
                            <span className="mini-card-value">{poDraftCount}</span>
                        </div>
                        <div className="po-summary-mini-card completed">
                            <span className="mini-card-label">Completed Orders</span>
                            <span className="mini-card-value">{poReceivedCount}</span>
                        </div>
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

            <div className="dashboard-card-3d">
                <div className="erp-tabs" style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
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
                <div className="enterprise-table-container">
                    <table className="enterprise-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('orderNumber')} style={{ cursor: 'pointer' }}>Order ID {sortConfig.key === 'orderNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('orderType')} style={{ cursor: 'pointer' }}>Order Type {sortConfig.key === 'orderType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('customerOrVendor')} style={{ cursor: 'pointer' }}>{customerVendorHeader} {sortConfig.key === 'customerOrVendor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th>Quantity</th>
                                <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer' }}>Amount {sortConfig.key === 'totalAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('orderDate')} style={{ cursor: 'pointer' }}>Order Date {sortConfig.key === 'orderDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th onClick={() => handleSort('expectedDeliveryDate')} style={{ cursor: 'pointer' }}>Expected Delivery {sortConfig.key === 'expectedDeliveryDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th>Approvals (Mgr / Emp / Sales)</th>
                                <th>Delivery Status</th>
                                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Final Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="11" style={{ padding: '60px 20px', borderBottom: 'none' }}>
                                    <div style={{ position: 'sticky', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', width: 'max-content' }}>
                                        <div style={{ background: 'var(--bg-hover)', padding: '20px', borderRadius: '50%', color: 'var(--text-muted)' }}>
                                            <ShoppingCart size={48} strokeWidth={1.5} />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>No Orders Available</h3>
                                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.5' }}>There are currently no orders to display.</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedOrders.map((ord) => {
                            const isEmp = userInfo.role === 'Employee';
                            const isSales = userInfo.role === 'Sales';
                            const hideActions = isEmp || isSales;
                            
                            const customerOrVendor = ord.orderType === 'sales' 
                                ? (ord.customer?.company || ord.customer?.name || 'Walk-in')
                                : (ord.vendor?.companyName || ord.vendor?.name || 'Walk-in');
                            const isSalesRole = userInfo.role === 'Sales';
                            
                            const displayStatus = (status) => {
                                const pendingStates = ['Pending', 'Awaiting Approval', 'Awaiting Stock Check'];
                                if (pendingStates.includes(status)) {
                                    return 'Pending';
                                }
                                return status;
                            };
                            
                            const getCustomerName = (order) => {
                                const cId = order.customerId || (order.customer && (order.customer.id || order.customer._id)) || order.customer;
                                const cMatch = customers.find(c => String(c.id || c._id) === String(cId)) || (typeof order.customer === 'object' ? order.customer : null);
                                if (cMatch && cMatch.company) return cMatch.company;
                                if (order.customerName) return order.customerName;
                                if (order.customer && order.customer.name) return order.customer.name;
                                return cMatch && cMatch.name ? cMatch.name : 'Unassigned';
                            };

                            const getVendorName = (order) => {
                                if (order.vendor && order.vendor.name) return order.vendor.name;
                                const vId = order.vendorId || order.vendor;
                                const vMatch = vendors.find(v => String(v.id || v._id) === String(vId));
                                return vMatch ? vMatch.name : 'Unassigned';
                            };
                            
                            const ordType = String(ord.orderType || ord.type || '').toLowerCase();
                            const amount = ord.totalAmount || ord.amount || ord.grandTotal || 0;
                            
                            const currentStatusText = displayStatus(ord.status);
                            const statusClass = currentStatusText.toLowerCase().replace(/ /g, '-');
                            
                            const renderApprovalBadge = (label, status, approverObj, fallbackDate) => {
                                const isApproved = status === 'Approved' || status === 'Submitted';
                                const isRejected = status === 'Rejected';
                                const badgeClass = isApproved ? 'approved' : (isRejected ? 'rejected' : 'pending');
                                const Icon = isApproved ? CheckCircle : (isRejected ? XCircle : Clock);
                                
                                const approverName = approverObj?.name || (status === 'N/A' ? 'N/A' : 'Awaiting Action');
                                const actionDate = approverObj?.date ? new Date(approverObj.date).toLocaleString() : (fallbackDate ? new Date(fallbackDate).toLocaleString() : 'N/A');
                                const notes = ord.notes || 'N/A';

                                return (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                        <span className="text-muted" style={{ fontSize: '11px', fontWeight: '600', width: '36px' }}>{label}:</span>
                                        <div className="approval-tooltip-wrapper">
                                            <span className={`status-badge-inline ${badgeClass}`} style={{ padding: '2px 6px', fontSize: '10px', minWidth: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'help' }}>
                                                <Icon size={12} /> {status}
                                            </span>
                                            <div className="approval-tooltip-content">
                                                <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Icon size={14} /> {label} Details
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '6px', marginTop: '8px' }}>
                                                    <span style={{ color: '#94a3b8' }}>User:</span>
                                                    <span>{approverName}</span>
                                                    
                                                    <span style={{ color: '#94a3b8' }}>Role:</span>
                                                    <span>{approverObj?.role || (label === 'MGR' ? 'Manager' : (label === 'EMP' ? 'Employee' : 'Sales'))}</span>

                                                    <span style={{ color: '#94a3b8' }}>Status:</span>
                                                    <span className={isApproved ? 'text-success' : (isRejected ? 'text-danger' : 'text-warning')} style={{ fontWeight: '600' }}>{status}</span>

                                                    <span style={{ color: '#94a3b8' }}>Date:</span>
                                                    <span>{actionDate}</span>
                                                    
                                                    <span style={{ color: '#94a3b8' }}>Notes:</span>
                                                    <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>{notes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            };
                            
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
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {renderApprovalBadge(
                                                'MGR', 
                                                (ord.managerApproval === 'Approved' || ord.approvalStatus === 'Manager Approved' || ord.approvalStatus === 'Employee Approved' || (ord.orderType === 'purchase' && ord.status === 'Approved')) ? 'Approved' : 'Pending',
                                                ord._approvers?.manager || null,
                                                ord.approvedDate
                                            )}
                                            {renderApprovalBadge(
                                                'EMP', 
                                                (ord.employeeApproval === 'Approved' || ord.approvalStatus === 'Employee Approved') ? 'Approved' : (ord.employeeApproval === 'Rejected' ? 'Rejected' : 'Pending'),
                                                ord._approvers?.employee || null,
                                                ord.updatedAt // fallback since employee doesn't have explicit date
                                            )}
                                            {renderApprovalBadge(
                                                'SALES', 
                                                ord.orderType === 'sales' ? 'Submitted' : 'N/A',
                                                ord._approvers?.creator || null,
                                                ord.orderDate || ord.createdAt
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${String(ord.deliveryStatus || 'Not Started').toLowerCase().replace(/ /g, '-')}`}>{ord.deliveryStatus || "-"}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-inline ${statusClass}`}>{ord.finalStatus || ord.status || "-"}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            {/* Manager Action */}
                                            {(isAdmin || userInfo.role === 'Manager' || userInfo.role === 'Super Admin') && ord.orderType === 'sales' && (ord.approvalStatus === 'Pending Manager Approval' || ord.status === 'Created' || ord.status === 'Pending Approval') && (
                                                <button className="btn-approve" onClick={() => handleStatusChange(ord._id, 'Manager Approved')}>Approve (Manager)</button>
                                            )}

                                            {/* Employee Action */}
                                            {(isAdmin || ['Manager', 'HR', 'Super Admin'].includes(userInfo?.role)) && ord.orderType === 'sales' && ord.approvalStatus === 'Manager Approved' && (
                                                <button className="btn-workflow-confirm" style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleStatusChange(ord._id, 'Employee Approved')}>Approve Stock</button>
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

                                            {/* Employee Purchase Order Approval Action */}
                                            {ord.orderType === 'purchase' && (ord.managerApproval === 'Approved' || ord.status === 'Approved') && (!ord.employeeApproval || ord.employeeApproval === 'Not Started' || ord.employeeApproval === 'Pending') && (isAdmin || ['Manager', 'HR', 'Super Admin'].includes(userInfo?.role)) && (
                                                <>
                                                    <button className="btn-workflow-confirm" style={{ background: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleEmployeePurchaseApproval(ord._id || ord.id, 'Approve')}>Approve (Emp)</button>
                                                    <button className="btn-workflow-confirm" style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }} onClick={() => handleEmployeePurchaseApproval(ord._id || ord.id, 'Reject')}>Reject (Emp)</button>
                                                </>
                                            )}

                                            {/* Track Order Button */}
                                            {((ord.deliveryStatus && !['Not Started'].includes(ord.deliveryStatus)) || ['Cancelled', 'Rejected'].includes(ord.status)) && (
                                                <button className="btn-secondary-light" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }} onClick={() => navigate(`/orders/${ord.id || ord._id}/tracking`)} title="Track Order">
                                                    <Truck size={14} />
                                                </button>
                                            )}

                                            {/* Download Invoice Button */}
                                            {(['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'].includes(ord.status) || ord.invoiceGenerated) && (
                                                <button className="btn-secondary-light" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDownloadInvoice(ord)} title="Download Invoice">
                                                    <Download size={14} />
                                                </button>
                                            )}

                                            {/* Delete Action (Admin/Manager) */}
                                            {(isAdmin || userInfo.role === 'Manager' || userInfo.role === 'Super Admin') && (
                                                <button className="btn-secondary-light" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }} onClick={() => handleDeleteOrder(ord._id || ord.id)} title="Delete Order">
                                                    <Trash2 size={14} />
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
                {/* Pagination Controls */}
                {totalPages > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                                Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} orders
                            </span>
                            <select 
                                value={pageSize} 
                                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer' }}
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                className="btn-secondary-light" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ padding: '0 8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                className="btn-secondary-light" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                            <table className="enterprise-table" >
                                <thead>
                                    <tr>
                                        <th>Invoice ID</th>
                                        <th>Order ID</th>
                                        <th>Organization / Company</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Invoice Date</th>
                                        <th>Due Date</th>
                                        <th>Payment Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {validOrders
                                        .filter(o => invoiceTab === 'All' || o.paymentStatus === invoiceTab || (invoiceTab === 'Pending' && !o.paymentStatus))
                                        .sort((a, b) => new Date(b.invoiceDate || b.createdAt) - new Date(a.invoiceDate || a.createdAt))
                                        .map(o => (
                                        <tr key={o._id}>
                                            <td><strong>{o.invoiceNumber || `INV-${o.orderNumber}`}</strong></td>
                                            <td>{o.orderNumber}</td>
                                            <td>{o.orderType === 'sales' ? (o.customer?.company || o.customer?.companyName || o.customer?.name || 'Unassigned') : (o.vendor?.companyName || o.vendor?.name || 'Unassigned')}</td>
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
                                    {validOrders.filter(o => invoiceTab === 'All' || o.paymentStatus === invoiceTab || (invoiceTab === 'Pending' && !o.paymentStatus)).length === 0 && (
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

            {/* Order Details Modal */}
            {showOrderDetailsModal && selectedOrderDetails && (
                <div className="modal-overlay" style={{ zIndex: 2100 }}>
                    <div className="modal-content animate-pop" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Order Details: {selectedOrderDetails.orderNumber}</h2>
                            <button className="close-btn" onClick={() => setShowOrderDetailsModal(false)}>✕</button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
                                <div>
                                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Organization / Company</p>
                                    <h3 style={{ margin: 0 }}>{selectedOrderDetails.orderType === 'purchase' ? (selectedOrderDetails.vendor?.company || selectedOrderDetails.vendor?.companyName || selectedOrderDetails.vendor?.name || 'Unassigned') : (selectedOrderDetails.customer?.company || selectedOrderDetails.customer?.companyName || selectedOrderDetails.customer?.name || 'Unassigned')}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Status</p>
                                    <span className={`status-badge-inline ${selectedOrderDetails.status.toLowerCase().replace(/ /g, '-')}`}>{selectedOrderDetails.status}</span>
                                </div>
                            </div>
                            
                            <h4 style={{ margin: '0 0 12px 0', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>Items Ordered</h4>
                            <table className="enterprise-table" >
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

                .module-container {
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
                /* Dashboard metrics grid (Modern Bento) */
                .erp-metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                @media (max-width: 1200px) {
                    .erp-metrics-grid { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .erp-metrics-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .erp-metrics-grid { grid-template-columns: 1fr; }
                }

                .kpi-gradient-card {
                    border-radius: var(--radius-xl);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: var(--shadow-lg);
                    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
                    position: relative;
                    overflow: hidden;
                    min-height: 180px;
                    color: white;
                }
                .kpi-gradient-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.2);
                }
                .kpi-gradient-card.span-2 { grid-column: span 2; }
                
                /* Gradient Backgrounds */
                .bg-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
                .bg-green { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
                .bg-orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
                .bg-red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
                
                /* Glassmorphic Decor */
                .kpi-deco-circle {
                    position: absolute;
                    top: -40px;
                    right: -40px;
                    width: 150px;
                    height: 150px;
                    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .card-top-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    position: relative;
                    z-index: 2;
                }
                .kpi-glass-icon {
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    padding: 12px;
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .kpi-top-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .kpi-trend-pill {
                    background: rgba(255, 255, 255, 0.25);
                    backdrop-filter: blur(4px);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11.5px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .kpi-dots {
                    font-size: 16px;
                    letter-spacing: 2px;
                    opacity: 0.8;
                    cursor: pointer;
                }
                
                .card-middle {
                    margin-top: 16px;
                    margin-bottom: 24px;
                    position: relative;
                    z-index: 2;
                }
                .kpi-val {
                    font-size: 36px;
                    font-weight: 800;
                    margin: 0;
                    line-height: 1.1;
                    letter-spacing: -0.5px;
                }
                .kpi-label-text {
                    font-size: 14px;
                    font-weight: 600;
                    opacity: 0.9;
                    display: block;
                    margin-top: 4px;
                }

                .card-bottom-row {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    position: relative;
                    z-index: 2;
                    margin-top: auto;
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                    padding-top: 12px;
                }
                .kpi-mini-chart {
                    height: 30px;
                    width: 90px;
                    overflow: visible;
                }
                .kpi-trend-footer {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .kpi-vs {
                    font-size: 9.5px;
                    font-weight: 700;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .kpi-pct {
                    font-size: 14px;
                    font-weight: 800;
                }
                
                .kpi-icon-wrapper.text-info { color: var(--info); background: var(--info-bg); }
                .kpi-icon-wrapper.text-warning { color: var(--warning); background: var(--warning-bg); }
                .kpi-icon-wrapper.text-danger { color: var(--danger); background: transparent; }
                
                .kpi-value {
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--text-heading);
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                }

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
                
                .po-summary-card {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .po-summary-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 8px;
                }
                
                .po-summary-mini-card {
                    background: var(--bg-hover);
                    border: 1px solid transparent;
                    border-radius: 8px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    transition: transform 0.2s, background 0.2s;
                }
                
                .po-summary-mini-card:hover {
                    background: var(--bg-surface);
                    border-color: var(--border-subtle);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }
                
                .po-summary-mini-card.approved { border-left: 3px solid var(--success); }
                .po-summary-mini-card.pending { border-left: 3px solid var(--info); }
                .po-summary-mini-card.completed { border-left: 3px solid var(--warning); }
                
                .mini-card-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .mini-card-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: var(--text-heading);
                    line-height: 1.2;
                }

                .po-summary-content-area {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 180px;
                    width: 100%;
                    padding-top: 8px;
                }

                .po-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                    gap: 12px;
                    width: 100%;
                    background: var(--bg-body);
                    border: 1px dashed var(--border);
                    border-radius: 12px;
                }
                
                .po-empty-icon {
                    color: var(--text-muted);
                    opacity: 0.5;
                }
                
                .po-empty-state h4 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-secondary);
                }
                
                .po-empty-state p {
                    margin: 0;
                    font-size: 13px;
                    color: var(--text-muted);
                }

                .po-kpi-card {
                    background: var(--bg-body);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 20px;
                    width: 100%;
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), var(--shadow-sm);
                }
                
                .po-kpi-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border);
                }
                
                .po-kpi-header h4 {
                    margin: 0;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }
                
                .status-indicator-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                
                .po-kpi-body {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .kpi-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 14px;
                    padding: 4px 0;
                }
                
                .kpi-label {
                    color: var(--text-secondary);
                    font-weight: 600;
                }
                
                .kpi-value {
                    font-weight: 800;
                    color: var(--text-primary);
                }
                
                .kpi-value.highlighted-status {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .completion-rate-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 12px;
                }
                
                .distribution-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 30px;
                    width: 100%;
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
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-subtle);
                }
                
                .po-table td {
                    padding: 12px 16px;
                    font-size: 13.5px;
                    color: var(--text-primary);
                    border-bottom: 1px solid var(--border-subtle);
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
                    padding: 12px 16px;
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 12px;
                    border-bottom: 1px solid var(--border-subtle);
                }
                
                .modern-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-subtle);
                    font-size: 13.5px;
                    color: var(--text-primary);
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
                    .module-container { padding: 16px; }
                }
                
                @media (max-width: 480px) {
                    .erp-metrics-grid {
                        grid-template-columns: 1fr;
                    }
                    .kpi-gradient-card.span-2 { grid-column: span 1; }
                    .modal-actions { flex-direction: column; }
                    .modal-actions button { width: 100%; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default ERP;
