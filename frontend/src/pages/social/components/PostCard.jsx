import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  ThumbsUp, MessageSquare, Trash2, MoreHorizontal,
  Globe, Bookmark, CheckCircle, Repeat2, Share2, Pin,
  Megaphone, Radio, Heart, PartyPopper, Lightbulb
} from 'lucide-react';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import { toggleLike, deletePost, toggleSave, acknowledgePost, toggleRepost as toggleRepostAPI } from '../../../api/posts';
import { AuthContext } from '../../../context/AuthContext';
import { getRelativeTime } from '../../../utils/timeUtils';
import toast from 'react-hot-toast';
import ShareModal from './ShareModal';

// ─── Reaction emojis ───────────────────────────────────────────────────────
const REACTIONS = [
  { emoji: '👍', label: 'Like',       Icon: ThumbsUp,   color: 'var(--li-blue)' },
  { emoji: '❤️', label: 'Love',       Icon: Heart,      color: '#e0245e' },
  { emoji: '🎉', label: 'Celebrate',  Icon: PartyPopper,color: 'var(--li-amber)' },
  { emoji: '💡', label: 'Insightful', Icon: Lightbulb,  color: '#8b5cf6' },
  { emoji: '🤔', label: 'Curious',    Icon: MessageSquare, color: 'var(--li-text-2)' },
];

// ─── Avatar color pool ─────────────────────────────────────────────────────
const AVATAR_COLORS = ['#0a3d62', '#155e75', '#166534', '#7c2d12', '#4338ca', '#b45309'];

// ─── Small helper: user avatar circle ─────────────────────────────────────
function UserAvatar({ user: u, size = 44 }) {
  const initials = (u?.name || u?.username || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color = u?.color || AVATAR_COLORS[0];
  if (u?.picture) {
    return (
      <img
        src={u.picture}
        alt={initials}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

const PostCard = ({ post, onDelete, onPin, onRepost, onHashtagClick }) => {
  const { user } = useContext(AuthContext);
  const [likesCount, setLikesCount]   = useState(post.likes?.length || 0);
  const [isLiked,    setIsLiked]      = useState(post.likes?.some(l => l.userId === user.id) || false);
  const [isLiking,   setIsLiking]     = useState(false);
  const [isSaved,    setIsSaved]      = useState(post.saved || false);
  const [isReposted, setIsReposted]   = useState(
    post.reposts?.some(r => r.userId === (user?.id)) || false
  );
  const [repostCount, setRepostCount] = useState(post.reposts?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [isExpanded, setIsExpanded]   = useState(false);
  const [showMenu,   setShowMenu]     = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(
    post.acknowledgements?.some(a => a.userId === user.id) || false
  );
  const [ackCount, setAckCount] = useState(post.acknowledgements?.length || 0);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const menuRef      = useRef(null);
  const reactionTimer = useRef(null);

  // Close lightbox on Escape key
  React.useEffect(() => {
    if (!lightboxSrc) return;
    const fn = e => { if (e.key === 'Escape') setLightboxSrc(null); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [lightboxSrc]);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const fn = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [showMenu]);

  // Format text: color @mentions and #hashtags, and parse **bold**
  const formatText = text => {
    if (!text) return null;
    
    // First, split by bold markdown **text**
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    
    return boldParts.map((boldPart, bIndex) => {
        if (boldPart.startsWith('**') && boldPart.endsWith('**') && boldPart.length > 4) {
            return <strong key={bIndex} style={{ color: 'var(--li-text-1)' }}>{boldPart.slice(2, -2)}</strong>;
        }
        
        // Process hashtags and mentions within non-bold text
        return boldPart.split(/([\s\n]+)/).map((word, i) => {
          const isHashtag = word.startsWith('#');
          if (word.startsWith('@') || isHashtag) {
            return (
                <span 
                  key={`${bIndex}-${i}`} 
                  style={{ color: 'var(--li-blue)', fontWeight: 600, cursor: 'pointer' }}
                  onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
                  onClick={(e) => {
                    if (isHashtag && onHashtagClick) {
                      e.stopPropagation();
                      onHashtagClick(word);
                    }
                  }}
                >
                  {word}
                </span>
            );
          }
          return word;
        });
    });
  };

  const TRUNCATE = 300;
  const shouldTruncate = post.text && post.text.length > TRUNCATE;
  const displayText    = isExpanded ? post.text : (shouldTruncate ? post.text.slice(0, TRUNCATE) : post.text);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const was = isLiked;
    setIsLiked(!was); setLikesCount(n => was ? n - 1 : n + 1); setShowReactions(false);
    try { await toggleLike(post.id); }
    catch { setIsLiked(was); setLikesCount(n => was ? n + 1 : n - 1); }
    finally { setIsLiking(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await deletePost(post.id); if (onDelete) onDelete(post.id); toast.success('Post deleted'); }
    catch { toast.error('Failed to delete post'); }
  };

  const handleRepost = async () => {
    const prev = isReposted;
    setIsReposted(!prev);
    setRepostCount(c => prev ? c - 1 : c + 1);
    try {
      await toggleRepostAPI(post.id);
    } catch (err) {
      // rollback
      setIsReposted(prev);
      setRepostCount(c => prev ? c + 1 : c - 1);
      toast.error('Failed to update repost');
    }
  };

  const handleSave = async () => {
    const was = isSaved; setIsSaved(!was); setShowMenu(false);
    try { await toggleSave(post.id); toast.success(was ? 'Post unsaved' : 'Post saved'); }
    catch (err) { setIsSaved(was); toast.error('Save failed: ' + (err.response?.data?.message || err.message)); }
  };

  const handlePinAction = () => {
    if (onPin) onPin();
    setShowMenu(false);
  };

  const handleAcknowledge = async () => {
    const was = isAcknowledged; setIsAcknowledged(!was); setAckCount(n => was ? n - 1 : n + 1);
    try {
      await acknowledgePost(post.id);
    } catch { setIsAcknowledged(was); setAckCount(n => was ? n + 1 : n - 1); }
  };

  const safeRole = String(user?.role || '').toLowerCase().trim();
  const isAuthor = String(user?.id) === String(post.authorId) || String(user?._id) === String(post.authorId) || ['admin', 'super admin'].includes(safeRole);
  const isAnnouncement = post.type === 'Announcement';
  const isBroadcast    = post.type === 'Broadcast';
  const isPinned       = post.pinned;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: isAnnouncement ? '1px solid #fde68a' : isBroadcast ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        transition: 'box-shadow 0.2s',
      }}
      onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
      onMouseOut={e  => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
    >

      {/* ── Pinned banner ─────────────────────────────────────────── */}
      {isPinned && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#f8fafc', padding: '8px 16px',
          fontSize: '12px', fontWeight: 600, color: '#64748b',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <Pin size={13} /> Pinned by SMTBMS
        </div>
      )}

      {/* ── Announcement type banner ───────────────────────────────── */}
      {isAnnouncement && (
        <div style={{
          background: 'var(--li-amber-light)',
          padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: '10px',
          borderBottom: '1px solid var(--li-amber)',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--li-amber)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Megaphone size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--li-text-1)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📢 IMPORTANT ANNOUNCEMENT
            </div>
            <div style={{ fontSize: '12px', color: 'var(--li-amber)', marginTop: '1px', fontWeight: 600 }}>
              SMTBMS Official · {post.author?.role || 'HR Department'}
            </div>
          </div>
        </div>
      )}

      {/* ── Repost Header ─────────────────────────────────────────── */}
      {post.isRepost && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px 0', fontSize: '13px', color: 'var(--li-text-2)', fontWeight: 600 }}>
          <Repeat2 size={16} />
          <span>{post.reposterName} reposted this</span>
        </div>
      )}

      {/* ── Broadcast type banner ──────────────────────────────────── */}
      {isBroadcast && (
        <div style={{
          background: 'var(--li-green-light)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--li-green)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--li-green)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Radio size={14} color="#fff" />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--li-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📣 COMPANY BROADCAST
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--li-green)', background: '#fff', padding: '2px 10px', borderRadius: '12px', fontWeight: 600, border: '1px solid var(--li-green)' }}>
            LIVE
          </span>
        </div>
      )}

      {/* ── Post header ───────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <UserAvatar user={post.author} size={46} />
            {isAnnouncement && (
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--li-amber)', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Megaphone size={9} color="#fff" />
              </div>
            )}
            {isBroadcast && (
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--li-green)', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Radio size={9} color="#fff" />
              </div>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--li-text-1)', cursor: 'pointer' }}
                onMouseOver={e => e.target.style.textDecoration = 'underline'}
                onMouseOut={e => e.target.style.textDecoration = 'none'}
              >
                {post.author?.name}
              </span>
              {isAnnouncement && (
                <span style={{
                  background: 'var(--li-amber-light)', color: 'var(--li-amber)',
                  fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                  borderRadius: '4px', letterSpacing: '0.3px',
                }}>
                  OFFICIAL
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--li-text-2)', marginTop: '2px', lineHeight: 1.3 }}>
              {post.author?.role || 'Company Member'}
              {post.author?.department ? ` · ${post.author.department}` : ''}
            </div>
            {!isBroadcast && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--li-text-3)', marginTop: '2px' }}>
                <span>{getRelativeTime(post.createdAt)}</span>
                <span>·</span>
                <Globe size={11} />
                <span>{post.visibility || 'Everyone'}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── 3-dot menu ──────────────────────────────────────────── */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '50%', display: 'flex', color: '#94a3b8',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            <MoreHorizontal size={20} />
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0,
              background: '#fff', border: '1px solid #e2e8f0',
              borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: '190px', zIndex: 50, overflow: 'hidden', padding: '4px 0',
            }}>
              {[
                { icon: Bookmark, label: isSaved ? 'Unsave post' : 'Save post', action: handleSave, fill: isSaved },
                { icon: Pin, label: isPinned ? 'Unpin post' : 'Pin post', action: handlePinAction },
                ...(isAuthor ? [{ icon: Trash2, label: 'Delete post', action: handleDelete, danger: true }] : []),
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={item.action}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                    color: item.danger ? '#ef4444' : '#374151',
                    transition: 'background 0.12s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = item.danger ? '#fef2f2' : '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <item.icon size={15} fill={item.fill ? 'currentColor' : 'none'} />
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Post body ──────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 16px' }}>
        {post.articleTitle && (
          <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
            {post.articleTitle}
          </h3>
        )}
        {(post.text || post.articleBody) && (
          <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {formatText(displayText || post.articleBody)}
            {shouldTruncate && !isExpanded && (
              <button onClick={() => setIsExpanded(true)}
                style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginLeft: '4px' }}>
                …see more
              </button>
            )}
            {isExpanded && shouldTruncate && (
              <button onClick={() => setIsExpanded(false)}
                style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginLeft: '4px' }}>
                {' '}Show less
              </button>
            )}
          </p>
        )}
      </div>

      {/* ── Media ─────────────────────────────────────────────────── */}
      {post.media && post.media.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: post.media.length === 1 ? '1fr' : '1fr 1fr',
          gap: '2px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
          background: '#000', maxHeight: post.media.length === 1 ? '500px' : '280px', overflow: 'hidden',
        }}>
          {post.media.map((item, idx) => (
            <img key={idx} src={item.url} alt="Post media"
              onClick={() => setLightboxSrc(item.url)}
              onError={(e) => e.target.style.display = 'none'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} />
          ))}
        </div>
      ) : post.image ? (
        <div style={{ background: '#000', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', maxHeight: '500px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <img
            src={post.image}
            alt="Post"
            onClick={() => setLightboxSrc(post.image)}
            onError={(e) => e.target.style.display = 'none'}
            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', cursor: 'zoom-in' }}
          />
        </div>
      ) : null}

      {/* ── Lightbox overlay ─────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            backdropFilter: 'blur(6px)',
            animation: 'lf-modal-in 0.18s ease-out',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: 'none', borderRadius: '50%',
              width: 44, height: 44, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 22, fontWeight: 700,
              transition: 'background 0.2s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >✕</button>
          <img
            src={lightboxSrc}
            alt="Full view"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '92vw', maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
              cursor: 'default',
            }}
          />
        </div>
      )}

      {/* ── Engagement stats row ──────────────────────────────────── */}
      {!isBroadcast && (likesCount > 0 || commentsCount > 0) && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px 12px',
          fontSize: '13px', color: '#595959',
        }}>
          {/* Reaction emoji stacks + count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
            onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
          >
            {likesCount > 0 && (
              <>
                <div style={{ display: 'flex' }}>
                  {['👍', '❤️'].slice(0, Math.min(2, likesCount)).map((em, i) => (
                    <div key={i} style={{
                      width: 18, height: 18, borderRadius: '50%', fontSize: '11px',
                      border: '1.5px solid #fff',
                      marginLeft: i > 0 ? '-4px' : 0,
                      background: i === 0 ? '#dbeafe' : '#fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 2 - i,
                    }}>{em}</div>
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: '#595959' }}>
                  {isLiked
                    ? likesCount === 1 ? 'You' : `You and ${likesCount - 1} ${likesCount - 1 === 1 ? 'other' : 'others'}`
                    : likesCount.toLocaleString()}
                </span>
              </>
            )}
          </div>
          {/* Comments count */}
          {commentsCount > 0 && (
            <span
              style={{ cursor: 'pointer', color: '#595959', fontSize: '13px' }}
              onClick={() => setShowComments(v => !v)}
              onMouseOver={e => e.target.style.textDecoration = 'underline'}
              onMouseOut={e => e.target.style.textDecoration = 'none'}
            >
              {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* ── Action bar ────────────────────────────────────────────── */}
      {isAnnouncement ? (
        /* Announcement: Acknowledge */
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px',
          borderTop: '1px solid #eee9e0',
          background: isAcknowledged ? '#f0fdf4' : 'transparent',
          transition: 'background 0.3s',
        }}>
          <span style={{ fontSize: '13px', color: '#595959' }}>
            {ackCount > 0
              ? `✅ ${ackCount} ${ackCount === 1 ? 'person' : 'people'} acknowledged`
              : 'Be the first to acknowledge'}
          </span>
          <button
            onClick={handleAcknowledge}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 18px', borderRadius: '20px', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s', border: 'none',
              background: isAcknowledged ? '#057642' : '#0a66c2',
              color: '#fff', fontFamily: 'var(--li-font)',
              boxShadow: isAcknowledged ? '0 2px 8px rgba(5,118,66,0.3)' : '0 2px 8px rgba(10,102,194,0.25)',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            <CheckCircle size={15} />
            {isAcknowledged ? 'Acknowledged ✓' : 'Acknowledge'}
          </button>
        </div>
      ) : isBroadcast ? (
        /* Broadcast: React + Reply pills */
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #eee9e0' }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
              border: `1.5px solid ${isLiked ? '#0a66c2' : '#c9c4bd'}`,
              background: isLiked ? '#e8f0fb' : '#fff',
              color: isLiked ? '#0a66c2' : '#595959',
              transition: 'all 0.2s', fontFamily: 'var(--li-font)',
            }}
          >
            <ThumbsUp size={15} fill={isLiked ? 'currentColor' : 'none'} />
            {likesCount > 0 ? `${likesCount} React${likesCount !== 1 ? 'ions' : 'ion'}` : 'React'}
          </button>
          <button
            onClick={() => setShowComments(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
              border: '1.5px solid #c9c4bd', background: '#fff', color: '#595959',
              transition: 'all 0.2s', fontFamily: 'var(--li-font)',
            }}
          >
            <MessageSquare size={15} />
            {commentsCount > 0 ? `${commentsCount} Repl${commentsCount !== 1 ? 'ies' : 'y'}` : 'Reply'}
          </button>
        </div>
      ) : (
        /* Standard post: Like / Comment / Repost / Save */
        <div style={{ position: 'relative', borderTop: '1px solid #eee9e0' }}>

          {/* ── Reactions popover ───────────────────────────────── */}
          {showReactions && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 4px)',
                left: '12px',
                zIndex: 100,
                background: '#fff',
                border: '1px solid #e0ddd6',
                borderRadius: '40px',
                padding: '10px 20px',
                display: 'flex',
                gap: '18px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                animation: 'reactionPopIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => { clearTimeout(reactionTimer.current); setTimeout(() => setShowReactions(false), 200); }}
            >
              <style>{`
                @keyframes reactionPopIn {
                  from { opacity: 0; transform: scale(0.6) translateY(10px); }
                  to   { opacity: 1; transform: scale(1) translateY(0); }
                }
              `}</style>
              {REACTIONS.map((r, i) => (
                <div
                  key={r.emoji}
                  onClick={handleLike}
                  title={r.label}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '4px', cursor: 'pointer',
                    animation: `reactionPopIn ${0.1 + i * 0.035}s cubic-bezier(0.34,1.56,0.64,1) forwards`,
                  }}
                >
                  <span
                    style={{ fontSize: '28px', transition: 'transform 0.15s', display: 'block', lineHeight: 1 }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.5) translateY(-6px)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >{r.emoji}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#595959', fontFamily: 'var(--li-font)', whiteSpace: 'nowrap' }}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────────── */}
          <div style={{ display: 'flex' }}>
            {[
              {
                id: 'like',
                label: isLiked ? 'Liked' : 'Like',
                icon: ThumbsUp,
                active: isLiked,
                activeColor: '#0a66c2',
                onClick: handleLike,
                disabled: isLiking,
                iconFill: isLiked,
              },
              {
                id: 'comment',
                label: 'Comment',
                icon: MessageSquare,
                active: showComments,
                activeColor: '#0a66c2',
                onClick: () => setShowComments(v => !v),
              },
              {
                id: 'repost',
                label: isReposted ? 'Unrepost' : 'Repost',
                icon: Repeat2,
                count: repostCount || null,
                active: isReposted,
                activeColor: '#057642',
                onClick: handleRepost,
              },
              {
                id: 'share',
                label: 'Share',
                icon: Share2,
                active: false,
                activeColor: '#595959',
                onClick: () => setIsShareModalOpen(true),
              },
            ].map((btn, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', margin: '2px' }}>
                <button
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '11px 4px',
                    background: 'transparent', border: 'none',
                    borderRadius: btn.id === 'like' ? '4px 0 0 4px' : '4px',
                    fontSize: '14px', fontWeight: 600,
                    cursor: btn.disabled ? 'not-allowed' : 'pointer',
                    color: btn.active ? btn.activeColor : '#595959',
                    transition: 'background 0.15s, color 0.15s',
                    fontFamily: 'var(--li-font)',
                  }}
                  onMouseOver={e => {
                    if (!btn.disabled) e.currentTarget.style.background = '#f3f2ef';
                    if (!btn.active && !btn.disabled) e.currentTarget.style.color = '#1a1a1a';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = btn.active ? btn.activeColor : '#595959';
                  }}
                >
                  <btn.icon
                    size={19}
                    fill={btn.iconFill ? 'currentColor' : 'none'}
                    strokeWidth={btn.active && btn.label !== 'Save' ? 2.5 : 2}
                  />
                  {btn.label}
                  {btn.count > 0 && (
                    <span style={{ fontSize: '12px', fontWeight: 700, marginLeft: '2px' }}>
                      {btn.count}
                    </span>
                  )}
                </button>

                {btn.id === 'like' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactions(v => !v);
                    }}
                    disabled={btn.disabled}
                    title="More reactions"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 8px',
                      background: 'transparent', border: 'none',
                      borderRadius: '0 4px 4px 0',
                      cursor: btn.disabled ? 'not-allowed' : 'pointer',
                      color: btn.active ? btn.activeColor : '#595959',
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={e => {
                      if (!btn.disabled) e.currentTarget.style.background = '#e0e0e0';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>▼</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ── Comments section ─────────────────────────────────────── */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments}
          onCommentAdded={() => setCommentsCount(n => n + 1)}
          onCommentDeleted={() => setCommentsCount(n => n - 1)}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        authorName={post.author?.name || post.author?.username || 'Employee'}
        postUrl={`${window.location.origin}/feed?postId=${post._id || post.id}`}
        postText={post.text || post.content}
      />
    </article>
  );
};

export default PostCard;
