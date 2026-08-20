import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

// Get base URL just like the other API files
let apiBaseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://smtbs-backend.onrender.com/api';

const renderText = (text) => {
    if (!text) return null;
    
    // Split by bold markdown **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={index} style={{ color: '#1e293b' }}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
};

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
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f0f2f5' }}>
            {/* Top Navigation Bar */}
            <div className="main-header" style={{ background: '#0a3d62', color: '#fff', height: '64px', width: '100%', display: 'flex' }}>
                <div className="header-inner" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '4px', display: 'inline-block' }}></div>
                        SMTBMS Network
                    </h1>
                    <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #fff', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                        Sign In
                    </Link>
                </div>
            </div>

            <div className="public-post-page" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 24px', boxSizing: 'border-box' }}>
                <div className="public-post-card" style={{ width: '650px', maxWidth: '100%', margin: '0 auto', background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ 
                            width: '56px', height: '56px', borderRadius: '50%', background: '#0a3d62', 
                            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'
                        }}>
                            {post.author?.picture ? (
                                <img src={post.author.picture} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                post.author?.name ? post.author.name.charAt(0) : 'U'
                            )}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>{post.author?.name || 'Unknown User'}</h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>{post.author?.role || 'Employee'}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: '1.5rem', color: '#334155', lineHeight: '1.6', fontSize: '1rem' }}>
                        {post.text && <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{renderText(post.text)}</p>}
                    </div>
                    {post.imageUrl && (
                        <div style={{ margin: '0 -2rem', marginBottom: '1.5rem' }}>
                            <img src={post.imageUrl} alt="Post attachment" style={{ width: '100%', display: 'block', maxHeight: '550px', objectFit: 'cover' }} />
                        </div>
                    )}
                    
                    {/* Metrics */}
                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <span>❤️ {post.likes?.length || 0} Likes</span>
                        <span>💬 {post.comments?.length || 0} Comments</span>
                    </div>

                    {/* CTA */}
                    <div style={{ marginTop: '2rem', textAlign: 'center', background: '#f8fafc', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: '0 0 1rem 0', color: '#0f172a', fontWeight: '600', fontSize: '1.1rem' }}>Want to interact with this post?</p>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>Join the SMTBMS platform to connect, comment, and engage.</p>
                        <Link to="/login" style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#0a3d62', color: '#fff', borderRadius: '25px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.2s' }}>
                            Sign In or Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicPostView;
