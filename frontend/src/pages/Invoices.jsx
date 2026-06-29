import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import DataTable from '../components/Dashboard/DataTable';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const Invoices = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await API.get('/orders');
            let extractedOrders = [];
            if (Array.isArray(res.data)) extractedOrders = res.data;
            else if (res.data && Array.isArray(res.data.orders)) extractedOrders = res.data.orders;
            else if (res.data && Array.isArray(res.data.data)) extractedOrders = res.data.data;
            setOrders(extractedOrders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDownloadInvoice = (order) => {
        if (!order) return;
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

        doc.save(`Invoice_${invoiceNum}.pdf`);
        toast.success("Invoice Downloaded!");
    };

    const handleRowAction = (action, row) => {
        if (action === 'download') {
            handleDownloadInvoice(row);
        } else if (action === 'view') {
            navigate(`/orders/${row._id || row.id}`);
        }
    };

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: (val, row) => val || `INV-${row.orderNumber}` },
        { key: 'orderNumber', label: 'Order ID' },
        { 
            key: 'customerOrVendor', 
            label: 'Billed To',
            render: (_, row) => row.orderType === 'sales' ? (row.customer?.company || row.customer?.name || 'Walk-in') : (row.vendor?.companyName || row.vendor?.name || 'Walk-in')
        },
        { 
            key: 'totalAmount', 
            label: 'Amount',
            render: (_, row) => `₹${(row.totalAmount || row.amount || row.grandTotal || 0).toLocaleString()}`
        },
        { 
            key: 'createdAt', 
            label: 'Date',
            render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
        }
    ];

    if (loading) return <div className="flex-center" style={{height:'100vh', flexDirection:'column'}}><div className="loader"></div></div>;

    return (
        <StandardPageLayout
            title="Invoices"
            subtitle="Manage and generate invoices for your orders."
            breadcrumbs={[
                { label: 'Finance', path: '/invoices' },
                { label: 'Invoices' }
            ]}
            onCancel={() => navigate('/')}
        >
            <div className="standard-section">
                <div className="standard-section-header">All Invoices</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <DataTable 
                        columns={columns} 
                        data={orders} 
                        searchPlaceholder="Search invoices..." 
                        onAction={handleRowAction}
                        actions={['view', 'download']}
                        customActionIcons={{
                            download: <Download size={14} />,
                            view: <FileText size={14} />
                        }}
                    />
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default Invoices;
