import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { createPost } from '../../../api/posts';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [text, setText] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
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
                    
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Image URL (optional)"
                        style={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            padding: '8px 12px',
                            color: '#F8FAFC',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={isSubmitting || !text.trim()}
                            style={{
                                backgroundColor: '#3B82F6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 24px',
                                fontWeight: '600',
                                fontSize: '14px',
                                cursor: isSubmitting || !text.trim() ? 'not-allowed' : 'pointer',
                                opacity: isSubmitting || !text.trim() ? 0.6 : 1,
                                transition: 'background-color 0.2s'
                            }}
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
