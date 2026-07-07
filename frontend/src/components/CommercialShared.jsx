import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

// Common Panel Wrapper
const Panel = ({ children }) => (
    <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        padding: '22px',
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #f1f5f9'
    }}>
        {children}
    </div>
);

// Common Step Component for Funnel/Stepper
const StepperStep = ({ label, count, color, isLast }) => (
    <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '130px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {count}
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
            </div>
        </div>
        {!isLast && (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 12px' }}>
                <ChevronRight size={20} color="#cbd5e1" />
            </div>
        )}
    </div>
);

// 1. Purchase Orders -> Horizontal Funnel
export const PurchaseOrderFunnel = ({ total, pending, approved, totalValue }) => (
    <Panel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flex: 2, minWidth: '300px', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <StepperStep label="Total POs" count={total} color="#8b5cf6" />
                <StepperStep label="Pending Approval" count={pending} color="#f59e0b" />
                <StepperStep label="Approved" count={approved} color="#10b981" isLast />
            </div>
            
            <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0', margin: '0 16px', display: 'none' }} className="d-md-block" />

            <div style={{ flex: 1, minWidth: '200px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Purchase Value</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{totalValue}</div>
            </div>
        </div>
    </Panel>
);

// 2. Vendors -> Split Summary Panel
export const VendorSplitPanel = ({ total, active, onHold, outstanding }) => {
    const totalVal = total || 1;
    const activePct = (active / totalVal) * 100;
    const onHoldPct = (onHold / totalVal) * 100;

    return (
        <Panel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
                <div style={{ minWidth: '150px' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Vendors</div>
                    <div style={{ fontSize: '40px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{total}</div>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px', backgroundColor: '#f1f5f9' }}>
                        <div style={{ width: `${activePct}%`, backgroundColor: '#10b981' }} title={`Active: ${active}`} />
                        <div style={{ width: `${onHoldPct}%`, backgroundColor: '#f59e0b' }} title={`On Hold: ${onHold}`} />
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
                                <span style={{ fontWeight: 700, color: '#1e293b', marginRight: '6px' }}>{onHold}</span>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>On Hold</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0', margin: '0 8px', display: 'none' }} className="d-md-block" />

                <div style={{ flex: 1, minWidth: '200px', padding: '16px', backgroundColor: '#fff1f2', borderRadius: '12px', border: '1px solid #ffe4e6' }}>
                    <div style={{ fontSize: '13px', color: '#9f1239', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Outstanding</div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#be123c' }}>{outstanding}</div>
                </div>
            </div>
        </Panel>
    );
};

// 3. Finance/Payments -> Comparison Bars
const ComparisonBarRow = ({ label, valStr, caption, pct, color, forceMin = false }) => {
    // If forceMin is true (for overdue), ensure there's at least a 2px sliver shown even if 0%
    let visualPct = pct;
    if (forceMin && pct < 1) visualPct = 1;
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ width: '160px', fontWeight: 600, color: '#334155', fontSize: '14px' }}>{label}</div>
            <div style={{ flex: 1, minWidth: '150px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${visualPct}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }} />
            </div>
            <div style={{ width: '220px', textAlign: 'right' }}>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '18px', marginRight: '8px' }}>{valStr}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{caption}</span>
            </div>
        </div>
    );
};

export const FinanceComparisonBars = ({ revenueStr, payablesStr, overdueStr, outstandingStr, revenue, payables, overdue, outstanding }) => {
    const base = revenue || 1; // 100% baseline

    return (
        <Panel>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ComparisonBarRow label="Revenue (Paid)" valStr={revenueStr} caption="— 100% baseline" pct={100} color="#10b981" />
                <ComparisonBarRow label="Total Payables" valStr={payablesStr} caption="— outflow" pct={(payables/base)*100} color="#3b82f6" />
                <ComparisonBarRow label="Outstanding Recv." valStr={outstandingStr} caption="— pending inflow" pct={(outstanding/base)*100} color="#f59e0b" />
                <ComparisonBarRow label="Overdue" valStr={overdueStr} caption="— needs attention" pct={(overdue/base)*100} color="#ef4444" forceMin />
            </div>
        </Panel>
    );
};

// 4. Sales Orders -> Fulfillment Stepper
export const SalesOrderFulfillmentStepper = ({ total, active, delivered, revenue }) => (
    <Panel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flex: 2, minWidth: '300px', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <StepperStep label="Total Orders" count={total} color="#8b5cf6" />
                <StepperStep label="Active Orders" count={active} color="#3b82f6" />
                <StepperStep label="Delivered" count={delivered} color="#10b981" isLast />
            </div>
            
            <div style={{ width: '1px', height: '60px', backgroundColor: '#e2e8f0', margin: '0 16px', display: 'none' }} className="d-md-block" />

            <div style={{ flex: 1, minWidth: '200px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Order Revenue</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d' }}>{revenue}</div>
            </div>
        </div>
    </Panel>
);
