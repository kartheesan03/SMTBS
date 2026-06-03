import React from 'react';

const DataTable = ({ title, headers, data, renderRow, onViewAll }) => {
    return (
        <div className="dt-card">
            <div className="dt-header">
                <h3 className="dt-title">{title}</h3>
                {onViewAll && <button className="dt-view-all" onClick={onViewAll}>View All</button>}
            </div>
            <div className="dt-body">
                {data.length === 0 ? (
                    <div className="dt-empty">
                        <p>No records found</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="dt-table">
                            <thead>
                                <tr>
                                    {headers.map((h, i) => <th key={i}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, i) => renderRow(item, i))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style jsx="true">{`
                .dt-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg, 16px);
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }
                .dt-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 18px 20px;
                    border-bottom: 1px solid var(--border);
                }
                .dt-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                }
                .dt-view-all {
                    background: none;
                    color: var(--primary);
                    font-size: 13px;
                    font-weight: 600;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: background 0.15s;
                }
                .dt-view-all:hover {
                    background: var(--primary-light);
                }
                .dt-body {
                    overflow-x: auto;
                }
                .dt-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .dt-table th {
                    padding: 12px 20px;
                    text-align: left;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: #f8fafc;
                    border-bottom: 1px solid var(--border);
                }
                .dt-table td {
                    padding: 14px 20px;
                    font-size: 14px;
                    border-bottom: 1px solid #f1f5f9;
                    color: var(--text-primary);
                }
                .dt-table tbody tr:hover td {
                    background: #fafbfd;
                }
                .dt-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .dt-empty {
                    padding: 40px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 14px;
                }
            `}</style>
        </div>
    );
};

export default DataTable;
