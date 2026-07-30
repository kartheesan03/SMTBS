import React from 'react';

const TableCellEmail = ({ email, className = '' }) => {
    return (
        <td 
            className={className}
            data-label="Email"
            style={{ 
                height: '50px',
                padding: '0 16px',
                lineHeight: '1.5',
                fontSize: '14px',
                fontWeight: '400',
                verticalAlign: 'middle',
                color: '#64748b'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: '100%',
                margin: 0,
                padding: 0
            }}>
                {email || '—'}
            </div>
        </td>
    );
};

export default TableCellEmail;
