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
        type: DataTypes.ENUM('Pending Approval', 'Awaiting Approval', 'Approved', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Rejected', 'Cancelled', 'Awaiting Stock Check', 'Ready for Delivery', 'Low Stock Alert'),
        defaultValue: 'Pending Approval'
    },
    approvalStatus: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    deliveryStatus: {
        type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered'),
        defaultValue: 'Pending'
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
