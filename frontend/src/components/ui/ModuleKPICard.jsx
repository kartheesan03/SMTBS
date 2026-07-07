/**
 * ModuleKPICard — shared base card for the 4 secondary KPI modules.
 * Layout (flex-column, ZERO absolute positioning):
 *   [Header: icon badge | title | menu]
 *   [Big value]
 *   [Subtitle]
 *   [Footer: sparkline area-chart | trend badge pill]
 */
import React from 'react';
import { MoreVertical } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const STROKE = {
    blue:   '#3b82f6',
    green:  '#10b981',
    orange: '#f59e0b',
    red:    '#ef4444',
    purple: '#8b5cf6',
    cyan:   '#06b6d4',
};

const defaultSpark = (title) =>
    Array.from({ length: 12 }, (_, i) => ({
        v: Math.abs(Math.sin(i * 0.7 + (title || '').length * 0.3) * 28 + 40),
    }));

export const ModuleKPICard = ({
    color = 'blue',
    icon: Icon,
    title,
    value,
    subtitle,
    sparkData,
    badgeText,
    badgeDir = 'flat',
}) => {
    const stroke = STROKE[color] || '#3b82f6';
    const gradId = `mkpi-g-${color}-${String(title || '').replace(/\W/g, '')}`;
    const data   = sparkData && sparkData.length > 0 ? sparkData : defaultSpark(title);

    const badgeExtra =
        badgeDir === 'up'
            ? { background: '#dcfce7', color: '#16a34a' }
            : badgeDir === 'down'
            ? { background: '#fee2e2', color: '#dc2626' }
            : {};

    return (
        <div className={`mkpi-card mkpi-${color}`}>
            <div className="mkpi-header">
                <div className="mkpi-icon-badge">
                    {Icon && <Icon size={17} strokeWidth={2.3} />}
                </div>
                <div className="mkpi-title-wrap">
                    <div className="mkpi-title" title={title}>{title}</div>
                </div>
                <button className="mkpi-menu-btn" aria-label="Options">
                    <MoreVertical size={15} />
                </button>
            </div>

            <div className="mkpi-value">{value}</div>
            <div className="mkpi-subtitle">{subtitle}</div>

            <div className="mkpi-footer">
                <div className="mkpi-sparkline">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 3, right: 2, bottom: 0, left: 2 }}>
                            <defs>
                                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={stroke} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="v"
                                stroke={stroke}
                                strokeWidth={1.8}
                                fill={`url(#${gradId})`}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                {badgeText != null && (
                    <span className="mkpi-trend-badge" style={badgeExtra}>
                        {badgeText}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ModuleKPICard;
