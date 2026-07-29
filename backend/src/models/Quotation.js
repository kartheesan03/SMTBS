const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const QuotationSequelize = sequelize.define('Quotation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quotationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    customer: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: false
    },
    items: {
        type: DataTypes.JSON, 
        defaultValue: []
    },
    subTotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    taxAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    grandTotal: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Draft' 
    },
    notes: {
        type: DataTypes.TEXT
    },
    termsAndConditions: {
        type: DataTypes.TEXT,
        defaultValue: 'Quotation valid until the specified date. All prices are final unless changed by mutual agreement.'
    },
    createdBy: {
        type: DataTypes.INTEGER
    },
    createdByName: {
        type: DataTypes.STRING
    },
    salesOrderId: {
        type: DataTypes.INTEGER
    }
}, {
    hooks: {
        beforeSave: (instance) => {
            let items = instance.items || [];
            if (typeof items === 'string') {
                items = JSON.parse(items);
            }
            
            let subTotal = 0;
            items.forEach(item => {
                const priceAfterDiscount = item.unitPrice * (1 - ((item.discountPercent || 0) / 100));
                item.total = item.quantity * priceAfterDiscount;
                subTotal += item.total;
            });
            
            instance.items = items; 
            instance.subTotal = subTotal;
            instance.grandTotal = subTotal + (instance.taxAmount || 0);
        }
    }
});

const Quotation = makeBridgedModel('Quotation', QuotationSequelize);

module.exports = Quotation;
