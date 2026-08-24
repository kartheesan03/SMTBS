import React from 'react';
import { Clock } from 'lucide-react';

const RecentActivity = ({ activities }) => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Recent Activity</h3>
      </div>
      <div className="dash-card-content">
        {(!activities || activities.length === 0) ? (
          <div className="empty-state">No recent activity</div>
        ) : (
          <div className="activity-timeline">
            {activities.map((act, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-dot bg-blue" />
                <div className="activity-content">
                  <div className="activity-title">{act.title}</div>
                  <div className="activity-desc">{act.description}</div>
                  <div className="activity-time">
                    <Clock size={12} /> {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
