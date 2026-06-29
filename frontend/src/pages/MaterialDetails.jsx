import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import StandardPageLayout from '../components/StandardPageLayout/StandardPageLayout';
import toast from 'react-hot-toast';
import { Package, Hash, Tag, Building2, TrendingUp, AlertTriangle, CheckCircle, Database } from 'lucide-react';

const MaterialDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterialData = async () => {
            try {
                const { data } = await API.get(`/materials/${id}`);
                setMaterial(data);
            } catch (err) {
                toast.error('Failed to load material details');
                navigate('/materials');
            } finally {
                setLoading(false);
            }
        };
        fetchMaterialData();
    }, [id, navigate]);

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;
    if (!material) return null;

    const stockStatusColor = material.quantity <= material.lowStockThreshold ? '#ef4444' : '#10b981';
    const StockIcon = material.quantity <= material.lowStockThreshold ? AlertTriangle : CheckCircle;

    const infoCard = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={32} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>{material.name}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px', display: 'flex', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={14} /> {material.sku}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={14} /> {material.category}</span>
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ padding: '6px 12px', background: `${stockStatusColor}1A`, color: stockStatusColor, borderRadius: '20px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StockIcon size={16} /> 
                    {material.quantity <= material.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                </span>
                <button onClick={() => navigate(`/materials/${material._id || material.id}/edit`)} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Edit Material
                </button>
            </div>
        </div>
    );

    const sidebarContent = (
        <div className="standard-section">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>Vendor Information</h4>
            {material.vendor ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Building2 size={16} color="#64748b" style={{ marginTop: '2px' }} />
                        <div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '2px' }}>Primary Supplier</div>
                            <div style={{ color: '#0f172a', fontWeight: 500 }}>{material.vendor.name || 'N/A'}</div>
                        </div>
                    </div>
                    <button onClick={() => navigate(`/vendors/${material.vendor._id || material.vendor.id || material.vendor}`)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        View Vendor
                    </button>
                </div>
            ) : (
                <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No vendor assigned to this material.</p>
            )}
        </div>
    );

    return (
        <StandardPageLayout
            title="Material Details"
            breadcrumbs={[
                { label: 'Procurement', path: '/materials' },
                { label: 'Materials', path: '/materials' },
                { label: material.name }
            ]}
            infoCard={infoCard}
            sidebarContent={sidebarContent}
            onCancel={() => navigate('/materials')}
        >
            <div className="standard-section">
                <div className="standard-section-header">Inventory Status</div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Database size={16} /> Current Stock</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{material.quantity} <span style={{fontSize:'16px', color:'#64748b', fontWeight:'normal'}}>{material.unit || 'pcs'}</span></div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> Low Stock Threshold</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>{material.lowStockThreshold} <span style={{fontSize:'14px', color:'#64748b', fontWeight:'normal'}}>{material.unit || 'pcs'}</span></div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', flex: 1, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> Unit Price</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>₹{material.price || 0}</div>
                    </div>
                </div>
                
                <div style={{ marginTop: '24px', padding: '16px', background: material.quantity <= material.lowStockThreshold ? '#fef2f2' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${material.quantity <= material.lowStockThreshold ? '#fecaca' : '#bbf7d0'}`, display: 'flex', gap: '12px' }}>
                    <StockIcon size={24} color={stockStatusColor} />
                    <div>
                        <h5 style={{ margin: '0 0 4px 0', color: stockStatusColor, fontSize: '16px' }}>{material.quantity <= material.lowStockThreshold ? 'Restock Required' : 'Healthy Stock Level'}</h5>
                        <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                            {material.quantity <= material.lowStockThreshold 
                                ? `Current stock (${material.quantity} ${material.unit}) has fallen below the minimum threshold of ${material.lowStockThreshold} ${material.unit}. Consider creating a purchase order.` 
                                : `Current stock is adequately maintained above the minimum threshold.`}
                        </p>
                    </div>
                </div>
            </div>
        </StandardPageLayout>
    );
};

export default MaterialDetails;
