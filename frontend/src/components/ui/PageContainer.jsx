import React from 'react';

export const PageContainer = ({ children, className = '', style = {} }) => (
    <div className={`rd-page ${className}`} style={style}>
        {children}
    </div>
);

export default PageContainer;
