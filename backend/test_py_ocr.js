const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testApi() {
    try {
        const form = new FormData();
        const filePath = path.join(__dirname, 'public/uploads/file-1788080916788-272969646.jpeg');
        form.append('file', fs.createReadStream(filePath));
        
        console.log("Sending to python OCR...");
        const response = await axios.post('http://127.0.0.1:8000/api/ocr', form, {
            headers: { ...form.getHeaders() }
        });
        console.log("RESULT:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}
testApi();
