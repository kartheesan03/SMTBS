import React, { useState } from 'react';
import { Plus, Trash2, PlusCircle, Settings2, AlertCircle } from 'lucide-react';

// ─── OCRDataTable ──────────────────────────────────────────────────────────────
const OCRDataTable = ({ lineItems, rawFields, onChange, editable }) => {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [newColName, setNewColName]         = useState('');

  if (!lineItems) return null;

  const columns = lineItems.columns || [];
  const rows    = lineItems.rows    || [];

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCellChange = (rowIndex, colName, value) => {
    if (!editable || !onChange) return;
    const newRows = rows.map((row, idx) =>
      idx === rowIndex ? { ...row, [colName]: value } : row
    );
    onChange('lineItems', 'rows', newRows);
  };

  const addRow = () => {
    if (!editable || !onChange) return;
    const newRow = {};
    columns.forEach(c => { newRow[c] = ''; });
    onChange('lineItems', 'rows', [...rows, newRow]);
  };

  const removeRow = (rowIndex) => {
    if (!editable || !onChange) return;
    onChange('lineItems', 'rows', rows.filter((_, idx) => idx !== rowIndex));
  };

  const addColumn = () => {
    const name = newColName.trim();
    if (!name || columns.includes(name)) return;
    const newCols = [...columns, name];
    const newRows = rows.map(row => ({ ...row, [name]: '' }));
    onChange('lineItems', 'columns', newCols);  // We store via rows path
    // Use a small workaround to update both columns and rows:
    // The parent handles lineItems as a whole via the onChange signature
    // So we call a custom path
    if (onChange) {
      // Direct lineItems update (OCRPage handles 'lineItems' section specially for rows,
      // so we use a trick: update the entire lineItems object)
      onChange('_lineItemsFull', 'update', { columns: newCols, rows: newRows });
    }
    setNewColName('');
    setShowColumnMenu(false);
  };

  const removeColumn = (colName) => {
    if (!editable || !onChange) return;
    const newCols = columns.filter(c => c !== colName);
    const newRows = rows.map(row => {
      const r = { ...row };
      delete r[colName];
      return r;
    });
    onChange('_lineItemsFull', 'update', { columns: newCols, rows: newRows });
  };

  // ── Empty state & Fallback ─────────────────────────────────────────────────
  if (columns.length === 0) {
    const hasRawFields = rawFields && rawFields.length > 0;

    return (
      <div style={{
        background: '#fff', border: '1.5px dashed #e2e8f0', borderRadius: '10px',
        padding: hasRawFields ? '0' : '32px', textAlign: hasRawFields ? 'left' : 'center',
        overflow: 'hidden'
      }}>
        {hasRawFields ? (
          <div>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0' }}>
                📋 Raw Extracted Data
              </h4>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                No standard line items found. Showing raw key-value pairs.
              </p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {rawFields.map((field, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: '600', color: '#475569', width: '30%', background: '#fafbfc' }}>
                      {field.label}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '13px', color: '#0f172a' }}>
                      {field.value}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
                      {Math.round(field.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <AlertCircle size={36} style={{ color: '#94a3b8', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', margin: '0 0 4px' }}>
              No line items table detected
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              The document may not have a traditional item table, or the table structure was not recognised.
              {editable && ' You can add columns manually below.'}
            </p>
          </>
        )}

        {editable && !hasRawFields && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <input
              type="text"
              value={newColName}
              onChange={e => setNewColName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addColumn()}
              placeholder="Column name..."
              style={{
                padding: '7px 12px', borderRadius: '6px', border: '1px solid #e2e8f0',
                fontSize: '13px', width: '180px', outline: 'none',
              }}
            />
            <button onClick={addColumn} style={{
              padding: '7px 14px', background: '#1a73e8', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
            }}>
              Add Column
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
      {/* Header bar */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fafbfc', position: 'relative', zIndex: 50,
      }}>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px' }}>
            📊 Line Items
          </h4>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {columns.length} columns &nbsp;·&nbsp; {rows.length} rows
          </span>
        </div>
        {editable && (
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <button
              onClick={() => setShowColumnMenu(m => !m)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', background: '#f1f5f9', color: '#374151',
                border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer',
                fontSize: '12px', fontWeight: '500',
              }}
            >
              <Settings2 size={13} /> Columns
            </button>
            <button
              onClick={addRow}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', background: '#eff6ff', color: '#1a73e8',
                border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer',
                fontSize: '12px', fontWeight: '500',
              }}
            >
              <Plus size={13} /> Add Row
            </button>

            {/* Column menu */}
            {showColumnMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: '240px', zIndex: 9999,
                padding: '12px',
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Manage Columns
                </div>
                {columns.map(col => (
                  <div key={col} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '12px', color: '#374151' }}>{col}</span>
                    <button onClick={() => removeColumn(col)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 4px' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <input
                    type="text"
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addColumn()}
                    placeholder="New column name..."
                    style={{
                      flex: 1, padding: '5px 8px', borderRadius: '5px',
                      border: '1px solid #e2e8f0', fontSize: '12px', outline: 'none',
                    }}
                  />
                  <button onClick={addColumn} style={{
                    padding: '5px 10px', background: '#1a73e8', color: '#fff',
                    border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px',
                  }}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', position: 'relative', zIndex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', position: 'relative', zIndex: 1 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 14px', fontWeight: '700', color: '#64748b', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '40px' }}>
                #
              </th>
              {columns.map((col, idx) => (
                <th key={idx} style={{
                  padding: '10px 14px', fontWeight: '700', color: '#1a73e8',
                  textAlign: 'left', fontSize: '11px', textTransform: 'uppercase',
                  letterSpacing: '0.5px', whiteSpace: 'nowrap',
                  borderRight: idx < columns.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  {col}
                </th>
              ))}
              {editable && <th style={{ width: '40px' }} />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} style={{
                borderBottom: '1px solid #f1f5f9',
                background: rIdx % 2 === 0 ? '#fff' : '#fafbfc',
              }}>
                <td style={{ padding: '8px 14px', fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                  {rIdx + 1}
                </td>
                {columns.map((col, cIdx) => (
                  <td key={cIdx} style={{
                    padding: '6px 14px',
                    borderRight: cIdx < columns.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    {editable ? (
                      <input
                        type="text"
                        value={row[col] ?? ''}
                        onChange={e => handleCellChange(rIdx, col, e.target.value)}
                        style={{
                          width: '100%', minWidth: '80px', padding: '5px 7px',
                          fontSize: '12px', border: '1px solid transparent',
                          borderRadius: '4px', background: 'transparent',
                          transition: 'all 0.15s', fontFamily: 'inherit', color: '#0f172a',
                        }}
                        onFocus={e => {
                          e.target.style.border = '1px solid #1a73e8';
                          e.target.style.background = '#fff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(26,115,232,0.1)';
                        }}
                        onBlur={e => {
                          e.target.style.border = '1px solid transparent';
                          e.target.style.background = 'transparent';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ color: row[col] ? '#0f172a' : '#94a3b8' }}>
                        {row[col] || '—'}
                      </span>
                    )}
                  </td>
                ))}
                {editable && (
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <button
                      onClick={() => removeRow(rIdx)}
                      title="Remove row"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ef4444', opacity: 0.6, padding: '2px',
                        borderRadius: '4px', transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (editable ? 2 : 1)}
                  style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}
                >
                  No data rows. {editable && 'Click "Add Row" to add one.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OCRDataTable;
