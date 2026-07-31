import React, { useState, useEffect } from 'react';
import { aiEngine } from '../utils/AIChatEngine';
import CommandCenter from '../components/AIChat/CommandCenter';
import './AIAssistant.css';

const AIAssistant = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);

    // Mock User
    const user = { role: 'Admin', id: 1 };

    const handleQuery = async (query) => {
        setIsProcessing(true);
        setResult(null);
        try {
            const response = await aiEngine.processMessage(query, { role: user.role });
            setResult(response);
        } catch (error) {
            setResult({ content: `Sorry, I encountered an error: ${error.message}` });
        } finally {
            setIsProcessing(false);
        }
    };

    // Keyboard shortcut (Cmd+K or Esc)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setResult(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="ai-workspace-container command-center-mode">
            {/* Ambient Background */}
            <div className="ambient-bg">
                <div className="ambient-blob blob-1"></div>
                <div className="ambient-blob blob-2"></div>
            </div>

            <CommandCenter 
                onQuery={handleQuery} 
                isProcessing={isProcessing} 
                result={result} 
                clearResult={() => setResult(null)} 
            />
        </div>
    );
};

export default AIAssistant;
