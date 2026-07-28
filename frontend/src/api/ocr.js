import axios from 'axios';

// Assuming FastAPI OCR service runs on port 8000
const OCR_API_URL = 'http://localhost:8000/api/ocr';

const ocrApi = axios.create({
    baseURL: OCR_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const uploadOCRDocument = async (file, documentType, uploadedBy) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType || 'General');
    if (uploadedBy) {
        formData.append('uploaded_by', uploadedBy);
    }

    const response = await ocrApi.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getOCRHistory = async () => {
    const response = await ocrApi.get('/history');
    return response.data;
};

export const getOCRDocument = async (id) => {
    const response = await ocrApi.get(`/${id}`);
    return response.data;
};

export const deleteOCRDocument = async (id) => {
    const response = await ocrApi.delete(`/${id}`);
    return response.data;
};
