import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
export const StatsCard = ({ 
    title,
    label, 
    value, 
    icon: Icon, 
    trendValue, 
    percentChange,
    trendPositive = true, 
    trend,
    subtext,
    onClick,
    colorTheme,
    color
}) => {
    const cardTitle = label || title;
    let cardTrend = percentChange || (trend ? `${Math.abs(trend)}%` : null);
    let cardSubtext = subtext;
    if (!cardSubtext && trendValue) {
        if (String(trendValue).includes('%')) {
            const parts = String(trendValue).split(' ');
            cardTrend = cardTrend || parts[0];
            cardSubtext = parts.slice(1).join(' ').trim();
        } else {
            cardSubtext = trendValue;
        }
    }
    if (!cardSubtext && trend) {
        cardSubtext = 'vs last period';
    }
    
    // In this minimal design, we don't use colorTheme heavily for icons, just a nice slate blue/gray
    const iconColor = '#64748b'; // Tailwind slate-500

    return (
        <div 
            onClick={onClick}
            style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0', // Tailwind slate-200
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                minWidth: 0,
            }}
            className="kpi-panel-standard"
        >
            {/* Top row: Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                {Icon && (
                    <div style={{ display: 'flex', alignItems: 'center', color: iconColor }}>
                        <Icon size={16} strokeWidth={2} />
                    </div>
                )}
                <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: '#64748b', // Tailwind slate-500
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    lineHeight: 1
                }}>
                    {cardTitle}
                </div>
            </div>

            {/* Middle row: Value */}
            <div style={{ 
                fontSize: '28px', 
                fontWeight: 700, 
                color: '#0f172a', // Tailwind slate-900
                fontVariantNumeric: 'tabular-nums', 
                lineHeight: 1.2,
                marginBottom: '8px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.02em'
            }}>
                {value}
            </div>

            {/* Bottom row: Subtext */}
            {cardSubtext && (
                <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b', 
                    fontWeight: 400,
                }}>
                    {cardSubtext}
                </div>
            )}
            
            <style>{`
                .kpi-panel-standard:hover {
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                }
            `}</style>
        </div>
    );
};

export const StatsGrid = ({ children, columns, style, className = '' }) => {
    const validChildren = React.Children.toArray(children).filter(child => {
        if (typeof child === 'string' && child.trim() === '') return false;
        return React.isValidElement(child);
    });
    
    const count = validChildren.length;
    const lgCols = columns || Math.min(count, 6);
    
    return (
        <div style={{ gap: '16px', alignItems: 'stretch', ...style }} className={`minimal-stat-grid cols-${lgCols} ${className}`}>
            <style>{`
                .minimal-stat-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                }
                @media (min-width: 640px) {
                    .minimal-stat-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                    .minimal-stat-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
                    .minimal-stat-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
                    .minimal-stat-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }
                    .minimal-stat-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
                }
            `}</style>
            {validChildren.map((child) => {
                const { featured, colorTheme, color, ...cleanProps } = child.props;
                return React.cloneElement(child, cleanProps);
            })}
        </div>
    );
};

export const BentoStatsGrid = StatsGrid;
export default StatsCard;
