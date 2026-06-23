import React from 'react';

const StatCard = ({ title, value, icon, color, trend, onClick }) => {
    return (
        <div className={`stat-card-modern ${onClick ? 'clickable' : ''}`} onClick={onClick}>
            <div className="stat-card-inner">
                <div className="stat-visual" style={{ backgroundColor: `${color}12`, color: color }}>
                    {icon}
                </div>
                <div className="stat-content">
                    <p className="stat-label-text">{title}</p>
                    <h3 className="stat-value-text">{value}</h3>
                    {trend && (
                        <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
                        </span>
                    )}
                </div>
            </div>
            <style jsx="true">{`
                .stat-card-modern {
                    background: var(--bg-surface);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-md);
                    padding: 24px;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                .stat-card-modern:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--border-strong);
                }
                .stat-card-modern.clickable {
                    cursor: pointer;
                }
                .stat-card-inner {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .stat-visual {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }
                .stat-card-modern:hover .stat-visual {
                    transform: scale(1.05);
                }
                .stat-label-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0;
                }
                .stat-value-text {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 4px 0 6px;
                    color: var(--text-heading);
                    line-height: 1.1;
                }
                .trend {
                    font-size: 11px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .trend.positive { color: var(--success); }
                .trend.negative { color: var(--danger); }
            `}</style>
        </div>
    );
};

export default StatCard;
