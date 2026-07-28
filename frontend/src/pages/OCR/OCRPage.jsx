import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Copy, Download, Trash2, Search as SearchIcon, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadOCRDocument, getOCRHistory, deleteOCRDocument, getOCRDocument } from '../../api/ocr';
import './ocr.css';

const OCRPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [documentType, setDocumentType] = useState('General');
    const fileInputRef = useRef(null);

    const documentTypes = [
        "General",
        "Purchase Order",
        "Invoice",
        "Delivery Challan",
        "Goods Receipt Note",
        "Material Request Form",
        "Inventory Sheet"
    ];

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

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        processFile(droppedFile);
    };

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

        try {
            // Assuming we have a user context, we'd pass the username. For now, hardcode or leave empty.
            const data = await uploadOCRDocument(selectedFile, documentType, 'CurrentUser');
            setResult(data);
            toast.success('Document processed successfully');
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error('OCR Processing Error:', error);
            toast.error(error.response?.data?.detail || 'Failed to process document. The OCR service might be offline.');
            setFile(null);
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleViewHistory = async (id) => {
        try {
            const data = await getOCRDocument(id);
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
            if (result && result.id === id) setResult(null);
            fetchHistory();
        } catch (error) {
            toast.error('Failed to delete record');
        }
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

    const renderHighlightedText = (text, highlight) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }
        
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        
        return (
            <span>
                {parts.map((part, i) => 
                    regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    return (
        <div className="ocr-container">
            <div className="ocr-header">
                <h2>Document OCR Engine</h2>
                <p>Upload Purchase Orders, Invoices, Delivery Challans, and other documents to extract text.</p>
            </div>

            <div className="ocr-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                    <label style={{ fontWeight: 500, color: '#334155' }}>Document Type:</label>
                    <select 
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    >
                        {documentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div 
                    className="ocr-upload-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept=".pdf,.jpg,.jpeg,.png" 
                    />
                    <UploadCloud size={48} className="ocr-upload-icon" />
                    <p className="ocr-upload-text">Click to upload or drag and drop</p>
                    <p className="ocr-upload-hint">Supported formats: PDF, JPG, PNG</p>
                </div>

                {loading && (
                    <div className="ocr-loader">
                        <div className="spinner"></div>
                        <p>Extracting text from {file?.name}... This may take a moment depending on the document length.</p>
                    </div>
                )}

                {result && !loading && (
                    <div className="ocr-results-split">
                        {/* Document Preview Side */}
                        <div className="ocr-preview-pane">
                            <div className="ocr-results-header">
                                <h3>Document Preview</h3>
                            </div>
                            <div className="ocr-preview-content">
                                {file ? (
                                    file.type === 'application/pdf' ? (
                                        <embed src={URL.createObjectURL(file)} type="application/pdf" width="100%" height="100%" />
                                    ) : (
                                        <img src={URL.createObjectURL(file)} alt="Document Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    )
                                ) : (
                                    result.filepath && (
                                        result.filepath.toLowerCase().endsWith('.pdf') ? (
                                            <embed src={`http://localhost:8000/${result.filepath}`} type="application/pdf" width="100%" height="100%" />
                                        ) : (
                                            <img src={`http://localhost:8000/${result.filepath}`} alt="Document Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        )
                                    )
                                )}
                            </div>
                        </div>

                        {/* Extracted Text Side */}
                        <div className="ocr-results">
                            <div className="ocr-results-header">
                                <h3>Extracted Text: {result.filename}</h3>
                                <div className="ocr-actions">
                                    <button className="ocr-action-btn" onClick={handleCopy}>
                                        <Copy size={14} /> Copy
                                    </button>
                                    <button className="ocr-action-btn" onClick={handleDownload}>
                                        <Download size={14} /> Download TXT
                                    </button>
                                </div>
                            </div>
                            <div className="ocr-search">
                                <SearchIcon size={16} color="#94a3b8" />
                                <input 
                                    type="text" 
                                    placeholder="Search within text..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="ocr-text-viewer">
                                {renderHighlightedText(result.text, searchTerm)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="ocr-results">
                    <div className="ocr-results-header">
                        <h3>OCR History</h3>
                    </div>
                    {history.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="ocr-history-table">
                                <thead>
                                    <tr>
                                        <th>Filename</th>
                                        <th>Type</th>
                                        <th>Pages</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(doc => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FileText size={16} color="#64748b" />
                                                    {doc.filename}
                                                </div>
                                            </td>
                                            <td>{doc.document_type || 'Unknown'}</td>
                                            <td>{doc.pages}</td>
                                            <td>{new Date(doc.created_at).toLocaleString()}</td>
                                            <td>
                                                <div className="ocr-actions">
                                                    <button className="ocr-action-btn" onClick={() => handleViewHistory(doc.id)}>
                                                        <Eye size={14} /> View
                                                    </button>
                                                    <button className="ocr-action-btn" onClick={() => handleDelete(doc.id)} style={{ color: '#ef4444' }}>
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                            No OCR documents processed yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRPage;
