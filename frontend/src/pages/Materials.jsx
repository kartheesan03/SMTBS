import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, Edit, Trash2, Eye, Plus, CheckCircle } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../components/ui';
import { motion } from 'framer-motion';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const Materials = () => {
    const navigate = useNavigate();
    const [materialsData, setMaterialsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/materials');
            setMaterialsData(data);
        } catch (error) {
            console.error("Failed to fetch materials:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDelete = async (row) => {
        const id = row._id || row.id;
        if (!id) return toast.error("Invalid item ID");
        
        if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
            try {
                await API.delete(`/materials/${id}`);
                toast.success("Material deleted successfully");
                fetchMaterials();
            } catch (error) {
                console.error("Failed to delete:", error);
                toast.error("Failed to delete material");
            }
        }
    };

    const getComputedStatus = (item) => {
        if (item.quantity === 0) return 'Out of Stock';
        if (item.quantity <= (item.lowStockThreshold || 10)) return 'Low Stock';
        return 'In Stock';
    };

    const columns = [
        { 
            key: 'sku', 
            label: 'Mat. ID', 
            sortable: true,
            render: (val) => <span style={{fontWeight: 700, color: '#3b82f6', cursor: 'pointer'}}>{val}</span>
        },
        { 
            key: 'name', 
            label: 'Material', 
            sortable: true,
            render: (val) => <span style={{fontWeight: 600, color: '#0f172a'}}>{val}</span>
        },
        { 
            key: 'category', 
            label: 'Category', 
            sortable: true,
            render: (val) => <span style={{color: '#64748b'}}>{val || '—'}</span>
        },
        {
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
            align: 'right',
            render: (val, row) => <div style={{fontWeight: 500}}>{val} <span style={{fontSize: 10, color: '#94a3b8'}}>{row.unit || 'units'}</span></div>
        },
        {
            key: 'location',
            label: 'Location',
            sortable: true,
            render: (val) => <span style={{color: '#64748b'}}>{val || 'Warehouse A'}</span>
        },
        { 
            key: 'price', 
            label: 'Unit Price', 
            sortable: true,
            align: 'right',
            render: (val) => <div style={{color: '#64748b'}}>₹{val || 0}</div>
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (_, row) => {
                const status = getComputedStatus(row);
                let badgeClass = 'default';
                if (status === 'In Stock') badgeClass = 'success';
                else if (status === 'Low Stock') badgeClass = 'warning';
                else if (status === 'Out of Stock') badgeClass = 'danger';
                return <span className={`ui-badge ${badgeClass}`} style={{padding: '4px 8px', fontSize: 11}}>{status}</span>;
            }
        },
        {
            key: 'lastUpdated',
            label: 'Last Updated',
            render: () => <span style={{fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap'}}>2 hours ago</span>
        },
        {
            key: 'action',
            label: 'Action',
            align: 'center',
            render: (_, row) => (
                <div style={{display: 'flex', gap: 4, justifyContent: 'center'}}>
                    <button 
                        className="rd-btn-compact outline" 
                        style={{padding: '4px 8px', fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer'}}
                        onClick={(e) => { e.stopPropagation(); navigate(`/materials/${row._id || row.id}`); }}
                    >
                        Preview
                    </button>
                    <button 
                        className="rd-btn-compact outline" 
                        style={{padding: '4px 8px', fontSize: 11, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer'}}
                        onClick={(e) => { e.stopPropagation(); toast.success("Printing barcode..."); }}
                    >
                        Print
                    </button>
                </div>
            )
        }
    ];

    // Dynamic Trend generator for UI
    

    const totalItems = materialsData.length;
    const inStock = materialsData.filter(m => getComputedStatus(m) === 'In Stock').length;
    const lowStock = materialsData.filter(m => getComputedStatus(m) === 'Low Stock').length;
    const outOfStock = materialsData.filter(m => getComputedStatus(m) === 'Out of Stock').length;

    return (
        <div className="rd-container">
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Inventory Management</span>
                            <span className="rd-module-badge">INVENTORY</span>
                        </div>
                        </div>
                </div>

                <PastelKPIGrid>
                    <PastelKPICard
                        title="Total Items" value={totalItems}
                        colorTheme="blue" icon={Package}
                        trendValue="Inventory tracking active"
                        trendPositive={true}
                        onClick={() => navigate('/materials')}
                    />
                    <PastelKPICard
                        title="In Stock" value={inStock}
                        colorTheme="mint" icon={CheckCircle}
                        trendValue={`${totalItems ? Math.round((inStock/totalItems)*100) : 0}% of inventory`}
                        trendPositive={true}
                        onClick={() => navigate('/materials')}
                    />
                    <PastelKPICard
                        title="Low Stock" value={lowStock}
                        colorTheme="yellow" icon={AlertTriangle}
                        trendValue={`${totalItems ? Math.round((lowStock/totalItems)*100) : 0}% need attention`}
                        trendPositive={false}
                        onClick={() => navigate('/materials')}
                    />
                    <PastelKPICard
                        title="Out of Stock" value={outOfStock}
                        colorTheme="peach" icon={XCircle}
                        trendValue={`${totalItems ? Math.round((outOfStock/totalItems)*100) : 0}% critical`}
                        trendPositive={false}
                        onClick={() => navigate('/materials')}
                    />
                </PastelKPIGrid>

                <div style={{ marginTop: '24px' }}>
                    {loading ? (
                        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ height: 20, width: 150, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                    <div style={{ height: 14, width: 250, background: '#f1f5f9', borderRadius: 4, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                </div>
                                <div style={{ height: 38, width: 120, background: '#e2e8f0', borderRadius: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                            </div>
                            <div style={{ padding: '24px' }}>
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} style={{ height: 40, background: '#f8fafc', borderRadius: 8, marginBottom: 12, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <DataTable 
                            title="Inventory Register"
                            subtitle="Comprehensive list of all materials in stock"
                            columns={columns}
                            data={materialsData}
                            searchPlaceholder="Search by item code or name..."
                            expandableRowRender={(row) => (
                                <div style={{ padding: '16px 24px', display: 'flex', gap: '32px', fontSize: '13px', color: '#475569' }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Supplier Info</div>
                                        <div style={{ fontWeight: 500 }}>{row.vendor?.name || 'Local Vendor'}</div>
                                        <div>{row.vendor?.contactPerson || 'Contact'} • {row.vendor?.phone || '+91 0000000000'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Barcode Data</div>
                                        <div style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: 4 }}>
                                            {row.sku}-{row._id ? String(row._id).substring(0,6) : (row.id ? String(row.id).substring(0,6) : '100A')}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Stock History</div>
                                        <div>Last restocked on {new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>
                            )}
                            primaryAction={{
                                label: 'Add Material',
                                icon: Plus,
                                onClick: () => navigate('/materials/new')
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Materials;
