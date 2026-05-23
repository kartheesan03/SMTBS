import React from 'react';
import DataTable from '../components/Dashboard/DataTable';
import { PhoneCall, Mail, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const FollowUps = () => {
    const alerts = [
        { id: 1, name: 'Sarah Connor', type: 'Call', time: '10:00 AM', status: 'Overdue', phone: '+1 555-9012' },
        { id: 2, name: 'John Wick', type: 'Email', time: '02:30 PM', status: 'Pending', email: 'j.wick@continental.com' },
        { id: 3, name: 'Gordon Freeman', type: 'Call', time: '04:00 PM', status: 'Pending', phone: '+1 555-8821' },
    ];

    return (
        <div className="module-container">
            <header className="module-header">
                <div>
                    <h1 className="title-gradient">Sales Follow-ups</h1>
                    <p className="text-muted">Manage interaction schedules and engagement priorities.</p>
                </div>
            </header>

            <div className="alerts-summary-row mt-30">
                <div className="glass-card alert-summary shadow-red">
                    <AlertCircle color="#ef4444" size={24}/>
                    <div>
                        <h3>Overdue Follow-ups</h3>
                        <p className="val text-danger">3 Alerts</p>
                    </div>
                </div>
                <div className="glass-card alert-summary">
                    <Clock color="#f59e0b" size={24}/>
                    <div>
                        <h3>Scheduled Today</h3>
                        <p className="val">8 Tasks</p>
                    </div>
                </div>
            </div>

            <div className="module-content mt-30">
                <DataTable 
                    title="Communication Ledger"
                    headers={['Customer/Lead', 'Contact Type', 'Scheduled Time', 'Status', 'Actions']}
                    data={alerts}
                    renderRow={(a) => (
                        <>
                            <td><strong>{a.name}</strong></td>
                            <td>
                                <div className="contact-type-chip">
                                    {a.type === 'Call' ? <PhoneCall size={14}/> : <Mail size={14}/>}
                                    {a.type}
                                </div>
                            </td>
                            <td><div className="flex-center gap-5" style={{justifyContent: 'flex-start'}}><Calendar size={14}/> {a.time}</div></td>
                            <td><span className={`status-pill ${a.status.toLowerCase()}`}>{a.status}</span></td>
                            <td>
                                <div className="action-btns-flex">
                                    <button className="btn-done"><CheckCircle size={16}/> Mark Done</button>
                                </div>
                            </td>
                        </>
                    )}
                />
            </div>

            <style jsx="true">{`
                .module-container { padding: 30px; }
                .module-header { margin-bottom: 30px; }
                .alerts-summary-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .alert-summary { display: flex; align-items: center; gap: 25px; padding: 25px; }
                .alert-summary h3 { font-size: 14px; color: var(--text-muted); margin-bottom: 5px; }
                .alert-summary .val { font-size: 24px; font-weight: 700; color: var(--text-main); }
                .shadow-red { border-left: 4px solid #ef4444; }
                
                .contact-type-chip { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--text-muted); }
                .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
                .status-pill.overdue { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                
                .btn-done { background: rgba(16, 185, 129, 0.1); color: #10b981; font-size: 12px; font-weight: 600; padding: 6px 15px; border-radius: 8px; display: flex; align-items: center; gap: 8px; }
                .mt-30 { margin-top: 30px; }
            `}</style>
        </div>
    );
};

export default FollowUps;
