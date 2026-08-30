const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

async function queryDB() {
    const sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, 'database.sqlite'),
        logging: false
    });

    const OCRDocument = sequelize.define('OCRDocument', {
        filename: { type: DataTypes.STRING },
        fileUrl: { type: DataTypes.STRING },
        category: { type: DataTypes.STRING },
        status: { type: DataTypes.STRING },
        rawText: { type: DataTypes.TEXT },
        confidence: { type: DataTypes.FLOAT },
        vendor: { type: DataTypes.STRING },
        date: { type: DataTypes.STRING },
        amount: { type: DataTypes.FLOAT },
        extractedFields: { type: DataTypes.JSON },
        documentQuality: { type: DataTypes.STRING },
        processingLogs: { type: DataTypes.JSON }
    });

    const docs = await OCRDocument.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5
    });

    docs.forEach(doc => {
        console.log(`\n--- ID: ${doc.id} | File: ${doc.filename} ---`);
        console.log(`Status: ${doc.status}`);
        console.log(`Vendor: ${doc.vendor}`);
        console.log(`Date: ${doc.date}`);
        console.log(`Amount: ${doc.amount}`);
        console.log(`Confidence: ${doc.confidence}`);
        console.log(`Extracted Fields: ${JSON.stringify(doc.extractedFields)}`);
    });
}
queryDB();
