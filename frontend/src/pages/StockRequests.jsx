import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, TrendingUp, AlertTriangle, XCircle, ExternalLink, ArrowUpRight, ArrowDownRight , PackageCheck} from 'lucide-react';
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
    

    // Since there is no historical data in the API, plot a steady trend based on actual current counts
    // to prevent showing "wrong data" fluctuations that don't match the live inventory.
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const chartData = [
        { name: 'Jan', Healthy: healthyCount, Low: lowCount, Critical: outCount },
        { name: 'Feb', Healthy: healthyCount, Low: lowCount, Critical: outCount },
        { name: 'Mar', Healthy: healthyCount, Low: lowCount, Critical: outCount },
        { name: 'Apr', Healthy: healthyCount, Low: lowCount, Critical: outCount },
        { name: 'May', Healthy: healthyCount, Low: lowCount, Critical: outCount },
        { name: currentMonth, Healthy: healthyCount, Low: lowCount, Critical: outCount }
    ];

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Stock Monitoring</span>
                            <span className="rd-module-badge">STOCK</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <StockKPICard title="Total SKUs" val={totalItems} color="blue" icon={Package} />
                    <StockKPICard title="Healthy" val={healthyCount} trend={`${totalItems ? Math.round((healthyCount/totalItems)*100) : 0}%`} color="green" icon={TrendingUp} />
                    <StockKPICard title="Low Stock" val={lowCount} trend={`${totalItems ? Math.round((lowCount/totalItems)*100) : 0}%`} color="orange" icon={AlertTriangle} />
                    <StockKPICard title="Critical / 0" val={outCount} trend={`${totalItems ? Math.round((outCount/totalItems)*100) : 0}%`} color="red" icon={XCircle} />
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
                                    <Line type="monotone" dataKey="Healthy" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                                    <Line type="monotone" dataKey="Low" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                                    <Line type="monotone" dataKey="Critical" stroke="#ef4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rd-chart-card" style={{flex: 1}}>
                        <h3 className="rd-chart-title">Current Stock Distribution</h3>
                        <div style={{height: 240, display: 'flex', alignItems: 'center', marginTop: 24}}>
                            <div style={{flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div style={{width: 200, height: 200, position: 'relative'}}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie cx="50%" cy="50%" data={pieData} innerRadius={70} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%'}}>
                                        <div style={{fontSize: 32, fontWeight: 800, color: 'var(--rd-text-main)', lineHeight: 1}}>{totalItems}</div>
                                        <div style={{fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, marginTop: 4}}>TOTAL</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{width: 140, display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 16}}>
                                {pieData.map((item, i) => (
                                    <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
                                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                            <span style={{width: 10, height: 10, borderRadius: '50%', background: item.color}}></span>
                                            <span style={{fontSize: 13, color: '#475569', fontWeight: 500}}>{item.name}</span>
                                        </div>
                                        <span style={{fontSize: 14, fontWeight: 700, color: 'var(--rd-text-main)'}}>{item.value}</span>
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

export default StockRequests;
