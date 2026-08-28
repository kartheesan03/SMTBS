import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageHeader.css';
/**
 * PageHeader — standardized page title + module badge + optional subtitle.
 * Matches the Attendance Tracker reference style across the entire app.
 *
 * @param {string}  title    - Main page title (e.g. "Inventory Management")
 * @param {string}  badge    - Module label in uppercase (e.g. "INVENTORY") — optional
 * @param {string}  subtitle - Muted line beneath the title row — optional
 * @param {boolean} showBack - Whether to show a back arrow — optional
 * @param {boolean} hasInsights - Whether to show an attention dot (e.g. for pending actions)
 */
const PageHeader = ({ title, badge, subtitle, showBack = false, hasInsights = false, backPath = null, onBack = null, actions = [] }) => {
    const navigate = useNavigate();
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };
    return (
        <div className="rd-module-header">
            <div className="rd-module-info">
                <div
                    className="rd-module-title-row"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0px',
                        flexWrap: 'nowrap',
                    }}
                >
                    {showBack && (
                        <button
                            onClick={handleBack}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0f172a',
                                borderRadius: '4px',
                                marginRight: '6px',
                                flexShrink: 0,
                            }}
                            title="Go back"
                        >
                            <ArrowLeft size={22} />
                        </button>
                    )}
                    <span
                        className="rd-module-title"
                        style={{
                            margin: 0,
                            padding: 0,
                            lineHeight: 1.25,
                            flexShrink: 0,
                        }}
                    >
                        {title}
                    </span>
                    {badge && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {Array.isArray(badge) ? (
                                badge.map((b, i) => <span key={i} className="rd-module-badge">{b}</span>)
                            ) : (
                                <span className="rd-module-badge">{badge}</span>
                            )}
                        </div>
                    )}
                    {hasInsights && (
                        <div style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#ef4444',
                            marginLeft: 6,
                            boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
                        }} title="Actionable insights available" />
                    )}
                </div>
                {subtitle && (
                    <p className="rd-module-subtitle">
                        {subtitle}
                    </p>
                )}
            </div>
            
            {actions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {Array.isArray(actions) && actions.length > 0 ? actions.map((action, idx) => {
                        const Icon = action.icon;
                        return (
                            <button
                                key={idx}
                                onClick={action.onClick}
                                className={action.primary ? "ui-btn-primary" : "ui-btn-outline"}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    ...action.style
                                }}
                            >
                                {Icon && <Icon size={16} />}
                                {action.label}
                            </button>
                        );
                    }) : (!Array.isArray(actions) && actions)}
                </div>
            )}
        </div>
    );
};
export default PageHeader;
