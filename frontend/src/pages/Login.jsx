import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, Package, Archive, ShoppingCart, Truck, FileText } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleButton from '../components/GoogleButton';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRoleSelection, setShowRoleSelection] = useState(false);
    const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
    const [selectedRole, setSelectedRole] = useState('Customer');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Lock body scroll on login page
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.style.overflow = 'hidden';
        html.style.height = '100%';
        body.style.overflow = 'hidden';
        body.style.height = '100%';
        body.style.minHeight = 'unset';
        return () => {
            html.style.overflow = '';
            html.style.height = '';
            body.style.overflow = '';
            body.style.height = '';
            body.style.minHeight = '';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            setError('');
            if (data.isProfileComplete === false) {
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
                const response = await API.post('/auth/google', {
                    access_token: tokenResponse.access_token
                });
                
                if (response.status === 202 && response.data.requiresRoleSelection) {
                    setPendingGoogleToken(tokenResponse.access_token);
                    setShowRoleSelection(true);
                    return;
                }
                
                const data = response.data;
                login(data);
                
                if (data.isProfileComplete === false) {
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
        prompt: 'select_account'
    });

    const handleRoleSelectionSubmit = async () => {
        if (!pendingGoogleToken) return;
        setIsLoading(true);
        setError('');
        try {
            const { data } = await API.post('/auth/google', {
                access_token: pendingGoogleToken,
                signupRole: selectedRole
            });
            
            setShowRoleSelection(false);
            login(data);
            
            if (data.isProfileComplete === false) {
                navigate(data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg || 'Role selection failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="split-card">
                {/* Left Side: Visual Branding Panel (55%) */}
                <div className="brand-panel">
                    <div className="brand-header">
                        <div className="logo-icon">
                            <Box size={24} color="#ffffff" strokeWidth={2.5} />
                        </div>
                        <span className="logo-text">SMTBMS</span>
                    </div>

                    <div className="brand-content">
                        <h1 className="brand-title">Smart Material Tracking &<br/>Business Management System</h1>
                        <p className="brand-desc">
                            Enterprise ERP, Inventory Management, Material Tracking, HRMS and Delivery Operations.
                        </p>

                        {/* Enterprise-themed icons illustration */}
                        <div className="erp-illustration">
                            <div className="icon-badge">
                                <Archive size={28} color="#6366F1" />
                                <span>Inventory</span>
                            </div>
                            <div className="icon-badge">
                                <Package size={28} color="#10B981" />
                                <span>Materials</span>
                            </div>
                            <div className="icon-badge">
                                <ShoppingCart size={28} color="#F59E0B" />
                                <span>Orders</span>
                            </div>
                            <div className="icon-badge">
                                <Truck size={28} color="#EF4444" />
                                <span>Delivery</span>
                            </div>
                            <div className="icon-badge">
                                <FileText size={28} color="#8B5CF6" />
                                <span>Reports</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form (45%) */}
                <div className="login-panel">
                    <div className="login-form-container">
                        <div className="login-header">
                        <div className="login-logo-mobile">
                            <div className="logo-icon-dark">
                                <Box size={20} color="#ffffff" strokeWidth={2.5} />
                            </div>
                            <span className="logo-text-dark">SMTBMS</span>
                        </div>
                        <h2 className="welcome-title">Welcome Back</h2>
                        <p className="welcome-subtitle">Sign in to access your enterprise dashboard.</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label><Mail size={16} className="label-icon" /> Email Address</label>
                            <input 
                                type="email" 
                                placeholder="name@company.com" 
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label><Lock size={16} className="label-icon" /> Password</label>
                            <div className="password-wrapper">
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

                        <div className="form-actions">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                <span>Remember me</span>
                            </label>
                            <button type="button" className="forgot-password">Forgot Password?</button>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                        
                        {/* Google Sign In wrapped below */}
                        <div className="divider">
                            <span>or continue with</span>
                        </div>
                        
                        <GoogleButton text="Sign in with Google" onClick={() => handleGoogleLogin()} />

                        <div className="signup-link-wrapper">
                            Don't have an account? <Link to="/register" className="signup-link">Sign up</Link>
                        </div>
                    </form>


                    </div>
                </div>
            </div>

            {/* Role Selection Modal */}
            {showRoleSelection && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up">
                        <div className="modal-header">
                            <h2>Complete Your Registration</h2>
                            <p>You're almost there! Please select your account type.</p>
                        </div>
                        <div className="modal-body">
                            <div className="role-options">
                                <div className="role-select-wrapper">
                                    <select 
                                        className="role-select"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="Customer">Customer (Buyer)</option>
                                        <option value="Vendor">Vendor/Supplier</option>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowRoleSelection(false)} disabled={isLoading}>Cancel</button>
                            <button className="btn-primary" onClick={handleRoleSelectionSubmit} disabled={isLoading}>
                                {isLoading ? 'Completing...' : 'Complete Registration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
                .login-wrapper {
                    width: 100vw;
                    height: 100vh;
                    max-height: 100vh;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    overflow: hidden;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                }

                .split-card {
                    display: grid;
                    grid-template-columns: 57% 43%;
                    width: 100%;
                    height: 100vh;
                    max-height: 100vh;
                    background: #FFFFFF;
                    overflow: hidden;
                }

                .brand-panel {
                    height: 100vh;
                    max-height: 100vh;
                    background-color: #080D22;
                    padding: 38px 64px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    color: #FFFFFF;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .brand-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 48px;
                    flex-shrink: 0;
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    background: #6366F1;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .logo-text {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }

                .brand-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    overflow: hidden;
                }

                .brand-title {
                    font-size: clamp(1.6rem, 2.8vw, 2.2rem);
                    font-weight: 800;
                    line-height: 1.2;
                    max-width: 650px;
                    margin: 0 0 14px 0;
                    letter-spacing: -0.5px;
                }

                .brand-desc {
                    font-size: 16px;
                    color: #94A3B8;
                    line-height: 1.55;
                    max-width: 90%;
                    margin-top: 8px;
                    margin-bottom: 0;
                }

                .erp-illustration {
                    display: flex;
                    flex-wrap: nowrap;
                    gap: 16px;
                    margin-top: 40px;
                    flex-shrink: 0;
                }

                .icon-badge {
                    background: #151B32;
                    border: 1px solid #1F2947;
                    border-radius: 12px;
                    padding: 16px 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 104px;
                    height: 104px;
                    box-sizing: border-box;
                    transition: transform 0.3s ease;
                }

                .icon-badge:hover {
                    transform: translateY(-4px);
                    background: #1A2242;
                }

                .icon-badge span {
                    font-size: 12px;
                    font-weight: 600;
                    color: #E2E8F0;
                }

                /* Right Login Panel (43%) */
                .login-panel {
                    height: 100vh;
                    max-height: 100vh;
                    background-color: #FFFFFF;
                    padding: 32px 48px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    box-sizing: border-box;
                }

                .login-form-container {
                    width: 100%;
                    max-width: 470px;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                }

                .login-header {
                    margin-bottom: 24px;
                }

                .login-logo-mobile {
                    display: none;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .logo-icon-dark {
                    width: 32px;
                    height: 32px;
                    background: #6366F1;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .logo-text-dark {
                    font-size: 20px;
                    font-weight: 800;
                    color: #0B1026;
                }

                .welcome-title {
                    font-size: 26px;
                    font-weight: 800;
                    color: #0B1026;
                    margin: 0 0 4px 0;
                }

                .welcome-subtitle {
                    font-size: 14px;
                    color: #64748B;
                    margin: 0;
                }

                .error-alert {
                    width: 100%;
                    box-sizing: border-box;
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    color: #DC2626;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 16px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                }

                .input-group {
                    margin-bottom: 10px;
                }

                .input-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 6px;
                }

                .label-icon {
                    color: #6366F1;
                }

                .input-group input {
                    width: 100%;
                    height: 44px;
                    padding: 0 14px;
                    box-sizing: border-box;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    font-size: 14px;
                    color: #0F172A;
                    transition: all 0.2s ease;
                }

                .input-group input:focus {
                    background: #FFFFFF;
                    border-color: #6366F1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                .input-group input::placeholder {
                    color: #94A3B8;
                }

                .password-wrapper {
                    position: relative;
                }

                .password-toggle {
                    position: absolute;
                    right: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94A3B8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }

                .password-toggle:hover {
                    color: #64748B;
                }

                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 8px 0 14px 0;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                }

                .remember-me input {
                    display: none;
                }

                .checkmark {
                    width: 16px;
                    height: 16px;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.2s;
                }

                .remember-me:hover .checkmark {
                    border-color: #94A3B8;
                }

                .remember-me input:checked + .checkmark {
                    background: #6366F1;
                    border-color: #6366F1;
                }

                .remember-me input:checked + .checkmark::after {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 1px;
                    width: 4px;
                    height: 8px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                }

                .forgot-password {
                    background: none;
                    border: none;
                    padding: 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: #6366F1;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .forgot-password:hover {
                    color: #4F46E5;
                    text-decoration: underline;
                }

                .submit-btn {
                    width: 100%;
                    background: #0B1026;
                    color: #FFFFFF;
                    border: none;
                    height: 46px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 14px;
                    transition: all 0.3s ease;
                }

                .submit-btn:hover:not(:disabled) {
                    background: #1A2242;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(11, 16, 38, 0.15);
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                    margin: 8px 0;
                }

                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #e2e8f0;
                }

                .divider span {
                    padding: 0 10px;
                }

                .signup-link-wrapper {
                    text-align: center;
                    margin-top: 10px;
                    margin-bottom: 0;
                    font-size: 13px;
                    color: #64748B;
                }

                .signup-link {
                    color: #6366F1;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .signup-link:hover {
                    color: #4F46E5;
                    text-decoration: underline;
                }

                /* Responsive */
                @media (max-width: 992px) {
                    .login-wrapper {
                        overflow-y: auto;
                        height: auto;
                        min-height: 100vh;
                    }
                    .split-card {
                        display: flex;
                        flex-direction: column;
                        height: auto;
                    }
                    .brand-panel {
                        height: auto;
                        width: 100%;
                        padding: 32px;
                    }
                    .login-panel {
                        height: auto;
                        width: 100%;
                        padding: 32px;
                    }
                    .login-logo-mobile {
                        display: flex;
                    }
                    .brand-header {
                        display: none;
                    }
                    .login-header {
                        text-align: center;
                    }
                    .login-logo-mobile {
                        justify-content: center;
                    }
                }

                @media (max-width: 480px) {
                    .brand-panel {
                        padding: 24px 20px;
                    }
                    .login-panel {
                        padding: 24px 20px;
                    }
                    .brand-title {
                        font-size: 1.5rem;
                    }
                    .erp-illustration {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(11, 16, 38, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #FFF;
                    width: 90%;
                    max-width: 500px;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .modal-header {
                    padding: 24px 32px;
                    border-bottom: 1px solid #E2E8F0;
                }
                .modal-header h2 { margin: 0 0 8px; font-size: 20px; color: #0F172A; }
                .modal-header p { margin: 0; font-size: 14px; color: #64748B; }
                .modal-body {
                    padding: 32px;
                }
                .role-options {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .role-select-wrapper {
                    position: relative;
                }
                .role-select {
                    width: 100%;
                    height: 48px;
                    padding: 0 16px;
                    border-radius: 12px;
                    border: 2px solid #E2E8F0;
                    background: #F8FAFC;
                    font-size: 15px;
                    font-weight: 500;
                    color: #0F172A;
                    appearance: none;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .role-select:focus, .role-select:hover {
                    border-color: #6366F1;
                    background: #FFFFFF;
                }
                .role-select-wrapper::after {
                    content: '▼';
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 12px;
                    color: #64748B;
                    pointer-events: none;
                }
                .modal-footer {
                    padding: 16px 32px;
                    background: #F8FAFC;
                    border-top: 1px solid #E2E8F0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }
                .btn-secondary {
                    padding: 10px 20px;
                    border: 1px solid #CBD5E1;
                    background: #FFF;
                    color: #475569;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-primary {
                    padding: 10px 20px;
                    background: #6366F1;
                    color: #FFF;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default Login;
