import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  AlertTriangle,
  X,
  Copy,
  Download,
  Image as ImageIcon,
  File,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
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
const ALL_SUPPORTED_TYPES = [...IMAGE_TYPES, "application/pdf"];
const getFileIcon = (type) => {
  if (IMAGE_TYPES.includes(type))
    return <ImageIcon size={20} color="#3b82f6" />;
  if (type === "application/pdf") return <FileText size={20} color="#ef4444" />;
  return <File size={20} color="#64748b" />;
};
const OCR = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const processFile = (selectedFile) => {
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
    setExtractedText("");
    setError("");
    if (IMAGE_TYPES.includes(selectedFile.type)) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
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
  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedText("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleCopyText = () => {
    navigator.clipboard.writeText(extractedText);
    toast.success("Copied!");
  };
  const handleDownloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ocr_result_${Date.now()}.txt`;
    a.click();
  };
  const handleExtract = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setLoading(true);
    setError("");
    setExtractedText("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await API.post("/ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      if (response.data && response.data.success) {
        setExtractedText(response.data.text || "(No text detected)");
        toast.success("Text extracted!");
      } else {
        throw new Error(response.data.error || "OCR failed");
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Could not connect to OCR service.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rd-container"
    >
      <div className="rd-content">
        {/* Header */}
        <div className="rd-module-header">
          <div className="rd-module-info">
            <div className="rd-module-title-row">
              <span className="rd-module-title">
                Optical Character Recognition
              </span>
              <span className="rd-module-badge">OCR</span>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
              Extract text from images, scanned documents, invoices, and PDFs
            </p>
          </div>
        </div>
        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            marginTop: "24px",
            alignItems: "stretch",
          }}
        >
          {/* ── LEFT: Upload Panel ── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: "520px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Upload size={17} color="#3b82f6" /> Upload Document
            </div>
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${isDragging ? "#3b82f6" : "#cbd5e1"}`,
                borderRadius: "10px",
                padding: "40px 20px",
                textAlign: "center",
                background: isDragging ? "#eff6ff" : "#f8fafc",
                cursor: "pointer",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Upload
                size={38}
                color={isDragging ? "#3b82f6" : "#94a3b8"}
                style={{ margin: "0 auto 12px", display: "block" }}
              />
              <div
                style={{ fontWeight: 600, color: "#475569", fontSize: "14px" }}
              >
                {isDragging
                  ? "Drop file here"
                  : "Click to upload or drag & drop"}
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                  marginTop: "6px",
                  lineHeight: "1.6",
                }}
              >
                JPG, PNG, BMP, WEBP, TIFF, GIF, PDF
                <br />
                Max 50 MB
              </div>
            </div>
            {/* File Info Bar */}
            {file && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {getFileIcon(file.type)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#0f172a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: "2px",
                    lineHeight: 0,
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            )}
            {/* Image Preview */}
            {previewUrl && (
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#f1f5f9",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxHeight: "220px",
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "220px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            )}
            {/* PDF placeholder */}
            {file && file.type === "application/pdf" && (
              <div
                style={{
                  padding: "20px",
                  background: "#fef2f2",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#ef4444",
                }}
              >
                <FileText
                  size={28}
                  style={{ margin: "0 auto 8px", display: "block" }}
                />
                <div style={{ fontSize: "13px", fontWeight: 600 }}>
                  PDF ready — no preview
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#f87171",
                    marginTop: "4px",
                  }}
                >
                  Click "Extract Text" to process
                </div>
              </div>
            )}
            {/* Spacer pushes button to bottom */}
            <div style={{ flex: 1 }} />
            {/* Extract Button */}
            <button
              onClick={handleExtract}
              disabled={loading || !file}
              style={{
                width: "100%",
                padding: "13px",
                background:
                  loading || !file
                    ? "#e2e8f0"
                    : "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: loading || !file ? "#94a3b8" : "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: loading || !file ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 15,
                      height: 15,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Extracting...
                </>
              ) : (
                <>
                  <FileText size={15} /> Extract Text
                </>
              )}
            </button>
          </div>
          {/* ── RIGHT: Result Panel ── */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              minHeight: "520px",
            }}
          >
            {/* Result header */}
            <div
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FileText size={17} color="#10b981" /> Extraction Result
              </span>
              {extractedText && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={handleCopyText}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    onClick={handleDownloadText}
                    style={{
                      background: "#f1f5f9",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  >
                    <Download size={12} /> Save
                  </button>
                </div>
              )}
            </div>
            {/* Content area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {loading ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      border: "4px solid #e2e8f0",
                      borderTopColor: "#3b82f6",
                      borderRadius: "50%",
                      animation: "spin 0.9s linear infinite",
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>
                    Analyzing document...
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    This may take 10–30 seconds
                  </div>
                </div>
              ) : error ? (
                <div
                  style={{
                    padding: "16px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#dc2626",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle
                    size={17}
                    style={{ flexShrink: 0, marginTop: "2px" }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                      Extraction Failed
                    </div>
                    <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                      {error}
                    </div>
                  </div>
                </div>
              ) : extractedText ? (
                <textarea
                  readOnly
                  value={extractedText}
                  style={{
                    flex: 1,
                    width: "100%",
                    minHeight: "400px",
                    padding: "14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    lineHeight: "1.7",
                    fontFamily: "monospace",
                    resize: "vertical",
                    background: "#f8fafc",
                    color: "#0f172a",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    color: "#94a3b8",
                  }}
                >
                  <FileText size={60} strokeWidth={1} />
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#64748b",
                    }}
                  >
                    No text extracted yet
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8" }}>
                    Upload a file and click "Extract Text"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};
export default OCR;
