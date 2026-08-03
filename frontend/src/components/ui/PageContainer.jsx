import React from 'react';

export const PageContainer = ({ children, className = '', style = {} }) => (
    <div className={`rd-container ${className}`} style={style}>
        <div className="rd-content">
            {children}
        </div>
    </div>
);

export default PageContainer;
