import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', ...props }) => {
    const variants = {
        default: "bg-slate-100 text-slate-800",
        primary: "bg-indigo-100 text-indigo-800",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-amber-100 text-amber-800",
        danger: "bg-rose-100 text-rose-800",
        info: "bg-blue-100 text-blue-800",
    };

    return (
        <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
};
