import React from 'react';
import { Package, Search, Camera, QrCode, AlertTriangle, ScanLine, ScanFace } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import '../components/AdminDashboard/AdminDashboardRedesign.css';
import { RDHeader } from './AdminDashboard';

const BarcodeManagement = () => {
    // Mock data for tiny trend charts
    const trendData1 = [{v: 10},{v: 15},{v: 12},{v: 20},{v: 18},{v: 25},{v: 22}];
    const trendData2 = [{v: 20},{v: 22},{v: 25},{v: 24},{v: 28},{v: 27},{v: 30}];
    const trendData3 = [{v: 5},{v: 4},{v: 8},{v: 6},{v: 10},{v: 8},{v: 12}];
    const trendData4 = [{v: 2},{v: 3},{v: 2},{v: 5},{v: 4},{v: 6},{v: 4}];

    const registryData = [
        { id: 'MAT-013', name: 'Grease Cartridge', status: 'Low Stock', barcode: '8901234560013', qr: 'SMTBMS-MAT-013-STD', loc: 'Store D / Shelf 1', scans: 3, last: '31 May, 02:45 PM' },
        { id: 'MAT-014', name: 'Hydraulic Valve', status: 'In Stock', barcode: '8901234560014', qr: 'SMTBMS-MAT-014-STD', loc: 'Store A / Shelf 2', scans: 12, last: '01 Jun, 09:15 AM' },
        { id: 'MAT-015', name: 'Steel Bearings', status: 'In Stock', barcode: '8901234560015', qr: 'SMTBMS-MAT-015-STD', loc: 'Store B / Shelf 4', scans: 45, last: '02 Jun, 11:30 AM' },
        { id: 'MAT-016', name: 'Conveyor Belt', status: 'In Stock', barcode: '8901234560016', qr: 'SMTBMS-MAT-016-STD', loc: 'Store C / Shelf 1', scans: 8, last: '02 Jun, 04:20 PM' }
    ];

    return (
        <div className="rd-container">
            <RDHeader onRefresh={() => {}} />

            <div className="rd-content">
                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-icon" style={{background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)'}}>
                        <span style={{fontSize: 24, fontWeight: 800}}>B&</span>
                    </div>
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Barcode & QR Management</span>
                            <span className="rd-module-badge" style={{background: '#f3e8ff', color: '#9333ea', borderColor: '#d8b4fe'}}>BARCODE / QR</span>
                        </div>
                        <div className="rd-module-desc">Generate, scan, and manage barcode and QR code labels for all tracked materials.</div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="rd-kpi-row">
                    <BarcodeKPICard title="Labelled Items" val="6" trend="+10%" trendDir="up" color="blue" data={trendData1} icon={Package} />
                    <BarcodeKPICard title="Total Scans" val="124" trend="+18%" trendDir="up" color="cyan" data={trendData2} icon={ScanLine} />
                    <BarcodeKPICard title="Camera Scans" val="0" trend="+0%" trendDir="up" color="purple" data={trendData3} icon={Camera} />
                    <BarcodeKPICard title="Unlabelled" val="0" trend="-12%" trendDir="down" color="orange" data={trendData4} icon={AlertTriangle} />
                </div>

                {/* Table Section */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{borderBottom: '1px solid var(--rd-border)'}}>
                        <div>
                            <div className="rd-table-title">Barcode & QR Registry</div>
                            <div className="rd-table-subtitle">Click any row to preview label • Live status from Inventory</div>
                        </div>
                        <div className="rd-table-actions">
                            <div className="rd-search-bar" style={{width: 250, background: '#f8fafc'}}>
                                <Search size={16} color="#94a3b8" />
                                <input type="text" className="rd-search-input" placeholder="Search material..." />
                            </div>
                            <button className="rd-btn-solid" style={{background: '#a855f7', border: 'none'}}>
                                <Camera size={16} style={{marginRight: 8, verticalAlign: 'middle'}}/>
                                Scan Camera
                            </button>
                            <button className="rd-btn-solid" style={{background: '#38bdf8', border: 'none'}}>
                                + Generate Label
                            </button>
                        </div>
                    </div>
                    
                    <table className="rd-table">
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
                            {registryData.map((item, i) => (
                                <tr key={i} style={{cursor: 'pointer'}}>
                                    <td style={{fontWeight: 700, color: '#3b82f6'}}>{item.id}</td>
                                    <td style={{fontWeight: 700, color: 'var(--rd-text-main)'}}>{item.name}</td>
                                    <td>
                                        <span className={`rd-status-badge ${item.status === 'Low Stock' ? 'rd-status-orange' : 'rd-status-green'}`}>
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
                                            <button className="rd-btn-outline" style={{padding: '6px 12px', fontSize: 12, color: '#3b82f6', borderColor: '#bfdbfe'}}>Preview</button>
                                            <button className="rd-btn-outline" style={{padding: '6px 12px', fontSize: 12, color: '#10b981', borderColor: '#a7f3d0'}}>Print</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const BarcodeKPICard = ({ title, val, trend, trendDir, color, data, icon: Icon }) => {
    // Custom gradient backgrounds for these cards based on the screenshot
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
            {/* The circular blobs in the background */}
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
            <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16}}>
                <div style={{width: '100%', height: 40, position: 'relative', zIndex: 2}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line type="monotone" dataKey="v" stroke="#fff" strokeWidth={3} dot={false} activeDot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{position: 'absolute', bottom: 20, right: 20, textAlign: 'right', zIndex: 1}}>
                    <div style={{fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)'}}>VS LAST MO.</div>
                    <div style={{fontSize: 14, fontWeight: 800, color: '#fff'}}>{trendDir === 'up' ? '+' : ''}{trend}</div>
                </div>
            </div>
        </div>
    );
};

export default BarcodeManagement;
