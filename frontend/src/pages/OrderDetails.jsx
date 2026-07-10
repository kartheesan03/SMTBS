import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { ShoppingCart, FileText, Truck, Calendar, DollarSign, User, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';
import DataTable from '../components/Dashboard/DataTable';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Setup custom truck icon
const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2769/2769339.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

const OrderDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liveData, setLiveData] = useState(null);

    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const { data } = await API.get(`/orders`);
                let fetchedOrders = [];
                if (Array.isArray(data)) fetchedOrders = data;
                else if (data && Array.isArray(data.orders)) fetchedOrders = data.orders;
                else if (data && Array.isArray(data.data)) fetchedOrders = data.data;

                const match = fetchedOrders.find(o => String(o._id) === id || String(o.id) === id);
                if (match) {
                    setOrder(match);
                    if (match.status === 'Out for Delivery') {
                        pollLocation();
                    }
                } else {
                    toast.error('Order not found');
                    navigate('/erp');
                }
            } catch (err) {
                toast.error('Failed to load order details');
                navigate('/erp');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderData();
        
        let interval;
        if (order?.status === 'Out for Delivery') {
            interval = setInterval(pollLocation, 5000);
        }
        return () => clearInterval(interval);
    }, [id, navigate, order?.status]);

    const pollLocation = async () => {
        try {
            const loc = await API.get(`/orders/${id}/location`);
            setLiveData(loc.data);
        } catch (e) {
            console.error('Error polling location', e);
        }
    };

    const handleFlagDelayed = async () => {
        try {
            await API.put(`/orders/${id}/delay`, { reason: 'Flagged by Sales' });
            toast.success('Order flagged as delayed');
            pollLocation();
        } catch (err) {
            toast.error('Failed to flag order');
        }
    };

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;
    if (!order) return null;

    const isSales = order.orderType === 'sales';
    const entityName = isSales 
        ? (order.customer?.company || order.customer?.name || order.customerName || 'Walk-in') 
        : (order.vendor?.companyName || order.vendor?.name || order.vendorName || 'Walk-in');

    const handleDownloadInvoice = () => {
        const doc = new jsPDF();
        const invoiceNum = order.invoiceNumber || `INV-${order.orderNumber}`;
        const isPurchase = order.orderType === 'purchase';

        let billToName = isPurchase ? (order.vendor?.companyName || order.vendor?.name || order.vendorName || 'Unassigned') : (order.customer?.company || order.customer?.companyName || order.customer?.name || order.customerName || 'Unassigned');
        let billToEmail = isPurchase ? (order.vendor?.email || order.vendorEmail || '') : (order.customer?.email || order.customerEmail || '');
        let billToPhone = isPurchase ? (order.vendor?.phone || order.vendorPhone || '') : (order.customer?.phone || order.customerPhone || '');
        let billToAddress = isPurchase ? (order.vendor?.address || order.vendorAddress || '') : (order.customer?.address || order.customerAddress || '');

        doc.setFontSize(20);
        doc.text('INVOICE', 14, 22);
        doc.setFontSize(10);
        doc.text(`Invoice Number: ${invoiceNum}`, 14, 32);
        doc.text(`Order Number: ${order.orderNumber}`, 14, 38);
        doc.text(`Date: ${order.invoiceDate ? new Date(order.invoiceDate).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}`, 14, 44);
        doc.text(`Status: ${order.paymentStatus || 'Pending'}`, 14, 50);

        doc.setFontSize(12);
        doc.text('Bill To:', 14, 65);
        doc.setFontSize(10);
        doc.text(billToName, 14, 72);
        
        let yPos = 78;
        if (billToEmail) { doc.text(`Email: ${billToEmail}`, 14, yPos); yPos += 5; }
        if (billToPhone) { doc.text(`Phone: ${billToPhone}`, 14, yPos); yPos += 5; }
        if (billToAddress) {
            const splitAddress = doc.splitTextToSize(`Address: ${billToAddress}`, 80);
            doc.text(splitAddress, 14, yPos);
            yPos += (splitAddress.length * 5);
        }

        const tableStartY = Math.max(91, yPos + 5);
        let grandTotal = 0;
        const tableRows = [];
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                let materialName = item.material?.name || item.materialName || 'Material';
                let price = item.price || item.material?.price || 0;
                const itemTotal = item.quantity * price;
                grandTotal += itemTotal;
                tableRows.push([materialName, item.quantity.toString(), `Rs. ${price.toLocaleString()}`, `Rs. ${itemTotal.toLocaleString()}`]);
            });
        }
        
        doc.autoTable({
            head: [['Item', 'Qty', 'Unit Price', 'Total']],
            body: tableRows,
            startY: tableStartY,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] }
        });

        doc.setFontSize(12);
        doc.text(`Grand Total: Rs. ${(order.totalAmount || grandTotal).toLocaleString()}`, 14, doc.lastAutoTable.finalY + 15);
        doc.save(`Invoice_${invoiceNum}.pdf`);
        toast.success("Invoice Downloaded!");
    };

    const infoCard = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: isSales ? '#e0e7ff' : '#dcfce7', borderRadius: '12px', color: isSales ? '#4f46e5' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={32} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{order.orderNumber}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {isSales ? <User size={14} /> : <Building2 size={14} />} {entityName}
                        </span>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ padding: '6px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '14px', fontWeight: 500 }}>
                    {order.status || 'Pending'}
                </span>
                <button onClick={() => navigate(`/orders/${order._id || order.id}/tracking`)} style={{ padding: '8px 16px', background: '#f8fafc', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} /> Track Order
                </button>
                <button onClick={handleDownloadInvoice} style={{ padding: '8px 16px', background: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> Invoice
                </button>
            </div>
        </div>
    );

    const sidebarContent = (
        <div className="standard-section">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>{isSales ? 'Customer' : 'Vendor'} Information</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    {isSales ? <User size={16} color="#64748b" style={{ marginTop: '2px' }} /> : <Building2 size={16} color="#64748b" style={{ marginTop: '2px' }} />}
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Name / Company</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{entityName}</div>
                    </div>
                </div>
            </div>
            
            <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #e2e8f0' }} />
            
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>Order Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Calendar size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Created On</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Truck size={16} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Expected Delivery</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const items = order.items || [];
    const itemColumns = [
        { key: 'material', label: 'Material / Item', render: (val, row) => val?.name || row.materialName || 'Unknown Material' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'price', label: 'Unit Price', render: (val, row) => `₹${(val || row.material?.price || 0).toLocaleString()}` },
        { key: 'total', label: 'Total', render: (_, row) => `₹${((row.price || row.material?.price || 0) * row.quantity).toLocaleString()}` }
    ];

    return (
        <StandardPageLayout
            title={`${isSales ? 'Sales' : 'Purchase'} Order Details`}
            breadcrumbs={[
                { label: 'ERP', path: '/erp' },
                { label: order.orderNumber }
            ]}
            infoCard={infoCard}
            sidebarContent={sidebarContent}
            onCancel={() => navigate('/erp')}
        >
            <div className="standard-section">
                <div className="standard-section-header">Financial Summary</div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><ShoppingCart size={16} /> Total Items</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{items.length}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> Order Value</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>₹{(order.totalAmount || order.amount || order.grandTotal || 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="standard-section">
                <div className="standard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Order Items</span>
                </div>
                {items.length > 0 ? (
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                        <DataTable 
                            columns={itemColumns}
                            data={items}
                            searchPlaceholder="Search items..."
                            actions={[]}
                        />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                        <ShoppingCart size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No items found for this order.</p>
                    </div>
                )}
            </div>
            
            {order.notes && (
                <div className="standard-section">
                    <div className="standard-section-header">Notes / Instructions</div>
                    <p style={{ margin: 0, color: '#334155', lineHeight: '1.6', background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                        {order.notes}
                    </p>
                </div>
            )}

            {(order.status === 'Out for Delivery' || (liveData && liveData.liveLocation)) && (
                <div className="standard-section">
                    <div className="standard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Live Delivery Tracking</span>
                        {liveData?.trackingStatus !== 'Delayed' && liveData?.trackingStatus !== 'Delivered' && (
                            <button onClick={handleFlagDelayed} style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                                Flag as Delayed
                            </button>
                        )}
                    </div>
                    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        {liveData?.liveLocation ? (
                            <MapContainer center={[liveData.liveLocation.lat, liveData.liveLocation.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                <Marker position={[liveData.liveLocation.lat, liveData.liveLocation.lng]} icon={truckIcon}>
                                    <Popup>
                                        <strong>{liveData.trackingStatus}</strong><br/>
                                        ETA: {liveData.deliveryETA ? new Date(liveData.deliveryETA).toLocaleTimeString() : 'N/A'}<br/>
                                        Remaining: {liveData.distanceRemaining?.toFixed(1)} km
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Waiting for GPS signal...</div>
                        )}
                    </div>
                </div>
            )}
        </StandardPageLayout>
    );
};

export default OrderDetails;
