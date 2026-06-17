import React from 'react';

const GoogleButton = ({ text, onClick }) => {
    return (
        <div className="google-btn-wrapper">
            <button type="button" className="google-auth-btn" onClick={onClick}>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="google-icon" />
                {text}
            </button>
            <style jsx="true">{`
                .google-btn-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    margin: 4px 0;
                }

                .google-auth-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    width: 100%;
                    max-width: 300px;
                    height: 44px;
                    margin: 0 auto;
                    background: #FFFFFF;
                    border: 1px solid #DADCE0;
                    border-radius: 10px;
                    font-family: 'Roboto', 'Inter', sans-serif;
                    font-size: 14px;
                    font-weight: 500;
                    color: #3C4043;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }

                .google-auth-btn:hover {
                    background: #F8F9FA;
                    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15);
                }

                .google-icon {
                    width: 20px;
                    height: 20px;
                }
            `}</style>
        </div>
    );
};

export default GoogleButton;
