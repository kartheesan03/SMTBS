const { Op } = require('sequelize');
const sequelize = require('../../config/sequelize');
const Material = require('../../models/Material').sequelizeModel;

// Gemini function declaration schema
const getInventoryDeclaration = {
    name: 'get_inventory',
    description: 'Get a summary or list of inventory items. Supports filtering by low stock.',
    parameters: {
        type: 'OBJECT',
        properties: {
            filter: {
                type: 'STRING',
                description: 'Filter type. Can be "low_stock", "all"',
            },
            action: {
                type: 'STRING',
                description: 'Set to "count" to return only the number of items.',
            },
            limit: {
                type: 'INTEGER',
                description: 'Maximum number of items to return',
            }
        },
    },
};

const getInventory = async (args, userContext) => {
    // Authorization Check: userContext should have required roles
    // In a real implementation, we'd check `userContext.role` against a permission matrix.
    
    let whereClause = {};
    const limit = args.limit || 50;
    
    if (args.filter === 'low_stock') {
        whereClause.quantity = { [Op.lte]: sequelize.col('lowStockThreshold') };
    }

    const items = await Material.findAll({ where: whereClause, limit });
    
    const rows = items.map(r => ({
        Name: r.name,
        Category: r.category || '-',
        Quantity: r.quantity,
        Status: r.status
    }));

    if (args.action === 'count') {
        return {
            type: 'stats',
            reply: `Here is the total number of items in inventory.`,
            stats: [
                {
                    label: args.filter === 'low_stock' ? 'Low Stock Items' : 'Total Materials',
                    value: items.length.toString()
                }
            ]
        };
    }

    const type = args.filter === 'low_stock' ? 'table' : 'table';
    const summaryMsg = args.filter === 'low_stock' 
        ? `${items.length} items require attention.` 
        : `Found ${items.length} inventory items.`;

    return {
        type,
        title: args.filter === 'low_stock' ? 'Low Stock Inventory' : 'Inventory',
        summary: summaryMsg,
        columns: ['Name', 'Category', 'Quantity', 'Status'],
        rows,
        reply: `Here is the inventory data.`
    };
};

module.exports = {
    getInventoryDeclaration,
    getInventory
};
