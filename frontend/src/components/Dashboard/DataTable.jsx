import React from 'react';

const DataTable = ({ title, headers, data, renderRow, onViewAll }) => {
    return (
        <div className="glass-card table-section">
            <div className="table-header-box">
                <h3>{title}</h3>
                {onViewAll && <button className="text-btn" onClick={onViewAll}>View All</button>}
            </div>
            <div className="table-responsive">
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            {headers.map((h, i) => <th key={i}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i}>{renderRow(item)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style jsx="true">{`
                .table-section { padding: 20px; }
                .table-header-box { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
                .text-btn { background: none; color: var(--primary); font-size: 13px; font-weight: 600; }
                .table-responsive { overflow-x: auto; }
                .dashboard-table { width: 100%; border-collapse: collapse; }
                .dashboard-table th { text-align: left; padding: 12px; color: var(--text-muted); font-size: 13px; border-bottom: 1px solid var(--border); }
                .dashboard-table td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
            `}</style>
        </div>
    );
};

export default DataTable;
