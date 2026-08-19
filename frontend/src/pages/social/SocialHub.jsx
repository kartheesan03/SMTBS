import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './SocialHub.css';
import CompanyFeed from './CompanyFeed';

const SocialHub = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="social-hub-container">
            {/* Center Column: Feed */}
            <div className="social-center-col">
                <CompanyFeed />
            </div>

            {/* Right Column: Widgets */}
            <div className="social-right-col">
                <div className="social-widget">
                    <h4>Company News</h4>
                    <div className="suggestion-item">
                        <div className="suggestion-info">
                            <strong>Q3 Goals Exceeded!</strong>
                            <span>Our team hit 110% of target.</span>
                        </div>
                    </div>
                </div>

                <div className="social-widget">
                    <h4>Upcoming Events</h4>
                    <div className="suggestion-item">
                        <div className="suggestion-info">
                            <strong>Product Launch Webinar</strong>
                            <span>Tomorrow, 10:00 AM</span>
                        </div>
                    </div>
                </div>

                <div className="social-widget">
                    <h4>Add to your feed</h4>
                    <div className="suggestion-item">
                        <div className="suggestion-avatar-wrapper">
                            <div className="suggestion-avatar">A</div>
                            <span className="presence-dot online"></span>
                        </div>
                        <div className="suggestion-info">
                            <strong>Alice Smith</strong>
                            <span>Marketing</span>
                        </div>
                        <button className="connect-btn">+ Follow</button>
                    </div>
                    <div className="suggestion-item">
                        <div className="suggestion-avatar-wrapper">
                            <div className="suggestion-avatar">B</div>
                            <span className="presence-dot away"></span>
                        </div>
                        <div className="suggestion-info">
                            <strong>Bob Jones</strong>
                            <span>Sales</span>
                        </div>
                        <button className="connect-btn">+ Follow</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialHub;
