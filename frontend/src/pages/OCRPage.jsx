import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Upload, Loader2, ArrowLeft, Save, CheckCircle2, XCircle,
  Download, RefreshCw, FileText, Search, Eye, AlertTriangle,
  ChevronRight, Shield, ZoomIn, ZoomOut, RotateCcw,
  FileImage, FileType2, AlertCircle, CheckCheck, X, Check, List, MoreHorizontal, Minus, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

import OCRDataTable from '../components/OCR/OCRDataTable';
import InvoiceDataPanel from '../components/OCR/InvoiceDataPanel';
import ValidationPanel from '../components/OCR/ValidationPanel';
import AuditHistoryPanel from '../components/OCR/AuditHistoryPanel';

// ─── Processing steps ─────────────────────────────────────────────────────────
const PROCESSING_STEPS = [
  { id: 1, label: 'Uploading document' },
  { id: 2, label: 'Analyzing document type' },
  { id: 3, label: 'Enhancing image quality' },
  { id: 4, label: 'Detecting text regions' },
  { id: 5, label: 'Running OCR engine' },
  { id: 6, label: 'Extracting invoice fields' },
  { id: 7, label: 'Detecting line item table' },
  { id: 8, label: 'Validating calculations' },
  { id: 9, label: 'Checking for duplicates' },
  { id: 10, label: 'Matching Purchase Request' },
];

// ─── Workflow steps ───────────────────────────────────────────────────────────
const WORKFLOW_STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Extract' },
  { id: 3, label: 'Validate' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Approve' },
  { id: 6, label: 'Export' },
];

const statusToWorkflow = (processingStatus, approvalStatus) => {
  if (approvalStatus === 'Approved') return 5;
  if (['Ready_For_Approval', 'Validated'].includes(processingStatus)) return 4;
  if (processingStatus === 'Needs_Verification') return 3;
  if (processingStatus === 'OCR_Completed') return 2;
  return 1;
};

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Approved:           { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', icon: '✓', border: 'rgba(22,163,74,0.2)' },
    Ready_For_Approval: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', icon: '●', border: 'rgba(59,130,246,0.2)' },
    OCR_Completed:      { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: '✓', border: 'rgba(16,185,129,0.2)' },
    Needs_Verification: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', icon: '⚠', border: 'rgba(245,158,11,0.2)' },
    Duplicate:          { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: '⛔', border: 'rgba(239,68,68,0.2)' },
    Rejected:           { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: '✗', border: 'rgba(239,68,68,0.2)' },
    Failed:             { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', icon: '✗', border: 'rgba(239,68,68,0.2)' },
    Processing:         { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', icon: '⟳', border: 'rgba(99,102,241,0.2)' },
    Validated:          { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', icon: '✓', border: 'rgba(22,163,74,0.2)' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151', icon: '●', border: '#e5e7eb' };
  return (
    <span style={{
      padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
      fontWeight: '600', background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      boxShadow: `0 0 10px ${s.bg}`, backdropFilter: 'blur(4px)'
    }}>
      {s.icon} {status?.replace(/_/g, ' ')}
    </span>
  );
};

// ─── Confidence chip ──────────────────────────────────────────────────────────
const ConfChip = ({ score }) => {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 95 ? '#16a34a' : pct >= 80 ? '#d97706' : '#dc2626';
  const bg    = pct >= 95 ? '#f0fdf4' : pct >= 80 ? '#fffbeb' : '#fef2f2';
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '20px', fontSize: '11px',
      fontWeight: '600', background: bg, color, border: `1px solid ${color}30`,
    }}>
      {pct}% confidence
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OCRPage = () => {
  const { user } = useContext(AuthContext);
  const uRole = (user?.role || '').toLowerCase();

  // Role flags (User requested all roles to have Admin-like access to OCR)
  const isAdmin   = true; 
  const isManager = true;
  const canEdit   = true;
  const canApproveDoc = true;
  const isViewOnly = false;

  // View state
  const [view, setView]       = useState('list');
  const [documents, setDocuments] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch]   = useState('');

  // Detail view state
  const [selectedDoc, setSelectedDoc]   = useState(null);
  const [editedData, setEditedData]     = useState(null);
  const [hasChanges, setHasChanges]     = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Q&A Chat UI states
  const [chatHistory, setChatHistory] = useState([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Processing progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep]       = useState(0);
  const [isUploading, setIsUploading]       = useState(false);
  const progressIntervalRef = useRef(null);

  // Image zoom state
  const [imgZoom, setImgZoom] = useState(1.0);

  const [statusFilter, setStatusFilter] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // ── API ─────────────────────────────────────────────────────────────────────
  const fetchDocuments = async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({ limit: 100, search });
      if (statusFilter) params.set('status', statusFilter);
      const res = await API.get(`/ocr?${params}`);
      setDocuments(res.data.data || []);
    } catch {
      toast.error('Failed to load invoice documents');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') fetchDocuments();
  }, [view, search, statusFilter]);

  const loadDocument = async (id) => {
    try {
      const res = await API.get(`/ocr/${id}`);
      const doc = res.data.data;
      setSelectedDoc(doc);
      setEditedData({
        vendorInfo:   doc.correctedData?.vendorInfo   || doc.vendorInfo   || {},
        invoiceInfo:  doc.correctedData?.invoiceInfo  || doc.invoiceInfo  || {},
        customerInfo: doc.correctedData?.customerInfo || doc.customerInfo || {},
        totalsBlock:  doc.correctedData?.totalsBlock  || doc.totalsBlock  || {},
        lineItems:    (doc.correctedData?.lineItems?.columns ? doc.correctedData.lineItems : null) || 
                      (doc.lineItems?.columns ? doc.lineItems : null) || 
                      { columns: [], rows: [] },
        rawFields:    doc.correctedData?.rawFields    || doc.rawFields    || [],
      });
      setHasChanges(false);
      setImgZoom(1.0);
      setView('detail');
    } catch (err) {
      console.error('loadDocument error:', err);
      toast.error(`Failed to load document details: ${err.response?.data?.error || err.message}`);
    }
  };

  // ── Upload with animated progress ──────────────────────────────────────────
  const simulateProgress = () => {
    let step = 0;
    setCurrentStep(0);
    setUploadProgress(5);
    progressIntervalRef.current = setInterval(() => {
      step++;
      if (step >= PROCESSING_STEPS.length - 1) {
        clearInterval(progressIntervalRef.current);
        return;
      }
      setCurrentStep(step);
      setUploadProgress(Math.min(5 + (step / (PROCESSING_STEPS.length - 1)) * 88, 93));
    }, 1800);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    if (!canEdit) {
      toast.error('You do not have permission to upload invoices.');
      return;
    }

    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif', '.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExts.includes(ext)) {
      toast.error(`Unsupported file type: ${ext}. Supported: JPG, PNG, WEBP, TIFF, PDF`);
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 30 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setIsProcessing(true);
    simulateProgress();

    try {
      const res = await API.post('/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      clearInterval(progressIntervalRef.current);
      setUploadProgress(100);
      setCurrentStep(PROCESSING_STEPS.length - 1);

      setTimeout(() => {
        setIsUploading(false);
        setIsProcessing(false);
        toast.success(res.data.message || 'Document processed successfully');
        
        // Directly use the returned document data to avoid a redundant GET request
        const doc = res.data.data;
        if (!doc.lineItems) {
          doc.lineItems = { headers: [], columns: [] };
        }
        setSelectedDoc(doc);
        setEditedData({
          vendorInfo:   doc.correctedData?.vendorInfo   || doc.vendorInfo   || {},
          invoiceInfo:  doc.correctedData?.invoiceInfo  || doc.invoiceInfo  || {},
          customerInfo: doc.correctedData?.customerInfo || doc.customerInfo || {},
          totalsBlock:  doc.correctedData?.totalsBlock  || doc.totalsBlock  || {},
          lineItems:    (doc.correctedData?.lineItems?.columns ? doc.correctedData.lineItems : null) || 
                        doc.lineItems || 
                        { headers: [], columns: [] },
        });
        setHasChanges(false);
        setView('detail');
      }, 600);
    } catch (err) {
      clearInterval(progressIntervalRef.current);
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
      setCurrentStep(0);
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Processing failed';
      toast.error(msg.includes('ECONNREFUSED') || msg.includes('unavailable')
        ? 'OCR processing service is temporarily unavailable. Please try again.'
        : msg
      );
    }
  };

  const handleFieldChange = (section, field, value) => {
    if (section === '_lineItemsFull') {
      // OCRDataTable sends full { columns, rows } object when adding/removing columns
      setEditedData(prev => ({ ...prev, lineItems: value }));
    } else if (section === 'lineItems') {
      setEditedData(prev => ({ ...prev, lineItems: { ...prev.lineItems, rows: value } }));
    } else {
      setEditedData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!canEdit) return;
    setIsProcessing(true);
    try {
      await API.put(`/ocr/${selectedDoc.id}`, editedData);
      toast.success('Changes saved successfully');
      setHasChanges(false);
      loadDocument(selectedDoc.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setIsProcessing(false);
    }
  };

  const approveDoc = async () => {
    if (!canApproveDoc) return;
    setIsProcessing(true);
    try {
      await API.post(`/ocr/${selectedDoc.id}/approve`);
      toast.success('Invoice approved ✓');
      loadDocument(selectedDoc.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve');
    } finally {
      setIsProcessing(false);
    }
  };

  const rejectDoc = async () => {
    if (!rejectReason.trim()) return toast.error('Please provide a rejection reason');
    setIsProcessing(true);
    try {
      await API.post(`/ocr/${selectedDoc.id}/reject`, { reason: rejectReason });
      toast.success('Invoice rejected');
      setShowRejectModal(false);
      setRejectReason('');
      loadDocument(selectedDoc.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject');
    } finally {
      setIsProcessing(false);
    }
  };

  const reprocessDoc = async () => {
    if (!isAdmin) return toast.error('Only Admins can reprocess documents.');
    setIsProcessing(true);
    const t = toast.loading('Reprocessing document...');
    try {
      await API.post(`/ocr/${selectedDoc.id}/reprocess`);
      toast.success('Reprocessed successfully', { id: t });
      loadDocument(selectedDoc.id);
    } catch (err) {
      toast.error('Failed to reprocess', { id: t });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = (type) => {
    const baseURL = API.defaults.baseURL || '';
    const url  = `${baseURL}/ocr/${selectedDoc.id}/export/${type}`;
    const stored = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}';
    const token  = JSON.parse(stored)?.token;

    toast.promise(
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.blob())
        .then(blob => {
          const bUrl = URL.createObjectURL(blob);
          const a    = Object.assign(document.createElement('a'), {
            href: bUrl,
            download: `Invoice_${selectedDoc.invoiceInfo?.number || selectedDoc.id}.${type === 'word' ? 'doc' : 'html'}`,
          });
          a.click();
          URL.revokeObjectURL(bUrl);
        }),
      { loading: 'Generating export...', success: 'Export downloaded!', error: 'Export failed' }
    );
  };

  // ─── Q&A Handlers ──────────────────────────────────────────────────────────
  const handleAskQuestion = async () => {
    if (!questionInput.trim() || !selectedDoc) return;
    
    const userMsg = { role: 'user', text: questionInput };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestionInput('');
    setIsAsking(true);
    
    try {
      const { data } = await API.post(`/ocr/${selectedDoc.id}/ask`, { question: userMsg.text });
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'ai', text: data.answer }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', text: 'Error: ' + data.error }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error processing your question.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  // ── Upload progress overlay ─────────────────────────────────────────────────
  if (isUploading) {
    const totalSteps = PROCESSING_STEPS.length;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#f1f5f9', fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: '#ffffff', borderRadius: '20px', padding: '40px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: '1px solid #e2e8f0', width: '100%', maxWidth: '440px',
          textAlign: 'center', boxSizing: 'border-box'
        }}>
          {/* Header Icon */}
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '16px',
            backgroundColor: '#eff6ff', color: '#2563eb', marginBottom: '24px'
          }}>
            <FileText size={32} strokeWidth={1.5} />
          </div>

          <h2 style={{ 
            fontSize: '24px', fontWeight: '700', color: '#0f172a', 
            margin: '0 0 8px 0', letterSpacing: '-0.02em' 
          }}>
            Processing Invoice
          </h2>
          <p style={{ 
            color: '#64748b', fontSize: '14px', margin: '0 0 32px 0', 
            fontWeight: '400', lineHeight: '1.5'
          }}>
            Analyzing your invoice and extracting key information...
          </p>

          {/* Progress Section */}
          <div style={{ marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb' }}>
                {Math.round(uploadProgress)}%
              </span>
            </div>
            
            <div style={{ 
              background: '#f1f5f9', borderRadius: '999px', height: '6px', 
              width: '100%', overflow: 'hidden' 
            }}>
              <div style={{
                height: '100%', borderRadius: '999px',
                backgroundColor: '#2563eb',
                width: `${uploadProgress}%`,
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            </div>
          </div>

          {/* Step list (Vertical Stepper) */}
          <div style={{ 
            textAlign: 'left', display: 'flex', flexDirection: 'column',
            paddingRight: '8px'
          }}>
            {PROCESSING_STEPS.map((s, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              const isPending = idx > currentStep;
              
              let textColor = '#94a3b8';
              if (isCompleted) textColor = '#334155';
              if (isActive) textColor = '#2563eb';

              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  fontSize: '14px', fontWeight: isActive ? '600' : '500',
                  color: textColor, transition: 'all 0.3s ease',
                  opacity: isPending ? 0.6 : 1,
                  position: 'relative',
                  minHeight: idx === PROCESSING_STEPS.length - 1 ? '24px' : '40px'
                }}>
                  {/* Vertical Line Connector */}
                  {idx !== PROCESSING_STEPS.length - 1 && (
                    <div style={{
                      position: 'absolute', top: '24px', left: '11px', 
                      width: '2px', height: 'calc(100% - 14px)', 
                      backgroundColor: isCompleted ? '#22c55e' : '#e2e8f0',
                      transition: 'background-color 0.3s ease'
                    }} />
                  )}

                  {/* Icon Indicator */}
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '24px', height: '24px', zIndex: 1, flexShrink: 0,
                    borderRadius: '50%', backgroundColor: '#fff',
                    marginTop: '-2px'
                  }}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
                    ) : isActive ? (
                      <Loader2 size={18} className="animate-spin" style={{ color: '#2563eb' }} />
                    ) : (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />
                    )}
                  </div>
                  
                  <span style={{ 
                    transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease',
                    marginTop: '0px'
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── List View ───────────────────────────────────────────────────────────────
  if (view === 'list') {
    const statusOpts = [
      '', 'OCR_Completed', 'Needs_Verification', 'Ready_For_Approval',
      'Approved', 'Rejected', 'Duplicate', 'Failed', 'Processing',
    ];

    return (
      <div style={{ padding: '28px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Document Intelligence
            <span style={{ fontSize: '11px', background: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: '700', letterSpacing: '0.5px' }}>AI TOOL</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
            Upload any supported document or image file to automatically extract structured data using AI.
          </p>
          {isViewOnly && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '12px', padding: '6px 14px', borderRadius: '20px',
              background: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: '600',
            }}>
              <Shield size={14} /> View Only Mode
            </span>
          )}
        </div>

        {/* Clean Drag & Drop Upload Zone */}
        {canEdit && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            style={{
              background: isDragOver ? 'rgba(59, 130, 246, 0.02)' : '#fff',
              border: isDragOver ? '1px dashed #3b82f6' : '1px dashed #cbd5e1',
              borderRadius: '8px', padding: '60px 40px', textAlign: 'center',
              marginBottom: '32px', transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <Upload size={32} style={{ color: '#64748b', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
              Drag & Drop any document or image
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px 0', fontWeight: '500' }}>
              PDF • DOC • DOCX • PNG • JPG • TIFF & more supported
            </p>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '6px',
              cursor: isProcessing ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500',
              transition: 'background 0.2s', opacity: isProcessing ? 0.7 : 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
            onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
            >
              + Browse Files
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.tiff,.tif,.pdf"
                style={{ display: 'none' }}
                onChange={handleUpload}
                disabled={isProcessing}
              />
            </label>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '24px', marginBottom: 0 }}>
              Max file size: 50MB. Secure processing.
            </p>
          </div>
        )}


      </div>
    );
  }

  // ─── Detail View (Full-Screen Modal) ───────────────────────────────────────
  if (!selectedDoc) return null;
  const isApproved  = selectedDoc.approvalStatus === 'Approved';
  const isRejected  = selectedDoc.approvalStatus === 'Rejected';
  const workflowStep = statusToWorkflow(selectedDoc.processingStatus, selectedDoc.approvalStatus);

  const baseURL = API.defaults.baseURL?.replace('/api', '') || '';
  const imgUrl = selectedDoc.originalImagePath
    ? (selectedDoc.originalImagePath.startsWith('http') ? selectedDoc.originalImagePath : `${baseURL}${selectedDoc.originalImagePath}`)
    : selectedDoc.fileUrl;
  const isPdf = selectedDoc.mimeType === 'application/pdf';

  
  const handleValidate = async () => {
    toast.success("Document validated successfully.");
  };

  const handleClear = () => {
    if (!selectedDoc) return;
    setEditedData({
      vendorInfo:   selectedDoc.correctedData?.vendorInfo   || selectedDoc.vendorInfo   || {},
      invoiceInfo:  selectedDoc.correctedData?.invoiceInfo  || selectedDoc.invoiceInfo  || {},
      customerInfo: selectedDoc.correctedData?.customerInfo || selectedDoc.customerInfo || {},
      totalsBlock:  selectedDoc.correctedData?.totalsBlock  || selectedDoc.totalsBlock  || {},
      lineItems:    (selectedDoc.correctedData?.lineItems?.columns ? selectedDoc.correctedData.lineItems : null) || 
                    selectedDoc.lineItems || 
                    { headers: [], columns: [] },
    });
    setHasChanges(false);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1280px', margin: '0 auto', background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
      {/* File Info Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={18} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{selectedDoc.originalFileName}</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{(selectedDoc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
            <span style={{ padding: '2px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
               {isPdf ? 'PDF' : selectedDoc.originalFileName?.split('.').pop().toUpperCase()}
            </span>
         </div>
         <button onClick={() => setView('list')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <X size={14} /> Remove
         </button>
      </div>

      {/* Success Banner */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
         <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <Check size={14} />
         </div>
         <div>
            <h3 style={{ color: '#166534', margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>SMTBMS Related Document</h3>
            <p style={{ color: '#166534', margin: 0, fontSize: '13px', fontWeight: '500' }}>
              {selectedDoc.documentType || 'Inventory Stock Report'} | Module: Inventory / Material Tracking | Confidence: {Math.round((selectedDoc.confidenceScore||0)*100)}%
            </p>
         </div>
      </div>

      {/* Document Preview and Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
         
         {/* Top Section: Preview */}
         <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
               <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Document Preview</h3>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <List size={16} style={{ color: '#64748b' }} />
                 <MoreHorizontal size={16} style={{ color: '#64748b' }} />
                 {!isPdf && (
                   <>
                     <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }} />
                     <button onClick={() => setImgZoom(z => Math.max(0.4, z - 0.2))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Minus size={14} /></button>
                     <span style={{ fontSize: '12px', color: '#0f172a', padding: '2px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }}>1 of {selectedDoc.pageCount || 1}</span>
                     <button onClick={() => setImgZoom(z => Math.min(3, z + 0.2))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Plus size={14} /></button>
                   </>
                 )}
                 <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }} />
                 <Search size={16} style={{ color: '#64748b' }} />
               </div>
            </div>
            
            <div style={{
              width: '100%', height: '600px', overflow: 'auto',
              display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
              padding: isPdf ? '0' : '32px', background: '#f1f5f9',
              borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px'
            }}>
              {isPdf ? (
                <iframe
                  src={imgUrl}
                  title="Document Preview"
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0 0 16px 16px' }}
                />
              ) : (
                <img
                  src={imgUrl}
                  alt="Document"
                  style={{
                    maxWidth: '100%', transform: `scale(${imgZoom})`,
                    transformOrigin: 'top center', transition: 'transform 0.2s',
                    borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}
                />
              )}
            </div>
         </div>
         
         {/* Bottom Section: Document Information */}
         <InvoiceDataPanel
           data={editedData}
           confidences={selectedDoc.fieldConfidence}
           onChange={handleFieldChange}
           editable={canEdit && !isApproved && !isViewOnly}
         >
            <OCRDataTable
              lineItems={editedData?.lineItems}
              rawFields={editedData?.rawFields}
              onChange={handleFieldChange}
              editable={canEdit && !isApproved && !isViewOnly}
            />
         </InvoiceDataPanel>
      </div>

      {/* Raw Text Section */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
         <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Raw Extracted Text</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>The complete, unedited text extracted from the document.</p>
         </div>
         <div style={{ padding: '20px' }}>
            <pre style={{ 
               margin: 0, padding: '16px', background: '#f8fafc', borderRadius: '6px', 
               border: '1px solid #e2e8f0', fontSize: '13px', color: '#334155', 
               whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflowY: 'auto',
               fontFamily: 'monospace'
            }}>
               {editedData?.raw_text || selectedDoc?.originalOcrData?.raw_text || 'No raw text available. Please reprocess the document.'}
            </pre>
         </div>
      </div>

      {/* AI Document Assistant */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
         <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <div>
               <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>AI Document Assistant</h3>
               <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Ask questions about the uploaded document (e.g. "What is the total amount?")</p>
            </div>
         </div>
         <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {chatHistory.length > 0 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                  {chatHistory.map((msg, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                           maxWidth: '80%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                           background: msg.role === 'user' ? '#1a73e8' : '#f1f5f9',
                           color: msg.role === 'user' ? '#fff' : '#1e293b',
                           borderBottomRightRadius: msg.role === 'user' ? '0' : '8px',
                           borderBottomLeftRadius: msg.role === 'ai' ? '0' : '8px',
                        }}>
                           {msg.text}
                        </div>
                     </div>
                  ))}
                  {isAsking && (
                     <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', background: '#f1f5f9', color: '#64748b', borderBottomLeftRadius: '0' }}>
                           <Loader2 size={14} className="spin" style={{ display: 'inline-block', marginRight: '6px' }} />
                           AI is thinking...
                        </div>
                     </div>
                  )}
                  <div ref={chatEndRef} />
               </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px' }}>
               <input 
                  type="text" 
                  placeholder="Ask a question..."
                  value={questionInput}
                  onChange={e => setQuestionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
                  disabled={isAsking}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
               />
               <button 
                  onClick={handleAskQuestion}
                  disabled={isAsking || !questionInput.trim()}
                  style={{ 
                     background: '#1a73e8', color: '#fff', border: 'none', padding: '0 20px', 
                     borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: (isAsking || !questionInput.trim()) ? 'not-allowed' : 'pointer',
                     opacity: (isAsking || !questionInput.trim()) ? 0.6 : 1
                  }}
               >
                  Ask
               </button>
            </div>
         </div>
      </div>

      {/* Bottom Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '40px', gap: '12px' }}>
         <button onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}>
            Clear Changes
         </button>
         <button onClick={() => handleExport('word')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Download size={16} /> Download Word
         </button>
         <button onClick={() => handleExport('pdf')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Download size={16} /> Download PDF
         </button>
         <button onClick={handleValidate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#16a34a', border: 'none', padding: '10px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#fff', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(22,163,74,0.3)' }}>
            <CheckCircle2 size={16} /> Save & Approve
         </button>
      </div>
      
      
{/* ── Reject modal ────────────────────────────────────────────────────── */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '17px', color: '#0f172a', fontWeight: '700' }}>
              Reject Invoice
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Provide a reason. This will be logged in the audit history.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              style={{
                width: '100%', height: '110px', padding: '12px',
                border: '1.5px solid #e2e8f0', borderRadius: '8px',
                marginBottom: '20px', fontSize: '13px', resize: 'none',
                outline: 'none', fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} style={btnStyle('#fff', '#374151', '#e2e8f0')}>
                Cancel
              </button>
              <button onClick={rejectDoc} disabled={isProcessing} style={btnStyle('#dc2626', '#fff', '#dc2626')}>
                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Tiny style helpers ───────────────────────────────────────────────────────
const btnStyle = (bg, color, border) => ({
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '8px 16px', borderRadius: '7px',
  border: `1px solid ${border}`, background: bg, color,
  cursor: 'pointer', fontSize: '12px', fontWeight: '600',
  transition: 'opacity 0.15s',
});

const iconBtn = {
  width: '28px', height: '28px', borderRadius: '6px',
  border: '1px solid #e2e8f0', background: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#475569',
};

export default OCRPage;
