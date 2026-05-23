const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true },
    category: { type: String },
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    unit: { type: String, default: 'pcs' },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['In Stock', 'Out of Stock', 'Low Stock'], default: 'In Stock' }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
