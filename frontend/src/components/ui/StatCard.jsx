import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PASTEL_PALETTE = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#14b8a6', // teal
    '#10b981', // green
];

// Mapping themes to specific colors if explicitly provided
const THEMES = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    peach: '#f97316',
    orange: '#f97316',
    pink: '#ec4899',
    mint: '#10b981',
    green: '#10b981',
    teal: '#14b8a6',
    yellow: '#eab308',
    red: '#ef4444'
};

export const StatCard = ({ 
    title,
    label, 
    value, 
    icon: Icon, 
    colorTheme, 
    color, 
    trendValue, 
    percentChange,
    trendPositive = true, 
    trend,
    subtext,
    index = 0,
    onClick
}) => {
    // Props backward compatibility mapping
    const cardTitle = label || title;
    
    // If the trend string has "vs", it's probably subtext. Otherwise it might be a percentage.
    let cardTrend = percentChange || (trend ? `${Math.abs(trend)}%` : null);
    let cardSubtext = subtext;

    if (!cardSubtext && trendValue) {
        // Many older uses passed trendValue="12% vs last month"
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
    
    // Determine color
    let bgColor = PASTEL_PALETTE[index % PASTEL_PALETTE.length];
    if (colorTheme || color) {
        bgColor = THEMES[colorTheme || color] || bgColor;
    }
    
    const isPositive = trendPositive !== undefined ? trendPositive : (trend && trend > 0);

    return (
        <div 
            onClick={onClick}
            style={{
                background: bgColor,
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                color: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
            }}
            onMouseEnter={(e) => {
                if (onClick) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                if (onClick) e.currentTarget.style.transform = 'none';
            }}
        >
            {/* Top row: Icon and Trend Pill */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ 
                    width: '44px', height: '44px', borderRadius: '50%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {Icon && <Icon size={22} strokeWidth={2.5} color="#ffffff" />}
                </div>

                {cardTrend && (
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', 
                        padding: '4px 10px', borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '12px', fontWeight: 600, color: '#ffffff'
                    }}>
                        {isPositive ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
                        <span>{cardTrend}</span>
                    </div>
                )}
            </div>
            
            {/* Middle: Label and Value */}
            <div style={{ flex: 1, marginTop: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
                    {cardTitle}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                    {value}
                </div>
            </div>

            {/* Bottom: Subtext */}
            {cardSubtext && (
                <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '16px' }}>
                    {cardSubtext}
                </div>
            )}
        </div>
    );
};

export const StatGrid = ({ children }) => {
    const count = React.Children.count(children);
    // User wants a single row: set columns to match the number of children (max 6 for safety)
    const lgCols = Math.min(count, 6);

    return (
        <div style={{ gap: '24px' }} className={`pastel-stat-grid cols-${lgCols}`}>
            <style>{`
                .pastel-stat-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                }
                @media (min-width: 768px) {
                    .pastel-stat-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                    .pastel-stat-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
                    .pastel-stat-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
                }
                @media (min-width: 1280px) {
                    .pastel-stat-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }
                    .pastel-stat-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
                }
            `}</style>
            {React.Children.map(children, (child, idx) => {
                if (!React.isValidElement(child)) return child;
                return React.cloneElement(child, { index: idx });
            })}
        </div>
    );
};

// Kept for backward compatibility while migrating
export const BentoStatGrid = StatGrid;

export default StatCard;
