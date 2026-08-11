import React, { useState, useRef, useContext } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  AlertTriangle,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  File,
  RotateCcw,
  Download
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "../components/AdminDashboard/AdminDashboardRedesign.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/bmp",
  "image/webp",
  "image/tiff",
  "image/gif",
];
const ALL_SUPPORTED_TYPES = [
  ...IMAGE_TYPES, 
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

const getFileIcon = (type) => {
  if (IMAGE_TYPES.includes(type))
    return <ImageIcon size={20} color="#3b82f6" />;
  if (type === "application/pdf") return <FileText size={20} color="#ef4444" />;
  if (type.includes("wordprocessingml") || type.includes("msword")) return <FileText size={20} color="#2563eb" />;
  return <File size={20} color="#64748b" />;
};

const OCR = () => {
  const { user } = useContext(AuthContext);
  const canEdit = ['Admin', 'Manager'].includes(user?.role);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [validationWarning, setValidationWarning] = useState("");
  const [elapsed, setElapsed] = useState(0);   // seconds since processing started
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);  // AbortController for cancel

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!ALL_SUPPORTED_TYPES.includes(selectedFile.type)) {
      toast.error(
        "Unsupported file type. Upload an image (JPG, PNG, BMP, WEBP, TIFF) or PDF."
      );
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File exceeds 50MB limit.");
      return;
    }
    
    setFile(selectedFile);
    setOcrData(null);
    setError("");
    setValidationWarning("");
    setStatus('idle');
    
    if (IMAGE_TYPES.includes(selectedFile.type) || selectedFile.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
    
    handleExtract(selectedFile);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  
  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setOcrData(null);
    setError("");
    setValidationWarning("");
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleExtract = async (fileToProcess = file) => {
    if (!fileToProcess) return;
    setStatus('processing');
    setError("");
    setValidationWarning("");
    setOcrData(null);
    setElapsed(0);
    
    // Start elapsed-time counter
    const t0 = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 1000);
    
    // Create an abort controller so the user can cancel
    const controller = new AbortController();
    abortRef.current = controller;
    
    const formData = new FormData();
    formData.append("file", fileToProcess);
    
    try {
      const response = await API.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,  // 3 min hard cap — scanned PDFs can be slow
        signal: controller.signal,
      });
      if (response.data && response.data.success) {
        setOcrData(response.data);
        setStatus('success');
        toast.success(`Document extracted in ${Math.floor((Date.now() - t0) / 1000)}s`);
      } else {
        throw new Error(response.data.error || "OCR failed to return valid data.");
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        setStatus('idle');
        toast("Processing cancelled.");
      } else {
        const msg = err.response?.data?.error || err.message || "Could not connect to OCR service.";
        setError(msg);
        setStatus('error');
        toast.error("Extraction failed.");
      }
    } finally {
      clearInterval(timerRef.current);
      timerRef.current = null;
      abortRef.current = null;
    }
  };

  const handleCancelProcessing = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    clearInterval(timerRef.current);
    timerRef.current = null;
    setStatus('idle');
    toast("Processing cancelled.");
  };

  const handleValidate = () => {
      if (!ocrData || !ocrData.tables) return;
      let warnings = [];
      let hasEmpty = false;
      let hasLowConfidence = false;
      
      ocrData.tables.forEach((table) => {
          if (table.rows) {
              table.rows.forEach((row) => {
                  if (row.confidence !== undefined && row.confidence < 0.85) {
                      hasLowConfidence = true;
                  }
                  if (table.columns) {
                      table.columns.forEach(col => {
                          if (!row[col] || row[col].toString().trim() === "") {
                              hasEmpty = true;
                          }
                      });
                  }
              });
          }
      });
      
      if (hasEmpty) warnings.push("some cells are empty");
      if (hasLowConfidence) warnings.push("some rows have low confidence");
      
      if (warnings.length > 0) {
          setValidationWarning(`⚠ Verification required: ${warnings.join(' and ')}.`);
          toast.error("Validation complete with warnings.");
      } else {
          setValidationWarning("");
          toast.success("Table data validated successfully!");
      }
  };

  const handleExport = async (type) => {
    const loadingToast = toast.loading(`Generating ${type.toUpperCase()}...`);
    try {
        let originalName = file?.name || 'document';
        let baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        let exportFileName = `${baseName}_extracted.${type}`;
        
        const response = await API.post(`/ocr/export/${type}?filename=${encodeURIComponent(exportFileName)}`, ocrData, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = response.headers['content-disposition'] 
            ? response.headers['content-disposition'].split('filename=')[1] 
            : exportFileName;
        link.setAttribute('download', filename.replace(/"/g, ''));
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`${type.toUpperCase()} generated successfully!`, { id: loadingToast });
    } catch (err) {
        toast.error(`Failed to generate ${type.toUpperCase()}`, { id: loadingToast });
    }
  };

  const handleItemChange = (tableIdx, rowIdx, field, value) => {
    const newTables = [...ocrData.tables];
    const updatedItems = [...newTables[tableIdx].rows];
    const item = { ...updatedItems[rowIdx], [field]: value };
    
    if (ocrData.document?.module === 'Finance / Procurement / Sales' && (ocrData.document?.type === 'Invoice' || ocrData.document?.type === 'Purchase Order')) {
        if (['quantity', 'unit_price', 'discount', 'tax_percent'].includes(field.toLowerCase())) {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.unit_price) || 0;
            const disc = parseFloat(item.discount) || 0;
            item.amount = (qty * rate) - disc;
            
            const taxPct = parseFloat(item.tax_percent) || 0;
            item.tax_amount = (item.amount * taxPct) / 100;
        }
    }
    
    updatedItems[rowIdx] = item;
    newTables[tableIdx].rows = updatedItems;
    
    if (ocrData.document?.module === 'Finance / Procurement / Sales' && ocrData.document?.type === 'Invoice') {
        let newSubtotal = 0;
        let newCgst = 0;
        let newSgst = 0;
        
        updatedItems.forEach(row => {
            newSubtotal += (parseFloat(row.amount) || 0);
            const taxAmt = (parseFloat(row.tax_amount) || 0);
            newCgst += (taxAmt / 2);
            newSgst += (taxAmt / 2);
        });
        
        const newGrandTotal = newSubtotal + newCgst + newSgst + (parseFloat(ocrData.totals?.igst) || 0) - (parseFloat(ocrData.totals?.discount) || 0);
        
        setOcrData({
            ...ocrData,
            tables: newTables,
            totals: {
                ...ocrData.totals,
                subtotal: newSubtotal,
                cgst: newCgst,
                sgst: newSgst,
                grand_total: newGrandTotal
            }
        });
    } else {
        setOcrData({ ...ocrData, tables: newTables });
    }
  };
  
  const handleTotalChange = (field, value) => {
      const val = parseFloat(value) || 0;
      const updatedTotals = { ...(ocrData.totals || {}), [field]: val };
      
      const newGrandTotal = (updatedTotals.subtotal || 0) 
                          + (updatedTotals.cgst || 0) 
                          + (updatedTotals.sgst || 0) 
                          + (updatedTotals.igst || 0) 
                          - (updatedTotals.discount || 0);
      updatedTotals.grand_total = newGrandTotal;
      
      setOcrData({
          ...ocrData,
          totals: updatedTotals
      });
  };

  const handleDeleteItem = (tableIdx, rowIdx) => {
    const newTables = [...ocrData.tables];
    const updatedItems = newTables[tableIdx].rows.filter((_, i) => i !== rowIdx);
    newTables[tableIdx].rows = updatedItems;
    
    if (ocrData.document?.module === 'Finance / Procurement / Sales' && ocrData.document?.type === 'Invoice') {
        let newSubtotal = 0;
        updatedItems.forEach(row => {
            newSubtotal += (parseFloat(row.amount) || 0);
        });
        
        const newGrandTotal = newSubtotal + (parseFloat(ocrData.totals?.cgst) || 0) + (parseFloat(ocrData.totals?.sgst) || 0) + (parseFloat(ocrData.totals?.igst) || 0) - (parseFloat(ocrData.totals?.discount) || 0);
        
        setOcrData({
            ...ocrData,
            tables: newTables,
            totals: {
                ...ocrData.totals,
                subtotal: newSubtotal,
                grand_total: newGrandTotal
            }
        });
    } else {
        setOcrData({ ...ocrData, tables: newTables });
    }
  };

  const handleAddItem = (tableIdx) => {
    const newTables = [...ocrData.tables];
    const table = newTables[tableIdx];
    const emptyRow = { row_number: (table.rows?.length || 0) + 1, confidence: 1 };
    
    if (table.columns) {
        table.columns.forEach(col => {
            emptyRow[col] = "";
        });
    }
    
    table.rows = [...(table.rows || []), emptyRow];
    setOcrData({ ...ocrData, tables: newTables });
  };

  const handleSaveInvoice = async (type) => {
      if (!ocrData) return;
      const savingToast = toast.loading(`Saving ${type}...`);
      try {
          // Flatten back to old API format for invoices if needed, or pass full data
          await API.post('/invoices/from-ocr', { type, data: ocrData });
          toast.success(`${type} saved successfully!`, { id: savingToast });
          handleClear(); 
      } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to save invoice.', { id: savingToast });
      }
  };

  const renderField = (label, value, onChange, confidence) => (
    <div className="ocr-field-group">
      <div className="ocr-field-label">
        <label>{label}</label>
        {confidence !== undefined && (
          <span className={`ocr-confidence-tag ${confidence < 0.85 ? 'low' : 'high'}`}>
            {confidence < 0.85 ? <><AlertTriangle size={12}/> Needs verification</> : <><CheckCircle2 size={12}/> {(confidence*100).toFixed(0)}%</>}
          </span>
        )}
      </div>
      <input type="text" value={value || ""} onChange={onChange} placeholder="Not detected" className="ocr-text-input" />
    </div>
  );

  return (
    <div className="ocr-erp-workspace">
      
      {/* HEADER */}
      <div className="ocr-header">
        <div className="eyebrow">SMTBMS · Document Intelligence</div>
        <h1>Advanced OCR Table Extraction</h1>
        <p>Upload a PDF or image. SMTBMS will identify the document and automatically extract the appropriate information.</p>
      </div>

      <div className="ocr-main-content">
        
        {/* UPLOAD SECTION */}
        {(!file || status === 'idle') && (
          <div className="ocr-upload-card">
            <h2>Upload Document</h2>
            <p>Upload a PDF or image to automatically classify and extract data.</p>
            <div className="ocr-upload-dropzone" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} style={{ borderColor: isDragging ? "var(--teal)" : "var(--line)", background: isDragging ? "var(--teal-mist)" : "var(--canvas)" }}>
              <input ref={fileInputRef} type="file" style={{ display: "none" }} accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} />
              <Upload size={32} color={isDragging ? "var(--teal)" : "var(--ink-soft)"} />
              <h3>Upload / Drag & Drop</h3>
              <p>PDF DOCX JPG PNG WEBP supported</p>
            </div>
          </div>
        )}

        {file && (
          <div className="ocr-file-banner">
            <div className="file-info">
              <div className="file-icon-chip">{getFileIcon(file.type)}</div>
              <span className="filename">{file.name}</span>
              <div className="file-tags">
                <span className="tag">
                  {file.size >= 1024 * 1024
                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${Math.max(1, Math.round(file.size / 1024))} KB`}
                </span>
                <span className="tag">{file.type.split('/')[1]?.toUpperCase()}</span>
              </div>
            </div>
            {canEdit && <button onClick={handleClear} className="btn-remove-text">Remove</button>}
          </div>
        )}

        {/* PROCESSING STATE */}
        {status === 'processing' && (() => {
          // We don't know real progress, so we animate steps slowly, but NEVER mark the last step as done.
          const stepOcrDone = elapsed >= 15;
          const stepIdentifyDone = elapsed >= 25;
          const stepExtractDone = elapsed >= 35;
          const isSlow = elapsed >= 15;
          const isVerySlow = elapsed >= 45;

          const renderStep = (done, active, label, hint) => (
            <div className={`ocr-step ${done ? 'success' : active ? 'active' : 'pending'}`}>
              {done ? <CheckCircle2 size={16}/> : active ? <div className="spinner"/> : <div className="circle"/>}
              <span>{label}</span>
              {active && hint && <span className="step-hint">{hint}</span>}
            </div>
          );

          return (
            <div className="ocr-processing-card">
              <div className="processing-header">
                <h3>Processing Document…</h3>
                <span className="elapsed-badge">{elapsed}s</span>
              </div>
              <div className="ocr-steps">
                {renderStep(true, false, 'File uploaded')}
                
                {renderStep(stepOcrDone, !stepOcrDone, 'Running OCR engine', 
                  isSlow ? 'Scanned file detected — reading text…' : 'Reading text from document')}
                  
                {renderStep(stepIdentifyDone, stepOcrDone && !stepIdentifyDone, 'Identifying document type', 
                  'Analyzing document structure…')}
                  
                {renderStep(stepExtractDone, stepIdentifyDone && !stepExtractDone, 'Extracting table structure', 
                  'Structuring tabular data…')}
                  
                {renderStep(false, stepExtractDone, 'Preparing result', 
                  'Finalizing extraction…')}
              </div>
              {isSlow && (
                <div className="ocr-slow-warning">
                  <AlertTriangle size={16} color="var(--amber)"/>
                  <span>
                    {isVerySlow
                      ? 'This is taking over 45 seconds — the document may be a large scanned image. You can cancel and try a smaller file.'
                      : 'This is taking longer than expected. Scanned PDFs may take 30–90 seconds on first run.'}
                  </span>
                </div>
              )}
              <button className="btn-cancel-processing" onClick={handleCancelProcessing}>
                Cancel
              </button>
            </div>
          );
        })()}

        {status === 'error' && (
          <div className="ocr-error-card">
            <AlertTriangle size={24} color="#ef4444" />
            <h3>Unable to process document</h3>
            <p>{error}</p>
            <button onClick={() => handleExtract(file)} className="btn-try-again"><RotateCcw size={16}/> Try Again</button>
          </div>
        )}

        {/* EXTRACTION RESULTS */}
        {status === 'success' && file && ocrData && ocrData.document && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="ocr-results-wrapper">
            
            {ocrData.document.isRelated ? (
                <div className="ocr-classification-badge success">
                    <CheckCircle2 size={24} color="var(--teal)"/> 
                    <div className="badge-content">
                        <strong>SMTBMS Related Document</strong>
                        <div className="badge-meta">
                          <span>{ocrData.document.type}</span>
                          <span className="divider">·</span>
                          <span>Module: {ocrData.document.module}</span>
                        </div>
                    </div>
                    <div className="confidence-gauge-container">
                        <span className="confidence-label">CONFIDENCE</span>
                        <div className="confidence-gauge">
                          <div className="confidence-fill" style={{ width: `${(ocrData.document.confidence * 100).toFixed(0)}%` }}></div>
                        </div>
                        <span className="confidence-value">{(ocrData.document.confidence * 100).toFixed(0)}%</span>
                    </div>
                </div>
            ) : (
                <div className="ocr-classification-badge info">
                    <CheckCircle2 size={24} color="var(--ink-soft)"/> 
                    <div className="badge-content">
                        <strong>General Document Detected</strong>
                        <div className="badge-meta">
                          <span>This document does not appear to be a structured SMTBMS business document.</span>
                        </div>
                    </div>
                    <div className="confidence-gauge-container">
                        <span className="confidence-label">CONFIDENCE</span>
                        <div className="confidence-gauge">
                          <div className="confidence-fill neutral" style={{ width: `${(ocrData.document.confidence * 100).toFixed(0)}%` }}></div>
                        </div>
                        <span className="confidence-value">{(ocrData.document.confidence * 100).toFixed(0)}%</span>
                    </div>
                </div>
            )}

            {/* TOP GRID: PREVIEW & INFO */}
            <div className="ocr-top-grid">
              
              <div className="ocr-preview-panel">
                <h3>Document Preview</h3>
                <div className="preview-container">
                  {file?.type === "application/pdf" ? (
                    <object data={previewUrl} type="application/pdf" width="100%" height="100%">
                      <p>PDF preview not available. <a href={previewUrl} target="_blank" rel="noreferrer">Download</a></p>
                    </object>
                  ) : (
                    <img src={previewUrl} alt="Document Preview" />
                  )}
                </div>
              </div>

              <div className="ocr-info-panel">
                    <h3>Document Information</h3>
                    <div className="ocr-info-grid">
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>Document Type</label></div>
                        <div className="ocr-text-value">{ocrData.document.type}</div>
                      </div>
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>Module</label></div>
                        <div className="ocr-text-value">{ocrData.document.module}</div>
                      </div>
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>File Name</label></div>
                        <div className="ocr-text-value">{file?.name}</div>
                      </div>
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>Pages</label></div>
                        <div className="ocr-text-value">{ocrData.document.pageCount || 1}</div>
                      </div>
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>Tables Detected</label></div>
                        <div className="ocr-text-value">{ocrData.tables?.length || 0}</div>
                      </div>
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>Rows Extracted</label></div>
                        <div className="ocr-text-value">{ocrData.tables?.reduce((acc, t) => acc + (t.rows?.length || 0), 0) || 0}</div>
                      </div>
                      <div className="ocr-field-group">
                        <div className="ocr-field-label"><label>Extraction Status</label></div>
                        {((ocrData.tables?.length || 0) > 0 && (ocrData.tables?.reduce((acc, t) => acc + (t.rows?.length || 0), 0) || 0) > 0) ? (
                            <div className="ocr-text-value" style={{ color: '#10b981', fontWeight: 600 }}>✓ Successfully Extracted</div>
                        ) : (
                            <div className="ocr-text-value" style={{ color: 'var(--amber)', fontWeight: 600 }}>⚠ Extraction incomplete — review manually</div>
                        )}
                      </div>
                    </div>
                  </div>

            </div>

            {/* DOCUMENT DETAILS (extracted from KV notes) */}
            {ocrData.document.details && Object.keys(ocrData.document.details).length > 0 && (
                <div className="ocr-info-panel" style={{ marginTop: '20px', marginBottom: '0' }}>
                    <h3>Document Details</h3>
                    <div className="ocr-info-grid">
                        {Object.entries(ocrData.document.details).map(([key, value], idx) => (
                            <div className="ocr-field-group" key={idx}>
                                <div className="ocr-field-label"><label>{key}</label></div>
                                <div className="ocr-text-value">{value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DATA TABLES — always rendered when tables are available */}
            
            {ocrData.tables && ocrData.tables.length > 0 && ocrData.tables.map((table, tableIdx) => (
                <div className="ocr-table-panel" key={tableIdx}>
                <div className="panel-header">
                    <div>
                    <h3>{table.title === "Extracted Table" ? ocrData.document.type : (table.title || ocrData.document.type)}</h3>
                    <p>Review and correct the data extracted from the document.</p>
                    </div>
                    {ocrData.document.tableDetected !== false && (
                        <div className={`table-match-badge ${ocrData.document.confidence >= 0.9 ? 'success' : 'warning'}`}>
                            {ocrData.document.confidence >= 0.9 ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>}
                            <span>Table Match: {(ocrData.document.confidence * 100).toFixed(0)}%</span>
                        </div>
                    )}
                </div>
                
                {!(table.rows && table.rows.length > 0) ? (
                    <div className="ocr-no-items">
                    <AlertCircle size={20} color="var(--ink-soft)"/>
                    <span>Could not automatically detect line items.</span>
                    {canEdit && <button className="btn-add-item" onClick={() => handleAddItem(tableIdx)}><Plus size={16}/> Add Row</button>}
                    </div>
                ) : (
                    <div className="ocr-table-scrollable-wrapper" style={{ position: 'relative' }}>
                    <div className="ocr-table-scrollable">
                    <table className="ocr-full-table fixed-layout">
                        <thead>
                        <tr>
                            <th className="sticky-col-1" style={{ width: '50px', minWidth: '50px' }}>#</th>
                            {table.columns && table.columns.map((col, i) => {
                                const isDateCol = /start date|end date/i.test(col);
                                const isGeneratedCol = /generated/i.test(col);
                                const isNumericCol = /amount|total|price|qty|quantity|rate|discount|tax|percent|stock/i.test(col);
                                const isDateOrNumeric = /date|amount|total|price|qty|quantity|rate|discount|tax|percent|stock/i.test(col);
                                let style = {};
                                if (/^metric$/i.test(col)) { style = { minWidth: '200px' }; }
                                else if (/^value$/i.test(col)) { style = { minWidth: '140px' }; }
                                else if (/category|report category/i.test(col)) { style = { minWidth: '200px' }; }
                                else if (isGeneratedCol) { style = { minWidth: '180px', whiteSpace: 'nowrap' }; }
                                else if (isDateCol) { style = { minWidth: '115px', whiteSpace: 'nowrap' }; }
                                else if (/auditor|signature/i.test(col)) { style = { minWidth: '110px' }; }
                                else if (/format/i.test(col)) { style = { minWidth: '80px' }; }
                                else if (/status/i.test(col)) { style = { minWidth: '80px' }; }
                                else if (isNumericCol) { style = { minWidth: '70px' }; }
                                else { style = { minWidth: '90px' }; }
                                const cls = [
                                    isDateOrNumeric ? 'col-numeric' : '',
                                    isDateCol ? 'col-date' : '',
                                    isGeneratedCol ? 'col-generated' : ''
                                ].filter(Boolean).join(' ');
                                return (
                                    <th key={i} style={style} className={cls}>{col}</th>
                                );
                            })}
                            {canEdit && <th style={{ minWidth: '44px', width: '44px', textAlign: 'center' }}><Trash2 size={14}/></th>}
                        </tr>
                        </thead>
                        <tbody>
                        {table.rows.map((item, rowIdx) => {
                            const isSummaryRow = Object.values(item).some(val => /total|gross|net|subtotal/i.test(String(val || '')));
                            return (
                            <tr key={rowIdx} className={`${item.confidence < 0.85 ? 'row-warning' : ''} ${isSummaryRow ? 'row-summary' : ''}`}>
                            <td className="row-num sticky-col-1" style={{ width: '28px', minWidth: '28px', maxWidth: '28px', padding: '10px 4px', textAlign: 'center' }}>
                                {rowIdx + 1}
                            </td>
                            
                            {table.columns && table.columns.map((col, i) => {
                                const isDateCol = /start date|end date/i.test(col);
                                const isGeneratedCol = /generated/i.test(col);
                                const isNumericCol = /amount|total|price|qty|quantity|rate|discount|tax|percent|stock/i.test(col);
                                const isDateOrNumeric = /date|amount|total|price|qty|quantity|rate|discount|tax|percent|stock/i.test(col);
                                let style = {};
                                if (/^metric$/i.test(col)) { style = { minWidth: '200px' }; }
                                else if (/^value$/i.test(col)) { style = { minWidth: '140px' }; }
                                else if (/category|report category/i.test(col)) { style = { minWidth: '200px' }; }
                                else if (isGeneratedCol) { style = { minWidth: '180px', whiteSpace: 'nowrap' }; }
                                else if (isDateCol) { style = { minWidth: '115px', whiteSpace: 'nowrap' }; }
                                else if (/auditor|signature/i.test(col)) { style = { minWidth: '110px' }; }
                                else if (/format/i.test(col)) { style = { minWidth: '80px' }; }
                                else if (/status/i.test(col)) { style = { minWidth: '80px' }; }
                                else if (isNumericCol) { style = { minWidth: '70px' }; }
                                else { style = { minWidth: '90px' }; }
                                const cls = [
                                    isDateOrNumeric ? 'col-numeric' : '',
                                    isDateCol ? 'col-date' : '',
                                    isGeneratedCol ? 'col-generated' : ''
                                ].filter(Boolean).join(' ');
                                
                                const isStatus = /status/i.test(col);
                                const val = item[col] || "";
                                
                                return (
                                    <td key={i} style={style} className={cls}>
                                        {canEdit ? (
                                            <input 
                                                type="text"
                                                title={val}
                                                value={val} 
                                                onChange={e => handleItemChange(tableIdx, rowIdx, col, e.target.value)} 
                                                className={`compact-input ${isNumericCol ? "fw-bold " : ""}${isStatus ? "status-pill-input" : ""}`}
                                            />
                                        ) : (
                                            <span 
                                                title={val} 
                                                className={`read-only-cell ${isNumericCol ? "fw-bold " : ""}${isStatus ? "status-pill-input" : ""}`}
                                            >
                                                {val}
                                            </span>
                                        )}
                                    </td>
                                );
                            })}
                            
                            {canEdit && <td style={{ width: '44px', textAlign: 'center', padding: '10px 4px' }}><button className="btn-delete" title="Delete Row" onClick={() => handleDeleteItem(tableIdx, rowIdx)}><Trash2 size={16}/></button></td>}
                            </tr>
                        )})}
                        </tbody>
                    </table>
                    </div>
                    </div>
                )}
                {canEdit && table.rows && table.rows.length > 0 && (
                    <div className="table-footer">
                    <button className="btn-add-item-sm" onClick={() => handleAddItem(tableIdx)}><Plus size={14}/> Add Row</button>
                    </div>
                )}
                {/* Additional Notes — for KV-extracted tables that had unparseable lines */}
                {table.notes && table.notes.length > 0 && (
                    <div className="ocr-additional-notes">
                        <div className="notes-label">Additional Notes</div>
                        <ul className="notes-list">
                            {table.notes.map((note, ni) => <li key={ni}>{note}</li>)}
                        </ul>
                    </div>
                )}
                </div>
            ))}

            {/* TOTALS SUMMARY (ONLY IF INVOICE WITH TAX/DISCOUNT) */}
            {ocrData.totals && 
             (parseFloat(ocrData.totals.subtotal) > 0 || parseFloat(ocrData.totals.cgst) > 0 || parseFloat(ocrData.totals.sgst) > 0 || parseFloat(ocrData.totals.igst) > 0 || parseFloat(ocrData.totals.discount) > 0) && (
                <div className="ocr-summary-panel">
                <h3>Totals Summary</h3>
                <div className="summary-box">
                    <div className="summary-row"><span>Subtotal</span> {canEdit ? <input type="number" value={ocrData.totals?.subtotal || 0} onChange={e => handleTotalChange('subtotal', e.target.value)} className="numeric-col" /> : <span className="read-only-cell numeric-col">{ocrData.totals?.subtotal || 0}</span>}</div>
                    <div className="summary-row"><span>Discount</span> {canEdit ? <input type="number" value={ocrData.totals?.discount || 0} onChange={e => handleTotalChange('discount', e.target.value)} className="numeric-col" /> : <span className="read-only-cell numeric-col">{ocrData.totals?.discount || 0}</span>}</div>
                    <div className="summary-row"><span>Taxable Amount</span> <span className="read-only-cell numeric-col">{(parseFloat(ocrData.totals?.subtotal)||0) - (parseFloat(ocrData.totals?.discount)||0)}</span></div>
                    <div className="summary-row"><span>CGST</span> {canEdit ? <input type="number" value={ocrData.totals?.cgst || 0} onChange={e => handleTotalChange('cgst', e.target.value)} className="numeric-col" /> : <span className="read-only-cell numeric-col">{ocrData.totals?.cgst || 0}</span>}</div>
                    <div className="summary-row"><span>SGST</span> {canEdit ? <input type="number" value={ocrData.totals?.sgst || 0} onChange={e => handleTotalChange('sgst', e.target.value)} className="numeric-col" /> : <span className="read-only-cell numeric-col">{ocrData.totals?.sgst || 0}</span>}</div>
                    <div className="summary-row"><span>IGST</span> {canEdit ? <input type="number" value={ocrData.totals?.igst || 0} onChange={e => handleTotalChange('igst', e.target.value)} className="numeric-col" /> : <span className="read-only-cell numeric-col">{ocrData.totals?.igst || 0}</span>}</div>
                    <div className="summary-row grand-total"><span>Grand Total</span> {canEdit ? <input type="number" value={ocrData.totals?.grand_total || 0} onChange={e => handleTotalChange('grand_total', e.target.value)} className="numeric-col total-val" /> : <span className="read-only-cell numeric-col total-val">{ocrData.totals?.grand_total || 0}</span>}</div>
                </div>
                </div>
            )}
            
            {/* PAYROLL SUMMARY */}
            {ocrData.totals?.amount_in_words && (
                <div className="ocr-payroll-footer">
                    <div className="payroll-net">
                        <span>Net Payable</span>
                        <span className="payroll-amount">₹{ocrData.totals.net_payable}</span>
                    </div>
                    <div className="payroll-words">
                        <span>Amount in words</span>
                        <p>{ocrData.totals.amount_in_words}</p>
                    </div>
                </div>
            )}

            {/* VALIDATION WARNING */}
            {validationWarning && (
                <div className="ocr-validation-warning">
                    <AlertTriangle size={20} color="var(--amber)" />
                    <span>{validationWarning}</span>
                </div>
            )}

            {/* ACTIONS */}
            <div className="ocr-bottom-actions">
              {canEdit && ocrData.document?.module === 'Finance / Procurement / Sales' && (
                <>
                    <button className="btn-action primary" disabled={!ocrData.tables?.[0]?.rows?.length} onClick={() => handleSaveInvoice('Purchase Invoice')} style={{opacity: (!ocrData.tables?.[0]?.rows?.length) ? 0.5 : 1}}><Save size={18}/> Save as Purchase</button>
                    <button className="btn-action primary" disabled={!ocrData.tables?.[0]?.rows?.length} onClick={() => handleSaveInvoice('Sales Invoice')} style={{opacity: (!ocrData.tables?.[0]?.rows?.length) ? 0.5 : 1}}><Save size={18}/> Save as Sales</button>
                </>
              )}
              
              {canEdit && (
                  <button className="btn-action outline" onClick={handleValidate}><CheckCircle2 size={18}/> Validate</button>
              )}
              
              <button className="btn-action outline" onClick={() => handleExport('docx')}><Download size={18}/> Download Word</button>
              
              <button className="btn-action outline" onClick={() => handleExport('pdf')}><Download size={18}/> Download PDF</button>
              
              {canEdit && <button className="btn-clear-text" onClick={handleClear}>Clear</button>}
            </div>

          </motion.div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@600;700&display=swap');

        .ocr-erp-workspace { 
            --ink: #151A2D;
            --ink-soft: #4A5170;
            --canvas: #EEF0F4;
            --paper: #FFFFFF;
            --line: #DDE1E9;
            --teal: #0B7A75;
            --teal-dark: #075E5A;
            --teal-mist: #E4F3F1;
            --amber: #B4650F;
            --amber-mist: #FCF0DE;
            --red: #B3311C;
            --red-mist: #FBE9E6;

            max-width: 1400px; margin: 0 auto; padding: 32px; 
            color: var(--ink); 
            font-family: 'Inter', sans-serif;
            background-color: var(--canvas);
            min-height: 100vh;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 { font-family: 'Space Grotesk', sans-serif; color: var(--ink); margin: 0; }
        .monospace { font-family: 'IBM Plex Mono', monospace; }
        
        .ocr-header { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
        .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 500; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .ocr-header h1 { font-size: 28px; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.5px; }
        .ocr-header p { margin: 0; color: var(--ink-soft); font-size: 15px; }
        
        /* Cards */
        .ocr-upload-card { background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 32px; text-align: center; }
        .ocr-upload-card h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
        .ocr-upload-card p { margin: 0 0 24px; color: var(--ink-soft); }
        .ocr-upload-dropzone { border: 1px dashed var(--line); border-radius: 8px; padding: 48px 24px; cursor: pointer; transition: 0.2s; background: var(--paper); }
        .ocr-upload-dropzone:hover { border-color: var(--teal); background: var(--teal-mist); }
        .ocr-upload-dropzone h3 { margin: 16px 0 8px; font-size: 16px; }
        
        .ocr-file-banner { display: flex; justify-content: space-between; align-items: center; background: var(--paper); border: 1px solid var(--line); padding: 16px 20px; border-radius: 10px; margin-bottom: 24px; }
        .file-info { display: flex; align-items: center; gap: 12px; }
        .file-icon-chip { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--canvas); border-radius: 6px; }
        .file-info .filename { font-weight: 500; font-size: 15px; }
        .file-tags { display: flex; gap: 8px; }
        .file-tags .tag { color: var(--ink-soft); font-size: 12px; background: var(--canvas); padding: 4px 8px; border-radius: 4px; font-family: 'IBM Plex Mono', monospace; }
        .btn-remove-text { background: none; border: none; color: var(--red); font-weight: 500; font-size: 14px; cursor: pointer; padding: 8px 12px; transition: 0.2s; border-radius: 6px; }
        .btn-remove-text:hover { background: var(--red-mist); }
        
        /* Process State */
        .ocr-processing-card, .ocr-error-card { background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 32px; text-align: center; margin-bottom: 24px; display: flex; flex-direction: column; align-items: center; }
        .processing-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .processing-header h3 { font-size: 18px; margin: 0; }
        .elapsed-badge { background: var(--canvas); padding: 4px 8px; border-radius: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 600; color: var(--ink-soft); }
        .ocr-steps { display: flex; flex-direction: column; gap: 16px; align-items: flex-start; max-width: 400px; width: 100%; margin: 0 auto; }
        .ocr-step { display: flex; align-items: center; gap: 12px; font-size: 15px; }
        .ocr-step.success { color: var(--teal); }
        .ocr-step.active { color: var(--ink); font-weight: 600; }
        .ocr-step.pending { color: var(--ink-soft); }
        .step-hint { font-size: 12px; font-weight: 400; color: var(--ink-soft); margin-left: 8px; }
        .spinner { width: 16px; height: 16px; border: 2px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: spin 1s linear infinite; }
        .circle { width: 16px; height: 16px; border: 2px solid var(--line); border-radius: 50%; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .ocr-slow-warning { background: var(--amber-mist); color: var(--amber); border: 1px solid var(--amber); padding: 12px 16px; border-radius: 8px; display: flex; align-items: flex-start; gap: 12px; font-size: 13px; font-weight: 500; text-align: left; margin: 24px auto 0; max-width: 400px; width: 100%; }
        .btn-cancel-processing { background: none; border: 1px solid var(--line); color: var(--ink-soft); font-weight: 500; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 24px; transition: 0.2s; }
        .btn-cancel-processing:hover { background: var(--canvas); color: var(--ink); border-color: var(--ink-soft); }
        
        .btn-try-again { display: inline-flex; align-items: center; gap: 8px; background: var(--teal); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; margin-top: 16px; cursor: pointer; }
        
        .ocr-results-wrapper { display: flex; flex-direction: column; gap: 24px; }
        
        /* Classification Badge */
        .ocr-classification-badge { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-radius: 10px; font-size: 15px; border: 1px solid var(--line); }
        .ocr-classification-badge.success { background: var(--teal-mist); }
        .ocr-classification-badge.info { background: var(--paper); }
        .badge-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .badge-content strong { font-size: 16px; font-weight: 600; font-family: 'Space Grotesk', sans-serif; }
        .badge-meta { display: flex; align-items: center; gap: 8px; color: var(--ink-soft); font-size: 14px; }
        .divider { color: var(--line); }
        
        /* Gauge */
        .confidence-gauge-container { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 120px; }
        .confidence-label { font-size: 11px; font-weight: 600; color: var(--ink-soft); letter-spacing: 0.5px; }
        .confidence-gauge { width: 100%; height: 4px; background: var(--line); border-radius: 2px; overflow: hidden; }
        .confidence-fill { height: 100%; background: var(--teal); }
        .confidence-fill.neutral { background: var(--ink-soft); }
        .confidence-fill.warning { background: var(--amber); }
        .confidence-value { font-family: 'IBM Plex Mono', monospace; font-size: 13px; font-weight: 500; color: var(--ink); }
        
        /* Layout */
        .ocr-top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media(max-width: 900px) { .ocr-top-grid { grid-template-columns: 1fr; } }
        
        .ocr-preview-panel, .ocr-info-panel, .ocr-table-panel, .ocr-summary-panel { background: var(--paper); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
        .ocr-preview-panel h3, .ocr-info-panel h3, .ocr-summary-panel h3 { padding: 16px 20px; background: var(--canvas); border-bottom: 1px solid var(--line); font-size: 16px; font-weight: 600; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; background: var(--canvas); border-bottom: 1px solid var(--line); padding: 16px 20px; }
        .panel-header h3 { padding: 0; background: none; border: none; font-size: 16px; font-weight: 600; }
        .preview-container { height: 450px; background: var(--canvas); display: flex; justify-content: center; align-items: center; overflow: hidden; }
        .preview-container img { max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply; }
        
        .table-match-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .table-match-badge.success { background: var(--teal-mist); color: var(--teal-dark); }
        .table-match-badge.warning { background: var(--amber-mist); color: var(--amber); }
        
        /* Document Info */
        .ocr-info-grid { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media(max-width: 1200px) { .ocr-info-grid { grid-template-columns: 1fr; } }
        .ocr-field-group { display: flex; flex-direction: column; gap: 6px; }
        .ocr-field-label { display: flex; justify-content: space-between; align-items: center; }
        .ocr-field-label label { font-size: 13px; font-weight: 500; color: var(--ink-soft); }
        .ocr-text-value { font-size: 14px; font-weight: 500; color: var(--ink); }
        
        .panel-header p { margin: 4px 0 0; font-size: 13px; color: var(--ink-soft); }
        
        /* Table */
        .ocr-table-scrollable-wrapper { position: relative; margin-bottom: 8px; }
        .ocr-table-scrollable { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .ocr-full-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; table-layout: auto; min-width: 700px; }
        .ocr-full-table th, .ocr-full-table td { box-sizing: border-box; }
        .ocr-full-table th { padding: 10px 8px; background: var(--canvas); border-bottom: 1px solid var(--line); border-top: 1px solid var(--line); font-size: 11.5px; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
        .ocr-full-table td { padding: 6px 8px; border-bottom: 1px solid var(--line); vertical-align: middle; background: var(--paper); }
        /* Date/timestamp columns must not wrap or truncate */
        .ocr-full-table th.col-date, .ocr-full-table td.col-date { white-space: nowrap; min-width: 120px; }
        .ocr-full-table th.col-generated, .ocr-full-table td.col-generated { white-space: nowrap; min-width: 180px; }
        
        /* Sticky columns */
        .ocr-full-table .sticky-col-1 { position: sticky; left: 0; z-index: 2; box-shadow: 1px 0 0 var(--line); background: var(--paper); }
        .ocr-full-table th.sticky-col-1 { z-index: 3; background: var(--canvas); }
        .row-warning .sticky-col-1 { background: var(--amber-mist) !important; }
        .row-summary td { background: var(--teal-mist) !important; font-weight: 700; border-top: 2px solid var(--teal) !important; border-bottom: 2px solid var(--teal) !important; }
        .row-summary input { font-weight: 700; color: var(--teal-dark); background: transparent; }
        .row-summary .sticky-col-1 { background: var(--teal-mist) !important; border-top: 2px solid var(--teal) !important; border-bottom: 2px solid var(--teal) !important; }
        
        /* Numeric alignment */
        .ocr-full-table th.col-numeric { text-align: right; }
        .ocr-full-table td.col-numeric .compact-input { text-align: right; font-family: 'IBM Plex Mono', monospace; }
        
        .row-num { font-size: 12.5px; color: var(--ink-soft); font-family: 'IBM Plex Mono', monospace; padding-top: 16px !important; }
        
        /* Inputs */
        .ocr-full-table input.compact-input { padding: 6px 6px; border: 1px solid transparent; border-radius: 4px; font-size: 13px; background: transparent; transition: 0.2s; box-sizing: border-box; font-family: inherit; color: var(--ink); min-width: 0; }
        .ocr-full-table input.compact-input:hover, .ocr-full-table input.compact-input:focus { border-color: var(--line); background: var(--paper); outline: none; }
        .fw-bold { font-weight: 600; }
        
        .ocr-full-table input.status-pill-input { background: var(--teal-mist); color: var(--teal-dark); border-radius: 12px; padding: 4px 8px; font-weight: 600; font-size: 12px; text-align: center; }
        .ocr-full-table input.status-pill-input:hover, .ocr-full-table input.status-pill-input:focus { background: var(--paper); border-color: var(--teal); }
        
        /* Read-only styles */
        .read-only-cell { padding: 6px 6px; font-size: 13px; color: var(--ink); border: 1px solid transparent; }
        .read-only-cell.status-pill-input { background: var(--teal-mist); color: var(--teal-dark); border-radius: 12px; padding: 4px 8px; font-weight: 600; font-size: 12px; text-align: center; }
        .numeric-col.read-only-cell { font-family: 'IBM Plex Mono', monospace; }
        
        /* Needs Review */
        .row-warning td { border-bottom: 1px solid var(--amber) !important; background: var(--amber-mist); }
        .row-warning { border-left: 3px solid var(--amber); }
        .needs-review-pill { display: inline-block; background: var(--amber); color: white; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-top: 8px; white-space: nowrap; }
        
        .btn-delete { background: none; border: none; color: var(--ink-soft); cursor: pointer; padding: 6px; border-radius: 4px; transition: 0.2s; margin-top: 2px; }
        .btn-delete:hover { background: var(--red-mist); color: var(--red); }
        
        .ocr-no-items { padding: 40px; text-align: center; color: var(--ink-soft); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .btn-add-item { display: inline-flex; align-items: center; gap: 8px; background: var(--paper); border: 1px solid var(--line); padding: 8px 16px; border-radius: 6px; font-weight: 500; color: var(--ink); cursor: pointer; margin-top: 8px; }
        .btn-add-item:hover { background: var(--canvas); }
        
        .table-footer { padding: 16px; border-top: 1px solid var(--line); background: var(--paper); }
        .btn-add-item-sm { display: inline-flex; align-items: center; gap: 6px; background: var(--canvas); border: 1px solid var(--line); padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; color: var(--ink); cursor: pointer; }
        .btn-add-item-sm:hover { border-color: var(--ink-soft); }
        
        /* Additional Notes (KV fallback tables) */
        .ocr-additional-notes { padding: 16px 20px; border-top: 1px solid var(--line); background: var(--canvas); }
        .notes-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-soft); margin-bottom: 8px; }
        .notes-list { margin: 0; padding-left: 18px; list-style: disc; }
        .notes-list li { font-size: 13px; color: var(--ink-soft); padding: 2px 0; font-family: 'IBM Plex Mono', monospace; }
        
        /* Totals */
        .ocr-summary-panel { margin-left: auto; width: 100%; max-width: 400px; }
        .summary-box { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; color: var(--ink-soft); }
        .summary-row input.numeric-col { width: 140px; text-align: right; padding: 8px 12px; border: 1px solid var(--line); border-radius: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--ink); background: var(--paper); }
        .summary-row input[readonly].numeric-col { background: var(--canvas); border-color: transparent; font-weight: 500; }
        .summary-row.grand-total { margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--line); font-size: 16px; font-weight: 600; color: var(--ink); }
        .summary-row.grand-total input.total-val { font-size: 16px; font-weight: 600; background: var(--canvas); color: var(--teal-dark); border-color: transparent; }
        
        .ocr-validation-warning { background: var(--amber-mist); border: 1px solid var(--amber); color: var(--amber); padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-weight: 500; font-size: 14px; margin-top: 24px; }
        
        /* Actions */
        .ocr-bottom-actions { display: flex; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--line); flex-wrap: wrap; }
        .btn-action { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s; border: none; font-family: 'Inter', sans-serif; }
        .btn-action.primary { background: var(--teal); color: white; }
        .btn-action.primary:hover { background: var(--teal-dark); }
        .btn-action.outline { background: var(--paper); border: 1px solid var(--line); color: var(--ink); }
        .btn-action.outline:hover { background: var(--canvas); border-color: var(--ink-soft); }
        
        .btn-clear-text { background: none; border: none; color: var(--ink-soft); font-weight: 500; font-size: 14px; cursor: pointer; margin-left: auto; padding: 10px 20px; border-radius: 8px; transition: 0.2s; }
        .btn-clear-text:hover { color: var(--ink); background: var(--line); }
        
        /* Summary Row Styling */
        .row-summary td { background: var(--teal-mist) !important; border-top: 1px solid var(--teal) !important; border-bottom: 1px solid var(--teal) !important; }
        .row-summary textarea { font-weight: 700 !important; color: var(--teal-dark) !important; }
        
        /* Payroll Footer */
        .ocr-payroll-footer { margin-top: 24px; padding: 20px; background: var(--paper); border: 1px solid var(--line); border-radius: 8px; display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 500px; margin-left: auto; }
        .payroll-net { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 600; color: var(--ink); border-bottom: 1px solid var(--line); padding-bottom: 12px; }
        .payroll-amount { color: var(--teal-dark); font-family: 'IBM Plex Mono', monospace; font-size: 18px; }
        .payroll-words { display: flex; flex-direction: column; gap: 4px; }
        .payroll-words span { font-size: 12px; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.5px; }
        .payroll-words p { margin: 0; font-size: 14px; color: var(--ink); font-weight: 500; }
      `}</style>
    </div>
  );
};
export default OCR;
