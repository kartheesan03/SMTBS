import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', { email, password });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="glass-card auth-card">
                <h2 className="title-gradient">SMTBMS Login</h2>
                <p className="text-muted">Enter your credentials to access the system</p>
                
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            placeholder="name@company.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-btn">Sign In</button>
                </form>
                
                {/* Registration link removed as per requirement */}
            </div>

            <style jsx="true">{`
                .auth-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    padding: 20px;
                    background: linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 40%, #dbeafe 70%, #ede9fe 100%);
                    position: relative;
                }
                .auth-wrapper::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
                    pointer-events: none;
                }
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    text-align: center;
                    padding: 44px 40px;
                    background: #ffffff;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 25px -5px rgba(0, 0, 0, 0.08);
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    position: relative;
                    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 1;
                }
                .auth-card::before,
                .auth-card::after {
                    display: none;
                }
                .auth-card h2 {
                    font-size: 28px;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 700;
                    margin-bottom: 8px;
                    letter-spacing: 0.3px;
                    color: #0f172a;
                    background: none;
                    -webkit-text-fill-color: #0f172a;
                }
                .auth-card p {
                    font-size: 14px;
                    margin-bottom: 10px;
                    letter-spacing: 0.2px;
                    color: #64748b;
                }
                .auth-card form {
                    margin-top: 32px;
                    text-align: left;
                }
                .form-group {
                    margin-bottom: 22px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #334155;
                    text-transform: none;
                    letter-spacing: 0.2px;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 10px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #0f172a;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .form-group input:focus {
                    background: #ffffff;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
                    outline: none;
                }
                .form-group input::placeholder {
                    color: #94a3b8;
                }
                .auth-btn {
                    width: 100%;
                    margin-top: 10px;
                    padding: 13px;
                    font-size: 14px;
                    font-weight: 600;
                    border-radius: 10px;
                    background: #2563eb;
                    color: #ffffff;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
                }
                .auth-btn:hover {
                    background: #1d4ed8;
                    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
                    transform: translateY(-1px);
                }
                .error-msg {
                    background: #fef2f2;
                    color: #dc2626;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-top: 20px;
                    font-size: 13px;
                    border: 1px solid #fecaca;
                    text-align: left;
                    font-family: 'Outfit', sans-serif;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 480px) {
                    .auth-card {
                        padding: 30px 24px;
                        border-radius: 12px;
                    }
                    .auth-card h2 {
                        font-size: 24px;
                    }
                    .auth-wrapper {
                        padding: 15px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
