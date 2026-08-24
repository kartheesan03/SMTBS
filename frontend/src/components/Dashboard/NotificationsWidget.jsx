import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsWidget = ({ notifications }) => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Notifications</h3>
        <span className="dash-badge bg-red">{notifications?.length || 0}</span>
      </div>
      <div className="dash-card-content">
        {(!notifications || notifications.length === 0) ? (
          <div className="empty-state">All caught up!</div>
        ) : (
          <div className="notification-list">
            {notifications.map((notif, idx) => (
              <div key={idx} className="notification-item">
                <div className="notif-icon bg-red-light">
                  <Bell size={14} className="text-red" />
                </div>
                <div className="notif-content">
                  <div className="notif-title">{notif.title}</div>
                  <div className="notif-time">{notif.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsWidget;
