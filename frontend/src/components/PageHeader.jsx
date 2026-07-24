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
const PageHeader = ({ title, badge, subtitle, showBack = false, hasInsights = false }) => {
    const navigate = useNavigate();

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
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0f172a',
                                borderRadius: '0px',
                                marginRight: '2px',
                                flexShrink: 0,
                            }}
                            title="Go back"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <span
                        className="rd-module-title"
                        style={{
                            margin: 0,
                            padding: 0,
                            lineHeight: 1.2,
                            flexShrink: 0,
                        }}
                    >
                        {title}
                    </span>
                    {badge && (
                        <span className="rd-module-badge">{badge}</span>
                    )}

                    {hasInsights && (
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '0px',
                            background: '#ef4444',
                            marginLeft: 8,
                            boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
                        }} title="Actionable insights available" />
                    )}
                </div>
                {subtitle && (
                    <p style={{ margin: 0, fontSize: 14, color: '#64748b', marginTop: 4 }}>
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
