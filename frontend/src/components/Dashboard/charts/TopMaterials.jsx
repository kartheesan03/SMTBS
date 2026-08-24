import React from 'react';
import { Package } from 'lucide-react';

const TopMaterials = ({ data }) => {
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Top Materials</h3>
      </div>
      <div className="dash-card-content">
        {(!data || data.length === 0) ? (
          <div className="empty-state">No materials found</div>
        ) : (
          <div className="top-materials-list">
            {data.map((item, idx) => {
              const pct = (item.value / maxVal) * 100;
              return (
                <div key={idx} className="material-item">
                  <div className="material-info">
                    <div className="material-name-row">
                      <Package size={14} className="text-gray-400" />
                      <span className="material-name">{item.name}</span>
                    </div>
                    <span className="material-val">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="material-bar-bg">
                    <div className="material-bar-fill bg-indigo" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMaterials;
