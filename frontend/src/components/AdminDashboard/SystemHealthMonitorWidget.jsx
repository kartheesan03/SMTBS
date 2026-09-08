import React from 'react';
import { Activity, Server, Users, Cpu, Database } from 'lucide-react';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import './SystemHealthMonitorWidget.css';

const SystemHealthMonitorWidget = () => {
  const { data, loading, error } = useSystemHealth(60000); // Poll every 60 seconds

  if (loading && !data) {
    return (
      <div className="bx-sh-panel">
        <div className="bx-sh-header">
          <div className="bx-sh-icon-container">
            <Activity size={16} color="#0ea5e9" />
          </div>
          <div className="bx-sh-header-text">
            <h2 className="bx-sh-title">SYSTEM HEALTH</h2>
          </div>
        </div>
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          Initializing Heartbeat...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bx-sh-panel">
        <div className="bx-sh-header">
          <div className="bx-sh-icon-container">
            <Activity size={16} color="#ef4444" />
          </div>
          <div className="bx-sh-header-text">
            <h2 className="bx-sh-title" style={{ color: '#ef4444' }}>SYSTEM HEALTH</h2>
            <p className="bx-sh-subtitle">Disconnected</p>
          </div>
        </div>
      </div>
    );
  }

  const { status, color, insight, metrics, chart_data } = data;
  
  // Format chart data for Recharts
  const formattedChartData = chart_data.map((val, idx) => ({ time: idx, load: val }));

  return (
    <div className="bx-sh-panel">
      
      {/* 1. Header */}
      <div className="bx-sh-header">
        <div className="bx-sh-icon-container">
          <Server size={18} color="#0ea5e9" />
        </div>
        <div className="bx-sh-header-text">
          <h2 className="bx-sh-title">SYSTEM HEALTH</h2>
        </div>
      </div>

      {/* 2. Status row */}
      <div className="bx-sh-status-row">
        <div className={`bx-sh-monitoring ${status === 'Warning' ? 'warning' : ''}`} style={{ color: color, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></div>
          {status === 'Warning' ? 'ANOMALY DETECTED' : 'OPTIMAL'}
        </div>
      </div>

      {/* 3. Metrics Grid */}
      <div className="bx-sh-overview">
        <div className="bx-sh-stat">
          <div className="bx-sh-stat-value">{metrics.active_users}</div>
          <div className="bx-sh-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Active Users
          </div>
        </div>
        <div className="bx-sh-stat">
          <div className="bx-sh-stat-value" style={{ color: metrics.requests_per_sec > 200 ? '#f59e0b' : '#0f172a' }}>
            {metrics.requests_per_sec}/s
          </div>
          <div className="bx-sh-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={12} /> API Traffic
          </div>
        </div>
        <div className="bx-sh-stat">
          <div className="bx-sh-stat-value">{metrics.latency_ms}ms</div>
          <div className="bx-sh-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Server size={12} /> Avg Latency
          </div>
        </div>
        <div className="bx-sh-stat">
          <div className="bx-sh-stat-value">{metrics.memory_usage}%</div>
          <div className="bx-sh-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Database size={12} /> Memory Usage
          </div>
        </div>
      </div>

      {/* 4. Live Chart & Insight */}
      <div className="bx-sh-chart-container">
        <div className="bx-sh-chart-header">
          <div className="bx-sh-chart-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cpu size={14} color="#0ea5e9"/> CPU Load
          </div>
          <div style={{ color: color, fontWeight: '700', fontSize: '0.9rem' }}>
            {metrics.cpu_load}%
          </div>
        </div>
        
        <div style={{ height: '110px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedChartData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <Area 
                type="monotone" 
                dataKey="load" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={0.1} 
                fill={color} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`bx-sh-insight-box ${status === 'Warning' ? 'warning' : ''}`}>
          {insight}
        </div>
      </div>
      
    </div>
  );
};

export default SystemHealthMonitorWidget;
