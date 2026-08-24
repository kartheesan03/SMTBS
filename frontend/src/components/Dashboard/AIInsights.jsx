import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';

const AIInsights = ({ insights, loading, error }) => {
  return (
    <div className="dash-card bg-gradient-ai">
      <div className="dash-card-header text-white">
        <h3 className="dash-card-title flex-center gap-2">
          <Zap size={18} /> AI Assistant
        </h3>
      </div>
      <div className="dash-card-content text-white">
        {loading ? (
          <div className="ai-loading">Generating insights...</div>
        ) : error ? (
          <div className="ai-error flex-center gap-2">
            <AlertCircle size={16} /> Error loading insights
          </div>
        ) : (!insights || insights.length === 0) ? (
          <div className="empty-state text-white">No AI insights available today.</div>
        ) : (
          <div className="ai-insights-list">
            {insights.map((insight, idx) => (
              <div key={idx} className="ai-item">
                <span className="ai-bullet">•</span>
                <span className="ai-text">{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
