import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import PageHeader from '../components/PageHeader';
import { AuthContext } from '../context/AuthContext';
import { 
    FileText, 
    UploadCloud, 
    AlertCircle,
    CheckCircle,
    Activity,
    Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import './OCR.css';

const OCRDashboard = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        processedToday: 0,
        failedDocuments: 0,
        needsReview: 0,
        averageConfidence: 0
    });
    const [recentDocs, setRecentDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const statsRes = await API.get('/ocr/dashboard-stats');
            setStats(statsRes.data.data);

            const docsRes = await API.get('/ocr');
            setRecentDocs(docsRes.data.data);
        } catch (error) {
            console.error('Error fetching OCR data:', error);
            toast.error('Failed to load OCR dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Uploaded': 'bg-gray-100 text-gray-800',
            'Processing': 'bg-blue-100 text-blue-800',
            'Completed': 'bg-green-100 text-green-800',
            'Needs Review': 'bg-yellow-100 text-yellow-800',
            'Failed': 'bg-red-100 text-red-800'
        };
        const defaultStyle = 'bg-gray-100 text-gray-800';
        return <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || defaultStyle}`}>{status}</span>;
    };

    const getConfidenceColor = (conf) => {
        if (conf >= 0.9) return 'text-green-600';
        if (conf >= 0.7) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="page-container">
            <PageHeader 
                title="OCR Dashboard" 
                subtitle="Document Intelligence & Extraction"
                actionButton={{
                    label: "Process New Document",
                    icon: UploadCloud,
                    onClick: () => navigate('/ocr/process'),
                    primary: true
                }}
            />

            <div className="stats-grid mb-6">
                <div className="stat-card">
                    <div className="stat-icon bg-blue-100 text-blue-600">
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Documents</h3>
                        <p className="stat-value">{stats.totalDocuments}</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon bg-green-100 text-green-600">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Processed Today</h3>
                        <p className="stat-value">{stats.processedToday}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-yellow-100 text-yellow-600">
                        <AlertCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Needs Review</h3>
                        <p className="stat-value">{stats.needsReview}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon bg-purple-100 text-purple-600">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <h3>Avg Confidence</h3>
                        <p className="stat-value">{(stats.averageConfidence * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Recent Documents</h2>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Type</th>
                                        <th>Uploaded By</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Confidence</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-8 text-gray-500">
                                                No documents found
                                            </td>
                                        </tr>
                                    ) : (
                                        recentDocs.map(doc => (
                                            <tr key={doc._id}>
                                                <td className="font-medium">{doc.originalFilename}</td>
                                                <td>{doc.fields?.documentType || 'Unknown'}</td>
                                                <td>{doc.uploadedBy?.name || 'Unknown'}</td>
                                                <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                                <td>{getStatusBadge(doc.status)}</td>
                                                <td className={`font-semibold ${getConfidenceColor(doc.confidence)}`}>
                                                    {(doc.confidence * 100).toFixed(1)}%
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn-icon"
                                                        onClick={() => navigate(`/ocr/process/${doc._id}`)}
                                                        title="View/Edit"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRDashboard;
