import React from 'react';
import './ExpenseTracking.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Loader2 } from 'lucide-react';

const ExpenseAnalytics = ({ data, loading }) => {
  const categories = data?.summary?.categories || [];
  const paymentMethods = data?.summary?.paymentMethods || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  const formatCompact = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const calcTotal = (arr) => arr.reduce((acc, curr) => acc + (curr.value || 0), 0);
  
  const totalCategory = calcTotal(categories);
  const totalPayment = calcTotal(paymentMethods);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{payload[0].name}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: payload[0].payload.fill }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: '#334155' }}>No expense data yet</p>
      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Add or import expenses to see your spending breakdown.</p>
    </div>
  );

  const renderLoading = () => (
    <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center', color: '#94a3b8' }}>
      <Loader2 size={24} className="animate-spin" />
    </div>
  );

  const renderCardContent = (dataset, total, title, subtitle, totalLabel) => {
    if (loading) return renderLoading();
    if (!dataset || dataset.length === 0) return renderEmpty();

    return (
      <>
        <div className="ea-header">
          <h3 className="ea-title">{title}</h3>
          <p className="ea-subtitle">{subtitle}</p>
        </div>

        <div className="ea-total-box">
          <p className="ea-total-amt">{formatCurrency(total)}</p>
          <p className="ea-total-label">{totalLabel}</p>
        </div>

        <div className="ea-body">
          <div className="ea-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataset}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {dataset.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="ea-chart-center">
              <span className="ea-center-val">{formatCompact(total)}</span>
              <span className="ea-center-lbl">Total</span>
            </div>
          </div>

          <div className="ea-legend">
            {dataset.map((item, idx) => {
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="ea-legend-row">
                  <div className="ea-legend-left">
                    <div className="ea-dot" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <p className="ea-name">{item.name}</p>
                  </div>
                  <div className="ea-legend-right">
                    <p className="ea-amt">{formatCurrency(item.value)}</p>
                    <p className="ea-pct">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="ea-card-container">
      <div className="ea-card">
        {renderCardContent(categories, totalCategory, 'Expense by Category', 'Where your money is being spent', 'Total Expenses')}
      </div>
      <div className="ea-card">
        {renderCardContent(paymentMethods, totalPayment, 'Payment Methods', 'How expenses were paid', 'Total Paid')}
      </div>
    </div>
  );
};

export default ExpenseAnalytics;
