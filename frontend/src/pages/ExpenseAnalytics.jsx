import React from 'react';
import './ExpenseTracking.css';
import { Loader2, TrendingUp, AlertCircle, Calculator, Hash, CreditCard, Wallet, Activity } from 'lucide-react';

const ExpenseAnalytics = ({ data, loading }) => {
  const categories = data?.categories || [];
  const paymentMethods = data?.paymentMethods || [];
  const transactions = data?.transactions || [];

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

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

  if (loading) {
    return (
      <div className="ea-card-container">
        <div className="ea-card">{renderLoading()}</div>
        <div className="ea-card">{renderLoading()}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ea-card-container">
        <div className="ea-card">{renderEmpty()}</div>
        <div className="ea-card">{renderEmpty()}</div>
      </div>
    );
  }

  // --- Calculate Spending Insights ---
  const expenseTx = transactions.filter(t => t.type === 'Expense');
  
  let highestCategory = { name: '—', value: 0 };
  if (categories.length > 0) {
    highestCategory = categories.reduce((prev, current) => (prev.value > current.value) ? prev : current);
  }

  let largestExpense = null;
  if (expenseTx.length > 0) {
    largestExpense = expenseTx.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);
  }

  const totalExpenseAmount = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const avgExpense = expenseTx.length > 0 ? totalExpenseAmount / expenseTx.length : 0;
  const numTransactions = expenseTx.length;

  // --- Calculate Payment Insights ---
  let primaryMethod = { name: '—', value: 0 };
  let secondaryMethod = null;
  
  const sortedMethods = [...paymentMethods].sort((a, b) => b.value - a.value);
  if (sortedMethods.length > 0) {
    primaryMethod = sortedMethods[0];
    if (sortedMethods.length > 1) {
      secondaryMethod = sortedMethods[1];
    }
  }

  const InsightRow = ({ icon: Icon, title, value, subtitle, valueColor = '#0f172a' }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
        <Icon size={18} color="#64748b" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{subtitle}</p>
          </div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: valueColor }}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ea-card-container">
      {/* Spending Insights Card */}
      <div className="ea-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Spending Insights</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Actionable analysis of your expenses</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InsightRow 
            icon={TrendingUp} 
            title="Highest Spending" 
            subtitle={highestCategory.name} 
            value={formatCurrency(highestCategory.value)} 
            valueColor="#ef4444"
          />
          <InsightRow 
            icon={AlertCircle} 
            title="Largest Transaction" 
            subtitle={largestExpense ? largestExpense.vendor : '—'} 
            value={largestExpense ? formatCurrency(largestExpense.amount) : '₹0'} 
          />
          <InsightRow 
            icon={Calculator} 
            title="Average Expense" 
            subtitle="Per transaction" 
            value={formatCurrency(avgExpense)} 
          />
          <InsightRow 
            icon={Hash} 
            title="Transactions" 
            subtitle="Total expense records" 
            value={numTransactions} 
          />
        </div>
      </div>

      {/* Payment Insights Card */}
      <div className="ea-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Payment Insights</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>How your business is clearing dues</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InsightRow 
            icon={CreditCard} 
            title="Primary Method" 
            subtitle={primaryMethod.name} 
            value={formatCurrency(primaryMethod.value)} 
            valueColor="#3b82f6"
          />
          {secondaryMethod ? (
            <InsightRow 
              icon={Wallet} 
              title="Secondary Method" 
              subtitle={secondaryMethod.name} 
              value={formatCurrency(secondaryMethod.value)} 
            />
          ) : (
             <InsightRow 
              icon={Wallet} 
              title="Secondary Method" 
              subtitle="—" 
              value="₹0" 
            />
          )}
          <InsightRow 
            icon={Activity} 
            title="Methods Used" 
            subtitle="Active payment channels" 
            value={sortedMethods.length} 
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalytics;
