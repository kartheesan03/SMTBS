const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
    material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
        required: true
    },
    materialName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unitPrice: {
        type: Number,
        required: true
    },
    discountPercent: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    }
});

const quotationSchema = new mongoose.Schema({
    quotationNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    items: [quotationItemSchema],
    subTotal: {
        type: Number,
        required: true
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired', 'Converted'],
        default: 'Draft'
    },
    notes: {
        type: String
    },
    termsAndConditions: {
        type: String,
        default: 'Quotation valid until the specified date. All prices are final unless changed by mutual agreement.'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdByName: String,
    salesOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, {
    timestamps: true
});

// Calculate total before save
quotationSchema.pre('save', function (next) {
    if (this.isModified('items')) {
        this.subTotal = this.items.reduce((sum, item) => {
            const priceAfterDiscount = item.unitPrice * (1 - (item.discountPercent / 100));
            item.total = item.quantity * priceAfterDiscount;
            return sum + item.total;
        }, 0);
        this.grandTotal = this.subTotal + (this.taxAmount || 0);
    }
    next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);
module.exports = Quotation;
