import React, { useState } from 'react';
import Avatar from './Avatar';
import { addComment } from '../../../api/posts';
import { getRelativeTime } from '../../../utils/timeUtils';

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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div style={{ marginTop: '16px', borderTop: '1px solid #2A3649', paddingTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                {comments.map((comment) => (
                    <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                        <Avatar user={comment.author} size={36} />
                        <div style={{ flex: 1 }}>
                            <div style={{ backgroundColor: '#1E293B', padding: '12px 16px', borderRadius: '0 12px 12px 12px', border: '1px solid #334155', display: 'inline-block', maxWidth: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '12px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#F8FAFC' }}>{comment.author?.name}</span>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                                        {getRelativeTime(comment.createdAt)}
                                    </span>
                                </div>
                                <span style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>{comment.author?.role}</span>
                                <p style={{ margin: 0, fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a comment... (Press Enter to post)"
                    disabled={submitting}
                    style={{
                        flex: 1,
                        backgroundColor: '#111827',
                        border: '1px solid #334155',
                        borderRadius: '20px',
                        padding: '10px 16px',
                        color: '#F8FAFC',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                        minHeight: '40px',
                        lineHeight: '1.4',
                        fontFamily: 'inherit',
                        overflow: 'hidden'
                    }}
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={submitting || !text.trim()}
                    style={{
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
                        opacity: submitting || !text.trim() ? 0.5 : 1,
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => { if (!submitting && text.trim()) e.target.style.backgroundColor = '#2563EB'; }}
                    onMouseOut={(e) => { if (!submitting && text.trim()) e.target.style.backgroundColor = '#3B82F6'; }}
                >
                    Post
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
