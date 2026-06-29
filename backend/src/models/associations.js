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
const MaterialMovement = require('./MaterialMovement');
const CommunicationLog = require('./CommunicationLog');
const AuditLog = require('./AuditLog');
const Role = require('./Role');

function setupAssociations() {
    // 1. Employee -> User
    Employee.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userIdField', as: 'userId' });
    User.sequelizeModel.hasOne(Employee.sequelizeModel, { foreignKey: 'userIdField', as: 'employee' });


    // 3. Customer -> User
    Customer.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdByField', as: 'createdBy' });
    Customer.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    User.sequelizeModel.hasOne(Customer.sequelizeModel, { foreignKey: 'userId', as: 'customerProfile' });

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
    
    // Vendor -> User
    Vendor.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    User.sequelizeModel.hasOne(Vendor.sequelizeModel, { foreignKey: 'userId', as: 'vendorProfile' });

    // 13. MaterialMovement -> Material, User, Order
    MaterialMovement.sequelizeModel.belongsTo(Material.sequelizeModel, { foreignKey: 'materialId', as: 'material' });
    MaterialMovement.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'performedById', as: 'performedBy' });
    MaterialMovement.sequelizeModel.belongsTo(Order.sequelizeModel, { foreignKey: 'referenceOrderId', as: 'referenceOrder' });
    Material.sequelizeModel.hasMany(MaterialMovement.sequelizeModel, { foreignKey: 'materialId', as: 'movements' });

    // 14. CommunicationLog -> Customer, User
    CommunicationLog.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customerId', as: 'customer' });
    CommunicationLog.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdById', as: 'createdBy' });
    Customer.sequelizeModel.hasMany(CommunicationLog.sequelizeModel, { foreignKey: 'customerId', as: 'communications' });

    // 15. AuditLog -> User
    AuditLog.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });

    // 16. StockRequest associations
    const StockRequest = require('./StockRequest');
    StockRequest.sequelizeModel.belongsTo(Material.sequelizeModel, { foreignKey: 'materialId', as: 'material' });
    StockRequest.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });
    StockRequest.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'managerId', as: 'manager' });
    StockRequest.sequelizeModel.belongsTo(Order.sequelizeModel, { foreignKey: 'orderId', as: 'order' });
}

module.exports = setupAssociations;
