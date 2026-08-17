import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Avatar from './Avatar';
import CreatePostModal from './CreatePostModal';
import { Image as ImageIcon, FileText, Calendar, AlignLeft } from 'lucide-react';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <>
            <div style={{ backgroundColor: '#1E293B', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', border: '1px solid #334155', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <Avatar user={user} size={48} />
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            flex: 1,
                            backgroundColor: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '24px',
                            padding: '0 20px',
                            color: '#94A3B8',
                            fontSize: '15px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0F172A'}
                    >
                        Start a post, {user?.name ? user.name.split(' ')[0] : ''}?
                    </button>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 8px' }}>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '10px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#E2E8F0'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <ImageIcon size={20} color="#3B82F6" /> Media
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '10px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#E2E8F0'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <FileText size={20} color="#F59E0B" /> Document
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '10px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#E2E8F0'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <Calendar size={20} color="#10B981" /> Event
                    </button>
                    <button onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '10px 8px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', transition: 'background-color 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#334155'; e.currentTarget.style.color = '#E2E8F0'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                        <AlignLeft size={20} color="#EF4444" /> Article
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
