const { OCRDocument } = require('./src/models');
const ocrController = require('./src/controllers/ocrController');

async function run() {
    const doc = await OCRDocument.findOne({ order: [['createdAt', 'DESC']] });
    if (!doc) {
        console.log("No document found");
        return;
    }
    console.log("Processing Document ID:", doc.id);
    console.log("File path:", doc.path);
    try {
        await ocrController.processOCRDocument(doc.id, doc.path);
        console.log("Done");
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
