import React from 'react';
import { FileText, Download, BarChart, Users, Calendar } from 'lucide-react';

const HRReports = () => {
    const hrReportsList = [
        { name: 'Monthly Attendance Summary', format: 'PDF', icon: <Calendar color="#6366f1"/> },
        { name: 'Employee Turnover Report', format: 'CSV', icon: <Users color="#14b8a6"/> },
        { name: 'Leave Utilization Audit', format: 'PDF', icon: <FileText color="#f59e0b"/> },
        { name: 'Payroll Disbursement Log', format: 'XLSX', icon: <BarChart color="#ec4899"/> },
    ];

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">HR Reports & Analytics</h1>
                    <p className="text-muted">Export comprehensive workforce data and compliance audits.</p>
                </div>
            </header>

            <div className="reports-grid">
                {hrReportsList.map((report, i) => (
                    <div key={i} className="glass-card report-card">
                        <div className="report-icon-box">{report.icon}</div>
                        <div className="report-info">
                            <h3>{report.name}</h3>
                            <p>Format: <strong>{report.format}</strong></p>
                        </div>
                        <button className="download-btn-circle"><Download size={20} /></button>
                    </div>
                ))}
            </div>

            <div className="hr-placeholder-analytics glass-card mt-30">
                <BarChart size={64} color="var(--border)" />
                <p>Generating advanced demographic and performance insights...</p>
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { margin-bottom: 40px; }
                .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .report-card { display: flex; align-items: center; gap: 20px; padding: 25px; transition: 0.3s; cursor: pointer; }
                .report-card:hover { border-color: var(--primary); transform: translateY(-5px); }
                .report-icon-box { width: 48px; height: 48px; background: rgba(255,255,255,0.03); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .download-btn-circle { margin-left: auto; width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; }
                .hr-placeholder-analytics { padding: 50px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; color: var(--text-muted); }
                .mt-30 { margin-top: 30px; }
            `}</style>
        </div>
    );
};

export default HRReports;
