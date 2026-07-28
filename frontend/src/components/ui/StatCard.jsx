import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   GRADIENT STAT CARDS — Reference-style design
   ─ Vibrant gradient backgrounds with wavy SVG texture
   ─ Large semi-transparent watermark icon on the right
   ─ White text, rounded corners, premium depth
   ═══════════════════════════════════════════════════════════════ */

const PASTEL_PALETTE = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#14b8a6', // teal
    '#10b981', // green
];

// Mapping themes to gradient pairs [from, to]
const GRADIENT_THEMES = {
    blue:   { from: '#3b82f6', to: '#06b6d4' },
    purple: { from: '#8b5cf6', to: '#6366f1' },
    peach:  { from: '#f97316', to: '#f43f5e' },
    orange: { from: '#f97316', to: '#f43f5e' },
    pink:   { from: '#ec4899', to: '#a855f7' },
    mint:   { from: '#10b981', to: '#06b6d4' },
    green:  { from: '#10b981', to: '#06b6d4' },
    teal:   { from: '#14b8a6', to: '#3b82f6' },
    yellow: { from: '#eab308', to: '#f97316' },
    red:    { from: '#ef4444', to: '#ec4899' },
};

// Fallback gradient pairs (indexed by position)
const GRADIENT_FALLBACKS = [
    { from: '#3b82f6', to: '#06b6d4' },
    { from: '#8b5cf6', to: '#6366f1' },
    { from: '#ec4899', to: '#a855f7' },
    { from: '#f97316', to: '#f43f5e' },
    { from: '#14b8a6', to: '#3b82f6' },
    { from: '#10b981', to: '#06b6d4' },
];

// SVG wave pattern overlay for the card background
const WavePattern = () => (
    <svg
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.12,
        }}
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M0,80 C80,120 160,40 240,80 C320,120 400,60 400,60 L400,200 L0,200 Z" fill="white" />
        <path d="M0,120 C100,160 200,80 300,120 C350,140 400,100 400,100 L400,200 L0,200 Z" fill="white" opacity="0.5" />
    </svg>
);

export const StatCard = ({ 
    title,
    label, 
    value, 
    icon: Icon, 
    trendValue, 
    percentChange,
    trendPositive = true, 
    trend,
    subtext,
    onClick
}) => {
    // Props backward compatibility mapping
    const cardTitle = label || title;
    
    // If the trend string has "vs", it's probably subtext. Otherwise it might be a percentage.
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
    
    const isPositive = trendPositive !== undefined ? trendPositive : (trend && trend > 0);

    return (
        <div 
            onClick={onClick}
            style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                if (onClick) e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
                if (onClick) e.currentTarget.style.backgroundColor = '#ffffff';
            }}
        >
            {/* Header: Title and Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {Icon && <Icon size={16} strokeWidth={2} color="#6b7280" />}
                <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                }}>
                    {cardTitle}
                </div>
            </div>

            {/* Value */}
            <div style={{ 
                fontSize: '32px', 
                fontWeight: 600, 
                color: '#111827', 
                fontVariantNumeric: 'tabular-nums', 
                lineHeight: 1,
                fontFamily: "'Inter', sans-serif",
                marginBottom: '12px',
            }}>
                {value}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Bottom row: Trend + Subtext */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
            }}>
                {cardTrend && (
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '2px', 
                        fontSize: '13px', 
                        fontWeight: 500, 
                        color: isPositive ? '#059669' : '#dc2626',
                    }}>
                        {isPositive ? <TrendingUp size={14} strokeWidth={2.5} /> : <TrendingDown size={14} strokeWidth={2.5} />}
                        <span>{cardTrend}</span>
                    </div>
                )}
                {cardSubtext && (
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>
                        {cardSubtext}
                    </div>
                )}
            </div>
        </div>
    );
};

export const StatGrid = ({ children, columns }) => {
    const count = React.Children.count(children);
    const lgCols = columns || Math.min(count, 6); // Default to a single row for up to 6 cards

    return (
        <div style={{ gap: '24px' }} className={`minimal-stat-grid cols-${lgCols}`}>
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
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;
                // Remove featured and other bento props
                const { featured, colorTheme, color, ...cleanProps } = child.props;
                return React.cloneElement(child, cleanProps);
            })}
        </div>
    );
};

// Kept for backward compatibility while migrating
export const BentoStatGrid = StatGrid;

export default StatCard;
