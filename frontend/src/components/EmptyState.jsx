import React from 'react';
import { FileQuestion } from 'lucide-react';

const EmptyState = ({ 
    icon: Icon = FileQuestion, 
    title = 'No Data Found', 
    description = 'There is currently no data available to display here.',
    action 
}) => {
    return (
        <div className="empty-state animate-slide-up">
            <Icon className="empty-state-icon" />
            <h3 className="empty-state-title">{title}</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', maxWidth: '400px' }}>{description}</p>
            {action && (
                <div className="empty-state-action">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
