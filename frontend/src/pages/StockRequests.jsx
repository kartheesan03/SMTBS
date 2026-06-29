import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, TrendingUp, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';

const StockRequests = () => {
    const navigate = useNavigate();

    // Mock data for tiny trend charts
    const trendData1 = [{v: 10},{v: 15},{v: 12},{v: 20},{v: 18},{v: 25},{v: 22}];
    const trendData2 = [{v: 20},{v: 22},{v: 25},{v: 24},{v: 28},{v: 27},{v: 30}];
    const trendData3 = [{v: 5},{v: 4},{v: 8},{v: 6},{v: 10},{v: 8},{v: 12}];
    const trendData4 = [{v: 2},{v: 3},{v: 2},{v: 5},{v: 4},{v: 6},{v: 4}];

    // Main line chart data
    const chartData = [
        { name: 'Dec', inStock: 700, low: 100, out: 50 },
        { name: 'Jan', inStock: 720, low: 120, out: 60 },
        { name: 'Feb', inStock: 700, low: 110, out: 55 },
        { name: 'Mar', inStock: 750, low: 100, out: 40 },
        { name: 'Apr', inStock: 680, low: 140, out: 70 },
        { name: 'May', inStock: 700, low: 150, out: 80 }
    ];

    const pieData = [
        { name: 'In Stock', value: 2, color: '#3b82f6' },
        { name: 'In Transit', value: 0, color: '#06b6d4' },
        { name: 'Low Stock', value: 2, color: '#f59e0b' },
        { name: 'Out of Stock', value: 2, color: '#ef4444' }
    ];

    const alertsData = [
        { matId: 'MAT-013', name: 'Grease Cartridge', status: 'Low Stock', current: 60, reorder: 20, deficit: -40, since: 'Just now' },
        { matId: 'MAT-042', name: 'Steel Bearings', status: 'Critical / 0', current: 0, reorder: 50, deficit: -50, since: '2 hrs ago' },
        { matId: 'MAT-088', name: 'Hydraulic Fluid', status: 'Low Stock', current: 15, reorder: 40, deficit: -25, since: '5 hrs ago' },
        { matId: 'MAT-102', name: 'Conveyor Belt', status: 'Critical / 0', current: 0, reorder: 5, deficit: -5, since: '1 day ago' },
    ];

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

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
                        <div className="rd-module-desc">Live stock health alerts, trend analysis, and distribution overview across all locations.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <StockKPICard title="Total SKUs" val="6" trend="+9%" trendDir="up" color="blue" data={trendData1} icon={Package} />
                    <StockKPICard title="Healthy" val="2" trend="+17%" trendDir="up" color="green" data={trendData2} icon={TrendingUp} />
                    <StockKPICard title="Low Stock" val="2" trend="-8%" trendDir="down" color="orange" data={trendData3} icon={AlertTriangle} />
                    <StockKPICard title="Critical / 0" val="2" trend="-15%" trendDir="down" color="red" data={trendData4} icon={XCircle} />
                </div>

                {/* Charts Section */}
                <div style={{display: 'flex', gap: 24, marginBottom: 24}}>
                    <div className="rd-chart-card" style={{flex: 2}}>
                        <div className="rd-chart-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div>
                                <h3 className="rd-chart-title">Stock Level Trend</h3>
                                <p style={{margin: 0, color: '#94a3b8', fontSize: 13, marginTop: 4}}>Dec 2025 - May 2026</p>
                            </div>
                            <div style={{display: 'flex', gap: 16}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                    <span style={{width: 12, height: 4, background: '#3b82f6', borderRadius: 2}}></span>
                                    <span style={{fontSize: 12, color: '#64748b', fontWeight: 600}}>In Stock</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                    <span style={{width: 12, height: 4, background: '#f59e0b', borderRadius: 2}}></span>
                                    <span style={{fontSize: 12, color: '#64748b', fontWeight: 600}}>Low</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                    <span style={{width: 12, height: 4, background: '#ef4444', borderRadius: 2}}></span>
                                    <span style={{fontSize: 12, color: '#64748b', fontWeight: 600}}>Out</span>
                                </div>
                            </div>
                        </div>
                        <div style={{height: 240, marginTop: 24}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <Tooltip contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Line type="monotone" dataKey="inStock" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
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
                                <div style={{fontSize: 24, fontWeight: 800, color: 'var(--rd-text-main)'}}>6</div>
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
                                4 Active Alerts
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
                            {alertsData.map((item, i) => (
                                <tr key={i}>
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
                                            <button className="rd-btn-solid" style={{padding: '6px 12px', fontSize: 12}}>Raise PO</button>
                                            <button className="rd-btn-outline" style={{padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4}} onClick={() => navigate(`/materials/${item.matId}`)}>
                                                <ExternalLink size={14} /> Inv.
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
            
            <div className="rd-kpi-header" style={{alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div className="rd-kpi-icon-box" style={{width: 44, height: 44, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)'}}>
                        <Icon size={22} color="#fff" />
                    </div>
                    <div>
                        <div style={{fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 4}}>{title}</div>
                    </div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4}}>
                        {trendDir === 'up' ? '▲' : '▼'} {trend}
                    </div>
                    <button style={{background: 'none', border: 'none', color: '#fff', opacity: 0.7, cursor: 'pointer'}}>•••</button>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16}}>
                <div style={{width: '100%', height: 40, position: 'relative', zIndex: 2}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line type="monotone" dataKey="v" stroke="#fff" strokeWidth={3} dot={false} activeDot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{position: 'absolute', bottom: 20, right: 20, textAlign: 'right', zIndex: 1}}>
                    <div style={{fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)'}}>VS LAST MO.</div>
                    <div style={{fontSize: 14, fontWeight: 800, color: '#fff'}}>{trendDir === 'up' ? '+' : ''}{trend}</div>
                </div>
            </div>
        </div>
    );
};

export default StockRequests;
