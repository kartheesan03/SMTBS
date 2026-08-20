import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

// Get base URL just like the other API files
let apiBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://smtbs-backend.onrender.com/api';

const PublicPostView = () => {
    const [searchParams] = useSearchParams();
    const postId = searchParams.get('postId');
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!postId) {
            setError(true);
            setLoading(false);
            return;
        }

        const fetchPost = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/feed/${postId}`);
                setPost(response.data);
            } catch (err) {
                console.error("Failed to fetch public post:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem', background: '#f8fafc' }}>
                <div className="loader"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem', background: '#f8fafc', color: '#333' }}>
                <h2>Post Not Found</h2>
                <p>This post may have been deleted or is unavailable.</p>
                <Link to="/login" style={{ padding: '0.5rem 1rem', background: '#0a3d62', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '600px', background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                        width: '48px', height: '48px', borderRadius: '50%', background: '#0a3d62', 
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                    }}>
                        {post.author?.picture ? (
                            <img src={post.author.picture} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            post.author?.name ? post.author.name.charAt(0) : 'U'
                        )}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{post.author?.name || 'Unknown User'}</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{post.author?.role || 'Employee'}</p>
                    </div>
                </div>

                {/* Content */}
                <div style={{ marginBottom: '1rem', color: '#334155', lineHeight: '1.5' }}>
                    {post.text && <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{post.text}</p>}
                </div>
                {post.imageUrl && (
                    <div style={{ margin: '0 -1.5rem', marginBottom: '1rem' }}>
                        <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
                    </div>
                )}
                
                {/* Metrics */}
                <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <span>{post.likes?.length || 0} Likes</span>
                </div>

                {/* CTA */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 1rem 0', color: '#475569', fontWeight: '500' }}>Join SMTBMS to connect, comment, and engage with this post!</p>
                    <Link to="/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#0a3d62', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                        Sign In / Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PublicPostView;
