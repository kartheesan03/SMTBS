import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import API from '../api/axios';
import { LoadingState } from '../components/DataStates';
import toast from 'react-hot-toast';
import './TransactionDetailsView.css';

const TransactionDetailsView = ({ transactionId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/expense-tracking/transaction/${transactionId}`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          toast.error(res.data.message || 'Failed to load transaction details');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading transaction details');
      } finally {
        setLoading(false);
      }
    };
    if (transactionId) {
      fetchDetails();
    }
  }, [transactionId]);

  if (loading) {
    return <div style={{ padding: 40 }}><LoadingState /></div>;
  }

  if (!data) {
    return (
      <div className="td-container">
        <button onClick={onBack} className="td-back-btn">
          <ArrowLeft size={18} /> Back to Transactions
        </button>
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          Transaction not found.
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const isIncome = data.type === 'Income';

  const getStatusColor = (status) => {
    const lower = (status || '').toLowerCase();
    if (['paid', 'approved', 'completed'].some(s => lower.includes(s))) return 'success';
    if (['pending', 'processing'].some(s => lower.includes(s))) return 'warning';
    if (['rejected', 'failed', 'cancelled'].some(s => lower.includes(s))) return 'danger';
    return 'default';
  };

  return (
    <div className="td-container">
      <div className="td-header">
        <button onClick={onBack} className="td-back-btn">
          <ArrowLeft size={18} /> Back to Transactions
        </button>
        <span className={`td-status-badge ${getStatusColor(data.status)}`}>
          {data.status}
        </span>
      </div>

      <div className="td-amount-section">
        <div className={`td-type-badge ${isIncome ? 'income' : 'expense'}`}>
          {data.type}
        </div>
        <div className={`td-amount ${isIncome ? 'income' : 'expense'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(data.amount)}
        </div>
        <div className="td-vendor">{data.vendor}</div>
      </div>

      <div className="td-card">
        <h3 className="td-card-title">Transaction Details</h3>
        <div className="td-grid">
          <div className="td-field">
            <span className="td-label">Transaction ID</span>
            <span className="td-value reference">{data.transactionId}</span>
          </div>
          <div className="td-field">
            <span className="td-label">Date & Time</span>
            <span className="td-value">{formatDate(data.transactionDate)}</span>
          </div>
          <div className="td-field">
            <span className="td-label">Category</span>
            <span className="td-value">{data.category}</span>
          </div>
          <div className="td-field">
            <span className="td-label">Source</span>
            <span className="td-value">{data.source}</span>
          </div>
          <div className="td-field">
            <span className="td-label">Reference (PO/Invoice)</span>
            <span className="td-value">{data.reference || 'N/A'}</span>
          </div>
          <div className="td-field">
            <span className="td-label">Created By</span>
            <span className="td-value">{data.createdBy}</span>
          </div>
        </div>
      </div>

      {data.notes && (
        <div className="td-card">
          <h3 className="td-card-title">Description / Notes</h3>
          <p style={{ margin: 0, color: '#334155', lineHeight: 1.6 }}>{data.notes}</p>
        </div>
      )}

      {data.timeline && data.timeline.length > 0 && (
        <div className="td-card">
          <h3 className="td-card-title">Transaction Timeline</h3>
          <div className="td-timeline">
            {data.timeline.map((item, index) => {
              const statusColor = getStatusColor(item.state);
              return (
                <div key={index} className={`td-timeline-item ${statusColor}`}>
                  <div className="td-timeline-icon"></div>
                  <div className="td-timeline-content">
                    <div className="td-timeline-header">
                      <span className="td-timeline-event">{item.event}</span>
                      <span className="td-timeline-time">{formatDate(item.timestamp)}</span>
                    </div>
                    <div className="td-timeline-meta">
                      <span>By: {item.user}</span>
                      <span className={`td-status-badge ${statusColor}`}>{item.state}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="td-actions">
        <button className="td-btn td-btn-outline">
          <Download size={16} /> Download PDF
        </button>
        <button className="td-btn td-btn-outline">
          <FileText size={16} /> Download Word
        </button>
        {data.attachments && data.attachments.length > 0 && (
          <button className="td-btn td-btn-primary">
            <FileText size={16} /> View Source Document
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailsView;
