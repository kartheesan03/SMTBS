import React from 'react';
import { MapPin } from 'lucide-react';

const LocationTag = ({ label, className = '', showIcon = false, style = {} }) => {
    if (!label) return null;
    return (
        <span className={`location-tag-pill ${className}`} style={style}>
            {showIcon && <MapPin size={12} />}
            {label}
        </span>
    );
};

export default LocationTag;
