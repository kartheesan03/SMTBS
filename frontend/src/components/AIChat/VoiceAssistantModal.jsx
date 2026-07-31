import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Mic, Square, X } from 'lucide-react';

const VoiceAssistantModal = ({ isOpen, onClose, onQuerySubmit }) => {
    // States: idle, listening, processing, speaking
    const [voiceState, setVoiceState] = useState('idle');
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        if (isOpen) {
            startListening();
        } else {
            setVoiceState('idle');
            setTranscript('');
        }
    }, [isOpen]);

    const startListening = () => {
        setVoiceState('listening');
        setTranscript('Listening...');
        
        // Mocking speech recognition delay
        setTimeout(() => {
            setTranscript('Generate payroll report for July');
            setVoiceState('processing');
            
            // Mocking backend processing delay
            setTimeout(() => {
                setVoiceState('speaking');
                
                // Mocking speech playback end
                setTimeout(() => {
                    onQuerySubmit('Generate payroll report for July');
                    onClose();
                }, 2000);
            }, 1500);
        }, 3000);
    };

    const handleStop = () => {
        if (voiceState === 'listening' && transcript !== 'Listening...') {
            onQuerySubmit(transcript);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-gray-900/20 backdrop-blur-[2px]">
                <div className="bg-white rounded border border-[#EAEAEA] p-8 w-full max-w-sm flex flex-col items-center justify-center relative shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_10px_10px_-5px_rgba(0,0,0,0.02)]">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X size={16} />
                    </button>
                    
                    <div className="mb-8 h-24 flex items-center justify-center">
                        {voiceState === 'listening' ? (
                            <div className="flex gap-2 h-12 items-center">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="w-1.5 bg-blue-600 rounded-full h-8" />
                                ))}
                            </div>
                        ) : voiceState === 'processing' ? (
                            <div className="flex gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                                ))}
                            </div>
                        ) : voiceState === 'speaking' ? (
                            <div className="flex gap-2 h-12 items-center">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-2 bg-green-600 rounded-full h-6" />
                                ))}
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <Mic size={24} />
                            </div>
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {voiceState === 'idle' && 'Ready'}
                        {voiceState === 'listening' && 'Listening...'}
                        {voiceState === 'processing' && 'Thinking...'}
                        {voiceState === 'speaking' && 'Speaking...'}
                    </h3>

                    <div className="text-center min-h-[3rem] text-sm text-gray-600 mb-8 px-4 font-medium">
                        "{transcript}"
                    </div>

                    <button 
                        onClick={handleStop}
                        className="w-12 h-12 rounded bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                        <Square size={20} fill="currentColor" />
                    </button>
                    <span className="text-xs font-semibold text-gray-500 mt-2 uppercase tracking-wider">Stop</span>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default VoiceAssistantModal;
