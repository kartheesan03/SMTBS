import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GlobalBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show on the main dashboard root
    if (location.pathname === '/') {
        return null;
    }

    return (
        <div style={{ padding: '16px 24px 0 24px', marginBottom: '-8px' }}>
            <button 
                onClick={() => navigate(-1)}
                style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '8px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: '#475569',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#475569';
                }}
            >
                <ArrowLeft size={16} />
                Back
            </button>
        </div>
    );
};

export default GlobalBackButton;
