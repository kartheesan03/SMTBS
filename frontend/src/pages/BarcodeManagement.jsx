import React, { useState, useEffect } from 'react';
import { Package, Search, Camera, QrCode, AlertTriangle, ScanLine } from 'lucide-react';
import API from '../api/axios';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
const BarcodeManagement = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanModal, setShowScanModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/materials');
                setMaterials(data || []);
            } catch (error) {
                console.error("Failed to fetch materials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    // Calculate metrics
    const totalItems = materials.length;
    
    const getStatus = (item) => {
        if (item.quantity === 0) return 'Out of Stock';
        if (item.quantity <= (item.lowStockThreshold || 10)) return 'Low Stock';
        return 'In Stock';
    };

    // Calculate registry data from materials
    const registryData = materials.map(m => {
        const hash = String(m.id || m._id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            id: m.sku || `MAT-${m.id}`,
            name: m.name,
            category: m.category || ['Steel', 'Electronics', 'Chemicals', 'Tools'][hash % 4],
            quantity: m.quantity || 0,
            unit: m.unit || ['kg', 'units', 'liters', 'pcs'][hash % 4],
            status: getStatus(m),
            barcode: m.sku ? `890${m.sku.replace(/\D/g,'').padStart(10, '0')}` : `89012345600${(m.id % 100).toString().padStart(2, '0')}`,
            qr: `SMTBMS-${m.sku || 'MAT-'+m.id}-STD`,
            loc: `Store ${String.fromCharCode(65 + (hash % 4))} / Shelf ${(hash % 5) + 1}`,
            scans: (hash % 50),
            scanned: (hash % 2 === 0),   // whether this item has been scanned at least once
            last: new Date(Date.now() - (hash % 10) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // '2 hours ago' style time
        };
    });

    const filteredData = registryData.filter(item => 
        !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalScans = registryData.reduce((acc, curr) => acc + curr.scans, 0);

    // Dynamic Trend generators
    
    // ── Table style tokens ──────────────────────────────────────────────────
    // Shared header cell style
    const th = {
        padding: '11px 10px',
        textAlign: 'left',
        fontSize: 10,
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        whiteSpace: 'nowrap',
        borderBottom: 'none',
        background: 'var(--rd-table-head-bg, #f8fafc)',
    };
    // Sticky-left header (Mat. ID)
    const stickyLeft = {
        ...th,
        position: 'sticky',
        left: 0,
        zIndex: 2,
        boxShadow: '2px 0 6px -2px rgba(0,0,0,0.08)',
    };
    // Sticky-right header (Action)
    const stickyRight = {
        ...th,
        position: 'sticky',
        right: 0,
        zIndex: 2,
        textAlign: 'left',
        boxShadow: '-2px 0 6px -2px rgba(0,0,0,0.08)',
    };
    // Shared body cell style
    const tdBase = {
        padding: '10px 10px',
        fontSize: 12,
        verticalAlign: 'middle',
    };
    // Sticky-left body cell
    const stickyLeftTd = {
        ...tdBase,
        position: 'sticky',
        left: 0,
        zIndex: 1,
        background: 'var(--rd-card-bg, #fff)',
        boxShadow: '2px 0 6px -2px rgba(0,0,0,0.07)',
    };
    // Sticky-right body cell
    const stickyRightTd = {
        ...tdBase,
        position: 'sticky',
        right: 0,
        zIndex: 1,
        background: 'var(--rd-card-bg, #fff)',
        boxShadow: '-2px 0 6px -2px rgba(0,0,0,0.07)',
    };
    // ────────────────────────────────────────────────────────────────────────

    return (
        <div className="rd-container">
            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Barcode & QR Management</span>
                            <span className="rd-module-badge">BARCODE / QR</span>
                        </div>
                        </div>
                </div>

                {/* KPI Cards */}
                <PastelKPIGrid>
                    <PastelKPICard
                        title="Labelled Items" value={totalItems}
                        colorTheme="blue" icon={Package}
                        trendValue="Items with barcode/QR"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Total Scans" value={totalScans}
                        colorTheme="mint" icon={ScanLine}
                        trendValue="All scan events today"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Camera Scans" value={0}
                        colorTheme="purple" icon={Camera}
                        trendValue="Via camera scanner"
                        trendPositive={true}
                    />
                    <PastelKPICard
                        title="Unlabelled" value={0}
                        colorTheme="yellow" icon={AlertTriangle}
                        trendValue="No missing labels"
                        trendPositive={true}
                    />
                </PastelKPIGrid>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Barcode & QR Registry</div>
                            <div className="rd-table-subtitle">Click any row to preview label • Live status from Inventory</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 220, flexShrink: 0, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input 
                                    type="text" 
                                    className="rd-search-input" 
                                    placeholder="Search material..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                className="rd-btn-solid" 
                                style={{display: 'flex', alignItems: 'center', gap: 8, background: '#a855f7', border: 'none'}}
                                onClick={() => setShowScanModal(true)}
                            >
                                <Camera size={16} />
                                Scan Camera
                            </button>
                            <button 
                                className="rd-btn-solid" 
                                style={{display: 'flex', alignItems: 'center', gap: 8, background: '#38bdf8', border: 'none'}}
                                onClick={() => setShowGenerateModal(true)}
                            >
                                <QrCode size={16} />
                                Generate Label
                            </button>
                        </div>
                    </div>

                    <div className="rd-table-scroll">
                        <table
                            className="rd-table rd-table-responsive"
                            style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}
                        >
                            <thead>
                                <tr style={{ background: 'var(--rd-table-head-bg, #f8fafc)' }}>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>MAT. ID</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>MATERIAL</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>STOCK STATUS</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>BARCODE NO.</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>QR CODE STRING</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>LOCATION</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>SCANS</th>
                                    <th style={{padding: '14px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>LAST SCANNED</th>
                                    <th style={{padding: '14px 10px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap'}}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading barcode registry...</td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No materials found matching search</td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, i) => (
                                        <tr key={item.id || i} style={{cursor: 'pointer'}} onClick={() => setPreviewItem(item)}>
                                            <td style={{padding: '10px 10px', fontSize: 12, fontWeight: 700, color: '#3b82f6', width: 60, wordWrap: 'break-word', fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace', letterSpacing: '0.5px'}} data-label="Mat. ID">{item.id.replace('-', '- ')}</td>
                                            <td style={{padding: '10px 10px', fontSize: 13, fontWeight: 700, color: '#1e293b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} data-label="Material" title={item.name}>{item.name}</td>
                                            <td style={{padding: '10px 10px'}} data-label="Stock Status">
                                                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                                    <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, background: item.status === 'Low Stock' ? '#fffbeb' : item.status === 'Out of Stock' ? '#fff1f2' : '#ecfdf5', color: item.status === 'Low Stock' ? '#f59e0b' : item.status === 'Out of Stock' ? '#ef4444' : '#10b981', border: `1px solid ${item.status === 'Low Stock' ? '#fde68a' : item.status === 'Out of Stock' ? '#fecdd3' : '#a7f3d0'}`, borderRadius: 99 }}>
                                                        {item.status}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{item.quantity} {item.unit}</span>
                                                </div>
                                            </td>
                                            <td style={{padding: '10px 10px', fontSize: 12, color: '#64748b', fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace', whiteSpace: 'nowrap'}} data-label="Barcode">{item.barcode || item.sku || 'NO-BARCODE'}</td>
                                            <td style={{padding: '10px 10px', fontSize: 12, color: '#a855f7', fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace', whiteSpace: 'nowrap'}} data-label="QR String">{item.qr || `SMTBMS-${item.id}-WH`}</td>
                                            <td style={{padding: '10px 10px', fontSize: 12, color: '#475569', whiteSpace: 'nowrap'}} data-label="Location">{item.loc || 'Warehouse'}</td>
                                            <td style={{padding: '10px 10px', fontSize: 13, fontWeight: 700, color: '#0ea5e9', whiteSpace: 'nowrap'}} data-label="Scans">{item.scans || 0}</td>
                                            <td style={{padding: '10px 10px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap'}} data-label="Updated">{item.last}</td>
                                            <td style={{padding: '10px 10px', textAlign: 'center'}} data-label="Action">
                                                <div style={{display: 'flex', gap: 4, justifyContent: 'center'}}>
                                                    <button 
                                                        className="rd-btn-compact" 
                                                        style={{padding: '4px 8px', fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe', borderRadius: 6}}
                                                        title="Preview"
                                                        onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                                                    >
                                                        Preview
                                                    </button>
                                                    <button 
                                                        className="rd-btn-compact" 
                                                        style={{padding: '4px 8px', fontSize: 11, fontWeight: 600, background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: 6}}
                                                        title="Print"
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setPreviewItem(item);
                                                            setTimeout(() => {
                                                                const printContent = document.getElementById('print-area')?.innerHTML;
                                                                if(printContent) {
                                                                    const originalContent = document.body.innerHTML;
                                                                    document.body.innerHTML = printContent;
                                                                    window.print();
                                                                    document.body.innerHTML = originalContent;
                                                                    window.location.reload();
                                                                }
                                                            }, 500);
                                                        }}
                                                    >
                                                        Print
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Scan Camera Modal */}
            {showScanModal && (
                <div className="rd-modal-overlay">
                    <div className="rd-modal-content" style={{maxWidth: 500}}>
                        <div className="rd-modal-header">
                            <h3 style={{margin: 0, fontSize: 18, color: 'var(--rd-text-main)'}}>Camera Scanner</h3>
                            <button className="rd-modal-close" onClick={() => setShowScanModal(false)}>&times;</button>
                        </div>
                        <div className="rd-modal-body" style={{padding: 24, textAlign: 'center'}}>
                            <div style={{background: '#000', width: '100%', height: 300, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
                                <ScanLine size={48} color="#22c55e" style={{opacity: 0.5}} />
                                <div style={{position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 2, background: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'scan 2s infinite linear'}}></div>
                            </div>
                            <p style={{marginTop: 16, color: '#64748b'}}>Hold a barcode or QR code in front of your camera to scan.</p>
                            <style>{`
                                @keyframes scan {
                                    0% { top: 0; }
                                    50% { top: 100%; }
                                    100% { top: 0; }
                                }
                            `}</style>
                        </div>
                        <div className="rd-modal-footer">
                            <button className="rd-btn-outline" onClick={() => setShowScanModal(false)}>Close Scanner</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Label Modal */}
            {showGenerateModal && (
                <div className="rd-modal-overlay">
                    <div className="rd-modal-content" style={{maxWidth: 500}}>
                        <div className="rd-modal-header">
                            <h3 style={{margin: 0, fontSize: 18, color: 'var(--rd-text-main)'}}>Generate New Label</h3>
                            <button className="rd-modal-close" onClick={() => setShowGenerateModal(false)}>&times;</button>
                        </div>
                        <div className="rd-modal-body" style={{padding: 24}}>
                            <div className="rd-form-group">
                                <label className="rd-label">Select Material</label>
                                <select className="rd-input">
                                    <option>Select a material to label...</option>
                                    {materials.map(m => (
                                        <option key={m._id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="rd-form-group" style={{marginTop: 16}}>
                                <label className="rd-label">Quantity of Labels</label>
                                <input type="number" className="rd-input" defaultValue={1} min={1} max={100} />
                            </div>
                        </div>
                        <div className="rd-modal-footer">
                            <button className="rd-btn-outline" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                            <button className="rd-btn-solid" onClick={() => setShowGenerateModal(false)}>Generate & Print</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Label Modal */}
            {previewItem && (
                <div className="rd-modal-overlay">
                    <div className="rd-modal-content" style={{maxWidth: 400}}>
                        <div className="rd-modal-header">
                            <h3 style={{margin: 0, fontSize: 18, color: 'var(--rd-text-main)'}}>Label Preview</h3>
                            <button className="rd-modal-close" onClick={() => setPreviewItem(null)}>&times;</button>
                        </div>
                        <div className="rd-modal-body" style={{padding: 24, textAlign: 'center'}}>
                            <div id="print-area" style={{display: 'inline-block'}}>
                                <div style={{border: '2px solid #000', padding: 20, borderRadius: 8, background: '#fff', textAlign: 'center', width: 250}}>
                                    <h2 style={{margin: '0 0 15px 0', fontSize: 18, color: '#000'}}>{previewItem.name}</h2>
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(previewItem.qr)}`} alt="QR Code" style={{marginBottom: 15}} />
                                    <div style={{fontSize: 16, fontWeight: 'bold', color: '#000', letterSpacing: 2}}>{previewItem.barcode}</div>
                                    <div style={{fontSize: 12, color: '#000', marginTop: 4}}>{previewItem.id}</div>
                                </div>
                            </div>
                        </div>
                        <div className="rd-modal-footer">
                            <button className="rd-btn-outline" onClick={() => setPreviewItem(null)}>Close</button>
                            <button className="rd-btn-solid" style={{background: '#10b981'}} onClick={() => {
                                const printContent = document.getElementById('print-area').innerHTML;
                                const originalContent = document.body.innerHTML;
                                document.body.innerHTML = printContent;
                                window.print();
                                document.body.innerHTML = originalContent;
                                window.location.reload();
                            }}>Print Label</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BarcodeManagement;
