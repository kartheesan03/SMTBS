import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight, Edit, Trash2, Eye, Plus, CheckCircle, Database } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../components/ui';
import { motion } from 'framer-motion';
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

    // Columns configuration for DataTable
    const columns = [
        { key: 'sku', label: 'Item Code', sortable: true },
        { 
            key: 'name', 
            label: 'Material Name', 
            sortable: true,
            render: (val, row) => (
                <div>
                    <div style={{fontWeight: 600, color: '#0f172a'}}>{val}</div>
                    <div style={{fontSize: 12, color: '#64748b'}}>Qty: {row.quantity} {row.unit || 'Units'}</div>
                </div>
            )
        },
        { key: 'category', label: 'Category', sortable: true },
        { 
            key: 'status', 
            label: 'Stock Status',
            render: (_, row) => {
                const status = getComputedStatus(row);
                let badgeClass = 'default';
                if (status === 'In Stock') badgeClass = 'success';
                else if (status === 'Low Stock') badgeClass = 'warning';
                else if (status === 'Out of Stock') badgeClass = 'danger';
                return <span className={`ui-badge ${badgeClass}`}>{status}</span>;
            }
        },
        { 
            key: 'price', 
            label: 'Unit Price', 
            sortable: true,
            render: (val) => <span style={{fontWeight: 600}}>₹{val}</span>
        }
    ];

    // Action menu configuration
    const actions = [
        { label: 'View Details', icon: Eye, onClick: (row) => navigate(`/materials/${row._id || row.id}`) },
        { label: 'Edit', icon: Edit, onClick: (row) => navigate(`/materials/${row._id || row.id}/edit`) },
        { label: 'Delete', icon: Trash2, onClick: handleDelete, color: 'danger' }
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
                        <div className="rd-module-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="rd-module-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Inventory Management</span>
                            <span className="rd-module-badge" style={{
                                padding: '4px 10px', 
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', 
                                color: '#ffffff', 
                                borderRadius: '8px', 
                                fontSize: '12px', 
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>INVENTORY</span>
                        </div>
                        </div>
                </div>

                <div className="rd-kpi-row">
                    <MaterialKPICard title="Total Items" val={totalItems} color="blue" icon={Package} />
                    <MaterialKPICard title="In Stock" val={inStock} trend={`${totalItems ? Math.round((inStock/totalItems)*100) : 0}%`} color="green" icon={CheckCircle} />
                    <MaterialKPICard title="Low Stock" val={lowStock} trend={`${totalItems ? Math.round((lowStock/totalItems)*100) : 0}%`} color="orange" icon={AlertTriangle} />
                    <MaterialKPICard title="Out of Stock" val={outOfStock} trend={`${totalItems ? Math.round((outOfStock/totalItems)*100) : 0}%`} color="red" icon={XCircle} />
                </div>

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
                            actions={actions}
                            searchPlaceholder="Search by item code or name..."
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

const MaterialKPICard = ({ title, val, color, icon: Icon, trend }) => {
    const colorTokens = {
        blue: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        green: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
        purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
        orange: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
        red: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
        cyan: { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
    };
    
    const theme = colorTokens[color] || colorTokens.blue;

    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
        }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: '#64748b', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px' 
                    }}>
                        {title}
                    </h4>
                    <div style={{ 
                        fontSize: '32px', 
                        fontWeight: 800, 
                        color: '#0f172a',
                        letterSpacing: '-1px',
                        lineHeight: 1
                    }}>
                        {val}
                    </div>
                </div>
                {Icon && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.text
                    }}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Optional Trend or Data */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: theme.text,
                        background: theme.bg,
                        padding: '4px 8px',
                        borderRadius: '6px'
                    }}>
                        {trend} of Total Capacity
                    </div>
                )}
            </div>
            
            {/* Subtle bottom border accent */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: theme.text,
                opacity: 0.8
            }} />
        </div>
    );
};

export default Materials;
