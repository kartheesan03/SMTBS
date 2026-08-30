import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const OCRDataTable = ({
  columns,
  rows,
  fields,
  totals,
  isEditMode,
  onColumnsChange,
  onRowsChange,
  onFieldsChange,
  onTotalsChange
}) => {
  const getColLabel = (col) => {
    if (col && typeof col === 'object') {
      return col.label || col.name || col.id || String(col);
    }
    return col || '';
  };
  
  const getColKey = (col) => {
    if (col && typeof col === 'object') {
      return col.id || col.name || col.label || String(col);
    }
    return col || '';
  };

  const getDisplayValue = (val) => {
    if (val && typeof val === 'object') {
      return val.corrected_value || val.raw_ocr_value || val.value || JSON.stringify(val);
    }
    return val;
  };

  const getEditValue = (val) => {
    if (val && typeof val === 'object') {
      return val.corrected_value !== undefined ? val.corrected_value : (val.raw_ocr_value || val.value || '');
    }
    return val || '';
  };

  const handleCellChange = (rowIndex, colKey, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = { ...newRows[rowIndex], [colKey]: value };
    onRowsChange(newRows);
  };

  const addRow = () => {
    const newRow = {};
    columns.forEach(col => { newRow[col] = ''; });
    onRowsChange([...rows, newRow]);
  };

  const removeRow = (index) => {
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  const handleColumnNameChange = (index, newValue) => {
    const oldCol = columns[index];
    const oldColKey = getColKey(oldCol);
    const newColumns = [...columns];
    
    if (typeof oldCol === 'object') {
        newColumns[index] = { ...oldCol, label: newValue };
    } else {
        newColumns[index] = newValue;
    }
    
    // Also update keys in rows if we are completely replacing the key (which happens if it's a string)
    // If it's an object, we just updated the label, the key (id) remains the same.
    if (typeof oldCol !== 'object') {
        const newRows = rows.map(row => {
          const updatedRow = { ...row };
          if (oldColKey !== newValue) {
            updatedRow[newValue] = updatedRow[oldColKey];
            delete updatedRow[oldColKey];
          }
          return updatedRow;
        });
        onRowsChange(newRows);
    }
    onColumnsChange(newColumns);
  };

  const addColumn = () => {
    const newColName = `New Column ${columns.length + 1}`;
    const newColumns = [...columns, newColName];
    const newRows = rows.map(row => ({ ...row, [newColName]: '' }));
    onColumnsChange(newColumns);
    onRowsChange(newRows);
  };

  const removeColumn = (index) => {
    const colToRemove = columns[index];
    const colKey = getColKey(colToRemove);
    const newColumns = columns.filter((_, i) => i !== index);
    const newRows = rows.map(row => {
      const updatedRow = { ...row };
      delete updatedRow[colKey];
      return updatedRow;
    });
    onColumnsChange(newColumns);
    onRowsChange(newRows);
  };

  const handleFieldChange = (key, newValue) => {
    const oldVal = fields[key];
    if (oldVal && typeof oldVal === 'object') {
      onFieldsChange({ ...fields, [key]: { ...oldVal, corrected_value: newValue } });
    } else {
      onFieldsChange({ ...fields, [key]: newValue });
    }
  };

  const handleTotalChange = (key, newValue) => {
    const oldVal = totals[key];
    if (oldVal && typeof oldVal === 'object') {
      onTotalsChange({ ...totals, [key]: { ...oldVal, corrected_value: newValue } });
    } else {
      onTotalsChange({ ...totals, [key]: newValue });
    }
  };

  return (
    <div className="ocr-data-table-container" style={{ marginTop: '24px' }}>
      {/* Key-Value Fields Section */}
      {Object.keys(fields).length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {Object.entries(fields).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--ink-soft)' }}>
                {key.replace(/_/g, ' ').toUpperCase()}
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  value={getEditValue(value)}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="form-input"
                />
              ) : (
                <span style={{ fontSize: '14px', color: 'var(--ink-dark)' }}>{getDisplayValue(value) || '-'}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Table Section */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--line)', borderRight: idx < columns.length - 1 ? '1px solid var(--line)' : 'none', backgroundColor: 'var(--surface-sunken)' }}>
                  {isEditMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        value={getColLabel(col)}
                        onChange={(e) => handleColumnNameChange(idx, e.target.value)}
                        style={{ border: '1px solid var(--line)', padding: '4px', borderRadius: '4px', background: 'var(--paper)', width: '100%' }}
                      />
                      <button onClick={() => removeColumn(idx)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }} title="Remove Column">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    getColLabel(col)
                  )}
                </th>
              ))}
              {isEditMode && (
                <th style={{ padding: '12px', width: '50px', borderBottom: '2px solid var(--line)', borderLeft: '1px solid var(--line)', backgroundColor: 'var(--surface-sunken)' }}>
                  <button onClick={addColumn} className="btn btn-sm btn-outline" title="Add Column">
                    <Plus size={14} />
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid var(--line)' }}>
                {columns.map((col, cIdx) => {
                  const colKey = getColKey(col);
                  return (
                    <td key={cIdx} style={{ padding: '12px', borderRight: cIdx < columns.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={getEditValue(row[colKey])}
                          onChange={(e) => {
                            const oldVal = row[colKey];
                            if (oldVal && typeof oldVal === 'object') {
                              handleCellChange(rIdx, colKey, { ...oldVal, corrected_value: e.target.value });
                            } else {
                              handleCellChange(rIdx, colKey, e.target.value);
                            }
                          }}
                          className="form-input"
                          style={{ padding: '6px', width: '100%' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--ink-dark)' }}>{getDisplayValue(row[colKey]) || '—'}</span>
                      )}
                    </td>
                  );
                })}
                {isEditMode && (
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => removeRow(rIdx)} style={{ color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditMode && (
        <button onClick={addRow} className="btn btn-sm btn-outline" style={{ marginTop: '12px' }}>
          <Plus size={14} /> Add Row
        </button>
      )}

      {/* Totals Section */}
      {Object.keys(totals).length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {Object.entries(totals).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
              <span style={{ fontWeight: '500', color: 'var(--ink-soft)' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </span>
              {isEditMode ? (
                <input
                  type="text"
                  value={getEditValue(value)}
                  onChange={(e) => handleTotalChange(key, e.target.value)}
                  style={{ textAlign: 'right', border: '1px solid var(--line)', padding: '4px', borderRadius: '4px' }}
                />
              ) : (
                <span style={{ fontWeight: 'bold', color: 'var(--ink-dark)' }}>{getDisplayValue(value)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OCRDataTable;
