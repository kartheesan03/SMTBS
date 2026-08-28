const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const OCRDocumentSequelize = sequelize.define('OCRDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    originalFilename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    documentUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Uploaded', 'Processing', 'Completed', 'Needs Review', 'Failed', 'Verified'),
        defaultValue: 'Uploaded'
    },
    confidence: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    fields: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    items: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    processingDurationMs: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    errorMessage: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    pageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    history: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    rawText: {
        type: DataTypes.TEXT,
        defaultValue: ''
    }
}, {
    timestamps: true
});

const OCRDocument = makeBridgedModel('OCRDocument', OCRDocumentSequelize);
module.exports = OCRDocument;
