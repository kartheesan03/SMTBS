import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
  Upload, AlertTriangle, CheckCircle2, File,
  Search, Download, Loader2, Save, ArrowLeft,
  FileText, CheckCheck, XCircle, Plus, Trash2,
  ChevronRight, Eye, Edit3, Shield, RefreshCw,
  ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize, Image as ImageIcon,
  Clock, User, Filter, ExternalLink, Check, X, History, Info
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import "./DocumentIntelligence.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/bmp", "image/webp", "image/tiff", "image/gif"];
const ALL_SUPPORTED_TYPES = [
  ...IMAGE_TYPES,
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword"
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileExt = (name) => {
  if (!name) return "FILE";
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
};

const getConfidenceClass = (score) => {
  if (!score && score !== 0) return "";
  if (score >= 0.95) return "high";
  if (score >= 0.80) return "medium";
  return "low";
};

const getConfidenceColor = (scoreStr) => {
  const score = parseFloat(scoreStr);
  if (isNaN(score)) return "var(--ink-mid)";
  if (score >= 95) return "var(--green)";
  if (score >= 80) return "var(--orange)";
  return "var(--red)";
};

const getCellObj = (cell) => {
  if (typeof cell === "object" && cell !== null) {
    return { value: cell.value ?? "", confidence: cell.confidence ?? 1.0, bbox: cell.bbox || null };
  }
  return { value: cell ?? "", confidence: 1.0, bbox: null };
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ─── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Processing: "status-processing",
    Extracted: "status-extracted",
    "Needs Review": "status-needs-review",
    "Pending Approval": "status-needs-review",
    Approved: "status-approved",
    Rejected: "status-rejected",
    Failed: "status-failed",
    Uploaded: "status-uploaded",
    Edited: "status-extracted",
  };
  return (
    <span className={`status-badge ${map[status] || ""}`}>{status}</span>
  );
};

// ─── Processing Steps Indicator ────────────────────────────────────────────────
const STEPS = [
  { label: "Uploading file…", duration: 400 },
  { label: "Analysing image quality…", duration: 600 },
  { label: "Enhancing image…", duration: 900 },
  { label: "Extracting text (AI/OCR)…", duration: 1000 },
  { label: "Understanding document structure…", duration: 700 },
  { label: "Building structured table…", duration: 500 },
  { label: "Validating extracted data…", duration: 500 },
  { label: "Finalising results…", duration: 400 },
];

const ProcessingSteps = ({ active }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    let idx = 0;
    const advance = () => {
      idx++;
      if (idx < STEPS.length - 1) {
        setStep(idx);
        setTimeout(advance, STEPS[idx].duration);
      } else {
        setStep(STEPS.length - 1);
      }
    };
    setTimeout(advance, STEPS[0].duration);
    return () => { idx = STEPS.length; };
  }, [active]);

  return (
    <div className="processing-steps">
      {STEPS.map((s, i) => (
        <div key={i} className={`step-indicator ${i === step ? "active" : i < step ? "done" : ""}`}>
          {i < step
            ? <CheckCircle2 size={15} className="step-done-icon" />
            : i === step
              ? <Loader2 size={15} className="animate-spin step-spin-icon" />
              : <div className="step-dot" />}
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Interactive Viewer Component ─────────────────────────────────────────────
const InteractiveViewer = ({ previewUrl, file, imgNaturalSize, allBboxes, activeBbox, onCellFocus, setImgNaturalSize, showBboxes, isEnhanced }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const handleZoomIn = () => setScale(s => Math.min(s * 1.25, 6));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.25, 0.15));
  const handleReset = () => { setScale(1); setPos({ x: 0, y: 0 }); setRotation(0); };
  const handleRotateL = () => setRotation(r => r - 90);
  const handleRotateR = () => setRotation(r => r + 90);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const handleMouseDown = (e) => { setIsDragging(true); setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y }); };
  const handleMouseMove = (e) => { if (!isDragging) return; setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  if (file?.type === "application/pdf") {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <object data={previewUrl} type="application/pdf" style={{ width: "100%", height: "100%", minHeight: 600 }}>
          <p style={{ padding: 24, color: "var(--ink-soft)", fontSize: 13 }}>
            PDF preview not available in this browser. Use the download button to view the original.
          </p>
        </object>
      </div>
    );
  }

  return (
    <div className={`viewer-wrapper ${isFullscreen ? "fullscreen-viewer" : ""}`} ref={containerRef}>
      <div className="viewer-toolbar">
        <button className="btn-icon" onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={15} /></button>
        <button className="btn-icon" onClick={handleZoomIn} title="Zoom In"><ZoomIn size={15} /></button>
        <button className="btn-icon" onClick={handleRotateL} title="Rotate Left"><RotateCcw size={15} /></button>
        <button className="btn-icon" onClick={handleRotateR} title="Rotate Right"><RotateCw size={15} /></button>
        <button className="btn-icon" title="Reset View" onClick={handleReset} style={{ fontSize: 11, padding: "0 4px", width: "auto" }}>Reset</button>
        <button className="btn-icon" onClick={toggleFullscreen} title="Toggle Fullscreen"><Maximize size={15} /></button>
      </div>

      <div
        className="viewer-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab", filter: isEnhanced ? "contrast(1.2) saturate(1.1) brightness(1.05)" : "none" }}
      >
        <div className="viewer-content" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale}) rotate(${rotation}deg)` }}>
          <img
            src={previewUrl}
            alt="Document Preview"
            onLoad={(e) => setImgNaturalSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
            draggable="false"
          />
          {showBboxes && imgNaturalSize && allBboxes.map((b, i) => {
            const [x0, y0, x1, y1] = b.bbox;
            const w = imgNaturalSize.w;
            const h = imgNaturalSize.h;
            const isActive = activeBbox && activeBbox.join(",") === b.bbox.join(",");
            return (
              <div
                key={i}
                className={`bbox-overlay ${b.confidence < 0.8 ? "low-confidence" : ""} ${isActive ? "active" : ""}`}
                style={{ left: `${(x0 / w) * 100}%`, top: `${(y0 / h) * 100}%`, width: `${((x1 - x0) / w) * 100}%`, height: `${((y1 - y0) / h) * 100}%` }}
                onClick={(e) => { e.stopPropagation(); onCellFocus(b.bbox); }}
                title={`Confidence: ${(b.confidence * 100).toFixed(1)}%`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Dynamic Table Component ───────────────────────────────────────────────────
const DynamicOCRTable = ({ section, sIdx, canEdit, onDataChange, onDeleteRow, onDeleteColumn, onRenameColumn, activeBbox, onCellFocus }) => {
  const { headers = [], rows = [], type } = section;

  if (!headers.length && !rows.length) {
    return (
      <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
        No structured data extracted in this section.
      </div>
    );
  }

  return (
    <div className="ocr-table-wrapper">
      <table className={`ocr-table ${type === "key-value" ? "kv-table" : ""}`}>
        <thead>
          <tr>
            {headers.map((col, cIdx) => (
              <th key={cIdx}>
                {canEdit ? (
                  <div className="th-inner">
                    <input
                      className="col-rename-input"
                      defaultValue={col}
                      onBlur={(e) => onRenameColumn(sIdx, cIdx, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                    />
                    {type !== "key-value" && <button className="btn-col-del" onClick={() => onDeleteColumn(sIdx, cIdx)} title="Delete column">×</button>}
                  </div>
                ) : col}
              </th>
            ))}
            {canEdit && type !== "key-value" && <th className="th-actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {headers.map((header, cIdx) => {
                const cellObj = getCellObj(row[cIdx]);
                const isLowConf = cellObj.confidence < 0.8;
                const isActive = activeBbox && cellObj.bbox && activeBbox.join(",") === cellObj.bbox.join(",");
                const isConfidenceCol = header.toLowerCase() === "confidence";
                const style = isConfidenceCol ? { color: getConfidenceColor(cellObj.value) } : {};
                return (
                  <td
                    key={cIdx}
                    className={`${isLowConf ? "table-cell-warning" : ""} ${isActive ? "table-cell-active" : ""}`}
                    onClick={() => onCellFocus(cellObj.bbox)}
                    style={style}
                    title={isLowConf ? `⚠ Low confidence: ${(cellObj.confidence * 100).toFixed(1)}%` : ""}
                  >
                    {canEdit ? (
                      <input
                        className="cell-input"
                        value={cellObj.value}
                        onChange={(e) => onDataChange(sIdx, rIdx, cIdx, e.target.value)}
                        onFocus={() => onCellFocus(cellObj.bbox)}
                        style={style}
                      />
                    ) : (
                      <span>{cellObj.value}</span>
                    )}
                  </td>
                );
              })}
              {canEdit && type !== "key-value" && (
                <td style={{ textAlign: "center", width: 36, padding: "4px 6px" }}>
                  <button className="btn-row-del" onClick={() => onDeleteRow(sIdx, rIdx)} title="Delete row">×</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <XCircle size={18} color="var(--red)" />
          <span>Reject Document</span>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "var(--ink-mid)", marginBottom: 12 }}>
            Please provide a reason for rejection. This will be stored in the document history.
          </p>
          <textarea
            className="modal-textarea"
            placeholder="e.g. OCR extraction inaccurate, wrong document type, data incomplete…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger btn-sm" onClick={() => onConfirm(reason)} disabled={!reason.trim()}>
            <XCircle size={13} /> Reject Document
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── History Panel ──────────────────────────────────────────────────────────────
const HistoryPanel = ({ history }) => {
  if (!history || !history.length) {
    return <div style={{ padding: 20, color: "var(--ink-soft)", fontSize: 13 }}>No processing history available.</div>;
  }
  const actionColor = {
    Created: "var(--blue)",
    Edited: "var(--orange)",
    Approved: "var(--green)",
    Rejected: "var(--red)",
  };
  return (
    <div className="history-timeline">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="history-entry">
          <div className="history-dot" style={{ background: actionColor[h.action] || "var(--ink-faint)" }} />
          <div className="history-content">
            <div className="history-action" style={{ color: actionColor[h.action] || "var(--ink-mid)" }}>{h.action}</div>
            <div className="history-meta">
              <User size={11} /> {h.userName || "Unknown"} &nbsp;·&nbsp; <Clock size={11} /> {formatDate(h.timestamp)}
            </div>
            {h.note && <div className="history-note">{h.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DocumentIntelligence = () => {
  const { user } = useContext(AuthContext);
  // SECURITY: Only Admin can edit. All other roles are view-only.
  const canEdit = user?.role === "Admin";
  const canUpload = true;

  // Workflow: idle | processing | extracted | failed | viewing
  const [workflowState, setWorkflowState] = useState("idle");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractionData, setExtractionData] = useState(null);
  const [errorDetails, setErrorDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Viewer state
  const [imgNaturalSize, setImgNaturalSize] = useState(null);
  const [activeBbox, setActiveBbox] = useState(null);
  const [showBboxes] = useState(true);
  const [activeTab, setActiveTab] = useState("Structured Data");

  // History Library state
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeDoc, setActiveDoc] = useState(null); // document loaded from history

  // Admin actions state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // ─── Load document history ─────────────────────────────────────────────────
  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await API.get("/ocr-documents");
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Silently fail — table just won't show data
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (workflowState === "idle") loadDocuments();
  }, [workflowState, loadDocuments]);

  // ─── File Handling ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    const fileExt = selectedFile.name.split(".").pop().toLowerCase();
    const validExtensions = ["pdf", "doc", "docx", "png", "jpg", "jpeg", "tiff", "tif", "bmp", "webp", "gif", "jfif"];
    if (!ALL_SUPPORTED_TYPES.includes(selectedFile.type) && !validExtensions.includes(fileExt)) {
      toast.error(`Unsupported file type: ${fileExt}`); return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) { toast.error("File exceeds 50 MB limit."); return; }

    setFile(selectedFile);
    setExtractionData(null);
    setActiveDoc(null);
    setErrorDetails("");
    setImgNaturalSize(null);
    setActiveBbox(null);
    setIsEnhanced(false);
    setActiveTab("Structured Data");

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    performExtraction(selectedFile);
  };

  const performExtraction = async (fileToProcess) => {
    setWorkflowState("processing");
    setErrorDetails("");

    const formData = new FormData();
    formData.append("file", fileToProcess);

    try {
      const response = await API.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000
      });

      const data = response.data;

      // Compute confidence warnings
      const warnings = [];
      (data.sections || []).forEach(sec => {
        (sec.rows || []).forEach(row => {
          row.forEach(cell => {
            const obj = getCellObj(cell);
            if (obj.confidence < 0.8) {
              warnings.push(`Low confidence on value: '${obj.value}'`);
            }
          });
        });
      });
      data._warnings = warnings;

      setExtractionData(data);
      setIsEnhanced(true);
      setWorkflowState("extracted");
      toast.success("Extraction complete.");
    } catch (err) {
      setWorkflowState("failed");
      const msg = err.response?.data?.error || err.message || "Failed to extract data.";
      const friendly = msg.includes("ECONNREFUSED")
        ? "OCR service is offline. Please start the Python OCR service and try again."
        : msg.includes("timeout")
          ? "OCR timed out. Please try a smaller or clearer image."
          : msg;
      setErrorDetails(friendly);
      toast.error("Extraction failed.");
    }
  };

  // ─── Table Editing ─────────────────────────────────────────────────────────
  const handleDataChange = (sectionIdx, rowIdx, colIdx, val) => {
    if (!canEdit) return;
    setExtractionData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i !== sectionIdx ? s : {
        ...s,
        rows: s.rows.map((r, j) => j !== rowIdx ? r : r.map((c, k) => k !== colIdx ? c :
          typeof c === "object" && c !== null ? { ...c, value: val, confidence: 1.0 } : { value: val, confidence: 1.0, bbox: null }
        ))
      }),
      _warnings: []
    }));
  };

  const addRow = (sectionIdx) => {
    if (!canEdit) return;
    setExtractionData(prev => {
      const section = prev.sections[sectionIdx];
      const newRow = new Array(section.headers?.length || 0).fill(null).map(() => ({ value: "", confidence: 1.0, bbox: null }));
      return { ...prev, sections: prev.sections.map((s, i) => i !== sectionIdx ? s : { ...s, rows: [...s.rows, newRow] }) };
    });
  };

  const deleteRow = (sectionIdx, rowIdx) => {
    if (!canEdit) return;
    setExtractionData(prev => ({ ...prev, sections: prev.sections.map((s, i) => i !== sectionIdx ? s : { ...s, rows: s.rows.filter((_, j) => j !== rowIdx) }) }));
  };

  const addColumn = (sectionIdx) => {
    if (!canEdit) return;
    const colName = window.prompt("Enter new column name:");
    if (!colName) return;
    setExtractionData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i !== sectionIdx ? s : {
        ...s,
        headers: [...(s.headers || []), colName],
        rows: s.rows.map(r => [...r, { value: "", confidence: 1.0, bbox: null }])
      })
    }));
  };

  const deleteColumn = (sectionIdx, colIdx) => {
    if (!canEdit) return;
    if (!window.confirm("Delete this column?")) return;
    setExtractionData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i !== sectionIdx ? s : {
        ...s,
        headers: s.headers.filter((_, k) => k !== colIdx),
        rows: s.rows.map(r => r.filter((_, k) => k !== colIdx))
      })
    }));
  };

  const renameColumn = (sectionIdx, colIdx, newCol) => {
    if (!canEdit || !newCol) return;
    setExtractionData(prev => ({
      ...prev,
      sections: prev.sections.map((s, i) => i !== sectionIdx ? s : {
        ...s,
        headers: s.headers.map((c, k) => k === colIdx ? newCol : c)
      })
    }));
  };

  // ─── Export ────────────────────────────────────────────────────────────────
  const handleExport = async (type) => {
    try {
      toast.loading(`Generating ${type.toUpperCase()}…`, { id: "export" });
      const payload = activeDoc
        ? { sections: activeDoc.tables, rawText: activeDoc.rawText, document: { type: activeDoc.documentType } }
        : extractionData;
      const response = await API.post(`/ocr/export/${type}`, payload, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const ext = type === "excel" ? "xlsx" : type;
      link.setAttribute("download", `${(file?.name || activeDoc?.fileName || "document").replace(/\.[^.]+$/, "")}_export.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(`${type.toUpperCase()} exported successfully.`, { id: "export" });
    } catch {
      toast.error(`Export to ${type} failed.`, { id: "export" });
    }
  };

  // ─── Save & Approve ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canEdit || !extractionData) return;
    setIsSaving(true);
    try {
      const requiresReview = extractionData._warnings?.length > 0;
      const payload = {
        fileName: file?.name || activeDoc?.fileName || "Untitled",
        module: "OCR",
        documentType: extractionData?.document?.type || "Unknown",
        fileUrl: extractionData?.fileUrl || activeDoc?.fileUrl || null,
        tables: extractionData?.sections || [],
        details: extractionData?.document?.details || {},
        rawText: extractionData?.rawText || "",
        confidence: extractionData?.document?.confidence || 0,
        status: requiresReview ? "Needs Review" : "Pending Approval"
      };
      
      const savedId = extractionData._savedId || activeDoc?.id;
      if (savedId) {
        await API.put(`/ocr-documents/${savedId}`, payload);
        toast.success("Document updated successfully.");
      } else {
        const res = await API.post("/ocr-documents", payload);
        toast.success("Document saved successfully.");
        setExtractionData(prev => ({ ...prev, _savedId: res.data.document?.id }));
      }
      loadDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save document.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!canEdit) return;
    setIsActionLoading(true);
    try {
      const requiresReview = extractionData?._warnings?.length > 0;
      const savedId = extractionData?._savedId;

      if (savedId) {
        // Approve the already-saved document
        await API.post(`/ocr-documents/${savedId}/approve`);
      } else {
        // Save and approve in one step
        const payload = {
          fileName: file?.name || "Untitled",
          module: "OCR",
          documentType: extractionData?.document?.type || "Unknown",
          tables: extractionData?.sections || [],
          details: extractionData?.document?.details || {},
          rawText: extractionData?.rawText || "",
          confidence: extractionData?.document?.confidence || 0,
          status: "Approved"
        };
        await API.post("/ocr-documents", payload);
      }
      toast.success("Document approved and saved.");
      handleBack();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve document.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // ─── History Doc Actions ───────────────────────────────────────────────────
  const handleApproveDoc = async (docId) => {
    setIsActionLoading(true);
    try {
      await API.post(`/ocr-documents/${docId}/approve`);
      toast.success("Document approved.");
      loadDocuments();
      if (activeDoc?.id === docId) setActiveDoc(prev => ({ ...prev, status: "Approved" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectDoc = async (docId, reason) => {
    setIsActionLoading(true);
    try {
      await API.post(`/ocr-documents/${docId}/reject`, { reason });
      toast.success("Document rejected.");
      setShowRejectModal(false);
      loadDocuments();
      if (activeDoc?.id === docId) setActiveDoc(prev => ({ ...prev, status: "Rejected", rejectReason: reason }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Rejection failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Permanently delete this OCR document?")) return;
    try {
      await API.delete(`/ocr-documents/${docId}`);
      toast.success("Document deleted.");
      loadDocuments();
      handleBack();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed.");
    }
  };

  const handleViewDoc = (doc) => {
    setActiveDoc(doc);
    setFile(null);
    setPreviewUrl(doc.fileUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${doc.fileUrl}` : null);
    setExtractionData({ sections: doc.tables, rawText: doc.rawText, document: { type: doc.documentType, confidence: doc.confidence } });
    setActiveTab("Structured Data");
    setWorkflowState("viewing");
  };

  const handleBack = () => {
    setWorkflowState("idle");
    setExtractionData(null);
    setActiveDoc(null);
    setFile(null);
    setPreviewUrl(null);
    setImgNaturalSize(null);
    setActiveBbox(null);
    setIsEnhanced(false);
    setShowRejectModal(false);
  };

  // ─── Derived ───────────────────────────────────────────────────────────────
  const allBboxes = [];
  if (extractionData) {
    (extractionData.sections || []).forEach(sec => {
      (sec.rows || []).forEach(row => {
        row.forEach(cell => {
          const obj = getCellObj(cell);
          if (obj.bbox) allBboxes.push(obj);
        });
      });
    });
  }

  const docName = file?.name || activeDoc?.fileName || "Untitled Document";
  const confidence = extractionData?.document?.confidence;
  const confClass = getConfidenceClass(confidence);
  const requiresReview = extractionData?._warnings?.length > 0;

  const filteredDocs = documents.filter(doc => {
    const matchSearch = doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploaderName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "All" || doc.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const STATUS_FILTERS = ["All", "Extracted", "Needs Review", "Pending Approval", "Approved", "Rejected", "Failed"];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="doc-intel-workspace">

      {/* ═══ IDLE STATE ══════════════════════════════════════════════════════════ */}
      {workflowState === "idle" && (
        <>
          <PageHeader
            title="Document Intelligence"
            badge="AI OCR"
            subtitle="Upload any document or image to automatically extract structured data using AI-powered OCR."
          />
          <div className="doc-intel-main">

            {/* Upload Zone */}
            <div
              className={`doc-intel-workspace-center${isDragging ? " dragging" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="empty-state">
                <div className="upload-icon-wrap">
                  <Upload size={32} color={isDragging ? "var(--blue)" : "var(--ink-soft)"} />
                </div>
                <h2>Drag & Drop any document or image</h2>
                <p>PDF • DOC • DOCX • PNG • JPG • BMP • TIFF • WEBP & more supported</p>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.tiff,.tif,.bmp,.webp,.gif,.jfif" />
                  <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                    <Plus size={14} /> Browse Files
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-faint)" }}>Max 50 MB · Secure processing · Files are not stored permanently</p>
              </div>
            </div>

            {/* Document Library */}
            <div className="doc-library">
              <div className="doc-library-header">
                <FileText size={15} color="var(--ink-soft)" />
                <span>OCR Document History</span>
                <span className="doc-count-badge">{documents.length}</span>
                <button className="btn-icon" style={{ marginLeft: "auto" }} onClick={loadDocuments} title="Refresh">
                  <RefreshCw size={14} className={loadingDocs ? "animate-spin" : ""} />
                </button>
              </div>



              {loadingDocs ? (
                <div style={{ padding: "32px", textAlign: "center" }}>
                  <Loader2 size={20} className="animate-spin" color="var(--blue)" />
                </div>
              ) : filteredDocs.length === 0 ? (
                <div style={{ padding: "32px", textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
                  {searchQuery || filterStatus !== "All" ? "No documents match your filters." : "No OCR documents saved yet. Upload a file to get started."}
                </div>
              ) : (
                <table className="doc-library-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>Type</th>
                      <th>Confidence</th>
                      <th>Status</th>
                      <th>Uploaded By</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map(doc => (
                      <tr key={doc.id} onClick={() => handleViewDoc(doc)} style={{ cursor: "pointer" }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FileText size={14} color="var(--blue)" />
                            <span style={{ fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {doc.fileName}
                            </span>
                          </div>
                        </td>
                        <td><span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{doc.documentType || "—"}</span></td>
                        <td>
                          {doc.confidence != null ? (
                            <span className={`confidence-pill ${getConfidenceClass(doc.confidence)}`}>
                              {(doc.confidence * 100).toFixed(0)}%
                            </span>
                          ) : "—"}
                        </td>
                        <td><StatusBadge status={doc.status} /></td>
                        <td style={{ fontSize: 12, color: "var(--ink-soft)" }}>{doc.uploaderName || "—"}</td>
                        <td style={{ fontSize: 12, color: "var(--ink-soft)" }}>{formatDate(doc.createdAt)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-outline btn-xs" onClick={() => handleViewDoc(doc)} title="View">
                              <Eye size={11} /> View
                            </button>
                            {canEdit && doc.status !== "Approved" && (
                              <button className="btn btn-xs" style={{ background: "var(--green-mist)", color: "var(--green)", border: "1px solid var(--green-light)" }} onClick={() => handleApproveDoc(doc.id)} title="Approve">
                                <Check size={11} />
                              </button>
                            )}
                            {canEdit && doc.status !== "Rejected" && (
                              <button className="btn btn-xs" style={{ background: "var(--red-mist)", color: "var(--red)", border: "1px solid var(--red-light)" }} onClick={() => { setActiveDoc(doc); setShowRejectModal(true); }} title="Reject">
                                <X size={11} />
                              </button>
                            )}
                            {canEdit && (
                              <button className="btn btn-xs" style={{ background: "var(--red-mist)", color: "var(--red)", border: "1px solid var(--red-light)" }} onClick={() => handleDeleteDoc(doc.id)} title="Delete">
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══ PROCESSING STATE ════════════════════════════════════════════════════ */}
      {workflowState === "processing" && (
        <div className="doc-intel-main" style={{ padding: "0 32px 32px" }}>
          <PageHeader title="Document Intelligence" badge="AI OCR" subtitle="Processing your document — please wait." />
          <div className="upload-status">
            <div className="upload-meta">
              <div className="meta-item"><span>File</span><span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file?.name}</span></div>
              <div className="meta-item"><span>Format</span><span>{getFileExt(file?.name)}</span></div>
              <div className="meta-item"><span>Size</span><span>{formatBytes(file?.size)}</span></div>
            </div>
            <ProcessingSteps active={true} />
          </div>
        </div>
      )}

      {/* ═══ FAILED STATE ════════════════════════════════════════════════════════ */}
      {workflowState === "failed" && (
        <div className="doc-intel-main" style={{ padding: "32px" }}>
          <div className="error-container">
            <AlertTriangle size={36} />
            <h3>Extraction Failed</h3>
            <p>{errorDetails || "An unknown error occurred during OCR processing."}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={() => performExtraction(file)}>
                <RefreshCw size={14} /> Retry Extraction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXTRACTED / VIEWING STATE ═══════════════════════════════════════════ */}
      {(workflowState === "extracted" || workflowState === "viewing") && extractionData && (
        <div className="ocr-review-workspace animate-fadein">

          {/* Top Action Bar */}
          <div className="ocr-top-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="btn btn-ghost btn-sm" onClick={handleBack}>
                <ArrowLeft size={14} /> Back
              </button>
              <div className="ocr-top-bar-divider" />
              <div className="ocr-top-bar-info">
                <div className="ocr-top-bar-title">{docName}</div>
                <div className="ocr-top-bar-sub">
                  <StatusBadge status={activeDoc?.status || (requiresReview ? "Needs Review" : "Extracted")} />
                  {confidence != null && (
                    <span className={`confidence-pill ${confClass}`}>
                      Accuracy: {(confidence * 100).toFixed(1)}%
                    </span>
                  )}
                  {canEdit
                    ? <span className="role-badge"><Edit3 size={10} /> Editing Enabled</span>
                    : <span className="role-badge view-only"><Shield size={10} /> View Only</span>
                  }
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <button className="btn btn-outline btn-sm" onClick={() => handleExport("txt")}>
                <Download size={13} /> TXT
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleExport("docx")}>
                <Download size={13} /> DOCX
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleExport("excel")}>
                <Download size={13} /> Excel
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleExport("pdf")}>
                <Download size={13} /> PDF
              </button>

              {canEdit && (workflowState === "extracted" || workflowState === "viewing") && (
                <button className="btn btn-outline btn-sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save
                </button>
              )}

              {canEdit && (workflowState === "extracted" || (workflowState === "viewing" && activeDoc?.status !== "Approved")) && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={workflowState === "viewing" ? () => handleApproveDoc(activeDoc.id) : handleApprove}
                  disabled={isActionLoading || isSaving}
                >
                  {isActionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                  Approve
                </button>
              )}

              {canEdit && workflowState === "viewing" && activeDoc?.status !== "Rejected" && (
                <button className="btn btn-danger btn-sm" onClick={() => setShowRejectModal(true)} disabled={isActionLoading}>
                  <XCircle size={13} /> Reject
                </button>
              )}

              {canEdit && workflowState === "viewing" && (
                <button className="btn btn-outline btn-sm" style={{ color: "var(--red)", borderColor: "var(--red-light)" }} onClick={() => handleDeleteDoc(activeDoc.id)}>
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Two-panel body */}
          <div className="ocr-panels">
            {/* Left: Document Preview */}
            <div className="ocr-left-panel">
              <div className="ocr-left-panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ImageIcon size={15} color="var(--ink-soft)" />
                  <span className="ocr-file-name">{docName}</span>
                </div>
                {previewUrl && (
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className={`btn btn-xs ${!isEnhanced ? "btn-primary" : "btn-outline"}`} onClick={() => setIsEnhanced(false)}>Original</button>
                    <button className={`btn btn-xs ${isEnhanced ? "btn-primary" : "btn-outline"}`} onClick={() => setIsEnhanced(true)}>Enhanced</button>
                  </div>
                )}
              </div>
              {previewUrl ? (
                <InteractiveViewer
                  previewUrl={previewUrl}
                  file={file}
                  imgNaturalSize={imgNaturalSize}
                  setImgNaturalSize={setImgNaturalSize}
                  allBboxes={allBboxes}
                  activeBbox={activeBbox}
                  onCellFocus={setActiveBbox}
                  showBboxes={showBboxes}
                  isEnhanced={isEnhanced}
                />
              ) : (
                <div className="ocr-preview-empty">
                  <div className="ocr-preview-empty-icon"><FileText size={28} color="var(--ink-faint)" /></div>
                  <h4>No image preview</h4>
                  <p>Document preview is unavailable for historical records.</p>
                </div>
              )}
            </div>

            {/* Right: Extracted Data */}
            <div className="ocr-right-panel">
              <div className="ocr-right-panel-header" style={{ padding: 0 }}>
                <div style={{ display: "flex", borderBottom: "1px solid var(--line)", width: "100%" }}>
                  {["Structured Data", "OCR Text", "History"].map(tab => (
                    <button
                      key={tab}
                      className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >{tab}</button>
                  ))}
                </div>
              </div>

              <div className="ocr-right-panel-body">

                {/* Non-admin view-only banner */}
                {!canEdit && (
                  <div className="view-only-banner">
                    <Shield size={15} />
                    <div>
                      <strong>View Only</strong> — You can view extracted data but cannot edit or approve documents.
                      Contact an Admin for modifications.
                    </div>
                  </div>
                )}

                {/* Review required warning */}
                {requiresReview && activeTab === "Structured Data" && (
                  <div className="warning-banner">
                    <AlertTriangle size={18} />
                    <div>
                      <strong style={{ display: "block", marginBottom: 2 }}>
                        {extractionData._warnings.length} field{extractionData._warnings.length > 1 ? "s" : ""} require review
                      </strong>
                      <div style={{ fontSize: 12 }}>Highlighted cells have low confidence. Please review before approving.</div>
                    </div>
                  </div>
                )}

                {/* Structured Data Tab */}
                {activeTab === "Structured Data" && (
                  <>
                    {(extractionData.sections || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px", color: "var(--ink-soft)", fontSize: 13 }}>
                        No structured data could be extracted from this document.
                      </div>
                    ) : (
                      (extractionData.sections || []).map((section, sIdx) => (
                        <div key={sIdx} className="ocr-section-card" style={{ marginBottom: 16 }}>
                          <div className="ocr-section-card-header">
                            <div className="ocr-section-card-title">
                              {section.title}
                              <span className="ocr-section-type-badge">{section.type}</span>
                            </div>
                            {canEdit && section.type === "table" && (
                              <div className="ocr-section-actions">
                                <button className="btn btn-outline btn-xs" onClick={() => addColumn(sIdx)}>
                                  <Plus size={10} /> Col
                                </button>
                                <button className="btn btn-outline btn-xs" onClick={() => addRow(sIdx)}>
                                  <Plus size={10} /> Row
                                </button>
                              </div>
                            )}
                          </div>
                          <DynamicOCRTable
                            section={section}
                            sIdx={sIdx}
                            canEdit={canEdit && workflowState === "extracted"}
                            onDataChange={handleDataChange}
                            onDeleteRow={deleteRow}
                            onDeleteColumn={deleteColumn}
                            onRenameColumn={renameColumn}
                            activeBbox={activeBbox}
                            onCellFocus={setActiveBbox}
                          />
                        </div>
                      ))
                    )}
                  </>
                )}

                {/* OCR Text Tab */}
                {activeTab === "OCR Text" && (
                  <div className="ocr-section-card">
                    <div className="ocr-section-card-header">
                      <div className="ocr-section-card-title">Raw Extracted Text</div>
                    </div>
                    {extractionData.rawText ? (
                      <div style={{ padding: "16px", fontSize: "13px", fontFamily: "monospace", whiteSpace: "pre-wrap", background: "#f8f9fa", lineHeight: 1.7 }}>
                        {extractionData.rawText}
                      </div>
                    ) : (
                      <div style={{ padding: "24px", textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
                        No raw text available.
                      </div>
                    )}
                  </div>
                )}

                {/* History Tab */}
                {activeTab === "History" && (
                  <div className="ocr-section-card">
                    <div className="ocr-section-card-header">
                      <div className="ocr-section-card-title"><History size={13} /> Processing History</div>
                    </div>
                    {activeDoc?.rejectReason && (
                      <div style={{ padding: "10px 14px", background: "var(--red-mist)", borderBottom: "1px solid var(--red-light)", fontSize: 13, color: "var(--red)" }}>
                        <strong>Rejection reason:</strong> {activeDoc.rejectReason}
                      </div>
                    )}
                    <HistoryPanel history={activeDoc?.processingHistory} />
                    {activeDoc && (
                      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--ink-soft)", display: "flex", gap: 16 }}>
                        {activeDoc.approvedByName && <span><Check size={11} color="var(--green)" /> Approved by <strong>{activeDoc.approvedByName}</strong> on {formatDate(activeDoc.approvedAt)}</span>}
                        {activeDoc.uploaderName && <span><Upload size={11} /> Uploaded by <strong>{activeDoc.uploaderName}</strong></span>}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REJECT MODAL ════════════════════════════════════════════════════════ */}
      {showRejectModal && activeDoc && (
        <RejectModal
          onConfirm={(reason) => handleRejectDoc(activeDoc.id, reason)}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
};

export default DocumentIntelligence;
