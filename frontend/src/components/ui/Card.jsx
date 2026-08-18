import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
    <h3 className={`text-lg font-semibold text-slate-800 m-0 ${className}`} {...props}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '', ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center ${className}`} {...props}>
        {children}
    </div>
);
