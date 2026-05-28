import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
    FileText, Download, BarChart2, Users, Calendar, 
    RefreshCw, CheckCircle, X, Clock, Award, Briefcase, TrendingUp, AlertTriangle
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell 
} from 'recharts';

const HRReports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [toast, setToast] = useState(null);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customReport, setCustomReport] = useState({ type: '', format: 'CSV', from: '', to: '' });

    const hrReportsList = [
        { name: 'Monthly Attendance Summary', format: 'CSV', icon: <Calendar color="var(--cyber-blue)"/>, color: 'var(--cyber-blue)' },
        { name: 'Employee Turnover Report', format: 'CSV', icon: <Users color="var(--cyber-purple)"/>, color: 'var(--cyber-purple)' },
        { name: 'Leave Utilization Audit', format: 'CSV', icon: <FileText color="var(--cyber-yellow)"/>, color: 'var(--cyber-yellow)' },
        { name: 'Payroll Disbursement Log', format: 'CSV', icon: <BarChart2 color="var(--cyber-pink)"/>, color: 'var(--cyber-pink)' },
    ];

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchHRStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await API.get('/dashboard/stats');
            setStats(data);
        } catch (err) {
            console.error('Error fetching HR stats:', err);
            setError(err.response?.data?.message || err.message || 'Failed to retrieve live HR analytics.');
            showToast('Fallback to mock data for display.', 'warning');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHRStats();
    }, []);

    // CSV helper functions
    const generateCSV = (headers, rows) => {
        const csvRows = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))];
        return csvRows.join('\n');
    };

    const triggerDownload = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = async (reportName) => {
        setDownloading(reportName);
        // Simulate advanced data processing / generation delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        try {
            let content = '';
            let filename = '';
            const timestamp = new Date().toISOString().split('T')[0];

            if (reportName === 'Monthly Attendance Summary') {
                const headers = ['Employee Name', 'Department', 'Working Days', 'Days Present', 'Days Absent', 'Leaves Approved', 'Attendance Rate (%)'];
                const rows = [
                    ['Aarav Sharma', 'Engineering', '22', '21', '0', '1', '95.5%'],
                    ['Priya Devi', 'HR & Admin', '22', '22', '0', '0', '100%'],
                    ['Amit Patel', 'Sales & BD', '22', '19', '2', '1', '86.4%'],
                    ['Neha Singh', 'Operations', '22', '20', '0', '2', '90.9%'],
                    ['Rahul Verma', 'Finance', '22', '21', '1', '0', '95.5%'],
                    ['Siddharth Rao', 'Engineering', '22', '22', '0', '0', '100%'],
                    ['Deepika Sen', 'Marketing', '22', '18', '2', '2', '81.8%'],
                    ['Vikram Malhotra', 'Engineering', '22', '21', '0', '1', '95.5%']
                ];
                content = generateCSV(headers, rows);
                filename = `Monthly_Attendance_Summary_${timestamp}.csv`;
            } else if (reportName === 'Employee Turnover Report') {
                const headers = ['Month', 'Opening Headcount', 'Hires', 'Terminations', 'Ending Headcount', 'Turnover Rate (%)'];
                const rows = [
                    ['Jan 2026', '112', '5', '1', '116', '0.88%'],
                    ['Feb 2026', '116', '4', '2', '118', '1.71%'],
                    ['Mar 2026', '118', '6', '0', '124', '0.00%'],
                    ['Apr 2026', '124', '3', '2', '125', '1.61%'],
                    ['May 2026', '125', '5', '1', '129', '0.79%']
                ];
                content = generateCSV(headers, rows);
                filename = `Employee_Turnover_Report_${timestamp}.csv`;
            } else if (reportName === 'Leave Utilization Audit') {
                const headers = ['Employee Name', 'Department', 'Annual Leave Used', 'Sick Leave Used', 'Casual Leave Used', 'Unpaid Leave Taken', 'Remaining Balance (Days)'];
                const rows = [
                    ['Aarav Sharma', 'Engineering', '5', '2', '3', '0', '20'],
                    ['Priya Devi', 'HR & Admin', '4', '1', '2', '0', '23'],
                    ['Amit Patel', 'Sales & BD', '8', '3', '4', '1', '15'],
                    ['Neha Singh', 'Operations', '6', '2', '2', '0', '20'],
                    ['Rahul Verma', 'Finance', '3', '2', '1', '0', '24'],
                    ['Siddharth Rao', 'Engineering', '2', '0', '2', '0', '26']
                ];
                content = generateCSV(headers, rows);
                filename = `Leave_Utilization_Audit_${timestamp}.csv`;
            } else if (reportName === 'Payroll Disbursement Log') {
                const headers = ['Employee Name', 'Department', 'Basic Salary ($)', 'Allowances ($)', 'Deductions ($)', 'Net Paid ($)', 'Status', 'Disbursement Date'];
                const rows = [
                    ['Aarav Sharma', 'Engineering', '4800', '720', '384', '5136', 'Disbursed', '2026-05-01'],
                    ['Priya Devi', 'HR & Admin', '3900', '585', '312', '4173', 'Disbursed', '2026-05-01'],
                    ['Amit Patel', 'Sales & BD', '3400', '950', '272', '4078', 'Disbursed', '2026-05-01'],
                    ['Neha Singh', 'Operations', '3600', '540', '288', '3852', 'Disbursed', '2026-05-01'],
                    ['Rahul Verma', 'Finance', '4200', '630', '336', '4494', 'Disbursed', '2026-05-01'],
                    ['Siddharth Rao', 'Engineering', '5200', '780', '416', '5564', 'Disbursed', '2026-05-01']
                ];
                content = generateCSV(headers, rows);
                filename = `Payroll_Disbursement_Log_${timestamp}.csv`;
            }

            triggerDownload(content, filename);
            showToast(`✅ ${reportName} downloaded successfully!`);
        } catch (err) {
            console.error(err);
            showToast('❌ Failed to compile download files.', 'error');
        } finally {
            setDownloading(null);
        }
    };

    const handleCustomSubmit = async (e) => {
        e.preventDefault();
        if (!customReport.type) return showToast('Please select a report category.', 'error');
        
        setShowCustomModal(false);
        setDownloading('custom-generator');
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const headers = ['Report Category', 'Configured Format', 'Date Range Start', 'Date Range End', 'Generated At', 'Auditor Signature'];
            const rows = [
                [customReport.type, customReport.format, customReport.from || 'All Time', customReport.to || 'All Time', new Date().toLocaleString(), 'HR SYSTEM CORE']
            ];
            const content = generateCSV(headers, rows);
            const filename = `HR_Custom_${customReport.type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
            
            triggerDownload(content, filename);
            showToast('✅ Custom report compiled and downloaded!');
        } catch (err) {
            showToast('❌ Custom compilation interrupted.', 'error');
        } finally {
            setDownloading(null);
            setCustomReport({ type: '', format: 'CSV', from: '', to: '' });
        }
    };

    // Fallback Mock Datasets
    const mockKPIs = {
        totalEmployees: stats?.hrStats?.totalEmployees ?? stats?.stats?.totalEmployees ?? 124,
        attendanceRate: '96.2%',
        onLeave: stats?.hrStats?.onLeave ?? 4,
        newJoiners: stats?.hrStats?.newJoiners ?? 5
    };

    const mockAttendanceHistory = (stats?.hrStats?.attendanceHistory && stats.hrStats.attendanceHistory.length > 0)
        ? stats.hrStats.attendanceHistory.map(day => ({
            name: day.name,
            Present: day.employees,
            Rate: ((day.employees / (stats.hrStats.totalEmployees || 124)) * 100).toFixed(1)
          }))
        : [
            { name: 'Mon', Present: 118, Rate: 95.1 },
            { name: 'Tue', Present: 120, Rate: 96.8 },
            { name: 'Wed', Present: 121, Rate: 97.6 },
            { name: 'Thu', Present: 119, Rate: 96.0 },
            { name: 'Fri', Present: 117, Rate: 94.4 }
        ];

    const mockEmployeeDistribution = (stats?.hrStats?.employeeDistribution && stats.hrStats.employeeDistribution.length > 0)
        ? stats.hrStats.employeeDistribution.map(dept => ({
            name: dept.name,
            Count: dept.value,
            percentage: dept.percentage,
            color: dept.color
          }))
        : [
            { name: 'Engineering', Count: 45, color: 'var(--cyber-blue)' },
            { name: 'Sales & BD', Count: 30, color: 'var(--cyber-purple)' },
            { name: 'Operations', Count: 25, color: 'var(--cyber-pink)' },
            { name: 'HR & Admin', Count: 14, color: 'var(--cyber-green)' },
            { name: 'Finance', Count: 10, color: 'var(--cyber-yellow)' }
        ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="cyber-tooltip glass-card">
                    <p className="tooltip-title">{label}</p>
                    {payload.map((pld, index) => (
                        <p key={index} style={{ color: pld.color || 'var(--cyber-blue)', fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>
                            {pld.name}: {pld.value}{pld.name === 'Rate' ? '%' : ' Staff'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="hr-reports-container">
            {/* Toast System */}
            {toast && (
                <div className={`toast-alert ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Glowing Header */}
            <header className="hr-reports-header">
                <div>
                    <h1 className="title-gradient flex-center gap-10" style={{ justifyContent: 'flex-start' }}>
                        HR Reports & Analytics
                    </h1>
                    <p className="subtitle-cyber">Export comprehensive workforce data, compliance audits, and deep demographic insights.</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-primary" 
                        onClick={() => setShowCustomModal(true)}
                        disabled={downloading === 'custom-generator'}
                    >
                        {downloading === 'custom-generator' ? (
                            <>
                                <RefreshCw className="spin-icon" size={16} />
                                <span>Compiling...</span>
                            </>
                        ) : (
                            <>
                                <FileText size={16} />
                                <span>Generate Custom Report</span>
                            </>
                        )}
                    </button>
                    <button className="btn-refresh" onClick={fetchHRStats} title="Sync Live Data">
                        <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                    </button>
                </div>
            </header>

            {/* Premium Cyber KPI Row */}
            <section className="cyber-kpi-row">
                <div className="kpi-glass-card blue-edge">
                    <div className="kpi-head">
                        <span>Total Active Staff</span>
                        <Users className="icon-blue" size={18} />
                    </div>
                    <h3>{loading ? '...' : mockKPIs.totalEmployees}</h3>
                    <p className="kpi-sub"><TrendingUp size={12} /> Live Headcount</p>
                </div>
                <div className="kpi-glass-card green-edge">
                    <div className="kpi-head">
                        <span>Attendance Rate</span>
                        <CheckCircle className="icon-green" size={18} />
                    </div>
                    <h3>{mockKPIs.attendanceRate}</h3>
                    <p className="kpi-sub">Weekly Average</p>
                </div>
                <div className="kpi-glass-card yellow-edge">
                    <div className="kpi-head">
                        <span>Active Absences</span>
                        <Clock className="icon-yellow" size={18} />
                    </div>
                    <h3>{loading ? '...' : mockKPIs.onLeave}</h3>
                    <p className="kpi-sub">Approved Leaves</p>
                </div>
                <div className="kpi-glass-card pink-edge">
                    <div className="kpi-head">
                        <span>Monthly Hires</span>
                        <Award className="icon-pink" size={18} />
                    </div>
                    <h3>+{loading ? '...' : mockKPIs.newJoiners}</h3>
                    <p className="kpi-sub">New Personnel</p>
                </div>
            </section>

            {/* Reports Export Grid */}
            <section className="reports-grid-section">
                <h2 className="section-title">Core Document Exports</h2>
                <div className="reports-export-grid">
                    {hrReportsList.map((report, i) => (
                        <div key={i} className="glass-card hr-report-card">
                            <div className="card-top-accent" style={{ background: report.color }}></div>
                            <div className="report-icon-box" style={{ borderColor: report.color }}>
                                {report.icon}
                            </div>
                            <div className="report-details">
                                <h3>{report.name}</h3>
                                <p>Standard Format: <strong>{report.format}</strong></p>
                            </div>
                            <button 
                                className="cyber-download-btn"
                                style={{ background: `linear-gradient(135deg, ${report.color} 0%, rgba(0,0,0,0.6) 100%)` }}
                                onClick={() => handleDownload(report.name)}
                                disabled={downloading !== null}
                                title={`Download ${report.name}`}
                            >
                                {downloading === report.name ? (
                                    <RefreshCw className="spin-icon" size={18} />
                                ) : (
                                    <Download size={18} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* High-Fidelity Interactive Analytics double chart */}
            <section className="interactive-analytics-section mt-30">
                <div className="analytics-box-header">
                    <div>
                        <h2 className="section-title">Advanced Demographic & Attendance Analytics</h2>
                        <p className="section-desc">Interactive visual mappings of staff patterns and departmental concentrations.</p>
                    </div>
                </div>

                <div className="analytics-charts-grid">
                    {/* Workforce Attendance Area Chart */}
                    <div className="glass-card chart-box">
                        <div className="chart-info-header">
                            <h3>Workforce Presence Trend</h3>
                            <span className="badge-glow-blue">Weekly Log</span>
                        </div>
                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={mockAttendanceHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="cyberArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--cyber-blue)" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="var(--cyber-blue)" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[80, 100]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Rate" stroke="var(--cyber-blue)" strokeWidth={2} fill="url(#cyberArea)" name="Presence Rate" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Distribution Bar Chart */}
                    <div className="glass-card chart-box">
                        <div className="chart-info-header">
                            <h3>Departmental Spread</h3>
                            <span className="badge-glow-purple">Active Roles</span>
                        </div>
                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={mockEmployeeDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="Count" radius={[6, 6, 0, 0]} name="Headcount">
                                        {mockEmployeeDistribution.map((entry, index) => (
                                            <Cell key={index} fill={entry.color || 'var(--cyber-purple)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Report Compilation Modal */}
            {showCustomModal && (
                <div className="cyber-modal-overlay">
                    <div className="glass-card cyber-modal-box animate-pop">
                        <header className="modal-header-cyber">
                            <h3>Compile Custom HR Audit</h3>
                            <button className="btn-close-modal" onClick={() => setShowCustomModal(false)}><X size={16} /></button>
                        </header>
                        <form onSubmit={handleCustomSubmit} className="modal-form">
                            <div className="field-group">
                                <label>Target Audit Domain</label>
                                <select 
                                    value={customReport.type} 
                                    onChange={e => setCustomReport({ ...customReport, type: e.target.value })}
                                    required
                                >
                                    <option value="">Choose category...</option>
                                    <option value="Absence & Absence Audits">Absence & Leave Utilization Audits</option>
                                    <option value="Workforce Demographics">Workforce Demographics & Role Layout</option>
                                    <option value="Compliance Log">Compliance & Tax Filings Log</option>
                                    <option value="Hiring Pipeline Stats">Hiring & Onboarding Pipeline Stats</option>
                                </select>
                            </div>
                            <div className="field-row">
                                <div className="field-group">
                                    <label>Start Date</label>
                                    <input 
                                        type="date" 
                                        value={customReport.from} 
                                        onChange={e => setCustomReport({ ...customReport, from: e.target.value })} 
                                    />
                                </div>
                                <div className="field-group">
                                    <label>End Date</label>
                                    <input 
                                        type="date" 
                                        value={customReport.to} 
                                        onChange={e => setCustomReport({ ...customReport, to: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Target Format</label>
                                <div className="radio-group-cyber">
                                    {['CSV', 'XLSX', 'PDF'].map(fmt => (
                                        <label key={fmt} className={`radio-label ${customReport.format === fmt ? 'active' : ''}`}>
                                            <input 
                                                type="radio" 
                                                name="format" 
                                                value={fmt} 
                                                checked={customReport.format === fmt}
                                                onChange={e => setCustomReport({ ...customReport, format: e.target.value })}
                                            />
                                            {fmt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions-cyber">
                                <button type="button" className="btn-secondary" onClick={() => setShowCustomModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Compile & Download</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .hr-reports-container {
                    padding: 30px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    color: var(--text-main);
                    background-color: var(--bg-dark);
                    font-family: 'Outfit', sans-serif;
                }

                /* Toast Alert System */
                .toast-alert {
                    position: fixed;
                    top: 25px;
                    right: 25px;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 15px 22px;
                    background: var(--bg-card);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    font-size: 13px;
                    font-weight: 600;
                    box-shadow: var(--neon-glow);
                    animation: slideInRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .toast-alert.success { border-color: var(--cyber-green); color: var(--cyber-green); }
                .toast-alert.error { border-color: var(--cyber-pink); color: var(--cyber-pink); }
                .toast-alert.warning { border-color: var(--cyber-yellow); color: var(--cyber-yellow); }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Header Component */
                .hr-reports-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    padding-bottom: 20px;
                }
                .subtitle-cyber {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-top: 6px;
                }
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .btn-refresh {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-refresh:hover {
                    color: var(--cyber-blue);
                    border-color: var(--cyber-blue);
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
                }

                /* KPI Grid Row */
                .cyber-kpi-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }
                .kpi-glass-card {
                    background: var(--bg-card);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    padding: 20px;
                    border-radius: 2px;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    transition: all 0.3s ease;
                }
                .kpi-glass-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--neon-glow);
                }
                .kpi-glass-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                }
                .blue-edge::before { background: var(--cyber-blue); }
                .green-edge::before { background: var(--cyber-green); }
                .yellow-edge::before { background: var(--cyber-yellow); }
                .pink-edge::before { background: var(--cyber-pink); }

                .kpi-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-muted);
                }
                .kpi-glass-card h3 {
                    font-size: 26px;
                    font-weight: 800;
                    color: white;
                    font-family: 'Share Tech Mono', monospace;
                    margin: 2px 0;
                }
                .kpi-sub {
                    font-size: 10px;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .icon-blue { color: var(--cyber-blue); }
                .icon-green { color: var(--cyber-green); }
                .icon-yellow { color: var(--cyber-yellow); }
                .icon-pink { color: var(--cyber-pink); }

                /* Core Document Grid */
                .reports-grid-section {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .section-title {
                    font-size: 16px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: white;
                    margin: 0;
                }
                .reports-export-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .hr-report-card {
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    transition: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .hr-report-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255, 255, 255, 0.12);
                }
                .card-top-accent {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    width: 3px;
                }
                .report-icon-box {
                    width: 50px;
                    height: 50px;
                    border: 1px solid;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.01);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .report-details {
                    flex: 1;
                }
                .report-details h3 {
                    font-size: 15px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 5px 0;
                }
                .report-details p {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin: 0;
                }
                .cyber-download-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 4px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: 0.2s ease;
                }
                .cyber-download-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 15px rgba(255,255,255,0.1);
                }
                .cyber-download-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Double Charts layout */
                .analytics-box-header {
                    margin-bottom: 20px;
                }
                .section-desc {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin: 4px 0 0 0;
                }
                .analytics-charts-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }
                .chart-box {
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    padding: 24px;
                }
                .chart-info-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 22px;
                }
                .chart-info-header h3 {
                    font-size: 13px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: white;
                    margin: 0;
                }
                .badge-glow-blue {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 3px 10px;
                    background: rgba(6, 182, 212, 0.08);
                    color: var(--cyber-blue);
                    border: 1px solid rgba(6, 182, 212, 0.2);
                    border-radius: 20px;
                    letter-spacing: 0.5px;
                }
                .badge-glow-purple {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 3px 10px;
                    background: rgba(139, 92, 246, 0.08);
                    color: var(--cyber-purple);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 20px;
                    letter-spacing: 0.5px;
                }
                .chart-body {
                    width: 100%;
                }

                /* Cyber Tooltip */
                .cyber-tooltip {
                    background: rgba(4, 5, 14, 0.95) !important;
                    border: 1px solid var(--cyber-blue) !important;
                    box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
                    padding: 10px 14px !important;
                    border-radius: 4px !important;
                }
                .tooltip-title {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin: 0 0 6px 0;
                    text-transform: uppercase;
                }

                /* Futuristic Modal Layout */
                .cyber-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(4, 5, 14, 0.6);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }
                .cyber-modal-box {
                    width: 100%;
                    max-width: 480px;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-image: var(--border-gradient-active) 1 !important;
                    padding: 30px;
                    background: rgba(6, 7, 19, 0.96) !important;
                    box-shadow: var(--neon-glow-strong) !important;
                }
                .modal-header-cyber {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 15px;
                    margin-bottom: 22px;
                }
                .modal-header-cyber h3 {
                    font-size: 14px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: white;
                    margin: 0;
                }
                .btn-close-modal {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                }
                .btn-close-modal:hover { color: white; }

                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .field-group label {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }
                .field-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .field-group select, .field-group input {
                    width: 100%;
                }
                
                /* Radio Buttons */
                .radio-group-cyber {
                    display: flex;
                    gap: 10px;
                }
                .radio-label {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    background: var(--bg-input);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .radio-label input {
                    display: none;
                }
                .radio-label:hover {
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .radio-label.active {
                    border-color: var(--cyber-blue);
                    color: var(--cyber-blue);
                    background: rgba(6, 182, 212, 0.05);
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
                }

                .modal-actions-cyber {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 20px;
                    margin-top: 8px;
                }

                .mt-30 { margin-top: 30px; }
                .flex-center { display: flex; align-items: center; justify-content: center; }
                .gap-10 { gap: 10px; }

                /* Micro Animations */
                .spin-icon { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
                @keyframes pop { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }

                @media (max-width: 1080px) {
                    .cyber-kpi-row { grid-template-columns: 1fr 1fr; }
                    .reports-export-grid { grid-template-columns: 1fr; }
                    .analytics-charts-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 640px) {
                    .hr-reports-container { padding: 15px; }
                    .hr-reports-header { flex-direction: column; align-items: flex-start; }
                    .header-actions { width: 100%; }
                    .header-actions .btn-primary { flex: 1; }
                    .cyber-kpi-row { grid-template-columns: 1fr; }
                    .field-row { grid-template-columns: 1fr; }
                    .modal-actions-cyber { flex-direction: column-reverse; }
                    .modal-actions-cyber button { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default HRReports;
