import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download, Loader2, FileText, FileSpreadsheet } from 'lucide-react';

const ReportGenerator = ({ reportData }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(reportData.title || 'Business Report', 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

            if (reportData.data && reportData.data.length > 0) {
                const keys = Object.keys(reportData.data[0]);
                const head = [keys.map(k => k.charAt(0).toUpperCase() + k.slice(1))];
                const body = reportData.data.map(item => keys.map(k => String(item[k])));

                doc.autoTable({
                    startY: 40,
                    head: head,
                    body: body,
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 185] }
                });
            }

            doc.save(`${reportData.type || 'report'}_${Date.now()}.pdf`);
            setIsGenerating(false);
        }, 800);
    };

    const generateExcel = () => {
        setIsGenerating(true);
        setTimeout(() => {
            if (reportData.data && reportData.data.length > 0) {
                const ws = XLSX.utils.json_to_sheet(reportData.data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Report");
                XLSX.writeFile(wb, `${reportData.type || 'report'}_${Date.now()}.xlsx`);
            }
            setIsGenerating(false);
        }, 500);
    };

    if (!reportData) return null;

    return (
        <div className="ai-report-card">
            <div className="ai-report-icon">
                <FileText size={20} />
            </div>
            <div className="ai-report-info">
                <h4>{reportData.title}</h4>
                <p>Data Report • Ready to download</p>
            </div>
            <div style={{display: 'flex', gap: '0.5rem', marginLeft: 'auto'}}>
                <button 
                    onClick={generatePDF} 
                    disabled={isGenerating}
                    className="ai-report-download-btn"
                    title="Download PDF"
                >
                    {isGenerating ? <Loader2 size={16} className="spin" /> : <><Download size={14} style={{marginRight:'4px'}}/> PDF</>}
                </button>
                <button 
                    onClick={generateExcel} 
                    disabled={isGenerating}
                    className="ai-report-download-btn"
                    title="Download Excel"
                >
                    {isGenerating ? <Loader2 size={16} className="spin" /> : <><FileSpreadsheet size={14} style={{marginRight:'4px'}}/> Excel</>}
                </button>
            </div>
        </div>
    );
};

export default ReportGenerator;
