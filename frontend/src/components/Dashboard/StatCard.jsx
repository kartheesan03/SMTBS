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
                    padding: 20px;
                    transition: all 0.3s ease;
                }
                .stat-card.clickable {
                    cursor: pointer;
                }
                .stat-card.clickable:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.1);
                }
                .stat-card-inner {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .stat-visual {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-content h3 {
                    font-size: 24px;
                    margin: 4px 0;
                }
                .trend {
                    font-size: 11px;
                    font-weight: 600;
                }
                .trend.positive { color: #22c55e; }
                .trend.negative { color: #ef4444; }
            `}</style>
        </div>
    );
};

export default StatCard;
