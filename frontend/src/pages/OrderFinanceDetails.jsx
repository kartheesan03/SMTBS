import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../api/axios';
import PageHeader from '../components/PageHeader';
import {
  ArrowLeft, TrendingUp, TrendingDown, IndianRupee,
  ShoppingCart, Search, Filter, ChevronDown, RefreshCw
} from 'lucide-react';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { StatsCard, StatsGrid } from '../components/ui/StatsCard';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL  = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];

const fmtFull = (val) =>
  `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-');
  const map = {
    delivered: { bg: '#dcfce7', color: '#15803d' },
    approved:  { bg: '#d1fae5', color: '#065f46' },
    confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
    processing:{ bg: '#e0f2fe', color: '#0369a1' },
    shipped:   { bg: '#ede9fe', color: '#6d28d9' },
    pending:   { bg: '#fef9c3', color: '#92400e' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' },
    rejected:  { bg: '#fee2e2', color: '#dc2626' },
  };
  const style = map[s] || { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      fontSize: '0.7rem',
      fontWeight: 700,
      background: style.bg,
      color: style.color,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap'
    }}>
      {status || '—'}
    </span>
  );
};

const OrderFinanceDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedYear, setSelectedYear] = useState(
    parseInt(searchParams.get('year') || new Date().getFullYear())
  );
  const [availableYears, setAvailableYears] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail filters
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');

  // All orders for current year (fetched monthly)
  const [allOrders, setAllOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  /* ── Fetch aggregated chart data ── */
  const fetchChartData = useCallback(async (year) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.get(`/orders/finances?year=${year}`);
      setChartData(data.data || []);
      if (data.availableYears?.length) setAvailableYears(data.availableYears);
    } catch (err) {
      setError('Unable to load order finance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Fetch all orders for the year ── */
  const fetchAllOrders = useCallback(async (year) => {
    setOrderLoading(true);
    try {
      // Fetch each month
      const promises = MONTHS_SHORT.map((_, i) =>
        API.get(`/orders/finances?year=${year}&month=${i + 1}`)
          .then(r => r.data)
          .catch(() => ({ salesOrders: [], purchaseOrders: [] }))
      );
      const results = await Promise.all(promises);
      const combined = [];
      results.forEach((r, mIdx) => {
        (r.salesOrders || []).forEach(o => combined.push({ ...o, _month: mIdx + 1 }));
        (r.purchaseOrders || []).forEach(o => combined.push({ ...o, _month: mIdx + 1 }));
      });
      setAllOrders(combined);
    } finally {
      setOrderLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChartData(selectedYear);
    fetchAllOrders(selectedYear);
  }, [selectedYear, fetchChartData, fetchAllOrders]);

  /* ── Aggregations ── */
  const totalSales    = chartData.reduce((s, m) => s + (m.sales || 0), 0);
  const totalPurchase = chartData.reduce((s, m) => s + (m.purchases || 0), 0);
  const salesCount    = allOrders.filter(o => o.orderType === 'sales').length;
  const purchaseCount = allOrders.filter(o => o.orderType === 'purchase').length;
  const netBalance    = totalSales - totalPurchase;

  /* ── All unique statuses for filter ── */
  const statusOptions = [...new Set(allOrders.map(o => o.status).filter(Boolean))];

  /* ── Filtered list ── */
  const filtered = allOrders.filter(o => {
    if (filterMonth !== 'all' && o._month !== parseInt(filterMonth)) return false;
    if (filterType   !== 'all' && o.orderType !== filterType) return false;
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const matchId = (o.orderNumber || '').toLowerCase().includes(q);
      const matchName = o.orderType === 'sales'
        ? (o.customer?.company || o.customer?.name || '').toLowerCase().includes(q)
        : (o.vendor?.companyName || o.vendor?.name || '').toLowerCase().includes(q);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  const handleRefresh = () => {
    fetchChartData(selectedYear);
    fetchAllOrders(selectedYear);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rd-container"
    >
      <div className="rd-content">
        {/* Back + Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: 8,
              padding: '8px 12px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 6, fontSize: '0.82rem',
              fontWeight: 600, color: '#475569', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        <PageHeader
          title="Order Finance Details"
          badge="FINANCE"
          subtitle={`Detailed receivables and payables analysis for ${selectedYear}`}
        />

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            style={{
              padding: '8px 32px 8px 14px', border: '1px solid #e2e8f0',
              borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
              background: '#f8fafc', cursor: 'pointer', outline: 'none'
            }}
          >
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={handleRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem',
              fontWeight: 600, color: '#475569', transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading order finances...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</div>
        ) : (
          <>
            <StatsGrid>
              <StatsCard
                title="Total Receivable"
                value={fmtFull(totalSales)}
                colorTheme="blue"
                icon={TrendingUp}
                trendValue={`${salesCount} Sales Orders`}
                trendPositive={true}
              />
              <StatsCard
                title="Total Payable"
                value={fmtFull(totalPurchase)}
                colorTheme="peach"
                icon={TrendingDown}
                trendValue={`${purchaseCount} Purchase Orders`}
                trendPositive={false}
              />
              <StatsCard
                title="Net Balance"
                value={fmtFull(Math.abs(netBalance))}
                colorTheme={netBalance >= 0 ? 'mint' : 'purple'}
                icon={IndianRupee}
                trendValue={netBalance >= 0 ? 'Net Receivable' : 'Net Payable'}
                trendPositive={netBalance >= 0}
              />
              <StatsCard
                title="Total Orders"
                value={allOrders.length}
                colorTheme="blue"
                icon={ShoppingCart}
                trendValue={`${selectedYear} fiscal year`}
                trendPositive={true}
              />
            </StatsGrid>

            {/* Monthly breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="rd-table-card"
              style={{ marginBottom: 24 }}
            >
              <div className="rd-table-header" style={{ borderBottom: '1px solid var(--rd-border)' }}>
                <div>
                  <div className="rd-table-title">Monthly Summary — {selectedYear}</div>
                  <div className="rd-table-subtitle">Month-by-month receivables vs payables</div>
                </div>
              </div>
              <div className="rd-table-scroll">
                <table className="rd-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th style={{ textAlign: 'right' }}>Receivable (Sales)</th>
                      <th style={{ textAlign: 'right' }}>Payable (Purchases)</th>
                      <th style={{ textAlign: 'right' }}>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((m, i) => {
                      const net = (m.sales || 0) - (m.purchases || 0);
                      return (
                        <tr key={m.name} style={{ height: 44 }}>
                          <td style={{ fontWeight: 600 }}>{MONTHS_FULL[i]}</td>
                          <td style={{ textAlign: 'right', color: '#1d4ed8', fontWeight: 600 }}>
                            {m.sales > 0 ? fmtFull(m.sales) : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                          <td style={{ textAlign: 'right', color: '#c2410c', fontWeight: 600 }}>
                            {m.purchases > 0 ? fmtFull(m.purchases) : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: net >= 0 ? '#15803d' : '#dc2626' }}>
                            {net !== 0 ? `${net >= 0 ? '+' : ''}${fmtFull(Math.abs(net))}` : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td style={{ padding: '10px 16px' }}>Total</td>
                      <td style={{ textAlign: 'right', padding: '10px 16px', color: '#1d4ed8' }}>{fmtFull(totalSales)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 16px', color: '#c2410c' }}>{fmtFull(totalPurchase)}</td>
                      <td style={{ textAlign: 'right', padding: '10px 16px', color: netBalance >= 0 ? '#15803d' : '#dc2626' }}>
                        {netBalance >= 0 ? '+' : ''}{fmtFull(Math.abs(netBalance))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </motion.div>

            {/* Detailed order list with filters */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="rd-table-card"
            >
              <div className="rd-table-header" style={{ borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="rd-table-title">All Orders — {selectedYear}</div>
                  <div className="rd-table-subtitle">
                    {filtered.length} of {allOrders.length} orders shown
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Search */}
                  <div className="rd-search-bar" style={{ minWidth: 200, background: '#f8fafc' }}>
                    <Search size={14} color="#94a3b8" />
                    <input
                      type="text"
                      className="rd-search-input"
                      placeholder="Search order or name..."
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                    />
                  </div>
                  {/* Month */}
                  <select
                    value={filterMonth}
                    onChange={e => setFilterMonth(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', background: '#f8fafc', outline: 'none' }}
                  >
                    <option value="all">All Months</option>
                    {MONTHS_FULL.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                  {/* Type */}
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', background: '#f8fafc', outline: 'none' }}
                  >
                    <option value="all">All Types</option>
                    <option value="sales">Sales Orders</option>
                    <option value="purchase">Purchase Orders</option>
                  </select>
                  {/* Status */}
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.8rem', background: '#f8fafc', outline: 'none' }}
                  >
                    <option value="all">All Statuses</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {orderLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading orders...
                </div>
              ) : (
                <div className="rd-table-scroll">
                  <table className="rd-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Type</th>
                        <th>Customer / Vendor</th>
                        <th>Month</th>
                        <th>Order Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                            No orders found matching the selected filters.
                          </td>
                        </tr>
                      ) : filtered.map((o, i) => {
                        const isSales = o.orderType === 'sales';
                        const name = isSales
                          ? (o.customer?.company || o.customer?.name || '—')
                          : (o.vendor?.companyName || o.vendor?.name || '—');
                        return (
                          <tr key={`${o.id}-${i}`} style={{ height: 48, cursor: 'pointer' }}
                            onClick={() => navigate(`/orders/${o.id}/tracking`)}
                          >
                            <td style={{ fontWeight: 700, color: '#2563eb' }}>
                              {o.orderNumber || o.id}
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: 20,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: isSales ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                                color: isSales ? '#059669' : '#2563eb'
                              }}>
                                {isSales ? 'SALES' : 'PURCHASE'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500 }}>{name}</td>
                            <td style={{ color: '#64748b' }}>{MONTHS_FULL[o._month - 1]}</td>
                            <td style={{ color: '#64748b' }}>
                              {o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              }) : '—'}
                            </td>
                            <td><StatusBadge status={o.status} /></td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                              {fmtFull(o.totalAmount)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {filtered.length > 0 && (
                      <tfoot>
                        <tr style={{ background: '#f8fafc' }}>
                          <td colSpan={6} style={{ padding: '10px 16px', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}>
                            {filtered.length} Orders Total
                          </td>
                          <td style={{ textAlign: 'right', padding: '10px 16px', fontWeight: 700, color: '#0f172a' }}>
                            {fmtFull(filtered.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default OrderFinanceDetails;
