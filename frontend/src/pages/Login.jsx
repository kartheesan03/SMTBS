import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Shield, Users, Monitor, User, TrendingUp, Eye, EyeOff, Mail, Lock } from 'lucide-react';

// Shared inline style constants — immune to global CSS overrides
const S = {
    input: {
        width: '100%', height: '44px', minHeight: '44px', maxHeight: '44px',
        background: '#FFFFFF', backgroundColor: '#FFFFFF',
        border: '1px solid #D1D5DB', borderRadius: '0px',
        fontSize: '14px', color: '#111827', fontFamily: 'Inter, sans-serif',
        padding: '0 14px 0 42px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
    },
    select: {
        width: '100%', height: '44px', minHeight: '44px', maxHeight: '44px',
        background: '#FFFFFF', backgroundColor: '#FFFFFF',
        border: '1px solid #D1D5DB', borderRadius: '0px',
        fontSize: '14px', color: '#111827', fontFamily: 'Inter, sans-serif',
        padding: '0 36px 0 14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    label: {
        display: 'block', fontSize: '13px', fontWeight: 600,
        color: '#374151', marginBottom: '6px', letterSpacing: '-0.01em',
    }
};

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
        <div className="pro-login-shell">

            {/* ========== LEFT BRAND PANEL ========== */}
            <div className="pro-brand-panel">
                <div className="brand-inner">
                    {/* Logo */}
                    <div className="brand-logo">
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="0" fill="#FFFFFF" fillOpacity="0.15" />
                            <path d="M 20 10.5 L 31 16 L 20 21.5 L 9 16 Z" fill="#fff" />
                            <path d="M 9 19.5 L 20 25 L 31 19.5 L 31 22 L 20 27.5 L 9 22 Z" fill="#fff" opacity="0.6" />
                            <path d="M 9 24 L 20 29.5 L 31 24 L 31 26.5 L 20 32 L 9 26.5 Z" fill="#fff" opacity="0.3" />
                        </svg>
                        <span>SMTBMS</span>
                    </div>

                    {/* Headline */}
                    <div className="brand-headline">
                        <h1 style={{ color: '#F8F9FF' }}>Smart Material Tracking & Business Management</h1>
                        <p>One platform to manage inventory, workforce, and operations with real-time intelligence.</p>
                    </div>

                    {/* Stats Row */}
                    <div className="brand-stats">
                        <div className="stat-item">
                            <span className="stat-val">99.8%</span>
                            <span className="stat-desc">Uptime</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-val">50k+</span>
                            <span className="stat-desc">Items Tracked</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-val">24/7</span>
                            <span className="stat-desc">Monitoring</span>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="brand-quote">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: '12px', opacity: 0.5}}>
                            <path d="M10 11L8 15H11V19H5V15L7 11H10ZM19 11L17 15H20V19H14V15L16 11H19Z" fill="currentColor"/>
                        </svg>
                        <p>"SMTBMS transformed our entire inventory workflow. We went from spreadsheets to full automation in a week."</p>
                        <div className="quote-author">
                            <div className="author-avatar">AK</div>
                            <div>
                                <strong>Arun Kumar</strong>
                                <span>Operations Manager</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="brand-footer">© 2026 SMTBMS. All rights reserved.</div>
            </div>

            {/* ========== RIGHT FORM PANEL ========== */}
            <div className="pro-form-panel">
                <div className="form-inner">

                    <div className="form-top-text">
                        <h2>Welcome back</h2>
                        <p>Enter your credentials to access your account</p>
                    </div>

                    {error && <div className="pro-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="pro-form">
                        {/* Role */}
                        <div className="pro-field">
                            <label style={S.label}>Role</label>
                            <div style={{position:'relative'}}>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    style={S.select}
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>{r.id}</option>
                                    ))}
                                </select>
                                <span style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',color:'#9CA3AF',fontSize:'12px',pointerEvents:'none'}}>▾</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="pro-field">
                            <label style={S.label}>Email address</label>
                            <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                                <Mail size={16} style={{position:'absolute',left:'14px',color:'#9CA3AF',zIndex:2}} />
                                <input
                                    type="email" placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    required
                                    style={S.input}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="pro-field">
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                                <label style={{...S.label, marginBottom: 0}}>Password</label>
                                <Link to="/forgot-password" style={{fontSize:'13px',fontWeight:500,color:'#6366F1',textDecoration:'none'}}>Forgot password?</Link>
                            </div>
                            <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                                <Lock size={16} style={{position:'absolute',left:'14px',color:'#9CA3AF',zIndex:2}} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    required
                                    style={S.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{position:'absolute',right:'12px',background:'none',border:'none',padding:0,color:'#9CA3AF',cursor:'pointer',display:'flex',alignItems:'center',zIndex:2,width:'auto',height:'auto',minHeight:0,boxShadow:'none'}}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember */}
                        <div 
                            onClick={() => setRememberMe(!rememberMe)} 
                            style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',fontSize:'13px',color:'#6B7280',fontWeight:500,marginTop:'2px',marginBottom:0}}
                        >
                            <div className="pro-checkbox" data-checked={rememberMe}></div>
                            Remember me for 30 days
                        </div>

                        {/* Submit */}
                        <button type="submit" className="pro-submit" disabled={isLoading}>
                            {isLoading ? <span className="pro-spinner"></span> : 'Sign in'}
                        </button>

                        {/* Divider */}
                        <div className="pro-divider"><span>or</span></div>

                        {/* Social */}
                        <div style={{display:'flex',gap:'10px'}}>
                            <button type="button" className="pro-social" onClick={() => handleGoogleLogin()}>
                                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09a6.97 6.97 0 010-4.18V7.07H2.18A11 11 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                            <button type="button" className="pro-social">
                                <svg viewBox="0 0 21 21" width="18" height="18"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>
                                Microsoft
                            </button>
                        </div>
                    </form>

                    <p className="pro-signup-link">
                        Don't have an account? <Link to="/register">Create account</Link>
                    </p>
                </div>
            </div>

            <style jsx="true">{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                .pro-login-shell {
                    position: fixed; inset: 0;
                    display: flex;
                    width: 100vw; height: 100vh;
                    font-family: 'Inter', -apple-system, sans-serif;
                    z-index: 9999;
                    overflow: hidden;
                }

                /* ===== LEFT BRAND PANEL ===== */
                .pro-brand-panel {
                    flex: 0 0 46%;
                    background: linear-gradient(135deg, #7c3aed 0%, #4338ca 50%, #1e1b4b 100%);
                    color: #FFFFFF;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 40px 48px;
                    position: relative;
                    overflow: hidden;
                }
                .pro-brand-panel::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.25) 0%, transparent 60%),
                                radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.15) 0%, transparent 50%);
                    pointer-events: none;
                }
                .pro-brand-panel::after {
                    content: '';
                    position: absolute; inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
                    background-size: 20px 20px;
                    pointer-events: none;
                }

                .brand-inner { position: relative; z-index: 2; }

                .brand-logo {
                    display: flex; align-items: center; gap: 12px;
                    font-size: 18px; font-weight: 700;
                    letter-spacing: -0.3px;
                    margin-bottom: 60px;
                }

                .brand-headline h1 {
                    font-size: 32px; font-weight: 800;
                    line-height: 1.15; letter-spacing: -0.5px;
                    margin: 0 0 16px 0;
                    max-width: 400px;
                }
                .brand-headline p {
                    font-size: 15px; line-height: 1.6;
                    color: rgba(255,255,255,0.6);
                    margin: 0 0 48px 0;
                    max-width: 380px;
                }

                .brand-stats {
                    display: flex; align-items: center; gap: 24px;
                    margin-bottom: 48px;
                }
                .stat-item { display: flex; flex-direction: column; gap: 4px; }
                .stat-val { 
                    font-size: 24px; 
                    font-weight: 700; 
                    color: #F8F9FF;
                    border-bottom: 2px solid #818CF8;
                    padding-bottom: 2px;
                    display: inline-block;
                }
                .stat-desc { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

                .brand-quote {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 0px;
                    padding: 24px;
                }
                .brand-quote p {
                    font-size: 14px; line-height: 1.6;
                    color: rgba(255,255,255,0.8);
                    margin: 0 0 16px 0; font-style: italic;
                }
                .quote-author {
                    display: flex; align-items: center; gap: 10px;
                }
                .author-avatar {
                    width: 32px; height: 32px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 2px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 700;
                }
                .quote-author strong { font-size: 13px; font-weight: 600; display: block; }
                .quote-author span { font-size: 12px; color: rgba(255,255,255,0.5); }

                .brand-footer {
                    position: relative; z-index: 2;
                    font-size: 12px; color: rgba(255,255,255,0.3);
                }

                /* ===== RIGHT FORM PANEL ===== */
                .pro-form-panel {
                    flex: 1;
                    background: #FFFFFF;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    overflow-y: auto;
                }
                .form-inner {
                    width: 100%;
                    max-width: 380px;
                }

                .form-top-text { margin-bottom: 28px; }
                .form-top-text h2 {
                    font-size: 24px; font-weight: 700;
                    color: #111827; margin: 0 0 6px 0;
                    letter-spacing: -0.5px;
                }
                .form-top-text p {
                    font-size: 14px; color: #6B7280; margin: 0;
                }

                .pro-error {
                    background: #FEF2F2; border: 1px solid #FECACA;
                    color: #DC2626; padding: 10px 14px;
                    border-radius: 0px; font-size: 13px;
                    font-weight: 500; margin-bottom: 16px;
                }

                .pro-form { display: flex; flex-direction: column; gap: 16px; }
                .pro-field { display: flex; flex-direction: column; }

                /* Checkbox */
                .pro-checkbox {
                    width: 18px; height: 18px;
                    border-radius: 0px;
                    border: 1.5px solid #D1D5DB;
                    background: #FFFFFF;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                    flex-shrink: 0;
                }
                .pro-checkbox[data-checked="true"] {
                    background: #6366F1;
                    border-color: #6366F1;
                }
                .pro-checkbox[data-checked="true"]::after {
                    content: '✓';
                    font-size: 11px;
                    color: #FFFFFF;
                    font-weight: 700;
                }

                /* Submit */
                .pro-submit {
                    width: 100%; height: 44px;
                    background: #4F46E5; color: #FFFFFF;
                    border: none; border-radius: 0px;
                    font-size: 15px; font-weight: 600;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 1px 3px rgba(79,70,229,0.3);
                    margin-top: 4px;
                }
                .pro-submit:hover:not(:disabled) {
                    background: #4338CA;
                    box-shadow: 0 4px 12px rgba(79,70,229,0.35);
                    transform: translateY(-1px);
                }
                .pro-submit:active:not(:disabled) { transform: translateY(0); }
                .pro-submit:disabled { opacity: 0.6; cursor: not-allowed; }

                .pro-spinner {
                    width: 20px; height: 20px;
                    border: 2.5px solid rgba(255,255,255,0.3);
                    border-top-color: #FFF;
                    border-radius: 50%;
                    animation: pro-spin 0.6s linear infinite;
                }
                @keyframes pro-spin { to { transform: rotate(360deg); } }

                /* Divider */
                .pro-divider {
                    display: flex; align-items: center; gap: 14px;
                }
                .pro-divider::before, .pro-divider::after {
                    content: ''; flex: 1; height: 1px; background: #E5E7EB;
                }
                .pro-divider span {
                    font-size: 12px; font-weight: 500; color: #9CA3AF;
                    text-transform: uppercase;
                }

                /* Social */
                .pro-social {
                    flex: 1; height: 44px;
                    background: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    border-radius: 0px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    font-size: 14px; font-weight: 500; color: #374151;
                    font-family: inherit; cursor: pointer;
                    transition: all 0.15s;
                }
                .pro-social:hover {
                    background: #F9FAFB;
                    border-color: #D1D5DB;
                }

                .pro-signup-link {
                    margin-top: 24px; text-align: center;
                    font-size: 14px; color: #6B7280;
                }
                .pro-signup-link a {
                    color: #4F46E5; font-weight: 600;
                    text-decoration: none;
                }
                .pro-signup-link a:hover { text-decoration: underline; }

                /* ===== RESPONSIVE ===== */
                @media (max-width: 900px) {
                    .pro-login-shell { flex-direction: column; overflow-y: auto; }
                    .pro-brand-panel { flex: none; min-height: auto; padding: 32px 24px; }
                    .brand-headline h1 { font-size: 24px; }
                    .brand-headline p { margin-bottom: 24px; }
                    .brand-stats { margin-bottom: 24px; }
                    .brand-logo { margin-bottom: 32px; }
                    .pro-form-panel { flex: none; padding: 32px 24px; }
                }
            `}</style>
        </div>
    );
};

export default Login;
