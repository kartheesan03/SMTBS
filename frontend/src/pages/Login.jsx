import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            console.log('Login successful. Received user role from API:', data.role);
            login(data);
            setError('');
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
            setError(errorMsg);
            console.error('Login error:', err.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await API.post('/auth/google', { credential: credentialResponse.credential });
            
            if (response.status === 202 && response.data.action === 'choose_role') {
                setPendingGoogleToken(credentialResponse.credential);
                setShowRoleSelector(true);
                return; // Wait for user to select a role
            }

            console.log('Google login successful. Role:', response.data.role);
            login(response.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google Login failed');
            console.error('Google login error:', err.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleSelection = async (role) => {
        setIsLoading(true);
        setShowRoleSelector(false);
        try {
            const { data } = await API.post('/auth/google/register', { 
                credential: pendingGoogleToken, 
                role 
            });
            console.log('Google registration successful. Role:', data.role);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google Registration failed');
            console.error('Google registration error:', err.response?.data);
        } finally {
            setIsLoading(false);
            setPendingGoogleToken(null);
        }
    };

    return (
        <div className="login-layout">
            {/* Left Side - Branding & Illustration */}
            <div className="login-brand-panel desktop-only">
                <div className="brand-content">
                    <div className="brand-logo-large">
                        <div className="logo-icon-wrapper">
                            <Box size={32} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <span className="logo-text-large">SMTBMS</span>
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-title">Enterprise Business Management<br/>Made Seamless.</h1>
                        <p className="brand-subtitle">An all-in-one platform for materials, orders, HR, and ERP workflows.</p>
                    </div>
                    
                    <div className="brand-illustration">
                        {/* Abstract Glassmorphic Card Illustration */}
                        <div className="abstract-card abstract-card-1">
                            <div className="mock-skeleton-title"></div>
                            <div className="mock-skeleton-line"></div>
                            <div className="mock-skeleton-line"></div>
                        </div>
                        <div className="abstract-card abstract-card-2">
                            <div className="mock-chart">
                                <div className="bar bar-1"></div>
                                <div className="bar bar-2"></div>
                                <div className="bar bar-3"></div>
                            </div>
                        </div>
                        <div className="abstract-circle abstract-circle-1"></div>
                        <div className="abstract-circle abstract-circle-2"></div>
                    </div>
                </div>
                <div className="brand-footer">
                    <p>© 2026 SMTBMS. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-panel">
                <div className="form-container">
                    <div className="form-header">
                        <div className="mobile-logo mobile-only">
                            <div className="logo-icon-wrapper-small">
                                <Box size={24} color="#ffffff" strokeWidth={2.5} />
                            </div>
                            <span className="logo-text-small">SMTBMS</span>
                        </div>
                        <h2 className="welcome-text">Welcome back to SMTBMS</h2>
                        <p className="welcome-subtitle">Sign in to manage materials, orders, employees, and stock workflows.</p>
                    </div>
                    
                    {error && (
                        <div className="error-alert">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label>Email address</label>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input 
                                    type="email" 
                                    placeholder="name@company.com" 
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    required
                                />
                                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>Forgot password?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : (
                                <>
                                    Sign In <ArrowRight size={18} className="btn-icon" />
                                </>
                            )}
                        </button>
                        
                        <div className="divider">
                            <span>or continue with</span>
                        </div>
                        
                        <div className="google-btn-wrapper">
                            <GoogleLogin 
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                width="360"
                                theme="outline"
                                text="signin_with"
                            />
                        </div>
                    </form>
                    
                    <div className="form-footer">
                        <p>Don't have an account? <Link to="/register">Create one now</Link></p>
                    </div>
                </div>
            </div>

            {/* Role Selection Modal */}
            {showRoleSelector && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Complete Your Registration</h3>
                        <p>Please select your account type to continue.</p>
                        <div className="role-options">
                            <button onClick={() => handleRoleSelection('Customer')} className="role-btn customer-btn">
                                I am a Customer
                            </button>
                            <button onClick={() => handleRoleSelection('Vendor')} className="role-btn vendor-btn">
                                I am a Vendor / Supplier
                            </button>
                        </div>
                        <button className="cancel-btn" onClick={() => { setShowRoleSelector(false); setPendingGoogleToken(null); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #ffffff;
                    padding: 40px;
                    border-radius: 20px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                .modal-content h3 {
                    font-size: 22px;
                    color: #0f172a;
                    margin-bottom: 10px;
                }
                .modal-content p {
                    color: #64748b;
                    margin-bottom: 30px;
                }
                .role-options {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .role-btn {
                    padding: 16px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    background: #ffffff;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .role-btn:hover {
                    border-color: #6366f1;
                    background: #f8fafc;
                    color: #6366f1;
                }
                .cancel-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-weight: 500;
                    cursor: pointer;
                }
                .cancel-btn:hover {
                    color: #64748b;
                    text-decoration: underline;
                }
                
                .login-layout {
                    display: flex;
                    min-height: 100vh;
                    background: #ffffff;
                }

                /* --- Left Panel --- */
                .login-brand-panel {
                    flex: 1.2;
                    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 60px;
                    color: #ffffff;
                }
                
                /* Decorative background gradients */
                .login-brand-panel::before {
                    content: '';
                    position: absolute;
                    top: -20%;
                    left: -10%;
                    width: 70%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(0,0,0,0) 70%);
                    z-index: 0;
                }
                .login-brand-panel::after {
                    content: '';
                    position: absolute;
                    bottom: -20%;
                    right: -10%;
                    width: 70%;
                    height: 70%;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%);
                    z-index: 0;
                }

                .brand-content {
                    position: relative;
                    z-index: 1;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .brand-logo-large {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 80px;
                }

                .logo-icon-wrapper {
                    background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                }

                .logo-text-large {
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .brand-title {
                    font-size: 42px;
                    font-weight: 800;
                    line-height: 1.2;
                    margin: 0 0 20px 0;
                    letter-spacing: -1px;
                }

                .brand-subtitle {
                    font-size: 18px;
                    color: #94a3b8;
                    line-height: 1.5;
                    max-width: 80%;
                }

                /* Abstract Illustration */
                .brand-illustration {
                    position: relative;
                    margin-top: 60px;
                    flex: 1;
                }

                .abstract-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    position: absolute;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                .abstract-card-1 {
                    width: 320px;
                    height: 200px;
                    top: 20px;
                    left: 40px;
                    padding: 24px;
                    z-index: 2;
                    animation: float 6s ease-in-out infinite;
                }

                .abstract-card-2 {
                    width: 240px;
                    height: 220px;
                    top: 120px;
                    left: 280px;
                    padding: 24px;
                    z-index: 1;
                    animation: float 8s ease-in-out infinite alternate;
                }

                .mock-skeleton-title {
                    width: 40%;
                    height: 16px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 4px;
                    margin-bottom: 30px;
                }

                .mock-skeleton-line {
                    width: 100%;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    margin-bottom: 16px;
                }
                .mock-skeleton-line:last-child {
                    width: 80%;
                }

                .mock-chart {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    height: 100%;
                    padding-top: 40px;
                }
                .bar {
                    flex: 1;
                    background: rgba(99, 102, 241, 0.6);
                    border-radius: 4px 4px 0 0;
                }
                .bar-1 { height: 40%; }
                .bar-2 { height: 70%; background: rgba(59, 130, 246, 0.6); }
                .bar-3 { height: 100%; background: rgba(16, 185, 129, 0.6); }

                .abstract-circle {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(40px);
                }
                .abstract-circle-1 {
                    width: 150px;
                    height: 150px;
                    background: #6366f1;
                    top: 10px;
                    left: 200px;
                    opacity: 0.4;
                    z-index: 0;
                }
                .abstract-circle-2 {
                    width: 120px;
                    height: 120px;
                    background: #10b981;
                    top: 200px;
                    left: 60px;
                    opacity: 0.3;
                    z-index: 0;
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                    100% { transform: translateY(0px); }
                }

                .brand-footer {
                    position: relative;
                    z-index: 1;
                    color: #64748b;
                    font-size: 13px;
                }

                /* --- Right Panel --- */
                .login-form-panel {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    background: #ffffff;
                }

                .form-container {
                    width: 100%;
                    max-width: 440px;
                }

                .form-header {
                    margin-bottom: 40px;
                }

                .mobile-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 30px;
                }

                .logo-icon-wrapper-small {
                    background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                }

                .logo-text-small {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .welcome-text {
                    font-size: 32px;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 10px 0;
                    letter-spacing: -0.5px;
                }

                .welcome-subtitle {
                    font-size: 15px;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.5;
                }

                .error-alert {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 14px 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    font-size: 14px;
                    font-weight: 500;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .input-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    color: #94a3b8;
                    pointer-events: none;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 14px 16px 14px 44px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 15px;
                    color: #0f172a;
                    transition: all 0.2s;
                }

                .input-wrapper input:focus {
                    background: #ffffff;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                .input-wrapper input::placeholder {
                    color: #cbd5e1;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
                    background: none;
                    border: none;
                    padding: 0;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .password-toggle:hover {
                    color: #64748b;
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: -8px;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #475569;
                    cursor: pointer;
                    user-select: none;
                }

                .remember-me input {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                    height: 0;
                    width: 0;
                }

                .checkmark {
                    height: 18px;
                    width: 18px;
                    background-color: #f1f5f9;
                    border: 1px solid #cbd5e1;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.2s;
                }

                .remember-me:hover input ~ .checkmark {
                    border-color: #94a3b8;
                }

                .remember-me input:checked ~ .checkmark {
                    background-color: #6366f1;
                    border-color: #6366f1;
                }

                .checkmark:after {
                    content: "";
                    position: absolute;
                    display: none;
                    left: 6px;
                    top: 2px;
                    width: 5px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .remember-me input:checked ~ .checkmark:after {
                    display: block;
                }

                .forgot-password {
                    font-size: 14px;
                    font-weight: 600;
                    color: #6366f1;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .forgot-password:hover {
                    color: #4f46e5;
                }

                .login-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: #ffffff;
                    border: none;
                    padding: 16px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
                    position: relative;
                    overflow: hidden;
                }

                .login-btn::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: all 0.5s;
                }

                .login-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .login-btn:hover::after {
                    left: 100%;
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-icon {
                    transition: transform 0.3s ease;
                }

                .login-btn:hover .btn-icon {
                    transform: translateX(4px);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 13px;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e2e8f0;
                }
                .divider span {
                    padding: 0 10px;
                }

                .google-btn-wrapper {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }

                .form-footer {
                    margin-top: 40px;
                    text-align: center;
                }

                .form-footer p {
                    font-size: 14px;
                    color: #64748b;
                }

                .form-footer a {
                    color: #6366f1;
                    font-weight: 600;
                    text-decoration: none;
                }
                .form-footer a:hover {
                    text-decoration: underline;
                }

                /* --- Responsive Adjustments --- */
                .mobile-only {
                    display: none;
                }
                .desktop-only {
                    display: flex;
                }

                @media (max-width: 1024px) {
                    .login-brand-panel {
                        padding: 40px;
                    }
                    .brand-title {
                        font-size: 32px;
                    }
                    .abstract-card-1 {
                        width: 280px;
                        left: 20px;
                    }
                    .abstract-card-2 {
                        left: 200px;
                    }
                }

                @media (max-width: 768px) {
                    .desktop-only {
                        display: none !important;
                    }
                    .mobile-only {
                        display: flex;
                    }
                    .login-layout {
                        flex-direction: column;
                    }
                    .login-form-panel {
                        padding: 30px 20px;
                        background: #f8fafc;
                        min-height: 100vh;
                        align-items: flex-start;
                        padding-top: 60px;
                    }
                    .form-container {
                        background: #ffffff;
                        padding: 40px 30px;
                        border-radius: 20px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
                        border: 1px solid #e2e8f0;
                    }
                    .welcome-text {
                        font-size: 28px;
                    }
                }

                @media (max-width: 480px) {
                    .form-container {
                        padding: 30px 20px;
                    }
                    .welcome-text {
                        font-size: 24px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
