import React from 'react';
import { FileText, Download, FileSpreadsheet, Share2 } from 'lucide-react';
import './RichComponents.css';

const ReportPreview = ({ title, date, type, onDownloadPDF, onExportExcel, onShare }) => {
    return (
        <div className="ai-report-preview">
            <div className="report-header">
                <FileText size={24} className="report-icon" />
                <div className="report-info">
                    <h5>{title}</h5>
                    <p>Generated on: {date || new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="report-actions">
                <button className="report-btn primary" onClick={onDownloadPDF}>
                    <Download size={14} /> Download PDF
                </button>
                <button className="report-btn" onClick={onExportExcel}>
                    <FileSpreadsheet size={14} /> Export Excel
                </button>
                <button className="report-btn" onClick={onShare}>
                    <Share2 size={14} /> Share
                </button>
            </div>
        </div>
    );
};

export default ReportPreview;
