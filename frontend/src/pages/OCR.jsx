import React, { useState, useRef, useEffect, useContext } from "react";
import { 
  Upload, FileText, AlertTriangle, CheckCircle2, 
  File, Search, Download, FileCheck, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./DocumentIntelligence.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/bmp", "image/webp", "image/tiff", "image/gif"];
const ALL_SUPPORTED_TYPES = [...IMAGE_TYPES, "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];

const DocumentIntelligence = () => {
  const { user } = useContext(AuthContext);
  const canEdit = ['Admin', 'Manager'].includes(user?.role);
  
  const [stats, setStats] = useState({ processed: 0, needsReview: 0, approved: 0, failed: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null); // The currently viewed/processed document

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Workflow states: 'idle', 'uploading', 'analyzing', 'extracting', 'reviewing', 'approved', 'failed'
  const [workflowState, setWorkflowState] = useState('idle');
  const [extractionData, setExtractionData] = useState(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSummary();
    fetchRecentDocs();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await API.get('/ocr-documents/summary');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    }
  };

  const fetchRecentDocs = async () => {
    try {
      const res = await API.get('/ocr-documents');
      setRecentDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch recent docs", err);
    }
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

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!ALL_SUPPORTED_TYPES.includes(selectedFile.type)) {
      toast.error("Unsupported file type.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File exceeds 50MB limit.");
      return;
    }
    
    setFile(selectedFile);
    setExtractionData(null);
    setActiveDoc(null);
    setWorkflowState('uploading');
    
    if (IMAGE_TYPES.includes(selectedFile.type) || selectedFile.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
    
    // Simulate upload and analyze steps for better UX
    setTimeout(() => setWorkflowState('analyzing'), 1500);
    setTimeout(() => {
      setWorkflowState('extracting');
      performExtraction(selectedFile);
    }, 3000);
  };

  const performExtraction = async (fileToProcess) => {
    const formData = new FormData();
    formData.append("file", fileToProcess);
    
    try {
      const response = await API.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });
      if (response.data && response.data.success !== false) {
        setExtractionData(response.data);
        setWorkflowState('reviewing');
        toast.success(`Document extracted successfully`);
        
        // Auto-save as 'Extracted'
        saveDocumentState(fileToProcess.name, response.data, 'Extracted');
      } else {
        throw new Error(response.data.error || "OCR failed.");
      }
    } catch (err) {
      setWorkflowState('failed');
      toast.error("Extraction failed. See diagnostic for details.");
    }
  };

  const saveDocumentState = async (fileName, data, status) => {
    try {
      const payload = {
          fileName: fileName,
          module: data.document?.module || 'General',
          documentType: data.document?.type || 'General Document',
          tables: data.tables,
          details: data.document?.details || {},
          rawText: data.rawText || '',
          confidence: data.document?.confidence || 0,
          status: status
      };
      const res = await API.post('/ocr-documents', payload);
      setActiveDoc(res.data.document);
      fetchSummary();
      fetchRecentDocs();
    } catch (err) {
      console.error("Failed to auto-save document", err);
    }
  };

  const updateDocumentStatus = async (status, rejectReason = null) => {
    if (!activeDoc) return;
    try {
      const payload = {
        tables: extractionData.tables,
        details: extractionData.document?.details,
        status,
        rejectReason
      };
      await API.put(`/ocr-documents/${activeDoc.id}`, payload);
      toast.success(`Document marked as ${status}`);
      
      setActiveDoc({ ...activeDoc, status, rejectReason });
      
      if (status === 'Approved') setWorkflowState('approved');
      
      fetchSummary();
      fetchRecentDocs();
    } catch (err) {
      toast.error("Failed to update document status");
    }
  };

  const handleExport = async (type) => {
    const loadingToast = toast.loading(`Generating ${type.toUpperCase()}...`);
    try {
        let originalName = file?.name || activeDoc?.fileName || 'document';
        let baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        let exportFileName = `${baseName}_extracted.${type}`;
        
        const response = await API.post(`/ocr/export/${type}?filename=${encodeURIComponent(exportFileName)}`, extractionData, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', exportFileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success(`${type.toUpperCase()} generated successfully!`, { id: loadingToast });
    } catch (err) {
        toast.error(`Failed to generate ${type.toUpperCase()}`, { id: loadingToast });
    }
  };

  const handleDataChange = (tableIdx, rowIdx, col, val) => {
    if (!canEdit) return;
    const newData = { ...extractionData };
    newData.tables[tableIdx].rows[rowIdx][col] = val;
    setExtractionData(newData);
  };

  const viewHistoricalDoc = (doc) => {
    setFile(null); // Clear active file upload
    setPreviewUrl(null);
    setActiveDoc(doc);
    setExtractionData({
      document: { type: doc.documentType, module: doc.module, confidence: doc.confidence, details: doc.details },
      tables: doc.tables,
      rawText: doc.rawText
    });
    setWorkflowState(doc.status === 'Approved' ? 'approved' : 'reviewing');
  };

  const renderWorkflowSteps = () => {
    const steps = [
      { id: 'uploading', label: 'Upload' },
      { id: 'analyzing', label: 'Analyze' },
      { id: 'extracting', label: 'Extract' },
      { id: 'reviewing', label: 'Review' },
      { id: 'approved', label: 'Export' }
    ];
    
    let currentIndex = steps.findIndex(s => s.id === workflowState);
    if (workflowState === 'idle') currentIndex = -1;
    if (workflowState === 'failed') currentIndex = steps.findIndex(s => s.id === 'extracting');

    return (
      <div className="workflow-progress">
        {steps.map((step, idx) => {
          let stateClass = "pending";
          if (idx < currentIndex) stateClass = "completed";
          if (idx === currentIndex) stateClass = "active";
          if (workflowState === 'failed' && step.id === 'extracting') stateClass = "failed";

          return (
            <React.Fragment key={step.id}>
              <div className={`workflow-step ${stateClass}`}>
                {stateClass === 'completed' ? <CheckCircle2 size={16} /> : 
                 stateClass === 'active' ? <Loader2 size={16} className="animate-spin" /> : 
                 <div style={{width: 16, height: 16, border: '2px solid currentColor', borderRadius: '50%'}}></div>}
                {step.label}
              </div>
              {idx < steps.length - 1 && <span className="workflow-divider">→</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="doc-intel-workspace">
      <div className="doc-intel-header">
        <h1>Document Intelligence</h1>
        <p>Convert documents into structured, editable business data.</p>
        
        <div className="doc-stats-grid">
          <div className="doc-stat-card"><span className="stat-label">Documents Processed</span><span className="stat-value">{stats.processed}</span></div>
          <div className="doc-stat-card"><span className="stat-label">Needs Review</span><span className="stat-value" style={{color: 'var(--amber)'}}>{stats.needsReview}</span></div>
          <div className="doc-stat-card"><span className="stat-label">Pending Approval</span><span className="stat-value" style={{color: 'var(--teal)'}}>{stats.pendingApproval}</span></div>
          <div className="doc-stat-card"><span className="stat-label">Approved</span><span className="stat-value" style={{color: '#166534'}}>{stats.approved}</span></div>
        </div>
      </div>

      {workflowState !== 'idle' && renderWorkflowSteps()}

      <div className="doc-intel-main">
        
        {/* SIDEBAR: Recent Documents */}
        <div className="doc-intel-sidebar">
          <div className="sidebar-header">
            <h3>Recent Documents</h3>
          </div>
          <div className="recent-docs-list">
            {recentDocs.map(doc => (
              <div key={doc.id} className={`recent-doc-item ${activeDoc?.id === doc.id ? 'active' : ''}`} onClick={() => viewHistoricalDoc(doc)}>
                <div className="recent-doc-title" title={doc.fileName}><FileText size={14} style={{display:'inline', marginRight: 6, verticalAlign:'text-bottom'}}/>{doc.fileName}</div>
                <div className="recent-doc-meta">
                  <span>{doc.documentType}</span>
                  <span className={`status-badge status-${doc.status.toLowerCase().replace(' ', '-')}`}>{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WORKSPACE CENTER */}
        <div className="doc-intel-workspace-center">
          
          {workflowState === 'idle' && (
            <div className="empty-state" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <Upload size={48} color={isDragging ? "var(--teal)" : "var(--ink-soft)"} />
              <h2>Drop your document here</h2>
              <p>Upload PDF, PNG, JPG, JPEG, DOCX, and supported document formats</p>
              <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>Browse Files</button>
            </div>
          )}

          {['uploading', 'analyzing', 'extracting'].includes(workflowState) && (
            <div className="processing-overlay">
               <h3>Processing Document</h3>
               <div className={`process-step ${workflowState !== 'uploading' ? 'completed' : 'active'}`}>
                 {workflowState !== 'uploading' ? <CheckCircle2 size={18}/> : <Loader2 size={18} className="animate-spin"/>} File uploaded
               </div>
               <div className={`process-step ${workflowState === 'extracting' ? 'completed' : workflowState === 'analyzing' ? 'active' : 'pending'}`}>
                 {workflowState === 'extracting' ? <CheckCircle2 size={18}/> : workflowState === 'analyzing' ? <Loader2 size={18} className="animate-spin"/> : <div style={{width: 18, height: 18, border: '2px solid currentColor', borderRadius: '50%'}}></div>} Analyzing document type
               </div>
               <div className={`process-step ${workflowState === 'extracting' ? 'active' : 'pending'}`}>
                 {workflowState === 'extracting' ? <Loader2 size={18} className="animate-spin"/> : <div style={{width: 18, height: 18, border: '2px solid currentColor', borderRadius: '50%'}}></div>} Extracting structured information
               </div>
            </div>
          )}

          {workflowState === 'failed' && (
            <div className="processing-overlay" style={{ textAlign: 'center' }}>
              <AlertTriangle size={48} color="var(--red)" style={{margin: '0 auto'}}/>
              <h3 style={{color: 'var(--red)'}}>Document Processing Interrupted</h3>
              <p>We couldn't connect to the document extraction service. Your uploaded document is safe.</p>
              <div style={{background: 'var(--canvas)', padding: 16, borderRadius: 8, textAlign: 'left', fontSize: 13}}>
                <strong>Possible causes:</strong>
                <ul style={{margin: '8px 0 0', paddingLeft: 20}}>
                  <li>OCR service is unavailable</li>
                  <li>Backend connection was interrupted</li>
                  <li>Request timed out</li>
                </ul>
              </div>
              <button className="btn btn-outline" onClick={() => setWorkflowState('idle')}>Remove Document</button>
            </div>
          )}

          {(workflowState === 'reviewing' || workflowState === 'approved') && extractionData && (
            <div className="split-workspace">
              
              {/* LEFT: Preview */}
              <div className="preview-pane">
                <div className="pane-header">Document Preview</div>
                <div className="pane-content">
                  {previewUrl ? (
                    file?.type === "application/pdf" ? (
                      <object data={previewUrl} type="application/pdf" className="pdf-viewer-container">
                        <p>Preview not available.</p>
                      </object>
                    ) : (
                      <img src={previewUrl} alt="Document Preview" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
                    )
                  ) : (
                    <div style={{padding: 40, textAlign: 'center', color: 'var(--ink-soft)'}}>
                      <File size={48} style={{margin: '0 auto 16px', opacity: 0.5}}/>
                      <p>Historical document preview not stored.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Data */}
              <div className="data-pane">
                <div className="pane-header">
                  <span>Extracted Data</span>
                  <span className="status-badge" style={{background: 'var(--teal-mist)', color: 'var(--teal-dark)'}}>{extractionData.document?.type}</span>
                </div>
                
                <div className="validation-panel">
                   <span>
                     <strong>Confidence:</strong> {(extractionData.document?.confidence * 100).toFixed(0)}%
                   </span>
                   {extractionData.document?.confidence < 0.85 && (
                     <span style={{color: 'var(--amber)', fontWeight: 600}}>⚠ Review required</span>
                   )}
                </div>

                <div className="pane-content extracted-table-container">
                  {extractionData.tables?.map((table, tIdx) => (
                    <div key={tIdx} style={{marginBottom: 24}}>
                      <h4 style={{marginBottom: 12, padding: '0 16px'}}>{table.title || 'Table Data'}</h4>
                      <table className="ext-table">
                        <thead>
                          <tr>
                            {table.columns?.map((col, cIdx) => (
                              <th key={cIdx}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows?.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {table.columns?.map((col, cIdx) => {
                                const conf = row.confidence || 1.0;
                                let confClass = '';
                                if (conf < 0.7) confClass = 'conf-low';
                                else if (conf < 0.9) confClass = 'conf-med';
                                else confClass = 'conf-high';
                                
                                return (
                                  <td key={cIdx} className={confClass}>
                                    {canEdit ? (
                                      <input 
                                        type="text" 
                                        value={row[col] || ''} 
                                        onChange={(e) => handleDataChange(tIdx, rIdx, col, e.target.value)}
                                      />
                                    ) : (
                                      <span>{row[col] || ''}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                  {/* Non-tabular details if any */}
                  {extractionData.document?.details && Object.keys(extractionData.document.details).length > 0 && (
                     <div style={{padding: 16}}>
                       <h4 style={{marginBottom: 12}}>Document Details</h4>
                       <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                         {Object.entries(extractionData.document.details).map(([key, val], idx) => (
                           <div key={idx}>
                             <div style={{fontSize: 12, color: 'var(--ink-soft)'}}>{key}</div>
                             <div style={{fontSize: 14, fontWeight: 500}}>{val}</div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="workspace-actions">
                  {canEdit && workflowState !== 'approved' && (
                    <>
                      <button className="btn btn-outline" onClick={() => updateDocumentStatus('Needs Review')}>Needs Review</button>
                      <button className="btn btn-primary" onClick={() => updateDocumentStatus('Pending Approval')}>Submit for Approval</button>
                    </>
                  )}
                  {canEdit && activeDoc?.status === 'Pending Approval' && (
                    <>
                      <button className="btn btn-danger" onClick={() => {
                        const reason = window.prompt("Reason for rejection:");
                        if (reason) updateDocumentStatus('Rejected', reason);
                      }}>Reject</button>
                      <button className="btn btn-primary" onClick={() => updateDocumentStatus('Approved')}>Approve</button>
                    </>
                  )}
                  {workflowState === 'approved' && (
                    <>
                      <button className="btn btn-outline" onClick={() => handleExport('docx')}><Download size={16}/> Word</button>
                      <button className="btn btn-outline" onClick={() => handleExport('pdf')}><Download size={16}/> PDF</button>
                    </>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentIntelligence;
