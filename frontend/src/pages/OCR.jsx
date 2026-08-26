import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Upload, AlertTriangle, CheckCircle2, File,
  Search, Download, Loader2, Save, ArrowLeft,
  FileText, CheckCheck, XCircle, Plus, Trash2,
  ChevronRight, Eye, Edit3, Shield
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
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
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
};

// Detects if a column is likely numeric (currency, numbers)
const isNumericCol = (cIdx, rows) => {
  const sample = (rows || []).slice(0, 5).map((r) => String(r[cIdx] || ""));
  const numericCount = sample.filter((v) => /^[\$₹€£¥,\d.\s()-]+$/.test(v.trim()) && v.trim() !== "").length;
  return sample.length > 0 && numericCount / sample.length >= 0.6;
};

// ─── Section Table Component ───────────────────────────────────────────────────
const DynamicOCRTable = ({
  section, sIdx, canEdit,
  onDataChange, onAddRow, onDeleteRow, onAddColumn, onDeleteColumn, onRenameColumn
}) => {
  const { headers = [], rows = [], type, title } = section;

  if (!headers.length && !rows.length) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
        No data extracted in this section.
      </div>
    );
  }

  return (
    <div className="ocr-table-wrapper">
      <table className="ocr-table">
        <thead>
          <tr>
            {headers.map((col, cIdx) => (
              <th
                key={cIdx}
                className={isNumericCol(cIdx, rows) ? "col-numeric" : ""}
              >
                {canEdit ? (
                  <div className="th-inner">
                    <input
                      className="col-rename-input"
                      defaultValue={col}
                      onBlur={(e) => onRenameColumn(sIdx, cIdx, e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                      title="Click to rename column"
                    />
                    <button
                      className="btn-col-del"
                      onClick={() => onDeleteColumn(sIdx, cIdx)}
                      title={`Delete column "${col}"`}
                    >×</button>
                  </div>
                ) : (
                  col
                )}
              </th>
            ))}
            {canEdit && <th className="th-actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {headers.map((_, cIdx) => (
                <td
                  key={cIdx}
                  className={isNumericCol(cIdx, rows) ? "cell-numeric" : ""}
                >
                  {canEdit ? (
                    <input
                      className="cell-input"
                      value={row[cIdx] ?? ""}
                      onChange={(e) => onDataChange(sIdx, rIdx, cIdx, e.target.value)}
                    />
                  ) : (
                    <span>{row[cIdx] ?? ""}</span>
                  )}
                </td>
              ))}
              {canEdit && (
                <td style={{ textAlign: "center", width: 36, padding: "4px 6px" }}>
                  <button
                    className="btn-row-del"
                    onClick={() => onDeleteRow(sIdx, rIdx)}
                    title="Delete row"
                  >×</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const DocumentIntelligence = () => {
  const { user } = useContext(AuthContext);
  const canEdit = ["Admin", "Manager"].includes(user?.role);
  const canUpload = ["Admin", "Manager", "HR", "Sales", "Employee"].includes(user?.role) || true; // Allow all roles as requested

  const [activeDoc, setActiveDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [workflowState, setWorkflowState] = useState("idle"); // idle | processing | extracted | failed
  const [processingStep, setProcessingStep] = useState(0); // 0: uploading, 1: analyzing, 2: extracting, 3: structuring
  const [extractionData, setExtractionData] = useState(null);
  const [errorDetails, setErrorDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);



  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'tiff', 'tif', 'bmp', 'webp', 'gif', 'jfif'];
    const imageExtensions = ['png', 'jpg', 'jpeg', 'tiff', 'tif', 'bmp', 'webp', 'gif', 'jfif'];

    if (!ALL_SUPPORTED_TYPES.includes(selectedFile.type) && !validExtensions.includes(fileExt)) { 
        toast.error(`Unsupported file type: ${selectedFile.type || 'none'} (ext: ${fileExt})`); 
        return; 
    }
    
    if (selectedFile.size > MAX_FILE_SIZE) { toast.error("File exceeds 50MB limit."); return; }

    setFile(selectedFile);
    setExtractionData(null);
    setActiveDoc(null);
    setWorkflowState("processing");
    setErrorDetails("");

    if (IMAGE_TYPES.includes(selectedFile.type) || selectedFile.type === "application/pdf" || imageExtensions.includes(fileExt) || fileExt === "pdf") {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    performExtraction(selectedFile);
  };

  const performExtraction = async (fileToProcess) => {
    setWorkflowState("processing");
    setProcessingStep(0);
    setErrorDetails("");
    
    // Simulate progression steps for UX
    const timers = [
      setTimeout(() => setProcessingStep(1), 1500),
      setTimeout(() => setProcessingStep(2), 3500),
      setTimeout(() => setProcessingStep(3), 6000),
      setTimeout(() => setProcessingStep(4), 8000),
    ];
    const formData = new FormData();
    formData.append("file", fileToProcess);

    try {
      const response = await API.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
      });
      if (response.data && response.data.success !== false) {
        let data = response.data;
        if (!data.sections && data.tables) {
          data.sections = data.tables.map((t) => ({ ...t, type: t.type || "table" }));
        }
        timers.forEach(clearTimeout);
        setExtractionData(data);
        setWorkflowState("extracted");
        toast.success("Document extracted successfully");
      } else {
        throw new Error(response.data.error || "OCR failed.");
      }
    } catch (err) {
      timers.forEach(clearTimeout);
      setWorkflowState("failed");
      setErrorDetails(err.response?.data?.error || err.message || "Failed to extract data.");
      toast.error("Extraction failed.");
    }
  };

  const saveDocumentState = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    try {
      const payload = {
        fileName: file?.name || activeDoc?.fileName || "document",
        module: extractionData.document?.module || "General",
        documentType: extractionData.document?.type || "General Document",
        tables: extractionData.sections,
        details: extractionData.document?.details || {},
        rawText: extractionData.rawText || "",
        confidence: extractionData.document?.confidence || 0,
        status: activeDoc?.status || "Needs Review",
      };

      let res;
      if (activeDoc) {
        res = await API.put(`/ocr-documents/${activeDoc.id}`, payload);
      } else {
        res = await API.post("/ocr-documents", payload);
      }

      setActiveDoc(res.data.document);
      toast.success("Changes saved successfully");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const updateDocumentStatus = async (status) => {
    if (!canEdit) return;
    try {
      if (!activeDoc) {
        await saveDocumentState();
        return;
      }
      await API.put(`/ocr-documents/${activeDoc.id}`, { status });
      toast.success(`Document marked as ${status}`);
      setActiveDoc((prev) => ({ ...prev, status }));
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleExport = async (type) => {
    const loadingToast = toast.loading(`Generating ${type.toUpperCase()}…`);
    try {
      const originalName = file?.name || activeDoc?.fileName || "document";
      const baseName = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
      const exportFileName = `${baseName}_extracted.${type}`;

      const response = await API.post(
        `/ocr/export/${type}?filename=${encodeURIComponent(exportFileName)}`,
        extractionData,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", exportFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${type.toUpperCase()} downloaded!`, { id: loadingToast });
    } catch {
      toast.error(`Failed to generate ${type.toUpperCase()}`, { id: loadingToast });
    }
  };

  const handleDownloadOriginal = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      toast.error("Original file not available for historical documents.");
    }
  };

  // ── Data mutation helpers ──────────────────────────────────────────────────
  const handleDataChange = (sectionIdx, rowIdx, colIdx, val) => {
    if (!canEdit) return;
    setExtractionData((prev) => {
      const n = { ...prev, sections: prev.sections.map((s, i) => i !== sectionIdx ? s : { ...s, rows: s.rows.map((r, j) => j !== rowIdx ? r : r.map((c, k) => k === colIdx ? val : c)) }) };
      return n;
    });
  };

  const addRow = (sectionIdx) => {
    if (!canEdit) return;
    setExtractionData((prev) => {
      const section = prev.sections[sectionIdx];
      const newRow = new Array(section.headers?.length || 0).fill("");
      return { ...prev, sections: prev.sections.map((s, i) => i !== sectionIdx ? s : { ...s, rows: [...s.rows, newRow] }) };
    });
  };

  const deleteRow = (sectionIdx, rowIdx) => {
    if (!canEdit) return;
    setExtractionData((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i !== sectionIdx ? s : { ...s, rows: s.rows.filter((_, j) => j !== rowIdx) }
      ),
    }));
  };

  const addColumn = (sectionIdx) => {
    if (!canEdit) return;
    const colName = window.prompt("Enter new column name:");
    if (!colName) return;
    setExtractionData((prev) => {
      return {
        ...prev,
        sections: prev.sections.map((s, i) =>
          i !== sectionIdx ? s : {
            ...s,
            headers: [...(s.headers || []), colName],
            rows: s.rows.map((r) => [...r, ""]),
          }
        ),
      };
    });
  };

  const deleteColumn = (sectionIdx, colIdx) => {
    if (!canEdit) return;
    if (!window.confirm(`Delete column?`)) return;
    setExtractionData((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) =>
        i !== sectionIdx ? s : {
          ...s,
          headers: s.headers.filter((_, k) => k !== colIdx),
          rows: s.rows.map((r) => r.filter((_, k) => k !== colIdx)),
        }
      ),
    }));
  };

  const renameColumn = (sectionIdx, colIdx, newCol) => {
    if (!canEdit || !newCol) return;
    setExtractionData((prev) => {
      const section = prev.sections[sectionIdx];
      if (section.headers[colIdx] === newCol) return prev;
      return {
        ...prev,
        sections: prev.sections.map((s, i) =>
          i !== sectionIdx ? s : {
            ...s,
            headers: s.headers.map((c, k) => (k === colIdx ? newCol : c)),
          }
        ),
      };
    });
  };



  const handleBack = () => {
    setWorkflowState("idle");
    setExtractionData(null);
    setActiveDoc(null);
    setFile(null);
    setPreviewUrl(null);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const docName = file?.name || activeDoc?.fileName || "Untitled Document";
  const docStatus = activeDoc?.status || (workflowState === "extracted" ? "Extracted" : "—");
  const docStatusKey = docStatus.toLowerCase().replace(/\s+/g, "-");
  const confidence = extractionData?.document?.confidence;
  const confClass = getConfidenceClass(confidence);
  const uploadedDate = activeDoc?.createdAt
    ? new Date(activeDoc.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Just now";

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="doc-intel-workspace">

      {/* ── IDLE STATE ────────────────────────────────────────────────────── */}
      {workflowState === "idle" && (
        <>
          <div className="doc-intel-header">
            <div className="doc-intel-header-left">
              <h1>Universal Document Extraction</h1>
              <p>Upload any supported document or image file to automatically extract structured data.</p>
            </div>
          </div>

          <div className="doc-intel-main">
            {canUpload ? (
              <div
                className={`doc-intel-workspace-center${isDragging ? " dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="empty-state">
                  <Upload size={40} color={isDragging ? "var(--blue)" : "var(--ink-soft)"} />
                  <h2>Drag &amp; Drop any document or image</h2>
                  <p>PDF • DOC • DOCX • PNG • JPG • TIFF &amp; more supported</p>
                  <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
                  <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                    <Plus size={14} /> Browse Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="doc-intel-workspace-center">
                <div className="empty-state">
                  <Eye size={40} color="var(--ink-soft)" />
                  <h2>View Mode</h2>
                  <p>You have view-only access to this module. Please select an existing document from the system to review its extracted data.</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── PROCESSING STATE ──────────────────────────────────────────────── */}
      {workflowState === "processing" && (
        <div className="doc-intel-main" style={{ padding: "0 32px 32px" }}>
          <div className="doc-intel-header">
            <div className="doc-intel-header-left">
              <h1>Universal Document Extraction</h1>
              <p>Processing your file...</p>
            </div>
          </div>
          <div className="upload-status">
            <div className="upload-meta">
              <div className="meta-item"><span>File</span><span>{file?.name}</span></div>
              <div className="meta-item"><span>Format</span><span>{getFileExt(file?.name)}</span></div>
              <div className="meta-item"><span>Size</span><span>{formatBytes(file?.size)}</span></div>
              <div className="meta-item"><span>Upload</span><span style={{ color: "var(--green)" }}>Complete ✓</span></div>
            </div>
            
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Loader2 size={32} className="animate-spin" color="var(--blue)" style={{ marginBottom: 16 }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
                <div className={`step-indicator ${processingStep >= 0 ? 'active' : ''}`}>
                   {processingStep > 0 ? <CheckCircle2 size={16} color="var(--green)" /> : (processingStep === 0 ? <Loader2 size={16} className="animate-spin" /> : <div className="step-dot" />)}
                   <span>Uploading &amp; Identifying Format...</span>
                </div>
                <div className={`step-indicator ${processingStep >= 1 ? 'active' : ''}`}>
                   {processingStep > 1 ? <CheckCircle2 size={16} color="var(--green)" /> : (processingStep === 1 ? <Loader2 size={16} className="animate-spin" /> : <div className="step-dot" />)}
                   <span>Analyzing Document Structure...</span>
                </div>
                <div className={`step-indicator ${processingStep >= 2 ? 'active' : ''}`}>
                   {processingStep > 2 ? <CheckCircle2 size={16} color="var(--green)" /> : (processingStep === 2 ? <Loader2 size={16} className="animate-spin" /> : <div className="step-dot" />)}
                   <span>Extracting Tables &amp; Text...</span>
                </div>
                <div className={`step-indicator ${processingStep >= 3 ? 'active' : ''}`}>
                   {processingStep > 3 ? <CheckCircle2 size={16} color="var(--green)" /> : (processingStep === 3 ? <Loader2 size={16} className="animate-spin" /> : <div className="step-dot" />)}
                   <span>Formatting as Structured Tables...</span>
                </div>
                <div className={`step-indicator ${processingStep >= 4 ? 'active' : ''}`}>
                   {processingStep > 4 ? <CheckCircle2 size={16} color="var(--green)" /> : (processingStep === 4 ? <Loader2 size={16} className="animate-spin" /> : <div className="step-dot" />)}
                   <span>Running OCR Engine (This may take ~60s on CPU)...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FAILED STATE ──────────────────────────────────────────────────── */}
      {workflowState === "failed" && (
        <div className="doc-intel-main" style={{ padding: "32px" }}>
          <div className="error-container">
            <AlertTriangle size={36} />
            <h3>Extraction Failed</h3>
            <p>{errorDetails}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline" onClick={handleBack}>← Back</button>
              <button className="btn btn-primary" onClick={() => performExtraction(file)}>Retry Extraction</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXTRACTED STATE — FULL REVIEW WORKSPACE ───────────────────────── */}
      {workflowState === "extracted" && extractionData && (
        <div className="ocr-review-workspace animate-fadein">

          {/* TOP ACTION BAR */}
          <div className="ocr-top-bar">
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleBack}
              style={{ marginRight: 4 }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="ocr-top-bar-divider" />

            <div className="ocr-top-bar-info">
              <div className="ocr-top-bar-title">{docName}</div>
              <div className="ocr-top-bar-sub">
                <span className={`status-badge status-${docStatusKey}`}>{docStatus}</span>
                {confidence != null && (
                  <span className={`confidence-pill ${confClass}`}>
                    {(confidence * 100).toFixed(2)}% confidence
                  </span>
                )}
                <span style={{ color: "var(--ink-faint)" }}>·</span>
                <span>{uploadedDate}</span>
                {canEdit ? (
                  <span className="role-badge" style={{ marginLeft: 4 }}>
                    <Edit3 size={10} /> Editing Enabled
                  </span>
                ) : (
                  <span className="role-badge view-only" style={{ marginLeft: 4 }}>
                    <Eye size={10} /> View Only
                  </span>
                )}
              </div>
            </div>

            {/* Right-side action buttons */}
            {canEdit && (
              <>
                <div className="ocr-top-bar-divider" />
                <button className="btn btn-outline btn-sm" onClick={saveDocumentState} disabled={isSaving}>
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save
                </button>
                {(docStatusKey === "needs-review" || docStatusKey === "extracted" || !activeDoc) && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={() => updateDocumentStatus("Approved")}>
                      <CheckCheck size={13} /> Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateDocumentStatus("Rejected")}>
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
              </>
            )}

            <div className="ocr-top-bar-divider" />
            <button className="btn btn-outline btn-sm" onClick={handleDownloadOriginal} disabled={!file}>
              <Download size={13} /> Original
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => handleExport("docx")}>
              <Download size={13} /> Word
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => handleExport("pdf")}>
              <Download size={13} /> PDF
            </button>
          </div>

          {/* TWO-PANEL BODY */}
          <div className="ocr-panels">

            {/* ── LEFT: DOCUMENT PREVIEW ────────────────────────────────── */}
            <div className="ocr-left-panel">
              <div className="ocr-left-panel-header">
                <div className="ocr-file-name">{docName}</div>
                <div className="ocr-file-meta">
                  <span className="ocr-file-meta-item">{getFileExt(file?.name || activeDoc?.fileName)}</span>
                  {file?.size && <span className="ocr-file-meta-item">{formatBytes(file.size)}</span>}
                </div>
              </div>

              <div className="ocr-preview-area">
                {previewUrl ? (
                  file?.type === "application/pdf" ? (
                    <object data={previewUrl} type="application/pdf" style={{ width: "100%", height: "100%", minHeight: 500 }}>
                      <p style={{ padding: 24, color: "var(--ink-soft)", fontSize: 13 }}>
                        PDF preview not available in this browser. Use the download button above to view the original.
                      </p>
                    </object>
                  ) : (
                    <img src={previewUrl} alt="Document Preview" />
                  )
                ) : (
                  <div className="ocr-preview-empty">
                    <div className="ocr-preview-empty-icon">
                      <FileText size={28} color="var(--ink-soft)" />
                    </div>
                    <h4>No Preview Available</h4>
                    <p>
                      {activeDoc
                        ? "Preview is not stored for historical documents."
                        : "Preview is not available for this file type."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: EXTRACTED DATA ─────────────────────────────────── */}
            <div className="ocr-right-panel">
              <div className="ocr-right-panel-header">
                <span className="ocr-right-panel-title">Extracted Data</span>
                <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  {(extractionData.sections || []).length} section{(extractionData.sections || []).length !== 1 ? "s" : ""} detected
                </span>
              </div>

              <div className="ocr-right-panel-body">
                {confidence != null && confidence < 0.70 && (
                  <div style={{ padding: "12px 16px", marginBottom: "16px", background: "var(--red-light, #fee2e2)", color: "var(--red-dark, #991b1b)", borderRadius: "var(--radius)", display: "flex", gap: "12px", alignItems: "center", fontSize: "13px" }}>
                    <AlertTriangle size={16} />
                    <span><strong>Low Confidence Extraction:</strong> The OCR engine had difficulty reading some parts of this document. Please review the extracted data carefully.</span>
                  </div>
                )}

                {(extractionData.sections || []).length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-soft)", fontSize: 13, background: "var(--paper)", borderRadius: "var(--radius)", border: "1px solid var(--line)" }}>
                    No structured data was detected. The document may be empty or unreadable.
                  </div>
                )}

                {(extractionData.sections || []).map((section, sIdx) => (
                  <div key={sIdx} className="ocr-section-card">
                    <div className="ocr-section-card-header">
                      <div className="ocr-section-card-title">
                        {section.title || `Section ${sIdx + 1}`}
                        <span className="ocr-section-type-badge">Table</span>
                      </div>
                      {canEdit && (
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
                      canEdit={canEdit}
                      onDataChange={handleDataChange}
                      onAddRow={addRow}
                      onDeleteRow={deleteRow}
                      onAddColumn={addColumn}
                      onDeleteColumn={deleteColumn}
                      onRenameColumn={renameColumn}
                    />
                  </div>
                ))}

                {/* bottom spacer */}
                <div style={{ height: 8 }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentIntelligence;
