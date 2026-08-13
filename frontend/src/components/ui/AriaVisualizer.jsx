import React, { useState } from 'react';
import './AriaVisualizer.css';
import { Search, Download, Filter } from 'lucide-react';

const AriaVisualizer = ({ visualData }) => {
    const [searchTerm, setSearchTerm] = useState('');

    if (!visualData || !visualData.data || visualData.data.length === 0) {
        return (
            <div className="aria-vis-empty">
                <p>No data available to visualize.</p>
            </div>
        );
    }

    const { type, modelName, data } = visualData;
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
                                    {headers.map(h => (
                                        <td key={h}>{String(row[h] !== null && row[h] !== undefined ? row[h] : '-')}</td>
                                    ))}
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
