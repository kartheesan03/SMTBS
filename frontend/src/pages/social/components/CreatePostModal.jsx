import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { createPost } from '../../../api/posts';
import { X, Image as ImageIcon, FileText, Smile, HelpCircle, UploadCloud } from 'lucide-react';

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

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '80px',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--feed-bg-card)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '550px',
                maxHeight: 'calc(100vh - 120px)',
                border: '1px solid var(--feed-border-card)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid #334155'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--feed-text-primary)', fontWeight: '600' }}>Create a post</h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--feed-text-muted)',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Avatar user={user} size={48} />
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--feed-text-primary)', fontSize: '16px', fontWeight: '600' }}>{user?.name}</h3>
                            <span style={{ fontSize: '13px', color: 'var(--feed-text-primary)', backgroundColor: 'var(--feed-btn-hover)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '4px', border: '1px solid var(--feed-border-card)' }}>Anyone</span>
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
                            color: 'var(--feed-text-primary)',
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
                                backgroundColor: isDragging ? 'var(--feed-btn-hover)' : 'var(--feed-bg-page)',
                                border: `2px dashed ${isDragging ? 'var(--feed-accent-blue)' : 'var(--feed-border-card)'}`,
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
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <div style={{ backgroundColor: 'var(--feed-btn-hover)', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                                <UploadCloud size={24} color="var(--feed-text-muted)" />
                            </div>
                            <p style={{ margin: '0 0 4px 0', color: 'var(--feed-text-primary)', fontSize: '15px', fontWeight: '500' }}>
                                Click to upload or drag and drop
                            </p>
                            <p style={{ margin: 0, color: 'var(--feed-text-muted)', fontSize: '13px' }}>
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    )}

                    {previewUrl && (
                        <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--feed-bg-page)', border: '1px solid var(--feed-border-card)' }}>
                            <button 
                                onClick={() => setPreviewUrl('')}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    backgroundColor: 'var(--feed-bg-card)',
                                    color: 'var(--feed-text-primary)',
                                    border: '1px solid var(--feed-border-card)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    backdropFilter: 'blur(4px)'
                                }}
                            >
                                <X size={16} />
                            </button>
                            <img src={previewUrl} alt="Upload preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setShowImageInput(!showImageInput)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: showImageInput ? 'var(--feed-accent-blue)' : 'var(--feed-text-muted)',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; } }}
                            onMouseOut={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--feed-text-muted)'; } }}
                            title="Add a photo"
                        >
                            <ImageIcon size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: 'var(--feed-text-muted)', cursor: 'not-allowed', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Add a document"
                        >
                            <FileText size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: 'var(--feed-text-muted)', cursor: 'not-allowed', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Add a poll"
                        >
                            <HelpCircle size={22} />
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!text.trim() && !previewUrl)}
                        style={{
                            backgroundColor: (isSubmitting || (!text.trim() && !previewUrl)) ? 'var(--feed-border-card)' : 'var(--feed-accent-blue)',
                            color: (isSubmitting || (!text.trim() && !previewUrl)) ? 'var(--feed-text-muted)' : 'white',
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
                                <span style={{ width: '14px', height: '14px', border: '2px solid #64748B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
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
