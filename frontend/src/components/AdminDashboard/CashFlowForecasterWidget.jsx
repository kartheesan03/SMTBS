import React, { useState } from 'react';
import { DollarSign, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { useCashFlowForecaster } from '../../hooks/useCashFlowForecaster';
import './CashFlowForecasterWidget.css';

const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

const CashFlowForecasterWidget = () => {
  const [activeView, setActiveView] = useState('30days');
  const { data, loading, error, applyRecommendation } = useCashFlowForecaster();
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'applied' | 'dismissed' | 'applying'

  const handleApply = async () => {
    if (!data?.recommendation) return;
    try {
      setStatus('applying');
      await applyRecommendation(
        data.recommendation.forecast_id, 
        data.recommendation.suggested_action
      );
      setStatus('applied');
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const handleDismiss = () => {
    setStatus('dismissed');
  };

  if (loading) {
    return (
      <div className="bx-cf-panel">
        <div className="bx-cf-header">
          <div className="bx-cf-icon-container">
            <DollarSign size={16} color="#16a34a" />
          </div>
          <div className="bx-cf-header-text">
            <h2 className="bx-cf-title">SMART CASH FLOW</h2>
            <p className="bx-cf-subtitle">Predicting financial trajectory...</p>
          </div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          Consulting Financial AI Copilot...
        </div>
      </div>
    );
  }

  if (error || !data || !data.recommendation) {
    return (
      <div className="bx-cf-panel">
        <div className="bx-cf-header">
          <div className="bx-cf-icon-container" style={{ background: '#f1f5f9', boxShadow: 'none' }}>
            <DollarSign size={16} color="#64748b" />
          </div>
          <div className="bx-cf-header-text">
            <h2 className="bx-cf-title" style={{ color: '#64748b' }}>SMART CASH FLOW</h2>
            <p className="bx-cf-subtitle">AI temporarily unavailable</p>
          </div>
        </div>
      </div>
    );
  }

  const { recommendation, metrics } = data;

  return (
    <div className="bx-cf-panel">
      
      {/* 1. Header */}
      <div className="bx-cf-header">
        <div className="bx-cf-icon-container">
          <DollarSign size={16} color="#16a34a" />
        </div>
        <div className="bx-cf-header-text">
          <h2 className="bx-cf-title">SMART CASH FLOW</h2>
          <p className="bx-cf-subtitle">Predictive revenue and expense tracking</p>
        </div>
      </div>

      {/* 2. Status row */}
      <div className="bx-cf-status-row">
        <div className="bx-cf-monitoring">
          <span className="pulse-dot-green"></span>
          AI FINANCIAL SYNC ACTIVE
        </div>
        
        <select 
          className="bx-ai-role-switcher" 
          value={activeView} 
          onChange={(e) => setActiveView(e.target.value)}
          style={{
            fontSize: '0.7rem',
            padding: '4px 20px 4px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            color: '#334155',
            background: '#ffffff'
          }}
        >
          <option value="30days">30-Day Forecast</option>
          <option value="60days">60-Day Forecast</option>
          <option value="90days">90-Day Forecast</option>
        </select>
      </div>

      {/* 3. 2x2 metric grid */}
      <div className="bx-cf-overview">
        <div className="bx-cf-stat">
          <h3 style={{ color: '#0f172a' }}>{formatCurrency(metrics?.current_cash || 0)}</h3>
          <p>CURRENT CASH</p>
        </div>
        <div className="bx-cf-stat">
          <h3 style={{ color: '#16a34a' }}>{formatCurrency(metrics?.pending_receivables || 0)}</h3>
          <p>INFLOW (RECEIVABLES)</p>
        </div>
        <div className="bx-cf-stat">
          <h3 style={{ color: '#dc2626' }}>{formatCurrency(metrics?.pending_payables || 0)}</h3>
          <p>OUTFLOW (PAYABLES + PAYROLL)</p>
        </div>
        <div className="bx-cf-stat">
          <h3 style={{ color: recommendation.shortage_risk === 'High' ? '#dc2626' : '#2563eb' }}>
            {formatCurrency(metrics?.projected_cash || 0)}
          </h3>
          <p>PROJECTED CASH</p>
        </div>
      </div>

      {/* 4. AI recommendation section */}
      <div className="bx-cf-main-panel">
        
        <div className="bx-cf-main-header">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px', color: recommendation.shortage_risk === 'High' ? '#b91c1c' : '#15803d' }}>
            {recommendation.shortage_risk === 'High' ? <AlertTriangle size={12} /> : <TrendingUp size={12} />}
            {recommendation.shortage_risk === 'High' ? 'CASH SHORTAGE RISK' : 'HEALTHY TRAJECTORY'}
          </h4>
          <div className="bx-cf-risk-badge" style={{ 
            background: recommendation.shortage_risk === 'High' ? '#fee2e2' : '#dcfce7',
            color: recommendation.shortage_risk === 'High' ? '#991b1b' : '#166534'
          }}>
            Score: {metrics?.health_score}/100
          </div>
        </div>
        
        {status === 'idle' || status === 'applying' ? (
          <>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' }}>
              Forecast ID: {recommendation.forecast_id}
            </div>
            
            <div className="bx-cf-insight-box">
              "{recommendation.reasoning}"
            </div>
            
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '8px', letterSpacing: '0.5px' }}>
              RECOMMENDED ACTION
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
              {recommendation.suggested_action}
            </div>
            
            <div className="bx-cf-actions">
              <button className="bx-cf-btn-secondary" onClick={handleDismiss} disabled={status === 'applying'}>
                Dismiss
              </button>
              <button className="bx-cf-btn-primary" onClick={handleApply} disabled={status === 'applying'}>
                {status === 'applying' ? 'Processing...' : 'Take Action'}
              </button>
            </div>
          </>
        ) : status === 'applied' ? (
          <div className="bx-cf-success">
            <CheckCircle size={32} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ margin: '0 0 8px', color: '#0f172a' }}>Action Applied</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Financial safeguard measures have been initiated.
            </p>
          </div>
        ) : (
          <div className="bx-cf-success" style={{ color: '#64748b' }}>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>Recommendation dismissed.</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default CashFlowForecasterWidget;
