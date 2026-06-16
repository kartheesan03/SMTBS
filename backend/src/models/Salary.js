const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');

const SalarySequelize = sequelize.define('Salary', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.STRING,
        allowNull: false
    },
    basicSalary: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    allowances: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    deductions: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    netSalary: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Awaiting Approval', 'Approved', 'Paid'),
        defaultValue: 'Awaiting Approval'
    },
    paymentDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paidBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentDetails: {
        type: DataTypes.JSON,
        allowNull: true
    }
});

const Salary = makeBridgedModel('Salary', SalarySequelize);
module.exports = Salary;
