import React from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Clock, FileText, CheckCircle, Search, CreditCard, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const TransactionJourney = ({ transaction, allTransactions, onBack }) => {
  if (!transaction) return null;

  // Find subsequent transactions (transactions that happened AFTER this one)
  const subsequentTransactions = allTransactions
    .filter(t => new Date(t.transactionDate) > new Date(transaction.transactionDate))
    .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

  const isIncome = transaction.type === 'Income';
  const amountColor = isIncome ? '#10b981' : '#ef4444';
  const Icon = isIncome ? ArrowDownRight : ArrowUpRight;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rd-card" style={{ maxWidth: 800, margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 24, marginBottom: 24 }}>
        <div>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 20 }}>
            <ArrowLeft size={16} /> Back to Financial Transactions
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: isIncome ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={24} color={amountColor} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {transaction.type.toUpperCase()}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: amountColor, display: 'flex', alignItems: 'center', gap: 8 }}>
                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 24, color: '#475569', fontSize: 14, marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> {new Date(transaction.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={16} /> {transaction.source} ({transaction.transactionId})</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={16} color={['Paid', 'Approved'].includes(transaction.status) ? '#10b981' : '#f59e0b'} /> {transaction.status}</div>
          </div>
        </div>
      </div>

      {/* Money Movement */}
      <div style={{ background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 32, border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Money Movement</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px dashed #cbd5e1', marginBottom: 16 }}>
          <div style={{ color: '#475569', fontWeight: 500 }}>Previous Balance</div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>{formatCurrency(transaction.balanceBefore)}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px dashed #cbd5e1', marginBottom: 16 }}>
          <div style={{ color: '#475569', fontWeight: 500 }}>This {transaction.type}</div>
          <div style={{ fontWeight: 700, color: amountColor, fontSize: 18 }}>{isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 16 }}>Remaining Balance</div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 20 }}>{formatCurrency(transaction.balanceAfter)}</div>
        </div>
      </div>

      {/* Subsequent Money Movement */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Subsequent Money Movement</h3>
        
        {subsequentTransactions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: 8, border: '1px dashed #e2e8f0' }}>
            No subsequent financial transactions recorded.
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: '#e2e8f0' }}></div>
            
            {subsequentTransactions.map((subTx, idx) => (
              <div key={idx} style={{ position: 'relative', marginBottom: 24 }}>
                <div style={{ position: 'absolute', left: -24, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: `3px solid ${subTx.type === 'Income' ? '#10b981' : '#ef4444'}` }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{subTx.type} via {subTx.source}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      {new Date(subTx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {subTx.transactionId}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: subTx.type === 'Income' ? '#10b981' : '#ef4444' }}>
                      {subTx.type === 'Income' ? '+' : '-'} {formatCurrency(subTx.amount)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 4 }}>
                      Bal: {formatCurrency(subTx.balanceAfter)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default TransactionJourney;
