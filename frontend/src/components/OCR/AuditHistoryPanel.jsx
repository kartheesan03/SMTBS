import React from 'react';
import { History, User as UserIcon, CheckCircle2, AlertTriangle, Edit, UploadCloud } from 'lucide-react';

const AuditHistoryPanel = ({ auditLog = [] }) => {
  if (!auditLog || auditLog.length === 0) return null;

  const getActionIcon = (action) => {
    const act = action.toLowerCase();
    if (act.includes('upload')) return <UploadCloud size={14} color="#3b82f6" />;
    if (act.includes('approve')) return <CheckCircle2 size={14} color="#16a34a" />;
    if (act.includes('reject')) return <AlertTriangle size={14} color="#dc2626" />;
    if (act.includes('correct') || act.includes('edit')) return <Edit size={14} color="#ea580c" />;
    return <History size={14} color="#6b7280" />;
  };

  return (
    <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginTop: '24px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
        <History size={16} /> Audit History
      </h3>
      
      <div style={{ position: 'relative', paddingLeft: '8px' }}>
        {/* Vertical line connecting timeline items */}
        <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: '#e5e7eb' }}></div>
        
        {auditLog.slice().reverse().map((log, index) => (
          <div key={index} style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
            <div style={{ 
              width: '24px', height: '24px', borderRadius: '50%', background: '#f3f4f6', 
              border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 2
            }}>
              {getActionIcon(log.action)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{log.action}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserIcon size={12} />
                {log.userName} {log.userRole ? `(${log.userRole})` : ''}
              </div>
              
              {log.detail && (
                <div style={{ fontSize: '12px', color: '#6b7280', background: '#f9fafb', padding: '6px 10px', borderRadius: '4px', marginTop: '4px' }}>
                  {log.detail}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditHistoryPanel;
