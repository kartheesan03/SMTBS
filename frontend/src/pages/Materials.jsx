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
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Inventory Management</span>
                            <span className="rd-module-badge">INVENTORY</span>
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

const MaterialKPICard = ({ title, val, color, icon: Icon }) => {
    return (
        <motion.div 
            whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rd-kpi-card ${color}`} 
            style={{minHeight: 140, padding: 24, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)'}}
        >
            <div className="rd-kpi-header">
                <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
                    <span style={{fontSize: 14, fontWeight: 600, opacity: 0.9, letterSpacing: '0.5px'}}>{title}</span>
                    <span style={{fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px'}}>{val}</span>
                </div>
                <div className="rd-kpi-icon-box" style={{width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon size={24} color="#fff" />
                </div>
            </div>
        </motion.div>
    );
};

export default Materials;
