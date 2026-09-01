import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

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

const Field = ({ section, name, label, value, type = 'text', onChange, editable, confObj }) => {
  const level    = confObj?.level || 'unknown';
  const isLow    = level === 'low';
  const isMedium = level === 'medium';

  const borderColor = isLow ? '#fca5a5' : isMedium ? '#fcd34d' : '#e2e8f0';
  const bgColor     = isLow ? '#fef2f2' : isMedium ? '#fffbeb' : '#f8fafc';

  return (
    <div style={{ marginBottom: '16px', width: '100%' }}>
      <label style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '11px', color: '#64748b', marginBottom: '6px',
        fontWeight: '600',
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
            width: '100%', padding: '8px 12px', fontSize: '14px',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px', background: bgColor, color: '#0f172a',
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'inherit', boxSizing: 'border-box'
          }}
          onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; e.target.style.background = '#fff'; }}
          onBlur={e => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = 'none'; e.target.style.background = bgColor; }}
        />
      ) : (
        <div style={{
          fontSize: '14px', padding: '8px 12px',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '8px', minHeight: '36px', color: '#0f172a',
          fontWeight: value ? '500' : '400', boxSizing: 'border-box'
        }}>
          {value || <span style={{ color: '#94a3b8' }}>Not detected</span>}
        </div>
      )}
    </div>
  );
};

const Subsection = ({ title, lowCount = 0, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>
        {title}
      </h4>
      {lowCount > 0 && (
        <span style={{
          padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
          fontWeight: '600', background: '#fef2f2', color: '#dc2626',
        }}>
          {lowCount} field{lowCount > 1 ? 's' : ''} need verification
        </span>
      )}
      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
    </div>
    {children}
  </div>
);

const InvoiceDataPanel = ({ data, confidences = {}, onChange, editable, children }) => {
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

  const countLow = (names) => names.filter(n => confidences[n]?.level === 'low').length;

  return (
    <div style={{ 
      background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      overflow: 'hidden', fontFamily: '"Inter", "SF Pro Display", sans-serif',
      marginBottom: '24px'
    }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Document Information</h3>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Review and edit extracted values below</p>
      </div>

      <div style={{ padding: '32px' }}>
        <Subsection title="Vendor Information" lowCount={countLow(['vendor_name', 'vendor_gstin', 'vendor_phone', 'vendor_email'])}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Field {...fieldProps('vendorInfo', 'vendor_name',  'Company Name', vendor.name)} />
            <Field {...fieldProps('vendorInfo', 'vendor_gstin', 'GSTIN',        vendor.gstin)} />
            <Field {...fieldProps('vendorInfo', 'vendor_address','Address',     vendor.address)} />
            <Field {...fieldProps('vendorInfo', 'vendor_phone', 'Phone',        vendor.phone)} />
            <Field {...fieldProps('vendorInfo', 'vendor_email', 'Email',        vendor.email)} />
          </div>
        </Subsection>

        <Subsection title="Invoice Details" lowCount={countLow(['invoice_number', 'invoice_date', 'due_date', 'po_number'])}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Field {...fieldProps('invoiceInfo', 'invoice_number',  'Invoice Number',  invoice.number)} />
            <Field {...fieldProps('invoiceInfo', 'invoice_date',    'Invoice Date',    invoice.date)} />
            <Field {...fieldProps('invoiceInfo', 'due_date',        'Due Date',        invoice.due_date)} />
            <Field {...fieldProps('invoiceInfo', 'po_number',       'PO Number',       invoice.po_number)} />
            <Field {...fieldProps('invoiceInfo', 'currency',        'Currency',        invoice.currency)} />
            <Field {...fieldProps('invoiceInfo', 'payment_terms',   'Payment Terms',   invoice.payment_terms)} />
          </div>
        </Subsection>

        <Subsection title="Customer / Bill To" lowCount={countLow(['customer_name', 'customer_gstin'])}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Field {...fieldProps('customerInfo', 'customer_name',    'Customer Name',    customer.name)} />
            <Field {...fieldProps('customerInfo', 'customer_gstin',   'Customer GSTIN',   customer.gstin)} />
            <Field {...fieldProps('customerInfo', 'billing_address',  'Billing Address',  customer.billing_address)} />
            <Field {...fieldProps('customerInfo', 'shipping_address', 'Shipping Address', customer.shipping_address)} />
          </div>
        </Subsection>

        <Subsection title="Financial Information" lowCount={countLow(['grand_total', 'subtotal'])}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Field {...fieldProps('totalsBlock', 'subtotal',    'Subtotal',     totals.subtotal)} />
            <Field {...fieldProps('totalsBlock', 'discount',    'Discount',     totals.discount)} />
            <Field {...fieldProps('totalsBlock', 'tax',         'Total Tax',    totals.tax)} />
            <Field {...fieldProps('totalsBlock', 'cgst',        'CGST',         totals.cgst)} />
            <Field {...fieldProps('totalsBlock', 'sgst',        'SGST',         totals.sgst)} />
            <Field {...fieldProps('totalsBlock', 'igst',        'IGST',         totals.igst)} />
            
            <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>
                Grand Total
              </label>
              <div style={{
                fontSize: '24px', fontWeight: '700', color: '#1a73e8',
                padding: '12px 16px', background: '#eff6ff', borderRadius: '8px',
                border: '1px solid #bfdbfe',
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
                    width: '100%', marginTop: '12px', padding: '10px 14px', fontSize: '14px',
                    border: '1px solid #bfdbfe', borderRadius: '8px', background: '#fff',
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              )}
            </div>
          </div>
        </Subsection>

        {children && (
          <Subsection title="Line Items">
            {children}
          </Subsection>
        )}
      </div>
    </div>
  );
};

export default InvoiceDataPanel;

