const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateInsights = async (userMessage, sqlData, role) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return "Insights cannot be generated (Gemini API key missing). Data: " + JSON.stringify(sqlData).substring(0, 500);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
        You are an enterprise AI assistant for a user with role: ${role}.
        The user asked: "${userMessage}"
        The database returned the following JSON data:
        ${JSON.stringify(sqlData).substring(0, 5000)} // truncate to avoid token limits

        Analyze the data and provide a concise, business-friendly response to the user.
        Do not mention SQL or databases. Answer the user directly based on the data provided.
        Format your response beautifully using Markdown if appropriate (tables, bold text, lists).
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Insights generation error:', error);
        return "I found some data, but I couldn't generate insights at this moment.";
    }
};

module.exports = {
    generateInsights
};
