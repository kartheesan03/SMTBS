import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { createPost } from '../../../api/posts';
import { X, Image as ImageIcon, FileText, Smile, HelpCircle } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            const newPost = await createPost(text, imageUrl || null);
            console.log('POST /api/feed response:', newPost);
            setText('');
            setImageUrl('');
            setShowImageInput(false);
            if (onPostCreated) onPostCreated(newPost);
            onClose();
        } catch (error) {
            console.error('Failed to create post', error);
        } finally {
            setIsSubmitting(false);
        }
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
                backgroundColor: '#1E293B',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '550px',
                border: '1px solid #334155',
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
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#F8FAFC', fontWeight: '600' }}>Create a post</h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#F8FAFC'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Avatar user={user} size={48} />
                        <div>
                            <h3 style={{ margin: 0, color: '#F8FAFC', fontSize: '16px', fontWeight: '600' }}>{user?.name}</h3>
                            <span style={{ fontSize: '13px', color: '#94A3B8', backgroundColor: '#334155', padding: '2px 8px', borderRadius: '12px', display: 'inline-block', marginTop: '4px' }}>Anyone</span>
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
                            color: '#F8FAFC',
                            fontSize: '16px',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit',
                            marginBottom: '16px'
                        }}
                    />

                    {showImageInput && (
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL here..."
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                backgroundColor: '#0F172A',
                                border: '1px solid #3B82F6',
                                borderRadius: '8px',
                                padding: '12px',
                                color: '#F8FAFC',
                                fontSize: '14px',
                                outline: 'none',
                                marginBottom: '16px'
                            }}
                        />
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
                                color: showImageInput ? '#3B82F6' : '#94A3B8',
                                cursor: 'pointer',
                                padding: '12px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#E2E8F0'; } }}
                            onMouseOut={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
                            title="Add a photo"
                        >
                            <ImageIcon size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'not-allowed', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Add a document"
                        >
                            <FileText size={22} />
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'not-allowed', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Add a poll"
                        >
                            <HelpCircle size={22} />
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !text.trim()}
                        style={{
                            backgroundColor: (isSubmitting || !text.trim()) ? '#334155' : '#3B82F6',
                            color: (isSubmitting || !text.trim()) ? '#64748B' : 'white',
                            border: 'none',
                            borderRadius: '24px',
                            padding: '8px 20px',
                            fontWeight: '600',
                            fontSize: '15px',
                            cursor: (isSubmitting || !text.trim()) ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
