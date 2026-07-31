import API from '../api/axios';

class AIChatEngine {
    constructor() {
        this.memory = [];
        this.workflowState = null;
    }

    async processMessage(userMessage, context) {
        const msg = userMessage.trim();
        
        let response = { content: "", metadata: {} };

        try {
            // Call the real backend API
            const res = await API.post('/ai/chat', {
                message: msg,
                sessionId: this.sessionId || context.sessionId || null,
                context: context
            });

            // The backend now returns { content, metadata, sessionId }
            response = res.data;
            
            // Store the sessionId for subsequent requests
            if (response.sessionId) {
                this.sessionId = response.sessionId;
            }
            
        } catch (error) {
            console.error("AI Assistant API Error:", error);
            response.content = "I encountered an error while connecting to the SMTBMS server. Please ensure the backend is running and try again.";
        }

        this.memory.push({ role: 'user', content: userMessage });
        this.memory.push({ role: 'ai', content: response.content || response.message, metadata: response.metadata || response.chartData });

        return response;
    }

    async triggerAction(actionId, data) {
        try {
            const res = await API.post('/ai/action', {
                actionData: { actionId, data },
                sessionId: null
            });
            return res.data;
        } catch (error) {
            console.error("Action Error:", error);
            return {
                content: "Failed to execute action due to a server error."
            };
        }
    }
}

export const aiEngine = new AIChatEngine();
