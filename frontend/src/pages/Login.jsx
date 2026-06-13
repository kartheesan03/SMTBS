import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Box, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            setError('');
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container-centered">
            <div className="login-card">
                <div className="card-header">
                    <div className="logo-wrapper">
                        <Box size={28} color="#ffffff" strokeWidth={2.5} />
                    </div>
                    <h1 className="brand-title">Smart Material Tracking &<br/>Business Management System</h1>
                    <p className="brand-subtitle">Inventory • ERP • HRMS • Delivery Tracking</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label><Mail size={16} className="label-icon" /> Email Address</label>
                        <div className="input-wrapper">
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
                        <label><Lock size={16} className="label-icon" /> Password</label>
                        <div className="input-wrapper">
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
                        {isLoading ? 'Signing In...' : (
                            <>
                                Sign In <ArrowRight size={18} className="btn-icon" />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 SMTBMS Enterprise Suite</p>
                </div>
            </div>

            <style jsx="true">{`
                .login-container-centered {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #F8FAFC;
                    background-image: radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 40%),
                                      radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.08), transparent 40%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    padding: 20px;
                }

                .login-card {
                    background: #FFFFFF;
                    width: 100%;
                    max-width: 480px;
                    border-radius: 24px;
                    padding: 48px;
                    box-shadow: 0 20px 50px rgba(11, 16, 38, 0.08);
                    border: 1px solid rgba(0, 0, 0, 0.04);
                }

                .card-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 40px;
                }

                .logo-wrapper {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #6366F1 0%, #3B82F6 100%);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
                    margin-bottom: 24px;
                }

                .brand-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #0B1026;
                    line-height: 1.35;
                    margin: 0 0 12px 0;
                    letter-spacing: -0.5px;
                }

                .brand-subtitle {
                    font-size: 14px;
                    color: #64748B;
                    font-weight: 600;
                    margin: 0;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .error-alert {
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    color: #DC2626;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 24px;
                    text-align: center;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
                }

                .label-icon {
                    color: #6366F1;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-wrapper input {
                    width: 100%;
                    padding: 14px 16px;
                    background: #F8FAFC;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    font-size: 15px;
                    color: #0F172A;
                    transition: all 0.2s ease;
                }

                .input-wrapper input:focus {
                    background: #FFFFFF;
                    border-color: #6366F1;
                    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    outline: none;
                }

                .input-wrapper input::placeholder {
                    color: #CBD5E1;
                }

                .password-toggle {
                    position: absolute;
                    right: 16px;
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
                    margin-top: -4px;
                }

                .remember-me {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                    cursor: pointer;
                }

                .remember-me input {
                    display: none;
                }

                .checkmark {
                    width: 18px;
                    height: 18px;
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
                    left: 5px;
                    top: 2px;
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
                    font-size: 14px;
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
                    background: #0B1026;
                    color: #FFFFFF;
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
                    margin-top: 12px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(11, 16, 38, 0.2);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(11, 16, 38, 0.3);
                    background: #1A2242;
                }

                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-icon {
                    transition: transform 0.3s ease;
                }

                .submit-btn:hover .btn-icon {
                    transform: translateX(4px);
                }

                .login-footer {
                    text-align: center;
                    margin-top: 40px;
                }

                .login-footer p {
                    font-size: 13px;
                    color: #94A3B8;
                    font-weight: 500;
                    margin: 0;
                }

                @media (max-width: 600px) {
                    .login-card {
                        padding: 32px 24px;
                        border-radius: 20px;
                    }
                    .brand-title {
                        font-size: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
