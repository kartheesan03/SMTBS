import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Shield, Users, Monitor, User, TrendingUp, Eye, EyeOff, Mail, Lock, Zap, Globe, Layers, Box, ArrowRight, RefreshCw } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('Admin');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activePanel, setActivePanel] = useState('badges');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

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
        body.style.backgroundColor = '#0a0118';
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
            const { data } = await API.post('/auth/login', { email, password, role: selectedRole });
            login(data, rememberMe);
            setError('');
            if (data.isProfileComplete === false && (data.role === 'Customer' || data.role === 'Vendor')) {
                navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
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
                setError(err.response?.data?.message || err.message || 'Google Sign-In failed');
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => setError('Google Sign-In failed. Please try again.'),
        prompt: 'select_account login'
    });

    return (
        <div className="fx-login-shell">
            {/* Animated Background Elements */}
            <div className="fx-bg-orbs">
                <div className="fx-orb fx-orb-1" />
                <div className="fx-orb fx-orb-2" />
                <div className="fx-orb fx-orb-3" />
            </div>
            <div className="fx-grid-overlay" />

            {/* ═══ TOP NAVBAR ═══ */}
            <div className="fx-login-nav">
                <div className="fx-nav-left">
                    <Globe size={28} className="fx-nav-icon" />
                    <span>SMTBMS</span>
                </div>
                <div className="fx-nav-center">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active-nav-link' : ''}>Home</NavLink>
                    <NavLink to="/features" className={({ isActive }) => isActive ? 'active-nav-link' : ''}>Features</NavLink>
                    <NavLink to="/pricing" className={({ isActive }) => isActive ? 'active-nav-link' : ''}>Pricing</NavLink>
                    <NavLink to="/faq" className={({ isActive }) => isActive ? 'active-nav-link' : ''}>FAQ</NavLink>
                    <NavLink to="/help" className={({ isActive }) => isActive ? 'active-nav-link' : ''}>Help</NavLink>
                </div>
                <div className="fx-nav-right">
                    <button className="fx-nav-btn outline" onClick={() => navigate('/login')}>Log In</button>
                    <button className="fx-nav-btn gradient" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            </div>

            {/* ═══ CENTERED LOGIN FORM ═══ */}
            <div className="fx-login-centered">
                <div className="fx-form-card">
                    <div className="fx-form-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to your SMTBMS account</p>
                    </div>

                    {error && <div className="fx-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="fx-form">
                        {/* Role Selector */}
                        <div className="fx-field">
                            <label className="fx-label">Role</label>
                            <div className="fx-role-grid">
                                {roles.map((r) => {
                                    const RIcon = r.icon;
                                    const isActive = selectedRole === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            className={`fx-role-btn ${isActive ? 'active' : ''}`}
                                            onClick={() => setSelectedRole(r.id)}
                                        >
                                            <RIcon size={14} />
                                            <span>{r.id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="fx-field">
                            <label className="fx-label">Email address</label>
                            <div className="fx-input-wrap">
                                <Mail size={16} className="fx-input-icon" />
                                <input
                                    id="login-form"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    required
                                    className="fx-input"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="fx-field">
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                <label className="fx-label" style={{marginBottom:0}}>Password</label>
                                <Link to="/forgot-password" className="fx-forgot-link">Forgot?</Link>
                            </div>
                            <div className="fx-input-wrap">
                                <Lock size={16} className="fx-input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    required
                                    className="fx-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="fx-eye-btn"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember */}
                        <div className="fx-remember" onClick={() => setRememberMe(!rememberMe)}>
                            <div className={`fx-checkbox ${rememberMe ? 'checked' : ''}`} />
                            Remember me for 30 days
                        </div>

                        {/* Submit */}
                        <button type="submit" className="fx-submit" disabled={isLoading}>
                            {isLoading ? <span className="fx-spinner" /> : (
                                <>Sign in <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="fx-divider"><span>or continue with</span></div>

                        {/* Social */}
                        <div className="fx-social-row">
                            <button type="button" className="fx-social-btn" onClick={() => handleGoogleLogin()}>
                                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09a6.97 6.97 0 010-4.18V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                            <button type="button" className="fx-social-btn">
                                <svg viewBox="0 0 21 21" width="18" height="18"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
                                Microsoft
                            </button>
                        </div>
                    </form>

                    <p className="fx-signup-link">
                        Don't have an account? <Link to="/register">Create account</Link>
                    </p>
                </div>
            </div>

            <style jsx="true">{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

                /* ═══ SHELL ═══ */
                .fx-login-shell {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    width: 100vw; height: 100vh;
                    font-family: 'Inter', -apple-system, sans-serif;
                    z-index: 9999;
                    overflow-x: hidden;
                    overflow-y: auto;
                    background: #08010f;
                }

                /* ═══ ANIMATED BACKGROUND ═══ */
                .fx-bg-orbs {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    z-index: 0;
                }
                .fx-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    opacity: 0.35;
                }
                .fx-orb-1 {
                    width: 600px; height: 600px;
                    background: radial-gradient(circle, #7c3aed, transparent);
                    top: -15%; left: -10%;
                    animation: fx-float1 14s ease-in-out infinite alternate;
                }
                .fx-orb-2 {
                    width: 450px; height: 450px;
                    background: radial-gradient(circle, #a855f7, transparent);
                    bottom: -20%; left: 35%;
                    animation: fx-float2 18s ease-in-out infinite alternate;
                }
                .fx-orb-3 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, #6d28d9, transparent);
                    top: 15%; right: 0%;
                    animation: fx-float3 12s ease-in-out infinite alternate;
                }
                @keyframes fx-float1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(50px, 30px) scale(1.1); } }
                @keyframes fx-float2 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-30px, -20px) scale(1.08); } }
                @keyframes fx-float3 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(20px, 40px) scale(0.95); } }

                .fx-grid-overlay {
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(139, 92, 246, 0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139, 92, 246, 0.04) 1px, transparent 1px);
                    background-size: 48px 48px;
                    pointer-events: none;
                    z-index: 0;
                }

                /* ═══ NAVBAR ═══ */
                .fx-login-nav {
                    position: relative;
                    flex-shrink: 0;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 56px;
                    z-index: 100;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(8, 1, 15, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .fx-nav-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    color: #fff;
                    font-size: 22px;
                    letter-spacing: 0.5px;
                }
                .fx-nav-icon {
                    color: #a855f7;
                    filter: drop-shadow(0 0 6px rgba(168,85,247,0.6));
                }
                .fx-nav-center {
                    display: flex;
                    gap: 40px;
                }
                .fx-nav-center a {
                    color: rgba(255,255,255,0.5);
                    text-decoration: none;
                    font-size: 16px;
                    font-weight: 500;
                    transition: color 0.2s ease, border-bottom 0.2s ease;
                    letter-spacing: 0.5px;
                    padding-bottom: 4px;
                    border-bottom: 2px solid transparent;
                }
                .fx-nav-center a:hover {
                    color: #fff;
                }
                .fx-nav-center a.active-nav-link {
                    color: #fff;
                    border-bottom-color: #a855f7;
                }
                .fx-nav-right {
                    display: flex;
                    gap: 12px;
                }
                .fx-nav-btn {
                    padding: 12px 28px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .fx-nav-btn.outline {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.2);
                    color: rgba(255,255,255,0.8);
                }
                .fx-nav-btn.outline:hover {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.35);
                    color: #fff;
                }
                .fx-nav-btn.gradient {
                    background: #8b5cf6;
                    border: none;
                    color: #fff;
                }
                .fx-nav-btn.gradient:hover {
                    background: #7c3aed;
                }

                /* ═══ CENTERED LOGIN LAYOUT ═══ */
                .fx-login-centered {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    z-index: 10;
                    padding: 40px;
                }

                /* LEFT COLUMN */
                .fx-hero-left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 64px 0 64px 16px;
                }

                .fx-headline {
                    font-family: 'Outfit', sans-serif;
                    font-size: 56px;
                    font-weight: 800;
                    line-height: 1.08;
                    color: #ffffff;
                    margin: 0 0 24px 0;
                    letter-spacing: -1.5px;
                    white-space: pre-line;
                }

                .fx-tagline {
                    font-size: 17px;
                    line-height: 1.7;
                    color: rgba(255, 255, 255, 0.55);
                    margin: 0 0 40px 0;
                    max-width: 500px;
                    font-weight: 400;
                }

                .fx-cta-group {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .fx-hero-cta {
                    display: inline-flex;
                    align-items: center;
                    background: #8b5cf6;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 14px 28px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: all 0.2s ease;
                    box-shadow: 0 0 0 1px rgba(139,92,246,0.3), 0 4px 16px rgba(139, 92, 246, 0.25);
                }
                .fx-hero-cta:hover {
                    background: #7c3aed;
                    transform: translateY(-1px);
                    box-shadow: 0 0 0 1px rgba(139,92,246,0.5), 0 8px 24px rgba(139, 92, 246, 0.35);
                }

                .fx-secondary-link {
                    display: inline-flex;
                    align-items: center;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                    transition: color 0.2s ease;
                    padding: 0;
                }
                .fx-secondary-link:hover {
                    color: #fff;
                }

                .fx-trusted {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.3);
                    font-weight: 500;
                    letter-spacing: 0.2px;
                }

                /* RIGHT COLUMN */
                .fx-hero-right {
                    flex: 0 0 48%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    padding: 48px 32px;
                }

                .fx-illustration-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    max-width: 600px;
                }

                .fx-illustration-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80%;
                    height: 80%;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
                    filter: blur(60px);
                    z-index: 0;
                    pointer-events: none;
                }

                .fx-illustration-img {
                    max-width: 100%;
                    height: auto;
                    max-height: 72vh;
                    object-fit: contain;
                    position: relative;
                    z-index: 1;
                    filter: drop-shadow(0 16px 48px rgba(139, 92, 246, 0.25));
                    mix-blend-mode: screen;
                }

                /* Glass Badges */
                .fx-glass-badge {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.08);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 14px;
                    padding: 16px 20px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    display: flex;
                    flex-direction: column;
                    z-index: 10;
                    min-width: 180px;
                    animation: fx-badge-float 7s ease-in-out infinite alternate;
                }
                .fx-glass-badge strong {
                    font-size: 28px;
                    font-weight: 700;
                    color: #fff;
                    line-height: 1;
                    font-family: 'Outfit', sans-serif;
                }
                .fx-glass-badge span {
                    font-size: 12px;
                    color: rgba(255,255,255,0.55);
                    margin-top: 4px;
                    font-weight: 500;
                }
                .fx-badge-1 {
                    top: 8%;
                    right: -8%;
                }
                .fx-badge-2 {
                    bottom: 12%;
                    left: -6%;
                    animation-delay: -3.5s;
                }
                @keyframes fx-badge-float { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }

                /* ═══ STATS SECTION ═══ */
                .fx-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-top: 32px;
                    width: 100%;
                    max-width: 520px;
                }
                .fx-stat-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 12px;
                    padding: 20px 28px;
                    flex: 1;
                    max-width: 240px;
                    transition: border-color 0.2s ease;
                }
                .fx-stat-card:hover {
                    border-color: rgba(139, 92, 246, 0.2);
                }
                .fx-stat-icon-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.15);
                    flex-shrink: 0;
                }
                .fx-stat-info strong {
                    display: block;
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                    font-family: 'Outfit', sans-serif;
                    line-height: 1.2;
                }
                .fx-stat-info span {
                    display: block;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 500;
                    margin-top: 2px;
                }

                /* ═══ RIGHT FORM ═══ */
                .fx-form-panel {
                    flex: 0 0 48%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 32px;
                    position: relative;
                    z-index: 2;
                    overflow-y: auto;
                }
                .fx-form-card {
                    width: 100%;
                    max-width: 420px;
                    background: rgba(20, 10, 30, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    padding: 32px 36px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .fx-form-header { margin-bottom: 24px; text-align: center; }
                .fx-form-logo { display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; padding: 12px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; border: 1px solid rgba(139, 92, 246, 0.2); }
                .fx-form-header h2 {
                    font-family: 'Outfit', sans-serif;
                    font-size: 24px; font-weight: 700;
                    color: #f1e8ff;
                    margin: 0 0 6px 0;
                    letter-spacing: -0.5px;
                }
                .fx-form-header p {
                    font-size: 14px;
                    color: rgba(196, 181, 253, 0.45);
                    margin: 0;
                }

                .fx-error {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    color: #fca5a5;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 16px;
                }

                .fx-form { display: flex; flex-direction: column; gap: 14px; }
                .fx-field { display: flex; flex-direction: column; }

                .fx-label {
                    display: block !important;
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: rgba(196, 181, 253, 0.6) !important;
                    margin-bottom: 6px !important;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Role Grid */
                .fx-role-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 8px;
                    padding-bottom: 4px;
                }
                .fx-role-grid::-webkit-scrollbar {
                    display: none;
                }
                .fx-role-btn {
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    padding: 10px 18px;
                    border-radius: 30px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .fx-role-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }
                .fx-role-btn.active {
                    background: rgba(168, 85, 247, 0.15);
                    border-color: #a855f7;
                    color: #fff;
                    box-shadow: 0 0 12px rgba(168, 85, 247, 0.2);
                }

                /* Input */
                .fx-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .fx-input-icon {
                    position: absolute;
                    left: 14px;
                    color: rgba(139, 92, 246, 0.35);
                    z-index: 2;
                    pointer-events: none;
                }
                .fx-input {
                    width: 100% !important;
                    background: transparent !important;
                    border: none !important;
                    border-bottom: 2px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff !important;
                    padding: 12px 12px 12px 40px !important;
                    border-radius: 0 !important;
                    font-size: 15px !important;
                    outline: none !important;
                    transition: all 0.3s !important;
                }
                .fx-input:focus {
                    border-bottom-color: #a855f7 !important;
                    background: rgba(168, 85, 247, 0.03) !important;
                }
                .fx-input::placeholder {
                    color: rgba(255, 255, 255, 0.25);
                }

                /* Fix Chrome autofill bright background */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #1a1025 inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                .fx-eye-btn {
                    position: absolute;
                    right: 12px;
                    background: none !important;
                    border: none !important;
                    padding: 0 !important;
                    color: rgba(139, 92, 246, 0.35);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    z-index: 2;
                    width: auto !important;
                    height: auto !important;
                    min-height: 0 !important;
                    box-shadow: none !important;
                    transition: color 0.2s;
                }
                .fx-eye-btn:hover { color: #a855f7; }

                .fx-forgot-link {
                    font-size: 12px;
                    font-weight: 600;
                    color: #a855f7 !important;
                    text-decoration: none !important;
                }
                .fx-forgot-link:hover { text-decoration: underline !important; }

                /* Remember */
                .fx-remember {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    color: rgba(196, 181, 253, 0.45);
                    font-weight: 500;
                }
                .fx-checkbox {
                    width: 18px; height: 18px;
                    border-radius: 5px;
                    border: 1.5px solid rgba(139, 92, 246, 0.25);
                    background: rgba(139, 92, 246, 0.05);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .fx-checkbox.checked {
                    background: #7c3aed;
                    border-color: #8b5cf6;
                }
                .fx-checkbox.checked::after {
                    content: '✓';
                    font-size: 11px;
                    color: #FFFFFF;
                    font-weight: 700;
                }

                /* Submit */
                .fx-submit {
                    width: 100%;
                    height: 46px;
                    background: #8b5cf6 !important;
                    color: #FFFFFF;
                    border: none !important;
                    border-radius: 10px !important;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
                    margin-top: 4px;
                }
                .fx-submit:hover:not(:disabled) {
                    background: #7c3aed !important;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.35);
                }
                .fx-submit:active:not(:disabled) { transform: translateY(0); }
                .fx-submit:disabled { opacity: 0.5; cursor: not-allowed; }

                .fx-spinner {
                    width: 20px; height: 20px;
                    border: 2.5px solid rgba(255,255,255,0.25);
                    border-top-color: #FFF;
                    border-radius: 50%;
                    animation: fx-spin 0.6s linear infinite;
                }
                @keyframes fx-spin { to { transform: rotate(360deg); } }

                /* Divider */
                .fx-divider {
                    display: flex; align-items: center; gap: 14px;
                }
                .fx-divider::before, .fx-divider::after {
                    content: ''; flex: 1; height: 1px;
                    background: rgba(139, 92, 246, 0.1);
                }
                .fx-divider span {
                    font-size: 11px; font-weight: 600;
                    color: rgba(196, 181, 253, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Social */
                .fx-social-row {
                    display: flex; gap: 10px;
                }
                .fx-social-btn {
                    flex: 1;
                    height: 42px;
                    background: rgba(139, 92, 246, 0.05) !important;
                    border: 1px solid rgba(139, 92, 246, 0.12) !important;
                    border-radius: 10px !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(196, 181, 253, 0.7);
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-height: 0;
                    box-shadow: none !important;
                }
                .fx-social-btn:hover {
                    background: rgba(139, 92, 246, 0.1) !important;
                    border-color: rgba(139, 92, 246, 0.25) !important;
                }

                .fx-signup-link {
                    margin-top: 24px;
                    text-align: center;
                    font-size: 13px;
                    color: rgba(196, 181, 253, 0.35);
                }
                .fx-signup-link a {
                    color: #a855f7 !important;
                    font-weight: 700;
                    text-decoration: none !important;
                }
                .fx-signup-link a:hover { text-decoration: underline !important; }

                /* ═══ RESPONSIVE ═══ */
                @media (max-width: 1280px) {
                    .fx-glass-badge { transform: scale(0.9); }
                    .fx-headline { font-size: 48px; }
                }
                @media (max-width: 1024px) {
                    .fx-login-nav {
                        padding: 0 24px;
                    }
                    .fx-nav-center { display: none; }
                    .fx-hero-section {
                        flex-direction: column;
                        padding: 32px 32px 0 32px;
                        gap: 24px;
                    }
                    .fx-hero-left {
                        flex: none;
                        width: 100%;
                        padding: 24px 0 0 0;
                        text-align: center;
                        align-items: center;
                    }
                    .fx-headline { font-size: 40px; }
                    .fx-tagline { max-width: 520px; }
                    .fx-cta-group { justify-content: center; }
                    .fx-hero-right {
                        flex: none;
                        width: 100%;
                        padding: 16px;
                    }
                    .fx-form-panel {
                        flex: none;
                        width: 100%;
                        padding: 24px;
                    }
                    .fx-stats-section {
                        padding: 24px 32px 32px 32px;
                        flex-wrap: wrap;
                    }
                    .fx-stat-card {
                        flex: 1 1 calc(50% - 12px);
                        max-width: none;
                    }
                    .fx-main-content {
                        overflow-y: auto;
                    }
                    .fx-login-shell {
                        overflow: auto;
                    }
                }
                @media (max-width: 640px) {
                    .fx-headline { font-size: 32px; letter-spacing: -0.5px; }
                    .fx-hero-section { padding: 24px 20px 0 20px; }
                    .fx-tagline { font-size: 15px; }
                    .fx-stats-section { padding: 20px; gap: 12px; }
                    .fx-stat-card {
                        flex: 1 1 100%;
                        padding: 16px 20px;
                    }
                    .fx-cta-group { flex-direction: column; gap: 16px; }
                    .fx-glass-badge { transform: scale(0.75); }
                    .fx-login-nav { padding: 0 16px; }
                }
            `}</style>
        </div>
    );
};

export default Login;
