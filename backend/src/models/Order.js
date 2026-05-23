const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    items: [{
        material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
        quantity: { type: Number, required: true },
        price: { type: Number }
    }],
    totalAmount: { type: Number },
    status: { 
        type: String, 
        enum: ['Awaiting Approval', 'Approved', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    type: { type: String, enum: ['Purchase', 'Sales'], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
