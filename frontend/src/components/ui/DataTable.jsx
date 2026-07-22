import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    Search, ChevronDown, ChevronUp, MoreVertical, Download, 
    FileText, FileSpreadsheet, Printer, Filter, EyeOff, Check, X, Database
} from 'lucide-react';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';
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
    pageSize = 10,
    loading = false,
    expandableRowRender = null, // (row) => ReactNode
    variant = 'default', // 'default' | 'flat'
    dense = false,
    compactControls = false
}) => {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [visibleColumns, setVisibleColumns] = useState(() => 
        columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );

    // Sync visibleColumns when columns prop changes (e.g. during HMR or dynamic column updates)
    useEffect(() => {
        setVisibleColumns(prev => {
            let changed = false;
            const next = { ...prev };
            columns.forEach(col => {
                if (next[col.key] === undefined) {
                    next[col.key] = true;
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [columns]);
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

    const toggleRowExpand = (id, e) => {
        if (e) e.stopPropagation();
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
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
        <div className={`ui-datatable-container ${variant === 'flat' ? 'ui-datatable-flat' : ''} ${dense ? 'rd-table-dense' : ''}`} ref={dropdownRef}>
            <div className={`ui-datatable-header ${compactControls ? 'rd-controls-compact' : ''}`}>
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
                            <EyeOff size={16} /> <span>Columns</span>
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
                            <Download size={16} /> <span>Export</span>
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
                <table className="ui-datatable">
                    <thead>
                        <tr>
                            {columns.filter(c => visibleColumns[c.key]).map((col) => (
                                <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer', textAlign: col.align || 'left', width: col.width || 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }}>
                                        {col.label}
                                        {sortConfig.key === col.key && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions.length > 0 && <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>}
                            {expandableRowRender && <th style={{ width: '40px', textAlign: 'center' }}></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(pageSize)].map((_, idx) => (
                                <tr key={`skeleton-${idx}`} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                                    {columns.filter(c => visibleColumns[c.key]).map(col => (
                                        <td key={`skeleton-col-${col.key}`}>
                                            <div style={{height: 16, background: '#e2e8f0', borderRadius: 4, width: '70%'}}></div>
                                        </td>
                                    ))}
                                    {actions.length > 0 && <td><div style={{height: 24, background: '#e2e8f0', borderRadius: 4, width: '60px', margin: '0 auto'}}></div></td>}
                                    {expandableRowRender && <td></td>}
                                </tr>
                            ))
                        ) : currentData.length > 0 ? (
                            currentData.map((row) => (
                                <React.Fragment key={row._id || row.id}>
                                    <motion.tr 
                                        className={selectedRows.has(row._id || row.id) ? 'selected' : ''}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ backgroundColor: '#f8fafc' }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {columns.filter(c => visibleColumns[c.key]).map((col) => (
                                            <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                        {actions.length > 0 && (
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    {actions.map((action, idx) => (
                                                        <button 
                                                            key={idx} 
                                                            className="ui-action-btn"
                                                            style={action.color === 'danger' ? { color: '#ef4444' } : { color: action.color || '#4f46e5' }}
                                                            title={action.label}
                                                            onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                                                        >
                                                            {action.icon && <action.icon size={16} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        )}
                                        {expandableRowRender && (
                                            <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={(e) => toggleRowExpand(row._id || row.id, e)}>
                                                {expandedRows.has(row._id || row.id) ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                                            </td>
                                        )}
                                    </motion.tr>
                                    {expandableRowRender && expandedRows.has(row._id || row.id) && (
                                        <tr>
                                            <td colSpan={columns.filter(c => visibleColumns[c.key]).length + (actions.length > 0 ? 1 : 0) + 1} style={{ padding: 0, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} 
                                                    animate={{ height: 'auto', opacity: 1 }} 
                                                    exit={{ height: 0, opacity: 0 }} 
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    {expandableRowRender(row)}
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <td colSpan={columns.filter(c => visibleColumns[c.key]).length + (actions.length ? 1 : 0) + (expandableRowRender ? 1 : 0)} style={{ textAlign: 'center', padding: '64px 20px', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 64, height: 64, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                                            <Database size={32} color="#94a3b8" />
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: 16, color: '#0f172a', fontWeight: 600 }}>No records found</h4>
                                        <p style={{ margin: 0, fontSize: 14, color: '#64748b', maxWidth: 300 }}>
                                            {search 
                                                ? "We couldn't find any data matching your current search criteria." 
                                                : "No data available at the moment."}
                                        </p>
                                        {primaryAction && (
                                            <button 
                                                className="ui-btn-primary" 
                                                style={{ marginTop: '12px' }}
                                                onClick={primaryAction.onClick}
                                            >
                                                {primaryAction.icon && <primaryAction.icon size={16} />}
                                                {primaryAction.label}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
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
