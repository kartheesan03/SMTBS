import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    isLoading = false,
    icon: Icon,
    ...props 
}, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus:ring-indigo-500",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm focus:ring-indigo-500",
        outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        icon: "h-10 w-10"
    };

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} />}
            {!isLoading && Icon && <Icon size={size === 'sm' ? 14 : 18} />}
            {children}
        </button>
    );
});
Button.displayName = 'Button';
