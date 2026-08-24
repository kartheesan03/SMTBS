import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const UpcomingEvents = ({ events }) => {
  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">Upcoming Events</h3>
      </div>
      <div className="dash-card-content">
        {(!events || events.length === 0) ? (
          <div className="empty-state">No upcoming events</div>
        ) : (
          <div className="event-list">
            {events.map((evt, idx) => (
              <div key={idx} className="event-item">
                <div className="event-date-box">
                  <span className="event-month">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="event-day">{new Date(evt.date).getDate()}</span>
                </div>
                <div className="event-content">
                  <div className="event-title">{evt.title}</div>
                  <div className="event-time">
                    <CalendarIcon size={12} /> {evt.time}
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

export default UpcomingEvents;
