import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import './LandingPage.css'; // Reuse landing page CSS for the shell

const PublicPlaceholder = ({ title }) => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="nav-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                    <Globe size={28} className="logo-icon" />
                    <span>SMTBMS</span>
                </div>
                <div className="nav-actions">
                    <button className="btn-login" onClick={() => navigate('/login')}>Log In</button>
                    <button className="btn-signup" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            </nav>
            <main className="hero-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '60vh' }}>
                <h1 className="hero-title" style={{ fontSize: '48px', marginBottom: '24px' }}>{title}</h1>
                <p className="hero-subtitle">This page is coming soon.</p>
                <button className="btn-get-started" style={{ marginTop: '32px' }} onClick={() => navigate('/')}>
                    Return Home
                </button>
            </main>
            <div className="fx-bg-orbs">
                <div className="fx-orb fx-orb-1" />
                <div className="fx-orb fx-orb-2" />
            </div>
            <div className="fx-grid-overlay" />
        </div>
    );
};

export default PublicPlaceholder;
