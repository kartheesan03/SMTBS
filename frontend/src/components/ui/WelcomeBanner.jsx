import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import './WelcomeBanner.css';
export const WelcomeBanner = ({
    user,
    greeting,
    subtitle,
    badges = [],
    rightVisuals,
    actions = []
}) => {
    const getGreeting = () => {
        if (greeting) return greeting;
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 18) return 'Good Afternoon';
        return 'Good Evening';
    };
    const displayGreeting = getGreeting();
    const displaySubtitle = subtitle || `${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Here's your overview`;
    const statCards = [];
    if (rightVisuals) {
        React.Children.forEach(rightVisuals.props?.children || rightVisuals, (child) => {
            if (React.isValidElement(child)) {
                statCards.push(child);
            }
        });
    }
    return (
        <div className="wb-grid">
            {/* ── Card 1: Hero Greeting (spans 2 columns) ── */}
            <div className="wb-hero-card">
                {/* Diagonal Background Layer */}
                <div className="wb-diagonal-bg"></div>
                <div className="wb-hero-content">
                    <div className="wb-text-block">
                        <div className="wb-greeting">
                            {displayGreeting}, {user?.name?.split(' ')[0] || 'User'}
                        </div>
                        <div className="wb-subtitle">{displaySubtitle}</div>
                        {badges.length > 0 && (
                            <div className="wb-badges">
                                {badges.map((badge, idx) => (
                                    <span key={idx} className={`wb-badge ${badge.type === 'status' ? 'badge-status' : 'badge-neutral'}`}>
                                        {badge.type === 'status' && <div className="status-dot-inline"></div>}
                                        {badge.icon && <badge.icon size={14} />}
                                        {badge.text && <span>{badge.text}</span>}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {actions.length > 0 && (
                        <div className="wb-hero-actions">
                            {actions.map((action, idx) => (
                                <button 
                                    key={idx} 
                                    className={`wb-btn ${action.variant || 'primary'} ${idx === 0 ? 'wb-btn-primary-custom' : 'wb-btn-secondary-custom'}`} 
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
            {/* ── Card 2 & 3: Stat Cards ── */}
            {statCards.length > 0 ? (
                statCards.map((card, idx) => (
                    <div className="wb-stat-card" key={idx}>
                        <div className="wb-stat-icon-wrapper">
                            {idx === 0 ? <TrendingUp size={18} /> : <BarChart3 size={18} />}
                        </div>
                        {/* Render the original visual card content */}
                        <div className="wb-stat-inner">
                            {card}
                        </div>
                    </div>
                ))
            ) : rightVisuals ? (
                <div className="wb-stat-card">
                    <div className="wb-stat-inner">{rightVisuals}</div>
                </div>
            ) : null}
        </div>
    );
};
export default WelcomeBanner;
