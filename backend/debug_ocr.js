const { sequelizeModel: OCRDocument } = require('./src/models/OcrDocument');
const ocrController = require('./src/controllers/ocrController');

async function run() {
    const doc = await OCRDocument.findOne({ order: [['createdAt', 'DESC']] });
    if (!doc) {
        console.log("No doc!"); return;
    }
    console.log("Doc ID:", doc.id);
    console.log("FileUrl:", doc.fileUrl);
    
    // Test if we can read the file
    const fs = require('fs');
    if (!fs.existsSync(doc.fileUrl)) {
        console.log("FILE DOES NOT EXIST:", doc.fileUrl);
        // Wait, did the frontend send it as a relative URL?
    } else {
        console.log("File exists! Size:", fs.statSync(doc.fileUrl).size);
    }

    try {
        await ocrController.processOCRDocument(doc.id, doc.fileUrl);
        console.log("Process complete!");
        const updated = await OCRDocument.findByPk(doc.id);
        console.log("Final status:", updated.status);
        console.log("Logs:", updated.processingLogs);
    } catch(e) {
        console.error("Caught error:", e);
    }
}
run();
