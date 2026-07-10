const Quotation = require('../models/Quotation');
const Order = require('../models/Order');

exports.createQuotation = async (req, res) => {
    try {
        const quotationCount = await Quotation.countDocuments();
        const quotationNumber = `QT-${new Date().getFullYear()}-${String(quotationCount + 1).padStart(4, '0')}`;
        
        const quotationData = {
            ...req.body,
            quotationNumber,
            createdBy: req.user.id,
            createdByName: req.user.name || req.user.email
        };

        const quotation = new Quotation(quotationData);
        await quotation.save();

        res.status(201).json(quotation);
    } catch (error) {
        console.error('Error creating quotation:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find().populate('customer').sort({ createdAt: -1 });
        res.status(200).json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate('customer').populate('items.material');
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
        res.status(200).json(quotation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
        res.status(200).json(quotation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
        res.status(200).json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.convertToOrder = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id).populate('customer');
        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

        if (quotation.status === 'Converted') {
            return res.status(400).json({ message: 'Quotation has already been converted to an order' });
        }

        const orderCount = await Order.countDocuments();
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`;

        const newOrderData = {
            orderNumber: orderNumber,
            customer: quotation.customer._id,
            customerName: quotation.customerName,
            orderDate: new Date(),
            orderType: 'sales',
            status: 'New',
            paymentStatus: 'Pending',
            items: quotation.items.map(item => ({
                material: item.material,
                materialName: item.materialName,
                quantity: item.quantity,
                price: item.unitPrice, 
                discount: item.discountPercent
            })),
            totalAmount: quotation.subTotal,
            taxAmount: quotation.taxAmount,
            grandTotal: quotation.grandTotal,
            notes: `Converted from Quotation ${quotation.quotationNumber}. ${quotation.notes || ''}`
        };

        const newOrder = new Order(newOrderData);
        
        // Add timeline
        newOrder.trackingTimeline = [{
            id: Date.now().toString(),
            status: 'New',
            location: 'System Generated',
            date: new Date().toISOString(),
            remarks: `Order generated from Quotation ${quotation.quotationNumber} by ${req.user.name || 'System'}`
        }];

        await newOrder.save();

        quotation.status = 'Converted';
        quotation.salesOrderId = newOrder._id;
        await quotation.save();

        res.status(200).json({ message: 'Quotation converted to Sales Order successfully', order: newOrder, quotation });
    } catch (error) {
        console.error('Error converting quotation:', error);
        res.status(500).json({ message: error.message });
    }
};
