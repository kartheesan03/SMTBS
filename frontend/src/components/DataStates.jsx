import React from 'react';
import { motion } from 'framer-motion';
import { Database, AlertCircle } from 'lucide-react';

export const LoadingState = ({ message = "Loading data...", height = 200 }) => (
    <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <div className="loader" style={{ marginBottom: 10 }}></div>
        <div style={{ fontSize: '13px' }}>{message}</div>
    </div>
);

export const EmptyState = ({ icon: Icon = Database, title = "No Data Available", message = "There is currently no data to display here.", height = 200, actionButton }) => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}
    >
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#94a3b8' }}>
            <Icon size={24} />
        </div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#334155', fontWeight: 600 }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: 250, marginBottom: actionButton ? 16 : 0 }}>{message}</p>
        {actionButton && <div>{actionButton}</div>}
    </motion.div>
);

export const ErrorState = ({ message = "Failed to load data", onRetry, height = 200 }) => (
    <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#ef4444' }}>
            <AlertCircle size={24} />
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#ef4444' }}>{message}</p>
        {onRetry && (
            <button onClick={onRetry} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                Retry
            </button>
        )}
    </div>
);
