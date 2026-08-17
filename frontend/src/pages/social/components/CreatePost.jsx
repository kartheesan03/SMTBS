import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import CreatePostModal from './CreatePostModal';
import { Image as ImageIcon, Video, Calendar, AlignLeft } from 'lucide-react';

const CreatePost = ({ onPostCreated, isModalOpen, setIsModalOpen }) => {
    const { user } = useContext(AuthContext);
    return (
        <>
            <div style={{ 
                backgroundColor: 'var(--feed-bg-card)',
                borderRadius: '8px', 
                padding: '12px 16px', 
                marginBottom: '16px', 
                border: '1px solid var(--feed-border-card)'
            }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <Avatar user={user} size={48} />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            border: '1px solid var(--feed-text-muted)',
                            borderRadius: '24px',
                            padding: '0 20px',
                            color: 'var(--feed-text-muted)',
                            fontSize: '14px',
                            fontWeight: '500',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            height: '48px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        Start a post, {user?.name ? user.name.split(' ')[0] : ''}?
                    </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--feed-text-muted)', cursor: 'pointer', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <Video size={20} color="#10B981" /> Video
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--feed-text-muted)', cursor: 'pointer', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <ImageIcon size={20} color="#3B82F6" /> Photo
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'none', border: 'none', color: 'var(--feed-text-muted)', cursor: 'pointer', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'background-color 0.2s' }} 
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--feed-btn-hover)'; }} 
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <AlignLeft size={20} color="#F59E0B" /> Write article
                    </button>
                </div>
            </div>

            <CreatePostModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onPostCreated={onPostCreated} 
            />
        </>
    );
};

export default CreatePost;
