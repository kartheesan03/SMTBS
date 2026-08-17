import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import { addComment } from '../../../api/posts';
import { getRelativeTime } from '../../../utils/timeUtils';

const CommentSection = ({ postId, comments: initialComments, onCommentAdded }) => {
    const { user } = useContext(AuthContext);
    const [comments, setComments] = useState(initialComments || []);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(2);

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
        <div style={{ marginTop: '16px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
                <Avatar user={user} size={40} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        disabled={submitting}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--feed-border-card)',
                            borderRadius: '24px',
                            padding: '10px 16px',
                            color: 'var(--feed-text-primary)',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'none',
                            minHeight: '40px',
                            lineHeight: '1.4',
                            fontFamily: 'inherit',
                            overflow: 'hidden',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--feed-accent-blue)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--feed-border-card)'}
                        rows={1}
                    />
                    {text.trim() && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    backgroundColor: 'var(--feed-accent-blue)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '4px 16px',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    opacity: submitting ? 0.5 : 1,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => { if (!submitting) e.target.style.backgroundColor = 'var(--feed-btn-hover)'; e.target.style.color = 'var(--feed-text-primary)'; }}
                                onMouseOut={(e) => { if (!submitting) e.target.style.backgroundColor = 'var(--feed-accent-blue)'; e.target.style.color = 'white'; }}
                            >
                                Post
                            </button>
                        </div>
                    )}
                </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.slice(0, visibleCount).map((comment) => (
                    <div key={comment.id} style={{ display: 'flex', gap: '8px' }}>
                        <Avatar user={comment.author} size={40} />
                        <div style={{ flex: 1 }}>
                            <div style={{ backgroundColor: 'var(--feed-bg-page)', padding: '8px 12px', borderRadius: '0 8px 8px 8px', display: 'inline-block', maxWidth: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px', gap: '12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--feed-text-primary)', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.textDecoration='underline'} onMouseOut={e => e.currentTarget.style.textDecoration='none'}>{comment.author?.name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--feed-text-muted)' }}>{comment.author?.role}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--feed-text-muted)' }}>
                                        {getRelativeTime(comment.createdAt)}
                                    </span>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--feed-text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', paddingLeft: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--feed-text-muted)', fontWeight: '600' }}>
                                <span style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor='var(--feed-btn-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'} className="comment-action">Like</span>
                                <span style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor='var(--feed-btn-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'} className="comment-action">Reply</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {comments.length > visibleCount && (
                <div 
                    onClick={() => setVisibleCount(prev => prev + 5)}
                    style={{ marginTop: '12px', color: 'var(--feed-text-muted)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--feed-text-primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--feed-text-muted)'}
                >
                    Load more comments
                </div>
            )}
            <style>{`
                .comment-action {
                    padding: 2px 4px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
            `}</style>
        </div>
    );
};

export default CommentSection;
