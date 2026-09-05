import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import PageHeader from '../components/PageHeader';
import { LoadingState } from '../components/DataStates';
import { StatsCard, StatsGrid } from '../components/ui/StatsCard';
import { TrendingUp, TrendingDown, IndianRupee, AlertTriangle, FileText, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import './ExpenseTracking.css';
import ExpenseAnalytics from './ExpenseAnalytics';
import TransactionJourney from '../components/AdminDashboard/TransactionJourney';

const ExpenseTracking = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState('All Months');

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const PAGE_SIZE = 15;
  const [page, setPage] = useState(1);

  // OCR deep-link context
  const location = useLocation();
  const [ocrContext, setOcrContext] = useState(null);
  const [showOcrBanner, setShowOcrBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ocrId = params.get('ocrId');
    const invoiceId = params.get('invoiceId');
    const poNumber = params.get('poNumber');
    const vendor = params.get('vendor');

    if (ocrId || invoiceId) {
      setOcrContext({ ocrId, invoiceId, poNumber, vendor });
      setShowOcrBanner(true);
    }
  }, [location.search]);

  const months = ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(String);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/expense-tracking/dashboard`, {
        params: { year, month }
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load expense tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPage(1);
  }, [year, month]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  if (loading && !data) return <div style={{ padding: 40 }}><LoadingState /></div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>No data available</div>;

  if (selectedTransaction) {
    return (
      <div className="et-container">
        <TransactionJourney
          transaction={selectedTransaction}
          allTransactions={data?.transactions || []}
          onBack={() => setSelectedTransaction(null)}
        />
      </div>
    );
  }

  const { summary, monthly, transactions } = data;

  const totalPages = Math.ceil((transactions?.length || 0) / PAGE_SIZE) || 1;
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = transactions?.slice(startIndex, startIndex + PAGE_SIZE) || [];

  return (
    <div className="et-container">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader
          title="Expense Tracker"
          subtitle="Centralized reporting and tracking of income and expenses across OCR and Procurement."
        />

        {showOcrBanner && ocrContext && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px',
            padding: '12px 16px', marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🔗</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1d4ed8' }}>
                  Viewing record linked from OCR Document
                </div>
                <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '3px' }}>
                  {[
                    ocrContext.invoiceId && `Invoice: ${ocrContext.invoiceId}`,
                    ocrContext.poNumber && `PO: ${ocrContext.poNumber}`,
                    ocrContext.vendor && `Vendor: ${ocrContext.vendor}`,
                  ].filter(Boolean).join('  ·  ')}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowOcrBanner(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px', lineHeight: 1, padding: 0, flexShrink: 0 }}
              aria-label="Dismiss"
            >×</button>
          </div>
        )}

        <div className="et-filter-bar">
          <div className="et-filter-group">
            <select value={year} onChange={(e) => setYear(e.target.value)} className="et-select">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="et-select">
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

        </div>

        <StatsGrid>
          <StatsCard title="Total Income" value={formatCurrency(summary.totalIncome || 0)} colorTheme="mint" icon={TrendingUp} trendValue="Money In" trendPositive={true} />
          <StatsCard title="Total Expense" value={formatCurrency(summary.totalExpense || 0)} colorTheme="pink" icon={TrendingDown} trendValue="Money Out" trendPositive={false} />
          <StatsCard title="Net Balance" value={formatCurrency(summary.netBalance || 0)} colorTheme={summary.netBalance >= 0 ? "blue" : "pink"} icon={IndianRupee} trendValue="Income - Expense" trendPositive={summary.netBalance >= 0} />
          <StatsCard title="Pending Expense" value={formatCurrency(summary.pendingExpense || 0)} colorTheme="peach" icon={AlertTriangle} trendValue="Unpaid Liabilities" trendPositive={false} />
        </StatsGrid>

        <div className="et-charts-row">
          <div className="et-chart-card">
            <h3 className="et-chart-title">Income vs Expense</h3>
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 20, right: 10, left: 10, bottom: 20 }} barGap={8}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`} dx={-10} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', padding: '12px' }}
                    itemStyle={{ fontWeight: 600, padding: '4px 0' }}
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 24 }} iconType="circle" />
                  <Bar dataKey="Income" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} barSize={24} animationDuration={1500} />
                  <Bar dataKey="Expense" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} barSize={24} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <ExpenseAnalytics data={data} />

        <div style={{ marginTop: '24px' }}>
          <div className="rd-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Financial Transactions</h3>
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="et-source-badge">{summary.transactionCount} Total</span>
              </div>
            </div>

            <div className="rd-table-scroll">
              <table className="rd-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>TYPE</th>
                    <th>REFERENCE</th>
                    <th>VENDOR/PARTY</th>
                    <th>CATEGORY</th>
                    <th>SOURCE</th>
                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                    <th style={{ textAlign: 'right' }}>BALANCE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No financial transactions found for the selected period.</td></tr>
                  ) : (
                    pageRows.map((t, idx) => {
                      const isOcrMatch = ocrContext && (
                        (ocrContext.invoiceId && t.invoiceId && t.invoiceId === ocrContext.invoiceId) ||
                        (ocrContext.invoiceId && t.transactionId && t.transactionId.includes(ocrContext.invoiceId)) ||
                        (ocrContext.poNumber && t.purchaseOrderId && t.purchaseOrderId === ocrContext.poNumber) ||
                        (ocrContext.vendor && t.vendor && t.vendor.toLowerCase().includes(ocrContext.vendor.toLowerCase()))
                      );
                      return (
                        <tr key={idx} onClick={() => setSelectedTransaction(t)} style={{ cursor: 'pointer', ...(isOcrMatch ? { background: '#eff6ff', boxShadow: 'inset 3px 0 0 #3b82f6' } : {}) }} className="et-tr-hover">
                          <td style={{ color: '#64748b' }}>{new Date(t.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td>
                            <span className={`ui-badge ${t.type === 'Income' ? 'success' : 'danger'}`}>{t.type}</span>
                          </td>
                          <td style={{ fontWeight: 600, color: '#3b82f6' }}>{t.transactionId.substring(0, 14)}...</td>
                          <td style={{ fontWeight: 600 }}>{t.vendor}</td>
                          <td>{t.category}</td>
                          <td><span className="et-source-badge">{t.source}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'Income' ? '#10b981' : '#ef4444' }}>
                            {t.type === 'Income' ? '+' : '-'} {formatCurrency(t.amount)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(t.balanceAfter)}</td>
                          <td>
                            <span className={`ui-badge ${['Paid', 'Approved'].includes(t.status) ? 'success' : 'warning'}`}>{t.status}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="et-pagination">
                <span className="et-pg-info">
                  Page {safePage} of {totalPages}
                </span>
                <div className="et-pg-controls">
                  <button className="et-pg-btn" disabled={safePage === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} className={`et-pg-btn ${safePage === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </button>
                  )).slice(Math.max(0, safePage - 3), Math.min(totalPages, safePage + 2))}
                  <button className="et-pg-btn" disabled={safePage === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracking;
