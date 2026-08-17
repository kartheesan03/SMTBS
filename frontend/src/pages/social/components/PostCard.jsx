import React, { useState, useContext } from 'react';
import { ThumbsUp, MessageSquare, Trash2, MoreHorizontal, Globe, Repeat, Send } from 'lucide-react';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { toggleLike, deletePost } from '../../../api/posts';
import { AuthContext } from '../../../context/AuthContext';
import { getRelativeTime } from '../../../utils/timeUtils';

const PostCard = ({ post, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
    const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.userId === user.id) || false);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

    // Helper to format text with mentions and hashtags
    const formatText = (text) => {
        if (!text) return null;
        return text.split(/([\s\n]+)/).map((word, idx) => {
            if (word.startsWith('@') || word.startsWith('#')) {
                return <span key={idx} style={{ color: '#3B82F6', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.textDecoration='underline'} onMouseOut={e => e.currentTarget.style.textDecoration='none'}>{word}</span>;
            }
            return word;
        });
    };
    
    const shouldTruncate = post.text && post.text.length > 150;
    const displayText = isExpanded ? post.text : (shouldTruncate ? post.text.slice(0, 150) + '...' : post.text);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        const wasLiked = isLiked;
        setIsLiked(!wasLiked);
        setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
        setShowReactions(false);

        try {
            await toggleLike(post.id);
        } catch (error) {
            // Revert on failure
            setIsLiked(wasLiked);
            setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
            console.error('Failed to toggle like', error);
        } finally {
            setIsLiking(false);
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <h4 
                                style={{ margin: 0, color: '#F8FAFC', fontSize: '15px', fontWeight: '600', lineHeight: '1.2', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                            >
                                {post.author?.name}
                            </h4>
                            <span style={{ color: '#94A3B8', fontSize: '14px' }}>· 1st</span>
                        </div>
                        <span style={{ color: '#94A3B8', fontSize: '13px', marginTop: '2px' }}>{post.author?.role || 'Software Engineer at SMTBMS'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                            <span>{getRelativeTime(post.createdAt)}</span>
                            <span>·</span>
                            <Globe size={12} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
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
                        onClick={() => setShowMenu(!showMenu)}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="More options"
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#F8FAFC'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {showMenu && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px 0', minWidth: '150px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 10 }}>
                            <div style={{ padding: '8px 16px', color: '#E2E8F0', fontSize: '14px', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>Edit Post</div>
                            <div style={{ padding: '8px 16px', color: '#E2E8F0', fontSize: '14px', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>Copy link</div>
                            <div style={{ padding: '8px 16px', color: '#E2E8F0', fontSize: '14px', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>Report</div>
                        </div>
                    )}
                </div>
            </div>

            <p style={{ color: '#E2E8F0', fontSize: '14px', lineHeight: '1.6', marginBottom: post.imageUrl ? '16px' : '20px', whiteSpace: 'pre-wrap' }}>
                {formatText(displayText)}
                {shouldTruncate && !isExpanded && (
                    <span 
                        onClick={() => setIsExpanded(true)}
                        style={{ color: '#94A3B8', cursor: 'pointer', marginLeft: '4px' }}
                        onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} 
                        onMouseOut={e=>e.currentTarget.style.textDecoration='none'}
                    >
                        ...see more
                    </span>
                )}
            </p>

            {post.imageUrl && (
                <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155', backgroundColor: '#0F172A' }}>
                    <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                </div>
            )}

            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '12px 0 8px 0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px', color: '#94A3B8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#3B82F6' }}>
                        <ThumbsUp size={10} color="#FFFFFF" fill="#FFFFFF" />
                    </div>
                    <span>{likesCount > 0 ? (likesCount === 1 ? '1 person' : `You and ${likesCount - 1} others`) : 'Be the first to like this'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#3B82F6'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>{commentsCount} comments</span>
                    <span>·</span>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#3B82F6'} onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}>3 reposts</span>
                </div>
            </div>

            <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', margin: '8px 0' }}></div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {showReactions && (
                    <div 
                        onMouseOver={() => setShowReactions(true)}
                        onMouseOut={() => setShowReactions(false)}
                        style={{ position: 'absolute', bottom: '100%', left: '0', backgroundColor: '#1E293B', padding: '8px 16px', borderRadius: '24px', display: 'flex', gap: '12px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 20 }}
                    >
                        {['👍', '👏', '❤️', '💡', '🤔'].map(emoji => (
                            <div key={emoji} onClick={handleLike} style={{ fontSize: '24px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.2) translateY(-4px)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1) translateY(0)'}>{emoji}</div>
                        ))}
                    </div>
                )}
                
                <button 
                    onClick={handleLike}
                    disabled={isLiking}
                    onMouseOver={(e) => { setShowReactions(true); e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; }}
                    onMouseOut={(e) => { setShowReactions(false); e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                        padding: '12px 0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
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
                        color: showComments ? '#F8FAFC' : '#94A3B8',
                        cursor: 'pointer',
                        padding: '12px 0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#F8FAFC'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = showComments ? '#F8FAFC' : '#94A3B8'; }}
                >
                    <MessageSquare size={20} fill={showComments ? 'rgba(255,255,255,0.1)' : 'none'} />
                    Comment
                </button>

                <button 
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
                        padding: '12px 0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#F8FAFC'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                >
                    <Repeat size={20} />
                    Repost
                </button>

                <button 
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
                        padding: '12px 0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#F8FAFC'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                >
                    <Send size={20} />
                    Send
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
