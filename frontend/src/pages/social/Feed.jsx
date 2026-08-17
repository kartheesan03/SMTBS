import React, { useState, useEffect } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import FeedProfileCard from './components/FeedProfileCard';
import FeedWidgets from './components/FeedWidgets';
import { getPosts } from '../../api/posts';
import { MessageSquarePlus } from 'lucide-react';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPosts = async (pageNum, append = false) => {
        try {
            setLoading(true);
            const data = await getPosts(pageNum, 10);
            console.log('GET /api/feed response:', data);
            
            if (append) {
                setPosts(prev => [...prev, ...data.posts]);
            } else {
                setPosts(data.posts);
            }
            
            setHasMore(pageNum < data.pages);
            setError(null);
        } catch (err) {
            console.error('Failed to load posts', err);
            setError('Failed to load the feed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(1);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadPosts(nextPage, true);
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
        setIsModalOpen(false);
    };

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    return (
        <div style={{ backgroundColor: 'var(--feed-bg-page)', minHeight: '100vh', paddingBottom: '24px', color: 'var(--feed-text-primary)', overflowX: 'hidden', transition: 'background-color 0.2s' }}>
            {/* Top Sticky Sub-Header */}
            <div style={{ 
                position: 'sticky', 
                top: '0', 
                backgroundColor: 'var(--feed-bg-card)', 
                borderBottom: '1px solid var(--feed-border-card)',
                zIndex: 40,
                marginBottom: '24px',
                transition: 'background-color 0.2s'
            }}>
                <div style={{ maxWidth: '1128px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '32px' }}>
                    {['Feed', 'My Posts', 'Saved', 'Analytics'].map((tab, idx) => (
                        <button 
                            key={tab}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                borderBottom: idx === 0 ? '2px solid var(--feed-accent-blue)' : '2px solid transparent',
                                color: idx === 0 ? 'var(--feed-accent-blue)' : 'var(--feed-text-muted)',
                                padding: '16px 0',
                                fontSize: '14px',
                                fontWeight: idx === 0 ? '600' : '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={idx !== 0 ? (e) => e.currentTarget.style.color = 'var(--feed-text-primary)' : undefined}
                            onMouseOut={idx !== 0 ? (e) => e.currentTarget.style.color = 'var(--feed-text-muted)' : undefined}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .feed-container {
                    max-width: 1128px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 225px minmax(0, 540px) 300px;
                    gap: 24px;
                    padding: 0 24px;
                    justify-content: center;
                    align-items: start;
                }
                .feed-left-col {
                    position: sticky;
                    top: 80px;
                }
                .feed-right-col {
                    position: sticky;
                    top: 80px;
                }
                @media (max-width: 1024px) {
                    .feed-container {
                        grid-template-columns: 225px minmax(0, 540px);
                    }
                    .feed-right-col {
                        display: none;
                    }
                }
                @media (max-width: 768px) {
                    .feed-container {
                        grid-template-columns: minmax(0, 100%);
                        padding: 0 16px;
                    }
                    .feed-left-col {
                        display: none;
                    }
                }
            `}</style>
            
            <div className="feed-container">
                {/* Left Column */}
                <div className="feed-left-col">
                    <FeedProfileCard />
                </div>

                {/* Center Column */}
                <div className="feed-center-col">
                    <CreatePost 
                        onPostCreated={handlePostCreated} 
                        isModalOpen={isModalOpen}
                        setIsModalOpen={setIsModalOpen}
                    />

                    {error && (
                        <div style={{ backgroundColor: '#7F1D1D', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    {/* Feed Filter Bar */}
                    {posts.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ width: '100px', height: '1px', backgroundColor: 'var(--feed-border-card)', marginRight: '8px' }}></span>
                                <span style={{ color: 'var(--feed-text-muted)', fontSize: '12px' }}>Sort by:</span>
                                <button style={{ background: 'none', border: 'none', color: 'var(--feed-text-primary)', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    Top <span style={{ marginLeft: '4px', fontSize: '10px' }}>▼</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                        ))}
                    </div>

                    {loading && posts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--feed-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <div className="loader" style={{ width: '32px', height: '32px', border: '3px solid var(--feed-border-card)', borderTopColor: 'var(--feed-accent-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span>Loading your feed...</span>
                        </div>
                    )}

                    {!loading && posts.length === 0 && !error && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px', 
                            color: 'var(--feed-text-muted)', 
                            backgroundColor: 'var(--feed-bg-card)', 
                            borderRadius: '8px', 
                            border: '1px solid var(--feed-border-card)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--feed-bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                <MessageSquarePlus size={48} color="var(--feed-accent-blue)" opacity={0.8} />
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--feed-text-primary)', fontSize: '20px', fontWeight: '600' }}>No posts yet</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '14px', maxWidth: '300px', lineHeight: '1.5', color: 'var(--feed-text-muted)' }}>Your feed is currently empty. Be the first to share an update, idea, or milestone with your network!</p>
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                style={{ 
                                    backgroundColor: 'var(--feed-accent-blue)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '10px 24px', 
                                    borderRadius: '24px', 
                                    fontWeight: '600', 
                                    fontSize: '15px', 
                                    cursor: 'pointer', 
                                    transition: 'all 0.2s',
                                }} 
                                onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; e.currentTarget.style.color = 'var(--feed-text-primary)'; }} 
                                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'var(--feed-accent-blue)'; e.currentTarget.style.color = 'white'; }}
                            >
                                Create the first post
                            </button>
                        </div>
                    )}

                    {hasMore && !loading && posts.length > 0 && (
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <button 
                                onClick={handleLoadMore}
                                style={{
                                    backgroundColor: 'transparent',
                                    color: 'var(--feed-accent-blue)',
                                    border: '1px solid var(--feed-accent-blue)',
                                    borderRadius: '20px',
                                    padding: '8px 24px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--feed-btn-hover)'; }}
                                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="feed-right-col">
                    <FeedWidgets />
                </div>
            </div>
        </div>
    );
};

export default Feed;
