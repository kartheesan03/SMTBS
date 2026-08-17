import React, { useState, useEffect } from 'react';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import { getPosts } from '../../api/posts';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = async (pageNum, append = false) => {
        try {
            setLoading(true);
            const data = await getPosts(pageNum, 10);
            
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
    };

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    return (
        <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', padding: '24px', color: '#F8FAFC' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#F8FAFC' }}>Company Feed</h2>
                
                <CreatePost onPostCreated={handlePostCreated} />

                {error && (
                    <div style={{ backgroundColor: '#7F1D1D', color: '#FECACA', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                    ))}
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>
                        Loading posts...
                    </div>
                )}

                {!loading && posts.length === 0 && !error && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', backgroundColor: '#1E293B', borderRadius: '12px' }}>
                        No posts yet. Be the first to share something!
                    </div>
                )}

                {hasMore && !loading && (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <button 
                            onClick={handleLoadMore}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#3B82F6',
                                border: '1px solid #3B82F6',
                                borderRadius: '20px',
                                padding: '8px 24px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.backgroundColor = '#1E3A8A'; e.target.style.color = '#EFF6FF'; }}
                            onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#3B82F6'; }}
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feed;
