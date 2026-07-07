import React from 'react';
import { motion } from 'framer-motion';

// Common Panel Wrapper
const Panel = ({ children, style }) => (
    <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        padding: '22px',
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #f1f5f9',
        ...style
    }}>
        {children}
    </div>
);

// 1. Employee Overview -> Roster Strip
export const EmployeeRosterStrip = ({ total, active, onLeave, inactive }) => {
    const totalVal = total || 1;
    const activePct = (active / totalVal) * 100;
    const leavePct = (onLeave / totalVal) * 100;
    const inactivePct = (inactive / totalVal) * 100;

    return (
        <Panel>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
                <div style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Employees</div>
                    <div style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{total}</div>
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#f1f5f9' }}>
                        <div style={{ width: `${activePct}%`, backgroundColor: '#10b981' }} title={`Active: ${active}`} />
                        <div style={{ width: `${leavePct}%`, backgroundColor: '#f59e0b' }} title={`On Leave: ${onLeave}`} />
                        <div style={{ width: `${inactivePct}%`, backgroundColor: '#ef4444' }} title={`Inactive: ${inactive}`} />
                    </div>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <div>
                                <span style={{ fontWeight: 700, color: '#1e293b', marginRight: '6px' }}>{active}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Active</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                            <div>
                                <span style={{ fontWeight: 700, color: '#1e293b', marginRight: '6px' }}>{onLeave}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>On Leave</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                            <div>
                                <span style={{ fontWeight: 700, color: '#1e293b', marginRight: '6px' }}>{inactive}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Inactive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
};

// 2. Attendance Today -> Radial Dials
const RadialDial = ({ label, count, total, color, subCaption }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '120px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '12px' }}>
                <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6" 
                            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px', color: '#0f172a' }}>
                    {count}
                </div>
            </div>
            <div style={{ fontWeight: 600, color: '#334155', fontSize: '14px', marginBottom: '2px' }}>{label}</div>
            <div style={{ fontSize: '12px', color, fontWeight: 500 }}>{subCaption}</div>
        </div>
    );
};

export const AttendanceRadialDials = ({ present, notCheckedIn, absent, onLeave, total }) => {
    return (
        <Panel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between' }}>
                <RadialDial label="Present" count={present} total={total} color="#10b981" subCaption={`${total > 0 ? Math.round((present/total)*100) : 0}% of workforce`} />
                <RadialDial label="Not Checked-in" count={notCheckedIn} total={total} color="#f59e0b" subCaption="Action needed" />
                <RadialDial label="Absent" count={absent} total={total} color="#ef4444" subCaption="Marked absent" />
                <RadialDial label="On Leave" count={onLeave} total={total} color="#8b5cf6" subCaption="Approved leaves" />
            </div>
        </Panel>
    );
};

// 3. Leave Requests -> Premium KPI Cards
const PremiumKPICard = ({ icon: Icon, label, desc, count, statusText, color }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '24px',
                borderTop: `3px solid ${color}`,
                boxShadow: isHovered 
                    ? '0 10px 25px rgba(15, 23, 42, 0.08)' 
                    : '0 4px 20px rgba(15, 23, 42, 0.05)',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                transition: 'all 150ms ease',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '200px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {Icon && <Icon size={20} strokeWidth={2.5} />}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', lineHeight: '1.2', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{desc}</div>
                </div>
            </div>
            
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', flex: 1, display: 'flex', alignItems: 'center' }}>
                {count}
            </div>
            
            <div style={{ 
                backgroundColor: `${color}15`, 
                color: color, 
                padding: '6px 12px', 
                borderRadius: '16px', 
                fontSize: '11px', 
                fontWeight: 700, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                alignSelf: 'flex-start',
                marginTop: '16px',
                minWidth: '100px'
            }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
                {statusText}
            </div>
        </div>
    );
};

import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export const LeaveQueueList = ({ total, pending, approved, rejected, approvalRate }) => {
    return (
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '20px',
            marginBottom: '24px'
        }}>
            <PremiumKPICard icon={FileText} label="Total Requests" desc="All time" count={total} statusText="Logged" color="#8b5cf6" />
            <PremiumKPICard icon={Clock} label="Pending" desc="Action required" count={pending} statusText="Action needed" color="#f59e0b" />
            <PremiumKPICard icon={CheckCircle} label="Approved" desc="Granted" count={approved} statusText={`${approvalRate}% approved`} color="#10b981" />
            <PremiumKPICard icon={XCircle} label="Rejected" desc="Declined leaves" count={rejected} statusText="Declined" color="#ef4444" />
        </div>
    );
};

// 4. Payroll -> Waterfall Bars
const WaterfallRow = ({ label, valStr, caption, pct, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ width: '160px', fontWeight: 600, color: '#334155', fontSize: '14px' }}>{label}</div>
        <div style={{ flex: 1, minWidth: '150px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }} />
        </div>
        <div style={{ width: '180px', textAlign: 'right' }}>
            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '16px', marginRight: '8px' }}>{valStr}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{caption}</span>
        </div>
    </div>
);

export const PayrollWaterfallBars = ({ grossStr, netStr, pfStr, taxStr, gross, net, pf, tax }) => {
    const max = gross || 1;
    return (
        <Panel>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <WaterfallRow label="Total Gross Payroll" valStr={grossStr} caption="— gross" pct={100} color="#8b5cf6" />
                <WaterfallRow label="Total Net Pay" valStr={netStr} caption="— after deductions" pct={(net/max)*100} color="#10b981" />
                <WaterfallRow label="Est. PF Contributions" valStr={pfStr} caption="— 12% of base" pct={(pf/max)*100} color="#f59e0b" />
                <WaterfallRow label="Other Deductions" valStr={taxStr} caption="— TDS/Other" pct={(tax/max)*100} color="#ef4444" />
            </div>
        </Panel>
    );
};

// 5. Performance -> Distribution Track
export const PerformanceDistributionTrack = ({ teamAvg, excellent, good, belowAvg }) => {
    const total = excellent + good + belowAvg || 1;
    const excPct = (excellent / total) * 100;
    const goodPct = (good / total) * 100;
    const belowPct = (belowAvg / total) * 100;

    return (
        <Panel>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                    <span>Needs Improvement</span>
                    <span>Excellent</span>
                </div>
                <div style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <div style={{ width: `${belowPct}%`, backgroundColor: '#ef4444' }} title={`Below Avg: ${belowAvg}`} />
                    <div style={{ width: `${goodPct}%`, backgroundColor: '#f59e0b' }} title={`Good: ${good}`} />
                    <div style={{ width: `${excPct}%`, backgroundColor: '#10b981' }} title={`Excellent: ${excellent}`} />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                        Team Avg Score
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{teamAvg}<span style={{fontSize: '14px', color: '#94a3b8'}}>/100</span></div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        Excellent {'>'}90%
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{excellent}</div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        Good 75-89%
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{good}</div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                        Avg / Below {'<'}75%
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{belowAvg}</div>
                </div>
            </div>
        </Panel>
    );
};
