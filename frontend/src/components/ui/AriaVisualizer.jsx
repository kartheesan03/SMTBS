import React, { useState } from 'react';
import './AriaVisualizer.css';
import { Search, Download, Filter, Edit2 } from 'lucide-react';

const AriaVisualizer = ({ visualData }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!visualData || !visualData.data) {
        return (
            <div className="aria-vis-empty">
                <p>No data available to visualize.</p>
            </div>
        );
    }

    const { type, modelName, data } = visualData;

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

    if (type === 'table') {
        return (
            <div className="aria-vis-container">
                <div className="aria-vis-header">
                    <h3>{modelName} Data</h3>
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
                                        return <td key={h}>{String(val)}</td>;
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
