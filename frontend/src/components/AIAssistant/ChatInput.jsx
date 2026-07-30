import React, { useState, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() || attachment) {
            onSendMessage(text, attachment);
            setText('');
            setAttachment(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setAttachment(file);
    };

    return (
        <div className="ai-chat-input-container">
            {attachment && (
                <div className="ai-attachment-preview">
                    Attached: {attachment.name}
                    <button type="button" onClick={() => setAttachment(null)}>x</button>
                </div>
            )}
            <form className="ai-chat-form" onSubmit={handleSubmit}>
                <button 
                    type="button" 
                    className="ai-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                >
                    <Paperclip size={20} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                />
                
                <input 
                    type="text" 
                    className="ai-text-input" 
                    placeholder="Ask anything or upload a document..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={disabled}
                />
                
                <button 
                    type="submit" 
                    className="ai-send-btn"
                    disabled={disabled || (!text.trim() && !attachment)}
                >
                    <Send size={20} />
                </button>
            </form>
            <div className="ai-footer-note">AI can make mistakes. Verify important information.</div>
        </div>
    );
};

export default ChatInput;
