import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Search, ArrowLeft, PackagePlus, PackageMinus, CheckCircle, AlertTriangle, Info, Camera, Box } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { PageContainer, PageHeader, DetailViewContainer } from '../components/ui';

// Simple CSS for the scanner viewfinder
const scannerStyles = `
.scanner-viewport {
    position: relative;
    width: 100%;
    max-width: 320px;
    aspect-ratio: 1;
    margin: 0 auto 32px;
    background: #0f172a;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
}

.scanner-frame {
    position: absolute;
    inset: 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
}

.scanner-corner {
    position: absolute;
    width: 32px;
    height: 32px;
    border-color: #10b981;
    border-style: solid;
    border-width: 0;
}

.sc-tl { top: -2px; left: -2px; border-top-width: 4px; border-left-width: 4px; border-top-left-radius: 12px; }
.sc-tr { top: -2px; right: -2px; border-top-width: 4px; border-right-width: 4px; border-top-right-radius: 12px; }
.sc-bl { bottom: -2px; left: -2px; border-bottom-width: 4px; border-left-width: 4px; border-bottom-left-radius: 12px; }
.sc-br { bottom: -2px; right: -2px; border-bottom-width: 4px; border-right-width: 4px; border-bottom-right-radius: 12px; }

.laser-line {
    position: absolute;
    left: 10%;
    right: 10%;
    height: 2px;
    background: #10b981;
    box-shadow: 0 0 12px 2px rgba(16, 185, 129, 0.6);
}

.pulse-overlay {
    position: absolute;
    inset: 0;
    background: rgba(16, 185, 129, 0.2);
    pointer-events: none;
}
`;

const EmployeeScanner = () => {
    const [scanState, setScanState] = useState('scanning'); // 'scanning', 'found', 'not-found', 'processing'
    const [scannedId, setScannedId] = useState('');
    const [material, setMaterial] = useState(null);
    const [actionType, setActionType] = useState('inward'); // 'inward', 'outward'
    const [quantity, setQuantity] = useState(1);
    const inputRef = useRef(null);

    useEffect(() => {
        // Inject styles
        const styleSheet = document.createElement("style");
        styleSheet.innerText = scannerStyles;
        document.head.appendChild(styleSheet);
        return () => styleSheet.remove();
    }, []);

    const handleSimulatedScan = async (e) => {
        e.preventDefault();
        if (!scannedId.trim()) return;

        setScanState('processing');
        
        try {
            // Find material by SKU or exact ID. 
            // In a real app, you might have a dedicated /materials/barcode/:barcode endpoint
            const { data } = await API.get('/materials/list');
            const found = data.find(m => 
                (m.sku && m.sku.toLowerCase() === scannedId.toLowerCase()) || 
                (m._id === scannedId)
            );

            if (found) {
                // Fetch full details just in case
                const fullData = await API.get(`/materials/${found._id}`);
                setMaterial(fullData.data);
                setScanState('found');
                toast.success('Material Found!');
            } else {
                setMaterial(null);
                setScanState('not-found');
                toast.error('Barcode not recognized');
            }
        } catch (err) {
            console.error(err);
            setMaterial(null);
            setScanState('not-found');
            toast.error('Error looking up barcode');
        }
    };

    const handleStockAction = async () => {
        if (!material) return;
        
        try {
            // We'll calculate the new stock and send a PUT request.
            // Using the existing update endpoint: /api/materials/:id
            const newQuantity = actionType === 'inward' 
                ? material.quantity + Number(quantity) 
                : material.quantity - Number(quantity);

            if (newQuantity < 0) {
                toast.error("Insufficient stock for outward operation.");
                return;
            }

            const updatedData = { quantity: newQuantity };
            
            await API.put(`/materials/${material._id}`, updatedData);
            
            toast.success(`Successfully ${actionType === 'inward' ? 'added to' : 'removed from'} stock!`);
            
            // Reset scanner
            setScanState('scanning');
            setScannedId('');
            setMaterial(null);
            setQuantity(1);
            
            // Focus input again for next scan
            setTimeout(() => inputRef.current?.focus(), 100);

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update stock');
        }
    };

    return (
        <PageContainer>
            <PageHeader 
                title="Barcode Scanner" 
                subtitle="Scan inventory tags to view details or process stock movements."
            />

            <DetailViewContainer>
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 0' }}>
                    
                    <AnimatePresence mode="wait">
                        
                        {/* STATE 1: SCANNING */}
                        {(scanState === 'scanning' || scanState === 'not-found' || scanState === 'processing') && (
                            <motion.div 
                                key="scanning-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                style={{ textAlign: 'center' }}
                            >
                                {/* Scanner Animation Viewport */}
                                <div className="scanner-viewport">
                                    <div style={{ position: 'absolute', top: 20, left: 20, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Camera size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>CAMERA ACTIVE</span>
                                    </div>
                                    
                                    <div className="scanner-frame">
                                        <div className="scanner-corner sc-tl"></div>
                                        <div className="scanner-corner sc-tr"></div>
                                        <div className="scanner-corner sc-bl"></div>
                                        <div className="scanner-corner sc-br"></div>
                                        
                                        {scanState === 'scanning' && (
                                            <motion.div 
                                                className="laser-line"
                                                animate={{ top: ['10%', '90%', '10%'] }}
                                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                            />
                                        )}
                                        
                                        {scanState === 'processing' && (
                                            <motion.div 
                                                className="pulse-overlay"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {scanState === 'not-found' && (
                                    <div style={{ marginBottom: '24px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, background: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                                        <AlertTriangle size={20} /> Barcode not found. Try again or check the SKU.
                                    </div>
                                )}

                                <div className="ui-card" style={{ padding: '24px', textAlign: 'left' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Manual Entry</h3>
                                    <form onSubmit={handleSimulatedScan} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <div style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>
                                                <ScanLine size={18} />
                                            </div>
                                            <input 
                                                ref={inputRef}
                                                type="text" 
                                                placeholder="Enter SKU (e.g. MAT-1002)" 
                                                value={scannedId}
                                                onChange={(e) => setScannedId(e.target.value)}
                                                style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                                autoFocus
                                                disabled={scanState === 'processing'}
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="ui-btn-primary"
                                            disabled={!scannedId.trim() || scanState === 'processing'}
                                        >
                                            {scanState === 'processing' ? 'Searching...' : 'Scan'}
                                        </button>
                                    </form>
                                    <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
                                        For this demo, type a valid SKU to simulate a successful scan.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* STATE 2: ITEM FOUND & ACTION */}
                        {scanState === 'found' && material && (
                            <motion.div 
                                key="found-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <button 
                                        className="ui-btn-outline" 
                                        onClick={() => { setScanState('scanning'); setScannedId(''); setTimeout(() => inputRef.current?.focus(), 100); }}
                                        style={{ padding: '8px' }}
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Scan Result</h2>
                                </div>

                                {/* Material Details Card */}
                                <div className="ui-card" style={{ padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: '#10b981' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <CheckCircle size={14} /> SCANNED MATCH
                                                </span>
                                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{material.sku}</span>
                                            </div>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#0f172a' }}>{material.name}</h3>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Box size={14} /> Category: {material.category?.name || material.category || 'N/A'}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Current Stock</div>
                                            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{material.quantity} <span style={{fontSize: '14px', color: '#94a3b8'}}>{material.unit}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Panel */}
                                <div className="ui-card" style={{ padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 600 }}>Record Movement</h3>
                                    
                                    {/* Action Toggle */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                        <button 
                                            type="button"
                                            onClick={() => setActionType('inward')}
                                            style={{ 
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: '12px', fontWeight: 600, transition: 'all 0.2s',
                                                background: actionType === 'inward' ? 'rgba(59,130,246,0.1)' : '#f8fafc',
                                                border: `2px solid ${actionType === 'inward' ? '#3b82f6' : 'transparent'}`,
                                                color: actionType === 'inward' ? '#3b82f6' : '#64748b'
                                            }}
                                        >
                                            <PackagePlus size={24} />
                                            Inward (Add)
                                        </button>
                                        
                                        <button 
                                            type="button"
                                            onClick={() => setActionType('outward')}
                                            style={{ 
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', borderRadius: '12px', fontWeight: 600, transition: 'all 0.2s',
                                                background: actionType === 'outward' ? 'rgba(245,158,11,0.1)' : '#f8fafc',
                                                border: `2px solid ${actionType === 'outward' ? '#f59e0b' : 'transparent'}`,
                                                color: actionType === 'outward' ? '#f59e0b' : '#64748b'
                                            }}
                                        >
                                            <PackageMinus size={24} />
                                            Outward (Consume)
                                        </button>
                                    </div>

                                    {/* Quantity Input */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                                            Quantity to {actionType === 'inward' ? 'Add' : 'Remove'}
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button 
                                                className="ui-btn-outline" 
                                                style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            >-</button>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                style={{ width: '100px', height: '40px', textAlign: 'center', fontSize: '16px', fontWeight: 700, borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                            />
                                            <button 
                                                className="ui-btn-outline" 
                                                style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                                                onClick={() => setQuantity(quantity + 1)}
                                            >+</button>
                                            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginLeft: '8px' }}>{material.unit}</span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        onClick={handleStockAction}
                                        style={{ 
                                            width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '15px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s',
                                            background: actionType === 'inward' ? '#3b82f6' : '#f59e0b',
                                            boxShadow: actionType === 'inward' ? '0 4px 12px rgba(59,130,246,0.3)' : '0 4px 12px rgba(245,158,11,0.3)'
                                        }}
                                    >
                                        Confirm {actionType === 'inward' ? 'Inward' : 'Outward'} Operation
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        
                    </AnimatePresence>
                </div>
            </DetailViewContainer>
        </PageContainer>
    );
};

export default EmployeeScanner;
