import React, { useState } from 'react';
import './AriaVisualizer.css';
import { Search, Download, Filter, Edit2, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AriaVisualizer = ({ visualData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    if (!visualData) {
        return null;
    }

    const { type, modelName, data, value, title, operation } = visualData;

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const isUUID = (str) => {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return uuidRegex.test(str) || (str && str.length > 25 && !str.includes(' '));
    };

    // Standardize types based on the user request
    const isKPI = type === 'aggregate' || type === 'count' || type === 'kpi' || type === 'metric';

    if (!data && value === undefined && !isKPI) {
        return (
            <div className="aria-vis-empty">
                <p>No data available to visualize.</p>
            </div>
        );
    }

    if (type === 'document_extraction') {
        const tables = data.tables || [];
        return (
            <div className="aria-vis-container">
                <div className="aria-vis-header">
                    <h3>Extracted Document Data</h3>
                    <div className="aria-vis-actions">
                        <button className="aria-vis-btn" title="Edit Data"><Edit2 size={16} /></button>
                        <button className="aria-vis-btn" title="Download PDF"><Download size={16} /></button>
                    </div>
                </div>
                
                {tables.length > 0 ? (
                    tables.map((table, tIndex) => {
                        const tHeaders = table.rows && table.rows.length > 0 ? Object.keys(table.rows[0]) : [];
                        return (
                            <div key={tIndex} className="aria-vis-table-wrapper" style={{ marginBottom: '1rem' }}>
                                {table.name && <h4 style={{ padding: '0.5rem 1rem', margin: 0, backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>{table.name}</h4>}
                                <table className="aria-vis-table">
                                    <thead>
                                        <tr>
                                            {tHeaders.map(h => <th key={h}>{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.rows.map((row, rIndex) => (
                                            <tr key={rIndex}>
                                                {tHeaders.map(h => {
                                                    let val = row[h];
                                                    if (val === null || val === undefined) val = '-';
                                                    else if (typeof val === 'object') val = JSON.stringify(val);
                                                    return <td key={h}>{String(val)}</td>;
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                ) : (
                    <div className="aria-vis-empty">
                        <p>No structured tables found in document.</p>
                    </div>
                )}
            </div>
        );
    }

    if (isKPI) {
        // Format the value based on type (e.g. ₹ for revenue/value)
        let displayValue = value;
        if (typeof value === 'number') {
            const isMonetary = title?.toLowerCase().includes('revenue') || title?.toLowerCase().includes('value') || title?.toLowerCase().includes('total') && !title?.toLowerCase().includes('count');
            displayValue = isMonetary ? '₹' + value.toLocaleString() : value.toLocaleString();
        }

        return (
            <div className="aria-vis-container" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'inline-flex', flexDirection: 'column', minWidth: '240px' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', color: '#6b7280', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {title || modelName || "Result"}
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                    {displayValue}
                </div>
            </div>
        );
    }

    if (type === 'chart') {
        if (!Array.isArray(data) || data.length === 0) {
            return (
                <div className="aria-vis-empty">
                    <p>No data available to render chart.</p>
                </div>
            );
        }
        return (
            <div className="aria-vis-container" style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#111827', fontWeight: 600 }}>{title || modelName || 'Chart'}</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '16px', borderBottom: '2px solid #f3f4f6', paddingBottom: '8px' }}>
                    {data.map((d, i) => {
                        const val = Object.values(d).find(v => typeof v === 'number') || 0;
                        const label = Object.values(d).find(v => typeof v === 'string') || `Item ${i}`;
                        const maxVal = Math.max(...data.map(item => Object.values(item).find(v => typeof v === 'number') || 0)) || 1;
                        const heightPct = Math.max((val / maxVal) * 100, 2); 
                        
                        return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', group: 'hover' }}>
                                <div style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '4px', fontWeight: 500 }}>₹{val.toLocaleString()}</div>
                                <div style={{ height: `${heightPct}%`, width: '100%', maxWidth: '60px', backgroundColor: '#3b82f6', borderRadius: '6px 6px 0 0', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'} onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}></div>
                                <span style={{ fontSize: '0.75rem', marginTop: '8px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center', fontWeight: 500 }} title={label}>{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="aria-vis-empty">
                <p>No data available to visualize.</p>
            </div>
        );
    }

    const headers = Object.keys(data[0]);

    const filteredData = data.filter(row => 
        Object.values(row).some(val => 
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + filteredData.map(e => headers.map(h => `"${String(e[h]).replace(/"/g, '""')}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${modelName}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (type === 'table' || type === 'list') {
        return (
            <div className="aria-vis-container">
                <div className="aria-vis-header">
                    <h3>{title || modelName || "Data"}</h3>
                    <div className="aria-vis-actions">
                        <div className="aria-vis-search">
                            <Search size={14} />
                            <input 
                                type="text" 
                                placeholder="Search results..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="aria-vis-btn" title="Filter"><Filter size={16} /></button>
                        <button className="aria-vis-btn" onClick={handleExport} title="Export CSV"><Download size={16} /></button>
                    </div>
                </div>
                <div className="aria-vis-table-wrapper">
                    <table className="aria-vis-table">
                        <thead>
                            <tr>
                                {headers.map(h => <th key={h}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, i) => (
                                <tr key={i}>
                                    {headers.map(h => {
                                        let val = row[h];
                                        if (val === null || val === undefined) val = '-';
                                        else if (typeof val === 'object') val = JSON.stringify(val);
                                        const strVal = String(val);
                                        
                                        if (isUUID(strVal)) {
                                            return (
                                                <td key={h}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span title={strVal} style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {strVal.substring(0, 8)}...
                                                        </span>
                                                        <button 
                                                            onClick={() => handleCopy(strVal)}
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                            title="Copy"
                                                        >
                                                            {copiedId === strVal ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        }
                                        return <td key={h}>{strVal}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="aria-vis-footer">
                    Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}.
                </div>
            </div>
        );
    }

    return (
        <div className="aria-vis-empty">
            <p>Unsupported visual type: {type}</p>
        </div>
    );
};

export default AriaVisualizer;
