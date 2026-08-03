const { GoogleGenerativeAI } = require('@google/generative-ai');
const generateChartConfig = async (sqlData) => {
    if (!sqlData || sqlData.length < 2) return null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
        Given this JSON data from a database query:
        ${JSON.stringify(sqlData).substring(0, 1000)}
        Determine if this data is suitable for a chart. If yes, respond with a JSON object.
        If no, return an empty JSON object {}.
        Format: { "type": "bar|pie|line|area", "xAxisKey": "name_of_key_for_x", "yAxisKey": "name_of_key_for_y" }
        Output ONLY the JSON object.
    `;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/({[\s\S]*})/);
        if (jsonMatch) {
            const config = JSON.parse(jsonMatch[1]);
            if (config.type && config.xAxisKey && config.yAxisKey) {
                return {
                    config,
                    data: sqlData
                };
            }
        }
        return null;
    } catch (e) {
        console.warn('Chart config generation failed:', e);
        return null;
    }
};
module.exports = {
    generateChartConfig
};
