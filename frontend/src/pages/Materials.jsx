import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, XCircle, Eye, Plus, CheckCircle, MapPin, Radio } from 'lucide-react';
import LocationTag from '../components/LocationTag';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { DataTable } from '../components/ui';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Returns a human-readable relative time string from a Date/string. */
const relativeTime = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return '—';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

/** GPS status badge config */
const GPS_STATUS_CONFIG = {
    'At Warehouse': { color: '#10b981', bg: '#d1fae5', label: 'At Warehouse' },
    'In Transit':   { color: '#f59e0b', bg: '#fef3c7', label: 'In Transit' },
    'Delivered':    { color: '#3b82f6', bg: '#dbeafe', label: 'Delivered'     },
    'Signal Lost':  { color: '#ef4444', bg: '#fee2e2', label: 'Signal Lost'},
};

const GpsStatusBadge = ({ status }) => {
    const cfg = GPS_STATUS_CONFIG[status] || { color: '#94a3b8', bg: '#f1f5f9', label: status || '—' };
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            color: cfg.color, background: cfg.bg, display: 'inline-flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap'
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
            {cfg.label}
        </span>
    );
};

// ── Main component ─────────────────────────────────────────────────────────────

const Materials = () => {
    const navigate = useNavigate();
    const [materialsData, setMaterialsData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/materials');
            setMaterialsData(data);
        } catch (error) {
            console.error("Failed to fetch materials:", error);
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleDelete = async (row) => {
        const id = row._id || row.id;
        if (!id) return toast.error("Invalid item ID");
        if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
            try {
                await API.delete(`/materials/${id}`);
                toast.success("Material deleted successfully");
                fetchMaterials();
            } catch (error) {
                console.error("Failed to delete:", error);
                toast.error(error.response?.data?.message || "Failed to delete material");
            }
        }
    };

    const getComputedStatus = (item) => {
        if (item.quantity === 0) return 'Out of Stock';
        if (item.quantity <= (item.lowStockThreshold || 10)) return 'Low Stock';
        return 'In Stock';
    };

    const columns = [
        {
            key: 'sku',
            label: 'MAT. ID',
            sortable: true,
            render: (val) => <span style={{ fontWeight: 700, color: '#3b82f6', cursor: 'pointer', fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace', letterSpacing: '0.5px' }}>{val}</span>
        },
        {
            key: 'name',
            label: 'MATERIAL NAME',
            sortable: true,
            render: (val, row) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{val}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{row.movementsCount || 0} movements recorded</span>
                </div>
            )
        },
        {
            key: 'category',
            label: 'CATEGORY',
            sortable: true,
            render: (val) => <span style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: 99, display: 'inline-block' }}>{val || '—'}</span>
        },
        {
            key: 'quantity',
            label: 'QTY',
            sortable: true,
            align: 'right',
            render: (val) => (
                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{val}</span>
            )
        },
        {
            key: 'unit',
            label: 'UNIT',
            sortable: true,
            render: (val, row) => (
                <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>{val || row.unit || 'units'}</span>
            )
        },
        {
            key: 'location',
            label: 'LOCATION',
            sortable: true,
            render: (val, row) => {
                const displayLoc = row.warehouse ? `${row.warehouse} / ${row.shelf || 'No Shelf'}` : (val || null);
                if (!displayLoc) return <span style={{ color: '#cbd5e1', fontSize: 13, fontStyle: 'italic' }}>Not set</span>;
                return <span style={{ color: '#334155', fontSize: 13 }}>{displayLoc}</span>;
            }
        },
        {
            key: 'status',
            label: 'STATUS',
            render: (_, row) => {
                const status = getComputedStatus(row);
                let bg = '#ecfdf5', color = '#10b981', border = '#a7f3d0';
                if (status === 'Low Stock') { bg = '#fffbeb'; color = '#f59e0b'; border = '#fde68a'; }
                else if (status === 'Out of Stock') { bg = '#fff1f2'; color = '#ef4444'; border = '#fecdd3'; }
                return <span style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, background: bg, color, border: `1px solid ${border}`, borderRadius: 99 }}>{status}</span>;
            }
        },

        {
            key: 'locationUpdatedAt',
            label: 'LAST UPDATED',
            render: (val, row) => {
                const ts = val || row.updatedAt;
                return (
                    <span style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {relativeTime(ts) === 'Just now' ? 'Just now' : relativeTime(ts)}
                    </span>
                );
            }
        },
        {
            key: 'action',
            label: 'ACTIONS',
            align: 'center',
            render: (_, row) => (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button
                        className="rd-btn-compact"
                        style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6, background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); navigate(`/materials/${row._id || row.id}`); }}
                    >
                        Edit
                    </button>
                    <button
                        className="rd-btn-compact"
                        style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6, background: '#fff1f2', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                    >
                        Del
                    </button>
                    <button
                        className="rd-btn-compact"
                        style={{ padding: '4px 8px', fontSize: 12, borderRadius: 6, background: '#ecfeff', color: '#06b6d4', border: '1px solid #cffafe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Track"
                        onClick={(e) => { e.stopPropagation(); navigate(`/tracking-overview?search=${encodeURIComponent(row.sku || row.name)}`); }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                    </button>
                </div>
            )
        }
    ];

    const totalItems  = materialsData.length;
    const inStock     = materialsData.filter(m => getComputedStatus(m) === 'In Stock').length;
    const lowStock    = materialsData.filter(m => getComputedStatus(m) === 'Low Stock').length;
    const outOfStock  = materialsData.filter(m => getComputedStatus(m) === 'Out of Stock').length;

    return (
        <div className="rd-container">
            <div className="rd-content">
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <span className="rd-module-title">Inventory Management</span>
                            <span className="rd-module-badge">INVENTORY</span>
                        </div>
                    </div>
                </div>

                <PastelKPIGrid>
                    <PastelKPICard
                        title="Total Items" value={totalItems}
                        colorTheme="blue" icon={Package}
                        trendValue="Inventory tracking active"
                        trendPositive={true}
                        onClick={() => navigate('/materials')}
                    />
                    <PastelKPICard
                        title="In Stock" value={inStock}
                        colorTheme="mint" icon={CheckCircle}
                        trendValue={`${totalItems ? Math.round((inStock / totalItems) * 100) : 0}% of inventory`}
                        trendPositive={true}
                        onClick={() => navigate('/materials')}
                    />
                    <PastelKPICard
                        title="Low Stock" value={lowStock}
                        colorTheme="yellow" icon={AlertTriangle}
                        trendValue={`${totalItems ? Math.round((lowStock / totalItems) * 100) : 0}% need attention`}
                        trendPositive={false}
                        onClick={() => navigate('/materials')}
                    />
                    <PastelKPICard
                        title="Out of Stock" value={outOfStock}
                        colorTheme="peach" icon={XCircle}
                        trendValue={`${totalItems ? Math.round((outOfStock / totalItems) * 100) : 0}% critical`}
                        trendPositive={false}
                        onClick={() => navigate('/materials')}
                    />
                </PastelKPIGrid>

                <div style={{ marginTop: '24px' }}>
                    {loading ? (
                        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ height: 20, width: 150, background: '#e2e8f0', borderRadius: 4, marginBottom: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                    <div style={{ height: 14, width: 250, background: '#f1f5f9', borderRadius: 4, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                </div>
                                <div style={{ height: 38, width: 120, background: '#e2e8f0', borderRadius: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                            </div>
                            <div style={{ padding: '24px' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{ height: 40, background: '#f8fafc', borderRadius: 8, marginBottom: 12, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <DataTable
                            title="Inventory Register"
                            subtitle="Comprehensive list of all materials — location, GPS status, and quantity from a single source of truth"
                            columns={columns}
                            data={materialsData}
                            searchPlaceholder="Search by item code or name..."
                            expandableRowRender={(row) => (
                                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', fontSize: '13px', color: '#475569' }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>Supplier Info</div>
                                        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{row.vendor?.name || 'Local Vendor'}</div>
                                        <div style={{ color: '#64748b' }}>{row.vendor?.contactPerson || 'Contact'} • {row.vendor?.phone || '+91 0000000000'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>Barcode Data</div>
                                        <div style={{ fontFamily: '"SFMono-Regular", Consolas, monospace', background: '#f1f5f9', padding: '6px 12px', borderRadius: 6, display: 'inline-block', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 500 }}>
                                            {row.sku}-{row._id ? String(row._id).substring(0, 6) : (row.id ? String(row.id).substring(0, 6) : '100A')}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>Location Details</div>
                                        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>{row.warehouse || 'Not Assigned'}{row.shelf ? ` / ${row.shelf}` : ''}</div>
                                        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            GPS: <GpsStatusBadge status={row.gpsStatus} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>Stock History</div>
                                        <div style={{ marginBottom: 4, display: 'flex', gap: 8 }}>
                                            <span style={{ color: '#64748b' }}>Location updated:</span> 
                                            <span style={{ fontWeight: 600, color: '#334155' }}>{relativeTime(row.locationUpdatedAt)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span style={{ color: '#64748b' }}>Record updated:</span> 
                                            <span style={{ fontWeight: 600, color: '#334155' }}>{relativeTime(row.updatedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            primaryAction={{
                                label: 'Add Material',
                                icon: Plus,
                                onClick: () => navigate('/materials/new')
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Materials;
