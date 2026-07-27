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
    
    // Determine gradient
    let gradient = GRADIENT_FALLBACKS[index % GRADIENT_FALLBACKS.length];
    if (colorTheme || color) {
        gradient = GRADIENT_THEMES[colorTheme || color] || gradient;
    }
    
    const isPositive = trendPositive !== undefined ? trendPositive : (trend && trend > 0);

    return (
        <div 
            onClick={onClick}
            style={{
                background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                borderRadius: '18px',
                padding: '24px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: '160px',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
                color: '#ffffff',
                boxShadow: `0 8px 24px -4px ${gradient.from}40, 0 4px 8px -2px ${gradient.from}20`,
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 16px 32px -4px ${gradient.from}50, 0 8px 16px -4px ${gradient.from}30`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = `0 8px 24px -4px ${gradient.from}40, 0 4px 8px -2px ${gradient.from}20`;
            }}
        >
            {/* Wave texture overlay */}
            <WavePattern />

            {/* Large watermark icon (background decoration) */}
            {Icon && (
                <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: 0.2,
                    pointerEvents: 'none',
                }}>
                    <Icon size={72} strokeWidth={1.5} color="#ffffff" />
                </div>
            )}

            {/* Content (positioned above overlays) */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                
                {/* Title */}
                <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    marginBottom: '12px',
                    letterSpacing: '0.3px',
                }}>
                    {cardTitle}
                </div>

                {/* Value */}
                <div style={{ 
                    fontSize: '36px', 
                    fontWeight: 800, 
                    color: '#ffffff', 
                    fontVariantNumeric: 'tabular-nums', 
                    lineHeight: 1,
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    marginBottom: '4px',
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
                    marginTop: '12px',
                }}>
                    {cardTrend && (
                        <div style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '3px', 
                            padding: '3px 8px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: '#ffffff',
                            backdropFilter: 'blur(4px)',
                        }}>
                            {isPositive ? <TrendingUp size={13} strokeWidth={2.5} /> : <TrendingDown size={13} strokeWidth={2.5} />}
                            <span>{cardTrend}</span>
                        </div>
                    )}
                    {cardSubtext && (
                        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
                            {cardSubtext}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const StatGrid = ({ children }) => {
    const count = React.Children.count(children);
    const lgCols = Math.min(count, 6);

    return (
        <div style={{ gap: '20px' }} className={`pastel-stat-grid cols-${lgCols}`}>
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
