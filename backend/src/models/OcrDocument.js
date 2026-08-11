const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const OcrDocumentSequelize = sequelize.define('OcrDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploaderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    module: {
        type: DataTypes.STRING,
        allowNull: true
    },
    documentType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tables: {
        type: DataTypes.JSON, // Stores multiple tables: { title, columns, rows }
        allowNull: false,
        defaultValue: []
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    rawText: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    confidence: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Extracted', 'Validated'),
        defaultValue: 'Extracted'
    }
});

const OcrDocument = makeBridgedModel('OcrDocument', OcrDocumentSequelize);
module.exports = OcrDocument;
