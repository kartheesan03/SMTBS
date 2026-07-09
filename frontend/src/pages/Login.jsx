import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Shield, Users, Monitor, User, TrendingUp, Eye, EyeOff, Mail, Lock, Activity, Map, Box, CheckCircle } from 'lucide-react';
import SmtbmsLogo from '../components/SmtbmsLogo';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('Admin');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        body.style.backgroundColor = '#FFFFFF';
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
        <div className="auth-split-layout">
            
            {/* LEFT PANEL - Brand & Floating Dashboard Cards */}
            <div className="auth-brand-panel">
                {/* Logo */}
                <div className="brand-header">
                    <div className="logo-icon-wrap">
                        <SmtbmsLogo size={24} showText={false} />
                    </div>
                    <span className="brand-text">SMTBMS</span>
                </div>

                {/* Content */}
                <div className="brand-content">
                    <h1 className="brand-headline">Every material,<br/>tracked in real time.</h1>
                    <p className="brand-subheadline">
                        Command your operations with precision. Live GPS, automated inventory, and unified workforce management.
                    </p>

                    {/* Features Grid */}
                    <div className="features-compact-grid">
                        <div className="feature-item">
                            <Map size={16} className="feature-icon" />
                            <span>Live GPS Tracking</span>
                        </div>
                        <div className="feature-item">
                            <Box size={16} className="feature-icon" />
                            <span>Smart Replenishment</span>
                        </div>
                        <div className="feature-item">
                            <Activity size={16} className="feature-icon" />
                            <span>Real-time Analytics</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={16} className="feature-icon" />
                            <span>Unified HR & Payroll</span>
                        </div>
                    </div>
                </div>

                {/* Floating Angled Dashboard Cards */}
                <div className="floating-cards-container">
                    
                    {/* Data Table Card (Back) */}
                    <div className="float-card card-table">
                        <div className="fc-header">Recent Movements</div>
                        <div className="fc-row"><div className="fc-dot blue"></div><div className="fc-line long"></div></div>
                        <div className="fc-row"><div className="fc-dot green"></div><div className="fc-line short"></div></div>
                        <div className="fc-row"><div className="fc-dot purple"></div><div className="fc-line med"></div></div>
                    </div>

                    {/* KPI Card (Middle) */}
                    <div className="float-card card-kpi">
                        <div className="fc-kpi-val">99.8%</div>
                        <div className="fc-kpi-label">Fulfillment Rate</div>
                        <svg className="fc-sparkline" viewBox="0 0 100 30" fill="none">
                            <path d="M0 25 Q 20 5 40 20 T 80 10 T 100 15" stroke="url(#sparkGradient)" strokeWidth="3" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#4F46E5" />
                                    <stop offset="100%" stopColor="#818CF8" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* GPS Map Card (Front) */}
                    <div className="float-card card-map">
                        <div className="fc-map-bg"></div>
                        <div className="fc-pin" style={{top: '30%', left: '40%'}}></div>
                        <div className="fc-pin" style={{top: '60%', left: '70%'}}></div>
                        <svg className="fc-route" viewBox="0 0 100 100" fill="none">
                            <path d="M40 30 Q 60 40 70 60" stroke="#5B47C2" strokeWidth="2" strokeDasharray="4 4" />
                        </svg>
                        <div className="fc-map-badge">Active Route</div>
                    </div>

                </div>
            </div>

            {/* RIGHT PANEL - Form */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    
                    <div className="form-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        
                        {/* Role Selector Pills */}
                        <div className="form-group">
                            <label className="input-label">Select Role</label>
                            <div className="role-pills-container">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        className={`role-pill ${selectedRole === r.id ? 'active' : ''}`}
                                        onClick={() => setSelectedRole(r.id)}
                                    >
                                        <r.icon size={14} />
                                        <span>{r.id}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="form-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-with-icon">
                                <Mail size={16} className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group">
                            <div className="label-row">
                                <label className="input-label">Password</label>
                                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
                            </div>
                            <div className="input-with-icon">
                                <Lock size={16} className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    required
                                />
                                <button type="button" className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me Toggle */}
                        <div className="toggle-row" onClick={() => setRememberMe(!rememberMe)}>
                            <div className={`custom-toggle ${rememberMe ? 'active' : ''}`}>
                                <div className="toggle-thumb"></div>
                            </div>
                            <span className="toggle-label">Remember me for 30 days</span>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>

                        {/* Divider */}
                        <div className="social-divider">
                            <span>OR CONTINUE WITH</span>
                        </div>

                        {/* Social Buttons */}
                        <div className="social-buttons">
                            <button type="button" className="btn-social" onClick={() => handleGoogleLogin()}>
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                            </button>
                            <button type="button" className="btn-social">
                                <svg viewBox="0 0 21 21" width="16" height="16">
                                    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                                    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
                                </svg>
                                Microsoft
                            </button>
                        </div>

                    </form>

                    <div className="form-footer">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </div>

                </div>
            </div>

            <style jsx="true">{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                .auth-split-layout {
                    display: flex;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 9999;
                    background: #FFFFFF;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }

                /* ================= LEFT PANEL ================= */
                .auth-brand-panel {
                    flex: 1;
                    background: linear-gradient(135deg, #1C113A 0%, #311E66 50%, #4B35A6 100%);
                    display: flex;
                    flex-direction: column;
                    padding: 48px;
                    position: relative;
                    overflow: hidden;
                    color: white;
                }

                .brand-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10;
                }
                .logo-icon-wrap {
                    width: 40px; height: 40px;
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 10px;
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex; align-items: center; justify-content: center;
                }
                .brand-text {
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .brand-content {
                    margin-top: 80px;
                    margin-bottom: auto;
                    max-width: 480px;
                    z-index: 10;
                    position: relative;
                }                    z-index: 10;
                    position: relative;
                }

                .brand-headline {
                    font-size: 48px;
                    font-weight: 700;
                    line-height: 1.1;
                    margin: 0 0 16px 0;
                    letter-spacing: -1.5px;
                }

                .brand-subheadline {
                    font-size: 16px;
                    line-height: 1.5;
                    color: rgba(255,255,255,0.7);
                    margin: 0 0 40px 0;
                }

                .features-compact-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    color: rgba(255,255,255,0.9);
                    font-weight: 500;
                }
                .feature-icon {
                    color: #8B77E3;
                }

                /* Floating Cards Composition */
                .floating-cards-container {
                    position: absolute;
                    bottom: -20px;
                    right: -20px; /* Anchored to bottom right */
                    transform: scale(0.75);
                    transform-origin: bottom right;
                    width: 440px;
                    height: 480px;
                    z-index: 5;
                    pointer-events: none;
                }

                .float-card {
                    position: absolute;
                    background: rgba(255, 255, 255, 0.98);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.4);
                }

                /* Data Table Card (Back) */
                .card-table {
                    width: 320px; height: 180px;
                    top: 30px; right: 40px;
                    transform: rotate(-6deg);
                    padding: 24px;
                    display: flex; flex-direction: column; gap: 14px;
                    z-index: 1;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .fc-header { font-size: 12px; font-weight: 600; color: #4B5563; margin-bottom: 4px; }
                .fc-row { display: flex; align-items: center; gap: 12px; }
                .fc-dot { width: 8px; height: 8px; border-radius: 50%; }
                .fc-dot.blue { background: #3B82F6; }
                .fc-dot.green { background: #10B981; }
                .fc-dot.purple { background: #8B5CF6; }
                .fc-line { height: 8px; background: #E5E7EB; border-radius: 4px; }
                .fc-line.long { width: 80%; }
                .fc-line.med { width: 60%; }
                .fc-line.short { width: 40%; }

                /* KPI Card (Middle) */
                .card-kpi {
                    width: 200px; height: 150px;
                    top: 170px; left: 0px;
                    transform: rotate(5deg);
                    padding: 24px;
                    z-index: 2;
                    box-shadow: 0 24px 48px rgba(0,0,0,0.3);
                }
                .fc-kpi-val { font-size: 32px; font-weight: 700; color: #111827; line-height: 1; }
                .fc-kpi-label { font-size: 12px; color: #6B7280; margin-top: 4px; margin-bottom: 16px; }
                .fc-sparkline { width: 100%; height: 30px; }

                /* Map Card (Front) */
                .card-map {
                    width: 260px; height: 220px;
                    top: 230px; right: 10px;
                    transform: rotate(-3deg);
                    padding: 8px;
                    z-index: 3;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                }
                .fc-map-bg {
                    width: 100%; height: 100%;
                    border-radius: 12px;
                    background-image: radial-gradient(#E5E7EB 1px, transparent 1px);
                    background-size: 20px 20px;
                    background-color: #F9FAFB;
                    position: relative;
                    overflow: hidden;
                }
                .fc-pin {
                    position: absolute; width: 12px; height: 12px;
                    background: #5B47C2; border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .fc-route { position: absolute; inset: 0; width: 100%; height: 100%; }
                .fc-map-badge {
                    position: absolute; bottom: 20px; left: 20px;
                    background: white; padding: 6px 12px; border-radius: 20px;
                    font-size: 11px; font-weight: 600; color: #374151;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }


                .auth-form-panel {
                    flex: 1;
                    background: #FFFFFF;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    overflow-y: auto;
                }

                .auth-form-container {
                    width: 100%;
                    max-width: 440px;
                    padding: 40px;
                    margin: auto 0;
                }

                .form-header { margin-bottom: 32px; }
                .form-header h2 { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 8px 0; letter-spacing: -0.5px; }
                .form-header p { font-size: 15px; color: #6B7280; margin: 0; }

                .error-alert {
                    background: #FEF2F2; color: #DC2626; padding: 12px 16px;
                    border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 24px;
                    border: 1px solid #FECACA;
                }

                .login-form { display: flex; flex-direction: column; gap: 20px; }
                .form-group { display: flex; flex-direction: column; }
                .input-label { font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px; }
                .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .label-row .input-label { margin-bottom: 0; }
                .forgot-link { font-size: 12px; font-weight: 500; color: #5B47C2; text-decoration: none; }
                .forgot-link:hover { text-decoration: underline; }

                /* Role Pills */
                .role-pills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .role-pill {
                    display: flex; align-items: center; gap: 6px;
                    padding: 8px 14px;
                    border-radius: 20px;
                    border: 1px solid #E5E7EB;
                    background: #FFFFFF;
                    color: #4B5563;
                    font-size: 13px; font-weight: 500; font-family: inherit;
                    cursor: pointer; transition: all 0.2s;
                }
                .role-pill:hover { border-color: #D1D5DB; background: #F9FAFB; }
                .role-pill.active {
                    background: #5B47C2;
                    border-color: #5B47C2;
                    color: #FFFFFF;
                    box-shadow: 0 2px 8px rgba(91,71,194,0.3);
                }

                /* Inputs with Icon */
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 14px; color: #9CA3AF; z-index: 2; }
                .input-with-icon input {
                    width: 100%; height: 44px;
                    border: 1px solid #D1D5DB; border-radius: 10px;
                    padding: 0 14px 0 40px; /* Space for icon */
                    font-size: 14px; color: #111827; font-family: inherit;
                    transition: all 0.2s; outline: none; background: #FFFFFF;
                }
                .input-with-icon input:focus { border-color: #5B47C2; box-shadow: 0 0 0 3px rgba(91,71,194,0.1); }
                .input-with-icon input:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0 30px white inset !important;
                    -webkit-text-fill-color: #111827 !important;
                }
                
                .eye-toggle {
                    position: absolute; right: 14px;
                    background: none; border: none; padding: 0;
                    color: #9CA3AF; cursor: pointer; display: flex; align-items: center; z-index: 2;
                }
                .eye-toggle:hover { color: #5B47C2; }

                /* Custom Toggle */
                .toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 4px; }
                .custom-toggle {
                    width: 36px; height: 20px;
                    background: #E5E7EB; border-radius: 20px;
                    position: relative; transition: background 0.2s;
                }
                .custom-toggle.active { background: #5B47C2; }
                .toggle-thumb {
                    position: absolute; top: 2px; left: 2px;
                    width: 16px; height: 16px;
                    background: #FFFFFF; border-radius: 50%;
                    transition: transform 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
                .custom-toggle.active .toggle-thumb { transform: translateX(16px); }
                .toggle-label { font-size: 13px; color: #4B5563; font-weight: 500; }

                /* Buttons */
                .btn-primary {
                    height: 44px; background: #5B47C2; color: #FFF;
                    border: none; border-radius: 10px;
                    font-size: 14.5px; font-weight: 600; font-family: inherit;
                    cursor: pointer; transition: background 0.2s;
                    margin-top: 8px;
                }
                .btn-primary:hover:not(:disabled) { background: #4B38B2; }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                /* Social */
                .social-divider {
                    display: flex; align-items: center; gap: 12px; margin: 8px 0;
                }
                .social-divider::before, .social-divider::after {
                    content: ''; flex: 1; height: 1px; background: #E5E7EB;
                }
                .social-divider span { font-size: 11px; font-weight: 600; color: #9CA3AF; letter-spacing: 0.5px;}

                .social-buttons { display: flex; gap: 12px; }
                .btn-social {
                    flex: 1; height: 44px;
                    background: #FFF; border: 1px solid #D1D5DB; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    font-size: 14px; font-weight: 500; color: #374151; font-family: inherit;
                    cursor: pointer; transition: all 0.2s;
                }
                .btn-social:hover { background: #F9FAFB; border-color: #9CA3AF; }

                .form-footer { margin-top: 32px; text-align: center; font-size: 14px; color: #6B7280; }
                .form-footer a { color: #5B47C2; font-weight: 600; text-decoration: none; }
                .form-footer a:hover { text-decoration: underline; }

                @media (max-width: 900px) {
                    .auth-brand-panel { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Login;
