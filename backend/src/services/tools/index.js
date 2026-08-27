const { getInventoryDeclaration, getInventory } = require('./inventory');
const { getPayrollDeclaration, getPayroll } = require('./payroll');
const { getMaterialConsumptionDeclaration, getMaterialConsumption } = require('./materials');
const { getOrdersDeclaration, getOrders } = require('./orders');
const { getEmployeesDeclaration, getEmployees } = require('./employees');
const { getCustomersDeclaration, getCustomers } = require('./customers');
const { getProjectsDeclaration, getProjects } = require('./projects');
const { getVendorsDeclaration, getVendors } = require('./vendors');

const toolRegistry = {
    get_inventory: {
        declaration: getInventoryDeclaration,
        handler: getInventory
    },
    get_payroll: {
        declaration: getPayrollDeclaration,
        handler: getPayroll
    },
    get_material_consumption: {
        declaration: getMaterialConsumptionDeclaration,
        handler: getMaterialConsumption
    },
    get_orders: {
        declaration: getOrdersDeclaration,
        handler: getOrders
    },
    get_employees: {
        declaration: getEmployeesDeclaration,
        handler: getEmployees
    },
    get_customers: {
        declaration: getCustomersDeclaration,
        handler: getCustomers
    },
    get_projects: {
        declaration: getProjectsDeclaration,
        handler: getProjects
    },
    get_vendors: {
        declaration: getVendorsDeclaration,
        handler: getVendors
    }
};

const getToolDeclarations = () => {
    return Object.values(toolRegistry).map(t => t.declaration);
};

const executeTool = async (toolName, args, userContext) => {
    if (!toolRegistry[toolName]) {
        throw new Error(`Tool ${toolName} not found.`);
    }
    return await toolRegistry[toolName].handler(args, userContext);
};

module.exports = {
    toolRegistry,
    getToolDeclarations,
    executeTool
};
