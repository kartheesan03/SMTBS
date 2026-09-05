const Order = require('../models/Order');
const OCRDocument = require('../models/OCRDocument');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Default to current year if not provided
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const isSpecificMonth = month && month !== 'All Months';
    const monthIndex = isSpecificMonth ?
      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month)
      : -1;

    // 1. Fetch Orders (Sales for Income, Purchase for Expense)
    const orders = await Order.find({
      status: { $nin: ['Cancelled', 'Rejected'] }
    }).populate('customer').populate('vendor');

    // 2. Fetch OCR Invoices
    const ocrDocs = await OCRDocument.find({
      documentType: 'Invoice',
      addedToExpense: true
    });

    let transactions = [];
    let dedupeKeys = new Set(); // To avoid double-counting OCR and PO

    // Process Orders
    for (const order of orders) {
      const type = (order.orderType || '').toLowerCase().includes('sales') ? 'Income' : 'Expense';

      const tDate = new Date(order.orderDate || order.createdAt);
      if (tDate.getFullYear() !== targetYear) continue;
      if (isSpecificMonth && tDate.getMonth() !== monthIndex) continue;

      const amount = Number(order.totalAmount) || Number(order.grandTotal) || 0;
      if (amount <= 0) continue;

      let vendorName = 'Unknown Vendor';
      if (type === 'Income' && order.customer) {
        vendorName = order.customer.company || order.customer.name || 'Unknown Vendor';
      } else if (type === 'Expense' && order.vendor) {
        vendorName = order.vendor.companyName || order.vendor.name || 'Unknown Vendor';
      }

      let category = 'General';
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        category = order.items[0].category || 'Material'; // Simple fallback
      }

      let paymentMethod = order.paymentTerms || 'Bank Transfer'; // Fallback if no payment method field

      const tx = {
        transactionId: `ORD-${order.id}`,
        type,
        transactionDate: tDate.toISOString(),
        amount,
        vendor: vendorName,
        category: category,
        paymentMethod: paymentMethod,
        status: order.paymentStatus || 'Pending',
        source: type === 'Income' ? 'Sales Order' : 'Purchase Order',
        purchaseOrderId: order.orderNumber,
        invoiceId: null,
        updatedByName: 'System'
      };

      if (type === 'Expense' && order.orderNumber) {
        dedupeKeys.add(order.orderNumber); // Store PO number for deduplication
      }

      transactions.push(tx);
    }

    // Process OCR Documents
    for (const doc of ocrDocs) {
      const invoiceInfo = doc.invoiceInfo || {};
      const totalsBlock = doc.totalsBlock || {};
      const vendorInfo = doc.vendorInfo || {};

      const amount = Number(totalsBlock.grand_total) || 0;
      if (amount <= 0) continue;

      const tDate = new Date(invoiceInfo.date || doc.createdAt);
      if (tDate.getFullYear() !== targetYear) continue;
      if (isSpecificMonth && tDate.getMonth() !== monthIndex) continue;

      const poNumber = invoiceInfo.po_number;

      // Deduplication: If this OCR invoice matches a Purchase Order we already counted, skip it as a duplicate expense.
      if (poNumber && dedupeKeys.has(poNumber)) {
        continue;
      }

      const tx = {
        transactionId: `OCR-${doc.id}`,
        type: 'Expense',
        transactionDate: tDate.toISOString(),
        amount,
        vendor: vendorInfo.name || 'Unknown Vendor',
        category: 'Extracted Invoice',
        paymentMethod: 'Standard',
        status: 'Pending', // Pending until paid
        source: 'OCR Invoice',
        purchaseOrderId: poNumber || null,
        invoiceId: invoiceInfo.number || null,
        updatedByName: 'OCR System'
      };

      transactions.push(tx);
    }

    // 3. Aggregate Data
    let totalIncome = 0;
    let totalExpense = 0;
    let pendingExpense = 0;
    let thisMonthExpense = 0;
    let previousMonthExpense = 0;

    const monthlyMap = {};
    const categoryMap = {};
    const paymentMap = {};
    const statusMap = {
      'Approved': { count: 0, amount: 0 },
      'Pending': { count: 0, amount: 0 },
      'Rejected': { count: 0, amount: 0 },
      'Draft': { count: 0, amount: 0 }
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    transactions.forEach(tx => {
      const txDate = new Date(tx.transactionDate);

      if (tx.type === 'Income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'Expense') {
        totalExpense += tx.amount;

        if (tx.status === 'Pending') {
          pendingExpense += tx.amount;
        }

        if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
          thisMonthExpense += tx.amount;
        } else if (txDate.getMonth() === prevMonth && txDate.getFullYear() === prevMonthYear) {
          previousMonthExpense += tx.amount;
        }

        // Category
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        // Payment
        paymentMap[tx.paymentMethod] = (paymentMap[tx.paymentMethod] || 0) + tx.amount;
        // Status
        const st = tx.status || 'Pending';
        if (!statusMap[st]) statusMap[st] = { count: 0, amount: 0 };
        statusMap[st].count += 1;
        statusMap[st].amount += tx.amount;
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mName = months[txDate.getMonth()];
      if (!monthlyMap[mName]) {
        monthlyMap[mName] = { month: mName, Income: 0, Expense: 0 };
      }
      monthlyMap[mName][tx.type] += tx.amount;
    });

    const netBalance = totalIncome - totalExpense;

    // Formatting monthly array for charts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = months.map(m => monthlyMap[m] || { month: m, Income: 0, Expense: 0 });

    const categories = Object.keys(categoryMap).map(name => ({ name, value: categoryMap[name] }));
    const paymentMethods = Object.keys(paymentMap).map(name => ({ name, value: paymentMap[name] }));
    const statuses = Object.keys(statusMap).map(name => ({ name, ...statusMap[name] })).filter(s => s.count > 0);
    let currentChronologicalBalance = 0; // Assuming 0 as opening balance for now
    transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
    transactions.forEach(tx => {
      tx.balanceBefore = currentChronologicalBalance;
      tx.signedAmount = tx.type === 'Income' ? tx.amount : -tx.amount;
      currentChronologicalBalance += tx.signedAmount;
      tx.balanceAfter = currentChronologicalBalance;
    });
    transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

    res.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        thisMonthExpense,
        previousMonthExpense,
        netBalance,
        pendingExpense,
        transactionCount: transactions.length
      },
      monthly,
      categories,
      paymentMethods,
      statuses,
      transactions: transactions
    });

  } catch (error) {
    console.error('[Expense Tracking] Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expense tracking data', error: error.message, stack: error.stack });
  }
};

exports.getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    let transaction = null;

    if (id.startsWith('ORD-')) {
      const orderId = id.split('ORD-')[1];
      const order = await Order.findById(orderId).populate('customer').populate('vendor');

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order transaction not found' });
      }

      const type = (order.orderType || '').toLowerCase().includes('sales') ? 'Income' : 'Expense';
      const amount = Number(order.totalAmount) || Number(order.grandTotal) || 0;

      let timeline = [];
      timeline.push({
        event: 'Order Created',
        timestamp: order.createdAt,
        user: 'System',
        state: 'Created'
      });

      if (order.trackingTimeline && Array.isArray(order.trackingTimeline)) {
        order.trackingTimeline.forEach(t => {
          timeline.push({
            event: t.status || t.event || 'Status Update',
            timestamp: t.timestamp || t.date || new Date(),
            user: t.user || 'System',
            state: t.status || 'Updated'
          });
        });
      }

      timeline.push({
        event: 'Current Status',
        timestamp: order.updatedAt,
        user: 'System',
        state: order.status
      });

      let vendorName = 'Unknown Vendor';
      if (type === 'Income' && order.customer) {
        vendorName = order.customer.company || order.customer.name || 'Unknown Vendor';
      } else if (type === 'Expense' && order.vendor) {
        vendorName = order.vendor.companyName || order.vendor.name || 'Unknown Vendor';
      }

      let category = 'General';
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        category = order.items[0].category || 'Material'; // Simple fallback
      }

      transaction = {
        transactionId: id,
        type,
        amount,
        transactionDate: order.orderDate || order.createdAt,
        status: order.paymentStatus || 'Pending',
        vendor: vendorName,
        category: category,
        source: type === 'Income' ? 'Sales Order' : 'Purchase Order',
        createdBy: 'System',
        updatedBy: 'System',
        reference: order.orderNumber,
        notes: order.notes || 'No description available',
        attachments: [],
        timeline: timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      };
    } else if (id.startsWith('OCR-')) {
      const ocrId = id.split('OCR-')[1];
      const doc = await OCRDocument.findById(ocrId);

      if (!doc) {
        return res.status(404).json({ success: false, message: 'OCR transaction not found' });
      }

      const invoiceInfo = doc.invoiceInfo || {};
      const totalsBlock = doc.totalsBlock || {};
      const vendorInfo = doc.vendorInfo || {};

      const amount = Number(totalsBlock.grand_total) || 0;

      let timeline = [];
      timeline.push({
        event: 'Document Uploaded',
        timestamp: doc.createdAt,
        user: doc.createdBy ? `User ${doc.createdBy}` : 'System',
        state: 'Uploaded'
      });

      if (doc.auditLog && Array.isArray(doc.auditLog)) {
        doc.auditLog.forEach(log => {
          timeline.push({
            event: log.action || log.event || 'Update',
            timestamp: log.timestamp || new Date(),
            user: log.user || 'System',
            state: log.status || 'Processed'
          });
        });
      }

      timeline.push({
        event: 'Current Status',
        timestamp: doc.updatedAt,
        user: doc.updatedBy ? `User ${doc.updatedBy}` : 'System',
        state: doc.processingStatus
      });

      transaction = {
        transactionId: id,
        type: 'Expense',
        amount,
        transactionDate: invoiceInfo.date || doc.createdAt,
        status: 'Pending',
        vendor: vendorInfo.name || 'Unknown Vendor',
        category: 'Extracted Invoice',
        source: 'OCR Invoice',
        createdBy: doc.createdBy ? `User ${doc.createdBy}` : 'System',
        updatedBy: doc.updatedBy ? `User ${doc.updatedBy}` : 'System',
        reference: invoiceInfo.po_number || invoiceInfo.number || doc.id,
        notes: 'Extracted via OCR',
        attachments: doc.originalImagePath ? [doc.originalImagePath] : [],
        timeline: timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID format' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('[Expense Tracking] Get transaction details error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching transaction details', error: error.message });
  }
};
