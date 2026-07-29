import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    UploadCloud, FileText, Copy, Download, Trash2, Search as SearchIcon,
    Eye, ZoomIn, ZoomOut, RotateCw, Maximize2, Plus, X, Save,
    RefreshCw, FileX, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadOCRDocument, getOCRHistory, deleteOCRDocument, getOCRDocument } from '../../api/ocr';
import './ocr.css';

// ═══════════════════════════════════════════════════════════════
// Field Schema per Document Type
// ═══════════════════════════════════════════════════════════════
const FIELD_SCHEMAS = {
    'Invoice': [
        { key: 'vendorName', label: 'Vendor Name', type: 'text' },
        { key: 'invoiceNumber', label: 'Invoice Number', type: 'text' },
        { key: 'invoiceDate', label: 'Invoice Date', type: 'text' },
        { key: 'dueDate', label: 'Due Date', type: 'text' },
        { key: 'poNumber', label: 'PO Reference', type: 'text' },
        { key: 'subtotal', label: 'Subtotal', type: 'text' },
        { key: 'tax', label: 'Tax Amount', type: 'text' },
        { key: 'total', label: 'Total Amount', type: 'text' },
    ],
    'Purchase Order': [
        { key: 'poNumber', label: 'PO Number', type: 'text' },
        { key: 'vendorName', label: 'Vendor / Supplier', type: 'text' },
        { key: 'orderDate', label: 'Order Date', type: 'text' },
        { key: 'deliveryDate', label: 'Expected Delivery', type: 'text' },
        { key: 'shippingAddress', label: 'Ship To', type: 'text' },
        { key: 'subtotal', label: 'Subtotal', type: 'text' },
        { key: 'tax', label: 'Tax', type: 'text' },
        { key: 'total', label: 'Total', type: 'text' },
    ],
    'Delivery Challan': [
        { key: 'challanNumber', label: 'Challan Number', type: 'text' },
        { key: 'senderName', label: 'Sender', type: 'text' },
        { key: 'receiverName', label: 'Receiver', type: 'text' },
        { key: 'challanDate', label: 'Date', type: 'text' },
        { key: 'vehicleNumber', label: 'Vehicle No.', type: 'text' },
        { key: 'totalItems', label: 'Total Items', type: 'text' },
    ],
    'Goods Receipt Note': [
        { key: 'grnNumber', label: 'GRN Number', type: 'text' },
        { key: 'supplierName', label: 'Supplier', type: 'text' },
        { key: 'receivedDate', label: 'Received Date', type: 'text' },
        { key: 'poReference', label: 'PO Reference', type: 'text' },
        { key: 'totalQty', label: 'Total Quantity', type: 'text' },
        { key: 'inspectedBy', label: 'Inspected By', type: 'text' },
    ],
    'Material Request Form': [
        { key: 'requestNumber', label: 'Request No.', type: 'text' },
        { key: 'department', label: 'Department', type: 'text' },
        { key: 'requestedBy', label: 'Requested By', type: 'text' },
        { key: 'requestDate', label: 'Date', type: 'text' },
        { key: 'priority', label: 'Priority', type: 'text' },
        { key: 'reason', label: 'Reason / Purpose', type: 'text' },
    ],
    'Inventory Sheet': [
        { key: 'sheetId', label: 'Sheet ID', type: 'text' },
        { key: 'warehouseName', label: 'Warehouse', type: 'text' },
        { key: 'countDate', label: 'Count Date', type: 'text' },
        { key: 'countedBy', label: 'Counted By', type: 'text' },
        { key: 'totalItems', label: 'Total Items', type: 'text' },
    ],
};

// Document types that should show a line items table
const LINE_ITEM_TYPES = ['Invoice', 'Purchase Order', 'Delivery Challan', 'Goods Receipt Note'];

// ═══════════════════════════════════════════════════════════════
// Text Parsing / Extraction Engine
// ═══════════════════════════════════════════════════════════════
const EXTRACTION_PATTERNS = {
    vendorName:     [/(?:vendor|supplier|from|company|bill\s*from)[:\s]*([^\n]{2,60})/i],
    invoiceNumber:  [/(?:invoice\s*(?:no|number|#|num))[:\s]*([A-Z0-9\-\/]+)/i, /(?:inv)[:\s#]*([A-Z0-9\-\/]+)/i],
    invoiceDate:    [/(?:invoice\s*date|date\s*of\s*invoice|dated)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i, /(?:date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    dueDate:        [/(?:due\s*date|payment\s*due|pay\s*by)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    poNumber:       [/(?:po|purchase\s*order|p\.o\.)\s*(?:no|number|#|num)?[:\s]*([A-Z0-9\-\/]+)/i],
    orderDate:      [/(?:order\s*date|dated|date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    deliveryDate:   [/(?:deliver(?:y|ed)?\s*(?:date|by)|expected\s*(?:date|delivery)|ship\s*date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    shippingAddress:[/(?:ship\s*to|deliver\s*to|shipping\s*address)[:\s]*([^\n]{5,100})/i],
    subtotal:       [/(?:sub\s*total|subtotal)[:\s]*[₹$]?\s*([\d,]+\.?\d*)/i],
    tax:            [/(?:tax|gst|vat|cgst\s*\+?\s*sgst|igst)[:\s]*[₹$]?\s*([\d,]+\.?\d*)/i],
    total:          [/(?:total\s*(?:amount|due|payable)?|grand\s*total|amount\s*due|net\s*(?:amount|payable))[:\s]*[₹$]?\s*([\d,]+\.?\d*)/i],
    challanNumber:  [/(?:challan\s*(?:no|number|#))[:\s]*([A-Z0-9\-\/]+)/i, /(?:dc\s*(?:no|#))[:\s]*([A-Z0-9\-\/]+)/i],
    senderName:     [/(?:sender|from|consignor|shipper)[:\s]*([^\n]{2,60})/i],
    receiverName:   [/(?:receiver|to|consignee|deliver\s*to)[:\s]*([^\n]{2,60})/i],
    challanDate:    [/(?:date|challan\s*date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    vehicleNumber:  [/(?:vehicle\s*(?:no|number)|truck\s*(?:no|number))[:\s]*([A-Z0-9\- ]+)/i],
    totalItems:     [/(?:total\s*items?|total\s*qty|total\s*quantity)[:\s]*(\d+)/i],
    grnNumber:      [/(?:grn\s*(?:no|number|#)|goods\s*receipt\s*(?:no|number))[:\s]*([A-Z0-9\-\/]+)/i],
    supplierName:   [/(?:supplier|vendor|from)[:\s]*([^\n]{2,60})/i],
    receivedDate:   [/(?:received?\s*(?:date|on)|date\s*received)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    poReference:    [/(?:po\s*(?:ref|reference|no|number))[:\s]*([A-Z0-9\-\/]+)/i],
    totalQty:       [/(?:total\s*(?:qty|quantity))[:\s]*(\d+)/i],
    inspectedBy:    [/(?:inspected\s*by|checked\s*by|verified\s*by)[:\s]*([^\n]{2,40})/i],
    requestNumber:  [/(?:request\s*(?:no|number|#)|mr\s*(?:no|#))[:\s]*([A-Z0-9\-\/]+)/i],
    department:     [/(?:department|dept)[:\s]*([^\n]{2,40})/i],
    requestedBy:    [/(?:requested\s*by|raised\s*by)[:\s]*([^\n]{2,40})/i],
    requestDate:    [/(?:date|request\s*date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    priority:       [/(?:priority|urgency)[:\s]*(high|medium|low|urgent|normal|critical)/i],
    reason:         [/(?:reason|purpose|justification)[:\s]*([^\n]{2,100})/i],
    sheetId:        [/(?:sheet\s*(?:id|no|number))[:\s]*([A-Z0-9\-\/]+)/i],
    warehouseName:  [/(?:warehouse|location|store)[:\s]*([^\n]{2,60})/i],
    countDate:      [/(?:count\s*date|date)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i],
    countedBy:      [/(?:counted\s*by|performed\s*by)[:\s]*([^\n]{2,40})/i],
};

function parseExtractedFields(text, documentType) {
    if (!text || documentType === 'General') return {};

    const schema = FIELD_SCHEMAS[documentType];
    if (!schema) return {};

    const fields = {};
    for (const field of schema) {
        const patterns = EXTRACTION_PATTERNS[field.key] || [];
        let value = '';
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                value = match[1].trim();
                break;
            }
        }
        fields[field.key] = value;
    }
    return fields;
}

function parseLineItems(text) {
    // Try to find tabular data in the OCR text
    // Look for lines with qty/quantity patterns followed by amounts
    const items = [];
    const lines = text.split('\n');
    const itemPattern = /^[\s]*(\d+\.?\s+)?(.{3,40}?)\s+(\d+\.?\d*)\s+[₹$]?\s*([\d,]+\.?\d*)\s+[₹$]?\s*([\d,]+\.?\d*)\s*$/;
    const simplePattern = /(.{3,40}?)\s{2,}(\d+\.?\d*)\s{2,}[₹$]?\s*([\d,]+\.?\d*)/;

    for (const line of lines) {
        let match = line.match(itemPattern);
        if (match) {
            items.push({
                id: Date.now() + Math.random(),
                description: match[2].trim(),
                qty: match[3],
                unitPrice: match[4].replace(/,/g, ''),
                amount: match[5].replace(/,/g, ''),
            });
            continue;
        }
        match = line.match(simplePattern);
        if (match) {
            items.push({
                id: Date.now() + Math.random(),
                description: match[1].trim(),
                qty: match[2],
                unitPrice: match[3].replace(/,/g, ''),
                amount: '',
            });
        }
    }
    return items;
}

function getConfidence(value) {
    if (!value || value.trim() === '') return 'low';
    // Numeric values, dates, IDs get high confidence
    if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(value)) return 'high';
    if (/^[A-Z0-9\-\/]{3,}$/i.test(value)) return 'high';
    if (/^[\d,]+\.?\d*$/.test(value)) return 'high';
    if (value.length > 2) return 'medium';
    return 'low';
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
const OCRPage = () => {
    // ── Core state ──
    const [mode, setMode] = useState('upload');        // 'upload' | 'review'
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [documentType, setDocumentType] = useState('Invoice');
    const fileInputRef = useRef(null);

    // ── Review mode state ──
    const [zoom, setZoom] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [extractedFields, setExtractedFields] = useState({});
    const [lineItems, setLineItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const documentTypes = [
        "Invoice",
        "Purchase Order",
        "Delivery Challan",
        "Goods Receipt Note",
        "Material Request Form",
        "Inventory Sheet",
        "General",
    ];

    // ── Fetch History ──
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const data = await getOCRHistory();
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch OCR history:', error);
        }
    };

    // ── When result changes, parse fields ──
    useEffect(() => {
        if (result && result.text) {
            const docType = result.document_type || documentType;
            const fields = parseExtractedFields(result.text, docType);
            setExtractedFields(fields);

            if (LINE_ITEM_TYPES.includes(docType)) {
                const items = parseLineItems(result.text);
                setLineItems(items.length > 0 ? items : [{ id: Date.now(), description: '', qty: '', unitPrice: '', amount: '' }]);
            } else {
                setLineItems([]);
            }

            setMode('review');
            setZoom(1.0);
            setRotation(0);
            setSearchTerm('');
        }
    }, [result]);

    // ── File handling ──
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragActive(false);
    }, []);

    const handleFileDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        processFile(droppedFile);
    }, [documentType]);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        processFile(selectedFile);
    };

    const processFile = async (selectedFile) => {
        if (!selectedFile) return;

        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(selectedFile.type)) {
            toast.error('Unsupported file format. Please upload PDF, JPG, or PNG.');
            return;
        }

        setFile(selectedFile);
        setLoading(true);
        setResult(null);
        setMode('upload');

        try {
            const data = await uploadOCRDocument(selectedFile, documentType, 'CurrentUser');
            setResult(data);
            toast.success('Document processed successfully');
            fetchHistory();
        } catch (error) {
            console.error('OCR Processing Error:', error);
            toast.error(error.response?.data?.detail || 'Failed to process document. The OCR service might be offline.');
            setFile(null);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ── History actions ──
    const handleViewHistory = async (id) => {
        try {
            const data = await getOCRDocument(id);
            setFile(null);  // No local file for history items
            setResult(data);
        } catch (error) {
            toast.error('Failed to fetch document');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this OCR record?')) return;
        try {
            await deleteOCRDocument(id);
            toast.success('Record deleted');
            if (result && result.id === id) {
                setResult(null);
                setMode('upload');
            }
            fetchHistory();
        } catch (error) {
            toast.error('Failed to delete record');
        }
    };

    // ── Review actions ──
    const handleDiscard = () => {
        setResult(null);
        setFile(null);
        setExtractedFields({});
        setLineItems([]);
        setMode('upload');
    };

    const handleRescan = () => {
        if (file) {
            processFile(file);
        } else {
            toast('No local file to re-scan. Please upload a new document.', { icon: '📄' });
            handleDiscard();
        }
    };

    const handleSave = () => {
        // In a real app, this would POST to the backend
        console.log('[OCR Save] Fields:', extractedFields);
        console.log('[OCR Save] Line Items:', lineItems);
        toast.success('Extracted data saved to records');
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.text);
        toast.success('Text copied to clipboard');
    };

    const handleDownload = () => {
        if (!result) return;
        const blob = new Blob([result.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OCR_${result.filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ── Zoom / Rotate ──
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3.0));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
    const handleFitToWidth = () => setZoom(1.0);
    const handleRotate = () => setRotation(r => (r + 90) % 360);

    // ── Field editing ──
    const updateField = (key, value) => {
        setExtractedFields(prev => ({ ...prev, [key]: value }));
    };

    const updateLineItem = (id, field, value) => {
        setLineItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const addLineItem = () => {
        setLineItems(prev => [...prev, { id: Date.now(), description: '', qty: '', unitPrice: '', amount: '' }]);
    };

    const removeLineItem = (id) => {
        setLineItems(prev => prev.filter(item => item.id !== id));
    };

    // ── Highlight search in text ──
    const renderHighlightedText = (text, highlight) => {
        if (!highlight.trim()) return <span>{text}</span>;
        try {
            const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const parts = text.split(regex);
            return (
                <span>
                    {parts.map((part, i) =>
                        regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : <span key={i}>{part}</span>
                    )}
                </span>
            );
        } catch {
            return <span>{text}</span>;
        }
    };

    // ── Preview image/PDF source ──
    const getPreviewSrc = () => {
        if (file) return URL.createObjectURL(file);
        if (result?.filepath) return `http://localhost:8000/${result.filepath}`;
        return null;
    };

    const isPreviewPdf = () => {
        if (file) return file.type === 'application/pdf';
        if (result?.filepath) return result.filepath.toLowerCase().endsWith('.pdf');
        return false;
    };

    // ── Current document type for review ──
    const activeDocType = result?.document_type || documentType;
    const schema = FIELD_SCHEMAS[activeDocType] || null;
    const showLineItems = LINE_ITEM_TYPES.includes(activeDocType);

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="ocr-page">
            {/* ── Page Header ── */}
            <div className="ocr-page-header">
                <div>
                    <h2>Document OCR Engine</h2>
                    <p>Upload Purchase Orders, Invoices, Challans, and other documents to extract structured data.</p>
                </div>
            </div>

            {/* ═══════════════ UPLOAD MODE ═══════════════ */}
            {mode === 'upload' && !loading && (
                <div className="ocr-upload-centered">
                    <div className="ocr-doctype-selector">
                        <label>Document Type:</label>
                        <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                        >
                            {documentTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div
                        className={`ocr-dropzone ${dragActive ? 'drag-active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <div className="ocr-dropzone-icon">
                            <UploadCloud size={28} />
                        </div>
                        <h4>Drop your document here, or <span className="browse-link">browse</span></h4>
                        <p>Supported formats: PDF, JPG, PNG — Max 20 MB</p>
                    </div>
                </div>
            )}

            {/* ═══════════════ LOADING STATE ═══════════════ */}
            {loading && (
                <div className="ocr-loading-overlay">
                    <div className="ocr-spinner" />
                    <p>
                        Extracting text from <span className="loading-filename">{file?.name}</span>...
                        <br />This may take a moment depending on the document length.
                    </p>
                </div>
            )}

            {/* ═══════════════ REVIEW MODE: SPLIT SCREEN ═══════════════ */}
            {mode === 'review' && result && !loading && (
                <div className="ocr-split-view">

                    {/* ── LEFT PANEL: Document Preview ── */}
                    <div className="ocr-preview-panel">
                        <div className="ocr-preview-toolbar">
                            <div className="ocr-toolbar-left">
                                <FileText size={16} color="#7c3aed" />
                                <span className="ocr-toolbar-filename" title={result.filename}>
                                    {result.filename}
                                </span>
                                {result.pages && (
                                    <span className="ocr-toolbar-badge">
                                        {result.pages} {result.pages === 1 ? 'page' : 'pages'}
                                    </span>
                                )}
                            </div>
                            <div className="ocr-toolbar-controls">
                                <button className="ocr-toolbar-btn" onClick={handleZoomOut} title="Zoom Out">
                                    <ZoomOut size={15} />
                                </button>
                                <span className="ocr-zoom-label">{Math.round(zoom * 100)}%</span>
                                <button className="ocr-toolbar-btn" onClick={handleZoomIn} title="Zoom In">
                                    <ZoomIn size={15} />
                                </button>
                                <div className="ocr-toolbar-divider" />
                                <button className="ocr-toolbar-btn" onClick={handleFitToWidth} title="Fit to Width">
                                    <Maximize2 size={15} />
                                </button>
                                <button className="ocr-toolbar-btn" onClick={handleRotate} title="Rotate 90°">
                                    <RotateCw size={15} />
                                </button>
                            </div>
                        </div>
                        <div className="ocr-preview-viewport">
                            {getPreviewSrc() ? (
                                isPreviewPdf() ? (
                                    <embed
                                        src={getPreviewSrc()}
                                        type="application/pdf"
                                        style={{ transform: `rotate(${rotation}deg)` }}
                                    />
                                ) : (
                                    <img
                                        src={getPreviewSrc()}
                                        alt="Document Preview"
                                        style={{
                                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                        }}
                                    />
                                )
                            ) : (
                                <div style={{ color: '#94a3b8', textAlign: 'center', fontSize: 14 }}>
                                    <FileX size={40} strokeWidth={1.5} style={{ marginBottom: 8, color: '#cbd5e1' }} />
                                    <p>Preview not available for this document.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT PANEL: Extracted Data ── */}
                    <div className="ocr-data-panel">
                        <div className="ocr-data-header">
                            <div className="ocr-data-header-left">
                                <h3>Extracted Data</h3>
                                <span className="ocr-data-type-badge">{activeDocType}</span>
                            </div>
                            <div className="ocr-confidence-legend">
                                <span className="ocr-confidence-legend-item">
                                    <span className="ocr-confidence-dot high" /> High
                                </span>
                                <span className="ocr-confidence-legend-item">
                                    <span className="ocr-confidence-dot medium" /> Review
                                </span>
                                <span className="ocr-confidence-legend-item">
                                    <span className="ocr-confidence-dot low" /> Missing
                                </span>
                            </div>
                        </div>

                        <div className="ocr-data-body">
                            {/* ── Structured Fields ── */}
                            {schema ? (
                                <>
                                    <span className="ocr-fields-section-title">Document Fields</span>
                                    {schema.map(field => (
                                        <div className="ocr-field-row" key={field.key}>
                                            <div className="ocr-field-label-group">
                                                <span className={`ocr-confidence-dot ${getConfidence(extractedFields[field.key])}`} />
                                                <span className="ocr-field-label">{field.label}</span>
                                            </div>
                                            <input
                                                className="ocr-field-input"
                                                type="text"
                                                value={extractedFields[field.key] || ''}
                                                onChange={(e) => updateField(field.key, e.target.value)}
                                                placeholder={`Enter ${field.label.toLowerCase()}...`}
                                            />
                                        </div>
                                    ))}

                                    {/* ── Line Items Table ── */}
                                    {showLineItems && (
                                        <div className="ocr-line-items-section">
                                            <div className="ocr-line-items-header">
                                                <h4>Line Items</h4>
                                                <button className="ocr-add-row-btn" onClick={addLineItem}>
                                                    <Plus size={13} /> Add Row
                                                </button>
                                            </div>
                                            <table className="ocr-line-items-table">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: '40%' }}>Description</th>
                                                        <th style={{ width: '12%' }}>Qty</th>
                                                        <th style={{ width: '20%' }}>Unit Price</th>
                                                        <th style={{ width: '20%' }}>Amount</th>
                                                        <th style={{ width: '8%' }}></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lineItems.map(item => (
                                                        <tr key={item.id}>
                                                            <td>
                                                                <input
                                                                    value={item.description}
                                                                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                                    placeholder="Item description"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    value={item.qty}
                                                                    onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                                                                    placeholder="0"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    value={item.unitPrice}
                                                                    onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                                                                    placeholder="0.00"
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    value={item.amount}
                                                                    onChange={(e) => updateLineItem(item.id, 'amount', e.target.value)}
                                                                    placeholder="0.00"
                                                                />
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="ocr-remove-row-btn"
                                                                    onClick={() => removeLineItem(item.id)}
                                                                    title="Remove row"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* ── Raw Text Toggle ── */}
                                    <details style={{ marginTop: 4 }}>
                                        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b', userSelect: 'none' }}>
                                            View Raw OCR Text
                                        </summary>
                                        <div style={{ marginTop: 8 }}>
                                            <div className="ocr-raw-search">
                                                <SearchIcon size={15} color="#94a3b8" />
                                                <input
                                                    type="text"
                                                    placeholder="Search within text..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div className="ocr-raw-text">
                                                {renderHighlightedText(result.text, searchTerm)}
                                            </div>
                                        </div>
                                    </details>
                                </>
                            ) : (
                                /* ── General / Fallback: Raw Text Viewer ── */
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                        <span className="ocr-fields-section-title">Extracted Text</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="ocr-history-action-btn" onClick={handleCopy}>
                                                <Copy size={13} /> Copy
                                            </button>
                                            <button className="ocr-history-action-btn" onClick={handleDownload}>
                                                <Download size={13} /> Download
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ocr-raw-search">
                                        <SearchIcon size={15} color="#94a3b8" />
                                        <input
                                            type="text"
                                            placeholder="Search within text..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="ocr-raw-text">
                                        {renderHighlightedText(result.text, searchTerm)}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Action Bar ── */}
                        <div className="ocr-action-bar">
                            <button className="ocr-btn ocr-btn-ghost" onClick={handleDiscard}>
                                <Trash2 size={14} /> Discard
                            </button>
                            <button className="ocr-btn ocr-btn-secondary" onClick={handleRescan}>
                                <RefreshCw size={14} /> Re-scan
                            </button>
                            <button className="ocr-btn ocr-btn-primary" onClick={handleSave}>
                                <Save size={14} /> Save to Records
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════ OCR HISTORY ═══════════════ */}
            <div className="ocr-history-panel">
                <div className="ocr-history-header">
                    <h3>OCR History</h3>
                    {history.length > 0 && (
                        <span className="ocr-history-count">{history.length} document{history.length !== 1 ? 's' : ''}</span>
                    )}
                </div>
                {history.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="ocr-history-table">
                            <thead>
                                <tr>
                                    <th>Filename</th>
                                    <th>Type</th>
                                    <th>Pages</th>
                                    <th>Processed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(doc => (
                                    <tr
                                        key={doc.id}
                                        className={result && result.id === doc.id ? 'active-row' : ''}
                                        onClick={() => handleViewHistory(doc.id)}
                                    >
                                        <td>
                                            <div className="ocr-history-filename">
                                                <FileText size={16} />
                                                {doc.filename}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ocr-history-type-badge">
                                                {doc.document_type || 'General'}
                                            </span>
                                        </td>
                                        <td>{doc.pages || '—'}</td>
                                        <td>{new Date(doc.created_at).toLocaleString()}</td>
                                        <td>
                                            <div className="ocr-history-actions" onClick={(e) => e.stopPropagation()}>
                                                <button className="ocr-history-action-btn" onClick={() => handleViewHistory(doc.id)}>
                                                    <Eye size={13} /> View
                                                </button>
                                                <button className="ocr-history-action-btn danger" onClick={() => handleDelete(doc.id)}>
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="ocr-history-empty">
                        <Clock size={36} strokeWidth={1.5} />
                        <p>No documents processed yet. Upload your first document above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OCRPage;
