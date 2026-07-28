import axios from 'axios';

const AI_API_URL = 'http://localhost:8001/api/ai';

export const extractAIData = async (text, ocrDocumentId = null) => {
    const response = await axios.post(`${AI_API_URL}/extract`, {
        text: text,
        ocr_document_id: ocrDocumentId
    });
    return response.data;
};

export const validateAIData = async (jsonData) => {
    const response = await axios.post(`${AI_API_URL}/validate`, jsonData);
    return response.data;
};

export const getAIHistory = async () => {
    const response = await axios.get(`${AI_API_URL}/history`);
    return response.data;
};

export const approveAIExtraction = async (id, updatedJson) => {
    const response = await axios.put(`${AI_API_URL}/${id}/approve`, updatedJson);
    return response.data;
};

export const deleteAIExtraction = async (id) => {
    const response = await axios.delete(`${AI_API_URL}/${id}`);
    return response.data;
};
