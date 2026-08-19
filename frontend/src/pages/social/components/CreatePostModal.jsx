import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { createPost } from '../../../api/posts';
import { X, Image as ImageIcon, Video, FileText, BarChart2, Calendar, UploadCloud } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() && !previewUrl) return;

        setIsSubmitting(true);
        try {
            const newPost = await createPost(text, previewUrl || null);
            console.log('POST /api/feed response:', newPost);
            setText('');
            setPreviewUrl('');
            setShowImageInput(false);
            if (onPostCreated) onPostCreated(newPost);
            onClose();
        } catch (error) {
            console.error('Failed to create post', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const processFile = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const authorName = user?.name || user?.username || 'Employee';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '80px',
            zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }}>
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '550px',
                maxHeight: 'calc(100vh - 120px)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#1e293b', fontWeight: '600' }}>Create a post</h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', overflow: 'hidden' }}>
                            {authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>{authorName}</h3>
                            <span style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '4px', border: '1px solid #e2e8f0' }}>Anyone</span>
                        </div>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="What do you want to talk about?"
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#1e293b',
                            fontSize: '16px',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            marginBottom: '16px'
                        }}
                    />

                    {showImageInput && !previewUrl && (
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                backgroundColor: isDragging ? '#f1f5f9' : '#f8fafc',
                                border: `2px dashed ${isDragging ? '#1a56db' : '#cbd5e1'}`,
                                borderRadius: '12px',
                                padding: '32px 20px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginBottom: '16px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <input 
                                type="file" 
                                accept="image/*,video/*" 
                                style={{ display: 'none' }} 
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <div style={{ backgroundColor: '#e2e8f0', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                                <UploadCloud size={24} color="#64748b" />
                            </div>
                            <p style={{ margin: '0 0 4px 0', color: '#1e293b', fontSize: '15px', fontWeight: '500' }}>
                                Click to upload or drag and drop
                            </p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                                Photos/Videos up to 10MB
                            </p>
                        </div>
                    )}

                    {previewUrl && (
                        <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <button 
                                onClick={() => setPreviewUrl('')}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    backgroundColor: '#ffffff',
                                    color: '#0f172a',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <X size={16} />
                            </button>
                            <img src={previewUrl} alt="Upload preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setShowImageInput(!showImageInput)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: showImageInput ? '#1a56db' : '#64748b',
                                cursor: 'pointer',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; } }}
                            onMouseOut={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                            title="Add a photo or video"
                        >
                            <ImageIcon size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                            title="Add a document"
                        >
                            <FileText size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                            title="Create a poll"
                        >
                            <BarChart2 size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                            title="Create an event"
                        >
                            <Calendar size={22} />
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!text.trim() && !previewUrl)}
                        style={{
                            backgroundColor: (isSubmitting || (!text.trim() && !previewUrl)) ? '#e2e8f0' : '#1a56db',
                            color: (isSubmitting || (!text.trim() && !previewUrl)) ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            borderRadius: '24px',
                            padding: '8px 20px',
                            fontWeight: '600',
                            fontSize: '15px',
                            cursor: (isSubmitting || (!text.trim() && !previewUrl)) ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span style={{ width: '14px', height: '14px', border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                Uploading...
                            </>
                        ) : 'Post'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default CreatePostModal;

