import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, Plus, CheckCircle, MapPin, Download, RefreshCw, BarChart2, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Layers, Activity, TrendingUp, Search } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './ERPInventory.css';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const Materials = () => {
    const navigate = useNavigate();
    const { user } = React.useContext(AuthContext);
    const [materialsData, setMaterialsData] = useState([]);
    const [movementsData, setMovementsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const isReadOnly = user?.role === 'sales' || user?.role === 'hr';

    const fetchData = async () => {
        try {
            setLoading(true);
            const [materialsRes, movementsRes] = await Promise.all([
                API.get('/materials'),
                API.get('/materials/movements/all').catch(() => ({ data: [] }))
            ]);
            setMaterialsData(materialsRes.data);
            setMovementsData(movementsRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ── Calculations ────────────────────────────────────────────────────────
    
    const getComputedStatus = (item) => {
        if (item.quantity === 0) return 'Out of Stock';
        if (item.quantity <= (item.lowStockThreshold || 10)) return 'Low Stock';
        return 'In Stock';
    };

    const totalItems = materialsData.length;
    const totalQuantity = materialsData.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const inStock = materialsData.filter(m => getComputedStatus(m) === 'In Stock').length;
    const lowStock = materialsData.filter(m => getComputedStatus(m) === 'Low Stock').length;
    const outOfStock = materialsData.filter(m => getComputedStatus(m) === 'Out of Stock').length;
    
    // Inventory Value Estimation (if price exists, else mock a value based on quantity for demo of the ERP feel)
    const inventoryValue = materialsData.reduce((acc, curr) => acc + ((curr.price || 150) * (curr.quantity || 0)), 0);

    const categoryData = useMemo(() => {
        const counts = {};
        materialsData.forEach(m => {
            const cat = m.category || 'Uncategorized';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [materialsData]);

    const warehouseData = useMemo(() => {
        const counts = {};
        materialsData.forEach(m => {
            const w = m.warehouse || 'Unassigned';
            counts[w] = (counts[w] || 0) + (m.quantity || 0);
        });
        return Object.entries(counts).map(([name, stock]) => ({ name, stock })).slice(0, 5);
    }, [materialsData]);

    const trendData = useMemo(() => {
        // Generating a trendline based on movements over time
        if (!movementsData.length) return [];
        const map = {};
        [...movementsData].reverse().forEach(m => {
            const date = new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!map[date]) map[date] = { date, IN: 0, OUT: 0 };
            if (m.type === 'IN') map[date].IN += m.quantity;
            if (m.type === 'OUT') map[date].OUT += m.quantity;
        });
        return Object.values(map).slice(-14); // Last 14 active days
    }, [movementsData]);

    const lowStockItems = materialsData.filter(m => getComputedStatus(m) === 'Low Stock' || getComputedStatus(m) === 'Out of Stock').slice(0, 8);

    // ── Animation Variants ──────────────────────────────────────────────────
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="erp-dashboard-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
                <RefreshCw size={48} color="#4f46e5" className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <h3 style={{ color: '#475569' }}>Loading ERP Data...</h3>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="erp-dashboard-root">
            <motion.div variants={containerVariants} initial="hidden" animate="show">
                
                {/* 1. Hero Header */}
                <motion.div variants={itemVariants} className="erp-header-section">
                    <div>
                        <div className="erp-breadcrumb">Enterprise Portal / Modules / Inventory</div>
                        <h1 className="erp-header-title">Inventory Intelligence</h1>
                        <p className="erp-header-subtitle">Comprehensive real-time view of enterprise stock, warehouses, and valuations.</p>
                    </div>
                    <div className="erp-header-actions">
                        <button className="erp-btn-secondary" onClick={fetchData}>
                            <RefreshCw size={16} /> Sync
                        </button>
                        <button className="erp-btn-secondary">
                            <Download size={16} /> Export XLS
                        </button>
                        {!isReadOnly && (
                            <button className="erp-btn-primary" onClick={() => navigate('/materials/new')}>
                                <Plus size={16} /> Post Goods Receipt
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* 2. KPI Cards */}
                <motion.div variants={itemVariants} className="erp-kpi-grid">
                    {[
                        { title: 'Total SKUs', value: totalItems, icon: Layers, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.1)' },
                        { title: 'Total Physical Stock', value: totalQuantity.toLocaleString(), icon: Package, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
                        { title: 'Est. Stock Value', value: `$${inventoryValue.toLocaleString()}`, icon: TrendingUp, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                        { title: 'Critical Stock Alerts', value: lowStock + outOfStock, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
                    ].map((kpi, idx) => (
                        <div key={idx} className="erp-glass-card erp-kpi-item">
                            <div className="erp-kpi-header">
                                <div className="erp-kpi-icon-container" style={{ background: kpi.bg }}>
                                    <kpi.icon size={24} color={kpi.color} />
                                </div>
                                <Activity size={20} color="#cbd5e1" />
                            </div>
                            <div>
                                <h3 className="erp-kpi-value">{kpi.value}</h3>
                                <p className="erp-kpi-label">{kpi.title}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* 3. Analytics Section */}
                <motion.div variants={itemVariants} className="erp-chart-grid">
                    
                    {/* Stock Trend */}
                    <div className="erp-glass-card">
                        <h3 className="erp-section-title"><Activity size={20} color="#4f46e5" /> Stock Movement Trend</h3>
                        <p className="erp-section-subtitle">Inbound vs Outbound volume over time</p>
                        <div style={{ height: 260, width: '100%' }}>
                            <ResponsiveContainer>
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '0px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#475569' }} />
                                    <Area type="monotone" dataKey="IN" name="Inbound (Receipts)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                                    <Area type="monotone" dataKey="OUT" name="Outbound (Issues)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="erp-glass-card">
                        <h3 className="erp-section-title"><PieChartIcon size={20} color="#8b5cf6" /> Category Distribution</h3>
                        <p className="erp-section-subtitle">SKU count per material category</p>
                        <div style={{ height: 260, width: '100%', display: 'flex', alignItems: 'center' }}>
                            <ResponsiveContainer width="60%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '0px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ width: '40%', maxHeight: '240px', overflowY: 'auto', paddingRight: '10px' }}>
                                {categoryData.map((cat, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '0px', background: COLORS[idx % COLORS.length] }}></div>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>{cat.name}</span>
                                        </div>
                                        <span style={{ color: '#64748b', fontWeight: 700 }}>{cat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Main Layout Grid */}
                <motion.div variants={itemVariants} className="erp-layout-grid">
                    
                    {/* Left Column: Data Table */}
                    <div className="erp-glass-card" style={{ padding: 0 }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 className="erp-section-title" style={{ margin: 0 }}><Search size={20} color="#06b6d4" /> Enterprise Material Master</h3>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '0px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Search size={14} color="#64748b" />
                                <input type="text" placeholder="Search SKU or Name..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '200px' }} />
                            </div>
                        </div>
                        <div className="erp-table-wrapper">
                            <table className="erp-data-table">
                                <thead>
                                    <tr>
                                        <th>SKU / ID</th>
                                        <th>Description</th>
                                        <th>Category</th>
                                        <th>Plant / Loc</th>
                                        <th>Total Qty</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materialsData.slice(0, 15).map((row, idx) => {
                                        const status = getComputedStatus(row);
                                        return (
                                            <tr key={idx}>
                                                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5' }}>{row.sku || String(row._id || row.id).substring(0,8).toUpperCase()}</td>
                                                <td style={{ fontWeight: 600, color: '#1e293b' }}>{row.name}</td>
                                                <td><span className="erp-badge erp-badge-slate">{row.category || 'General'}</span></td>
                                                <td>{row.warehouse || 'WH-01'} {row.shelf ? `/ ${row.shelf}` : ''}</td>
                                                <td style={{ fontWeight: 800, fontSize: '15px' }}>{row.quantity} <span style={{fontSize: '12px', color: '#94a3b8', fontWeight: 500}}>{row.unit || 'EA'}</span></td>
                                                <td>
                                                    <span className={`erp-badge ${status === 'In Stock' ? 'erp-badge-emerald' : status === 'Low Stock' ? 'erp-badge-amber' : 'erp-badge-rose'}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {materialsData.length > 15 && (
                                <div style={{ padding: '16px 24px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                                    <button style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>View All {materialsData.length} Materials →</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Alerts & Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* Low Stock Alerts */}
                        <div className="erp-glass-card">
                            <h3 className="erp-section-title"><AlertTriangle size={20} color="#f59e0b" /> Critical Shortages</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#fffbeb', borderRadius: '0px', border: '1px solid #fde68a' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '14px' }}>{item.name}</div>
                                            <div style={{ fontSize: '12px', color: '#b45309' }}>Req: {item.lowStockThreshold || 10} {item.unit || 'EA'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '16px' }}>{item.quantity}</div>
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626' }}>ACTUAL</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No critical shortages.</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Timeline */}
                        <div className="erp-glass-card">
                            <h3 className="erp-section-title"><Activity size={20} color="#3b82f6" /> Material Document Log</h3>
                            <div className="erp-timeline">
                                {movementsData.slice(0, 5).map((mov, idx) => (
                                    <div key={idx} className="erp-timeline-item">
                                        <div className="erp-timeline-icon">
                                            {mov.type === 'IN' ? <ArrowDownRight size={20} color="#10b981" /> : <ArrowUpRight size={20} color="#ef4444" />}
                                        </div>
                                        <div className="erp-timeline-content">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span className={`erp-badge ${mov.type === 'IN' ? 'erp-badge-emerald' : 'erp-badge-rose'}`} style={{ fontSize: '10px' }}>
                                                    {mov.type === 'IN' ? 'GOODS RECEIPT' : 'GOODS ISSUE'}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{new Date(mov.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500, marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 700 }}>{mov.quantity}</span> units of <span style={{ fontWeight: 700 }}>{mov.material?.name || 'Unknown'}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                Processed by {mov.performedBy?.name || 'System'} at {mov.warehouse || 'WH-01'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {movementsData.length === 0 && (
                                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No recent material documents found.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Materials;
