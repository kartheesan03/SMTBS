import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Individual check row ──────────────────────────────────────────────────────
const CheckRow = ({ isValid, label, detail }) => {
  const icon = isValid === true
    ? <CheckCircle2 size={15} color="#16a34a" />
    : isValid === false
      ? <XCircle size={15} color="#dc2626" />
      : <AlertCircle size={15} color="#94a3b8" />;

  const textColor = isValid === true ? '#166534' : isValid === false ? '#991b1b' : '#6b7280';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{label}</div>
        {detail && (
          <div style={{ fontSize: '11px', color: textColor, marginTop: '1px' }}>{detail}</div>
        )}
      </div>
    </div>
  );
};

// ─── Main ValidationPanel ─────────────────────────────────────────────────────
const ValidationPanel = ({ validation, status }) => {
  const [showIssues, setShowIssues] = useState(true);

  if (!validation) return null;

  const checks   = validation.checks   || {};
  const issues   = validation.issues   || [];
  const details  = validation.details  || {};
  const poMatch  = validation.po_match || null;
  const dupCheck = validation.duplicate_check || {};

  const overallOk  = issues.length === 0;
  const mathOk     = validation.math_valid !== false;
  const dupOk      = !dupCheck.found;
  const poStatus   = poMatch?.status || null;

  // Summary badge
  const summaryBg    = overallOk ? '#dcfce7' : '#fef3c7';
  const summaryColor = overallOk ? '#166534' : '#92400e';
  const summaryText  = overallOk ? 'Validation Passed' : `${issues.length} Issue${issues.length > 1 ? 's' : ''} Found`;

  return (
    <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fafbfc',
      }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
          🔍 Validation Dashboard
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
            fontWeight: '600', background: summaryBg, color: summaryColor,
          }}>
            {summaryText}
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
            fontWeight: '600',
            background: status === 'Approved' ? '#dcfce7'
              : status === 'Ready_For_Approval' ? '#dbeafe'
              : status === 'Needs_Verification' ? '#fef3c7'
              : status === 'Duplicate' ? '#fee2e2'
              : '#f3f4f6',
            color: status === 'Approved' ? '#166534'
              : status === 'Ready_For_Approval' ? '#1e40af'
              : status === 'Needs_Verification' ? '#92400e'
              : status === 'Duplicate' ? '#991b1b'
              : '#374151',
          }}>
            {(status || '').replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Checks grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '4px' }}>
              Data Extraction
            </div>
            <CheckRow isValid={checks.vendor_identified}         label="Vendor identified" />
            <CheckRow isValid={checks.invoice_number_identified} label="Invoice number found" />
            <CheckRow isValid={checks.invoice_date_identified}   label="Invoice date found" />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.6px', marginBottom: '4px' }}>
              Financial Validation
            </div>
            <CheckRow
              isValid={checks.line_items_math_valid}
              label="Line item calculations"
              detail={checks.line_items_math_valid === false ? 'Qty × Rate ≠ Amount for some rows' : null}
            />
            <CheckRow
              isValid={checks.grand_total_valid}
              label="Grand total verification"
              detail={checks.grand_total_valid === false
                ? `Expected: ${details.expected_grand_total}, Got: ${details.extracted_grand_total}`
                : null
              }
            />
            <CheckRow
              isValid={dupOk}
              label={dupOk ? 'No duplicate found' : `Duplicate detected`}
              detail={!dupOk ? `Matches document ID: ${dupCheck.ref}` : null}
            />
          </div>
        </div>

        {/* PO match */}
        {poMatch && (
          <div style={{
            marginTop: '14px', padding: '10px 14px', borderRadius: '8px',
            background: poMatch.status === 'Matched' ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${poMatch.status === 'Matched' ? '#86efac' : '#fcd34d'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {poMatch.status === 'Matched'
                ? <CheckCircle2 size={14} color="#16a34a" />
                : <AlertTriangle size={14} color="#d97706" />
              }
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                PO Match: {poMatch.status}
              </span>
              {poMatch.poNumber && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>({poMatch.poNumber})</span>
              )}
            </div>
            {poMatch.note && (
              <div style={{ fontSize: '11px', color: '#92400e', marginTop: '4px' }}>{poMatch.note}</div>
            )}
            {poMatch.matched_fields?.length > 0 && (
              <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                Matched: {poMatch.matched_fields.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Issues list */}
        {issues.length > 0 && (
          <div style={{ marginTop: '14px' }}>
            <button
              onClick={() => setShowIssues(s => !s)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5',
                borderRadius: showIssues ? '8px 8px 0 0' : '8px', cursor: 'pointer',
              }}
            >
              <AlertTriangle size={13} color="#dc2626" />
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#b91c1c', flex: 1, textAlign: 'left' }}>
                {issues.length} Issue{issues.length > 1 ? 's' : ''} Identified — Click to {showIssues ? 'hide' : 'show'}
              </span>
              {showIssues ? <ChevronUp size={14} color="#b91c1c" /> : <ChevronDown size={14} color="#b91c1c" />}
            </button>
            {showIssues && (
              <div style={{
                background: '#fff5f5', border: '1px solid #fca5a5', borderTop: 'none',
                borderRadius: '0 0 8px 8px', padding: '12px 14px',
              }}>
                {issues.map((issue, idx) => (
                  <div key={idx} style={{
                    display: 'flex', gap: '8px', alignItems: 'flex-start',
                    padding: '6px 0', borderBottom: idx < issues.length - 1 ? '1px solid #fee2e2' : 'none',
                  }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '2px 6px',
                      borderRadius: '4px',
                      background: issue.type === 'calculation_mismatch' ? '#fef3c7' : '#fee2e2',
                      color: issue.type === 'calculation_mismatch' ? '#92400e' : '#991b1b',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {issue.type?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#7f1d1d' }}>{issue.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;
