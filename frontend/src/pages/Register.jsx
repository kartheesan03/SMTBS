import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, ArrowRight, User, Phone, Shield } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('Employee');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/register', { name, email, phone, role, password });
            console.log('Registration successful. Received user role from API:', data.role);
            login(data); // Auto-login after registration
            setError('');
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLoginMock = async () => {
        // TODO: Replace with useGoogleLogin() from @react-oauth/google when Client ID is ready
        setIsLoading(true);
        try {
            const mockGooglePayload = {
                googleToken: 'mock_token_123',
                email: 'googleuser@example.com',
                name: 'Google User'
            };
            
            const { data } = await API.post('/auth/google', mockGooglePayload);
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Google Sign-up failed');
        } finally {
            setIsLoading(false);
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
                        <h1 className="brand-title">Join the Future of<br/>Enterprise Workflows.</h1>
                        <p className="brand-subtitle">Create an account to access powerful tools for materials, orders, HR, and ERP management.</p>
                    </div>
                    
                    <div className="brand-illustration">
                        <div className="abstract-card abstract-card-1" style={{ top: '80px', left: '240px', animation: 'float 7s ease-in-out infinite' }}>
                            <div className="mock-skeleton-title"></div>
                            <div className="mock-skeleton-line"></div>
                            <div className="mock-skeleton-line" style={{ width: '60%' }}></div>
                        </div>
                        <div className="abstract-circle abstract-circle-1" style={{ background: '#8b5cf6', top: '40px', left: '100px' }}></div>
                        <div className="abstract-circle abstract-circle-2" style={{ background: '#ec4899', top: '180px', left: '280px' }}></div>
                    </div>
                </div>
                <div className="brand-footer">
                    <p>© 2026 SMTBMS. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="login-form-panel" style={{ padding: '40px 20px', alignItems: 'flex-start', overflowY: 'auto' }}>
                <div className="form-container" style={{ margin: 'auto' }}>
                    <div className="form-header">
                        <div className="mobile-logo mobile-only">
                            <div className="logo-icon-wrapper-small">
                                <Box size={24} color="#ffffff" strokeWidth={2.5} />
                            </div>
                            <span className="logo-text-small">SMTBMS</span>
                        </div>
                        <h2 className="welcome-text">Create an account</h2>
                        <p className="welcome-subtitle">Get started by filling out the information below.</p>
                    </div>
                    
                    {error && (
                        <div className="error-alert">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="error-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setError(''); }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                                <label>Phone Number</label>
                                <div className="input-wrapper">
                                    <Phone size={18} className="input-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="+1 234 567 890" 
                                        value={phone}
                                        onChange={(e) => { setPhone(e.target.value); setError(''); }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Select Role</label>
                            <div className="input-wrapper">
                                <Shield size={18} className="input-icon" />
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '14px 16px 14px 44px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', color: '#0f172a', appearance: 'none' }}
                                >
                                    <option value="Employee">Employee</option>
                                    <option value="Manager">Manager</option>
                                    <option value="HR">HR Manager</option>
                                    <option value="Sales">Sales Executive</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="••••••••" 
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading} style={{ marginTop: '8px' }}>
                            {isLoading ? 'Creating Account...' : (
                                <>
                                    Create Account <ArrowRight size={18} className="btn-icon" />
                                </>
                            )}
                        </button>
                        
                        <div className="divider">
                            <span>or sign up with</span>
                        </div>
                        
                        <button type="button" className="google-btn" onClick={handleGoogleLoginMock} disabled={isLoading}>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>
                    </form>
                    
                    <div className="form-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
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
                    background: radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, rgba(0,0,0,0) 70%);
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
                    height: 180px;
                    padding: 24px;
                    z-index: 2;
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

                .abstract-circle {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(40px);
                    width: 150px;
                    height: 150px;
                    opacity: 0.4;
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
                    background: #ffffff;
                }

                .form-container {
                    width: 100%;
                    max-width: 480px;
                }

                .form-header {
                    margin-bottom: 30px;
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
                    gap: 20px;
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

                .input-wrapper input:focus, .input-wrapper select:focus {
                    background: #ffffff !important;
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1) !important;
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

                .google-btn {
                    background: #ffffff;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .google-btn:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.04);
                }

                .form-footer {
                    margin-top: 30px;
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
                        padding: 30px 20px !important;
                        background: #f8fafc;
                        min-height: 100vh;
                        align-items: flex-start !important;
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
                    .input-group {
                        grid-column: span 2;
                    }
                    .login-form > div {
                        grid-template-columns: 1fr !important;
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

export default Register;
