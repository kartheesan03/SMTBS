import React from 'react';
import './WelcomeBanner.css';

export const WelcomeBanner = ({
    user,
    greeting,
    subtitle,
    badges = [],
    rightVisuals,
    actions = []
}) => {
    // Generate greeting based on time if not provided
    const getGreeting = () => {
        if (greeting) return greeting;
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    const displayGreeting = getGreeting();
    const displaySubtitle = subtitle || `${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Here's your overview`;

    return (
        <div className="wb-container">
            {/* SVG Organic Blob Background */}
            <div className="wb-blob-container">
                <svg className="wb-blob" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                    <path 
                        d="M450.5,274.5Q424,349,343.5,375.5Q263,402,189,363Q115,324,84.5,249Q54,174,105,108.5Q156,43,240.5,33Q325,23,398.5,69Q472,115,474.5,200Z" 
                        fill="currentColor" 
                    />
                </svg>
            </div>

            <div className="wb-content">
                {/* Left Side: Avatar & Greeting */}
                <div className="wb-left">
                    <div className="wb-avatar-wrapper">
                        <img
                            src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0f172a&color=fff`}
                            alt="Profile"
                            className="wb-avatar"
                        />
                        <div className="wb-status-dot"></div>
                    </div>
                    <div className="wb-text-content">
                        <div className="wb-greeting">
                            {displayGreeting}, {user?.name?.split(' ')[0] || 'User'}
                        </div>
                        <div className="wb-subtitle">
                            {displaySubtitle}
                        </div>
                        {badges.length > 0 && (
                            <div className="wb-badges">
                                {badges.map((badge, idx) => (
                                    <span key={idx} className={`wb-badge ${badge.type === 'status' ? 'badge-status' : 'badge-neutral'}`}>
                                        {badge.type === 'status' && <div className="status-dot-inline"></div>}
                                        {badge.icon && <badge.icon size={14} />}
                                        {badge.text && <span> {badge.text}</span>}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Visuals & Actions */}
                <div className="wb-right">
                    {rightVisuals && (
                        <div className="wb-visuals">
                            {rightVisuals}
                        </div>
                    )}
                    
                    {actions.length > 0 && (
                        <div className="wb-actions">
                            {actions.map((action, idx) => (
                                <button 
                                    key={idx} 
                                    className={`wb-btn ${action.variant || 'primary'}`} 
                                    onClick={action.onClick}
                                >
                                    {action.icon && <action.icon size={15} />}
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;
