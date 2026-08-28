import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PageHeader from '../components/PageHeader';
import { AuthContext } from '../context/AuthContext';
import { 
    Upload, 
    Save, 
    AlertTriangle, 
    Check, 
    RefreshCw,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import './OCR.css';

const DocumentOCR = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const isAdmin = user?.role?.name === 'Admin';
    
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState('');
    
    const [editedFields, setEditedFields] = useState({});
    const [editedItems, setEditedItems] = useState([]);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (id) {
            fetchDocument(id);
        }
    }, [id]);

    const fetchDocument = async (docId) => {
        try {
            setLoading(true);
            const res = await API.get(`/ocr/${docId}`);
            const data = res.data.data;
            setDocumentData(data);
            setEditedFields(data.fields || {});
            setEditedItems(data.items || []);
            
            if (data.status === 'Processing') {
                // Poll if still processing
                setTimeout(() => fetchDocument(docId), 5000);
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            toast.error('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setProcessingStep('Uploading...');
        
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            setLoading(true);
            const res = await API.post('/ocr/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            
            const newDocId = res.data.data._id;
            toast.success('Document uploaded successfully');
            setProcessingStep('Extracting information...');
            
            // Navigate to new doc
            navigate(`/ocr/process/${newDocId}`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Upload failed');
            setProcessingStep('');
            setFile(null);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleFieldChange = (key, value) => {
        if (!isAdmin) return;
        setEditedFields(prev => ({ ...prev, [key]: value }));
    };

    const handleItemChange = (index, key, value) => {
        if (!isAdmin) return;
        setEditedItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [key]: value };
            return newItems;
        });
    };

    const handleSave = async () => {
        if (!isAdmin) return;
        try {
            setSaving(true);
            await API.put(`/ocr/${id}`, {
                fields: editedFields,
                items: editedItems
            });
            toast.success('Corrections saved successfully');
            fetchDocument(id);
        } catch (error) {
            console.error('Error saving:', error);
            toast.error('Failed to save corrections');
        } finally {
            setSaving(false);
        }
    };

    const renderConfidenceIndicator = (confidence) => {
        if (confidence >= 0.9) {
            return <span className="text-green-600 flex items-center gap-1 text-sm"><Check size={14}/> High ({Math.round(confidence*100)}%)</span>;
        } else if (confidence >= 0.7) {
            return <span className="text-yellow-600 flex items-center gap-1 text-sm"><AlertTriangle size={14}/> Medium ({Math.round(confidence*100)}%)</span>;
        } else {
            return <span className="text-red-600 flex items-center gap-1 text-sm"><AlertTriangle size={14}/> Low ({Math.round(confidence*100)}%)</span>;
        }
    };

    const renderPreview = () => {
        if (!documentData && !file) {
            return (
                <div 
                    className="ocr-upload-zone"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('active'); }}
                    onDragLeave={(e) => e.currentTarget.classList.remove('active')}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('active');
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            fileInputRef.current.files = e.dataTransfer.files;
                            const event = { target: { files: e.dataTransfer.files } };
                            handleFileUpload(event);
                        }
                    }}
                >
                    <Upload className="ocr-upload-icon mx-auto mb-4" size={48} />
                    <h4>Drag and drop a file or click to upload</h4>
                    <p className="mb-4">Supported formats: PDF, JPG, PNG, TIFF (Max 20MB)</p>
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.webp,.bmp,.tiff,.pdf"
                    />
                    <button 
                        className="btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Select File
                    </button>
                    {uploadProgress > 0 && (
                        <div className="mt-6">
                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-xs mx-auto">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <p className="mt-2 text-sm text-blue-600 font-medium">Uploading: {uploadProgress}%</p>
                        </div>
                    )}
                </div>
            );
        }

        const isPdf = documentData?.fileType === 'application/pdf' || file?.type === 'application/pdf';
        const docUrl = documentData ? `http://localhost:5000${documentData.documentUrl}` : URL.createObjectURL(file);

        return (
            <div className="bg-gray-100 rounded-lg p-2 h-full flex flex-col min-h-[600px]">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 px-2">Document Preview</h3>
                <div className="flex-1 bg-white rounded shadow-inner overflow-auto flex justify-center p-4">
                    {isPdf ? (
                        <iframe src={docUrl} className="w-full h-full min-h-[500px]" title="PDF Preview" />
                    ) : (
                        <img src={docUrl} alt="Document Preview" className="max-w-full object-contain" />
                    )}
                </div>
            </div>
        );
    };

    const renderExtractedData = () => {
        if (!documentData) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    {processingStep ? (
                        <>
                            <RefreshCw className="animate-spin mb-4" size={32} />
                            <p>{processingStep}</p>
                        </>
                    ) : (
                        <p>Upload a document to see extracted data here.</p>
                    )}
                </div>
            );
        }

        if (documentData.status === 'Processing') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <RefreshCw className="animate-spin mb-4" size={32} />
                    <p>Extracting structured data from document...</p>
                    <p className="text-sm mt-2 text-gray-400">This may take up to a minute depending on the document quality.</p>
                </div>
            );
        }

        if (documentData.status === 'Failed') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-500 p-8 text-center">
                    <X className="mb-4" size={48} />
                    <h3 className="text-lg font-bold">Processing Failed</h3>
                    <p className="mt-2 text-sm">{documentData.errorMessage}</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full overflow-auto pr-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Extracted Data</h3>
                    <div className="flex items-center gap-4">
                        {renderConfidenceIndicator(documentData.confidence)}
                        {isAdmin && (
                            <button 
                                className="btn-primary flex items-center gap-2"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Corrections
                            </button>
                        )}
                    </div>
                </div>

                <div className="card mb-6">
                    <div className="card-header bg-gray-50">
                        <h4 className="font-semibold text-gray-700">General Information</h4>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(editedFields).map(([key, fieldData]) => (
                                <div key={key} className="form-group mb-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="capitalize text-xs text-gray-500 font-medium m-0">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                        {fieldData?.confidence !== undefined && (
                                            <span className={`text-[10px] px-1.5 rounded-full ${fieldData.confidence > 0.85 ? 'bg-green-100 text-green-700' : fieldData.confidence > 0.6 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                {Math.round(fieldData.confidence * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    {isAdmin ? (
                                        <input 
                                            type="text" 
                                            className="form-control text-sm py-1 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            value={fieldData?.value !== undefined ? fieldData.value : (fieldData || '')}
                                            onChange={(e) => handleFieldChange(key, { ...fieldData, value: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800 py-1 bg-gray-50 px-2 rounded border border-transparent">
                                            {fieldData?.value !== undefined ? fieldData.value : (fieldData || 'Not detected')}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header bg-gray-50 flex justify-between items-center">
                        <h4 className="font-semibold text-gray-700">Line Items</h4>
                        {isAdmin && (
                            <button 
                                className="text-blue-600 text-sm hover:underline"
                                onClick={() => setEditedItems([...editedItems, {}])}
                            >
                                + Add Row
                            </button>
                        )}
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-2 py-1">Description</th>
                                        <th className="px-2 py-1 w-16">Qty</th>
                                        <th className="px-2 py-1 w-16">Unit</th>
                                        <th className="px-2 py-1 w-20">Rate</th>
                                        <th className="px-2 py-1 w-24">Total</th>
                                        {isAdmin && <th className="px-2 py-1 w-10"></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {editedItems.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-2 py-1">
                                                {isAdmin ? (
                                                    <input type="text" className="w-full border-gray-300 rounded text-xs p-1" value={item.description || ''} onChange={e => handleItemChange(index, 'description', e.target.value)} />
                                                ) : item.description}
                                            </td>
                                            <td className="px-2 py-1">
                                                {isAdmin ? (
                                                    <input type="number" className="w-full border-gray-300 rounded text-xs p-1" value={item.quantity || ''} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                                                ) : item.quantity}
                                            </td>
                                            <td className="px-2 py-1">
                                                {isAdmin ? (
                                                    <input type="text" className="w-full border-gray-300 rounded text-xs p-1" value={item.unit || ''} onChange={e => handleItemChange(index, 'unit', e.target.value)} />
                                                ) : item.unit}
                                            </td>
                                            <td className="px-2 py-1">
                                                {isAdmin ? (
                                                    <input type="number" className="w-full border-gray-300 rounded text-xs p-1" value={item.rate || ''} onChange={e => handleItemChange(index, 'rate', e.target.value)} />
                                                ) : item.rate}
                                            </td>
                                            <td className="px-2 py-1">
                                                {isAdmin ? (
                                                    <input type="number" className="w-full border-gray-300 rounded text-xs p-1" value={item.total || ''} onChange={e => handleItemChange(index, 'total', e.target.value)} />
                                                ) : item.total}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-2 py-1 text-center">
                                                    <button onClick={() => setEditedItems(editedItems.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700">
                                                        <X size={14} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {documentData.rawText && (
                    <div className="ocr-accordion">
                        <div 
                            className="ocr-accordion-header"
                            onClick={(e) => {
                                const content = e.currentTarget.nextElementSibling;
                                content.style.display = content.style.display === 'none' ? 'block' : 'none';
                            }}
                        >
                            <span>Raw Extracted Text</span>
                            <span className="text-xs text-slate-500 font-normal">Click to expand</span>
                        </div>
                        <div className="ocr-accordion-content" style={{ display: 'none' }}>
                            {documentData.rawText}
                        </div>
                    </div>
                )}


            </div>
        );
    };

    return (
        <div className="page-container flex flex-col h-screen">
            <PageHeader 
                title={documentData ? `Document: ${documentData.originalFilename}` : "Process Document"}
                subtitle="Upload and extract structured data automatically."
                onBack={() => navigate('/ocr/dashboard')}
            />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                {/* Left Panel: Preview */}
                <div className="h-full overflow-hidden">
                    {renderPreview()}
                </div>
                
                {/* Right Panel: Data */}
                <div className="h-full overflow-hidden bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    {renderExtractedData()}
                </div>
            </div>
        </div>
    );
};

export default DocumentOCR;
