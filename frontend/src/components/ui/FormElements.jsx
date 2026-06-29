import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, UploadCloud, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import './FormElements.css';

export const FormGroup = ({ label, required, error, children }) => (
    <div className="ui-form-group">
        {label && (
            <label className="ui-label">
                {label} {required && <span className="ui-required-asterisk">*</span>}
            </label>
        )}
        {children}
        {error && (
            <div className="ui-error-text">
                <AlertCircle size={12} /> {error}
            </div>
        )}
    </div>
);

export const Input = ({ icon: Icon, error, className = '', ...props }) => (
    <div className="ui-input-wrapper">
        {Icon && <Icon size={18} className="ui-icon-left" />}
        <input 
            className={`ui-input ${Icon ? 'ui-input-icon-left' : ''} ${error ? 'error' : ''} ${className}`}
            {...props}
        />
    </div>
);

export const Select = ({ options = [], error, ...props }) => (
    <select className={`ui-input ${error ? 'error' : ''}`} {...props}>
        <option value="" disabled hidden>Select an option</option>
        {options.map((opt, i) => (
            <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
        ))}
    </select>
);

export const SearchableSelect = ({ options = [], value, onChange, placeholder = 'Search...', error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => {
        const label = String(opt.label || opt).toLowerCase();
        return label.includes(search.toLowerCase());
    });

    const selectedOption = options.find(opt => (opt.value || opt) === value);
    const displayValue = selectedOption ? (selectedOption.label || selectedOption) : placeholder;

    return (
        <div className="ui-select-container" ref={ref}>
            <div 
                className={`ui-select-button ${error ? 'error' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ color: selectedOption ? 'inherit' : '#94a3b8' }}>{displayValue}</span>
                <ChevronDown size={16} color="#64748b" />
            </div>
            
            {isOpen && (
                <div className="ui-select-dropdown">
                    <div className="ui-select-search">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <div className="ui-select-list">
                        {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => {
                            const val = opt.value || opt;
                            const isSelected = val === value;
                            return (
                                <div 
                                    key={i}
                                    className={`ui-select-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        onChange(val);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                >
                                    {opt.label || opt}
                                    {isSelected && <CheckCircle size={14} style={{ float: 'right' }} />}
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '10px 14px', fontSize: '13px', color: '#94a3b8' }}>No results found.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const FileUpload = ({ onFileSelect, accept, maxSize = 5 * 1024 * 1024, error }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file) => {
        if (file.size > maxSize) {
            alert(`File size exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit.`);
            return;
        }
        setSelectedFile(file);
        if (onFileSelect) onFileSelect(file);
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
        if (onFileSelect) onFileSelect(null);
    };

    return (
        <div>
            <div 
                className={`ui-file-upload ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
                style={error ? { borderColor: '#ef4444' } : {}}
            >
                <input 
                    ref={inputRef}
                    type="file" 
                    accept={accept}
                    style={{ display: 'none' }} 
                    onChange={handleChange} 
                />
                <UploadCloud size={32} className="ui-file-upload-icon" />
                <p className="ui-file-upload-text">Click or drag file to this area to upload</p>
                <p className="ui-file-upload-hint">Support for a single or bulk upload. Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB.</p>
            </div>
            
            {selectedFile && (
                <div className="ui-file-preview">
                    <FileText size={24} color="#3b82f6" />
                    <div className="ui-file-preview-info">
                        <div className="ui-file-name">{selectedFile.name}</div>
                        <div className="ui-file-size">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button type="button" className="ui-file-remove" onClick={removeFile}>
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export const FormSection = ({ title, children }) => (
    <div className="ui-form-section">
        {title && <h3 className="ui-form-section-title">{title}</h3>}
        {children}
    </div>
);
