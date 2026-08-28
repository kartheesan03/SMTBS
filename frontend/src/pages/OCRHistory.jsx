import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../components/PageHeader';
import { FileText, Search, Filter, Eye, AlertCircle, CheckCircle2, Clock, MoreVertical, Loader2 } from 'lucide-react';
import './OCR.css';

const OCRHistory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Parse query params for initial state
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const page = parseInt(queryParams.get('page')) || 1;
        const status = queryParams.get('status') || '';
        
        setPagination(prev => ({ ...prev, page }));
        if (status) setStatusFilter(status);
        
        fetchDocuments(page, status);
    }, [location.search]);

    const fetchDocuments = async (pageToFetch = pagination.page, statusToFetch = statusFilter) => {
        try {
            setLoading(true);
            setError(null);
            
            // Note: Update backend to support status filter and search if needed. For now, fetch all.
            const response = await axios.get(`http://localhost:5000/api/ocr?page=${pageToFetch}&limit=${pagination.limit}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            let fetchedDocs = response.data.data;
            
            // Client-side filtering as fallback if backend doesn't support it yet
            if (statusToFetch) {
                fetchedDocs = fetchedDocs.filter(doc => doc.status === statusToFetch);
            }
            if (searchTerm) {
                fetchedDocs = fetchedDocs.filter(doc => 
                    doc.originalFilename.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            setDocuments(fetchedDocs);
            setPagination({
                page: response.data.pagination.page,
                limit: response.data.pagination.limit,
                total: response.data.total
            });
        } catch (err) {
            console.error('Error fetching OCR history:', err);
            setError('Failed to load OCR history. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDocuments(1, statusFilter);
    };

    const handleStatusFilterChange = (e) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);
        
        // Update URL
        const params = new URLSearchParams(location.search);
        if (newStatus) {
            params.set('status', newStatus);
        } else {
            params.delete('status');
        }
        params.set('page', '1');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const handlePageChange = (newPage) => {
        const params = new URLSearchParams(location.search);
        params.set('page', newPage.toString());
        navigate(`${location.pathname}?${params.toString()}`);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
            case 'Verified':
                return <CheckCircle2 size={16} className="text-green-500" />;
            case 'Needs Review':
                return <AlertCircle size={16} className="text-amber-500" />;
            case 'Failed':
                return <AlertCircle size={16} className="text-red-500" />;
            case 'Processing':
                return <Loader2 size={16} className="text-blue-500 animate-spin" />;
            default:
                return <Clock size={16} className="text-slate-400" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Completed': return 'status-badge success';
            case 'Verified': return 'status-badge success font-bold';
            case 'Needs Review': return 'status-badge warning';
            case 'Failed': return 'status-badge danger';
            case 'Processing': return 'status-badge info';
            default: return 'status-badge';
        }
    };

    return (
        <div className="ocr-history-container p-6 bg-slate-50 min-h-screen">
            <PageHeader 
                title="OCR History" 
                subtitle="View and manage all processed documents" 
                icon={<FileText size={24} />}
                breadcrumbs={[
                    { label: 'ERP', path: '/erp' },
                    { label: 'OCR Dashboard', path: '/ocr/dashboard' },
                    { label: 'History', path: '/ocr/history' }
                ]}
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
                {/* Filters Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search documents by name..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select 
                                className="pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[150px]"
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                            >
                                <option value="">All Statuses</option>
                                <option value="Completed">Completed</option>
                                <option value="Verified">Verified</option>
                                <option value="Needs Review">Needs Review</option>
                                <option value="Processing">Processing</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-semibold text-slate-600 text-sm">Document Name</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Date Uploaded</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Uploaded By</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Pages</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Confidence</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
                                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 size={32} className="animate-spin text-blue-500" />
                                            <span>Loading history...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-red-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle size={24} />
                                            <span>{error}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : documents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <FileText size={48} className="text-slate-300" />
                                            <p className="text-lg font-medium text-slate-700">No documents found</p>
                                            <p className="text-sm">Try adjusting your filters or upload a new document.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                documents.map(doc => (
                                    <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800 line-clamp-1" title={doc.originalFilename}>
                                                        {doc.originalFilename}
                                                    </p>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{doc.fileType.split('/')[1] || doc.fileType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-xs text-slate-400">{new Date(doc.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {doc.uploadedBy?.name || 'Unknown User'}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            {doc.pageCount || 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[80px]">
                                                    <div 
                                                        className={`h-1.5 rounded-full ${doc.confidence > 0.85 ? 'bg-green-500' : doc.confidence > 0.6 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                        style={{ width: `${(doc.confidence || 0) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium text-slate-600">
                                                    {Math.round((doc.confidence || 0) * 100)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(doc.status)}`}>
                                                {getStatusIcon(doc.status)}
                                                {doc.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/ocr/process/${doc.id}`)}
                                                className="inline-flex items-center justify-center p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Details"
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

                {/* Pagination */}
                {!loading && documents.length > 0 && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            Showing <span className="font-medium">{documents.length}</span> results
                        </p>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1.5 border border-slate-300 rounded text-sm bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-50 text-blue-600 font-medium text-sm">
                                {pagination.page}
                            </div>
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={documents.length < pagination.limit} // Simplified pagination logic
                                className="px-3 py-1.5 border border-slate-300 rounded text-sm bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OCRHistory;
