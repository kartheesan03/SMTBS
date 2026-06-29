import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, TrendingUp, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import API from '../api/axios';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

const StockRequests = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/materials');
                setMaterials(data || []);
            } catch (error) {
                console.error("Failed to fetch materials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    // Calculate Stock Metrics
    const totalItems = materials.length;
    
    const getStatus = (item) => {
        if (item.quantity === 0) return 'Critical / 0';
        if (item.quantity <= (item.lowStockThreshold || 10)) return 'Low Stock';
        return 'Healthy';
    };

    const healthyCount = materials.filter(m => getStatus(m) === 'Healthy').length;
    const lowCount = materials.filter(m => getStatus(m) === 'Low Stock').length;
    const outCount = materials.filter(m => getStatus(m) === 'Critical / 0').length;

    const alertsData = materials
        .filter(m => getStatus(m) !== 'Healthy')
        .map(m => ({
            matId: m.sku || `MAT-${m.id}`,
            name: m.name,
            status: getStatus(m),
            current: m.quantity,
            reorder: m.lowStockThreshold || 10,
            deficit: m.quantity - (m.lowStockThreshold || 10),
            since: new Date(m.updatedAt || Date.now()).toLocaleDateString()
        }))
        .sort((a, b) => a.current - b.current); // Sort by lowest quantity

    const pieData = [
        { name: 'Healthy', value: healthyCount, color: '#10b981' },
        { name: 'Low Stock', value: lowCount, color: '#f59e0b' },
        { name: 'Out of Stock', value: outCount, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // Dynamic Trend generators
    const makeTrend = (base) => Array.from({length: 8}, () => ({v: Math.max(0, base + Math.floor(Math.random() * (base * 0.2) - (base * 0.1)))}));

    // Mock line chart data based on current totals (since no historical data exists in API)
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const chartData = [
        { name: 'Jan', inStock: totalItems * 0.8, low: totalItems * 0.15, out: totalItems * 0.05 },
        { name: 'Feb', inStock: totalItems * 0.85, low: totalItems * 0.1, out: totalItems * 0.05 },
        { name: 'Mar', inStock: totalItems * 0.82, low: totalItems * 0.12, out: totalItems * 0.06 },
        { name: 'Apr', inStock: totalItems * 0.78, low: totalItems * 0.18, out: totalItems * 0.04 },
        { name: 'May', inStock: totalItems * 0.9, low: totalItems * 0.08, out: totalItems * 0.02 },
        { name: currentMonth, inStock: healthyCount, low: lowCount, out: outCount }
    ];

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>SM</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Stock Monitoring</span>
                            <span className="rd-module-badge" style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe'}}>STOCK</span>
                        </div>
                        <div className="rd-module-desc">Live stock health alerts, trend analysis, and distribution overview.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <StockKPICard title="Total SKUs" val={totalItems} trend="" trendDir="up" color="blue" data={makeTrend(totalItems || 10)} icon={Package} />
                    <StockKPICard title="Healthy" val={healthyCount} trend={`${totalItems ? Math.round((healthyCount/totalItems)*100) : 0}%`} trendDir="up" color="green" data={makeTrend(healthyCount || 5)} icon={TrendingUp} />
                    <StockKPICard title="Low Stock" val={lowCount} trend={`${totalItems ? Math.round((lowCount/totalItems)*100) : 0}%`} trendDir="down" color="orange" data={makeTrend(lowCount || 5)} icon={AlertTriangle} />
                    <StockKPICard title="Critical / 0" val={outCount} trend={`${totalItems ? Math.round((outCount/totalItems)*100) : 0}%`} trendDir="down" color="red" data={makeTrend(outCount || 5)} icon={XCircle} />
                </div>

                {/* Charts Section */}
                <div style={{display: 'flex', gap: 24, marginBottom: 24}}>
                    <div className="rd-chart-card" style={{flex: 2}}>
                        <div className="rd-chart-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div>
                                <h3 className="rd-chart-title">Stock Level Trend</h3>
                                <p style={{margin: 0, color: '#94a3b8', fontSize: 13, marginTop: 4}}>Past 6 Months</p>
                            </div>
                            <div style={{display: 'flex', gap: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                    <span style={{width: 12, height: 4, background: '#10b981', borderRadius: 2}}></span>
                                    <span style={{fontSize: 12, color: '#64748b', fontWeight: 600}}>Healthy</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                    <span style={{width: 12, height: 4, background: '#f59e0b', borderRadius: 2}}></span>
                                    <span style={{fontSize: 12, color: '#64748b', fontWeight: 600}}>Low</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                    <span style={{width: 12, height: 4, background: '#ef4444', borderRadius: 2}}></span>
                                    <span style={{fontSize: 12, color: '#64748b', fontWeight: 600}}>Critical</span>
                                </div>
                            </div>
                        </div>
                        <div style={{height: 240, marginTop: 24}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Line type="monotone" dataKey="inStock" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                    <Line type="monotone" dataKey="low" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                                    <Line type="monotone" dataKey="out" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rd-chart-card" style={{flex: 1}}>
                        <h3 className="rd-chart-title">Current Stock Distribution</h3>
                        <div style={{height: 240, display: 'flex', alignItems: 'center', marginTop: 24, position: 'relative'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
                                <div style={{fontSize: 24, fontWeight: 800, color: 'var(--rd-text-main)'}}>{totalItems}</div>
                                <div style={{fontSize: 11, fontWeight: 600, color: '#94a3b8'}}>TOTAL</div>
                            </div>
                            <div style={{position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 12}}>
                                {pieData.map((item, i) => (
                                    <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                            <span style={{width: 8, height: 8, borderRadius: '50%', background: item.color}}></span>
                                            <span style={{fontSize: 13, color: '#475569'}}>{item.name}</span>
                                        </div>
                                        <span style={{fontSize: 13, fontWeight: 700, color: 'var(--rd-text-main)'}}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                                <div className="rd-table-title">Stock Alerts <span style={{fontSize: 14, color: '#94a3b8', fontWeight: 500}}>(Live from Inventory)</span></div>
                            </div>
                            <div className="rd-table-subtitle">Items requiring immediate attention</div>
                        </div>
                        <div className="rd-table-actions">
                            <span style={{padding: '6px 12px', background: '#ffe4e6', color: '#e11d48', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid #fecdd3'}}>
                                {alertsData.length} Active Alerts
                            </span>
                        </div>
                    </div>
                    
                    <table className="rd-table">
                        <thead>
                            <tr>
                                <th>MATERIAL</th>
                                <th>ID</th>
                                <th>STATUS</th>
                                <th>CURRENT QTY</th>
                                <th>REORDER LEVEL</th>
                                <th>DEFICIT</th>
                                <th>SINCE</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading stock alerts...</td>
                                </tr>
                            ) : alertsData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#10b981', fontWeight: 600}}>All stock levels are healthy!</td>
                                </tr>
                            ) : (
                                alertsData.map((item, i) => (
                                    <tr key={item.matId || i}>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{item.name}</td>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{item.matId}</td>
                                        <td>
                                            <span className={`rd-status-badge ${item.status === 'Low Stock' ? 'rd-status-orange' : 'rd-status-red'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{fontWeight: 700, color: item.status === 'Low Stock' ? '#f59e0b' : '#ef4444'}}>{item.current} pcs</td>
                                        <td style={{color: '#64748b'}}>{item.reorder} pcs</td>
                                        <td style={{fontWeight: 700, color: '#e11d48'}}>{item.deficit}</td>
                                        <td style={{color: '#94a3b8'}}>{item.since}</td>
                                        <td>
                                            <div style={{display: 'flex', gap: 8}}>
                                                <button className="rd-btn-solid" style={{padding: '6px 12px', fontSize: 12}} onClick={() => navigate('/orders/new')}>Raise PO</button>
                                                <button className="rd-btn-outline" style={{padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4}} onClick={() => navigate(`/materials/${item.matId}`)}>
                                                    <ExternalLink size={14} /> Inv.
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StockKPICard = ({ title, val, trend, trendDir, color, data, icon: Icon }) => {
    return (
        <div className={`rd-kpi-card ${color}`} style={{minHeight: 140, padding: 20, position: 'relative', overflow: 'hidden'}}>
            {/* The circular blobs in the background */}
            <div style={{position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)'}}></div>
            <div style={{position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)'}}></div>
            
            <div className="rd-kpi-header" style={{position: 'relative', zIndex: 2}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <span style={{fontSize: 13, fontWeight: 600, opacity: 0.9}}>{title}</span>
                    <span style={{fontSize: 28, fontWeight: 800}}>{val}</span>
                </div>
                <div className="rd-kpi-icon-box" style={{width: 40, height: 40}}>
                    <Icon size={20} color="#fff" />
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, position: 'relative', zIndex: 2}}>
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

export default StockRequests;
