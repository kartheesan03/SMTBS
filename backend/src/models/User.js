const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const bcrypt = require('bcryptjs');
const { makeBridgedModel } = require('../config/mongoose-bridge');
const { encrypt, decrypt } = require('../utils/cryptoUtils');
const UserSequelize = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
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
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    picture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('Admin', 'HR', 'Manager', 'Employee', 'Sales', 'Customer', 'Vendor'),
        defaultValue: 'Employee'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    skills: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isProfileComplete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    provider: {
        type: DataTypes.STRING,
        defaultValue: 'local'
    }
}, {
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password') && user.password) {
                if (!user.password.startsWith('$2')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
});
UserSequelize.prototype.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};
const User = makeBridgedModel('User', UserSequelize);
module.exports = User;
