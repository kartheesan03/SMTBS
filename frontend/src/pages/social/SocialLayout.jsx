import React from 'react';
import './SocialLayout.css';

const SocialLayout = ({ children }) => {
    return (
        <div className="social-layout">
            <div className="social-main-area">
                <div className="social-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default SocialLayout;
