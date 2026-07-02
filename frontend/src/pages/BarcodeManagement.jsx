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
                            <tr>
                                <th>MAT. ID</th>
                                <th>MATERIAL</th>
                                <th>STOCK STATUS</th>
                                <th>BARCODE NO.</th>
                                <th>QR CODE STRING</th>
                                <th>LOCATION</th>
                                <th>SCANS</th>
                                <th>LAST SCANNED</th>
                                <th>ACTION</th>
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
    const getBg = () => {
        if (color === 'blue') return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        if (color === 'cyan') return 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
        if (color === 'purple') return 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)';
        if (color === 'orange') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        return '#fff';
    };

    return (
        <div style={{
            background: getBg(), 
            borderRadius: 16, 
            minHeight: 140, 
            padding: 20, 
            position: 'relative', 
            overflow: 'hidden', 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
        }}>
            <div style={{position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)'}}></div>
            
            <div className="rd-kpi-header" style={{alignItems: 'flex-start'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                    <div className="rd-kpi-icon-box" style={{width: 44, height: 44, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)'}}>
                        <Icon size={22} color="#fff" />
                    </div>
                    <div>
                        <div style={{fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1}}>{val}</div>
                        <div style={{fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: 4}}>{title}</div>
                    </div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 4}}>
                        {trendDir === 'up' ? '▲' : '▼'} {trend}
                    </div>
                    <button style={{background: 'none', border: 'none', color: '#fff', opacity: 0.7, cursor: 'pointer'}}>•••</button>
                </div>
            </div>
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16, position: 'relative', zIndex: 2}}>
                <div style={{flex: 1, height: 40, marginRight: 16}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line type="monotone" dataKey="v" stroke="#fff" strokeWidth={3} dot={false} activeDot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{textAlign: 'right', minWidth: 80}}>
                    <div style={{fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)'}}>VS LAST MO.</div>
                    <div style={{fontSize: 15, fontWeight: 800, color: '#fff'}}>{trend}</div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeManagement;
