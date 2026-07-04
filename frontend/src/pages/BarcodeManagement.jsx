import React, { useState, useEffect } from 'react';
import { Package, Search, Camera, QrCode, AlertTriangle, ScanLine, ScanFace } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
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
            status: getStatus(m),
            barcode: m.sku ? `890${m.sku.replace(/\D/g,'').padStart(10, '0')}` : `89012345600${(m.id % 100).toString().padStart(2, '0')}`,
            qr: `SMTBMS-${m.sku || 'MAT-'+m.id}-STD`,
            loc: `Store ${String.fromCharCode(65 + (hash % 4))} / Shelf ${(hash % 5) + 1}`,
            scans: (hash % 50),
            last: new Date(Date.now() - (hash % 10) * 86400000).toLocaleDateString()
        };
    });

    const filteredData = registryData.filter(item => 
        !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalScans = registryData.reduce((acc, curr) => acc + curr.scans, 0);

    // Dynamic Trend generators
    

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
                <div className="rd-kpi-row">
                    <BarcodeKPICard title="Labelled Items" val={totalItems} color="blue" icon={Package} />
                    <BarcodeKPICard title="Total Scans" val={totalScans} color="cyan" icon={ScanLine} />
                    <BarcodeKPICard title="Camera Scans" val={Math.floor(totalScans * 0.4)} color="purple" icon={Camera} />
                    <BarcodeKPICard title="Unlabelled" val="0" color="orange" icon={AlertTriangle} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)', flexWrap: 'wrap', gap: 16}}>
                        <div>
                            <div className="rd-table-title">Barcode & QR Registry</div>
                            <div className="rd-table-subtitle">Click any row to preview label • Live status from Inventory</div>
                        </div>
                        <div className="rd-table-actions" style={{flexWrap: 'wrap'}}>
                            <div className="rd-search-bar" style={{minWidth: 250, flexShrink: 0, background: '#f8fafc'}}>
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
                    
                    <div style={{overflowX: 'auto'}}>
                        <table className="rd-table" style={{ width: '100%' }}>
                        <thead>
                            <tr style={{ background: '#1e293b' }}>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>MAT. ID</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>MATERIAL</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>STOCK STATUS</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>BARCODE NO.</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>QR CODE STRING</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>LOCATION</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>SCANS</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>LAST SCANNED</th>
                                <th style={{ padding: '13px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap', borderBottom: 'none' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>Loading barcode registry...</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{textAlign: 'center', padding: 32, color: '#94a3b8'}}>No materials found matching search</td>
                                </tr>
                            ) : (
                                filteredData.map((item, i) => (
                                    <tr key={item.id || i} style={{cursor: 'pointer'}}>
                                        <td style={{fontWeight: 700, color: '#3b82f6'}}>{item.id}</td>
                                        <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{item.name}</td>
                                        <td>
                                            <span className={`rd-status-badge ${item.status === 'Low Stock' || item.status === 'Out of Stock' ? 'rd-status-orange' : 'rd-status-green'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{color: '#64748b'}}>{item.barcode}</td>
                                        <td style={{color: '#a855f7'}}>{item.qr}</td>
                                        <td style={{color: '#64748b'}}>{item.loc}</td>
                                        <td style={{fontWeight: 700, color: '#0ea5e9'}}>{item.scans}</td>
                                        <td style={{color: '#94a3b8'}}>{item.last}</td>
                                        <td>
                                            <div style={{display: 'flex', gap: 8}}>
                                                <button 
                                                    className="rd-btn-outline" 
                                                    style={{padding: '6px 12px', fontSize: 12, color: '#3b82f6', borderColor: '#bfdbfe', cursor: 'pointer'}}
                                                    onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                                                >
                                                    Preview
                                                </button>
                                                <button 
                                                    className="rd-btn-outline" 
                                                    style={{padding: '6px 12px', fontSize: 12, color: '#10b981', borderColor: '#a7f3d0', cursor: 'pointer'}}
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setPreviewItem(item);
                                                        setTimeout(() => {
                                                            const printContent = document.getElementById('print-area').innerHTML;
                                                            const originalContent = document.body.innerHTML;
                                                            document.body.innerHTML = printContent;
                                                            window.print();
                                                            document.body.innerHTML = originalContent;
                                                            window.location.reload();
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



const BarcodeKPICard = ({ title, val, trend, trendDir, color, data, icon: Icon }) => {
    const colorTokens = {
        blue: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        green: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
        purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
        orange: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
        red: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
        cyan: { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc' },
    };
    
    const theme = colorTokens[color] || colorTokens.blue;

    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
        }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: '#64748b', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px' 
                    }}>
                        {title}
                    </h4>
                    <div style={{ 
                        fontSize: '32px', 
                        fontWeight: 800, 
                        color: '#0f172a',
                        letterSpacing: '-1px',
                        lineHeight: 1
                    }}>
                        {val}
                    </div>
                </div>
                {Icon && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: theme.bg,
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.text
                    }}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Optional Trend or Data */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: theme.text,
                        background: theme.bg,
                        padding: '4px 8px',
                        borderRadius: '6px'
                    }}>
                        {trend} of Total Capacity
                    </div>
                )}
            </div>
            
            {/* Subtle bottom border accent */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: theme.text,
                opacity: 0.8
            }} />
        </div>
    );
};

export default BarcodeManagement;
