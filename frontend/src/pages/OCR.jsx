import React, { useState, useRef, useEffect, useContext } from "react";
import { 
  Upload, AlertTriangle, CheckCircle2, 
  File, Search, Download, Loader2, Save
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
  
  const [historicalDocs, setHistoricalDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeDoc, setActiveDoc] = useState(null); 
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Workflow states: 'idle', 'processing', 'extracted', 'failed'
  const [workflowState, setWorkflowState] = useState('idle');
  const [extractionData, setExtractionData] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistoricalDocs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredDocs(historicalDocs.filter(d => 
        (d.fileName && d.fileName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.documentType && d.documentType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.status && d.status.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
    } else {
      setFilteredDocs(historicalDocs);
    }
  }, [searchTerm, historicalDocs]);

  const fetchHistoricalDocs = async () => {
    try {
      const res = await API.get('/ocr-documents');
      setHistoricalDocs(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
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
    setWorkflowState('processing');
    setErrorDetails('');
    
    if (IMAGE_TYPES.includes(selectedFile.type) || selectedFile.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
    
    performExtraction(selectedFile);
  };

  const performExtraction = async (fileToProcess) => {
    setWorkflowState('processing');
    setErrorDetails('');
    const formData = new FormData();
    formData.append("file", fileToProcess);
    
    try {
      const response = await API.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });
      if (response.data && response.data.success !== false) {
        setExtractionData(response.data);
        setWorkflowState('extracted');
        toast.success(`Document extracted successfully`);
      } else {
        throw new Error(response.data.error || "OCR failed.");
      }
    } catch (err) {
      setWorkflowState('failed');
      setErrorDetails(err.response?.data?.error || err.message || "Failed to extract data.");
      toast.error("Extraction failed.");
    }
  };

  const saveDocumentState = async () => {
    if (!canEdit) return;
    try {
      let statusToSave = activeDoc ? activeDoc.status : 'Needs Review';
      const payload = {
          fileName: file?.name || activeDoc?.fileName || 'document',
          module: extractionData.document?.module || 'General',
          documentType: extractionData.document?.type || 'General Document',
          tables: extractionData.tables,
          details: extractionData.document?.details || {},
          rawText: extractionData.rawText || '',
          confidence: extractionData.document?.confidence || 0,
          status: statusToSave
      };

      let res;
      if (activeDoc) {
        res = await API.put(`/ocr-documents/${activeDoc.id}`, payload);
      } else {
        res = await API.post('/ocr-documents', payload);
      }
      
      setActiveDoc(res.data.document);
      toast.success("Changes saved successfully");
      fetchHistoricalDocs();
    } catch (err) {
      toast.error("Failed to save changes");
    }
  };

  const updateDocumentStatus = async (status) => {
    if (!canEdit) return;
    try {
      if (!activeDoc) {
        // If not saved yet, save first
        await saveDocumentState();
      }
      // Re-fetch or use active doc (saveDocumentState updates activeDoc, but setState is async. 
      // Safe to just do a PUT if we know activeDoc id or use a direct call if we implemented proper chaining.
      // For simplicity, we assume save is done or we just do a direct PUT if activeDoc exists.)
      
      const targetId = activeDoc ? activeDoc.id : null;
      if (!targetId) {
          toast.error("Please save the document first before changing status.");
          return;
      }

      await API.put(`/ocr-documents/${targetId}`, { status });
      toast.success(`Document marked as ${status}`);
      setActiveDoc(prev => ({ ...prev, status }));
      fetchHistoricalDocs();
    } catch (err) {
      toast.error("Failed to update status");
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

  const handleDownloadOriginal = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      toast.error("Original file is not available for historical documents.");
    }
  };

  // Structural Edits
  const handleDataChange = (tableIdx, rowIdx, col, val) => {
    if (!canEdit) return;
    const newData = { ...extractionData };
    newData.tables[tableIdx].rows[rowIdx][col] = val;
    setExtractionData(newData);
  };

  const addRow = (tableIdx) => {
    if (!canEdit) return;
    const newData = { ...extractionData };
    const cols = newData.tables[tableIdx].columns || [];
    const newRow = {};
    cols.forEach(c => newRow[c] = '');
    newData.tables[tableIdx].rows.push(newRow);
    setExtractionData(newData);
  };

  const deleteRow = (tableIdx, rowIdx) => {
    if (!canEdit) return;
    const newData = { ...extractionData };
    newData.tables[tableIdx].rows.splice(rowIdx, 1);
    setExtractionData(newData);
  };

  const addColumn = (tableIdx) => {
    if (!canEdit) return;
    const colName = window.prompt("Enter new column name:");
    if (!colName) return;
    const newData = { ...extractionData };
    if (!newData.tables[tableIdx].columns.includes(colName)) {
      newData.tables[tableIdx].columns.push(colName);
      newData.tables[tableIdx].rows.forEach(r => r[colName] = '');
      setExtractionData(newData);
    } else {
      toast.error("Column already exists");
    }
  };

  const deleteColumn = (tableIdx, colName) => {
    if (!canEdit) return;
    if (window.confirm(`Delete column ${colName}?`)) {
        const newData = { ...extractionData };
        newData.tables[tableIdx].columns = newData.tables[tableIdx].columns.filter(c => c !== colName);
        newData.tables[tableIdx].rows.forEach(r => delete r[colName]);
        setExtractionData(newData);
    }
  };

  const handleKvChange = (key, val) => {
    if (!canEdit) return;
    const newData = { ...extractionData };
    if (!newData.document) newData.document = {};
    if (!newData.document.details) newData.document.details = {};
    newData.document.details[key] = val;
    setExtractionData(newData);
  };

  const viewHistoricalDoc = (doc) => {
    setFile(null); 
    setPreviewUrl(null);
    setActiveDoc(doc);
    setExtractionData({
      document: { type: doc.documentType, module: doc.module, confidence: doc.confidence, details: doc.details },
      tables: doc.tables || [],
      rawText: doc.rawText
    });
    setWorkflowState('extracted');
  };

  return (
    <div className="doc-intel-workspace">
      
      <div className="doc-intel-header">
        <div className="doc-intel-header-left">
            <h1>Document OCR</h1>
            <p>Upload any supported document and convert it into structured, editable data.</p>
        </div>
        
        {workflowState === 'idle' && (
            <div className="search-bar">
                <Search size={16} color="var(--ink-soft)" />
                <input 
                    type="text" 
                    placeholder="Search documents..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        )}
      </div>

      <div className="doc-intel-main">
          
        {workflowState === 'idle' && (
            <>
                {/* UPLOAD SECTION */}
                <div 
                    className={`doc-intel-workspace-center ${isDragging ? 'dragging' : ''}`}
                    onDrop={handleDrop} 
                    onDragOver={handleDragOver} 
                    onDragLeave={handleDragLeave}
                >
                    <div className="empty-state">
                        <Upload size={48} color={isDragging ? "var(--teal)" : "var(--ink-soft)"} />
                        <h2>Drag & Drop your document here</h2>
                        <p>PDF • PNG • JPG • JPEG • DOCX • supported formats</p>
                        <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
                        <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>Browse Files</button>
                    </div>
                </div>

                {/* HISTORICAL LIBRARY */}
                <div className="doc-library">
                    <div className="doc-library-header">
                        Historical Documents
                    </div>
                    <table className="doc-library-table">
                        <thead>
                            <tr>
                                <th>Document Name</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map(doc => (
                                <tr key={doc.id} onClick={() => viewHistoricalDoc(doc)}>
                                    <td><File size={14} style={{display:'inline', marginRight: 8, verticalAlign:'text-bottom'}}/>{doc.fileName}</td>
                                    <td>{doc.documentType}</td>
                                    <td><span className={`status-badge status-${doc.status.toLowerCase().replace(' ', '-')}`}>{doc.status}</span></td>
                                    <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {filteredDocs.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{textAlign: 'center', color: 'var(--ink-soft)', padding: 24}}>No documents found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        )}

        {workflowState === 'processing' && (
            <div className="upload-status">
                <div className="upload-meta">
                    <div className="meta-item"><span>Document Name</span><span>{file?.name}</span></div>
                    <div className="meta-item"><span>File Type</span><span>{file?.type || 'Unknown'}</span></div>
                    <div className="meta-item"><span>File Size</span><span>{(file?.size / 1024 / 1024).toFixed(2)} MB</span></div>
                    <div className="meta-item"><span>Upload Status</span><span>Complete</span></div>
                </div>
                <Loader2 size={32} className="animate-spin" color="var(--teal)" style={{marginBottom: 16}}/>
                <h3>Extracting Document</h3>
                <p style={{color: 'var(--ink-soft)'}}>Please wait while we structure your data...</p>
            </div>
        )}

        {workflowState === 'failed' && (
            <div className="error-container">
              <AlertTriangle size={48} />
              <h3>Extraction Failed</h3>
              <p>{errorDetails}</p>
              <button className="btn btn-outline" onClick={() => performExtraction(file)}>Retry Extraction</button>
            </div>
        )}

        {workflowState === 'extracted' && extractionData && (
            <div className="split-workspace">
              
              {/* LEFT: Preview */}
              <div className="preview-pane">
                <div className="pane-header">
                    <span className="pane-header-title">Document: {file?.name || activeDoc?.fileName}</span>
                    <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => setWorkflowState('idle')}>Back</button>
                </div>
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
                  <span className="pane-header-title">Extracted Data</span>
                  <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                      <span className={`status-badge status-${activeDoc?.status ? activeDoc.status.toLowerCase().replace(' ', '-') : 'extracted'}`}>
                          {activeDoc?.status || 'EXTRACTED'}
                      </span>
                      {canEdit ? (
                          <span className="role-badge">Editing Enabled</span>
                      ) : (
                          <span className="role-badge view-only">View Only</span>
                      )}
                  </div>
                </div>

                <div className="pane-content extracted-table-container">
                    
                  {/* Dynamic Fields / Key Value */}
                  {extractionData.document?.details && Object.keys(extractionData.document.details).length > 0 && (
                     <div style={{padding: 24}}>
                       <div className="kv-grid">
                         {Object.entries(extractionData.document.details).map(([key, val], idx) => (
                           <div className="kv-item" key={idx}>
                             <div className="kv-item-label">{key}</div>
                             <div className="kv-item-value">
                                 <input 
                                     type="text" 
                                     value={val} 
                                     onChange={(e) => handleKvChange(key, e.target.value)}
                                     disabled={!canEdit}
                                 />
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}

                  {/* Dynamic Tables */}
                  <div style={{padding: '0 24px'}}>
                      {extractionData.tables?.map((table, tIdx) => (
                        <div key={tIdx} style={{marginBottom: 32}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                            <h4 style={{margin: 0}}>{table.title || 'Table Data'}</h4>
                            {canEdit && (
                              <div style={{display: 'flex', gap: 8}}>
                                <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => addColumn(tIdx)}>+ Column</button>
                                <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: 12}} onClick={() => addRow(tIdx)}>+ Row</button>
                              </div>
                            )}
                          </div>
                          <div className="table-wrapper">
                              <table className="ext-table">
                                <thead>
                                  <tr>
                                    {table.columns?.map((col, cIdx) => (
                                      <th key={cIdx}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                          {col}
                                          {canEdit && <button onClick={() => deleteColumn(tIdx, col)} style={{background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '0 4px', fontSize: '16px', lineHeight: 1}} title="Delete Column">×</button>}
                                        </div>
                                      </th>
                                    ))}
                                    {canEdit && <th style={{width: 40}}></th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.rows?.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                      {table.columns?.map((col, cIdx) => (
                                          <td key={cIdx}>
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
                                      ))}
                                      {canEdit && (
                                        <td style={{textAlign: 'center'}}>
                                          <button onClick={() => deleteRow(tIdx, rIdx)} style={{background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1}} title="Delete Row">×</button>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                </div>

                {/* Actions Panel */}
                <div className="workspace-actions">
                  <div className="workspace-actions-left">
                      {canEdit && (
                          <button className="btn btn-outline" onClick={saveDocumentState}>
                              <Save size={16}/> Save Changes
                          </button>
                      )}
                      {canEdit && (activeDoc?.status === 'Needs Review' || !activeDoc) && (
                          <button className="btn btn-primary" onClick={() => updateDocumentStatus('Approved')}>Approve</button>
                      )}
                      {canEdit && (activeDoc?.status === 'Needs Review' || !activeDoc) && (
                          <button className="btn btn-danger" onClick={() => updateDocumentStatus('Rejected')}>Reject</button>
                      )}
                  </div>
                  
                  <div style={{display: 'flex', gap: 12}}>
                      <button className="btn btn-outline" onClick={handleDownloadOriginal} disabled={!file}><Download size={16}/> Download Original</button>
                      <button className="btn btn-outline" onClick={() => handleExport('docx')}><Download size={16}/> Download Word</button>
                      <button className="btn btn-outline" onClick={() => handleExport('pdf')}><Download size={16}/> Download PDF</button>
                  </div>
                </div>

              </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default DocumentIntelligence;
