import React, { useState } from 'react';
import { Activity, AlertOctagon } from 'lucide-react';
import { useOperationalIntelligence } from '../../hooks/useOperationalIntelligence';
import './OperationalIntelligenceWidget.css';

const OperationalIntelligenceWidget = () => {
  const [activeView, setActiveView] = useState('global');
  const { data, loading, error, applyRecommendation } = useOperationalIntelligence();
  
  // Local state for UI feedback
  const [status, setStatus] = useState('idle'); // 'idle' | 'applied' | 'dismissed' | 'applying'

  const handleApply = async () => {
    if (!data?.recommendation) return;
    try {
      setStatus('applying');
      await applyRecommendation(
        data.recommendation.process_id, 
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
      <div className="bx-oi-panel">
        <div className="bx-oi-header">
          <div className="bx-oi-icon-container">
            <Activity size={16} color="#d97706" />
          </div>
          <div className="bx-oi-header-text">
            <h2 className="bx-oi-title">OPERATIONAL INTELLIGENCE</h2>
            <p className="bx-oi-subtitle">Scanning process bottlenecks...</p>
          </div>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          Consulting AI Copilot...
        </div>
      </div>
    );
  }

  if (error || !data || !data.recommendation) {
    return (
      <div className="bx-oi-panel">
        <div className="bx-oi-header">
          <div className="bx-oi-icon-container" style={{ background: '#f1f5f9', boxShadow: 'none' }}>
            <Activity size={16} color="#64748b" />
          </div>
          <div className="bx-oi-header-text">
            <h2 className="bx-oi-title" style={{ color: '#64748b' }}>OPERATIONAL INTELLIGENCE</h2>
            <p className="bx-oi-subtitle">AI temporarily unavailable</p>
          </div>
        </div>
      </div>
    );
  }

  const { recommendation, metrics } = data;

  return (
    <div className="bx-oi-panel">
      
      {/* 1. Header */}
      <div className="bx-oi-header">
        <div className="bx-oi-icon-container">
          <Activity size={16} color="#d97706" />
        </div>
        <div className="bx-oi-header-text">
          <h2 className="bx-oi-title">OPERATIONAL INTELLIGENCE</h2>
          <p className="bx-oi-subtitle">Predictive process bottleneck detection</p>
        </div>
      </div>

      {/* 2. Status row */}
      <div className="bx-oi-status-row">
        <div className="bx-oi-monitoring">
          <span className="pulse-dot-amber"></span>
          AI MONITORING ACTIVE
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
          <option value="global">Global Operations View</option>
          <option value="procurement">Procurement View</option>
          <option value="logistics">Logistics View</option>
        </select>
      </div>

      {/* 3. 2x2 metric grid */}
      <div className="bx-oi-overview">
        <div className="bx-oi-stat">
          <h3 style={{ color: '#ea580c' }}>{metrics?.process_blockers || 0}</h3>
          <p>PROCESS BLOCKERS</p>
        </div>
        <div className="bx-oi-stat">
          <h3 style={{ color: '#ef4444' }}>{metrics?.delayed_projects || 0}</h3>
          <p>DELAYED PROJECTS</p>
        </div>
        <div className="bx-oi-stat">
          <h3 style={{ color: '#f59e0b' }}>{metrics?.idle_teams || 0}</h3>
          <p>IDLE TEAMS</p>
        </div>
        <div className="bx-oi-stat">
          <h3 style={{ color: '#10b981' }}>{metrics?.avg_efficiency || 0}%</h3>
          <p>EFFICIENCY SCORE</p>
        </div>
      </div>

      {/* 4. AI recommendation section */}
      <div className="bx-oi-main-panel">
        
        <div className="bx-oi-main-header">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertOctagon size={12} color="#c2410c"/>
            CRITICAL BOTTLENECK
          </h4>
          <div className="bx-oi-risk-badge">Impact: {100 - recommendation.efficiency_score}% Loss</div>
        </div>
        
        {status === 'idle' || status === 'applying' ? (
          <>
            <div className="bx-oi-process-profile">
              <div className="bx-oi-process-details">
                <h2>{recommendation.process_name}</h2>
                <span className="bx-oi-department">Department: {recommendation.department} | ID: {recommendation.process_id}</span>
              </div>
            </div>

            <div className="bx-oi-reasoning">
              "{recommendation.reasoning}"
            </div>
            
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Recommended Action</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{recommendation.suggested_action}</span>
            </div>

            <div className="bx-oi-actions">
              <button className="bx-oi-btn secondary" onClick={handleDismiss} disabled={status === 'applying'}>
                Dismiss
              </button>
              <button className="bx-oi-btn primary" onClick={handleApply} disabled={status === 'applying'}>
                {status === 'applying' ? 'Initiating...' : 'Take Action'}
              </button>
            </div>
          </>
        ) : status === 'applied' ? (
          <div className="bx-oi-state-message success">
            Action successfully initiated for {recommendation.process_name}.
          </div>
        ) : (
          <div className="bx-oi-state-message ignored">
            Recommendation dismissed.
          </div>
        )}
        
      </div>
    </div>
  );
};

export default OperationalIntelligenceWidget;
