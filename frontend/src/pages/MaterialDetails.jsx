import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Package, Hash, Tag, Building2, TrendingUp, AlertTriangle, CheckCircle, Database, Edit, ArrowLeft } from 'lucide-react';
import { DetailViewContainer, ProfileHeader, Tabs, KeyValueCard, Timeline } from '../components/ui';

const MaterialDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeline, setTimeline] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMaterialData = async () => {
            try {
                const { data } = await API.get(`/materials/${id}`);
                const timelineRes = await API.get(`/materials/${id}/timeline`).catch(e => ({ data: [] }));
                setTimeline(timelineRes.data || []);
                setMaterial(data);
            } catch (err) {
                console.error("Material details error:", err);
                const errMsg = err.response?.data?.message || 'Failed to load material details. Please check if the material exists.';
                toast.error(errMsg);
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterialData();
    }, [id]);

    if (loading) return <div className="flex-center" style={{ padding: '100px' }}><div className="loader"></div></div>;
    
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 24px', maxWidth: '600px', margin: '0 auto' }}>
                <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>Material Not Found</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
                <button className="ui-btn-primary" onClick={() => navigate('/materials')}>
                    Back to Inventory
                </button>
            </div>
        );
    }
    
    if (!material) return null;

    const isLowStock = material.quantity <= (material.lowStockThreshold || 10);
    const stockStatus = isLowStock ? 'Low Stock' : 'In Stock';
    const badges = [
        { label: stockStatus, type: isLowStock ? 'warning' : 'success' },
        { label: material.category, type: 'info' }
    ];

    const actions = [
        { label: 'Edit Material', icon: Edit, primary: true, onClick: () => navigate(`/materials/${material._id || material.id}/edit`) }
    ];

    const overviewContent = (
        <div className="ui-grid-2">
            <KeyValueCard 
                title="Inventory Status" 
                items={[
                    { label: 'Current Stock', value: `${material.quantity} ${material.unit || 'pcs'}` },
                    { label: 'Low Stock Threshold', value: `${material.lowStockThreshold || 10} ${material.unit || 'pcs'}` },
                    { label: 'Stock Valuation', value: `₹${(material.quantity * material.price).toLocaleString()}` },
                    { label: 'Status', value: stockStatus }
                ]} 
            />
            
            <KeyValueCard 
                title="Material Information" 
                items={[
                    { label: 'Item Name', value: material.name },
                    { label: 'SKU / Barcode', value: material.sku },
                    { label: 'Category', value: material.category },
                    { label: 'Unit Price', value: `₹${material.price}` }
                ]} 
            />
            
            <KeyValueCard 
                title="Vendor Details" 
                items={[
                    { label: 'Primary Supplier', value: material.vendor?.name || 'No vendor assigned' },
                    { label: 'Vendor Email', value: material.vendor?.email || 'N/A' },
                    { label: 'Vendor Phone', value: material.vendor?.phone || 'N/A' }
                ]} 
            />
        </div>
    );

    
    

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Database, content: overviewContent },
        { id: 'history', label: 'Stock History', icon: TrendingUp, content: <Timeline items={timeline.map((t, i) => ({ id: t.id || i, time: t.date ? new Date(t.date).toLocaleDateString() : t.time, title: t.action || 'Event', description: t.description || 'System action', color: '#3b82f6' }))} /> }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
                <button 
                    className="rd-back-btn"
                    onClick={() => navigate('/materials')}
                >
                    <ArrowLeft size={18} />
                    Back to Inventory
                </button>
            </div>
            <DetailViewContainer>
                <ProfileHeader 
                    title={material.name}
                    subtitle={`SKU: ${material.sku}`}
                    badges={badges}
                    actions={actions}
                />
                <Tabs tabs={tabs} />
            </DetailViewContainer>
        </div>
    );
};

export default MaterialDetails;
