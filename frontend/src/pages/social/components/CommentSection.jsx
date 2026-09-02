import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { addComment, deleteComment } from '../../../api/posts';
import { getRelativeTime } from '../../../utils/timeUtils';
import { Send, ThumbsUp, CornerDownRight, Trash2, MoreHorizontal, Smile } from 'lucide-react';
import '../CompanyFeed.css';

const AVATAR_COLORS = ['#0a3d62', '#4a5568', '#2f5233', '#7c2d3f', '#4338ca', '#b45309'];

const COMMON_EMOJIS = [
  '😀', '😂', '😅', '😊', '😍', '🥰', '😎', '🤔', '🙌', '👍',
  '👏', '🎉', '🔥', '💯', '✨', '🚀', '🤝', '💪', '🙏', '❤️'
];

function MiniAvatar({ name, color, size = 36 }) {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

const CommentSection = ({ postId, postAuthorId, comments = [], onCommentAdded, onCommentDeleted }) => {
  const { user } = useContext(AuthContext);
  const [text, setText]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const authorName     = user?.name || user?.username || 'You';
  const authorColor    = AVATAR_COLORS[0];

  // Close menu and emoji picker on outside click
  useEffect(() => {
    const fn = e => { 
      if (openMenuId) setOpenMenuId(null); 
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [openMenuId]);

  const insertEmoji = (emoji) => {
    setText(prev => prev + emoji);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await addComment(postId, text);
      setText('');
      setShowEmojiPicker(false);
      if (onCommentAdded) onCommentAdded(newComment);
    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      if (onCommentDeleted) onCommentDeleted(commentId);
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  return (
    <div style={{
      borderTop: '1px solid #eee9e0',
      background: '#f9f8f6',
    }}>
      {/* ── Comment Input ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', gap: '10px', alignItems: 'flex-start',
          padding: '16px 20px 12px',
        }}
      >
        <MiniAvatar name={authorName} color={authorColor} size={36} />
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'var(--li-card)', border: '1px solid var(--li-border)',
          borderRadius: '24px', padding: '8px 14px',
          gap: '8px', transition: 'border-color 0.2s',
          boxShadow: 'var(--li-shadow)',
          position: 'relative',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--li-text-3)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--li-border)'}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment…"
            disabled={submitting}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '14px', color: '#1a1a1a',
              background: 'transparent',
              fontFamily: 'var(--li-font)',
            }}
          />

          <div ref={emojiPickerRef} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                background: 'none', border: 'none', padding: '4px',
                cursor: 'pointer', color: 'var(--li-text-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--li-blue)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--li-text-2)'}
            >
              <Smile size={20} strokeWidth={2} />
            </button>

            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 14px)',
                right: '-10px',
                background: 'var(--li-card)',
                border: '1px solid var(--li-border)',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: 'var(--li-shadow-hover)',
                width: '260px',
                zIndex: 100,
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
                animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}>
                <style>{`
                  @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.9) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                  }
                `}</style>
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s, background 0.1s',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'var(--li-hover)';
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim() || submitting}
            title="Post comment"
            style={{
              background: text.trim() ? 'var(--li-blue)' : 'var(--li-border)',
              border: 'none', color: '#fff',
              width: 30, height: 30,
              borderRadius: '50%', cursor: text.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s, transform 0.15s',
            }}
            onMouseOver={e => { if (text.trim()) e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Send size={13} style={{ marginLeft: '-2px' }} />
          </button>
        </div>
      </form>

      {/* ── Comment Thread ─────────────────────────────────────── */}
      <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.slice(0, visibleCount).map((comment, idx) => {
          const name      = comment.author?.name || comment.author?.username || 'Unknown';
          const role      = comment.author?.role || comment.author?.department || 'Employee';
          const color     = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const timeStr   = comment.createdAt ? getRelativeTime(comment.createdAt) : 'Just now';
          const safeRole  = String(user?.role || '').toLowerCase().trim();
          const isOwner   = String(user?.id) === String(comment.author?.id) || String(user?._id) === String(comment.author?.id) || String(user?.id) === String(postAuthorId) || String(user?._id) === String(postAuthorId) || ['admin', 'super admin'].includes(safeRole);

          return (
            <div key={comment.id || idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <MiniAvatar name={name} color={color} size={36} />

              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Bubble */}
                <div style={{
                  background: 'var(--li-card)',
                  border: '1px solid var(--li-border)',
                  borderRadius: '0 12px 12px 12px',
                  padding: '12px 16px',
                  boxShadow: 'var(--li-shadow)',
                  position: 'relative',
                }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--li-text-1)', lineHeight: 1.2 }}>
                        {name}
                        {comment.author?.role === 'Admin' && (
                          <span style={{
                            background: '#fef3c7', color: '#b45309',
                            fontSize: '9px', fontWeight: 700, padding: '1px 5px',
                            borderRadius: '4px', marginLeft: '6px',
                            verticalAlign: 'middle',
                          }}>ADMIN</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--li-text-2)', marginTop: '2px', lineHeight: 1.2 }}>
                        {role}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--li-text-2)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {timeStr}
                        {isOwner && (
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === (comment.id || idx) ? null : (comment.id || idx)); }}
                              style={{
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                padding: '2px 4px', borderRadius: '50%', display: 'flex',
                                color: '#8c8c8c', transition: 'background 0.15s',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#f3f2ef'}
                              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {openMenuId === (comment.id || idx) && (
                              <div
                                onMouseDown={e => e.stopPropagation()}
                                style={{
                                  position: 'absolute', top: '100%', right: 0,
                                  background: 'var(--li-card)', border: '1px solid var(--li-border)',
                                  borderRadius: '8px', boxShadow: 'var(--li-shadow-hover)',
                                  minWidth: '140px', zIndex: 100, overflow: 'hidden', padding: '4px 0',
                                }}
                              >
                                <div
                                  onClick={() => { setOpenMenuId(null); handleDelete(comment.id); }}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '10px 14px', cursor: 'pointer',
                                    fontSize: '13px', fontWeight: 500, color: 'var(--li-red)',
                                    transition: 'background 0.12s',
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = 'var(--li-hover)'}
                                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <Trash2 size={13} /> Delete
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Comment text */}
                  <div style={{
                    fontSize: '14px', color: 'var(--li-text-1)',
                    lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                    marginTop: '8px'
                  }}>
                    {comment.text || comment.content}
                  </div>
                </div>

                {/* Action row below bubble */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', paddingLeft: '6px' }}>
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, color: 'var(--li-text-2)',
                    padding: '2px 0', fontFamily: 'var(--li-font)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'color 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--li-blue)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--li-text-2)'}
                  >
                    <ThumbsUp size={12} /> Like
                  </button>
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, color: 'var(--li-text-2)',
                    padding: '2px 0', fontFamily: 'var(--li-font)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    transition: 'color 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--li-blue)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--li-text-2)'}
                  >
                    <CornerDownRight size={12} /> Reply
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Load more */}
        {comments.length > visibleCount && (
          <div style={{
            textAlign: 'center', marginTop: '4px',
            borderTop: '1px solid var(--li-divider)', paddingTop: '16px'
          }}>
            <button
              onClick={() => setVisibleCount(prev => prev + 5)}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--li-text-2)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--li-font)',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--li-blue)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--li-text-2)'}
            >
              View {comments.length - visibleCount} more comment{comments.length - visibleCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* No comments state */}
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '12px 0 6px', fontSize: '13px', color: 'var(--li-text-3)' }}>
            Be the first to comment
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
