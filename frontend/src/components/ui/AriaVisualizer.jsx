import React, { useState, useMemo } from 'react';
import { Search, Download, FileText, BarChart3, PieChart } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    if (typeof val === 'number' && isNaN(val)) return '-';
    if (typeof val === 'object') {
        try { return JSON.stringify(val); } catch { return '-'; }
    }
    return String(val);
};

const AriaVisualizer = ({ visualData }) => {
    if (!visualData || !visualData.data || visualData.data.length === 0) {
        return null;
    }

    const { type, modelName, data } = visualData;
    const headers = Object.keys(data[0]);

    // Heuristics for determining visualization type
    const determineRenderType = () => {
        if (data.length === 1 && headers.length <= 4) {
            // Probably summary KPIs
            const allNumeric = headers.every(h => !isNaN(parseFloat(data[0][h])));
            if (allNumeric || headers.length <= 4) return 'kpi';
        }
        
        if (data.length > 1 && data.length < 20) {
            // Let's see if we have a string/date column and numeric columns for a chart
            const stringCols = headers.filter(h => isNaN(parseFloat(data[0][h])));
            const numericCols = headers.filter(h => !isNaN(parseFloat(data[0][h])));
            
            if (stringCols.length === 1 && numericCols.length >= 1) {
                // Good candidate for a chart. If it's time-series, maybe Line. Otherwise Bar/Pie.
                const categoryCol = stringCols[0];
                const isDate = categoryCol.toLowerCase().includes('date') || categoryCol.toLowerCase().includes('month') || categoryCol.toLowerCase().includes('year');
                
                if (isDate && numericCols.length === 1) return 'line';
                if (numericCols.length === 1 && data.length <= 6) return 'pie';
                return 'bar';
            }
        }
        
        return 'table'; // Default
    };

    const renderType = determineRenderType();

    // Export Handler
    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + data.map(e => headers.map(h => `"${formatValue(e[h]).replace(/"/g, '""')}"`).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${modelName || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (renderType === 'kpi') {
        return (
            <div className="aria-smart-response">
                <div className="aria-sr-header">
                    <span className="aria-sr-title"><FileText size={16} /> Summary</span>
                </div>
                <div className="aria-kpi-grid">
                    {headers.map(h => (
                        <div key={h} className="aria-kpi-card">
                            <div className="aria-kpi-value">{data[0][h]}</div>
                            <div className="aria-kpi-label">{h}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (renderType === 'bar' || renderType === 'line' || renderType === 'pie') {
        const stringCols = headers.filter(h => isNaN(parseFloat(data[0][h])));
        const numericCols = headers.filter(h => !isNaN(parseFloat(data[0][h])));
        const xAxisKey = stringCols[0];

        // Ensure numbers are actually numbers for Recharts
        const chartData = data.map(row => {
            const newRow = { ...row };
            numericCols.forEach(c => newRow[c] = parseFloat(row[c]) || 0);
            return newRow;
        });

        return (
            <div className="aria-smart-response">
                <div className="aria-sr-header">
                    <span className="aria-sr-title">
                        {renderType === 'pie' ? <PieChart size={16} /> : <BarChart3 size={16} />} 
                        {modelName || 'Analytics'}
                    </span>
                </div>
                <div className="aria-chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        {renderType === 'line' ? (
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px'}} />
                                {numericCols.map((col, i) => (
                                    <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]} strokeWidth={3} dot={{r: 4, fill: COLORS[i % COLORS.length], strokeWidth: 0}} />
                                ))}
                            </LineChart>
                        ) : renderType === 'pie' ? (
                            <RechartsPie data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px'}} />
                                <Pie dataKey={numericCols[0]} nameKey={xAxisKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} data={chartData}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </RechartsPie>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px'}} />
                                {numericCols.map((col, i) => (
                                    <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // Default to Smart Table
    return <AriaSmartTable modelName={modelName} data={data} headers={headers} onExport={handleExport} />;
};

const AriaSmartTable = ({ modelName, data, headers, onExport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(row => 
            Object.values(row).some(val => 
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="aria-smart-response">
            <div className="aria-st-header">
                <span className="aria-sr-title"><FileText size={16} /> {modelName || 'Data Table'}</span>
                <div className="aria-st-controls">
                    <div className="aria-st-search">
                        <Search size={14} color="#64748b" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <button onClick={onExport} title="Export CSV" style={{background:'none',border:'none',cursor:'pointer',color:'#64748b',padding:'4px'}}>
                        <Download size={16} />
                    </button>
                </div>
            </div>
            <div className="aria-st-wrapper">
                <table className="aria-st-table">
                    <thead>
                        <tr>
                            {headers.map(h => <th key={h}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? currentData.map((row, i) => (
                            <tr key={i}>
                                {headers.map(h => (
                                    <td key={h}>{formatValue(row[h])}</td>
                                ))}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={headers.length} style={{textAlign: 'center', padding: '24px', color: '#94a3b8'}}>
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="aria-st-footer">
                    <span>Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} records</span>
                    <div className="aria-st-pagination">
                        <button className="aria-st-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                        <span style={{padding: '4px 8px'}}>{currentPage} / {totalPages}</span>
                        <button className="aria-st-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AriaVisualizer;
