import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageHeader.css';

/**
 * PageHeader — standardized page title + module badge + optional subtitle.
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
                <div className="rd-module-title-row">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="rd-module-back-btn"
                            title="Go back"
                        >
                            <ArrowLeft size={22} />
                        </button>
                    )}
                    <h1 className="rd-module-title">
                        {title}
                    </h1>
                    {badge && (
                        <span className="rd-module-badge">{badge}</span>
                    )}
                    {hasInsights && (
                        <div className="rd-module-insights-dot" title="Actionable insights available" />
                    )}
                </div>
                {subtitle && (
                    <p className="rd-module-subtitle">
                        {subtitle}
                    </p>
                )}
            </div>
            
            {actions && (
                <div className="rd-module-actions">
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
