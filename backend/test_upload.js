const fs = require('fs');
const ocrController = require('./src/controllers/ocrController');

async function testUpload() {
    const req = {
        file: {
            originalname: 'test.jpg',
            filename: 'test.jpg',
            path: 'test.jpg',
            mimetype: 'image/jpeg'
        },
        user: { id: 1 }
    };
    const res = {
        status: (code) => {
            console.log("Status:", code);
            return {
                json: (data) => console.log("JSON:", data)
            };
        }
    };

    // Bypass multer
    try {
        let pageCount = 1;
        const OCRDocument = require('./src/models/OcrDocument');
        const doc = await OCRDocument.create({
            fileName: req.file.originalname,
            fileUrl: `/uploads/ocr/${req.file.filename}`,
            status: 'Processing',
            uploadedBy: req.user ? req.user.id : null,
            pageCount: pageCount
        });
        console.log("Created successfully:", doc.id);
    } catch (err) {
        console.error("CREATE ERROR:", err);
    }
    process.exit(0);
}
testUpload();
