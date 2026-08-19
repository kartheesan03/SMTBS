const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { makeBridgedModel } = require('../config/mongoose-bridge');
const { encrypt, decrypt } = require('../utils/cryptoUtils');

const EmployeeSequelize = sequelize.define('Employee', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userIdField: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    salary: {
        // Stored as encrypted string in DB; exposed as number to app
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const raw = this.getDataValue('salary');
            if (raw === null || raw === undefined) return null;
            const decrypted = decrypt(String(raw));
            const num = parseFloat(decrypted);
            return isNaN(num) ? null : num;
        },
        set(value) {
            if (value === null || value === undefined || value === '') {
                this.setDataValue('salary', null);
            } else {
                this.setDataValue('salary', encrypt(String(value)));
            }
        }
    },
    joinDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const raw = this.getDataValue('contact');
            return raw ? decrypt(raw) : null;
        },
        set(value) {
            this.setDataValue('contact', value ? encrypt(value) : null);
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const raw = this.getDataValue('phone');
            return raw ? decrypt(raw) : null;
        },
        set(value) {
            this.setDataValue('phone', value ? encrypt(value) : null);
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

const Employee = makeBridgedModel('Employee', EmployeeSequelize);
module.exports = Employee;