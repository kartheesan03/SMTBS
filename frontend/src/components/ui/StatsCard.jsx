import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatsCard — KPI card matching the Admin Dashboard bx-kpi-card visual style.
 * Circular colored icon, label, bold value, and colored trend row.
 */
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

    // Map colorTheme to bx-kpi-icon colors
    const getTheme = (theme) => {
        const t = (theme || 'blue').toLowerCase();
        if (t === 'blue' || t === 'primary')    return { bg: '#eff6ff', color: '#3b82f6' };
        if (t === 'green' || t === 'emerald' || t === 'mint' || t === 'success')
                                                 return { bg: '#f0fdf4', color: '#22c55e' };
        if (t === 'orange' || t === 'warning')   return { bg: '#fff7ed', color: '#f97316' };
        if (t === 'amber' || t === 'yellow')     return { bg: '#fffbeb', color: '#f59e0b' };
        if (t === 'purple' || t === 'violet')    return { bg: '#fdf4ff', color: '#d946ef' };
        if (t === 'teal' || t === 'cyan')        return { bg: '#f0fdfa', color: '#14b8a6' };
        if (t === 'pink' || t === 'rose')        return { bg: '#fdf2f8', color: '#ec4899' };
        if (t === 'red' || t === 'danger')       return { bg: '#fef2f2', color: '#ef4444' };
        return { bg: '#eff6ff', color: '#3b82f6' };
    };

    const theme = getTheme(colorTheme || color);

    return (
        <div
            onClick={onClick}
            className="kpi-panel-standard"
            style={{
                background: '#ffffff',
                border: '1px solid #e9edf3',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: onClick ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                minWidth: 0,
            }}
        >
            {/* Top: circular icon + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                {Icon && (
                    <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: theme.bg,
                        color: theme.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Icon size={14} strokeWidth={2} />
                    </div>
                )}
                <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#64748b',
                    lineHeight: 1.3,
                }}>
                    {cardTitle}
                </span>
            </div>

            {/* Value */}
            <div style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#0f172a',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                marginBottom: '10px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '-0.02em',
            }}>
                {value}
            </div>

            {/* Trend row */}
            {(cardTrend || cardSubtext) && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '12px',
                    fontWeight: 500,
                }}>
                    {cardTrend ? (
                        <span style={{
                            color: trendPositive ? '#22c55e' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1px',
                        }}>
                            {trendPositive
                                ? <ArrowUpRight size={13} strokeWidth={2.5} />
                                : <ArrowDownRight size={13} strokeWidth={2.5} />
                            }
                            {cardTrend}
                        </span>
                    ) : null}
                    {cardSubtext && (
                        <span style={{ color: '#94a3b8', fontWeight: 400 }}>{cardSubtext}</span>
                    )}
                </div>
            )}

            <style>{`
                .kpi-panel-standard:hover {
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.07);
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
                    .minimal-stat-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
                    .minimal-stat-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
                    .minimal-stat-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
                    .minimal-stat-grid.cols-5 { grid-template-columns: repeat(5, 1fr); }
                    .minimal-stat-grid.cols-6 { grid-template-columns: repeat(6, 1fr); }
                }
            `}</style>
            {validChildren.map((child) => {
                const { featured, colorTheme, color, ...cleanProps } = child.props;
                return React.cloneElement(child, { ...cleanProps, colorTheme, color });
            })}
        </div>
    );
};

export const BentoStatsGrid = StatsGrid;
export default StatsCard;
