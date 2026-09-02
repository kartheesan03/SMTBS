const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const OCRDocumentSequelize = sequelize.define('OCRDocument', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // ─── File Info ────────────────────────────────────────────────────────────
  originalFileName: { type: DataTypes.STRING, allowNull: true },
  fileSize:         { type: DataTypes.INTEGER, allowNull: true },
  mimeType:         { type: DataTypes.STRING, allowNull: true },
  pageCount:        { type: DataTypes.INTEGER, defaultValue: 1 },

  // ─── Image Paths ──────────────────────────────────────────────────────────
  originalImagePath:  { type: DataTypes.STRING, allowNull: true },
  processedImagePath: { type: DataTypes.STRING, allowNull: true },

  // ─── Document Classification ──────────────────────────────────────────────
  documentType: {
    type: DataTypes.STRING,
    defaultValue: 'General',
  },

  // ─── Raw OCR (immutable — never overwritten after first extraction) ────────
  originalOcrData: { type: DataTypes.JSON, allowNull: true },

  // ─── Structured Invoice Blocks ────────────────────────────────────────────
  vendorInfo:   { type: DataTypes.JSON, allowNull: true },   // name, address, gstin, phone, email
  invoiceInfo:  { type: DataTypes.JSON, allowNull: true },   // number, date, due_date, po_number, currency
  customerInfo: { type: DataTypes.JSON, allowNull: true },   // name, billing_address, shipping_address, gstin
  lineItems:    { type: DataTypes.JSON, allowNull: true },   // { columns: [], rows: [] }
  totalsBlock:  { type: DataTypes.JSON, allowNull: true },   // subtotal, cgst, sgst, igst, discount, grand_total

  // ─── Raw key-value pairs (fallback for non-invoice documents) ─────────────
  rawFields:    { type: DataTypes.JSON, allowNull: true },   // [{ label, value, confidence }]

  // ─── Legacy / backward-compat extracted data ──────────────────────────────
  extractedData: { type: DataTypes.JSON, allowNull: true },

  // ─── Corrected/Verified Data (written by Admin edits, original preserved) ─
  correctedData: { type: DataTypes.JSON, allowNull: true },

  // ─── Confidence ───────────────────────────────────────────────────────────
  confidenceScore:  { type: DataTypes.FLOAT, defaultValue: 0 },
  fieldConfidence:  { type: DataTypes.JSON, allowNull: true },  // per-field scores

  // ─── Validation ───────────────────────────────────────────────────────────
  validationResult: { type: DataTypes.JSON, allowNull: true },
  // { math_valid, issues: [], duplicate_check: {found, ref}, po_match: {status, details} }

  // ─── Duplicate Detection ──────────────────────────────────────────────────
  documentFingerprint: { type: DataTypes.STRING, allowNull: true },
  isDuplicate:         { type: DataTypes.BOOLEAN, defaultValue: false },
  duplicateOf:         { type: DataTypes.UUID, allowNull: true },

  // ─── Workflow Status ──────────────────────────────────────────────────────
  processingStatus: {
    type: DataTypes.ENUM(
      'Pending',
      'Processing',
      'OCR_Completed',
      'Completed',           // legacy value — kept for backward compat
      'Needs_Verification',
      'Validated',
      'Ready_For_Approval',
      'Approved',
      'Rejected',
      'Duplicate',
      'Failed'
    ),
    defaultValue: 'Pending',
  },

  // ─── Approval ─────────────────────────────────────────────────────────────
  approvalStatus: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending',
  },
  rejectionReason: { type: DataTypes.TEXT, allowNull: true },

  // ─── Audit Log (JSON array of timestamped events) ─────────────────────────
  auditLog: { type: DataTypes.JSON, defaultValue: [] },

  // ─── Users ────────────────────────────────────────────────────────────────
  createdBy:  { type: DataTypes.INTEGER, allowNull: true },
  updatedBy:  { type: DataTypes.INTEGER, allowNull: true },
  approvedBy: { type: DataTypes.INTEGER, allowNull: true },

}, {
  timestamps: true,
  tableName: 'OCRDocuments',
  indexes: [
    { fields: ['createdAt'] },
    { fields: ['processingStatus', 'createdAt'] },
    { fields: ['approvalStatus', 'createdAt'] }
  ]
});

const OCRDocument = makeBridgedModel('OCRDocument', OCRDocumentSequelize);
module.exports = OCRDocument;
