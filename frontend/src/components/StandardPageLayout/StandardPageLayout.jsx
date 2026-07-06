import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import './StandardPageLayout.css';

const StandardPageLayout = ({ 
    title, 
    subtitle, 
    breadcrumbs = [], 
    onSave, 
    onSaveDraft, 
    onCancel, 
    isEditMode = false,
    children,
    sidebarContent,
    infoCard
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="standard-page-container">
            <div className="standard-page-header-wrapper">
                <div className="standard-page-breadcrumbs">
                    <button className="rd-back-btn" onClick={handleBack} style={{ marginLeft: '-12px', marginRight: '8px' }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <span className="breadcrumb-separator">/</span>
                            <span 
                                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`} 
                                onClick={() => crumb.path && navigate(crumb.path)}
                                style={{ cursor: crumb.path ? 'pointer' : 'default' }}
                            >
                                {crumb.label}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
                <div className="standard-page-header">
                    <div className="header-titles">
                        <h1>{title}</h1>
                        {subtitle && <p className="subtitle">{subtitle}</p>}
                    </div>
                </div>
            </div>

            <div className="standard-page-body">
                <div className="standard-page-main">
                    {infoCard && (
                        <div className="standard-info-card">
                            {infoCard}
                        </div>
                    )}
                    
                    <div className="standard-sections-wrapper">
                        {children}
                    </div>
                </div>
                
                {sidebarContent && (
                    <div className="standard-page-sidebar">
                        {sidebarContent}
                    </div>
                )}
            </div>

            <div className="standard-page-footer">
                <div className="footer-actions-left">
                    <button type="button" className="btn-cancel" onClick={handleBack}>
                        Cancel
                    </button>
                </div>
                <div className="footer-actions-right">
                    {onSaveDraft && (
                        <button type="button" className="btn-draft" onClick={onSaveDraft}>
                            <FileText size={16} /> Save Draft
                        </button>
                    )}
                    {onSave && (
                        <button type="button" className="btn-save" onClick={onSave}>
                            <Save size={16} /> {isEditMode ? 'Update' : 'Save'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StandardPageLayout;
