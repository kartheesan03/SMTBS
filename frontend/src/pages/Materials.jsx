import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../components/ui';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const CheckCircle = ({size, color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

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
    const makeTrend = (base) => Array.from({length: 8}, () => ({v: Math.max(0, base + Math.floor(Math.random() * (base * 0.2) - (base * 0.1)))}));

    const totalItems = materialsData.length;
    const inStock = materialsData.filter(m => getComputedStatus(m) === 'In Stock').length;
    const lowStock = materialsData.filter(m => getComputedStatus(m) === 'Low Stock').length;
    const outOfStock = materialsData.filter(m => getComputedStatus(m) === 'Out of Stock').length;

    return (
        <div className="rd-container">
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-icon">
                        <Package size={32} />
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-badge">INVENTORY</span>
                            <span className="rd-module-title">Inventory Management</span>
                        </div>
                        <div className="rd-module-desc">Manage materials, track stock levels, and monitor inventory valuation.</div>
                    </div>
                </div>

                <div className="rd-kpi-row">
                    <MaterialKPICard title="Total Items" val={totalItems} trend="" trendDir="up" color="blue" data={makeTrend(totalItems || 10)} icon={Package} />
                    <MaterialKPICard title="In Stock" val={inStock} trend={`${totalItems ? Math.round((inStock/totalItems)*100) : 0}%`} trendDir="up" color="green" data={makeTrend(inStock || 10)} icon={CheckCircle} />
                    <MaterialKPICard title="Low Stock" val={lowStock} trend={`${totalItems ? Math.round((lowStock/totalItems)*100) : 0}%`} trendDir="down" color="orange" data={makeTrend(lowStock || 10)} icon={AlertTriangle} />
                    <MaterialKPICard title="Out of Stock" val={outOfStock} trend={`${totalItems ? Math.round((outOfStock/totalItems)*100) : 0}%`} trendDir="up" color="red" data={makeTrend(outOfStock || 10)} icon={XCircle} />
                </div>

                <div style={{ marginTop: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            Loading inventory data...
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

const MaterialKPICard = ({ title, val, trend, trendDir, color, data, icon: Icon }) => {
    return (
        <div className={`rd-kpi-card ${color}`} style={{minHeight: 140, padding: 20}}>
            <div className="rd-kpi-header">
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <span style={{fontSize: 13, fontWeight: 600, opacity: 0.9}}>{title}</span>
                    <span style={{fontSize: 28, fontWeight: 800}}>{val}</span>
                </div>
                <div className="rd-kpi-icon-box" style={{width: 40, height: 40}}>
                    <Icon size={20} color="#fff" />
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600}}>
                    {trend && (trendDir === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
                    {trend} {trend && <span style={{opacity: 0.7, fontWeight: 400, marginLeft: 4}}>of inventory</span>}
                </div>
                <div style={{width: 60, height: 30}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Materials;
