const sequelize = require('./src/config/sequelize');
const OCRDocument = require('./src/models/OcrDocument');

async function test() {
    try {
        console.log("Checking if OCRDocuments table exists...");
        const count = await OCRDocument.count();
        console.log("Table exists, row count:", count);
    } catch (err) {
        console.error("Error:", err);
    }
    process.exit(0);
}
test();
