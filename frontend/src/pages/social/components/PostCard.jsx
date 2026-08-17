import React, { useState, useContext } from 'react';
import { ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { toggleLike, deletePost } from '../../../api/posts';
import { AuthContext } from '../../../context/AuthContext';
import { getRelativeTime } from '../../../utils/timeUtils';

const PostCard = ({ post, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.userId === user.id) || false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);

    const handleLike = async () => {
        const wasLiked = isLiked;
        setIsLiked(!wasLiked);
        setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

        try {
            await toggleLike(post.id);
        } catch (error) {
            // Revert on failure
            setIsLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            console.error('Failed to toggle like', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await deletePost(post.id);
            if (onDelete) onDelete(post.id);
        } catch (error) {
            console.error('Failed to delete post', error);
        }
    };

    const isAuthor = user.id === post.authorId || user.role === 'Admin' || user.role === 'Super Admin';

    return (
        <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '16px 20px 20px', marginBottom: '16px', border: '1px solid #334155', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Avatar user={post.author} size={48} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '15px', fontWeight: '600', lineHeight: '1.2' }}>{post.author?.name}</h4>
                        <span style={{ color: '#94A3B8', fontSize: '12px', marginTop: '2px' }}>{post.author?.role}</span>
                        <span style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>{getRelativeTime(post.createdAt)}</span>
                    </div>
                </div>
                {isAuthor && (
                    <button 
                        onClick={handleDelete}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s' }}
                        title="Delete Post"
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#F87171'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <p style={{ color: '#E2E8F0', fontSize: '15px', lineHeight: '1.6', marginBottom: post.imageUrl ? '16px' : '20px', whiteSpace: 'pre-wrap' }}>
                {post.text}
            </p>

            {post.imageUrl && (
                <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155', backgroundColor: '#0F172A' }}>
                    <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                </div>
            )}

            {(likesCount > 0 || commentsCount > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px', color: '#94A3B8' }}>
                    <span>{likesCount > 0 ? `${likesCount} like${likesCount !== 1 ? 's' : ''}` : ''}</span>
                    <span>{commentsCount > 0 ? `${commentsCount} comment${commentsCount !== 1 ? 's' : ''}` : ''}</span>
                </div>
            )}

            <div style={{ height: '1px', backgroundColor: '#334155', margin: '0 0 8px 0' }}></div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={handleLike}
                    style={{ 
                        flex: 1,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px', 
                        background: 'none', 
                        border: 'none', 
                        color: isLiked ? '#3B82F6' : '#94A3B8', 
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <ThumbsUp size={20} fill={isLiked ? '#3B82F6' : 'none'} />
                    Like
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    style={{ 
                        flex: 1,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px', 
                        background: 'none', 
                        border: 'none', 
                        color: '#94A3B8', 
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <MessageSquare size={20} />
                    Comment
                </button>
            </div>

            {showComments && (
                <CommentSection 
                    postId={post.id} 
                    comments={post.comments} 
                    onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                />
            )}
        </div>
    );
};

export default PostCard;
