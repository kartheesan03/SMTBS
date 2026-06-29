import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    Search, ChevronDown, ChevronUp, MoreVertical, Download, 
    FileText, FileSpreadsheet, Printer, Filter, EyeOff, Check, X
} from 'lucide-react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './DataTable.css';

const DataTable = ({ 
    columns = [], 
    data = [], 
    title = 'Data Table', 
    subtitle = 'Manage your records',
    actions = [], // row actions: [{ label, icon: Icon, onClick, color }]
    bulkActions = [], // [{ label, icon: Icon, onClick, color }]
    searchPlaceholder = 'Search records...',
    primaryAction = null, // { label, icon: Icon, onClick }
    pageSize = 10
}) => {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [visibleColumns, setVisibleColumns] = useState(
        columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    const dropdownRef = useRef(null);

    // Click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowColumnDropdown(false);
                setShowExportDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter data
    const filteredData = useMemo(() => {
        if (!search) return data;
        return data.filter(item => {
            return columns.some(col => {
                const val = item[col.key];
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(search.toLowerCase());
            });
        });
    }, [data, search, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
    const currentData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const toggleRowSelect = (id) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedRows(newSelected);
    };

    const toggleAllSelect = () => {
        if (selectedRows.size === currentData.length && currentData.length > 0) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(currentData.map(r => r._id || r.id)));
        }
    };

    const toggleColumnVisibility = (key) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Export functions
    const exportCSV = () => {
        const headers = columns.filter(c => visibleColumns[c.key]).map(c => c.label).join(',');
        const rows = sortedData.map(row => 
            columns.filter(c => visibleColumns[c.key]).map(c => {
                let val = row[c.key] || '';
                if (typeof val === 'string') val = val.replace(/"/g, '""');
                return `"${val}"`;
            }).join(',')
        ).join('\n');
        
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${title.replace(/\s+/g, '_')}_Export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportDropdown(false);
    };

    const exportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(title);
        
        const exportCols = columns.filter(c => visibleColumns[c.key]);
        worksheet.columns = exportCols.map(c => ({ header: c.label, key: c.key, width: 20 }));

        sortedData.forEach(row => {
            const rowData = {};
            exportCols.forEach(c => rowData[c.key] = row[c.key]);
            worksheet.addRow(rowData);
        });

        worksheet.getRow(1).font = { bold: true };
        
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/\s+/g, '_')}_Export.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportDropdown(false);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const exportCols = columns.filter(c => visibleColumns[c.key]);
        const head = [exportCols.map(c => c.label)];
        const body = sortedData.map(row => exportCols.map(c => String(row[c.key] || '')));
        
        doc.text(title, 14, 15);
        doc.autoTable({
            startY: 20,
            head: head,
            body: body,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });
        
        doc.save(`${title.replace(/\s+/g, '_')}_Export.pdf`);
        setShowExportDropdown(false);
    };

    const printTable = () => {
        window.print();
        setShowExportDropdown(false);
    };

    return (
        <div className="ui-datatable-container" ref={dropdownRef}>
            <div className="ui-datatable-header">
                <div className="ui-datatable-title">
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>
                <div className="ui-datatable-toolbar">
                    <div className="ui-search-box">
                        <Search size={16} color="#94a3b8" />
                        <input 
                            type="text" 
                            placeholder={searchPlaceholder} 
                            value={search} 
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    
                    {/* Column Visibility */}
                    <div style={{ position: 'relative' }}>
                        <button className="ui-btn-outline" onClick={() => setShowColumnDropdown(!showColumnDropdown)}>
                            <EyeOff size={16} /> Columns
                        </button>
                        {showColumnDropdown && (
                            <div className="ui-action-dropdown show" style={{ width: '200px', top: '100%', right: 0 }}>
                                <div style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Toggle Columns</div>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                                    {columns.map(col => (
                                        <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer', fontSize: '13px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={visibleColumns[col.key]} 
                                                onChange={() => toggleColumnVisibility(col.key)}
                                            />
                                            {col.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export */}
                    <div style={{ position: 'relative' }}>
                        <button className="ui-btn-outline" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                            <Download size={16} /> Export
                        </button>
                        {showExportDropdown && (
                            <div className="ui-action-dropdown show" style={{ top: '100%', right: 0 }}>
                                <button className="ui-dropdown-item" onClick={exportCSV}><FileText size={14} /> CSV</button>
                                <button className="ui-dropdown-item" onClick={exportExcel}><FileSpreadsheet size={14} /> Excel</button>
                                <button className="ui-dropdown-item" onClick={exportPDF}><FileText size={14} /> PDF</button>
                                <button className="ui-dropdown-item" onClick={printTable}><Printer size={14} /> Print</button>
                            </div>
                        )}
                    </div>

                    {primaryAction && (
                        <button className="ui-btn-primary" onClick={primaryAction.onClick}>
                            {primaryAction.icon && <primaryAction.icon size={16} />}
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.size > 0 && bulkActions.length > 0 && (
                <div className="ui-bulk-actions">
                    <span className="ui-bulk-text">{selectedRows.size} item(s) selected</span>
                    <div className="ui-bulk-buttons">
                        {bulkActions.map((action, idx) => (
                            <button 
                                key={idx} 
                                className="ui-btn-outline" 
                                style={{ color: action.color || 'inherit', height: '32px' }}
                                onClick={() => action.onClick(Array.from(selectedRows))}
                            >
                                {action.icon && <action.icon size={14} />} {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="ui-datatable-wrapper">
                <table className="ui-table">
                    <thead>
                        <tr>
                            {bulkActions.length > 0 && (
                                <th style={{ width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={currentData.length > 0 && selectedRows.size === currentData.length}
                                        onChange={toggleAllSelect}
                                    />
                                </th>
                            )}
                            {columns.filter(c => visibleColumns[c.key]).map((col) => (
                                <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {col.label}
                                        {sortConfig.key === col.key && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions.length > 0 && <th style={{ width: '60px', textAlign: 'right' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? currentData.map((row) => (
                            <tr key={row._id || row.id} className={selectedRows.has(row._id || row.id) ? 'selected' : ''}>
                                {bulkActions.length > 0 && (
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRows.has(row._id || row.id)}
                                            onChange={() => toggleRowSelect(row._id || row.id)}
                                        />
                                    </td>
                                )}
                                {columns.filter(c => visibleColumns[c.key]).map((col) => (
                                    <td key={col.key}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                {actions.length > 0 && (
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="ui-action-menu">
                                            <button className="ui-action-btn">
                                                <MoreVertical size={16} />
                                            </button>
                                            <div className="ui-action-dropdown">
                                                {actions.map((action, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        className={`ui-dropdown-item ${action.color === 'danger' ? 'danger' : ''}`}
                                                        onClick={() => action.onClick(row)}
                                                    >
                                                        {action.icon && <action.icon size={14} />} {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={columns.length + (bulkActions.length ? 1 : 0) + (actions.length ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="ui-datatable-footer">
                    <div className="ui-pagination-info">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
                    </div>
                    <div className="ui-pagination-controls">
                        <button 
                            className="ui-page-btn" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        >
                            <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => {
                            const p = idx + 1;
                            // Show first, last, current, and adjacent pages
                            if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                                return (
                                    <button 
                                        key={p} 
                                        className={`ui-page-btn ${currentPage === p ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                );
                            } else if (p === currentPage - 2 || p === currentPage + 2) {
                                return <span key={p} style={{ color: '#94a3b8' }}>...</span>;
                            }
                            return null;
                        })}

                        <button 
                            className="ui-page-btn" 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        >
                            <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
