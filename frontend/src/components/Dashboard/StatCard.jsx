import React from 'react';

const StatCard = ({ title, value, icon, color, trend, onClick }) => {
    return (
        <div className={`glass-card stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
            <div className="stat-card-inner">
                <div className="stat-visual" style={{ backgroundColor: `${color}15`, color: color }}>
                    {icon}
                </div>
                <div className="stat-content">
                    <p className="text-muted">{title}</p>
                    <h3>{value}</h3>
                    {trend && (
                        <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last month
                        </span>
                    )}
                </div>
            </div>
            <style jsx="true">{`
                .stat-card {
                    padding: 24px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                    border-radius: 2px !important;
                }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px -5px rgba(6, 182, 212, 0.15);
                    border-color: rgba(255, 255, 255, 0.08);
                }
                .stat-card.clickable {
                    cursor: pointer;
                }
                .stat-card-inner {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .stat-visual {
                    width: 52px;
                    height: 52px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.05);
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .stat-card:hover .stat-visual {
                    transform: scale(1.08) rotate(5deg);
                }
                .stat-content p {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }
                .stat-content h3 {
                    font-size: 26px;
                    font-family: 'Share Tech Mono', monospace;
                    font-weight: 700;
                    margin: 2px 0 6px;
                    color: white;
                }
                .trend {
                    font-size: 11px;
                    font-weight: 600;
                    display: flex;
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
