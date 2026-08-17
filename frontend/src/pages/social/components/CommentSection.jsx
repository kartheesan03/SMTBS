import React, { useState } from 'react';
import Avatar from './Avatar';
import { addComment } from '../../../api/posts';

const CommentSection = ({ postId, comments: initialComments, onCommentAdded }) => {
    const [comments, setComments] = useState(initialComments || []);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            const newComment = await addComment(postId, text);
            setComments([...comments, newComment]);
            setText('');
            if (onCommentAdded) onCommentAdded();
        } catch (error) {
            console.error('Failed to add comment', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ marginTop: '16px', borderTop: '1px solid #2A3649', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {comments.map((comment) => (
                    <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                        <Avatar user={comment.author} size={32} />
                        <div style={{ backgroundColor: '#1A2436', padding: '10px 14px', borderRadius: '8px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', fontSize: '13px', color: '#E2E8F0' }}>{comment.author?.name}</span>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px', color: '#CBD5E1', lineHeight: '1.4' }}>{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={submitting}
                    style={{
                        flex: 1,
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        color: '#F8FAFC',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    disabled={submitting || !text.trim()}
                    style={{
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 20px',
                        fontWeight: '600',
                        cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
                        opacity: submitting || !text.trim() ? 0.6 : 1
                    }}
                >
                    Post
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
