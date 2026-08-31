const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { processDocumentWithGemini } = require('./src/services/geminiOcrService');

async function run() {
    try {
        const result = await processDocumentWithGemini('./uploads/ocr/document-1788010534668-891395976.jpeg');
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("TEST FAILED:", e.message);
    }
}
run();
