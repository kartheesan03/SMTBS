import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import {
    Shield, Users, Monitor, User, TrendingUp,
    Box, BarChart2, Settings, ShieldCheck, CheckCircle2,
    Layers, Activity, Globe, Fingerprint, Hexagon, ChevronDown, Eye, EyeOff
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Admin');
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

    const roles = [
        { id: 'Admin', icon: Shield },
        { id: 'HR', icon: Users },
        { id: 'Manager', icon: Monitor },
        { id: 'Employee', icon: User },
        { id: 'Sales', icon: TrendingUp }
    ];

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
        setIsLoading(true);
        try {
            // Send the selected role to validate against the backend
            const { data } = await API.post('/auth/login', { email, password, role: selectedRole });
            login(data, rememberMe);
            setError('');
            if (data.isProfileComplete === false && (data.role === 'Customer' || data.role === 'Vendor')) {
                navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            setError('');
            try {
                const { data } = await API.post('/auth/google', {
                    access_token: tokenResponse.access_token,
                    mode: 'login',
                    role: selectedRole
                });

                login(data, rememberMe);

                if (data.isProfileComplete === false && (data.role === 'Customer' || data.role === 'Vendor')) {
                    navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
                } else {
                    navigate('/');
                }
            } catch (err) {
                const msg = err.response?.data?.message || err.message;
                setError(msg || 'Google Sign-In failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('Google Sign-In failed. Please try again.'),
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
                    {/* Clean background elements */}
                </div>

                {/* Right Side: Floating Form Card */}
                <div className="login-form-wrapper">
                    <div className="form-card">
                        <div className="form-header">
                            <h2>Welcome Back!</h2>
                            <p>Sign in with your role credentials</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-group role-dropdown-container" ref={dropdownRef} style={{ marginBottom: '24px' }}>
                                <label className="section-label" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>SELECT YOUR ROLE</label>
                                <div
                                    className={`custom-dropdown-header ${isRoleDropdownOpen ? 'open' : ''}`}
                                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                >
                                    <div className="selected-role-display">
                                        {roles.find(r => r.id === selectedRole)?.icon && React.createElement(roles.find(r => r.id === selectedRole).icon, { size: 18, className: "selected-role-icon" })}
                                        <span>{selectedRole}</span>
                                    </div>
                                    <ChevronDown size={18} className="dropdown-arrow" />
                                </div>

                                {isRoleDropdownOpen && (
                                    <div className="custom-dropdown-list">
                                        {roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className={`custom-dropdown-item ${selectedRole === role.id ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSelectedRole(role.id);
                                                    setIsRoleDropdownOpen(false);
                                                }}
                                            >
                                                <role.icon size={16} className="dropdown-item-icon" />
                                                <span>{role.id}</span>
                                                {selectedRole === role.id && <CheckCircle2 size={16} className="dropdown-check" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="input-group">
                                <label className="section-label">EMAIL ADDRESS</label>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="section-label">PASSWORD</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-actions">
                                <label className="remember-me">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="remember-text">Remember me</span>
                                </label>
                                <a href="#" className="forgot-link">Forgot Password?</a>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading} style={{ marginTop: '12px' }}>
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>

                            <div className="divider">
                                <span>or</span>
                            </div>

                            <button type="button" className="google-btn" onClick={() => handleGoogleLogin()}>
                                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </button>

                            <div className="signup-link-wrapper">
                                Don't have an account? <Link to="/register" className="signup-link">Sign up</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                /* ══════════════════════════════════════
                   SMTBMS Premium Login — Enterprise UI
                   ══════════════════════════════════════ */
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

                :root {
                    --login-primary: #4f46e5;
                    --login-primary-dark: #4338ca;
                    --login-accent: #6366f1;
                    --text-primary: #0f172a;
                    --text-secondary: #334155;
                    --text-muted: #64748b;
                    --border-subtle: #e2e8f0;
                    --border-strong: #cbd5e1;
                    --bg-body: #f8fafc;
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
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background-color: #0a0f1e;
                    overflow: hidden;
                }

                /* Animated background */
                .login-wrapper::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(ellipse 70% 60% at 20% 30%, rgba(79,70,229,0.25) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 50% at 80% 70%, rgba(99,102,241,0.15) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 60% 10%, rgba(139,92,246,0.12) 0%, transparent 60%);
                    z-index: 0;
                    pointer-events: none;
                }

                /* Subtle dot grid */
                .login-wrapper::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
                    background-size: 24px 24px;
                    z-index: 0;
                    pointer-events: none;
                }

                .login-split {
                    display: flex;
                    width: 100vw;
                    height: 100vh;
                    position: relative;
                    z-index: 2;
                }

                /* ── Left Banner Panel ── */
                .login-banner {
                    flex: 1.2;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    padding: clamp(32px, 5vh, 60px) clamp(32px, 5vw, 72px);
                    color: #ffffff;
                    overflow: hidden;
                    justify-content: center;
                }

                .login-banner::-webkit-scrollbar { display: none; }

                .banner-content {
                    position: relative;
                    z-index: 10;
                    max-width: 600px;
                }

                /* Brand row */
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: clamp(32px, 5vh, 56px);
                }

                /* Animated orbital logo */
                .brand-logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 56px;
                    background: rgba(255,255,255,0.06);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 16px;
                    position: relative;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.3);
                    perspective: 200px;
                }

                .orbital-core {
                    width: 10px;
                    height: 10px;
                    background: #818cf8;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #818cf8, 0 0 20px #6366f1;
                    animation: pulseCore 2s infinite alternate;
                }

                .orbital-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1.5px solid transparent;
                    border-top-color: #a5b4fc;
                    border-bottom-color: #6366f1;
                    top: 50%;
                    left: 50%;
                    transform-origin: 50% 50%;
                }

                .ring-1 { width: 32px; height: 32px; animation: spin1 3s linear infinite; }
                .ring-2 { width: 40px; height: 40px; border-left-color: #818cf8; border-right-color: #4f46e5; border-top-color: transparent; border-bottom-color: transparent; animation: spin2 4s linear infinite; }
                .ring-3 { width: 48px; height: 48px; border-top-color: #c7d2fe; border-bottom-color: #3730a3; animation: spin3 5s linear infinite; }

                @keyframes pulseCore {
                    0%   { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 20px #a5b4fc, 0 0 35px #6366f1; }
                }
                @keyframes spin1 {
                    0%   { transform: translate(-50%,-50%) rotateX(65deg) rotateY(35deg) rotateZ(0deg); }
                    100% { transform: translate(-50%,-50%) rotateX(65deg) rotateY(35deg) rotateZ(360deg); }
                }
                @keyframes spin2 {
                    0%   { transform: translate(-50%,-50%) rotateX(45deg) rotateY(-45deg) rotateZ(0deg); }
                    100% { transform: translate(-50%,-50%) rotateX(45deg) rotateY(-45deg) rotateZ(-360deg); }
                }
                @keyframes spin3 {
                    0%   { transform: translate(-50%,-50%) rotateX(-55deg) rotateY(25deg) rotateZ(0deg); }
                    100% { transform: translate(-50%,-50%) rotateX(-55deg) rotateY(25deg) rotateZ(360deg); }
                }

                .brand-text h2 {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0;
                    color: rgba(255,255,255,0.9);
                    line-height: 1.3;
                    letter-spacing: -0.2px;
                }

                /* Hero headline */
                .hero-text { margin-bottom: clamp(28px, 5vh, 52px); }

                .hero-text h1 {
                    font-size: clamp(42px, 4.5vw, 68px);
                    font-weight: 800;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    line-height: 1.15;
                    margin: 0 0 20px 0;
                    color: #ffffff;
                    letter-spacing: -1.5px;
                }

                .hero-text .highlight {
                    background: linear-gradient(135deg, #818cf8, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-text p {
                    font-size: 16px;
                    color: rgba(148,163,184,0.9);
                    line-height: 1.65;
                    margin: 0;
                    max-width: 440px;
                }

                /* Feature cards */
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 14px;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 14px;
                    padding: 16px;
                    backdrop-filter: blur(8px);
                    transition: all 0.25s ease;
                }

                .feature-item:hover {
                    background: rgba(99,102,241,0.1);
                    border-color: rgba(99,102,241,0.3);
                    transform: translateY(-2px);
                }

                .feature-icon {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #818cf8;
                    background: rgba(99,102,241,0.15);
                    border: 1px solid rgba(99,102,241,0.2);
                    border-radius: 10px;
                }

                .feature-item h3 {
                    font-size: 13px;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin: 0;
                }

                .feature-item p {
                    font-size: 11.5px;
                    color: rgba(148,163,184,0.75);
                    margin: 0;
                    line-height: 1.5;
                }

                /* ── Right Form Panel ── */
                .login-form-wrapper {
                    flex: 1;
                    min-width: 400px;
                    max-width: 520px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 20;
                    padding: clamp(32px, 4vh, 56px) clamp(28px, 4vw, 52px);
                    background: #ffffff;
                    border-top-left-radius: 32px;
                    border-bottom-left-radius: 32px;
                    box-shadow: -24px 0 80px rgba(0,0,0,0.35);
                    overflow-y: auto;
                }

                .login-form-wrapper::-webkit-scrollbar { display: none; }

                .form-card {
                    background: transparent;
                    width: 100%;
                    max-width: 380px;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                }

                /* Form header */
                .form-header {
                    text-align: center;
                    margin-bottom: 28px;
                }

                .form-header h2 {
                    font-size: 28px;
                    font-weight: 800;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    color: var(--login-primary);
                    margin: 0 0 8px 0;
                    letter-spacing: -0.5px;
                }

                .form-header p {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 0;
                }

                /* Labels */
                .section-label {
                    display: block;
                    font-size: 10.5px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 7px;
                    letter-spacing: 0.6px;
                    text-transform: uppercase;
                }

                /* Role dropdown */
                .role-dropdown-container {
                    position: relative;
                    margin-bottom: 16px;
                }

                .custom-dropdown-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 11px 14px;
                    border: 1.5px solid var(--border-subtle);
                    border-radius: 12px;
                    background: var(--bg-body);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .custom-dropdown-header:hover,
                .custom-dropdown-header.open {
                    background: #ffffff;
                    border-color: var(--login-primary);
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
                }

                .selected-role-display {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .selected-role-icon { color: var(--login-primary); }

                .dropdown-arrow {
                    color: var(--text-muted);
                    transition: transform 0.2s ease;
                }

                .custom-dropdown-header.open .dropdown-arrow {
                    transform: rotate(180deg);
                }

                .custom-dropdown-list {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    background: #ffffff;
                    border: 1.5px solid var(--border-subtle);
                    border-radius: 12px;
                    box-shadow: 0 12px 24px -6px rgba(0,0,0,0.12);
                    z-index: 50;
                    overflow: hidden;
                }

                .custom-dropdown-item {
                    display: flex;
                    align-items: center;
                    padding: 11px 14px;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    font-size: 13.5px;
                    color: var(--text-primary);
                }

                .custom-dropdown-item:hover { background: #f8fafc; }

                .custom-dropdown-item.active {
                    background: rgba(79,70,229,0.06);
                    color: var(--login-primary);
                    font-weight: 600;
                }

                .dropdown-item-icon { color: var(--text-muted); }
                .custom-dropdown-item.active .dropdown-item-icon { color: var(--login-primary); }
                .dropdown-check { margin-left: auto; color: var(--login-primary); }

                /* Inputs */
                .input-group { margin-bottom: 14px; }

                .input-group label {
                    display: block;
                    font-size: 10.5px;
                    font-weight: 700;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .input-group input {
                    width: 100%;
                    padding: 11px 14px;
                    border: 1.5px solid var(--border-subtle);
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 400;
                    color: var(--text-primary);
                    background: var(--bg-body);
                    transition: all 0.2s ease;
                    outline: none;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }

                .input-group input:hover { border-color: #94a3b8; }

                .input-group input:focus {
                    background: #ffffff;
                    border-color: var(--login-primary);
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
                }

                .input-group input::placeholder {
                    color: var(--text-muted);
                    font-weight: 400;
                }

                .password-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-wrapper input { padding-right: 44px; }

                .toggle-password {
                    position: absolute;
                    right: 14px;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }

                .toggle-password:hover { color: var(--text-primary); }

                /* Form actions row */
                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 14px;
                    margin-bottom: 20px;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    user-select: none;
                }

                .remember-me input { display: none; }

                .checkbox-custom {
                    width: 17px;
                    height: 17px;
                    border: 1.5px solid var(--border-strong);
                    border-radius: 5px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    background: #ffffff;
                }

                .remember-me input:checked ~ .checkbox-custom {
                    background: var(--login-primary);
                    border-color: var(--login-primary);
                }

                .remember-me input:checked ~ .checkbox-custom::after {
                    content: '';
                    width: 3px;
                    height: 7px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                    margin-bottom: 2px;
                }

                .remember-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .forgot-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--login-primary);
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .forgot-link:hover {
                    color: var(--login-primary-dark);
                    text-decoration: underline;
                }

                /* Sign In Button */
                .submit-btn {
                    width: 100%;
                    padding: 13px;
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 14.5px;
                    font-weight: 700;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.25s ease;
                    margin-top: 8px;
                    box-shadow: 0 6px 20px rgba(79,70,229,0.35);
                    letter-spacing: 0.2px;
                }

                .submit-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
                    box-shadow: 0 10px 28px rgba(79,70,229,0.45);
                    transform: translateY(-2px);
                }

                .submit-btn:active:not(:disabled) { transform: translateY(0); }

                .submit-btn:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Divider */
                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 18px 0;
                }

                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid var(--border-subtle);
                }

                .divider span {
                    padding: 0 14px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                /* Google button */
                .google-btn {
                    width: 100%;
                    background: #ffffff;
                    border: 1.5px solid var(--border-subtle);
                    color: var(--text-primary);
                    padding: 11px;
                    border-radius: 12px;
                    font-size: 13.5px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .google-btn:hover {
                    background: #f8fafc;
                    border-color: #94a3b8;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                }

                /* Error alert */
                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fef2f2;
                    border: 1.5px solid #fecaca;
                    color: #dc2626;
                    padding: 11px 14px;
                    border-radius: 12px;
                    font-size: 12.5px;
                    font-weight: 500;
                    margin-bottom: 20px;
                    animation: shakeIn 0.3s ease;
                }

                @keyframes shakeIn {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }

                .auth-form { display: flex; flex-direction: column; }

                /* Footer link */
                .signup-link-wrapper {
                    text-align: center;
                    font-size: 13px;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-subtle);
                }

                .signup-link {
                    color: var(--login-primary);
                    font-weight: 700;
                    text-decoration: none;
                    margin-left: 4px;
                }

                .signup-link:hover { text-decoration: underline; }

                /* Autofill fix */
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 30px #f8fafc inset !important;
                    -webkit-text-fill-color: #0f172a !important;
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .features-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 1024px) {
                    .login-split { flex-direction: column; height: auto; overflow-y: auto; }
                    .login-banner { padding: 40px 32px; }
                    .hero-text h1 { font-size: 36px; }
                    .login-form-wrapper { min-width: 100%; border-radius: 0; box-shadow: none; padding: 32px 24px; }
                }

                @media (max-width: 600px) {
                    .features-grid { grid-template-columns: 1fr 1fr; }
                    .hero-text h1 { font-size: 28px; }
                }
            `}</style>
        </div>
    );
};

export default Login;

