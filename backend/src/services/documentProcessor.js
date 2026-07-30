const axios = require('axios');

const extractText = async (documentUrl, fileName) => {
    // In a full implementation, you would download the file and send it to the Python OCR service
    // For this demonstration, we'll assume the Python OCR service is running on a specific port
    // e.g. http://localhost:8000/ocr
    try {
        console.log(`Extracting text for ${fileName} via OCR...`);
        // const response = await axios.post('http://localhost:8000/ocr', { url: documentUrl });
        // return response.data.text;
        
        // Mock OCR response if service is not reachable
        return `Extracted text from ${fileName} ...`;
    } catch (error) {
        console.error('OCR Extraction Error:', error);
        throw new Error('Failed to extract text from document');
    }
};

module.exports = {
    extractText
};
