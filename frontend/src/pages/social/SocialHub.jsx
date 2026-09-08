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

        </div>
    );
};

export default SocialHub;
