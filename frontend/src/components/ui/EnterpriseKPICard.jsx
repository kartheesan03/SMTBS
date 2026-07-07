/**
 * EnterpriseKPICard — strict fixed-height card (185px) using absolute positioning.
 * Every slot is pinned mathematically so no card content can shift layout.
 *
 * Usage:
 *   <EnterpriseKPICard
 *     title="Total Orders"
 *     value={128}
 *     subtitle="Monitoring Level"          // optional — shown below value
 *     footer={<span>Updated Today</span>}  // optional — shown in bottom slot
 *     icon={ShoppingCart}
 *     colorClass="ent-theme-primary"       // one of the ent-theme-* classes
 *   />
 */
import React from 'react';
import '../../styles/design-tokens.css';

const EnterpriseKPICard = ({
  title,
  value,
  subtitle = 'Monitoring Level',
  footer,
  icon: Icon,
  colorClass = 'ent-theme-primary',
}) => (
  <div className={`ent-module-card ${colorClass}`}>
    {/* Top-right icon — absolutely pinned */}
    <div className="ent-card-icon-wrapper">
      {Icon && <Icon size={20} strokeWidth={2.5} />}
    </div>

    {/* Title — allows up to 2 lines, never shifts anything below it */}
    <div className="ent-card-title" title={title}>{title}</div>

    {/* Value + subtitle — pinned at top: 68px */}
    <div className="ent-card-value-area">
      <div className="ent-card-value">{value}</div>
      <div
        className="ent-card-status-badge"
        style={{ backgroundColor: 'transparent', padding: 0, color: 'var(--ent-text-secondary)', fontWeight: 500 }}
      >
        {subtitle}
      </div>
    </div>

    {/* Footer — pinned to bottom: 24px */}
    <div className="ent-card-footer">
      {footer ?? (
        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
          Updated Today
        </div>
      )}
    </div>
  </div>
);

export default EnterpriseKPICard;
