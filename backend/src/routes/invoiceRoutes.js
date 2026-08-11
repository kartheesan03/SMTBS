const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// POST /api/invoices/from-ocr
router.post('/from-ocr', protect, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Manager') {
            return res.status(403).json({ message: "You have view-only access to this document. Contact an admin or manager to make changes." });
        }
        
        const { type, data } = req.body;
        
        // type is either "Purchase Invoice" or "Sales Invoice"
        const orderType = type === 'Purchase Invoice' ? 'purchase' : 'sales';
        
        // Map data.items to Order.items format
        const items = data.items.map(item => ({
            product: item.item,
            quantity: item.quantity,
            rate: item.unit_price,
            discount: item.discount,
            tax: item.tax_percent,
            amount: item.amount,
            hsn: item.hsn
        }));

        const newOrder = await Order.create({
            orderType: orderType,
            invoiceNumber: data.invoice.number,
            invoiceDate: data.invoice.date ? new Date(data.invoice.date) : new Date(),
            status: 'Invoice Generated',
            items: items,
            grandTotal: data.totals.grand_total,
            notes: `Extracted via OCR with confidence ${data.confidence.toFixed(2)}`
        });

        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error('Error saving OCR invoice:', error);
        res.status(500).json({ message: 'Failed to save invoice', error: error.message });
    }
});

module.exports = router;
