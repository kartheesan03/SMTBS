import React from 'react';
import './PageHeader.css';
/**
 * PageHeader — standardized page title + module badge + optional subtitle.
 * Matches the Attendance Tracker reference style across the entire app.
 *
 * @param {string}  title    - Main page title (e.g. "Inventory Management")
 * @param {string}  badge    - Module label in uppercase (e.g. "INVENTORY") — optional
 * @param {string}  subtitle - Muted line beneath the title row — optional
 */
const PageHeader = ({ title, badge, subtitle }) => (
    <div className="rd-module-header">
        <div className="rd-module-info">
            <div className="rd-module-title-row">
                <span className="rd-module-title">{title}</span>
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

export default PageHeader;
