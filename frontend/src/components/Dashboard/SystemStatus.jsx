import React from 'react';
import { Activity, Server, Database, Cloud } from 'lucide-react';

const SystemStatus = () => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">System Status</h3>
      </div>
      <div className="dash-card-content sys-status-list">
        
        <div className="sys-status-item">
          <div className="sys-icon bg-green-light">
            <Server size={18} className="text-green" />
          </div>
          <div className="sys-details">
            <span className="sys-label">App Server</span>
            <span className="sys-val">Operational</span>
          </div>
          <span className="sys-badge bg-green">100%</span>
        </div>

        <div className="sys-status-item">
          <div className="sys-icon bg-blue-light">
            <Database size={18} className="text-blue" />
          </div>
          <div className="sys-details">
            <span className="sys-label">Database</span>
            <span className="sys-val">Synced 1m ago</span>
          </div>
          <span className="sys-badge bg-blue">99.8%</span>
        </div>

        <div className="sys-status-item">
          <div className="sys-icon bg-purple-light">
            <Cloud size={18} className="text-purple" />
          </div>
          <div className="sys-details">
            <span className="sys-label">Cloud Sync</span>
            <span className="sys-val">Active</span>
          </div>
          <span className="sys-badge bg-purple">100%</span>
        </div>

        <div className="sys-status-item">
          <div className="sys-icon bg-orange-light">
            <Activity size={18} className="text-orange" />
          </div>
          <div className="sys-details">
            <span className="sys-label">Load Average</span>
            <span className="sys-val">0.42 / 1.00</span>
          </div>
          <span className="sys-badge bg-orange">Stable</span>
        </div>

      </div>
    </div>
  );
};

export default SystemStatus;
