import React, { useState } from 'react';
import { Code2, Cloud, MessageSquare, Smartphone, FileSpreadsheet, Box, Zap, Copy, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import './IntegrationsSettings.css';

const IntegrationsSettings = () => {
    const defaultIntegrations = [
        {
            id: 'github',
            name: 'GitHub',
            desc: 'Code repository & CI/CD',
            badge: 'DEV',
            connected: true,
            btnColor: 'orange',
            icon: <Code2 size={32} color="#ea580c" />,
            iconBg: '#fff7ed'
        },
        {
            id: 'docker',
            name: 'Docker',
            desc: 'Container management',
            badge: 'DEV',
            connected: true,
            btnColor: 'blue',
            icon: <Box size={32} color="#0ea5e9" />,
            iconBg: '#f0f9ff'
        },
        {
            id: 'aws',
            name: 'AWS / Azure',
            desc: 'Cloud infrastructure',
            badge: 'CLOUD',
            connected: false,
            btnColor: 'orange',
            icon: <Cloud size={32} color="#475569" />,
            iconBg: '#f8fafc'
        },
        {
            id: 'slack',
            name: 'Slack',
            desc: 'Team notifications & alerts',
            badge: 'COMMS',
            connected: false,
            btnColor: 'purple',
            icon: <MessageSquare size={32} color="#475569" />,
            iconBg: '#f8fafc'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp API',
            desc: 'Customer & vendor messaging',
            badge: 'COMMS',
            connected: true,
            btnColor: 'green',
            icon: <Smartphone size={32} color="#10b981" />,
            iconBg: '#ecfdf5'
        },
        {
            id: 'sheets',
            name: 'Google Sheets',
            desc: 'Export reports to Sheets',
            badge: 'PRODUCTIVITY',
            connected: false,
            btnColor: 'blue',
            icon: <FileSpreadsheet size={32} color="#475569" />,
            iconBg: '#f8fafc'
        }
    ];

    const [apiKey, setApiKey] = useState('sk-smtbms-........................');
    const [webhookUrl, setWebhookUrl] = useState('https://your-app.com/webhook/smtbms');
    const [intList, setIntList] = useState(defaultIntegrations);

    const handleToggleConnect = (id) => {
        setIntList(prev => prev.map(int => {
            if (int.id === id) {
                const newState = !int.connected;
                toast.success(`${int.name} ${newState ? 'connected' : 'disconnected'} successfully`);
                return { ...int, connected: newState };
            }
            return int;
        }));
    };

    const handleRegenerateKey = () => {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setApiKey(`sk-smtbms-${randomString}`);
        toast.success("API Key regenerated successfully");
    };

    const handleSaveWebhook = () => {
        if (!webhookUrl.trim()) {
            toast.error("Webhook URL cannot be empty");
            return;
        }
        toast.success("Webhook URL saved successfully");
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        toast.success("API Key copied to clipboard");
    };

    return (
        <div className="int-container">
            {/* Integrations Grid */}
            <div className="int-grid">
                {intList.map(int => (
                    <div key={int.id} className="int-card">
                        <div className="int-card-top">
                            <div className="int-icon" style={{ background: int.iconBg }}>
                                {int.icon}
                            </div>
                            <div className="int-info">
                                <div className="int-title-row">
                                    <h3>{int.name}</h3>
                                    <span className="int-badge">{int.badge}</span>
                                </div>
                                <p>{int.desc}</p>
                            </div>
                        </div>
                        <div className="int-card-bottom">
                            <div className="int-status">
                                <span className={`int-status-dot ${int.connected ? 'connected' : 'disconnected'}`}></span>
                                {int.connected ? 'Connected' : 'Not connected'}
                            </div>
                            {int.connected ? (
                                <button className="int-btn-disconnect" onClick={() => handleToggleConnect(int.id)}>Disconnect</button>
                            ) : (
                                <button className={`int-btn-connect ${int.btnColor}`} onClick={() => handleToggleConnect(int.id)}>Connect</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* API & Webhooks Section */}
            <div className="int-api-section">
                <div className="int-api-header">
                    <div className="int-api-icon">
                        <Zap size={18} color="#8b5cf6" />
                    </div>
                    <h3>API & Webhooks</h3>
                </div>

                <div className="int-api-body">
                    <div className="int-form-group">
                        <label>API KEY</label>
                        <div className="int-input-wrapper">
                            <input type="text" value={apiKey} readOnly />
                            <button className="int-copy-btn" onClick={copyToClipboard}><Copy size={16} color="#94a3b8" /></button>
                        </div>
                        <button className="int-btn-regenerate" onClick={handleRegenerateKey}>
                            <RefreshCw size={14} /> Regenerate Key
                        </button>
                    </div>

                    <div className="int-form-group">
                        <label>WEBHOOK URL</label>
                        <div className="int-input-wrapper">
                            <input 
                                type="text" 
                                value={webhookUrl} 
                                onChange={(e) => setWebhookUrl(e.target.value)} 
                            />
                        </div>
                        <button className="int-btn-save-webhook" onClick={handleSaveWebhook}>
                            <CheckCircle size={14} /> Save Webhook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsSettings;
