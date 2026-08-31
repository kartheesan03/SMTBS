import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

// ─── Confidence indicator ──────────────────────────────────────────────────────
const ConfIndicator = ({ confObj }) => {
  if (!confObj) return null;
  const pct   = Math.round((confObj.confidence || 0) * 100);
  const level = confObj.level || 'unknown';

  if (level === 'high') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#16a34a' }}>
      <CheckCircle2 size={11} /> {pct}%
    </span>
  );
  if (level === 'medium') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#d97706' }}>
      <AlertCircle size={11} /> {pct}% review
    </span>
  );
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: '#dc2626' }}>
      <AlertTriangle size={11} /> {pct}% verify!
    </span>
  );
};

// ─── Single editable/display field ────────────────────────────────────────────
const Field = ({ section, name, label, value, type = 'text', onChange, editable, confObj }) => {
  const level    = confObj?.level || 'unknown';
  const isLow    = level === 'low';
  const isMedium = level === 'medium';

  const borderColor = isLow ? '#fca5a5' : isMedium ? '#fcd34d' : '#e2e8f0';
  const bgColor     = isLow ? '#fef2f2' : isMedium ? '#fffbeb' : '#fff';

  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '10px', color: '#6b7280', marginBottom: '5px',
        textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600',
      }}>
        <span>{label}</span>
        <ConfIndicator confObj={confObj} />
      </label>

      {editable ? (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange && onChange(section, name, e.target.value)}
          style={{
            width: '100%', padding: '7px 10px', fontSize: '13px',
            border: `1.5px solid ${borderColor}`,
            borderRadius: '6px', background: bgColor,
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; }}
        />
      ) : (
        <div style={{
          fontSize: '13px', padding: '7px 10px',
          background: isLow ? '#fef9f9' : '#f8fafc',
          border: `1.5px solid ${borderColor}`,
          borderRadius: '6px', minHeight: '34px', color: '#0f172a',
          fontWeight: value ? '500' : '400',
        }}>
          {value || <span style={{ color: '#94a3b8' }}>Not detected</span>}
        </div>
      )}
    </div>
  );
};

// ─── Section card ──────────────────────────────────────────────────────────────
const SectionCard = ({ title, emoji, children, lowCount = 0 }) => (
  <div style={{
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden',
  }}>
    <div style={{
      padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: '#fafbfc',
    }}>
      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
        {emoji} {title}
      </h4>
      {lowCount > 0 && (
        <span style={{
          padding: '2px 8px', borderRadius: '12px', fontSize: '10px',
          fontWeight: '600', background: '#fef2f2', color: '#dc2626',
        }}>
          {lowCount} field{lowCount > 1 ? 's' : ''} need verification
        </span>
      )}
    </div>
    <div style={{ padding: '16px' }}>
      {children}
    </div>
  </div>
);

// ─── Main component ────────────────────────────────────────────────────────────
const InvoiceDataPanel = ({ data, confidences = {}, onChange, editable }) => {
  if (!data) return null;

  const vendor   = data.vendorInfo   || {};
  const invoice  = data.invoiceInfo  || {};
  const customer = data.customerInfo || {};
  const totals   = data.totalsBlock  || {};

  const fieldProps = (section, name, label, value, type = 'text') => ({
    section, name, label, value, type,
    onChange, editable,
    confObj: confidences[name] || null,
  });

  // Count low-confidence fields per section
  const countLow = (names) => names.filter(n => confidences[n]?.level === 'low').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Vendor + Invoice grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SectionCard title="Vendor Information" emoji="🏢"
          lowCount={countLow(['vendor_name', 'vendor_gstin', 'vendor_phone', 'vendor_email'])}
        >
          <Field {...fieldProps('vendorInfo', 'vendor_name',  'Company Name', vendor.name)} />
          <Field {...fieldProps('vendorInfo', 'vendor_gstin', 'GSTIN',        vendor.gstin)} />
          <Field {...fieldProps('vendorInfo', 'vendor_address','Address',     vendor.address)} />
          <Field {...fieldProps('vendorInfo', 'vendor_phone', 'Phone',        vendor.phone)} />
          <Field {...fieldProps('vendorInfo', 'vendor_email', 'Email',        vendor.email)} />
        </SectionCard>

        <SectionCard title="Invoice Details" emoji="📋"
          lowCount={countLow(['invoice_number', 'invoice_date', 'due_date', 'po_number'])}
        >
          <Field {...fieldProps('invoiceInfo', 'invoice_number',  'Invoice Number',  invoice.number)} />
          <Field {...fieldProps('invoiceInfo', 'invoice_date',    'Invoice Date',    invoice.date)} />
          <Field {...fieldProps('invoiceInfo', 'due_date',        'Due Date',        invoice.due_date)} />
          <Field {...fieldProps('invoiceInfo', 'po_number',       'PO Number',       invoice.po_number)} />
          <Field {...fieldProps('invoiceInfo', 'currency',        'Currency',        invoice.currency)} />
          <Field {...fieldProps('invoiceInfo', 'payment_terms',   'Payment Terms',   invoice.payment_terms)} />
        </SectionCard>
      </div>

      {/* Customer info */}
      <SectionCard title="Customer / Bill To" emoji="👤"
        lowCount={countLow(['customer_name', 'customer_gstin'])}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <Field {...fieldProps('customerInfo', 'customer_name',    'Customer Name',    customer.name)} />
            <Field {...fieldProps('customerInfo', 'customer_gstin',   'Customer GSTIN',   customer.gstin)} />
          </div>
          <div>
            <Field {...fieldProps('customerInfo', 'billing_address',  'Billing Address',  customer.billing_address)} />
            <Field {...fieldProps('customerInfo', 'shipping_address', 'Shipping Address', customer.shipping_address)} />
          </div>
        </div>
      </SectionCard>

      {/* Totals */}
      <SectionCard title="Totals & Tax" emoji="💰"
        lowCount={countLow(['grand_total', 'subtotal'])}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <Field {...fieldProps('totalsBlock', 'subtotal',    'Subtotal',     totals.subtotal,   'text')} />
          <Field {...fieldProps('totalsBlock', 'discount',    'Discount',     totals.discount,   'text')} />
          <Field {...fieldProps('totalsBlock', 'tax',         'Total Tax',    totals.tax,        'text')} />
          <Field {...fieldProps('totalsBlock', 'cgst',        'CGST',         totals.cgst,       'text')} />
          <Field {...fieldProps('totalsBlock', 'sgst',        'SGST',         totals.sgst,       'text')} />
          <Field {...fieldProps('totalsBlock', 'igst',        'IGST',         totals.igst,       'text')} />
          <div style={{ gridColumn: '1 / -1', borderTop: '1.5px dashed #e2e8f0', paddingTop: '14px', marginTop: '4px' }}>
            <label style={{ display: 'block', fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', marginBottom: '5px' }}>
              Grand Total
            </label>
            <div style={{
              fontSize: '22px', fontWeight: '800', color: '#1a73e8',
              padding: '8px 12px', background: '#eff6ff', borderRadius: '8px',
              border: '1.5px solid #bfdbfe',
            }}>
              {totals.grand_total || <span style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '400' }}>Not detected</span>}
            </div>
            {editable && (
              <input
                type="text"
                value={totals.grand_total || ''}
                onChange={e => onChange && onChange('totalsBlock', 'grand_total', e.target.value)}
                placeholder="Enter grand total..."
                style={{
                  width: '100%', marginTop: '8px', padding: '7px 10px', fontSize: '13px',
                  border: '1.5px solid #bfdbfe', borderRadius: '6px', background: '#eff6ff',
                  fontFamily: 'inherit', outline: 'none',
                }}
              />
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default InvoiceDataPanel;
