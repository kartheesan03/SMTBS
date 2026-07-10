import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, TrendingUp, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import API from '../api/axios';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

// ─── SVG Arc Gauge (pure SVG, no lib dependency) ─────────────────────────────
const ArcGauge = ({ pct }) => {
    const R = 72;          // arc radius
    const cx = 100; const cy = 105;
    const startAngle = 225; // degrees  (bottom-left)
    const sweep     = 270;  // total arc span

    const toRad = (deg) => (deg * Math.PI) / 180;
    const pt = (angle) => {
        const a = toRad(startAngle + angle);
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
    };

    const trackEnd = pt(sweep);
    const trackD = `M ${pt(0).x} ${pt(0).y} A ${R} ${R} 0 1 1 ${trackEnd.x} ${trackEnd.y}`;

    const fillSweep = (pct / 100) * sweep;
    const fillEnd   = pt(fillSweep);
    const largeArc  = fillSweep > 180 ? 1 : 0;
    const fillD = fillSweep < 1
        ? ''
        : `M ${pt(0).x} ${pt(0).y} A ${R} ${R} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`;

    // pointer tip position
    const tip = pt(fillSweep);

    // colour: red→orange→green
    const gaugeColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

    return (
        <svg width="200" height="140" viewBox="0 0 200 140" aria-label={`Stock health ${pct}%`}>
            <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#ef4444" />
                    <stop offset="50%"  stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
            </defs>
            {/* Track */}
            <path d={trackD} fill="none" stroke="#f1f5f9" strokeWidth="12"
                  strokeLinecap="round" />
            {/* Filled arc */}
            {fillD && (
                <path d={fillD} fill="none"
                      stroke={gaugeColor}
                      strokeWidth="12" strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 4px ${gaugeColor}40)` }}
                />
            )}
            {/* Pointer dot */}
            {fillSweep >= 1 && (
                <circle cx={tip.x} cy={tip.y} r="6"
                    fill={gaugeColor} stroke="#fff" strokeWidth="2.5"
                    style={{ filter: `drop-shadow(0 1px 3px ${gaugeColor}60)` }}
                />
            )}
            {/* Center score */}
            <text x={cx} y={cy - 14} textAnchor="middle"
                  fontSize="32" fontWeight="800"
                  fill="var(--rd-text-main, #1e293b)"
                  fontFamily="inherit">
                {pct}%
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle"
                  fontSize="10" fontWeight="700" letterSpacing="1.5"
                  fill="#94a3b8" fontFamily="inherit">
                STOCK HEALTH
            </text>
        </svg>
    );
};

// ─── Mini sparkline strip (recharts AreaChart, stripped bare) ──────────────────
const Sparkline = ({ data }) => (
    <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}    />
                </linearGradient>
            </defs>
            <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11, padding: '5px 10px' }}
                itemStyle={{ color: '#10b981' }}
                labelStyle={{ color: '#64748b', fontWeight: 600 }}
            />
            <XAxis dataKey="name" hide />
            <Area type="monotone" dataKey="Healthy"
                  stroke="#10b981" strokeWidth={1.5}
                  fill="url(#sparkGrad)" dot={false} activeDot={{ r: 3, fill: '#10b981' }} />
        </AreaChart>
    </ResponsiveContainer>
);

// ─── Horizontal segmented bar ──────────────────────────────────────────────────
const SegBar = ({ categories, total }) => {
    const safeTotal = total || 1;
    return (
        <div style={{ display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', background: '#f1f5f9' }}>
            {categories.map((cat) => {
                const w = (cat.value / safeTotal) * 100;
                return w > 0 ? (
                    <div key={cat.name}
                         title={`${cat.name}: ${cat.value}`}
                         style={{
                             width: `${w}%`,
                             background: cat.color,
                             transition: 'width 0.6s ease',
                         }}
                    />
                ) : null;
            })}
        </div>
    );
};

// ─── The unified panel ─────────────────────────────────────────────────────────
const StockHealthPanel = ({ healthyCount, lowCount, outCount, totalItems, allCategories, chartData }) => {
    const pct = totalItems ? Math.round((healthyCount / totalItems) * 100) : 0;

    // trend direction caption
    const trendLabel = lowCount === 0 && outCount === 0
        ? '→ Stable — all items within threshold'
        : outCount > 0
            ? '↘ Critical items detected'
            : '↗ Low stock items need attention';

    return (
        <div className="rd-chart-card" style={{
            display: 'flex',
            gap: 0,
            marginBottom: 24,
            padding: 0,
            overflow: 'hidden',
        }}>
            {/* ── LEFT: Gauge + Sparkline ── */}
            <div style={{
                flex: '0 0 auto',
                width: 224,
                borderRight: '1px solid var(--rd-border, #e2e8f0)',
                padding: '28px 20px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
            }}>
                {/* gauge */}
                <ArcGauge pct={pct} />

                {/* sparkline section */}
                <div style={{ width: '100%', marginTop: 12 }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        marginBottom: 6,
                    }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                            Past 6 Months
                        </span>
                        <span style={{
                            fontSize: 10, fontWeight: 600,
                            color: outCount > 0 ? '#ef4444' : lowCount > 0 ? '#f59e0b' : '#10b981',
                        }}>
                            {outCount > 0 ? '↘' : lowCount > 0 ? '→' : '↗'} {outCount > 0 ? 'Issues' : lowCount > 0 ? 'Watch' : 'Stable'}
                        </span>
                    </div>
                    <Sparkline data={chartData} />
                </div>
            </div>

            {/* ── RIGHT: Distribution bar + legend + stats ── */}
            <div style={{
                flex: 1,
                padding: '28px 28px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}>
                {/* header row */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>
                                Current Distribution
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--rd-text-main, #1e293b)', lineHeight: 1 }}>
                                {totalItems} <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>Total SKUs</span>
                            </div>
                        </div>
                        {/* status pill */}
                        <span style={{
                            padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                            background: pct === 100 ? '#d1fae5' : pct >= 80 ? '#fef9c3' : '#fee2e2',
                            color:      pct === 100 ? '#059669' : pct >= 80 ? '#a16207' : '#dc2626',
                        }}>
                            {pct === 100 ? '✓ All Healthy' : pct >= 80 ? '⚠ Mostly Healthy' : '✗ Needs Attention'}
                        </span>
                    </div>

                    {/* Segmented bar */}
                    <SegBar categories={allCategories} total={totalItems} />

                    {/* category legend */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                        {allCategories.map((cat) => {
                            const catPct = totalItems ? Math.round((cat.value / totalItems) * 100) : 0;
                            const active = cat.value > 0;
                            return (
                                <div key={cat.name} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: active ? cat.color : '#e2e8f0',
                                            flexShrink: 0,
                                            boxShadow: active ? `0 0 0 3px ${cat.color}20` : 'none',
                                        }} />
                                        <span style={{
                                            fontSize: 13, fontWeight: active ? 600 : 400,
                                            color: active ? 'var(--rd-text-main, #1e293b)' : '#94a3b8',
                                        }}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {/* percentage bar track */}
                                        <div style={{ width: 80, height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${catPct}%`,
                                                height: '100%',
                                                background: active ? cat.color : 'transparent',
                                                borderRadius: 99,
                                                transition: 'width 0.6s ease',
                                            }} />
                                        </div>
                                        <span style={{
                                            fontSize: 11, color: '#94a3b8', width: 30, textAlign: 'right',
                                        }}>
                                            {catPct}%
                                        </span>
                                        <span style={{
                                            fontSize: 15, fontWeight: 700, width: 24, textAlign: 'right',
                                            color: active ? 'var(--rd-text-main, #1e293b)' : '#94a3b8',
                                        }}>
                                            {cat.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* bottom: trend caption */}
                <div style={{
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid var(--rd-border, #e2e8f0)',
                    fontSize: 11,
                    color: '#94a3b8',
                    fontStyle: 'italic',
                }}>
                    {trendLabel}
                </div>
            </div>
        </div>
    );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
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
    const lowCount     = materials.filter(m => getStatus(m) === 'Low Stock').length;
    const outCount     = materials.filter(m => getStatus(m) === 'Critical / 0').length;

    const alertsData = materials
        .filter(m => getStatus(m) !== 'Healthy')
        .map(m => ({
            matId:   m.sku || `MAT-${m.id}`,
            name:    m.name,
            status:  getStatus(m),
            current: m.quantity,
            reorder: m.lowStockThreshold || 10,
            deficit: m.quantity - (m.lowStockThreshold || 10),
            since:   new Date(m.updatedAt || Date.now()).toLocaleDateString(),
        }))
        .sort((a, b) => a.current - b.current);

    const allCategories = [
        { name: 'Healthy',  value: healthyCount, color: '#10b981' },
        { name: 'Low',      value: lowCount,     color: '#f59e0b' },
        { name: 'Critical', value: outCount,     color: '#ef4444' },
    ];

    // 6-month sparkline data (flat trend based on current live counts)
    const buildMonthLabels = () => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const now = new Date();
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push(months[d.getMonth()]);
        }
        return result;
    };
    const monthLabels = buildMonthLabels();
    const chartData = monthLabels.map(name => ({
        name, Healthy: healthyCount, Low: lowCount, Critical: outCount,
    }));

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
                <PastelKPIGrid>
                    <PastelKPICard
                        title="Total SKUs" value={totalItems}
                        colorTheme="blue" icon={Package}
                        trendValue="All tracked items"
                        trendPositive={true}
                        onClick={() => navigate('/stock-requests')}
                    />
                    <PastelKPICard
                        title="Healthy" value={healthyCount}
                        colorTheme="mint" icon={TrendingUp}
                        trendValue={`${totalItems ? Math.round((healthyCount/totalItems)*100) : 0}% within thresholds`}
                        trendPositive={true}
                        onClick={() => navigate('/stock-requests')}
                    />
                    <PastelKPICard
                        title="Low Stock" value={lowCount}
                        colorTheme="yellow" icon={AlertTriangle}
                        trendValue={`${totalItems ? Math.round((lowCount/totalItems)*100) : 0}% approaching reorder`}
                        trendPositive={false}
                        onClick={() => navigate('/stock-requests')}
                    />
                    <PastelKPICard
                        title="Critical / 0" value={outCount}
                        colorTheme="peach" icon={XCircle}
                        trendValue={`${totalItems ? Math.round((outCount/totalItems)*100) : 0}% need action`}
                        trendPositive={false}
                        onClick={() => navigate('/stock-requests')}
                    />
                </PastelKPIGrid>

                {/* ── Stock Health Panel ── */}
                <StockHealthPanel
                    healthyCount={healthyCount}
                    lowCount={lowCount}
                    outCount={outCount}
                    totalItems={totalItems}
                    allCategories={allCategories}
                    chartData={chartData}
                />

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

                    <div className="rd-table-scroll">
                        <table className="rd-table rd-table-responsive" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>MATERIAL</th>
                                    <th>ID</th>
                                    <th>STATUS</th>
                                    <th style={{textAlign: 'right'}}>CURRENT QTY</th>

                                    <th style={{textAlign: 'right'}}>DEFICIT</th>
                                    <th>SINCE</th>
                                    <th style={{textAlign: 'center', width: 100}}>ACTION</th>
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
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}} data-label="Material">{item.name}</td>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}} data-label="ID">{item.matId}</td>
                                        <td data-label="Status">
                                            <span className={`ui-badge ${item.status === 'Low Stock' ? 'warning' : 'danger'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{fontWeight: 700, color: item.status === 'Low Stock' ? '#f59e0b' : '#ef4444', textAlign: 'right'}} data-label="Current Qty">{item.current} pcs</td>

                                        <td style={{fontWeight: 700, color: '#e11d48', textAlign: 'right'}} data-label="Deficit">{item.deficit}</td>
                                        <td style={{color: '#94a3b8'}} data-label="Since">{item.since}</td>
                                        <td style={{textAlign: 'center'}} data-label="Action">
                                            <div style={{display: 'inline-flex', gap: 6}}>
                                                <button className="rd-btn-compact primary" onClick={() => navigate('/erp/vendors/select')}>Raise PO</button>
                                                <button className="rd-btn-compact outline" onClick={() => navigate(`/materials/${item.matId}`)}>
                                                    Inv.
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
        </div>
    );
};

export default StockRequests;
