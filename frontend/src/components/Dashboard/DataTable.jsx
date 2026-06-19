import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const DataTable = ({ title, headers, data, renderRow, onViewAll, emptyText, searchable = true, itemsPerPage = 5 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Naive local search (stringifies the object to find matches)
    const filteredData = searchable && searchTerm 
        ? data.filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()))
        : data;

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="dt-card ui-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="dt-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-heading)' }}>{title}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {searchable && (
                        <div className="dt-search-wrapper" style={{ position: 'relative', width: '240px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                style={{ width: '100%', padding: '8px 12px 8px 32px', fontSize: '13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', outline: 'none' }}
                                className="dt-search"
                            />
                        </div>
                    )}
                    {onViewAll && (
                        <button className="btn-outline" onClick={onViewAll} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-main)' }}>
                            View All
                        </button>
                    )}
                </div>
            </div>
            
            <div className="dt-body" style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
                {filteredData.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        {emptyText || 'No records found'}
                    </div>
                ) : (
                    <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, boxShadow: '0 1px 0 var(--border-subtle)' }}>
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i} style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item, i) => renderRow(item, startIndex + i))}
                        </tbody>
                    </table>
                )}
            </div>

            {filteredData.length > itemsPerPage && (
                <div className="dt-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            disabled={currentPage === 1}
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-light)', background: currentPage === 1 ? '#f1f5f9' : '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                            disabled={currentPage === totalPages}
                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-light)', background: currentPage === totalPages ? '#f1f5f9' : '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#cbd5e1' : '#475569' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
            <style jsx="true">{`
                .dt-table tbody tr {
                    transition: background 0.15s ease;
                }
                .dt-table tbody tr:nth-child(even) {
                    background-color: #fafafa;
                }
                .dt-table tbody tr:hover {
                    background-color: var(--primary-light) !important;
                }
                .dt-table td {
                    padding: 14px 20px;
                    font-size: 13px;
                    border-bottom: 1px solid var(--border-light);
                    color: var(--text-main);
                    vertical-align: middle;
                }
                .dt-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .dt-search:focus {
                    border-color: var(--primary) !important;
                    box-shadow: var(--ring-focus);
                }
            `}</style>
        </div>
    );
};

export default DataTable;
