const axios = require('axios');
const extractText = async (documentUrl, fileName) => {
    try {
        console.log(`Extracting text for ${fileName} via OCR...`);
        // const response = await axios.post('http://localhost:8000/ocr', { url: documentUrl });
        // return response.data.text;
        return `Extracted text from ${fileName} ...`;
    } catch (error) {
        console.error('OCR Extraction Error:', error);
        throw new Error('Failed to extract text from document');
    }
};
module.exports = {
    extractText
};
