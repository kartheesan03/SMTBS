import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';


import PageHeader from '../components/PageHeader';

const AccessDenied = () => {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{ padding: '24px 32px' }}>
                <PageHeader title="Access Denied" showBack={true} backPath="/" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: '-80px' }}>
                <ShieldAlert size={80} color="#ef4444" style={{ marginBottom: '20px' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 10px', color: '#334155' }}>403 Access Denied</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#334155' }}>
                    You do not have the required permissions to view this page.
                </p>
            </div>
        </div>
    );
};

export default AccessDenied;
