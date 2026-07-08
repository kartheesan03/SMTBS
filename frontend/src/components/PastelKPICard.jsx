import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const THEMES = {
    blue: {
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
        iconColor: '#0284c7'
    },
    purple: {
        background: 'linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%)',
        iconColor: '#9333ea'
    },
    peach: {
        background: 'linear-gradient(135deg, #ffedd5 0%, #ffffff 100%)',
        iconColor: '#ea580c'
    },
    pink: {
        background: 'linear-gradient(135deg, #fce7f3 0%, #ffffff 100%)',
        iconColor: '#db2777'
    },
    mint: {
        background: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)',
        iconColor: '#16a34a'
    },
    yellow: {
        background: 'linear-gradient(135deg, #fef9c3 0%, #ffffff 100%)',
        iconColor: '#ca8a04'
    }
};

export const PastelKPICard = ({ title, value, icon: Icon, colorTheme = 'blue', trendValue, trendPositive = true, onClick }) => {
    const theme = THEMES[colorTheme] || THEMES.blue;
    
    return (
        <div style={{
            background: theme.background,
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                    {title}
                </div>
                <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    flexShrink: 0
                }}>
                    {Icon && <Icon size={16} strokeWidth={2.5} color={theme.iconColor} />}
                </div>
            </div>
            
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {value}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px' }}>
                {trendValue ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: trendPositive ? '#16a34a' : '#dc2626' }}>
                        {trendPositive ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                        {trendValue}
                    </div>
                ) : (
                    <div />
                )}
                
                <div 
                    onClick={onClick}
                    style={{ 
                        fontSize: '11px', fontWeight: 500, color: '#64748b', 
                        cursor: onClick ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', gap: '2px',
                        transition: 'color 150ms ease'
                    }}
                    onMouseEnter={(e) => onClick && (e.currentTarget.style.color = '#334155')}
                    onMouseLeave={(e) => onClick && (e.currentTarget.style.color = '#64748b')}
                >
                    Details <ArrowRight size={10} />
                </div>
            </div>
        </div>
    );
};

export const PastelKPIGrid = ({ children, columns }) => {
    const cols = columns
        ? `repeat(${columns}, 1fr)`
        : 'repeat(auto-fit, minmax(200px, 1fr))';
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: cols,
            gap: '16px'
        }}>
            {children}
        </div>
    );
};
