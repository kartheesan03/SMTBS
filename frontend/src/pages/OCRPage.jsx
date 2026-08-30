import React, { useState, useRef, useContext, useEffect } from 'react';
import { Upload, AlertTriangle, Loader2, FileText, CheckCircle2, Image as ImageIcon, Save, Download, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import OCRDataTable from '../components/OCR/OCRDataTable';

const OCRPage = () => {
    const { user } = useContext(AuthContext);
    const [workflowState, setWorkflowState] = useState("idle"); // idle | processing | reviewing | completed
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Document Data
    const [documentId, setDocumentId] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Table State
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [fields, setFields] = useState({});
    const [totals, setTotals] = useState({});
    
    const fileInputRef = useRef(null);

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const handleFileChange = (e) => processFile(e.target.files[0]);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const processFile = async (file) => {
        if (!file) return;
        
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setWorkflowState("processing");

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await API.post('/ocr/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const doc = res.data.data;
            setDocumentId(doc.id);
            setOcrData(doc);
            
            const extData = doc.extractedData;
            setColumns(extData.columns || []);
            setRows(extData.rows || []);
            setFields(extData.fields || {});
            setTotals(extData.totals || {});
            
            setWorkflowState("reviewing");
            toast.success("Document analyzed successfully!");
        } catch (err) {
            setWorkflowState("idle");
            toast.error(err.response?.data?.error || "Failed to process document.");
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleSave = async () => {
        try {
            const updatedExtractedData = {
                ...ocrData.extractedData,
                columns,
                rows,
                fields,
                totals
            };
            
            await API.put(`/ocr/${documentId}`, {
                extractedData: updatedExtractedData
            });
            
            toast.success("Changes saved successfully.");
            setIsEditMode(false);
        } catch (err) {
            toast.error("Failed to save changes.");
        }
    };

    const handleApprove = async () => {
        try {
            await API.post(`/ocr/${documentId}/approve`);
            toast.success("Document approved!");
            setWorkflowState("completed");
        } catch (err) {
            toast.error("Failed to approve document.");
        }
    };

    const handleReject = async () => {
        try {
            await API.post(`/ocr/${documentId}/reject`);
            toast.success("Document rejected.");
            setWorkflowState("idle");
            resetState();
        } catch (err) {
            toast.error("Failed to reject document.");
        }
    };

    const handleReprocess = async () => {
        setWorkflowState("processing");
        try {
            const res = await API.post(`/ocr/${documentId}/reprocess`);
            const doc = res.data.data;
            const extData = doc.extractedData;
            
            setColumns(extData.columns || []);
            setRows(extData.rows || []);
            setFields(extData.fields || {});
            setTotals(extData.totals || {});
            
            setWorkflowState("reviewing");
            toast.success("Document reprocessed successfully!");
        } catch (err) {
            setWorkflowState("reviewing");
            toast.error("Failed to reprocess document.");
        }
    };

    const resetState = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setDocumentId(null);
        setOcrData(null);
        setColumns([]);
        setRows([]);
        setFields({});
        setTotals({});
        setIsEditMode(false);
        setWorkflowState("idle");
    };

    const renderActions = () => {
        if (!isAdmin) {
            return (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={resetState}>Upload Another</button>
                    {/* Add download options here if needed */}
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {isEditMode ? (
                    <>
                        <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save Changes</button>
                        <button className="btn btn-outline" onClick={() => setIsEditMode(false)}>Cancel Edit</button>
                    </>
                ) : (
                    <button className="btn btn-outline" onClick={() => setIsEditMode(true)}>Edit</button>
                )}
                
                {!isEditMode && (
                    <>
                        <button className="btn btn-primary" onClick={handleApprove}><CheckCircle2 size={16} /> Approve</button>
                        <button className="btn btn-outline" onClick={handleReject} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}><XCircle size={16} /> Reject</button>
                        <button className="btn btn-outline" onClick={handleReprocess}><RefreshCw size={16} /> Reprocess</button>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 8px 0" }}>Document OCR Intelligence</h1>
                    <p style={{ color: "var(--ink-soft)", margin: 0 }}>Upload bills, receipts, or invoices to extract structured data automatically.</p>
                </div>
                {workflowState !== "idle" && (
                    <button className="btn btn-outline" onClick={resetState}>Upload New Document</button>
                )}
            </div>

            {workflowState === "idle" && (
                <div
                    style={{
                        border: `2px dashed ${isDragging ? "var(--blue)" : "var(--line)"}`,
                        borderRadius: "var(--radius)",
                        padding: "64px 24px",
                        textAlign: "center",
                        background: isDragging ? "var(--blue-light)" : "var(--surface)",
                        transition: "all 0.2s ease",
                        cursor: "pointer"
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={48} color={isDragging ? "var(--blue)" : "var(--ink-soft)"} style={{ marginBottom: "16px" }} />
                    <h3 style={{ margin: "0 0 8px 0" }}>Upload Document</h3>
                    <p style={{ margin: "0 0 24px 0", color: "var(--ink-soft)" }}>Drag and drop or click to browse. Supports JPG, PNG, WEBP, TIFF.</p>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                    <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        Browse File
                    </button>
                </div>
            )}

            {workflowState === "processing" && (
                <div style={{ textAlign: "center", padding: "64px 24px", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--line)" }}>
                    <Loader2 size={48} className="animate-spin" color="var(--blue)" style={{ margin: "0 auto 16px auto" }} />
                    <h3 style={{ margin: "0 0 8px 0" }}>Analyzing Image...</h3>
                    <p style={{ color: "var(--ink-soft)" }}>Running multi-stage text recovery and structure analysis.</p>
                </div>
            )}

            {(workflowState === "reviewing" || workflowState === "completed") && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Left Panel: Image Preview */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "20px" }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ImageIcon size={20} /> Original Document
                            </h3>
                            <span style={{ fontSize: '13px', background: 'var(--paper)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}>
                                {selectedFile?.name || ocrData?.originalImagePath?.split('/').pop()}
                            </span>
                        </div>
                        <div style={{ width: '100%', height: '600px', background: 'var(--paper)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : ocrData?.originalImagePath ? (
                                <img src={`http://localhost:5000${ocrData.originalImagePath}`} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ color: 'var(--ink-soft)' }}>No image available</span>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Extracted Data */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "20px", display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: "0 0 4px 0", display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} /> Extracted Data
                                </h3>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--ink-soft)' }}>
                                    <span>Type: <strong style={{ color: 'var(--ink-dark)' }}>{ocrData?.extractedData?.document_type?.toUpperCase() || 'GENERAL'}</strong></span>
                                    <span>Confidence: <strong style={{ color: ocrData?.confidenceScore > 0.8 ? 'var(--green)' : 'var(--orange)' }}>{((ocrData?.confidenceScore || 0) * 100).toFixed(1)}%</strong></span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {ocrData?.extractedData?.warnings?.length > 0 && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--orange)', background: 'var(--orange-light)', padding: '4px 8px', borderRadius: '4px' }}>
                                        <AlertTriangle size={14} /> Quality Enhancements Applied
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <OCRDataTable 
                                columns={columns}
                                rows={rows}
                                fields={fields}
                                totals={totals}
                                isEditMode={isEditMode}
                                onColumnsChange={setColumns}
                                onRowsChange={setRows}
                                onFieldsChange={setFields}
                                onTotalsChange={setTotals}
                            />
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                                {workflowState === "completed" && <span style={{ color: 'var(--green)' }}>✓ Approved</span>}
                            </div>
                            {renderActions()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OCRPage;
