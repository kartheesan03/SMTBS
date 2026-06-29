import React from 'react';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';

export const HRMSKPICard = ({ title, val, sub, color, data, icon: Icon }) => {
    return (
        <div className={`rd-kpi-card`} style={{
            minHeight: 140, 
            padding: 20, 
            background: '#fff', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
            border: `1px solid ${color === 'blue' ? '#bfdbfe' : color === 'green' ? '#bbf7d0' : color === 'orange' ? '#fef08a' : '#fecaca'}`, 
            color: '#1e293b',
            borderRadius: 20,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            {/* The faint background blob logic to match the mockup */}
            <div style={{
                position: 'absolute', bottom: -50, right: -20, width: 150, height: 150, borderRadius: '50%', opacity: 0.4, pointerEvents: 'none',
                background: color === 'blue' ? '#bfdbfe' : color === 'green' ? '#bbf7d0' : color === 'orange' ? '#fef08a' : '#fecaca'
            }}></div>
            
            <div className="rd-kpi-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2}}>
                <div className="rd-kpi-icon-box" style={{
                    width: 40, height: 40, 
                    background: color === 'blue' ? '#eff6ff' : color === 'green' ? '#ecfdf5' : color === 'orange' ? '#fff7ed' : '#fef2f2', 
                    border: `1px solid ${color === 'blue' ? '#dbeafe' : color === 'green' ? '#d1fae5' : color === 'orange' ? '#ffedd5' : '#fee2e2'}`, 
                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'orange' ? '#f59e0b' : '#ef4444'
                }}>
                    <Icon size={20} />
                </div>
                <div style={{width: 70, height: 35}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <Bar dataKey="v" fill={color === 'blue' ? '#93c5fd' : color === 'green' ? '#86efac' : color === 'orange' ? '#fcd34d' : '#fca5a5'} radius={[2,2,0,0]} barSize={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', marginTop: 16, zIndex: 2}}>
                <span style={{fontSize: 28, fontWeight: 800, color: color === 'blue' ? '#1e40af' : color === 'green' ? '#166534' : color === 'orange' ? '#b45309' : '#991b1b'}}>{val}</span>
                <span style={{fontSize: 14, fontWeight: 700, opacity: 0.9, marginTop: 4}}>{title}</span>
                <span style={{
                    fontSize: 12, fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
                    color: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'orange' ? '#f59e0b' : '#ef4444'
                }}>{sub}</span>
            </div>
        </div>
    );
};
