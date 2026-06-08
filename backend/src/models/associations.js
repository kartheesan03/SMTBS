const User = require('./User');
const Employee = require('./Employee');
const Customer = require('./Customer');
const Vendor = require('./Vendor');
const Material = require('./Material');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Salary = require('./Salary');
const Order = require('./Order');
const Task = require('./Task');
const Ticket = require('./Ticket');
const Notification = require('./Notification');

function setupAssociations() {
    // 1. Employee -> User
    Employee.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userIdField', as: 'userId' });
    User.sequelizeModel.hasOne(Employee.sequelizeModel, { foreignKey: 'userIdField', as: 'employee' });


    // 3. Customer -> User
    Customer.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdByField', as: 'createdBy' });

    // 4. Attendance -> Employee
    Attendance.sequelizeModel.belongsTo(Employee.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });

    // 5. Leave -> Employee & User
    Leave.sequelizeModel.belongsTo(Employee.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });
    Leave.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'reviewedById', as: 'reviewedBy' });

    // 6. Salary -> Employee
    Salary.sequelizeModel.belongsTo(Employee.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });

    // 7. Order -> Customer, Vendor, Users
    Order.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customerId', as: 'Customer' });
    Order.sequelizeModel.belongsTo(Vendor.sequelizeModel, { foreignKey: 'vendorId', as: 'vendor' });
    Order.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdById', as: 'createdBy' });
    Order.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'updatedById', as: 'updatedBy' });

    // 8. Task -> User
    Task.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'assignedById', as: 'assignedBy' });


    // 10. Ticket -> Customer, User
    Ticket.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customerId', as: 'Customer' });
    Ticket.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'assignedToId', as: 'assignedTo' });

    // 11. Notification -> User
    Notification.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });

    // 12. Material -> Vendor
    Material.sequelizeModel.belongsTo(Vendor.sequelizeModel, { foreignKey: 'vendorId', as: 'vendor' });
    Vendor.sequelizeModel.hasMany(Material.sequelizeModel, { foreignKey: 'vendorId', as: 'materials' });
}

module.exports = setupAssociations;
