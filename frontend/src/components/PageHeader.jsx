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
 */
const PageHeader = ({ title, badge, subtitle, showBack = false }) => {
    const navigate = useNavigate();

    return (
        <div className="rd-module-header">
            <div className="rd-module-info">
                <div className="rd-module-title-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                borderRadius: '6px'
                            }}
                            title="Go back"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <span className="rd-module-title" style={{ margin: 0 }}>{title}</span>
                    {badge && <span className="rd-module-badge">{badge}</span>}
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
