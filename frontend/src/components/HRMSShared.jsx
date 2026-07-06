import React from 'react';
export const HRMSKPICard = ({ title, val, sub, color, data, icon: Icon }) => {
    const themeClass = color ? `ent-theme-${color}` : 'ent-theme-primary';

    return (
        <div className={`ent-module-card ${themeClass}`} style={{ flexDirection: 'row', alignItems: 'center', gap: '16px' }}>
            <div className="ent-card-icon-wrapper" style={{ width: 56, height: 56, borderRadius: '50%' }}>
                <Icon size={28} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
                <div className="ent-card-title">{title}</div>
                <div className="ent-card-value" style={{ fontSize: '28px', marginBottom: '4px' }}>{val}</div>
                <div className="ent-card-status-badge">
                    {sub || 'Active Metric'}
                </div>
            </div>
        </div>
    );
};
