const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const OrderSequelize = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    leadId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    customerModel: {
        type: DataTypes.ENUM('Customer', 'Lead'),
        defaultValue: 'Customer'
    },
    vendorId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    items: {
        type: DataTypes.JSON,
        allowNull: true
    },
    totalAmount: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('New', 'Order Created', 'Admin / Manager Review', 'Employee Verification', 'Inventory Verification', 'Purchase Required', 'Vendor Supply', 'Employee Final Approval', 'Sales Processing', 'Packing Completed', 'Ready For Dispatch', 'Out For Delivery', 'Delivered', 'Invoice Generated', 'Workflow Completed', 'Low Stock', 'Out Of Stock', 'Waiting for Manager', 'Vendor Accepted', 'Vendor Rejected', 'Material Received', 'Draft', 'Rejected', 'Cancelled', 'Created', 'Assigned to Employee', 'Material Confirmed', 'Ready for Delivery', 'On Hold', 'Pending Approval', 'Awaiting Approval', 'Approved', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Awaiting Stock Check', 'Low Stock Alert', 'Low Stock Hold', 'Manager/Admin Review', 'Inventory Verified', 'Purchase Completed', 'Inventory Updated', 'Packing'),
        defaultValue: 'Order Created'
    },
    approvalStatus: {
        type: DataTypes.ENUM('Pending', 'Pending Manager Approval', 'Manager Approved', 'Employee Approved', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    managerApproval: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    employeeApproval: {
        type: DataTypes.ENUM('Not Started', 'Pending', 'Approved', 'Rejected'),
        defaultValue: 'Not Started'
    },
    deliveryStatus: {
        type: DataTypes.ENUM('Not Started', 'Pending', 'Processing', 'Shipped', 'Delivered'),
        defaultValue: 'Pending'
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    liveLocation: {
        type: DataTypes.JSON, // { lat, lng, timestamp }
        allowNull: true
    },
    routePath: {
        type: DataTypes.JSON, // array of { lat, lng, timestamp }
        allowNull: true
    },
    deliveryETA: {
        type: DataTypes.DATE,
        allowNull: true
    },
    distanceRemaining: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    trackingStatus: {
        type: DataTypes.ENUM('Not Started', 'En Route', 'Delayed', 'Arrived', 'Delivered'),
        defaultValue: 'Not Started'
    },
    sourcedLocation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deliveryNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    holdReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approvedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    approvedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    orderDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    expectedDeliveryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    invoiceDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    invoiceDueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Overdue', 'Partially Paid'),
        defaultValue: 'Pending'
    },
    invoiceGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    orderType: {
        type: DataTypes.ENUM('purchase', 'sales'),
        allowNull: false
    },
    createdById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updatedById: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    grandTotal: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    trackingTimeline: {
        type: DataTypes.JSON,
        allowNull: true
    },
    workflow: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    hooks: {
        beforeValidate: (order) => {
            // Polymorphic resolution before save
            if (order.customer) {
                if (order.customerModel === 'Customer') {
                    order.customerId = order.customer;
                    order.leadId = null;
                } else if (order.customerModel === 'Lead') {
                    order.leadId = order.customer;
                    order.customerId = null;
                }
            }
        }
    }
});

const Order = makeBridgedModel('Order', OrderSequelize);
module.exports = Order;
