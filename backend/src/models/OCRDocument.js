const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const OCRDocumentSequelize = sequelize.define('OCRDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  documentType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  originalImagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  processedImagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  extractedData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  confidenceScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  processingStatus: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Completed', 'Failed'),
    defaultValue: 'Pending',
  },
  approvalStatus: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'OCRDocuments'
});

const OCRDocument = makeBridgedModel('OCRDocument', OCRDocumentSequelize);
module.exports = OCRDocument;
