import React, { useState } from "react";
import {
  Code2,
  Cloud,
  MessageSquare,
  Smartphone,
  FileSpreadsheet,
  Box,
  Zap,
  Copy,
  RefreshCw,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../components/PageHeader";
import API from "../api/axios";
import "./IntegrationsSettings.css";
const IntegrationsSettings = () => {
  const defaultIntegrations = [
    {
      id: "github",
      name: "GitHub",
      desc: "Code repository & CI/CD",
      badge: "DEV",
      connected: true,
      btnColor: "orange",
      icon: <Code2 size={32} color="#ea580c" />,
      iconBg: "#fff7ed",
    },
    {
      id: "docker",
      name: "Docker",
      desc: "Container management",
      badge: "DEV",
      connected: true,
      btnColor: "blue",
      icon: <Box size={32} color="#0ea5e9" />,
      iconBg: "#f0f9ff",
    },
    {
      id: "aws",
      name: "AWS / Azure",
      desc: "Cloud infrastructure",
      badge: "CLOUD",
      connected: false,
      btnColor: "orange",
      icon: <Cloud size={32} color="#475569" />,
      iconBg: "#f8fafc",
    },
    {
      id: "slack",
      name: "Slack",
      desc: "Team notifications & alerts",
      badge: "COMMS",
      connected: false,
      btnColor: "purple",
      icon: <MessageSquare size={32} color="#475569" />,
      iconBg: "#f8fafc",
    },
    {
      id: "whatsapp",
      name: "WhatsApp API",
      desc: "Customer & vendor messaging",
      badge: "COMMS",
      connected: true,
      btnColor: "green",
      icon: <Smartphone size={32} color="#10b981" />,
      iconBg: "#ecfdf5",
    },
    {
      id: "sheets",
      name: "Google Sheets",
      desc: "Export reports to Sheets",
      badge: "PRODUCTIVITY",
      connected: false,
      btnColor: "blue",
      icon: <FileSpreadsheet size={32} color="#475569" />,
      iconBg: "#f8fafc",
    },
  ];
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [intList, setIntList] = useState(defaultIntegrations);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/integrations');
      if (data.integrations) {
        setIntList((prev) =>
          prev.map((int) => {
            const dbInt = data.integrations.find((i) => i.provider === int.id);
            return dbInt ? { ...int, connected: dbInt.isConnected } : int;
          })
        );
      }
      if (data.apiKey) setApiKey(data.apiKey);
      if (data.webhookUrl) setWebhookUrl(data.webhookUrl);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnect = async (id) => {
    const int = intList.find((i) => i.id === id);
    const isConnecting = !int.connected;
    
    try {
      if (isConnecting) {
        if (id === 'slack') {
          const webhookUrl = prompt("Enter your Slack Incoming Webhook URL:");
          if (!webhookUrl) return;
          toast.loading(`Connecting to ${int.name}...`, { id: 'connectToast' });
          await API.post(`/integrations/${id}/connect`, { webhookUrl });
          toast.success(`${int.name} connected successfully`, { id: 'connectToast' });
        } else if (id === 'sheets' || id === 'whatsapp') {
          const webhookUrl = prompt("Enter your Zapier/Make Webhook URL:");
          if (!webhookUrl) return;
          toast.loading(`Connecting to ${int.name}...`, { id: 'connectToast' });
          await API.post(`/integrations/${id}/connect`, { webhookUrl });
          toast.success(`${int.name} connected successfully`, { id: 'connectToast' });
        } else {
          toast.loading(`Connecting to ${int.name}...`, { id: 'connectToast' });
          // Simulate a brief delay for other mocked endpoints (aws, github, docker)
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await API.post(`/integrations/${id}/connect`);
          toast.success(`${int.name} connected successfully`, { id: 'connectToast' });
        }
      } else {
        toast.loading(`Disconnecting ${int.name}...`, { id: 'connectToast' });
        await API.post(`/integrations/${id}/disconnect`);
        toast.success(`${int.name} disconnected successfully`, { id: 'connectToast' });
      }
      
      setIntList((prev) =>
        prev.map((i) => (i.id === id ? { ...i, connected: isConnecting } : i))
      );
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${isConnecting ? 'connect' : 'disconnect'} ${int.name}`, { id: 'connectToast' });
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm("Are you sure? Existing applications using this key will lose access.")) return;
    try {
      const { data } = await API.post('/integrations/system/apikey');
      setApiKey(data.apiKey);
      toast.success("API Key regenerated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to regenerate API key");
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Webhook URL cannot be empty");
      return;
    }
    try {
      await API.post('/integrations/system/webhook', { webhookUrl });
      toast.success("Webhook URL saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save Webhook URL");
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API Key copied to clipboard");
  };
  return (
    <div className="int-container">
      <PageHeader
        title="Integrations & API"
        badge="SYSTEM"
        subtitle="Connect external services, set up webhooks, and manage API keys."
      />
      {/* Integrations Grid */}
      <div className="int-grid">
        {intList.map((int) => (
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
                <span
                  className={`int-status-dot ${
                    int.connected ? "connected" : "disconnected"
                  }`}
                ></span>
                {int.connected ? "Connected" : "Not connected"}
              </div>
              {int.connected ? (
                <button
                  className="int-btn-disconnect"
                  onClick={() => handleToggleConnect(int.id)}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  className={`int-btn-connect ${int.btnColor}`}
                  onClick={() => handleToggleConnect(int.id)}
                >
                  Connect
                </button>
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
              <button className="int-copy-btn" onClick={copyToClipboard}>
                <Copy size={16} color="#94a3b8" />
              </button>
            </div>
            <button
              className="int-btn-regenerate"
              onClick={handleRegenerateKey}
            >
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
            <button
              className="int-btn-save-webhook"
              onClick={handleSaveWebhook}
            >
              <CheckCircle size={14} /> Save Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default IntegrationsSettings;
