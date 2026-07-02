import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import {
    Shield, Users, Monitor, User, TrendingUp,
    Box, BarChart2, Settings, ShieldCheck, CheckCircle2,
    Layers, Activity, Globe, Fingerprint, ChevronDown
} from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Admin');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const roles = [
        { id: 'Admin', icon: Shield },
        { id: 'HR', icon: Users },
        { id: 'Manager', icon: Monitor },
        { id: 'Employee', icon: User },
        { id: 'Sales', icon: TrendingUp }
    ];
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsRoleDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.style.overflow = 'hidden';
        html.style.height = '100%';
        body.style.overflow = 'hidden';
        body.style.height = '100%';
        body.style.minHeight = 'unset';
        body.style.backgroundColor = '#081028';
        return () => {
            html.style.overflow = '';
            html.style.height = '';
            body.style.overflow = '';
            body.style.height = '';
            body.style.minHeight = '';
            body.style.backgroundColor = '';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const payload = { name, email, phone, role, password };
            const { data } = await API.post('/auth/register', payload);
            login(data, false);
            setError('');
            if (data.isProfileComplete === false) {
                navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                const { data } = await API.post('/auth/google', {
                    access_token: tokenResponse.access_token,
                    mode: 'signup',
                    role: role
                });

                login(data, false);
                if (data.isProfileComplete === false) {
                    navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
                } else {
                    navigate('/');
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.message;
                setError(msg || 'Google Sign-up failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('Google Sign-up failed. Please try again.'),
        prompt: 'select_account login'
    });

    return (
        <div className="login-wrapper">
            <div className="login-split">

                {/* Left Side: Dark Hero Section */}
                <div className="login-banner">
                    <div className="banner-content">
                        <div className="brand">
                            <div className="brand-logo">
                                <div className="orbital-core"></div>
                                <div className="orbital-ring ring-1"></div>
                                <div className="orbital-ring ring-2"></div>
                                <div className="orbital-ring ring-3"></div>
                            </div>
                            <div className="brand-text">
                                <h2>Smart Material Tracking &</h2>
                                <h2>Business Management System</h2>
                            </div>
                        </div>

                        <div className="hero-text">
                            <h1>Manage.<br />Track.<br />Optimize. <span className="highlight">Grow.</span></h1>
                            <p>A smart platform to streamline your materials, operations, and business in one place.</p>
                        </div>

                        <div className="features-grid">
                            <div className="feature-item">
                                <div className="feature-icon"><Layers size={22} /></div>
                                <h3>Smart Inventory</h3>
                                <p>AI-driven stock optimization and real-time tracking.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Activity size={22} /></div>
                                <h3>Live Operations</h3>
                                <p>Monitor workflows and operational bottlenecks instantly.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Globe size={22} /></div>
                                <h3>Global Supply</h3>
                                <p>Seamlessly connect vendors, suppliers, and fulfillment.</p>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon"><Fingerprint size={22} /></div>
                                <h3>Bank-Grade Security</h3>
                                <p>Enterprise-level encryption and role-based access.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="login-form-wrapper">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>Create Account</h2>
                            <p>Register with your role to get started</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    required
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+1 234 567 890"
                                        value={phone}
                                        onChange={(e) => { setPhone(e.target.value); setError(''); }}
                                        required
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div className="input-group role-dropdown-container" ref={dropdownRef} style={{ marginBottom: '24px' }}>
                                <label className="section-label" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>SELECT YOUR ROLE</label>
                                <div
                                    className={`custom-dropdown-header ${isRoleDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                >
                                    <div className="selected-role-display">
                                        {roles.find(r => r.id === role)?.icon && React.createElement(roles.find(r => r.id === role).icon, { size: 18, className: "selected-role-icon" })}
                                        <span>{role}</span>
                                    </div>
                                    <ChevronDown size={18} className="dropdown-arrow" />
                                </div>

                                {isRoleDropdownOpen && (
                                    <div className="custom-dropdown-list">
                                        {roles.map((r) => (
                                            <div
                                                key={r.id}
                                                className={`custom-dropdown-item ${role === r.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    setRole(r.id);
                                                    setIsRoleDropdownOpen(false);
                                                }}
                                            >
                                                <r.icon size={16} className="dropdown-item-icon" />
                                                <span>{r.id}</span>
                                                {role === r.id && <CheckCircle2 size={16} className="dropdown-check" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '12px' }}>
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            <div className="divider">
                                <span>or</span>
                            </div>

                            <button type="button" className="google-btn" onClick={() => handleGoogleSignup()}>
                                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </button>

                            <div className="signup-link-wrapper">
                                Already have an account? <Link to="/login" className="signup-link">Sign in</Link>
                            </div>
                        </form>
                    </div>

                    <div className="login-footer">
                        <a href="#">Terms of Use</a>
                        <span className="footer-dot">•</span>
                        <a href="#">Privacy & Cookies</a>
                        <span className="footer-dot">•</span>
                        <span>&copy; {new Date().getFullYear()} SMTBMS</span>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                :root {
                    --bg-app: #f8fafc;
                    --bg-body: #f1f5f9;
                    --border-subtle: #e2e8f0;
                    --border-strong: #cbd5e1;
                    --text-primary: #0f172a;
                    --text-secondary: #334155;
                    --text-muted: #64748b;
                    --danger: #ef4444;
                    --danger-bg: #fef2f2;
                }

                .login-wrapper {
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                }

                .login-wrapper::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: url('/login_bg_new.png');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    overflow: hidden;
                }

                .login-wrapper::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(8, 16, 40, 0.9) 0%, rgba(8, 16, 40, 0.3) 100%);
                    z-index: 1;
                }

                .login-split {
                    display: flex;
                    width: 100vw;
                    height: 100vh;
                    position: relative;
                    z-index: 2;
                }

                .login-banner {
                    flex: 1.2;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: clamp(20px, 4vh, 40px) 60px;
                    color: #ffffff;
                    overflow: hidden;
                }

                .login-banner::-webkit-scrollbar {
                    display: none;
                }

                .banner-content {
                    position: relative;
                    z-index: 10;
                    max-width: 800px;
                    margin: auto 0;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: clamp(20px, 4vh, 40px);
                }

                .brand-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 56px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 16px;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    perspective: 200px;
                }

                .orbital-core {
                    width: 10px;
                    height: 10px;
                    background: #60A5FA;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #60A5FA, 0 0 20px #3B82F6;
                    animation: pulseCore 2s infinite alternate;
                }

                .orbital-ring {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 1.5px solid transparent;
                    border-top-color: #93C5FD;
                    border-bottom-color: #3B82F6;
                    top: 50%;
                    left: 50%;
                    transform-origin: 50% 50%;
                }

                .ring-1 {
                    animation: spin1 3s linear infinite;
                }
                
                .ring-2 {
                    width: 40px;
                    height: 40px;
                    border-left-color: #60A5FA;
                    border-right-color: #2563EB;
                    border-top-color: transparent;
                    border-bottom-color: transparent;
                    animation: spin2 4s linear infinite;
                }
                
                .ring-3 {
                    width: 48px;
                    height: 48px;
                    border-top-color: #DBEAFE;
                    border-bottom-color: #1D4ED8;
                    animation: spin3 5s linear infinite;
                }

                @keyframes pulseCore {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 20px #93C5FD, 0 0 35px #3B82F6; }
                }

                @keyframes spin1 {
                    0% { transform: translate(-50%, -50%) rotateX(65deg) rotateY(35deg) rotateZ(0deg); }
                    100% { transform: translate(-50%, -50%) rotateX(65deg) rotateY(35deg) rotateZ(360deg); }
                }
                
                @keyframes spin2 {
                    0% { transform: translate(-50%, -50%) rotateX(45deg) rotateY(-45deg) rotateZ(0deg); }
                    100% { transform: translate(-50%, -50%) rotateX(45deg) rotateY(-45deg) rotateZ(-360deg); }
                }
                
                @keyframes spin3 {
                    0% { transform: translate(-50%, -50%) rotateX(-55deg) rotateY(25deg) rotateZ(0deg); }
                    100% { transform: translate(-50%, -50%) rotateX(-55deg) rotateY(25deg) rotateZ(360deg); }
                }

                .brand-text h2 {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    color: #ffffff;
                    line-height: 1.2;
                    letter-spacing: -0.2px;
                }

                .hero-text {
                    margin-bottom: clamp(20px, 5vh, 50px);
                }

                .hero-text h1 {
                    font-size: clamp(48px, 5vw, 72px);
                    font-weight: 800;
                    line-height: 1.25;
                    margin: 0 0 clamp(16px, 2vh, 24px) 0;
                    color: #ffffff;
                    letter-spacing: -1px;
                }

                .hero-text .highlight {
                    color: #3b82f6;
                }

                .hero-text p {
                    font-size: 18px;
                    color: #94a3b8;
                    line-height: 1.6;
                    margin: 0;
                    max-width: 480px;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .feature-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 8px;
                }

                .feature-item h3 {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    margin: 0;
                }

                .feature-item p {
                    font-size: 12px;
                    color: #94a3b8;
                    margin: 0;
                    line-height: 1.5;
                }

                .login-form-wrapper {
                    flex: 1;
                    min-width: 450px;
                    max-width: 600px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 20;
                    padding: clamp(16px, 3vh, 20px);
                    background: transparent;
                    overflow-y: auto;
                }

                .login-form-wrapper::-webkit-scrollbar {
                    display: none;
                }

                .form-card {
                    background: #ffffff;
                    width: 100%;
                    max-width: 400px;
                    min-height: auto;
                    height: auto;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
                    padding: clamp(20px, 3vh, 28px);
                    color: var(--text-primary);
                    position: relative;
                    margin: auto 0;
                    display: flex;
                    flex-direction: column;
                }

                .form-header {
                    text-align: center;
                    margin-bottom: clamp(12px, 2vh, 16px);
                }

                .form-header h2 {
                    font-size: 24px;
                    font-weight: 800;
                    color: #ea580c;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }

                .form-header p {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 0;
                    font-weight: 500;
                }

                /* Custom Dropdown */
                .role-dropdown-container {
                    position: relative;
                    margin-bottom: 14px;
                }

                .custom-dropdown-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    background: var(--bg-body);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .custom-dropdown-header:hover, .custom-dropdown-header.open {
                    background: #ffffff;
                    border-color: #000000;
                }

                .custom-dropdown-header.open {
                    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
                }

                .selected-role-display {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .selected-role-icon {
                    color: #ea580c;
                }

                .dropdown-arrow {
                    color: var(--text-muted);
                    transition: transform 0.2s ease;
                }

                .custom-dropdown-header.open .dropdown-arrow {
                    transform: rotate(180deg);
                }

                .custom-dropdown-list {
                    position: absolute;
                    top: calc(100% + 4px);
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    z-index: 50;
                    overflow: hidden;
                }

                .custom-dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 14px;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    color: var(--text-primary);
                }

                .custom-dropdown-item:hover {
                    background: var(--bg-body);
                }

                .custom-dropdown-item.active {
                    background: rgba(234, 88, 12, 0.05);
                    color: #ea580c;
                    font-weight: 600;
                }

                .dropdown-item-icon {
                    color: var(--text-muted);
                }

                .custom-dropdown-item.active .dropdown-item-icon {
                    color: #ea580c;
                }

                .dropdown-check {
                    margin-left: auto;
                    color: #ea580c;
                }

                /* Error Alert */
                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: var(--danger-bg);
                    border: 1px solid rgba(255,0,0,0.1);
                    color: var(--danger);
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 20px;
                }

                .input-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                /* Inputs */
                .input-group {
                    margin-bottom: 10px;
                }

                .input-group label {
                    display: block;
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 3px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .input-group input, .select-wrapper select {
                    width: 100%;
                    padding: 9px 12px;
                    border: 1px solid var(--border-subtle);
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 400;
                    color: var(--text-primary);
                    background: var(--bg-body);
                    transition: all 0.2s ease;
                    outline: none;
                    box-sizing: border-box;
                }

                .input-group input:focus, .select-wrapper select:focus {
                    background: #ffffff;
                    border-color: #000000;
                    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
                }

                .input-group input::placeholder {
                    color: var(--text-muted);
                    font-weight: 400;
                }

                .select-wrapper select {
                    appearance: none;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 14px top 50%;
                    background-size: 10px auto;
                    padding-right: 32px;
                }

                /* Submit Button */
                .submit-btn {
                    width: 100%;
                    padding: 12px;
                    background: #000000;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    margin-top: 12px;
                }

                .submit-btn:hover {
                    background: #333333;
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    background: #666666;
                }

                /* Social Logins */
                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 24px 0;
                }

                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .divider span {
                    padding: 0 16px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                }

                .google-btn {
                    width: 100%;
                    background: var(--bg-body);
                    border: 1px solid var(--border-subtle);
                    color: var(--text-primary);
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .google-btn:hover {
                    background: #e2e8f0;
                    border-color: var(--border-strong);
                }

                /* Footer link */
                .signup-link-wrapper {
                    text-align: center;
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 500;
                    margin-top: 24px;
                }

                .signup-link {
                    color: #000000;
                    font-weight: 700;
                    text-decoration: none;
                    margin-left: 6px;
                }

                .signup-link:hover {
                    text-decoration: underline;
                }
                
                .login-footer {
                    display: none;
                }

                @media (max-width: 1200px) {
                    .login-banner {
                        padding: 40px;
                    }
                }

                @media (max-width: 1024px) {
                    .login-split {
                        flex-direction: column;
                        height: auto;
                        overflow-y: auto;
                    }
                    .login-banner {
                        padding: 40px;
                    }
                    .hero-text h1 {
                        font-size: 36px;
                    }
                    .login-form-wrapper {
                        min-width: 100%;
                        padding: 20px;
                    }
                    .form-card {
                        max-height: none;
                    }
                }

                @media (max-width: 600px) {
                    .input-row {
                        grid-template-columns: 1fr;
                    }
                }
            /* Fix Chrome Autofill white background in light mode */
            input:-webkit-autofill,
            input:-webkit-autofill:hover, 
            input:-webkit-autofill:focus, 
            input:-webkit-autofill:active {
                -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
                -webkit-text-fill-color: #111827 !important;
            }
            `}</style>
        </div>
    );
};

export default Register;
