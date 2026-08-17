import React, { useState, useContext } from 'react';
import { ThumbsUp, MessageSquare, Trash2, MoreHorizontal } from 'lucide-react';
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
        <div style={{ 
            background: 'linear-gradient(180deg, #1A2436 0%, #161F32 100%)', 
            borderRadius: '10px', 
            padding: '20px', 
            marginBottom: '16px', 
            border: '1px solid rgba(255, 255, 255, 0.06)', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Avatar user={post.author} size={48} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '15px', fontWeight: '600', lineHeight: '1.2' }}>{post.author?.name}</h4>
                        <span style={{ color: '#94A3B8', fontSize: '12px', marginTop: '2px' }}>{post.author?.role}</span>
                        <span style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>{getRelativeTime(post.createdAt)}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {isAuthor && (
                        <button 
                            onClick={handleDelete}
                            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Post"
                            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#EF4444'; }}
                            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button 
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="More options"
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#F8FAFC'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <p style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: '1.6', marginBottom: post.imageUrl ? '16px' : '20px', whiteSpace: 'pre-wrap' }}>
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

            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '16px 0' }}></div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                    onClick={handleLike}
                    disabled={isLiking}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        color: isLiked ? '#3B82F6' : '#94A3B8',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = isLiked ? '#60A5FA' : '#F8FAFC'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isLiked ? '#3B82F6' : '#94A3B8'; }}
                >
                    <ThumbsUp size={18} fill={isLiked ? '#3B82F6' : 'none'} />
                    Like
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'none',
                        border: 'none',
                        color: showComments ? '#F8FAFC' : '#94A3B8',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#F8FAFC'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = showComments ? '#F8FAFC' : '#94A3B8'; }}
                >
                    <MessageSquare size={18} fill={showComments ? 'rgba(255,255,255,0.1)' : 'none'} />
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
