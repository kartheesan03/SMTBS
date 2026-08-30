const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../backend/database.sqlite'),
    logging: false
});

const OCRDocument = sequelize.define('OCRDocument', {
    status: DataTypes.STRING,
    rawText: DataTypes.TEXT,
    processingLogs: DataTypes.JSON,
}, { tableName: 'ocr_documents' });

async function check() {
    try {
        const docs = await OCRDocument.findAll({ order: [['updatedAt', 'DESC']], limit: 1 });
        if (docs.length > 0) {
            console.log("Status:", docs[0].status);
            console.log("RawText:", docs[0].rawText);
            console.log("Logs:", JSON.stringify(docs[0].processingLogs, null, 2));
        } else {
            console.log("No docs found");
        }
    } catch (e) {
        console.error(e);
    }
}
check();
