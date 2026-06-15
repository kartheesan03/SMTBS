import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Shield, Box, UserCheck } from 'lucide-react';

const SelectRole = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [role, setRole] = useState('Customer');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const googleData = location.state?.googleData;

    useEffect(() => {
        if (!googleData || !googleData.credential) {
            // If someone directly visits /select-role without googleData, send them to login
            navigate('/login');
        }
    }, [googleData, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Re-trigger the googleAuth route, but this time WITH a signupRole
            const response = await API.post('/auth/google', { 
                credential: googleData.credential,
                signupRole: role 
            });

            login(response.data);

            if (response.data.isProfileComplete === false) {
                navigate(response.data.role === 'Customer' ? '/complete-customer-profile' : '/complete-vendor-profile');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete registration.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!googleData) return null;

    return (
        <div className="login-wrapper">
            <div className="split-card" style={{ maxWidth: '600px', width: '90%', margin: '60px auto', height: 'auto', padding: '40px' }}>
                <div className="login-form-container" style={{ width: '100%', maxWidth: 'none' }}>
                    <div className="login-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <div className="logo-icon" style={{ background: '#6366F1', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box size={24} color="#ffffff" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h2 className="welcome-title">Welcome, {googleData.name}!</h2>
                        <p className="welcome-subtitle">Please select your primary role to complete registration.</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label><Shield size={16} className="label-icon" /> Account Type</label>
                            <div className="select-wrapper">
                                <select 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '14px 16px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '15px' }}
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Vendor">Vendor/Supplier</option>
                                    <option value="Employee">Employee</option>
                                    <option value="Sales">Sales</option>
                                    <option value="HR">HR</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>
                                This role cannot be easily changed later. Please select carefully.
                            </p>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading} style={{ width: '100%', background: '#0B1026', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '16px' }}>
                            {isLoading ? 'Creating Account...' : 'Continue to Dashboard'}
                        </button>
                    </form>
                </div>
            </div>

            <style jsx="true">{`
                .login-wrapper {
                    width: 100vw;
                    min-height: 100vh;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    background-color: #F1F5F9;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                .split-card {
                    background: #FFFFFF;
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                }

                .welcome-title {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0B1026;
                    margin: 0 0 8px 0;
                }

                .welcome-subtitle {
                    font-size: 15px;
                    color: #64748B;
                    margin: 0;
                }

                .error-alert {
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    color: #DC2626;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 24px;
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
            `}</style>
        </div>
    );
};

export default SelectRole;
