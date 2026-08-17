import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import CreatePostModal from './CreatePostModal';
import { Image as ImageIcon, FileText, Calendar, AlignLeft } from 'lucide-react';

const CreatePost = ({ onPostCreated, isModalOpen, setIsModalOpen }) => {
    const { user } = useContext(AuthContext);
    return (
        <>
            <div style={{ 
                background: 'linear-gradient(180deg, #1A2436 0%, #161F32 100%)', 
                borderRadius: '10px', 
                padding: '20px', 
                marginBottom: '24px', 
                border: '1px solid rgba(255, 255, 255, 0.06)', 
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
            }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <Avatar user={user} size={48} />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '24px',
                            padding: '0 20px',
                            color: '#94A3B8',
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#E2E8F0'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = '#94A3B8'; }}
                    >
                        Start a post, {user?.name ? user.name.split(' ')[0] : ''}?
                    </button>
                </div>
                
                <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)', marginBottom: '16px' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px 8px', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; }}>
                        <ImageIcon size={18} /> Media
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px 8px', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; }}>
                        <FileText size={18} /> Document
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px 8px', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; }}>
                        <Calendar size={18} /> Event
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px 8px', fontSize: '13px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.color = '#F8FAFC'; }} onMouseOut={(e) => { e.currentTarget.style.color = '#94A3B8'; }}>
                        <AlignLeft size={18} /> Article
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
