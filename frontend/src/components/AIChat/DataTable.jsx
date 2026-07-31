import React from 'react';
import './RichComponents.css';

const DataTable = ({ columns, data }) => {
    if (!data || data.length === 0) return <p className="empty-table">No data available.</p>;

    const keys = columns || Object.keys(data[0]);

    return (
        <div className="ai-data-table-wrapper">
            <table className="ai-data-table">
                <thead>
                    <tr>
                        {keys.map((key, idx) => (
                            <th key={idx}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {keys.map((key, colIndex) => {
                                let val = row[key];
                                // Basic formatting for booleans or nulls
                                if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
                                if (val === null || val === undefined) val = '-';
                                
                                return <td key={colIndex}>{val}</td>;
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
