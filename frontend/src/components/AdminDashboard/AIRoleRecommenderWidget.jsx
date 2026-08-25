import React from 'react';
import { Sparkles, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AIRoleRecommenderWidget = () => {
  const recommendations = [
    {
      id: 1,
      user: "Senthil Kumaran",
      role: "Manager",
      action: "Requesting access to 'Purchase Orders'",
      confidence: 94,
      type: "grant"
    },
    {
      id: 2,
      user: "Priya Saran",
      role: "HR",
      action: "Hasn't used 'Financial Reports' in 60+ days. Revoke?",
      confidence: 88,
      type: "revoke"
    },
    {
      id: 3,
      user: "Rahul",
      role: "Sales",
      action: "Pattern matches 'Sales Lead'. Upgrade role?",
      confidence: 76,
      type: "upgrade"
    }
  ];

  return (
    <div className="bx-card" style={{ marginTop: '1.5rem', background: 'linear-gradient(145deg, #ffffff, #f8fafc)', border: '1px solid #e2e8f0' }}>
      <div className="bx-card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <h3 className="bx-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
          <Sparkles size={16} color="#8b5cf6" />
          AI Role Insights
        </h3>
        <span style={{ fontSize: '0.7rem', background: '#ede9fe', color: '#6d28d9', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>Beta</span>
      </div>
      
      <div className="bx-tasks-list" style={{ marginTop: '12px' }}>
        {recommendations.map((rec) => (
          <div key={rec.id} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: '600', color: '#334155', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rec.user} <span style={{ color: '#94a3b8', fontWeight: '400' }}>({rec.role})</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                  {rec.action}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: rec.confidence > 90 ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                {rec.confidence > 90 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                {rec.confidence}% Match
              </div>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ background: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#64748b', cursor: 'pointer', fontWeight: '500' }}>
                  Ignore
                </button>
                <button style={{ background: rec.type === 'revoke' ? '#fee2e2' : '#e0e7ff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: rec.type === 'revoke' ? '#ef4444' : '#4f46e5', cursor: 'pointer', fontWeight: '600' }}>
                  {rec.type === 'revoke' ? 'Revoke' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ padding: '12px 0 0 0', textAlign: 'center' }}>
        <a href="#" style={{ fontSize: '0.75rem', color: '#8b5cf6', textDecoration: 'none', fontWeight: '600' }}>View All Insights →</a>
      </div>
    </div>
  );
};

export default AIRoleRecommenderWidget;
