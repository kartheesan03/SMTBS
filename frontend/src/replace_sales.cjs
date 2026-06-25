const fs = require('fs');
const file = 'c:/Users/Admin/Documents/project/frontend/src/pages/SalesDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('return (');
if(returnIndex !== -1) {
   const beforeReturn = content.slice(0, returnIndex);
   const newReturn = `return (
        <div className="module-container">
            {/* Actions & Title */}
            <div className="module-actions-section">
                <div className="module-title-block">
                    <h1>Sales Overview</h1>
                    <p>Pipeline & Revenue Dashboard</p>
                </div>
                <div className="action-buttons">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-body)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)' }}></span> Live Data System
                    </span>
                </div>
            </div>

            {/* Core KPIs */}
            <div className="module-kpi-section" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                {kpiCards.map((kpi, idx) => (
                    <div key={idx} className="kpi-card">
                        <div className="kpi-header">
                            <span className="kpi-title">{kpi.title}</span>
                            <div className="kpi-icon-wrapper" style={{background: \`\${kpi.color}15\`, color: kpi.color}}>
                                <kpi.icon size={20} />
                            </div>
                        </div>
                        <div className="kpi-value">{kpi.value}</div>
                        <div className={\`kpi-trend \${kpi.trendType === 'down' ? 'negative' : 'positive'}\`}>
                            {kpi.trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} 
                            {kpi.trend} vs last month
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Analytics */}
            <div className="module-analytics-section" style={{ gridTemplateColumns: '4fr 5fr 3fr' }}>
                
                {/* Lead Sources */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> Lead Sources</h3>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {leadSourceData.length > 0 ? (
                            <>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                                                {leadSourceData.map((entry, index) => (
                                                    <Cell key={\`cell-\${index}\`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>{totalLeads}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Leads</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '16px' }}>
                                    {leadSourceData.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            <span style={{ width: '10px', height: '10px', borderRadius: '4px', background: item.color }}></span>
                                            {item.name} ({item.percentage}%)
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>No Lead Data Available</div>
                        )}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><TrendingUp size={18} /> Revenue Trend</h3>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>6-Month Total</div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>{formatIndianCurrency(trendTotalRevenue)}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '280px', display: 'flex', flexDirection: 'column' }}>
                        {monthsWithRevenue >= 2 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={formatYAxis} width={60} />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                    <Area type="monotone" dataKey="revenue" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} label={{ position: 'top', formatter: formatIndianCurrency, fill: 'var(--text-heading)', fontSize: 12, fontWeight: 600, dy: -5 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : monthsWithRevenue === 1 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 20px', height: '100%', justifyContent: 'center' }}>
                                <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Revenue</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{formatIndianCurrency(thisMonthRevenue)}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Growth Trend</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: revGrowth >= 0 ? 'var(--success)' : 'var(--danger)' }}>{growthTrend}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-center" style={{ flex: 1, color: 'var(--text-muted)' }}>No Revenue Data</div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="analytics-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <div className="analytics-header">
                        <h3>Sales Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
                        {[
                            { path: '/crm/leads', name: 'Leads', icon: Filter, color: '#3b82f6' },
                            { path: '/crm/pipeline', name: 'Pipeline', icon: Layers, color: '#8b5cf6' },
                            { path: '/crm/customers', name: 'Customers', icon: Users, color: '#10b981' },
                            { path: '/sales/revenue', name: 'Revenue', icon: DollarSign, color: '#f59e0b' },
                            { path: '/sales/goals', name: 'Goals', icon: Target, color: '#ec4899' },
                            { path: '/quotations', name: 'Quotes', icon: FileText, color: '#64748b' }
                        ].map((link, idx) => (
                            <div onClick={() => navigate(link.path)} key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 12px', background: 'var(--bg-body)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-heading)', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: \`\${link.color}15\`, color: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                    <link.icon size={18} />
                                </div>
                                {link.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Executives Table */}
            <div className="analytics-card" style={{ marginTop: '24px' }}>
                <div className="analytics-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={18} /> Top Sales Executives</h3>
                </div>
                <div style={{ padding: '0 20px 20px 20px' }}>
                    {topExecutives.length > 0 ? (
                        <table className="enterprise-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                    <th>Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topExecutives.map((exec, i) => (
                                    <tr key={i}>
                                        <td><strong>{exec.name}</strong></td>
                                        <td>{exec.deliveries}</td>
                                        <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>{exec.revenue}</span></td>
                                        <td>
                                            <span style={{ 
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                background: exec.rank === 1 ? 'rgba(245,158,11,0.1)' : 'var(--bg-surface-hover)', 
                                                color: exec.rank === 1 ? '#F59E0B' : 'var(--text-muted)'
                                            }}>
                                                #{exec.rank}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>No Sales Performance Data Available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
`;
   fs.writeFileSync(file, beforeReturn + newReturn);
   console.log('SalesDashboard.jsx successfully replaced');
} else {
    console.log('Could not find return statement');
}
