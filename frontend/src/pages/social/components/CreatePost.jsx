import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { createPost } from '../../../api/posts';
import { Image as ImageIcon } from 'lucide-react';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            const newPost = await createPost(text, imageUrl || null);
            setText('');
            setImageUrl('');
            if (onPostCreated) onPostCreated(newPost);
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', border: '1px solid #334155', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
                <Avatar user={user} size={48} />
                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                        style={{
                            width: '100%',
                            minHeight: '80px',
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#F8FAFC',
                            fontSize: '15px',
                            resize: 'none',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    
                    {showImageInput && (
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL here..."
                            style={{
                                backgroundColor: '#111827',
                                border: '1px solid #3B82F6',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                color: '#F8FAFC',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <button
                            type="button"
                            onClick={() => setShowImageInput(!showImageInput)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                color: showImageInput ? '#3B82F6' : '#94A3B8',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#E2E8F0'; } }}
                            onMouseOut={(e) => { if (!showImageInput) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; } }}
                        >
                            <ImageIcon size={20} />
                            Media
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting || !text.trim()}
                            style={{
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 24px',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: isSubmitting || !text.trim() ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting || !text.trim() ? 0.5 : 1,
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { if (!isSubmitting && text.trim()) e.target.style.backgroundColor = '#2563EB'; }}
                            onMouseOut={(e) => { if (!isSubmitting && text.trim()) e.target.style.backgroundColor = '#3B82F6'; }}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
