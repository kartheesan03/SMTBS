import React, { useState, useEffect } from 'react';
import './ai.css';
import { extractAIData, validateAIData, getAIHistory, approveAIExtraction, deleteAIExtraction } from '../../api/ai';
import toast from 'react-hot-toast';

const AIExtractionPage = () => {
    const [ocrText, setOcrText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getAIHistory();
            setHistory(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load history.");
        }
    };

    const handleRunAI = async () => {
        if (!ocrText.trim()) {
            toast.error("Please enter some text first.");
            return;
        }

        setIsLoading(true);
        try {
            const data = await extractAIData(ocrText);
            setResult(data);
            toast.success("AI Extraction successful!");
            loadHistory();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.detail || "AI Extraction failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevalidate = async () => {
        if (!result) return;
        try {
            const issues = await validateAIData(result.json_data);
            setResult({ ...result, validation_issues: issues });
        } catch (error) {
            console.error(error);
        }
    };

    const handleJsonChange = (e) => {
        if (!result) return;
        try {
            const parsed = JSON.parse(e.target.value);
            setResult({ ...result, json_data: parsed });
        } catch (error) {
            // Invalid JSON while typing, ignore state update
        }
    };

    const handleApprove = async () => {
        if (!result) return;
        try {
            await approveAIExtraction(result.id, result.json_data);
            toast.success("Extraction approved!");
            loadHistory();
        } catch (error) {
            toast.error("Failed to approve extraction.");
        }
    };

    const handleReject = async () => {
        if (!result) return;
        try {
            await deleteAIExtraction(result.id);
            setResult(null);
            setOcrText('');
            toast.success("Extraction rejected and deleted.");
            loadHistory();
        } catch (error) {
            toast.error("Failed to delete extraction.");
        }
    };

    const downloadJSON = () => {
        if (!result) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.json_data, null, 2));
        const anchor = document.createElement('a');
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", `extraction_${result.id}.json`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    const downloadCSV = () => {
        if (!result || !result.json_data.materials) {
            toast.error("No materials array to export as CSV");
            return;
        }
        
        const materials = result.json_data.materials;
        if (materials.length === 0) {
            toast.error("Materials list is empty");
            return;
        }
        
        const headers = Object.keys(materials[0]).join(',');
        const rows = materials.map(item => Object.values(item).map(val => `"${val}"`).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\\n" + rows.join("\\n");
        
        const anchor = document.createElement('a');
        anchor.setAttribute("href", csvContent);
        anchor.setAttribute("download", `materials_${result.id}.csv`);
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    return (
        <div className="ai-extraction-container">
            <div className="ai-header">
                <h1>AI Document Extraction</h1>
                <p>Paste raw OCR text here. The Claude AI will intelligently parse it into structured data.</p>
            </div>

            <div className="ai-content">
                <div className="ai-card">
                    <h3>Input Text</h3>
                    <textarea 
                        className="text-area"
                        placeholder="Paste your OCR text here..."
                        value={ocrText}
                        onChange={(e) => setOcrText(e.target.value)}
                    />
                    <button 
                        className="btn-run-ai" 
                        onClick={handleRunAI} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Running AI...' : 'Run AI Extraction'}
                    </button>
                </div>

                <div className="ai-card">
                    <h3>Structured Output</h3>
                    {result ? (
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>
                                    Confidence: <strong>{(result.confidence * 100).toFixed(0)}%</strong>
                                </span>
                            </div>
                            
                            <textarea 
                                className="text-area"
                                style={{minHeight: '300px'}}
                                defaultValue={JSON.stringify(result.json_data, null, 2)}
                                onChange={handleJsonChange}
                                onBlur={handleRevalidate}
                            />
                            
                            {result.validation_issues && result.validation_issues.length > 0 && (
                                <div className="validation-issues">
                                    <h4>Validation Issues ({result.validation_issues.length})</h4>
                                    <ul>
                                        {result.validation_issues.map((issue, idx) => (
                                            <li key={idx}><strong>{issue.field}</strong>: {issue.issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="actions-row">
                                <button className="btn-approve" onClick={handleApprove}>Approve</button>
                                <button className="btn-reject" onClick={handleReject}>Reject</button>
                                <button className="btn-download" onClick={downloadJSON}>Download JSON</button>
                                <button className="btn-download" onClick={downloadCSV}>Download CSV</button>
                            </div>
                        </div>
                    ) : (
                        <div className="json-viewer flex-center">
                            <span style={{color: 'var(--text-secondary)'}}>No output yet.</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="history-section">
                <h2>Extraction History</h2>
                <div className="ai-card" style={{padding: 0, overflowX: 'auto'}}>
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Model</th>
                                <th>Confidence</th>
                                <th>Reviewed</th>
                                <th>Document Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center'}}>No history found.</td>
                                </tr>
                            ) : (
                                history.map(item => {
                                    let docType = "Unknown";
                                    try {
                                        const parsed = JSON.parse(item.json_data);
                                        docType = parsed.document_type || "Unknown";
                                    } catch (e) {}

                                    return (
                                        <tr key={item.id}>
                                            <td>#{item.id}</td>
                                            <td>{new Date(item.created_at).toLocaleString()}</td>
                                            <td>{item.model}</td>
                                            <td>{(item.confidence * 100).toFixed(0)}%</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 8px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '12px',
                                                    background: item.reviewed ? 'rgba(52,199,89,0.1)' : 'rgba(255,149,0,0.1)',
                                                    color: item.reviewed ? '#34c759' : '#ff9500'
                                                }}>
                                                    {item.reviewed ? 'Approved' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>{docType}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AIExtractionPage;
