import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, WifiOff, Clock, Eye, History, Search, RefreshCw, X, Loader, ArrowRight, Radio } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../api/axios';
import { PastelKPICard, PastelKPIGrid } from '../components/PastelKPICard';
import '../components/AdminDashboard/AdminDashboardRedesign.css';

// ─── GPS status helpers ────────────────────────────────────────────────────────
const GPS_STATUS = {
    ACTIVE:      { label: 'Active',      color: '#10b981', bg: '#d1fae5', badgeClass: 'rd-status-green'  },
    STATIONARY:  { label: 'Stationary',  color: '#f59e0b', bg: '#fef3c7', badgeClass: 'rd-status-orange' },
    SIGNAL_LOST: { label: 'Signal Lost', color: '#ef4444', bg: '#fee2e2', badgeClass: 'rd-status-red'    },
};

const GPS_STATUS_EVENTS = ['Arrived', 'Departed', 'Signal Check', 'Status Change', 'Manual Log'];
const EVENT_ICONS       = { 'Arrived': '📍', 'Departed': '🚚', 'Signal Check': '📡', 'Status Change': '🔄', 'Manual Log': '📝' };

const getGPSStatus = (hash) => {
    const s = hash % 10;
    if (s < 5) return 'ACTIVE';
    if (s < 8) return 'STATIONARY';
    return 'SIGNAL_LOST';
};

// ─── Deterministic trail builder ──────────────────────────────────────────────
const buildTrail = (hash) => {
    const locs = [
        { lat: 12.9716, lng: 77.5946 }, { lat: 12.9750, lng: 77.5900 }, { lat: 12.9680, lng: 77.5990 },
        { lat: 12.9790, lng: 77.6050 }, { lat: 12.9600, lng: 77.5850 },
    ];
    const count = (hash % 3) + 2;
    const trail = [];
    let prev = hash;
    for (let i = 0; i < count; i++) {
        const idx = (prev * 31 + 7) % locs.length;
        trail.push(locs[idx]);
        prev = idx * 17 + hash;
    }
    const withJitter = [];
    trail.forEach((pt, i) => {
        withJitter.push(pt);
        if (i < trail.length - 1) {
            const next = trail[i + 1];
            withJitter.push({
                lat: (pt.lat + next.lat) / 2 + (((hash * (i + 3)) % 8) - 4) * 0.0005,
                lng: (pt.lng + next.lng) / 2 + (((hash * (i + 5)) % 8) - 4) * 0.0005,
            });
        }
    });
    return withJitter;
};

// ─── Deterministic movement history builder ───────────────────────────────────
// Generates a realistic-looking, per-item chronological log (newest first)
const buildHistory = (item) => {
    const hash = item._hash;
    const locLabels = GPS_MAP_LOCATIONS.map(l => l.label);
    const eventCount = (hash % 4) + (item.status === 'SIGNAL_LOST' ? 0 : 3); // 3–6 events; 0 for signal lost
    if (eventCount === 0) return [];

    const now = Date.now();
    const events = [];
    let minutesBack = 0;
    let prevLoc = item.locLabel;

    for (let i = 0; i < eventCount; i++) {
        minutesBack += ((hash * (i + 2)) % 90) + 10;
        const eventType = GPS_STATUS_EVENTS[(hash + i * 7) % GPS_STATUS_EVENTS.length];
        const nextLocIdx = (hash + i * 13) % locLabels.length;
        const nextLoc = locLabels[nextLocIdx];
        const ts = new Date(now - minutesBack * 60000);

        events.push({
            id:        `evt-${item.id}-${i}`,
            timestamp: ts,
            timeLabel: ts.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            event:     eventType,
            from:      prevLoc,
            to:        eventType === 'Departed' || eventType === 'Arrived' ? nextLoc : prevLoc,
            coords:    `${(10 + (hash + i) % 5).toFixed(3)}°N, ${(76 + (hash + i) % 4).toFixed(3)}°E`,
            speed:     item.status === 'ACTIVE' || i > 1 ? `${((hash + i * 3) % 40) + 5} km/h` : '0 km/h',
        });

        if (eventType === 'Departed' || eventType === 'Arrived') prevLoc = nextLoc;
    }
    return events; // newest first (already in descending time order because minutesBack grows)
};

// ─── Map locations (referenced in buildHistory so must be defined before it) ──
const GPS_MAP_LOCATIONS = [
    { id: 'A', label: 'Warehouse A', lat: 12.9716, lng: 77.5946 },
    { id: 'B', label: 'Store B',     lat: 12.9750, lng: 77.5900 },
    { id: 'C', label: 'Site C',      lat: 12.9680, lng: 77.5990 },
    { id: 'D', label: 'Yard D',      lat: 12.9790, lng: 77.6050 },
    { id: 'E', label: 'Transit',     lat: 12.9600, lng: 77.5850 },
];

// ─── Movement History Modal ────────────────────────────────────────────────────
const MovementHistoryModal = ({ item, onClose }) => {
    const [historyItems, setHistoryItems] = useState(null); // null = loading
    const backdropRef = useRef(null);

    // Simulate async fetch of movement history
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            await new Promise(res => setTimeout(res, 420));
            if (!cancelled) setHistoryItems(buildHistory(item));
        };
        load();
        return () => { cancelled = true; };
    }, [item.id]); // re-fetch when item changes

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === backdropRef.current) onClose();
    };

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const st = GPS_STATUS[item.status];

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(15,23,42,0.45)',
                backdropFilter: 'blur(3px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
                animation: 'modalFadeIn 0.18s ease-out',
            }}
        >
            <style>{`
                @keyframes modalFadeIn  { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
                @keyframes spin         { to { transform: rotate(360deg); } }
                @keyframes gpsPulse     { 0%,100% { opacity:0.35; transform:scale(0.8); } 70% { opacity:0; transform:scale(2); } }
                @keyframes trailDraw    { from { stroke-dashoffset:200; } to { stroke-dashoffset:0; } }
                .gps-btn-action { transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s; border-radius:7px; outline:none; }
                .gps-btn-action:hover:not(:disabled) { opacity:0.85; transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,0.12); }
                .gps-btn-action:active:not(:disabled) { transform:scale(0.96); opacity:0.7; }
                .gps-btn-action:disabled { opacity:0.42; cursor:not-allowed; }
                .hist-event-row:hover { background: #f8fafc; }
            `}</style>

            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Movement history for ${item.name}`}
                style={{
                    background: 'var(--rd-card-bg, #fff)',
                    borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                    width: '100%',
                    maxWidth: 560,
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Modal header */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid var(--rd-border, #e2e8f0)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0,
                }}>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>
                            Movement History
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--rd-text-main, #1e293b)', lineHeight: 1.2 }}>
                            {item.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.id}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, padding: '2px 8px', borderRadius: 99 }}>
                                {st.label}
                            </span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>Device: {item.device}</span>
                        </div>
                    </div>
                    <button
                        className="gps-btn-action"
                        onClick={onClose}
                        style={{ padding: '6px', background: '#f1f5f9', border: 'none', cursor: 'pointer', borderRadius: 8, color: '#64748b', display: 'flex', alignItems: 'center' }}
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Timeline content */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px 24px' }}>
                    {historyItems === null ? (
                        /* Loading skeleton */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[1, 2, 3].map(n => (
                                <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ height: 12, borderRadius: 6, background: '#f1f5f9', width: `${50 + n * 15}%` }} />
                                        <div style={{ height: 10, borderRadius: 6, background: '#f8fafc', width: '70%' }} />
                                    </div>
                                </div>
                            ))}
                            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Loading history…
                            </div>
                        </div>
                    ) : historyItems.length === 0 ? (
                        /* Empty state */
                        <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <History size={22} style={{ color: '#cbd5e1' }} />
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--rd-text-main, #1e293b)', fontSize: 14 }}>No movement history</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 260 }}>
                                {item.status === 'SIGNAL_LOST'
                                    ? 'This device lost signal before any movement data could be logged.'
                                    : 'No location events have been recorded for this material yet.'}
                            </div>
                        </div>
                    ) : (
                        /* Timeline */
                        <div style={{ position: 'relative' }}>
                            {/* Vertical line */}
                            <div style={{
                                position: 'absolute', left: 13, top: 14, bottom: 14,
                                width: 2, background: 'linear-gradient(to bottom, #e2e8f0 0%, #f1f5f9 100%)',
                            }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {historyItems.map((evt, idx) => {
                                    const isFirst = idx === 0;
                                    const isMoved = evt.from !== evt.to;
                                    return (
                                        <div
                                            key={evt.id}
                                            className="hist-event-row"
                                            style={{
                                                display: 'flex', gap: 14, alignItems: 'flex-start',
                                                padding: '10px 8px 10px 0',
                                                borderBottom: idx < historyItems.length - 1 ? '1px solid #f8fafc' : 'none',
                                                transition: 'background 0.12s',
                                                borderRadius: 8,
                                            }}
                                        >
                                            {/* Timeline dot */}
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                                background: isFirst ? st.color : '#e2e8f0',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 13, zIndex: 1,
                                                boxShadow: isFirst ? `0 0 0 4px ${st.color}20` : 'none',
                                            }}>
                                                {EVENT_ICONS[evt.event] || '📍'}
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                {/* Event type + timestamp */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: isFirst ? st.color : 'var(--rd-text-main, #1e293b)' }}>
                                                        {evt.event}
                                                        {isFirst && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: st.color, background: st.bg, padding: '1px 6px', borderRadius: 99 }}>Latest</span>}
                                                    </span>
                                                    <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{evt.timeLabel}</span>
                                                </div>

                                                {/* Location from → to */}
                                                {isMoved ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 600 }}>{evt.from}</span>
                                                        <ArrowRight size={12} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                                        <span style={{ fontWeight: 700, color: 'var(--rd-text-main, #1e293b)' }}>{evt.to}</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                                                        <span style={{ fontWeight: 600 }}>{evt.from}</span>
                                                    </div>
                                                )}

                                                {/* Coords + speed */}
                                                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8' }}>
                                                    <span style={{ fontFamily: 'monospace' }}>{evt.coords}</span>
                                                    <span>· {evt.speed}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                <div style={{
                    padding: '14px 24px', borderTop: '1px solid var(--rd-border, #e2e8f0)',
                    display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0,
                    background: 'var(--rd-card-bg, #fff)',
                }}>
                    <span style={{ fontSize: 11, color: '#94a3b8', alignSelf: 'center', marginRight: 'auto' }}>
                        {historyItems !== null ? `${historyItems.length} event${historyItems.length !== 1 ? 's' : ''} logged` : ''}
                    </span>
                    <button
                        className="gps-btn-action rd-btn-outline"
                        onClick={onClose}
                        style={{ padding: '7px 18px', fontSize: 12, cursor: 'pointer', border: '1px solid var(--rd-border, #e2e8f0)', background: 'transparent', color: '#64748b', fontWeight: 600 }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Map pin SVG ───────────────────────────────────────────────────────────────
const MapPinSVG = ({ color = '#10b981', size = 22, pulsing = false }) => (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {pulsing && (
            <span style={{ position: 'absolute', width: size + 12, height: size + 12, borderRadius: '50%', background: color, opacity: 0.18, animation: 'gpsPulse 1.8s ease-out infinite' }} />
        )}
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    </span>
);

// ─── Map Updater for FlyTo ───────────────────────────────────────────────────
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 15, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
};

// ─── Schematic map (now Real Map) ─────────────────────────────────────────────
const SchematicMap = ({ items, selectedId, onSelect, activeTrail }) => {
    const defaultCenter = [12.9716, 77.5946];
    const [mapCenter, setMapCenter] = useState(defaultCenter);
    
    const pinMap = {};
    items.forEach(item => {
        const loc = GPS_MAP_LOCATIONS[item.locIndex];
        if (!pinMap[loc.id]) pinMap[loc.id] = [];
        pinMap[loc.id].push(item);
    });
    const trailPoints = activeTrail ? activeTrail.map(p => [p.lat, p.lng]) : null;

    useEffect(() => {
        if (selectedId) {
            const selectedItem = items.find(i => i.id === selectedId);
            if (selectedItem) {
                const loc = GPS_MAP_LOCATIONS[selectedItem.locIndex];
                setMapCenter([loc.lat, loc.lng]);
            }
        }
    }, [selectedId, items]);

    return (
        <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', border: '1px solid var(--rd-border, #e2e8f0)', height: 400 }}>
            <MapContainer center={defaultCenter} zoom={13} style={{ width: '100%', height: '100%', zIndex: 1 }} zoomControl={true}>
                <MapUpdater center={mapCenter} zoom={15} />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {trailPoints && (
                    <Polyline positions={trailPoints} pathOptions={{ color: '#6366f1', weight: 3, dashArray: '5, 5' }} />
                )}
                
                {GPS_MAP_LOCATIONS.map(loc => {
                    const group = pinMap[loc.id] || [];
                    if (group.length === 0) return null;
                    const primaryStatus = group[0].status;
                    const st = GPS_STATUS[primaryStatus];
                    const isSelected = group.some(i => i.id === selectedId);
                    
                    const markerHtml = `
                        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
                            ${(isSelected || primaryStatus === 'ACTIVE') ? `<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; border: 2px solid ${isSelected ? '#6366f1' : st.color}; animation: gpsPulse 1.8s ease-out infinite;"></div>` : ''}
                            <div style="width: 14px; height: 14px; background: #ffffff; border: ${isSelected ? 4 : 3}px solid ${st.color}; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
                            ${group.length > 1 ? `<div style="position: absolute; top: -4px; right: -4px; background: #0f172a; color: white; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: bold; border: 1px solid white;">${group.length}</div>` : ''}
                        </div>
                    `;

                    const customIcon = L.divIcon({
                        html: markerHtml,
                        className: 'custom-gps-marker',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });

                    return (
                        <Marker 
                            key={loc.id} 
                            position={[loc.lat, loc.lng]} 
                            icon={customIcon}
                            eventHandlers={{
                                click: () => {
                                    if (onSelect) onSelect(group[0]);
                                    setMapCenter([loc.lat, loc.lng]);
                                }
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} className="gps-map-tooltip">
                                <span style={{ fontWeight: 600, color: '#1e293b' }}>{loc.label}</span>
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>
            
            {/* Redesigned Legend */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', zIndex: 10, backdropFilter: 'blur(4px)' }}>
                {Object.entries(GPS_STATUS).map(([key, s]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffffff', border: `2.5px solid ${s.color}`, flexShrink: 0 }}/>
                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{s.label}</span>
                    </div>
                ))}
                {activeTrail && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid #e2e8f0', paddingLeft: 12 }}>
                        <span style={{ width: 14, height: 2, background: '#6366f1', borderRadius: 2, flexShrink: 0 }}/>
                        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 700 }}>Trail Active</span>
                    </div>
                )}
            </div>
            
            <style>{`
                .custom-gps-marker {
                    background: none;
                    border: none;
                }
                .gps-map-tooltip {
                    background: #ffffff;
                    border: 1px solid #cbd5e1;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    border-radius: 4px;
                    padding: 2px 8px;
                    font-size: 11px;
                }
                .leaflet-control-zoom {
                    border: 1px solid #e2e8f0 !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                    border-radius: 8px !important;
                    overflow: hidden;
                }
                .leaflet-control-zoom a {
                    color: #475569 !important;
                }
            `}</style>
        </div>
    );
};

// ─── Reusable action button ────────────────────────────────────────────────────
const ActionBtn = ({ onClick, loading, disabled, color, borderColor, bg, icon: Icon, children, title: tipTitle }) => (
    <button
        className="gps-btn-action"
        disabled={disabled || loading}
        onClick={onClick}
        title={tipTitle}
        style={{
            padding: '5px 10px', fontSize: 11,
            color:       (disabled || loading) ? '#94a3b8' : color,
            borderColor: (disabled || loading) ? '#e2e8f0'  : borderColor,
            background:  bg || 'transparent',
            cursor:      (disabled || loading) ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap', border: '1px solid', fontWeight: 600,
        }}
    >
        {loading
            ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }}/>
            : <Icon size={12}/>
        }
        {children}
    </button>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const GPSTracking = () => {
    const [materials, setMaterials]         = useState([]);
    const [loading, setLoading]             = useState(true);
    const [searchTerm, setSearchTerm]       = useState('');
    const [selectedItem, setSelectedItem]   = useState(null);
    const [lastRefresh, setLastRefresh]     = useState(new Date());

    // Trail state
    const [activeTrailItem, setActiveTrailItem]     = useState(null);
    const [activeTrailPoints, setActiveTrailPoints] = useState(null);
    const [trailLoadingId, setTrailLoadingId]       = useState(null);

    // History modal state
    const [historyModalItem, setHistoryModalItem]   = useState(null);  // null = closed

    const detailPanelRef = useRef(null);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/materials');
            setMaterials(data || []);
        } catch (err) {
            console.error('Failed to fetch materials:', err);
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    };
    useEffect(() => { fetchMaterials(); }, []);

    // Derive GPS items
    const gpsItems = materials.map(m => {
        const hash     = String(m.id || m._id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const status   = getGPSStatus(hash);
        const locIndex = hash % GPS_MAP_LOCATIONS.length;
        const loc      = GPS_MAP_LOCATIONS[locIndex];
        const minsAgo  = status === 'SIGNAL_LOST' ? (hash % 60) + 30 : (hash % 15) + 1;
        return {
            id:         m.sku || `MAT-${m.id}`,
            _rawId:     m.id || m._id,
            name:       m.name,
            status,
            locLabel:   loc.label,
            locIndex,
            coords:     `${(10 + (hash % 5)).toFixed(4)}°N, ${(76 + (hash % 4)).toFixed(4)}°E`,
            minsAgo,
            lastSignal: new Date(Date.now() - minsAgo * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            device:     `GPS-${(hash % 900) + 100}`,
            speed:      status === 'ACTIVE' ? `${(hash % 40) + 5} km/h` : '0 km/h',
            hasHistory: status !== 'SIGNAL_LOST',
            _hash:      hash,
        };
    });

    const total      = gpsItems.length;
    const active     = gpsItems.filter(i => i.status === 'ACTIVE').length;
    const stationary = gpsItems.filter(i => i.status === 'STATIONARY').length;
    const signalLost = gpsItems.filter(i => i.status === 'SIGNAL_LOST').length;

    const filtered = gpsItems.filter(item =>
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ── VIEW handler: select item + scroll detail panel into view ────────────
    const handleView = useCallback((e, item) => {
        e.stopPropagation();
        setSelectedItem(item);
        setTimeout(() => {
            detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
    }, []);

    // ── TRAIL handler: async load → polyline on map, toggle ─────────────────
    const handleTrail = useCallback(async (e, item) => {
        e.stopPropagation();
        if (activeTrailItem?.id === item.id) {
            setActiveTrailItem(null);
            setActiveTrailPoints(null);
            return;
        }
        setTrailLoadingId(item.id);
        setActiveTrailPoints(null);
        setActiveTrailItem(null);
        await new Promise(res => setTimeout(res, 380));
        setActiveTrailItem(item);
        setActiveTrailPoints(buildTrail(item._hash));
        setSelectedItem(item);
        setTrailLoadingId(null);
        setTimeout(() => {
            detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);
    }, [activeTrailItem]);

    // ── HISTORY handler: open movement history modal for this item ───────────
    const handleViewHistory = useCallback((e, item) => {
        e && e.stopPropagation();
        setHistoryModalItem(item);
    }, []);

    const closeHistory = useCallback(() => setHistoryModalItem(null), []);

    // Table style tokens
    const th = { padding: '11px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap', borderBottom: 'none', background: 'var(--rd-table-head-bg, #f8fafc)' };
    const stickyLeft  = { ...th, position: 'sticky', left: 0,  zIndex: 2, boxShadow: '2px 0 6px -2px rgba(0,0,0,0.08)' };
    const stickyRight = { ...th, position: 'sticky', right: 0, zIndex: 2, textAlign: 'left', boxShadow: '-2px 0 6px -2px rgba(0,0,0,0.08)' };
    const tdBase      = { padding: '10px 10px', fontSize: 12, verticalAlign: 'middle' };
    const stickyLeftTd  = { ...tdBase, position: 'sticky', left: 0,  zIndex: 1, background: 'var(--rd-card-bg, #fff)', boxShadow: '2px 0 6px -2px rgba(0,0,0,0.07)' };
    const stickyRightTd = { ...tdBase, position: 'sticky', right: 0, zIndex: 1, background: 'var(--rd-card-bg, #fff)', boxShadow: '-2px 0 6px -2px rgba(0,0,0,0.07)' };

    return (
        <div className="rd-container">
            {/* Movement History Modal — rendered at top level so it's above all content */}
            {historyModalItem && (
                <MovementHistoryModal item={historyModalItem} onClose={closeHistory} />
            )}

            <div className="rd-content">
                <style>{`
                    @keyframes spin      { to { transform: rotate(360deg); } }
                    @keyframes gpsPulse  { 0%,100%{opacity:.35;transform:scale(.8)} 70%{opacity:0;transform:scale(2)} }
                    @keyframes trailDraw { from{stroke-dashoffset:200} to{stroke-dashoffset:0} }
                    .gps-btn-action { transition:opacity .15s,transform .1s,box-shadow .15s; border-radius:7px; outline:none; }
                    .gps-btn-action:hover:not(:disabled) { opacity:.85; transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.12); }
                    .gps-btn-action:active:not(:disabled) { transform:scale(.96); opacity:.7; }
                    .gps-btn-action:disabled { opacity:.42; cursor:not-allowed; }
                    .gps-row { transition:background .12s; }
                    .gps-row:hover { background:var(--rd-hover-bg,#f8fafc)!important; cursor:pointer; }
                    .gps-table::-webkit-scrollbar { height:5px; }
                    .gps-table::-webkit-scrollbar-track { background:transparent; }
                    .gps-table::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
                    @media(max-width:900px){.gps-col-sec{display:none}}
                `}</style>

                {/* Module Header */}
                <div className="rd-module-header">
                    <div className="rd-module-info">
                        <div className="rd-module-title-row">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="rd-module-title">GPS Tracking</span>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)', animation: 'gpsPulse 1.5s infinite' }}></span>
                                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Live</span>
                            </div>
                            <span className="rd-module-badge">MATERIAL TRACKING</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                            Live location tracking of materials &amp; equipment
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            Refreshed {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                            className="gps-btn-action rd-btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', border: '1px solid var(--rd-border, #e2e8f0)' }}
                            onClick={fetchMaterials}
                        >
                            <RefreshCw size={13}/> Refresh
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <PastelKPIGrid>
                    <PastelKPICard title="Total Tracked" value={total}      colorTheme="blue"   icon={MapPin}     trendValue="Materials with GPS tags"                                                    trendPositive={true}/>
                    <PastelKPICard title="In Transit"    value={active}     colorTheme="mint"   icon={Navigation} trendValue={`${total ? Math.round((active/total)*100) : 0}% currently moving`}          trendPositive={true}/>
                    <PastelKPICard title="Stationary"    value={stationary} colorTheme="yellow" icon={Clock}      trendValue={`${total ? Math.round((stationary/total)*100) : 0}% at a location`}         trendPositive={null}/>
                    <PastelKPICard title="Signal Lost"   value={signalLost} colorTheme="peach"  icon={WifiOff}    trendValue={`${total ? Math.round((signalLost/total)*100) : 0}% offline`}               trendPositive={signalLost === 0}/>
                </PastelKPIGrid>

                {/* Map + Detail panel */}
                <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                    {/* Map card */}
                    <div className="rd-chart-card" style={{ flex: 2, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}>Live Map View</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--rd-text-main, #1e293b)' }}>
                                    Material Locations
                                    {activeTrailItem && (
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginLeft: 10, background: '#eef2ff', padding: '2px 9px', borderRadius: 99 }}>
                                            Trail: {activeTrailItem.name}
                                            <button onClick={() => { setActiveTrailItem(null); setActiveTrailPoints(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 5px', color: '#6366f1', verticalAlign: 'middle', lineHeight: 1 }} title="Clear trail">
                                                <X size={11}/>
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#10b981', background: '#d1fae5', padding: '3px 10px', borderRadius: 99 }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'gpsPulse 1.8s ease-out infinite' }}/>
                                Live
                            </span>
                        </div>
                        <SchematicMap items={gpsItems} selectedId={selectedItem?.id} onSelect={setSelectedItem} activeTrail={activeTrailPoints}/>
                    </div>

                    {/* Detail panel */}
                    <div ref={detailPanelRef} className="rd-chart-card" style={{ flex: '0 0 260px', padding: 20, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 14 }}>
                            Item Detail
                        </div>

                        {selectedItem ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <MapPinSVG color={GPS_STATUS[selectedItem.status].color} size={28} pulsing={selectedItem.status === 'ACTIVE'}/>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--rd-text-main, #1e293b)', lineHeight: 1.2 }}>{selectedItem.name}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{selectedItem.id}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <span className={`rd-status-badge ${GPS_STATUS[selectedItem.status].badgeClass}`}>
                                        {GPS_STATUS[selectedItem.status].label}
                                    </span>
                                </div>

                                {[
                                    ['Location',    selectedItem.locLabel],
                                    ['Coordinates', selectedItem.coords],
                                    ['Speed',       selectedItem.speed],
                                    ['Last Signal', selectedItem.lastSignal],
                                    ['Device ID',   selectedItem.device],
                                ].map(([label, val]) => (
                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--rd-border, #f1f5f9)' }}>
                                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
                                        <span style={{ fontSize: 11, color: 'var(--rd-text-main, #1e293b)', fontWeight: 600, textAlign: 'right', maxWidth: 130, wordBreak: 'break-all' }}>{val}</span>
                                    </div>
                                ))}

                                {/* ── Action buttons in detail panel ── */}
                                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {/* Trail toggle */}
                                    <button
                                        className="gps-btn-action"
                                        disabled={!selectedItem.hasHistory && activeTrailItem?.id !== selectedItem.id}
                                        onClick={e => handleTrail(e, selectedItem)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: 6, padding: '7px 0', fontSize: 12, cursor: 'pointer',
                                            background: activeTrailItem?.id === selectedItem.id ? '#eef2ff' : 'transparent',
                                            color:  activeTrailItem?.id === selectedItem.id ? '#6366f1' : '#64748b',
                                            border: `1px solid ${activeTrailItem?.id === selectedItem.id ? '#c7d2fe' : 'var(--rd-border, #e2e8f0)'}`,
                                            fontWeight: 600,
                                        }}
                                        title={!selectedItem.hasHistory ? 'No trail data — signal lost' : undefined}
                                    >
                                        {trailLoadingId === selectedItem.id
                                            ? <><Loader size={13} style={{ animation: 'spin 0.8s linear infinite' }}/> Loading trail…</>
                                            : activeTrailItem?.id === selectedItem.id
                                                ? <><X size={13}/> Clear Trail</>
                                                : <><Radio size={13}/> View on Map</>
                                        }
                                    </button>

                                    {/* ── View Movement History button ── */}
                                    <button
                                        className="gps-btn-action"
                                        onClick={e => handleViewHistory(e, selectedItem)}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            gap: 6, padding: '7px 0', fontSize: 12, cursor: 'pointer',
                                            background: '#f8fafc',
                                            color: '#475569',
                                            border: '1px solid var(--rd-border, #e2e8f0)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        <History size={13}/> View Movement History
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 220 }}>
                                <MapPin size={32} style={{ color: '#cbd5e1' }}/>
                                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                                    Click a pin on the map or a row in the table to view details
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="rd-table-card">
                    <div className="rd-table-header" style={{ borderBottom: '1px solid var(--rd-border)' }}>
                        <div>
                            <div className="rd-table-title">
                                Tracked Items <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>(Live GPS Registry)</span>
                            </div>
                            <div className="rd-table-subtitle">All materials with active GPS devices</div>
                        </div>
                        <div className="rd-table-actions">
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}/>
                                <input
                                    type="text"
                                    placeholder="Search items…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid var(--rd-border, #e2e8f0)', borderRadius: 8, fontSize: 12, outline: 'none', background: 'var(--rd-card-bg, #fff)', color: 'var(--rd-text-main, #1e293b)', width: 200 }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rd-table-scroll">
                        <table className="rd-table gps-table rd-table-responsive" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                            <thead>
                                    <tr style={{ background: 'var(--rd-table-head-bg, #f8fafc)' }}>
                                        <th>MAT. ID</th>
                                        <th>MATERIAL</th>
                                        <th>STATUS</th>
                                        <th style={{ textAlign: 'right', width: 140 }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading GPS data…</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No items found</td></tr>
                                    ) : filtered.map(item => {
                                        const st             = GPS_STATUS[item.status];
                                        const isSelected     = selectedItem?.id === item.id;
                                        const isTrailActive  = activeTrailItem?.id === item.id;
                                        const isTrailLoading = trailLoadingId === item.id;
                                        const rowBg          = isTrailActive ? '#f5f3ff' : isSelected ? 'var(--rd-hover-bg,#f8fafc)' : undefined;
                                        const cellBg         = isTrailActive ? '#f5f3ff' : isSelected ? 'var(--rd-hover-bg,#f8fafc)' : 'var(--rd-card-bg,#fff)';

                                        return (
                                            <tr key={item.id} className="gps-row" onClick={() => setSelectedItem(item)} style={{ background: rowBg }}>
                                                <td style={{ fontWeight: 700, color: '#3b82f6', background: cellBg }} data-label="Mat. ID">{item.id}</td>
                                                <td style={{ fontWeight: 600, color: 'var(--rd-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }} data-label="Material">{item.name}</td>
                                                <td data-label="Status">
                                                    <span className={`ui-badge ${item.status === 'ACTIVE' ? 'success' : item.status === 'STATIONARY' ? 'warning' : 'danger'}`}>
                                                        {st.label}
                                                    </span>
                                                </td>

                                                {/* ACTION — 3 buttons: View, Trail, History */}
                                                <td style={{ background: cellBg, textAlign: 'right' }} data-label="Action">
                                                    <div style={{ display: 'inline-flex', gap: 5 }}>
                                                        {/* VIEW: focus detail panel */}
                                                        <ActionBtn
                                                            icon={Eye}
                                                            color="#3b82f6"
                                                            borderColor="#bfdbfe"
                                                            onClick={e => handleView(e, item)}
                                                            title="Focus item in detail panel"
                                                        >
                                                            View
                                                        </ActionBtn>

                                                        {/* TRAIL: draw polyline on map (toggle) */}
                                                        <ActionBtn
                                                            icon={isTrailActive ? X : Radio}
                                                            color={isTrailActive ? '#6366f1' : '#8b5cf6'}
                                                            borderColor={isTrailActive ? '#c7d2fe' : '#ddd6fe'}
                                                            bg={isTrailActive ? '#eef2ff' : undefined}
                                                            loading={isTrailLoading}
                                                            disabled={!item.hasHistory && !isTrailActive}
                                                            onClick={e => handleTrail(e, item)}
                                                            title={!item.hasHistory ? 'No GPS trail — signal lost' : isTrailActive ? 'Clear trail from map' : 'Show movement trail on map'}
                                                        >
                                                            {isTrailActive ? 'Clear' : 'Trail'}
                                                        </ActionBtn>

                                                        {/* HISTORY: open movement log modal */}
                                                        <ActionBtn
                                                            icon={History}
                                                            color="#0ea5e9"
                                                            borderColor="#bae6fd"
                                                            onClick={e => handleViewHistory(e, item)}
                                                            title="View full movement history log"
                                                        >
                                                            History
                                                        </ActionBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                </div>

            </div>
        </div>
    );
};

export default GPSTracking;
