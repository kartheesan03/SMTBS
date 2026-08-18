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
            backgroundColor: 'var(--feed-bg-card)', 
            borderRadius: '8px', 
            marginBottom: '16px', 
            border: '1px solid var(--feed-border-card)',
            paddingTop: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', padding: '0 16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Avatar user={post.author} size={48} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <h4 
                                style={{ margin: 0, color: 'var(--feed-text-primary)', fontSize: '15px', fontWeight: '600', lineHeight: '1.2', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--feed-accent-blue)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--feed-text-primary)'}
                            >
                                {post.author?.name}
                            </h4>
                            <span style={{ color: 'var(--feed-text-muted)', fontSize: '14px' }}>· 1st</span>
                        </div>
                        <span style={{ color: 'var(--feed-text-muted)', fontSize: '12px', marginTop: '2px' }}>{post.author?.role || 'Software Engineer at SMTBMS'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--feed-text-muted)', fontSize: '12px', marginTop: '2px' }}>
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

            {/* Post Content */}
            {post.type === 'Article' ? (
                <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--feed-text-primary)' }}>{post.articleTitle}</h3>
                    <p style={{ color: 'var(--feed-text-primary)', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {formatText(post.articleBody)}
                    </p>
                </div>
            ) : (
                <p style={{ color: 'var(--feed-text-primary)', fontSize: '14px', lineHeight: '1.5', marginBottom: (post.imageUrl || (post.media && post.media.length > 0)) ? '12px' : '16px', whiteSpace: 'pre-wrap', padding: '0 16px' }}>
                    {formatText(displayText)}
                    {shouldTruncate && !isExpanded && (
                        <span 
                            onClick={() => setIsExpanded(true)}
                            style={{ color: 'var(--feed-text-muted)', cursor: 'pointer', marginLeft: '4px' }}
                            onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} 
                            onMouseOut={e=>e.currentTarget.style.textDecoration='none'}
                        >
                            ...see more
                        </span>
                    )}
                </p>
            )}

            {/* Media Rendering */}
            {post.media && post.media.length > 0 ? (
                <div style={{ display: 'grid', gap: '2px', gridTemplateColumns: post.media.length === 1 ? '1fr' : '1fr 1fr', backgroundColor: 'var(--feed-bg-page)' }}>
                    {post.media.map((item, idx) => (
                        <img key={idx} src={item.url} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    ))}
                </div>
            ) : post.imageUrl ? (
                <div style={{ width: '100%', backgroundColor: 'var(--feed-bg-page)' }}>
                    <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', display: 'block' }} />
                </div>
            ) : null}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 16px 8px 16px', fontSize: '12px', color: 'var(--feed-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--feed-accent-blue)' }}>
                        <ThumbsUp size={10} color="#FFFFFF" fill="#FFFFFF" />
                    </div>
                    <span>{likesCount > 0 ? (likesCount === 1 ? '1 person' : `You and ${likesCount - 1} others`) : 'Be the first to like this'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--feed-accent-blue)'} onMouseOut={e => e.currentTarget.style.color = 'var(--feed-text-muted)'}>{commentsCount} comments</span>
                    <span>·</span>
                    <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--feed-accent-blue)'} onMouseOut={e => e.currentTarget.style.color = 'var(--feed-text-muted)'}>3 reposts</span>
                </div>
            </div>

            <div style={{ width: 'calc(100% - 32px)', margin: '0 auto', height: '1px', backgroundColor: 'var(--feed-border-card)' }}></div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '4px 12px' }}>
                {showReactions && (
                    <div 
                        onMouseOver={() => setShowReactions(true)}
                        onMouseOut={() => setShowReactions(false)}
                        style={{ position: 'absolute', bottom: '100%', left: '0', backgroundColor: 'var(--feed-bg-card)', padding: '8px 16px', borderRadius: '24px', display: 'flex', gap: '12px', border: '1px solid var(--feed-border-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20 }}
                    >
                        {['👍', '👏', '❤️', '💡', '🤔'].map(emoji => (
                            <div key={emoji} onClick={handleLike} style={{ fontSize: '24px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.2) translateY(-4px)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1) translateY(0)'}>{emoji}</div>
                        ))}
                    </div>
                )}
                
                <button 
                    onClick={handleLike}
                    disabled={isLiking}
                    onMouseOver={(e) => { setShowReactions(true); e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; }}
                    onMouseOut={(e) => { setShowReactions(false); e.currentTarget.style.backgroundColor = 'transparent'; }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: isLiked ? 'var(--feed-accent-blue)' : 'var(--feed-text-muted)',
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                >
                    <ThumbsUp size={20} fill={isLiked ? 'var(--feed-accent-blue)' : 'none'} color={isLiked ? 'var(--feed-accent-blue)' : 'var(--feed-text-muted)'} />
                    Like
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: showComments ? 'var(--feed-text-primary)' : 'var(--feed-text-muted)',
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = showComments ? 'var(--feed-text-primary)' : 'var(--feed-text-muted)'; }}
                >
                    <MessageSquare size={20} fill={showComments ? 'var(--feed-text-muted)' : 'none'} color={showComments ? 'var(--feed-text-primary)' : 'var(--feed-text-muted)'} />
                    Comment
                </button>

                <button 
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--feed-text-muted)',
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}
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
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--feed-text-muted)',
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--feed-text-muted)'; }}
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
