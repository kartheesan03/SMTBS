import React, { useState, useContext } from 'react';
import { ThumbsUp, MessageSquare, Trash2, MoreHorizontal, Globe, Repeat, Send, Pin, AlertTriangle, Edit2 } from 'lucide-react';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { toggleLike, deletePost } from '../../../api/posts';
import { AuthContext } from '../../../context/AuthContext';
import { getRelativeTime } from '../../../utils/timeUtils';

const SocialPostCard = ({ post, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [likesCount, setLikesCount] = useState(post.likes?.length || post.likesCount || 0);
    const [isLiked, setIsLiked] = useState(post.likes?.some(like => like.userId === user.id) || false);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(post.comments?.length || post.commentsCount || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

    const formatText = (text) => {
        if (!text) return null;
        return text.split(/([\s\n]+)/).map((word, idx) => {
            if (word.startsWith('@') || word.startsWith('#')) {
                return <span key={idx} style={{ color: '#1a56db', cursor: 'pointer', fontWeight: '500' }} onMouseOver={e => e.currentTarget.style.textDecoration='underline'} onMouseOut={e => e.currentTarget.style.textDecoration='none'}>{word}</span>;
            }
            return word;
        });
    };
    
    const textContent = post.content || post.text || '';
    const shouldTruncate = textContent.length > 200;
    const displayText = isExpanded ? textContent : (shouldTruncate ? textContent.slice(0, 200) + '...' : textContent);

    const handleLike = async (reaction = 'like') => {
        if (isLiking) return;
        setIsLiking(true);
        const wasLiked = isLiked;
        
        setIsLiked(true);
        if (!wasLiked) setLikesCount(prev => prev + 1);
        setShowReactions(false);

        try {
            if (post.id && toggleLike) {
                await toggleLike(post.id);
            }
        } catch (error) {
            setIsLiked(wasLiked);
            if (!wasLiked) setLikesCount(prev => prev - 1);
            console.error('Failed to toggle like', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            if (post.id && deletePost) {
                await deletePost(post.id);
            }
            if (onDelete) onDelete(post.id);
        } catch (error) {
            console.error('Failed to delete post', error);
        }
    };

    const authorId = post.author?.id || post.authorId;
    const isAuthor = user.id === authorId || user.role === 'Admin' || user.role === 'Super Admin';
    const isAdmin = user.role === 'Admin' || user.role === 'Super Admin';

    const authorName = post.author?.name || post.author?.username || 'Unknown User';
    const authorRole = post.author?.role || post.author?.department || 'Employee';
    const postMedia = post.media || (post.imageUrl ? [{ url: post.imageUrl }] : []);

    return (
        <div className="social-post-card" style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px', 
            marginBottom: '16px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            paddingTop: '16px',
            position: 'relative',
            animation: post.isNew ? 'slideDownFadeIn 0.5s ease-out' : 'none'
        }}>
            {post.isNew && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#1a56db', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}></div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', padding: '0 16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e2e8f0', color: '#1a56db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', overflow: 'hidden' }}>
                        {authorName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px', fontWeight: '600', lineHeight: '1.2', cursor: 'pointer' }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#1a56db'}
                                onMouseOut={(e) => e.currentTarget.style.color = '#1e293b'}
                            >
                                {authorName}
                            </h4>
                        </div>
                        <span style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>{authorRole}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                            <span>{post.createdAt ? getRelativeTime(post.createdAt) : 'Just now'}</span>
                            <span>·</span>
                            <Globe size={12} />
                        </div>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    
                    {showMenu && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 0', minWidth: '160px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 10 }}>
                            {isAuthor && <div style={{ padding: '8px 16px', color: '#334155', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#f8fafc'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}><Edit2 size={16} /> Edit Post</div>}
                            {(isAuthor || isAdmin) && <div onClick={handleDelete} style={{ padding: '8px 16px', color: '#ef4444', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#fef2f2'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}><Trash2 size={16} /> Delete Post</div>}
                            {isAdmin && <div style={{ padding: '8px 16px', color: '#334155', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#f8fafc'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}><Pin size={16} /> Pin to top</div>}
                            <div style={{ padding: '8px 16px', color: '#334155', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#f8fafc'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}><AlertTriangle size={16} /> Report</div>
                        </div>
                    )}
                </div>
            </div>

            <p style={{ color: '#334155', fontSize: '14px', lineHeight: '1.6', marginBottom: postMedia.length > 0 ? '12px' : '16px', whiteSpace: 'pre-wrap', padding: '0 16px' }}>
                {formatText(displayText)}
                {shouldTruncate && !isExpanded && (
                    <span 
                        onClick={() => setIsExpanded(true)}
                        style={{ color: '#64748b', cursor: 'pointer', marginLeft: '4px', fontWeight: '500' }}
                        onMouseOver={e=>e.currentTarget.style.textDecoration='underline'} 
                        onMouseOut={e=>e.currentTarget.style.textDecoration='none'}
                    >
                        ...see more
                    </span>
                )}
            </p>

            {postMedia.length > 0 && (
                <div style={{ width: '100%', backgroundColor: '#f8fafc', marginBottom: '8px' }}>
                    {postMedia.map((item, idx) => (
                        <img key={idx} src={item.url} alt="Post attachment" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 16px 8px 16px', fontSize: '13px', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#1a56db' }}>
                        <ThumbsUp size={10} color="#FFFFFF" fill="#FFFFFF" />
                    </div>
                    <span>{likesCount > 0 ? (isLiked ? `You and ${likesCount - 1} others` : `${likesCount} likes`) : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {commentsCount > 0 && (
                        <span style={{ cursor: 'pointer' }} onClick={() => setShowComments(!showComments)} onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>{commentsCount} comments</span>
                    )}
                    {post.reposts > 0 && (
                        <span style={{ cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'} onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}>{post.reposts} reposts</span>
                    )}
                </div>
            </div>

            <div style={{ width: 'calc(100% - 32px)', margin: '0 auto', height: '1px', backgroundColor: '#e2e8f0' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '4px 12px' }}>
                {showReactions && (
                    <div 
                        onMouseOver={() => setShowReactions(true)}
                        onMouseOut={() => setShowReactions(false)}
                        style={{ position: 'absolute', bottom: '100%', left: '0', backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: '24px', display: 'flex', gap: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 20 }}
                    >
                        {[{emoji: '👍', name: 'like'}, {emoji: '👏', name: 'celebrate'}, {emoji: '❤️', name: 'love'}, {emoji: '💡', name: 'insightful'}].map(reaction => (
                            <div key={reaction.name} onClick={() => handleLike(reaction.name)} style={{ fontSize: '24px', cursor: 'pointer', transition: 'transform 0.2s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.3) translateY(-4px)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1) translateY(0)'} title={reaction.name}>{reaction.emoji}</div>
                        ))}
                    </div>
                )}
                
                <button 
                    onClick={() => handleLike('like')}
                    disabled={isLiking}
                    onMouseOver={(e) => { setShowReactions(true); e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                    onMouseOut={(e) => { setShowReactions(false); e.currentTarget.style.backgroundColor = 'transparent'; }}
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none',
                        color: isLiked ? '#1a56db' : '#64748b', cursor: 'pointer', padding: '12px 0', borderRadius: '4px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
                    }}
                >
                    <ThumbsUp size={20} fill={isLiked ? '#1a56db' : 'none'} color={isLiked ? '#1a56db' : '#64748b'} />
                    Like
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none',
                        color: showComments ? '#0f172a' : '#64748b', cursor: 'pointer', padding: '12px 0', borderRadius: '4px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = showComments ? '#0f172a' : '#64748b'; }}
                >
                    <MessageSquare size={20} fill={showComments ? '#e2e8f0' : 'none'} color={showComments ? '#0f172a' : '#64748b'} />
                    Comment
                </button>

                <button 
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none',
                        color: '#64748b', cursor: 'pointer', padding: '12px 0', borderRadius: '4px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <Repeat size={20} />
                    Repost
                </button>

                <button 
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'none', border: 'none',
                        color: '#64748b', cursor: 'pointer', padding: '12px 0', borderRadius: '4px', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <Send size={20} />
                    Send
                </button>
            </div>

            {showComments && (
                <div style={{ backgroundColor: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <CommentSection 
                        postId={post.id} 
                        comments={post.comments} 
                        onCommentAdded={() => setCommentsCount(prev => prev + 1)}
                    />
                </div>
            )}
        </div>
    );
};

export default SocialPostCard;
