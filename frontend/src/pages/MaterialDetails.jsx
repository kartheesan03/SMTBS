import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { 
    Package, AlertTriangle, ArrowLeft, Clock, MapPin, Tag, 
    FileText, Activity, ShieldCheck, Camera, CheckCircle2,
    Truck, Circle, MoveRight, ChevronRight, Hash, Building2, Edit,
    Info, Target, Box, User, Check, Layers, Pencil, ArrowLeftRight, Calendar, Flag, ArrowUpRight, ArrowDownRight, CheckCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MaterialDetails = ({ embeddedId }) => {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const id = embeddedId || paramId;
    const { user } = useContext(AuthContext);
    const currentUserRole = user?.role || 'Employee';

    const [material, setMaterial] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        const fetchMaterialData = async () => {
            try {
                const { data } = await API.get(`/materials/${id}`);
                const timelineRes = await API.get(`/materials/${id}/timeline`).catch(e => ({ data: [] }));
                setTimeline(timelineRes.data || []);
                setMaterial(data);
            } catch (err) {
                console.error("Material details error:", err);
                const errMsg = err.response?.data?.message || 'Failed to load material details.';
                toast.error(errMsg);
                setError(errMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterialData();
    }, [id]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="loader" style={{ width: 40, height: 40, border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>;
    
    if (error || !material) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 24px', maxWidth: '600px', margin: '0 auto' }}>
                <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
                <h2 style={{ marginBottom: '8px', color: '#0f172a' }}>Material Not Found</h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
                <button onClick={() => navigate('/materials')} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                    Back to Inventory
                </button>
            </div>
        );
    }

    const isLowStock = material.quantity <= (material.lowStockThreshold || 10);
    const isOutOfStock = material.quantity === 0;
    const stockStatus = isOutOfStock ? 'Out of stock' : (isLowStock ? 'Low stock' : 'In stock');
    const stockColor = isOutOfStock ? '#dc2626' : (isLowStock ? '#f59e0b' : '#16a34a');
    const stockBg = isOutOfStock ? '#fef2f2' : (isLowStock ? '#fffbeb' : '#f0fdf4');

    // Threshold for live tracking (30 mins)
    const isLive = material.locationUpdatedAt && (Date.now() - new Date(material.locationUpdatedAt).getTime()) < 30 * 60000;
    let locationAge = 'Unknown';
    if (material.locationUpdatedAt) {
        const mins = Math.floor((Date.now() - new Date(material.locationUpdatedAt).getTime()) / 60000);
        if (mins < 60) locationAge = `${mins} min ago`;
        else if (mins < 1440) locationAge = `${Math.floor(mins / 60)} hr ago`;
        else locationAge = `${Math.floor(mins / 1440)} days ago`;
    }

    const specs = material.specs || {};
    const usedIn = material.used_in || [];
    const certs = material.certifications || [];
    
    // Mock shelf photos
    const mockPhotos = [1, 2, 3, 4, 5];

    return (
        <div style={{ padding: embeddedId ? '0' : '32px', maxWidth: 1400, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            {/* Header & Back (Hidden if embedded) */}
            {!embeddedId && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <button 
                        onClick={() => navigate('/materials')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                        <ArrowLeft size={16} /> Back to Inventory
                    </button>
                    
                    {(currentUserRole === 'Admin' || currentUserRole === 'Manager') && (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => alert('Adjust Stock')} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>Adjust Stock</button>
                            <button onClick={() => navigate(`/materials/${material._id || material.id}/edit`)} style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Edit Material</button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .tab-btn {
                    padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; color: #64748b; background: transparent; border: none; outline: none; transition: all 0.2s; display: flex; align-items: center; gap: 8px; border-radius: 6px;
                }
                .tab-btn:hover {
                    color: #0f172a; background: #f1f5f9;
                }
                .tab-btn.active {
                    color: #0f172a; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .card {
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }
                .pill {
                    padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;
                }
                .pill-green { background: #dcfce7; color: #16a34a; }
                .pill-blue { background: #dbeafe; color: #2563eb; }
                .pill-gray { background: #f1f5f9; color: #475569; }
                .icon-value { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; margin-bottom: 8px; }
            `}</style>

            {/* Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 8, marginBottom: 24, width: 'fit-content' }}>
                <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}><Info size={16}/> Details</button>
                <button className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}><Target size={16}/> Tracking</button>
            </div>

            {/* Content Area */}
            {activeTab === 'details' ? (
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Main Column */}
                    <div style={{ flex: '1 1 350px', minWidth: 0 }}>
                        {/* Hero Card */}
                        <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center', position: 'relative' }}>
                            <div style={{ width: 160, height: 160, flexShrink: 0, borderRadius: 12, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                {/* Category-specific icon */}
                                {(() => {
                                    const cat = (material.category || '').toLowerCase();
                                    if (cat.includes('electrical')) return <Target size={64} color="#3b82f6" opacity={0.2} />;
                                    if (cat.includes('metal') || cat.includes('steel')) return <Layers size={64} color="#64748b" opacity={0.2} />;
                                    if (cat.includes('wood') || cat.includes('timber')) return <Box size={64} color="#d97706" opacity={0.2} />;
                                    if (cat.includes('cement')) return <Box size={64} color="#94a3b8" opacity={0.2} />;
                                    return <Package size={64} color="#94a3b8" opacity={0.2} />;
                                })()}
                                {/* Dimension Overlay */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, color: '#334155', border: '1px solid #cbd5e1' }}>
                                            {specs?.Thickness || '50'} mm
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, color: '#334155', border: '1px solid #cbd5e1' }}>
                                            {specs?.Length || '6000'} mm
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className="pill" style={{ background: stockBg, color: stockColor }}><span style={{ width: 6, height: 6, borderRadius: 3, background: stockColor }}></span> {stockStatus}</span>
                                    {material.tags && material.tags.map((t, idx) => (
                                        <span key={idx} className="pill pill-blue">{t}</span>
                                    ))}
                                </div>
                                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{material.name}</h1>
                                <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>{material.category} &middot; SKU: {material.sku || `MAT-${material.id}`}</div>
                                
                                <div style={{ display: 'flex', gap: 24 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Supplier / Source</div>
                                        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><User size={14}/> {material.source || 'Bulk purchase'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Condition</div>
                                        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={14} color="#16a34a"/> {material.condition || 'Good condition'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specs Card */}
                        <div className="card">
                            <h3 style={{ margin: '0 0 20px 0', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Technical specs</h3>
                            
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}><Layers size={14}/> Stock Level</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{material.quantity} / {material.maxCapacity || 1000} {material.unit}</div>
                                </div>
                                <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, (material.quantity / (material.maxCapacity || 1000)) * 100)}%`, height: '100%', background: stockColor, borderRadius: 4 }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                                <div>
                                    <Layers size={16} color="#64748b" style={{ marginBottom: 12 }}/>
                                    <div style={{ fontSize: 16, color: '#0f172a', fontWeight: 700 }}>{material.quantity}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Qty ({material.unit})</div>
                                </div>
                                <div>
                                    <Pencil size={16} color="#64748b" style={{ marginBottom: 12 }}/>
                                    <div style={{ fontSize: 16, color: specs?.Thickness ? '#0f172a' : '#94a3b8', fontWeight: specs?.Thickness ? 700 : 500, fontStyle: specs?.Thickness ? 'normal' : 'italic' }}>{specs?.Thickness || 'N/A'}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Thickness</div>
                                </div>
                                <div>
                                    <FileText size={16} color="#64748b" style={{ marginBottom: 12 }}/>
                                    <div style={{ fontSize: 16, color: specs?.Grade ? '#0f172a' : '#94a3b8', fontWeight: specs?.Grade ? 700 : 500, fontStyle: specs?.Grade ? 'normal' : 'italic' }}>{specs?.Grade || 'N/A'}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Grade</div>
                                </div>
                                <div>
                                    <ArrowLeftRight size={16} color="#64748b" style={{ marginBottom: 12 }}/>
                                    <div style={{ fontSize: 16, color: specs?.Length ? '#0f172a' : '#94a3b8', fontWeight: specs?.Length ? 700 : 500, fontStyle: specs?.Length ? 'normal' : 'italic' }}>{specs?.Length || 'N/A'}</div>
                                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Length</div>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 24 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Last Updated</div>
                                    <div style={{ fontSize: 13, color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14}/> {timeline.length > 0 ? new Date(timeline[0].date).toLocaleDateString() : 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Last Movement</div>
                                    <div style={{ fontSize: 13, color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14}/> {timeline.length > 0 ? timeline[0].action : 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Location Info */}
                        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Location info</h3>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ width: 48, height: 48, background: '#f8fafc', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>21</div>
                                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Jul</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>Current location</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{material.warehouse || 'Unassigned'}{material.rack ? `, Rack ${material.rack}` : ''}</div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', marginTop: 2 }}>{material.shelf ? `Shelf ${material.shelf}` : 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                            <span className="pill pill-green" style={{ alignSelf: 'flex-end', marginBottom: 16 }}>Tracking live</span>
                        </div>

                        {/* Classification Card */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ margin: 0, fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Classification</h3>
                                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{material.category || 'Uncategorized'}</span>
                            </div>
                            
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Used in</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {usedIn.length > 0 ? usedIn.map((u, i) => (
                                        <span key={i} style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{u}{i < usedIn.length - 1 ? '    ' : ''}</span>
                                    )) : <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Not specified</span>}
                                </div>
                            </div>
                            
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Certifications</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {certs.length > 0 ? certs.map((c, i) => (
                                        <span key={i} className="pill pill-blue">{c}</span>
                                    )) : <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>None</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Rail */}
                    <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Stock Worthy */}
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <h3 style={{ margin: 0, fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Stock worthy</h3>
                                <button 
                                    onClick={() => toast.success('Report submitted for administration review.')}
                                    style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, color: '#0f172a', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                    <Flag size={12}/> Report
                                </button>
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{material.auditGrade || 'Unrated'}</div>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>
                                Last audit: {material.lastAuditDate ? new Date(material.lastAuditDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}
                            </div>
                            <p style={{ fontSize: 12, color: '#334155', margin: 0, lineHeight: 1.5 }}>
                                {material.auditNotes || 'No recent audit notes available for this material.'}
                            </p>
                        </div>

                        {/* Shelf Photos */}
                        <div className="card">
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Shelf photos</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                                {(() => {
                                    const validImages = (material.images || []).filter(url => url && !url.includes('unsplash') && !url.includes('placeholder') && !url.includes('picsum'));
                                    if (validImages.length > 0) {
                                        return (
                                            <>
                                                {validImages.slice(0, 3).map((imgUrl, idx) => (
                                                    <img 
                                                        key={idx} 
                                                        src={imgUrl} 
                                                        alt={`Shelf ${idx + 1}`} 
                                                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} 
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ))}
                                                {validImages.length > 3 ? (
                                                    <div style={{ aspectRatio: '1', background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: 14, fontWeight: 700, border: '1px solid #e2e8f0', cursor: 'pointer' }}>+{validImages.length - 3}</div>
                                                ) : (
                                                    Array.from({ length: 4 - validImages.length }).map((_, idx) => (
                                                        <div key={`empty-${idx}`} style={{ aspectRatio: '1', background: '#f8fafc', borderRadius: 8, border: '1px dashed #e2e8f0' }}></div>
                                                    ))
                                                )}
                                            </>
                                        );
                                    } else {
                                        return (
                                            <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13, background: '#f8fafc', borderRadius: 8 }}>
                                                No shelf photos available
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Movement History */}
                        <div className="card">
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Movement history</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {timeline.length > 0 ? timeline.slice(0, 3).map((log, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                        {log.action === 'CREATE' ? <ArrowUpRight size={16} color="#16a34a" style={{ marginTop: 2 }} /> : 
                                         log.action === 'UPDATE' ? <ArrowLeftRight size={16} color="#2563eb" style={{ marginTop: 2 }} /> :
                                         <ArrowDownRight size={16} color="#dc2626" style={{ marginTop: 2 }} />}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{log.description || `${log.action} action performed`}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, {log.time}</div>
                                        </div>
                                        <Check size={14} color="#16a34a" />
                                    </div>
                                )) : (
                                    <div style={{ fontSize: 13, color: '#64748b', padding: '16px 0', textAlign: 'center', background: '#f8fafc', borderRadius: 8 }}>
                                        No movement history found
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Compliance */}
                        <div className="card">
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: '#0f172a', fontWeight: 700 }}>Compliance and certifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="icon-value" style={{ margin: 0, fontSize: 12 }}><Calendar size={14}/> Mill TC date</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>10/06/2026</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="icon-value" style={{ margin: 0, fontSize: 12 }}><Calendar size={14}/> TC expiry</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>10/06/2028</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="icon-value" style={{ margin: 0, fontSize: 12 }}><CheckCircle size={14}/> QC status</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Passed</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="icon-value" style={{ margin: 0, fontSize: 12 }}><Hash size={14}/> Batch no.</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>N/A</div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                // Tracking Tab
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    
                    {/* Live Status Header */}
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                <h2 style={{ margin: 0, fontSize: 20, color: '#0f172a' }}>Active Movement</h2>
                                {isLive ? (
                                    <span style={{ padding: '6px 12px', borderRadius: 99, background: '#dcfce7', color: '#16a34a', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 8, height: 8, borderRadius: 4, background: '#16a34a' }}/> Live Tracking
                                    </span>
                                ) : (
                                    <span style={{ padding: '6px 12px', borderRadius: 99, background: '#f1f5f9', color: '#64748b', fontSize: 13, fontWeight: 700 }}>No active movement</span>
                                )}
                            </div>
                            <div style={{ fontSize: 14, color: '#64748b' }}>Shipment ID: SHP-882910</div>
                        </div>

                        <div style={{ display: 'flex', gap: 32 }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#3b82f6' }}>1</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>In Transit</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>0</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Arriving Soon</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#dc2626' }}>0</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Delayed</div>
                            </div>
                        </div>
                    </div>

                    {/* Route Diagram */}
                    <div className="card" style={{ padding: '40px 32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: 800, margin: '0 auto' }}>
                            {/* Line connecting nodes */}
                            <div style={{ position: 'absolute', top: 24, left: 40, right: 40, height: 4, background: '#e2e8f0', zIndex: 0 }} />
                            <div style={{ position: 'absolute', top: 24, left: 40, width: '45%', height: 4, background: '#3b82f6', zIndex: 1 }} />

                            {/* Node 1: Origin */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: 12 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 26, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '4px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }}>
                                    <Building2 size={24} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{material.warehouse || 'Origin'}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Origin</div>
                                </div>
                            </div>

                            {/* Node 2: Transit */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: 12 }}>
                                <motion.div 
                                    animate={{ y: [0, -6, 0] }} 
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    style={{ width: 52, height: 52, borderRadius: 26, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', border: '4px solid #fff', boxShadow: '0 0 0 2px #3b82f6' }}
                                >
                                    <Truck size={24} />
                                </motion.div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>In Transit</div>
                                    <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>45% Complete</div>
                                </div>
                            </div>

                            {/* Node 3: Destination */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: 12 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 26, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '4px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }}>
                                    <MapPin size={24} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b' }}>{material.deliveryDestination || 'Destination'}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Destination</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="card">
                        <h3 style={{ margin: '0 0 24px 0', fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18}/> Live Activity Feed</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingLeft: 12, borderLeft: '2px solid #e2e8f0', marginLeft: 16 }}>
                            {timeline.length > 0 ? timeline.slice(0, 3).map((log, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: -21, top: 4, width: 14, height: 14, borderRadius: 7, background: i === 0 ? '#3b82f6' : '#94a3b8', border: '3px solid #fff' }} />
                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{log.action}</div>
                                    <div style={{ fontSize: 13, color: '#475569' }}>{log.description || 'System log recorded.'}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{log.time} by {log.user || 'System'}</div>
                                </div>
                            )) : (
                                <div style={{ fontSize: 13, color: '#94a3b8' }}>No activity available</div>
                            )}
                        </div>
                        <div style={{ marginTop: 24, textAlign: 'center' }}>
                            <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View older events</button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default MaterialDetails;
