import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAccessIntelligence } from '../../hooks/useAccessIntelligence';
import './AccessIntelligenceWidget.css';

const AccessIntelligenceWidget = () => {
  const [activeRole, setActiveRole] = useState('admin');
  const { data, loading, error, applyRecommendation } = useAccessIntelligence();
  
  // Local state for UI feedback
  const [status, setStatus] = useState('idle'); // 'idle' | 'applied' | 'dismissed' | 'applying'

  const handleApply = async () => {
    if (!data?.recommendation) return;
    try {
      setStatus('applying');
      await applyRecommendation(
        data.recommendation.employee_id, 
        data.recommendation.suggested_addition
      );
      setStatus('applied');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      // In a real app we'd show a toast error here
    }
  };

  const handleDismiss = () => {
    setStatus('dismissed');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="bx-ai-panel">
        <div className="bx-ai-header">
          <div className="bx-ai-sparkle">
            <Sparkles size={20} color="#8b5cf6" />
          </div>
          <div className="bx-ai-header-text">
            <h2 className="bx-ai-title">ACCESS INTELLIGENCE</h2>
            <p className="bx-ai-subtitle">Analyzing role assignments...</p>
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
      <div className="bx-ai-panel">
        <div className="bx-ai-header">
          <div className="bx-ai-sparkle" style={{ background: '#f1f5f9' }}>
            <Sparkles size={20} color="#64748b" />
          </div>
          <div className="bx-ai-header-text">
            <h2 className="bx-ai-title" style={{ color: '#64748b' }}>ACCESS INTELLIGENCE</h2>
            <p className="bx-ai-subtitle">AI temporarily unavailable</p>
          </div>
        </div>
      </div>
    );
  }

  const { recommendation, metrics } = data;

  return (
    <div className="bx-ai-panel">
      
      {/* 1. Header */}
      <div className="bx-ai-header">
        <div className="bx-ai-sparkle">
          <Sparkles size={20} color="#8b5cf6" />
        </div>
        <div className="bx-ai-header-text">
          <h2 className="bx-ai-title">ACCESS INTELLIGENCE</h2>
          <p className="bx-ai-subtitle">AI-powered role and permission recommendations</p>
        </div>
      </div>

      {/* 2. Status row */}
      <div className="bx-ai-status-row">
        <div className="bx-ai-monitoring">
          <span className="pulse-dot"></span>
          AI MONITORING ACTIVE
        </div>
        
        <select 
          className="bx-ai-role-switcher" 
          value={activeRole} 
          onChange={(e) => setActiveRole(e.target.value)}
        >
          <option value="admin">Demo: Admin View</option>
          <option value="hr">Demo: HR View</option>
          <option value="manager">Demo: Manager View</option>
          <option value="sales">Demo: Sales View</option>
          <option value="employee">Demo: Employee View</option>
        </select>
      </div>

      {/* 3. 2x2 metric grid */}
      <div className="bx-ai-overview">
        <div className="bx-ai-stat">
          <h3 style={{ color: '#0f172a' }}>{metrics?.role_fit_percent || 0}%</h3>
          <p>ROLE FIT</p>
        </div>
        <div className="bx-ai-stat">
          <h3 style={{ color: '#0f172a' }}>{metrics?.healthy_count || 0}</h3>
          <p>HEALTHY</p>
        </div>
        <div className="bx-ai-stat warning">
          <h3 style={{ color: '#f59e0b' }}>{metrics?.review_count || 0}</h3>
          <p>REVIEW</p>
        </div>
        <div className="bx-ai-stat danger">
          <h3 style={{ color: '#ef4444' }}>{metrics?.high_risk_count || 0}</h3>
          <p>HIGH RISK</p>
        </div>
      </div>

      {/* 4. AI recommendation section */}
      <div className="bx-ai-rec-panel">
        
        <div className="bx-ai-rec-header">
          <h4>AI RECOMMENDATION</h4>
          <div className="bx-ai-confidence">{recommendation.confidence}% confidence</div>
        </div>
        
        {status === 'idle' || status === 'applying' ? (
          <>
            <div className="bx-ai-user-profile">
              <div className="bx-ai-avatar">
                {getInitials(recommendation.employee_name)}
              </div>
              <div className="bx-ai-user-details">
                <h2>{recommendation.employee_name}</h2>
                <span className="bx-ai-user-role">{recommendation.current_role}</span>
              </div>
            </div>

            <div className="bx-ai-role-change">
              <div className="current">
                {recommendation.current_role}
              </div>
              <div className="bx-ai-arrow-container">
                <ArrowRight size={14} color="#94a3b8" />
              </div>
              <div className="recommended">
                {recommendation.current_role} + {recommendation.suggested_addition}
              </div>
            </div>

            <div className="bx-ai-actions">
              <button className="bx-ai-btn secondary" onClick={handleDismiss} disabled={status === 'applying'}>
                Dismiss
              </button>
              <button className="bx-ai-btn primary" onClick={handleApply} disabled={status === 'applying'}>
                {status === 'applying' ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </>
        ) : status === 'applied' ? (
          <div className="bx-ai-state-message success">
            Role successfully updated for {recommendation.employee_name}.
          </div>
        ) : (
          <div className="bx-ai-state-message ignored">
            Recommendation dismissed.
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AccessIntelligenceWidget;
