import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import CopilotDashboard from './CopilotDashboard';

const ChatWindow = ({ messages, onAction, onSuggestion, isTyping, context, roleCards }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div className="ai-chat-window" ref={scrollRef}>
            {messages.length === 0 ? (
                <CopilotDashboard onSuggestion={onSuggestion} context={context} roleCards={roleCards} />
            ) : (
                <div className="ai-message-list">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MessageBubble 
                                    message={msg} 
                                    onAction={onAction}
                                    isLast={idx === messages.length - 1}
                                    isTyping={isTyping}
                                />
                            </motion.div>
                        ))}
                        {isTyping && messages[messages.length - 1]?.role !== 'ai' && (
                            <motion.div 
                                className="ai-message-wrapper ai-role"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="ai-message-avatar">✨</div>
                                <div className="ai-message-content">
                                    <div className="ai-typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
