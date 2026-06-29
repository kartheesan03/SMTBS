import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';
import API from '../api/axios';

const Materials = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [materialsData, setMaterialsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const { data } = await API.get('/materials');
                setMaterialsData(data);
            } catch (error) {
                console.error("Failed to fetch materials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    // Mock data for tiny trend charts
    const trendData1 = [{v: 10},{v: 15},{v: 12},{v: 20},{v: 18},{v: 25},{v: 22}];
    const trendData2 = [{v: 20},{v: 22},{v: 25},{v: 24},{v: 28},{v: 27},{v: 30}];
    const trendData3 = [{v: 5},{v: 4},{v: 8},{v: 6},{v: 10},{v: 8},{v: 12}];
    const trendData4 = [{v: 2},{v: 3},{v: 2},{v: 5},{v: 4},{v: 6},{v: 4}];

    const getComputedStatus = (item) => {
        if (item.quantity === 0) return 'Out of Stock';
        if (item.quantity <= item.lowStockThreshold) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusClass = (status) => {
        if (status === 'In Stock') return 'rd-status-green';
        if (status === 'Low Stock') return 'rd-status-orange';
        if (status === 'Out of Stock') return 'rd-status-red';
        return 'rd-status-blue';
    };

    const totalItems = materialsData.length;
    const inStock = materialsData.filter(m => getComputedStatus(m) === 'In Stock').length;
    const lowStock = materialsData.filter(m => getComputedStatus(m) === 'Low Stock').length;
    const outOfStock = materialsData.filter(m => getComputedStatus(m) === 'Out of Stock').length;

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

            <div className="rd-content">
                {/* Module Header */}
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

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <MaterialKPICard title="Total Items" val={totalItems} trend="+12.5%" trendDir="up" color="blue" data={trendData1} icon={Package} />
                    <MaterialKPICard title="In Stock" val={inStock} trend="+8.2%" trendDir="up" color="green" data={trendData2} icon={CheckCircle} />
                    <MaterialKPICard title="Low Stock" val={lowStock} trend="-2.4%" trendDir="down" color="orange" data={trendData3} icon={AlertTriangle} />
                    <MaterialKPICard title="Out of Stock" val={outOfStock} trend="+1.5%" trendDir="up" color="red" data={trendData4} icon={XCircle} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header">
                        <div>
                            <div className="rd-table-title">Inventory Register</div>
                            <div className="rd-table-subtitle">Comprehensive list of all materials in stock</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 250, background: '#fff'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search items..." />
                            </div>
                            <button className="rd-icon-btn"><Filter size={18} /></button>
                            <button className="rd-btn-solid" onClick={() => navigate('/materials/new')}>
                                <Plus size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Add Material
                            </button>
                        </div>
                    </div>
                    <div style={{padding: '16px 24px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--rd-border)'}}>
                        {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(f => (
                            <div key={f} className={`rd-filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f}
                            </div>
                        ))}
                    </div>
                    
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>Item Code</th>
                                <th>Material Name</th>
                                <th>Category</th>
                                <th>Stock Status</th>
                                <th>Unit Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materialsData.filter(m => filter === 'All' || getComputedStatus(m) === filter).map(item => (
                                <tr key={item._id || item.id}>
                                    <td style={{fontWeight: 600, color: '#64748b'}}>{item.sku || item.id || item._id}</td>
                                    <td>
                                        <div style={{fontWeight: 600, color: 'var(--rd-text-main)'}}>{item.name}</div>
                                        <div style={{fontSize: 12, color: '#94a3b8', marginTop: 4}}>Qty: {item.quantity} {item.unit || 'Units'}</div>
                                    </td>
                                    <td>{item.category}</td>
                                    <td>
                                        <span className={`rd-status-badge ${getStatusClass(getComputedStatus(item))}`}>{getComputedStatus(item)}</span>
                                    </td>
                                    <td style={{fontWeight: 500}}>₹{item.price}</td>
                                    <td>
                                        <button className="rd-btn-link" style={{marginTop: 0}} onClick={() => navigate(`/materials/${item._id || item.id}`)}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className="rd-table-footer">
                        <span>Showing {materialsData.length > 0 ? 1 : 0} to {materialsData.length} of {materialsData.length} entries</span>
                        <div style={{display: 'flex', gap: 8}}>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}} disabled>{"<"}</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32, background: 'var(--rd-blue)', color: 'white', borderColor: 'var(--rd-blue)'}}>1</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}}>2</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}}>3</button>
                            <button className="rd-icon-btn" style={{width: 32, height: 32}}>{">"}</button>
                        </div>
                    </div>
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
                    {trendDir === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trend} <span style={{opacity: 0.7, fontWeight: 400, marginLeft: 4}}>vs last month</span>
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

const CheckCircle = ({size, color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

export default Materials;
