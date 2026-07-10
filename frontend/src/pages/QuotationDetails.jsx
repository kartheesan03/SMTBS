import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Download, CheckCircle, ArrowLeft, Clock, FileText } from 'lucide-react';
import { PageContainer, PageHeader, DetailViewContainer, ProfileHeader, KeyValueCard } from '../components/ui';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Badge = ({ children, type = 'default' }) => (
    <span className={`ui-badge ${type}`}>
        {children}
    </span>
);

const QuotationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState(false);

    useEffect(() => {
        const fetchQuotation = async () => {
            try {
                const { data } = await API.get(`/quotations/${id}`);
                setQuotation(data);
            } catch (err) {
                toast.error('Failed to load quotation details');
                navigate('/quotations');
            } finally {
                setLoading(false);
            }
        };
        fetchQuotation();
    }, [id, navigate]);

    const handleConvertToOrder = async () => {
        if (!window.confirm('Are you sure you want to convert this quotation into a Sales Order?')) return;
        
        setConverting(true);
        try {
            const { data } = await API.post(`/quotations/${id}/convert`);
            toast.success('Successfully converted to Sales Order!');
            
            // Navigate to the new order
            navigate(`/orders/${data.order._id || data.order.id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Conversion failed');
        } finally {
            setConverting(false);
        }
    };

    const generatePDF = () => {
        if (!quotation) return;

        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('QUOTATION', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Quote Number: ${quotation.quotationNumber}`, 14, 30);
        doc.text(`Date: ${new Date(quotation.date).toLocaleDateString()}`, 14, 35);
        doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 14, 40);

        // Customer Info
        doc.setFontSize(12);
        doc.text('Bill To:', 14, 55);
        doc.setFontSize(10);
        doc.text(quotation.customerName || 'Customer', 14, 62);
        if (quotation.customer?.email) doc.text(quotation.customer.email, 14, 67);
        if (quotation.customer?.phone) doc.text(quotation.customer.phone, 14, 72);

        // Items Table
        const tableColumn = ["Item", "Qty", "Unit Price", "Discount", "Total"];
        const tableRows = [];

        quotation.items.forEach(item => {
            const rowData = [
                item.materialName,
                item.quantity,
                `Rs. ${item.unitPrice.toFixed(2)}`,
                `${item.discountPercent}%`,
                `Rs. ${item.total.toFixed(2)}`
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            startY: 85,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [91, 71, 194] }
        });

        const finalY = doc.lastAutoTable.finalY || 85;
        
        // Totals
        doc.text(`Subtotal: Rs. ${quotation.subTotal.toFixed(2)}`, 140, finalY + 10);
        doc.text(`Tax: Rs. ${quotation.taxAmount.toFixed(2)}`, 140, finalY + 17);
        doc.setFontSize(12);
        doc.text(`Grand Total: Rs. ${quotation.grandTotal.toFixed(2)}`, 140, finalY + 25);

        // Notes & Terms
        doc.setFontSize(10);
        if (quotation.notes) {
            doc.text('Notes:', 14, finalY + 10);
            doc.text(doc.splitTextToSize(quotation.notes, 100), 14, finalY + 15);
        }

        doc.text('Terms & Conditions:', 14, finalY + 40);
        doc.text(doc.splitTextToSize(quotation.termsAndConditions, 180), 14, finalY + 45);

        doc.save(`${quotation.quotationNumber}.pdf`);
    };

    if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>Loading...</div>;
    if (!quotation) return null;

    const isConvertible = quotation.status === 'Sent' || quotation.status === 'Accepted' || quotation.status === 'Draft';

    const headerActions = [
        { label: 'Download PDF', icon: Download, onClick: generatePDF },
        { 
            label: 'Convert to Order', 
            icon: CheckCircle, 
            primary: true, 
            onClick: handleConvertToOrder,
            disabled: !isConvertible || converting
        }
    ];

    return (
        <PageContainer>
            <PageHeader 
                title="Quotation Details" 
                subtitle={quotation.quotationNumber}
                actions={[{ label: 'Back', icon: ArrowLeft, onClick: () => navigate('/quotations') }]}
            />

            <DetailViewContainer>
                <ProfileHeader 
                    title={quotation.customerName}
                    subtitle={`Generated by ${quotation.createdByName || 'System'}`}
                    avatarText={quotation.customerName.substring(0, 2).toUpperCase()}
                    badges={[
                        { label: quotation.status, type: quotation.status === 'Converted' ? 'info' : quotation.status === 'Expired' ? 'warning' : 'primary' }
                    ]}
                    actions={headerActions}
                />

                <div className="ui-grid-2" style={{padding: '24px'}}>
                    <KeyValueCard 
                        title="Quote Information" 
                        items={[
                            { label: 'Issue Date', value: new Date(quotation.date).toLocaleDateString() },
                            { label: 'Valid Until', value: new Date(quotation.validUntil).toLocaleDateString() },
                            { label: 'Subtotal', value: `₹${quotation.subTotal.toFixed(2)}` },
                            { label: 'Grand Total', value: `₹${quotation.grandTotal.toFixed(2)}` }
                        ]} 
                    />

                    <div className="ui-card" style={{padding: '24px'}}>
                        <h3 style={{marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600'}}>Line Items</h3>
                        <div style={{overflowX: 'auto'}}>
                            <table className="ui-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.materialName}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.unitPrice.toFixed(2)}</td>
                                            <td style={{fontWeight: '500'}}>₹{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {(quotation.notes || quotation.termsAndConditions) && (
                    <div style={{padding: '0 24px 24px 24px'}}>
                        <div className="ui-card" style={{padding: '24px'}}>
                            {quotation.notes && (
                                <div style={{marginBottom: '20px'}}>
                                    <h4 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#4B5563'}}>Notes</h4>
                                    <p style={{margin: 0, fontSize: '14px', color: '#111827'}}>{quotation.notes}</p>
                                </div>
                            )}
                            {quotation.termsAndConditions && (
                                <div>
                                    <h4 style={{margin: '0 0 8px 0', fontSize: '14px', color: '#4B5563'}}>Terms & Conditions</h4>
                                    <p style={{margin: 0, fontSize: '14px', color: '#111827'}}>{quotation.termsAndConditions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </DetailViewContainer>
        </PageContainer>
    );
};

export default QuotationDetails;
