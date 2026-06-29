import React, { useState } from 'react';
import './DetailView.css';

export const DetailViewContainer = ({ children }) => (
    <div className="ui-detail-container">
        {children}
    </div>
);

export const ProfileHeader = ({ 
    title, 
    subtitle, 
    avatarUrl, 
    avatarText,
    badges = [], // [{ label, type: 'success' | 'warning' | 'danger' | 'info' | 'default' }]
    actions = [] // [{ label, icon: Icon, onClick, primary: boolean }]
}) => (
    <div className="ui-detail-header">
        <div className="ui-detail-profile">
            <div className="ui-detail-avatar">
                {avatarUrl ? <img src={avatarUrl} alt={title} /> : (avatarText || title?.charAt(0) || '')}
            </div>
            <div className="ui-detail-info">
                <h1>{title}</h1>
                {subtitle && <p className="ui-detail-subtitle">{subtitle}</p>}
                {badges.length > 0 && (
                    <div className="ui-detail-badges">
                        {badges.map((badge, i) => (
                            <span key={i} className={`ui-badge ${badge.type || 'default'}`}>
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
        
        {actions.length > 0 && (
            <div className="ui-detail-actions">
                {actions.map((act, i) => (
                    <button 
                        key={i} 
                        className={act.primary ? 'ui-btn-primary' : 'ui-btn-outline'}
                        onClick={act.onClick}
                    >
                        {act.icon && <act.icon size={16} />}
                        {act.label}
                    </button>
                ))}
            </div>
        )}
    </div>
);

export const Tabs = ({ tabs = [] }) => {
    // tabs: [{ id, label, icon: Icon, content: ReactNode }]
    const [activeTab, setActiveTab] = useState(tabs[0]?.id);

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div className="ui-tabs-container">
            <div className="ui-tabs-header">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        className={`ui-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon && <tab.icon size={16} />}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="ui-tab-content">
                {currentTab?.content}
            </div>
        </div>
    );
};

export const Timeline = ({ items = [] }) => {
    // items: [{ id, time, title, description, color }]
    return (
        <div className="ui-timeline">
            {items.map((item, i) => (
                <div key={item.id || i} className="ui-timeline-item">
                    <div className="ui-timeline-dot" style={item.color ? { borderColor: item.color } : {}}></div>
                    <div className="ui-timeline-time">{item.time}</div>
                    <div className="ui-timeline-title">{item.title}</div>
                    {item.description && <div className="ui-timeline-desc">{item.description}</div>}
                </div>
            ))}
            {items.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '14px', paddingLeft: '16px' }}>No timeline events found.</div>
            )}
        </div>
    );
};

export const KeyValueCard = ({ title, items = [] }) => {
    // items: [{ label, value }]
    return (
        <div className="ui-kv-card">
            {title && <h4>{title}</h4>}
            <div className="ui-kv-grid">
                {items.map((item, i) => (
                    <div key={i} className="ui-kv-item">
                        <span className="ui-kv-label">{item.label}</span>
                        <span className="ui-kv-value">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
