import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Truck, Users, Briefcase, HeartHandshake, ShoppingCart, TrendingUp, Box } from 'lucide-react';

const SelectRole = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const googleData = location.state?.googleData;

    useEffect(() => {
        if (!googleData || !googleData.credential) {
            navigate('/login');
        }
    }, [googleData, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRole) {
            setError('Please select an account type to continue.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const payload = { 
                credential: googleData.credential,
                signupRole: selectedRole 
            };
            
            if (googleData.credential === 'mock_google_token') {
                payload.mockEmail = googleData.email;
                payload.mockName = googleData.name;
            }

            const response = await API.post('/auth/google', payload);

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

    const roles = [
        {
            id: 'Customer',
            title: 'Customer',
            desc: 'Purchase materials, track orders, view invoices.',
            icon: <ShoppingCart size={24} />
        },
        {
            id: 'Vendor',
            title: 'Vendor / Supplier',
            desc: 'Manage supplied materials, deliveries, and stock updates.',
            icon: <Truck size={24} />
        }
    ];

    return (
        <div className="onboarding-wrapper">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <div className="logo-icon">
                        <Box size={28} color="#ffffff" strokeWidth={2.5} />
                    </div>
                    <h2 className="welcome-title">Welcome to SMTBMS</h2>
                    <p className="welcome-subtitle">Select your external account type to continue.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <div className="roles-grid">
                    {roles.map((role) => (
                        <div 
                            key={role.id}
                            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <div className="role-icon-wrapper">
                                {role.icon}
                            </div>
                            <div className="role-content">
                                <h3>{role.title}</h3>
                                <p>{role.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="actions-footer">
                    <Link to="/login" className="back-link">
                        Back to Login
                    </Link>
                    <button 
                        onClick={handleSubmit} 
                        className="continue-btn" 
                        disabled={isLoading || !selectedRole}
                    >
                        {isLoading ? 'Setting up...' : 'Continue'}
                    </button>
                </div>
            </div>

            <style jsx="true">{`
                .onboarding-wrapper {
                    width: 100vw;
                    min-height: 100vh;
                    margin: 0;
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    background-color: #F8FAFC;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    box-sizing: border-box;
                }

                .onboarding-container {
                    background: #FFFFFF;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
                    max-width: 900px;
                    width: 100%;
                    padding: 48px;
                    box-sizing: border-box;
                }

                .onboarding-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .logo-icon {
                    background: #1E3A8A;
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px auto;
                    box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
                }

                .welcome-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 12px 0;
                    letter-spacing: -0.5px;
                }

                .welcome-subtitle {
                    font-size: 16px;
                    color: #64748B;
                    margin: 0;
                    max-width: 500px;
                    margin: 0 auto;
                    line-height: 1.5;
                }

                .error-alert {
                    background: #FEF2F2;
                    border: 1px solid #FECACA;
                    color: #DC2626;
                    padding: 14px 20px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 32px;
                    text-align: center;
                }

                .roles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 20px;
                    margin-bottom: 48px;
                }

                .role-card {
                    background: #FFFFFF;
                    border: 2px solid #E2E8F0;
                    border-radius: 16px;
                    padding: 24px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .role-card:hover {
                    border-color: #CBD5E1;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.04);
                }

                .role-card.selected {
                    border-color: #1E3A8A;
                    background: #F0F5FF;
                    box-shadow: 0 8px 24px rgba(30, 58, 138, 0.1);
                }

                .role-icon-wrapper {
                    background: #F1F5F9;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #475569;
                    transition: all 0.2s ease;
                }

                .role-card.selected .role-icon-wrapper {
                    background: #1E3A8A;
                    color: #FFFFFF;
                }

                .role-content h3 {
                    margin: 0 0 8px 0;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1E293B;
                }

                .role-card.selected .role-content h3 {
                    color: #1E3A8A;
                }

                .role-content p {
                    margin: 0;
                    font-size: 14px;
                    color: #64748B;
                    line-height: 1.5;
                }

                .actions-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-top: 1px solid #E2E8F0;
                    padding-top: 32px;
                }

                .back-link {
                    color: #64748B;
                    font-size: 15px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s;
                }

                .back-link:hover {
                    color: #0F172A;
                }

                .continue-btn {
                    background: #1E3A8A;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 12px;
                    padding: 14px 32px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .continue-btn:hover:not(:disabled) {
                    background: #172554;
                }

                .continue-btn:disabled {
                    background: #94A3B8;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .onboarding-container {
                        padding: 32px 24px;
                    }
                    .roles-grid {
                        grid-template-columns: 1fr;
                    }
                    .actions-footer {
                        flex-direction: column-reverse;
                        gap: 20px;
                    }
                    .continue-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default SelectRole;
