import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import GlobalBackButton from '../components/GlobalBackButton';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100vh', background: '#f8fafc',
            color: '#334155', fontFamily: 'Inter, sans-serif'
        }}>
            <GlobalBackButton />
            <ShieldAlert size={80} color="#ef4444" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 10px' }}>403 Access Denied</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
                You do not have the required permissions to view this page.
            </p>
            <button 
                onClick={() => navigate('/')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: '#3b82f6', color: '#fff',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '1rem', fontWeight: '500'
                }}
            >
                <ArrowLeft size={20} />
                Return to Dashboard
            </button>
        </div>
    );
};

export default AccessDenied;
