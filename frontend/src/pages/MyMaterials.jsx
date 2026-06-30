import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, CheckCircle, Clock, CornerUpLeft, Printer } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { DataTable } from '../components/ui';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const MyMaterials = () => {
    const [requests, setRequests] = useState([]);
    const [materialsList, setMaterialsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ materialId: '', requiredQuantity: 1, reason: '' });
    const [submitting, setSubmitting] = useState(false);
    const location = useLocation();

    let pageTitle = "My Material Requests";
    let pageBadge = "REQUESTS";
    if (location.pathname.includes('/inventory')) {
        pageTitle = "My Assigned Inventory";
        pageBadge = "INVENTORY";
    } else if (location.pathname.includes('/stock')) {
        pageTitle = "My Stock Monitoring";
        pageBadge = "STOCK";
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, matRes] = await Promise.all([
                API.get('/stock-requests'),
                API.get('/materials/list')
            ]);
            setRequests(reqRes.data || []);
            setMaterialsList(matRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load your materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await API.post('/stock-requests', formData);
            toast.success("Material request submitted successfully");
            setShowModal(false);
            setFormData({ materialId: '', requiredQuantity: 1, reason: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReceive = async (id) => {
        try {
            await API.put(`/stock-requests/${id}/employee-receive`);
            toast.success("Material received successfully");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to receive material");
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm("Are you sure you want to request a return for this material?")) return;
        try {
            await API.put(`/stock-requests/${id}/request-return`);
            toast.success("Return requested successfully");
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to request return");
        }
    };

    const handlePrint = (row) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Material Request Receipt</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                        p { margin: 8px 0; line-height: 1.5; }
                        .label { font-weight: bold; width: 120px; display: inline-block; }
                    </style>
                </head>
                <body>
                    <h2>Material Request Details</h2>
                    <p><span class="label">Material:</span> ${row.material?.name || 'N/A'}</p>
                    <p><span class="label">Quantity:</span> ${row.requiredQuantity}</p>
                    <p><span class="label">Status:</span> ${row.status}</p>
                    <p><span class="label">Date:</span> ${new Date(row.createdAt).toLocaleDateString()}</p>
                    <p><span class="label">Reason:</span> ${row.reason}</p>
                    <p style="margin-top: 40px; font-size: 12px; color: #64748b;">Printed on ${new Date().toLocaleString()}</p>
                    <script>
                        window.onload = () => { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'Manager Approved': return '#3b82f6';
            case 'Rejected': return '#ef4444';
            case 'Processing': return '#8b5cf6';
            case 'Dispatched': return '#ec4899';
            case 'Delivered': return '#10b981';
            case 'Completed': return '#059669';
            case 'Cancelled': return '#64748b';
            default: return '#64748b';
        }
    };

    const columns = [
        { key: 'material.name', label: 'Material' },
        { key: 'requiredQuantity', label: 'Quantity' },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => (
                <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    backgroundColor: `${getStatusColor(val)}20`,
                    color: getStatusColor(val)
                }}>
                    {val}
                </span>
            )
        },
        { key: 'createdAt', label: 'Date Requested', render: (val) => new Date(val).toLocaleDateString() },
        { key: 'reason', label: 'Reason' },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => handlePrint(row)}
                        className="rd-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Print Details"
                    >
                        <Printer size={14} /> Print
                    </button>
                    {row.status === 'Delivered' && (
                        <button 
                            onClick={() => handleReceive(row.id || row._id)}
                            className="rd-btn primary"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                            Mark as Received
                        </button>
                    )}
                    {row.status === 'Completed' && (
                        <button 
                            onClick={() => handleReturn(row.id || row._id)}
                            className="rd-btn"
                            style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Request Return"
                        >
                            <CornerUpLeft size={14} /> Return
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="rd-container">
            <div className="rd-header">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">{pageTitle}</span>
                            <span className="rd-module-badge">{pageBadge}</span>
                        </div>
                    </div>
                </div>
                <div className="rd-header-right">
                    <button className="rd-btn primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> New Request
                    </button>
                </div>
            </div>

            <div className="rd-section">
                <div className="rd-card">
                    <h2 className="rd-h2" style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>Your Material Requests</h2>
                    <DataTable 
                        columns={columns} 
                        data={requests} 
                        loading={loading}
                        searchPlaceholder="Search requests..."
                        searchKeys={['material.name', 'status', 'reason']}
                    />
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '16px', padding: '32px',
                        width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 className="rd-h2" style={{ marginBottom: '24px' }}>Submit Material Request</h2>
                        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="rd-label">Material</label>
                                <select 
                                    className="rd-input"
                                    required
                                    value={formData.materialId}
                                    onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                                >
                                    <option value="">Select a material</option>
                                    {materialsList.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="rd-label">Quantity</label>
                                <input 
                                    type="number"
                                    className="rd-input"
                                    min="1"
                                    required
                                    value={formData.requiredQuantity}
                                    onChange={(e) => setFormData({...formData, requiredQuantity: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="rd-label">Reason / Justification</label>
                                <textarea 
                                    className="rd-input"
                                    rows="3"
                                    required
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button type="button" className="rd-btn secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="rd-btn primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyMaterials;
