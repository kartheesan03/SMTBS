import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { EmptyState } from './DashboardWidgets';
import { BarChart2 } from 'lucide-react';
import './AdminDashboardPremium.css';

const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: 'var(--erp-bg-surface)', border: '1px solid var(--erp-border-light)', padding: '10px', borderRadius: '0px', boxShadow: 'var(--erp-shadow-md)' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 600, color: 'var(--erp-text-primary)' }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ margin: 0, color: entry.color, fontSize: '14px' }}>
                        {entry.name}: {formatter ? formatter(entry.value) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const SalesAreaChart = ({ data }) => {
    if (!data || data.length === 0) return <EmptyState icon={BarChart2} title="No Sales Data" message="There is no sales data available to display at this moment." />;
    
    // Fix for single data point issue in AreaCharts which causes a floating dot
    let chartData = data;
    if (data.length === 1) {
        chartData = [
            { name: 'Previous', revenue: 0, sales: 0 },
            ...data
        ];
    }
    
    return (
        <div className="erp-card erp-chart-full">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">Revenue Overview</h3>
                <button className="erp-premium-widget-action" style={{ color: 'var(--erp-text-secondary)' }}>This Month ⌄</button>
            </div>
            <div className="erp-chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--erp-info-color)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="var(--erp-info-color)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--erp-success-color)" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="var(--erp-success-color)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--erp-border-light)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--erp-text-secondary)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--erp-text-secondary)' }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                        <RechartsTooltip content={<CustomTooltip formatter={(val) => `$${val.toLocaleString()}`} />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--erp-info-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--erp-info-color)" }} dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "var(--erp-info-color)" }} name="Revenue" />
                        <Area type="monotone" dataKey="sales" stroke="var(--erp-success-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--erp-success-color)" }} dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "var(--erp-success-color)" }} name="Sales Count" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const CategoryPieChart = ({ data, title }) => {
    if (!data || data.length === 0) return <div className="erp-card"><EmptyState icon={BarChart2} title="No Data" message="No category data available." /></div>;
    
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#64748b'];

    return (
        <div className="erp-card">
            <div className="erp-premium-widget-header">
                <h3 className="erp-premium-widget-title">{title || "Distribution"}</h3>
            </div>
            <div className="erp-chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const PerformanceBarChart = ({ data, title, dataKey = "amount" }) => {
    if (!data || data.length === 0) return <div className="erp-card"><EmptyState icon={BarChart2} title="No Data" message="No performance data available." /></div>;
    
    return (
        <div className="erp-card">
            <div className="erp-section-header">
                <h2 className="erp-section-title">{title || "Performance"}</h2>
            </div>
            <div className="erp-chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--erp-border-light)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--erp-text-secondary)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--erp-text-secondary)' }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                        <RechartsTooltip content={<CustomTooltip formatter={(val) => `$${val.toLocaleString()}`} />} />
                        <Bar dataKey={dataKey} fill="var(--erp-primary-color)" radius={[4, 4, 0, 0]} name={title} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
export const InventoryStatusDonut = ({ inventoryData = [], totalItems = 0, title = "Inventory Status", centerLabel = "Total Items" }) => {
    const data = inventoryData.length > 0 ? inventoryData : [
        { name: 'No Data', value: 1, color: '#e2e8f0' }
    ];  
    return (  
        <div className="erp-card">  
            <div className="erp-premium-widget-header">  
                <h3 className="erp-premium-widget-title">{title}</h3>  
            </div>  
            <div className="erp-chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', position: 'relative' }}>  
                <ResponsiveContainer width="100%" height="100%">  
                    <PieChart>  
                        <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">  
                            {data.map((entry, index) => (  
                                <Cell key={`cell-${index}`} fill={entry.color} />  
                            ))}  
                        </Pie>  
                        <Legend 
                            verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" 
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value, entry) => {
                                const payload = entry.payload;
                                if (payload.name === 'No Data') {
                                    return <span style={{ color: 'var(--erp-text-secondary)', fontSize: '0.875rem', marginLeft: '8px' }}>No Data Available</span>;
                                }
                                const percent = totalItems > 0 ? ((payload.value / totalItems) * 100).toFixed(1) : 0;
                                return (
                                    <span style={{ color: 'var(--erp-text-primary)', fontSize: '0.875rem', marginLeft: '8px' }}>
                                        {value} <span style={{fontWeight: 600, marginLeft: '4px'}}>{payload.value.toLocaleString()}</span> {totalItems > 0 && <span style={{color: 'var(--erp-text-secondary)', marginLeft: '4px'}}>({percent}%)</span>}
                                    </span>
                                );
                            }} 
                        />
                    </PieChart>  
                </ResponsiveContainer>  
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', marginTop: '-15px' }}>  
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--erp-text-primary)' }}>{totalItems.toLocaleString()}</div>  
                    <div style={{ fontSize: '0.75rem', color: 'var(--erp-text-secondary)' }}>{centerLabel}</div>  
                </div>  
            </div>  
        </div>  
    );  
};
