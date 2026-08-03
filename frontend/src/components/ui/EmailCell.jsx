import React from 'react';
const EmailCell = ({ email, className = '' }) => {
    return (
        <div 
            className={`email-cell-wrapper ${className}`}
            style={{ 
                height: '100%',
                minHeight: '24px',
                padding: '4px 0',
                lineHeight: '1.5',
                fontSize: '14px',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                color: '#64748b',
                width: '100%'
            }}
        >
            {email || '—'}
        </div>
    );
};
export default EmailCell;
