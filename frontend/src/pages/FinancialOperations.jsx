import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { TrendingUp, CreditCard, AlertTriangle, DollarSign, Search , Wallet} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import toast from 'react-hot-toast';

const FinancialOperations = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchData = async () => {
        try {
            const res = await API.get('/orders').catch(() => ({ data: [] }));
            let extractedOrders = [];
            if (Array.isArray(res.data)) extractedOrders = res.data;
            else if (res.data && Array.isArray(res.data.orders)) extractedOrders = res.data.orders;
            else if (res.data && Array.isArray(res.data.data)) extractedOrders = res.data.data;
            setOrders(extractedOrders);
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Compute financial KPIs
    const salesOrders = orders.filter(o => (o.orderType || '').toLowerCase().includes('sales'));
    const purchaseOrders = orders.filter(o => (o.orderType || '').toLowerCase().includes('purchase'));
    const completedSales = salesOrders.filter(o => ['Delivered', 'Completed'].includes(o.status));
    const revenue = completedSales.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const totalPayables = purchaseOrders.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const overdueOrders = orders.filter(o => o.paymentStatus === 'Overdue' || (o.dueDate && new Date(o.dueDate) < new Date() && o.paymentStatus !== 'Paid'));
    const overdueAmount = overdueOrders.reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
    const outstandingRecv = salesOrders.filter(o => o.paymentStatus !== 'Paid').reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);

    const formatCurrency = (val) => {
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
        if (val >= 1000) return `₹${Math.round(val / 1000)}K`;
        return `₹${val.toLocaleString()}`;
    };

    // P&L chart data — derived from real orders by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const plData = [];
    for (let i = 5; i >= 0; i--) {
        let mIdx = currentMonthIdx - i;
        if (mIdx < 0) mIdx += 12;
        const mName = monthNames[mIdx];
        const monthSalesRev = salesOrders
            .filter(o => ['Delivered', 'Completed'].includes(o.status))
            .filter(o => { const d = new Date(o.orderDate || o.createdAt); return !isNaN(d) && d.getMonth() === mIdx; })
            .reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
        const monthPurchaseExp = purchaseOrders
            .filter(o => { const d = new Date(o.orderDate || o.createdAt); return !isNaN(d) && d.getMonth() === mIdx; })
            .reduce((s, o) => s + (Number(o.totalAmount) || Number(o.grandTotal) || 0), 0);
        plData.push({ name: mName, revenue: monthSalesRev, profit: monthSalesRev - monthPurchaseExp });
    }
    const latestPL = plData[plData.length - 1] || { revenue: 0, profit: 0 };
    const latestExpense = latestPL.revenue - latestPL.profit;

    // Spend by category — derived from real purchase order items
    const categoryColors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];
    const catSpendMap = {};
    purchaseOrders.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
            o.items.forEach(item => {
                const cat = item.category || item.materialCategory || 'Other';
                catSpendMap[cat] = (catSpendMap[cat] || 0) + ((Number(item.quantity) || 0) * (Number(item.price) || Number(item.unitPrice) || 0));
            });
        } else {
            const cat = 'General';
            catSpendMap[cat] = (catSpendMap[cat] || 0) + (Number(o.totalAmount) || Number(o.grandTotal) || 0);
        }
    });
    const totalSpend = Object.values(catSpendMap).reduce((s, v) => s + v, 0) || 1;
    const spendData = Object.entries(catSpendMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value], idx) => ({
            name,
            value,
            color: categoryColors[idx % categoryColors.length],
            pct: `${Math.round((value / totalSpend) * 100)}%`
        }));

    // Invoice data from orders
    const invoiceData = orders.map((o, i) => {
        const isPurchase = (o.orderType || '').toLowerCase().includes('purchase');
        return {
            id: o.invoiceNumber || `INV-${3009 - i}`,
            type: isPurchase ? 'Payable' : 'Receivable',
            party: isPurchase ? (o.vendor?.companyName || o.vendor?.name || 'Vendor') : (o.customer?.company || o.customer?.name || 'Customer'),
            poSo: o.orderNumber || '',
            amount: Number(o.totalAmount) || Number(o.grandTotal) || 0,
            dueDate: o.dueDate || o.deliveryDate || o.expectedDelivery,
            status: o.paymentStatus || 'Pending',
            _id: o._id || o.id
        };
    });

    const typeFilters = ['All Types', 'Payable', 'Receivable'];
    const statusFilters = ['All', 'Paid', 'Pending', 'Due Soon', 'Overdue'];

    const filteredInvoices = invoiceData.filter(inv => {
        const matchType = typeFilter === 'All Types' || inv.type === typeFilter;
        const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchType && matchStatus;
    });

    const barData = [{v:5},{v:7},{v:4},{v:8},{v:6},{v:9},{v:7}];

    if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="loader"></div></div>;

    return (
        <div className="rd-container">
            
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Financial Operations</span>
                            <span className="rd-module-badge">FINANCE</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <FinKPICard title="Revenue (Paid)" val={formatCurrency(revenue)} subtitle="This month" color="green" icon={TrendingUp} data={barData} />
                    <FinKPICard title="Total Payables" val={formatCurrency(totalPayables)} subtitle="vs last month" color="blue" icon={CreditCard} data={barData} />
                    <FinKPICard title="Overdue" val={formatCurrency(overdueAmount)} subtitle="Needs attention" subtitleColor="#ef4444" color="red" icon={AlertTriangle} data={barData} />
                    <FinKPICard title="Outstanding Recv." val={formatCurrency(outstandingRecv)} subtitle="vs last month" color="orange" icon={DollarSign} data={barData} />
                </div>

                {/* Charts Section */}
                <div style={{display: 'flex', gap: 24, marginBottom: 24}}>
                    {/* P&L Chart */}
                    <div className="rd-chart-card" style={{flex: 2}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20}}>
                            <div style={{width: 4, height: 20, borderRadius: 2, background: '#3b82f6'}}></div>
                            <h3 className="rd-chart-title" style={{margin: 0}}>P&L Overview — 6 Months</h3>
                        </div>
                        <div style={{height: 220}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={plData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => `${v/1000}K`} />
                                    <Tooltip formatter={(val, name) => [`$${val.toLocaleString()}`, `${name} amount`]} contentStyle={{borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{display: 'flex', gap: 16, marginTop: 20}}>
                            <div style={{flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                                <div style={{fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4}}>REVENUE ({(latestPL.name || '').toUpperCase()})</div>
                                <div style={{fontSize: 20, fontWeight: 800, color: '#1d4ed8'}}>{formatCurrency(latestPL.revenue)}</div>
                            </div>
                            <div style={{flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                                <div style={{fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4}}>EXPENSE ({(latestPL.name || '').toUpperCase()})</div>
                                <div style={{fontSize: 20, fontWeight: 800, color: '#dc2626'}}>{formatCurrency(latestExpense)}</div>
                            </div>
                            <div style={{flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc'}}>
                                <div style={{fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4}}>PROFIT ({(latestPL.name || '').toUpperCase()})</div>
                                <div style={{fontSize: 20, fontWeight: 800, color: '#059669'}}>{formatCurrency(latestPL.profit)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Spend by Category Donut */}
                    <div className="rd-chart-card" style={{flex: 1}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20}}>
                            <div style={{width: 4, height: 20, borderRadius: 2, background: '#f59e0b'}}></div>
                            <h3 className="rd-chart-title" style={{margin: 0}}>Spend by Category</h3>
                        </div>
                        <div style={{height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={spendData} innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                        {spendData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
                                <div style={{fontSize: 18, fontWeight: 800, color: 'var(--rd-text-main)'}}>{formatCurrency(totalSpend)}</div>
                                <div style={{fontSize: 10, fontWeight: 700, color: '#94a3b8'}}>TOTAL</div>
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16}}>
                            {spendData.map((item, i) => (
                                <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                        <span style={{width: 8, height: 8, borderRadius: '50%', background: item.color}}></span>
                                        <span style={{fontSize: 13, color: '#475569'}}>{item.name}</span>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                        <span style={{fontSize: 13, fontWeight: 700, color: 'var(--rd-text-main)'}}>{formatCurrency(item.value)}</span>
                                        <span style={{fontSize: 12, color: '#94a3b8'}}>{item.pct}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Invoice Register Table */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div className="rd-table-title">Invoice Register</div>
                            <div className="rd-table-subtitle">Payables & receivables — all invoices</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                                {typeFilters.map(f => (
                                    <button key={f} onClick={() => setTypeFilter(f)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                                            background: typeFilter === f ? '#3b82f6' : '#fff',
                                            color: typeFilter === f ? '#fff' : '#64748b',
                                            borderColor: typeFilter === f ? '#3b82f6' : '#e2e8f0'
                                        }}>{f}</button>
                                ))}
                            </div>
                            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                                {statusFilters.map(f => (
                                    <button key={f} onClick={() => setStatusFilter(f)}
                                        style={{
                                            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid',
                                            background: statusFilter === f ? '#475569' : '#fff',
                                            color: statusFilter === f ? '#fff' : '#64748b',
                                            borderColor: statusFilter === f ? '#475569' : '#e2e8f0'
                                        }}>{f}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                <th>INVOICE ID</th>
                                <th>TYPE</th>
                                <th>PARTY</th>
                                <th>PO/SO</th>
                                <th>AMOUNT</th>
                                <th>DUE DATE</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length === 0 ? (
                                <tr><td colSpan={8} style={{textAlign: 'center', padding: 40, color: '#94a3b8'}}>No invoices found</td></tr>
                            ) : filteredInvoices.map((inv, i) => {
                                const statusColors = {
                                    'Paid': 'rd-status-green', 'Overdue': 'rd-status-red',
                                    'Sent': 'rd-status-blue', 'Draft': 'rd-status-gray',
                                    'Pending': 'rd-status-orange'
                                };
                                const typeColor = inv.type === 'Receivable' ? '#10b981' : '#f59e0b';
                                const typeBg = inv.type === 'Receivable' ? '#ecfdf5' : '#fff7ed';

                                return (
                                    <tr key={inv._id || i}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{inv.id}</td>
                                        <td>
                                            <span style={{padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: typeBg, color: typeColor}}>
                                                {inv.type}
                                            </span>
                                        </td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{inv.party}</td>
                                        <td style={{color: '#64748b'}}>{inv.poSo || '-'}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>₹{inv.amount.toLocaleString()}</td>
                                        <td style={{color: inv.status === 'Overdue' ? '#ef4444' : '#64748b', fontWeight: inv.status === 'Overdue' ? 700 : 400}}>
                                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'}) : '-'}
                                        </td>
                                        <td><span className={`rd-status-badge ${statusColors[inv.status] || 'rd-status-blue'}`}>{inv.status}</span></td>
                                        <td>
                                            {inv.status === 'Paid' ? (
                                                <span style={{color: '#10b981', fontWeight: 600, fontSize: 13}}>✓ Done</span>
                                            ) : (
                                                <button className="rd-btn-outline" style={{padding: '5px 12px', fontSize: 12, color: '#3b82f6', borderColor: '#bfdbfe'}}>Mark Paid</button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinKPICard = ({ title, val, trend, subtitle, subtitleColor, color, icon: Icon, data }) => {
    const gradients = {
        green: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        blue: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        red: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        orange: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
    };
    const iconBgs = { green: '#d1fae5', blue: '#dbeafe', red: '#ffe4e6', orange: '#ffedd5' };
    const iconColors = { green: '#10b981', blue: '#3b82f6', red: '#ef4444', orange: '#f59e0b' };
    const barColors = { green: '#6ee7b7', blue: '#93c5fd', red: '#fca5a5', orange: '#fdba74' };
    const valColors = { green: '#059669', blue: '#1d4ed8', red: '#dc2626', orange: '#ea580c' };

    return (
        <div style={{
            background: gradients[color], borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.04)', minHeight: 130, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div style={{width: 40, height: 40, borderRadius: 10, background: iconBgs[color], display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon size={20} color={iconColors[color]} />
                    </div>
                    <div>
                        <div style={{fontSize: 28, fontWeight: 800, color: valColors[color], lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 6}}>{title}</div>
                    </div>
                </div>
                <div style={{width: 80, height: 50}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="v" fill={barColors[color]} radius={[2,2,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 10}}>
                {trend && <span style={{fontSize: 12, fontWeight: 700, color: iconColors[color]}}>↗ {trend}</span>}
                <span style={{fontSize: 12, color: subtitleColor || '#94a3b8'}}>{subtitle}</span>
            </div>
        </div>
    );
};

export default FinancialOperations;
