import React, { useState, useRef } from "react";
import { Upload, AlertTriangle, Loader2, Plus, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_FIELDS = {
    hr: ["Name", "Email", "Phone", "Position", "Experience", "Education"],
    manager: ["Employee", "Department", "Review Period", "Rating", "Status"],
    sales: ["Invoice No.", "Client", "Amount", "Due Date", "Status"],
    employee: ["Item", "Category", "Amount", "Date", "Status"]
};

const RoleDocumentExtractor = ({ role = "hr" }) => {
    const [workflowState, setWorkflowState] = useState("idle"); // idle | processing | extracted | failed
    const [extractedRows, setExtractedRows] = useState([]);
    const [errorDetails, setErrorDetails] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const expectedFields = ROLE_FIELDS[role] || [];

    const handleFileChange = (e) => processFiles(e.target.files);
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const processFiles = async (fileList) => {
        if (!fileList || fileList.length === 0) return;

        setWorkflowState("processing");
        setErrorDetails("");
        setExtractedRows([]);

        const formData = new FormData();
        Array.from(fileList).forEach(f => formData.append('files', f));
        formData.append('role', role);

        try {
            // Using fetch to match user instructions:
            // Since backend is running on 8000, assuming a proxy or full url.
            // Adjust to http://localhost:8000/api/extract if no proxy. 
            // In typical Vite setups, /api proxies to backend.
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${apiBase}/extract`, { 
                method: 'POST', 
                body: formData 
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setExtractedRows(data.rows || []);
                if (data.errors && data.errors.length > 0) {
                    toast.error(`Extraction completed with errors on some files.`);
                    console.error("Extraction errors:", data.errors);
                } else {
                    toast.success("Extraction completed successfully!");
                }
                setWorkflowState("extracted");
            } else {
                throw new Error(data.detail || data.error || "Failed to extract documents");
            }
        } catch (err) {
            setWorkflowState("failed");
            setErrorDetails(err.message || "Failed to contact extraction service");
            toast.error("Extraction failed.");
        }
    };

    const handleBack = () => {
        setWorkflowState("idle");
        setExtractedRows([]);
        setErrorDetails("");
    };

    return (
        <div style={{ background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--line)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", background: "var(--surface-sunken)" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--ink-dark)" }}>
                    Document Extraction
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--ink-soft)" }}>
                    Upload documents to automatically extract structured data for your role.
                </p>
            </div>

            <div style={{ padding: "24px" }}>
                {workflowState === "idle" && (
                    <div
                        style={{
                            border: `2px dashed ${isDragging ? "var(--blue)" : "var(--line)"}`,
                            borderRadius: "var(--radius)",
                            padding: "48px 24px",
                            textAlign: "center",
                            background: isDragging ? "var(--blue-light)" : "var(--paper)",
                            transition: "all 0.2s ease",
                            cursor: "pointer"
                        }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={32} color={isDragging ? "var(--blue)" : "var(--ink-soft)"} style={{ marginBottom: "16px" }} />
                        <h4 style={{ margin: "0 0 8px 0", color: "var(--ink-dark)" }}>Drag & Drop documents here</h4>
                        <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--ink-soft)" }}>
                            Supports PDF, DOCX, PNG, JPG, WEBP, TIFF (Max 10MB per file)
                        </p>
                        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileChange} />
                        <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                            <Plus size={14} /> Browse Files
                        </button>
                    </div>
                )}

                {workflowState === "processing" && (
                    <div style={{ textAlign: "center", padding: "48px 24px" }}>
                        <Loader2 size={32} className="animate-spin" color="var(--blue)" style={{ margin: "0 auto 16px auto" }} />
                        <h4 style={{ margin: "0 0 8px 0" }}>Extracting Data...</h4>
                        <p style={{ margin: 0, fontSize: "13px", color: "var(--ink-soft)" }}>Analyzing documents using AI. This may take a moment.</p>
                    </div>
                )}

                {workflowState === "failed" && (
                    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--red-dark)" }}>
                        <AlertTriangle size={32} style={{ margin: "0 auto 16px auto" }} />
                        <h4 style={{ margin: "0 0 8px 0" }}>Extraction Failed</h4>
                        <p style={{ margin: "0 0 16px 0", fontSize: "13px" }}>{errorDetails}</p>
                        <button className="btn btn-outline" onClick={handleBack}>Try Again</button>
                    </div>
                )}

                {workflowState === "extracted" && (
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--green)" }}>
                                <CheckCircle2 size={18} />
                                <span style={{ fontWeight: "500" }}>Extraction Complete</span>
                            </div>
                            <button className="btn btn-outline btn-sm" onClick={handleBack}>Upload More</button>
                        </div>

                        {extractedRows.length === 0 ? (
                            <div style={{ padding: "32px", textAlign: "center", color: "var(--ink-soft)", background: "var(--paper)", borderRadius: "var(--radius)" }}>
                                <FileText size={24} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
                                No data could be extracted.
                            </div>
                        ) : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr>
                                            {expectedFields.map((field, idx) => (
                                                <th key={idx} style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid var(--line)", color: "var(--ink-dark)", backgroundColor: "var(--surface)" }}>
                                                    {field}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {extractedRows.map((row, rIdx) => (
                                            <tr key={rIdx} style={{ borderBottom: "1px solid var(--line)" }}>
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} style={{ padding: "12px", color: "var(--ink-dark)" }}>
                                                        {cell || "—"}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleDocumentExtractor;
