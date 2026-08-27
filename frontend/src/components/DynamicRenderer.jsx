import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const DynamicTable = ({ title, columns, rows }) => {
    if (!columns || !rows || columns.length === 0) return null;
    return (
        <div className="dynamic-table-container" style={{ margin: '15px 0', overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            {title && <h4 style={{ padding: '10px 15px', margin: 0, borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>{title}</h4>}
            <div className="dynamic-table-wrapper" style={{ padding: '0' }}>
                <table className="dynamic-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{ padding: '12px 15px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} style={{ padding: '12px 15px' }}>{row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const DynamicChart = ({ title, data, xAxisKey, bars }) => {
    if (!data || data.length === 0) return null;
    return (
        <div className="dynamic-chart-container" style={{ margin: '15px 0', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
            {title && <h4 style={{ margin: '0 0 15px 0' }}>{title}</h4>}
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey || Object.keys(data[0] || {})[0]} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {bars && bars.map((bar, i) => (
                            <Bar key={i} dataKey={bar.key} fill={bar.color || '#3b82f6'} name={bar.name || bar.key} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const DynamicCard = ({ title, content, stats }) => {
    return (
        <div className="dynamic-card" style={{ margin: '15px 0', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}>
            {title && <h4 style={{ margin: '0 0 10px 0' }}>{title}</h4>}
            {content && <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)' }}>{content}</p>}
            {stats && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{ backgroundColor: 'var(--bg-primary)', padding: '10px 15px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const DynamicRenderer = ({ data }) => {
    if (!data) return null;
    
    switch (data.type) {
        case 'table':
            return <DynamicTable title={data.title} columns={data.columns} rows={data.rows} />;
        case 'chart':
            return <DynamicChart title={data.title} data={data.data} xAxisKey={data.xAxisKey} bars={data.bars} />;
        case 'card':
        case 'stat':
        case 'stats':
            return <DynamicCard title={data.title} content={data.content} stats={data.stats} />;
        case 'list':
            return (
                <div style={{ margin: '15px 0' }}>
                    {data.title && <h4>{data.title}</h4>}
                    <ul style={{ paddingLeft: '20px' }}>
                        {data.items && data.items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            );
        case 'error':
            return (
                <div style={{ margin: '15px 0', padding: '15px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#b91c1c' }}>
                    <strong>Error:</strong> {data.message || data.reply}
                </div>
            );
        case 'text':
            // The text itself is already streamed above DynamicRenderer in AriaCommandCenter.jsx, 
            // so we don't strictly need to render it again, but if we do, we can just return null or style it.
            // Returning null so it doesn't double-render or show "Unsupported visual data type".
            return null;
        default:
            return <div className="unknown-dynamic-type">Unsupported visual data type: {data.type}</div>;
    }
};

export default DynamicRenderer;
