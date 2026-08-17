import React, { useState, useContext } from 'react';
import { ThumbsUp, MessageSquare, Trash2 } from 'lucide-react';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { toggleLike, deletePost } from '../../../api/posts';
import { AuthContext } from '../../../context/AuthContext';

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
        <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Avatar user={post.author} size={48} />
                    <div>
                        <h4 style={{ margin: 0, color: '#F8FAFC', fontSize: '16px', fontWeight: '600' }}>{post.author?.name}</h4>
                        <span style={{ color: '#94A3B8', fontSize: '13px' }}>{post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                {isAuthor && (
                    <button 
                        onClick={handleDelete}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '4px' }}
                        title="Delete Post"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <p style={{ color: '#E2E8F0', fontSize: '15px', lineHeight: '1.6', marginBottom: post.imageUrl ? '16px' : '20px', whiteSpace: 'pre-wrap' }}>
                {post.text}
            </p>

            {post.imageUrl && (
                <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                </div>
            )}

            <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid #2A3649', paddingTop: '16px' }}>
                <button 
                    onClick={handleLike}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'none', 
                        border: 'none', 
                        color: isLiked ? '#3B82F6' : '#94A3B8', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <ThumbsUp size={18} fill={isLiked ? '#3B82F6' : 'none'} />
                    {likesCount} Likes
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: 'none', 
                        border: 'none', 
                        color: '#94A3B8', 
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}
                >
                    <MessageSquare size={18} />
                    {commentsCount} Comments
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
