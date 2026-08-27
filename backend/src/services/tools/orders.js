const { Op } = require('sequelize');
const Order = require('../../models/Order').sequelizeModel;

const getOrdersDeclaration = {
    name: 'get_orders',
    description: 'Get a list of orders (sales or purchase). Supports filtering by type or status, or getting a count.',
    parameters: {
        type: 'OBJECT',
        properties: {
            type: {
                type: 'STRING',
                description: 'Order type: "sales" or "purchase".',
            },
            status: {
                type: 'STRING',
                description: 'Filter by order status (e.g. "Pending", "Approved", "Completed").',
            },
            action: {
                type: 'STRING',
                description: 'Set to "count" to return only the number of orders.',
            },
            limit: {
                type: 'INTEGER',
                description: 'Maximum number of items to return',
            }
        },
    },
};

const getOrders = async (args, userContext) => {
    let whereClause = {};
    const limit = args.limit || 50;
    
    if (args.type) {
        whereClause.orderType = { [Op.like]: `%${args.type}%` };
    }
    if (args.status) {
        whereClause.status = { [Op.like]: `%${args.status}%` };
    }

    const items = await Order.findAll({ where: whereClause, limit });
    
    if (args.action === 'count') {
        return {
            type: 'stats',
            reply: `Here is the total number of orders.`,
            stats: [
                {
                    label: args.type ? `${args.type.charAt(0).toUpperCase() + args.type.slice(1)} Orders` : 'Total Orders',
                    value: items.length.toString()
                }
            ]
        };
    }

    if (args.action === 'revenue') {
        const totalRevenue = items.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
        return {
            type: 'stats',
            reply: `Here is the total revenue.`,
            stats: [
                {
                    label: 'Total Revenue',
                    value: `₹${totalRevenue.toLocaleString()}`
                }
            ]
        };
    }

    const rows = items.map(r => ({
        OrderNumber: r.orderNumber || r.id,
        Type: r.orderType,
        Status: r.status,
        TotalAmount: r.totalAmount || 0,
        OrderDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'
    }));

    return {
        type: 'table',
        title: args.type ? `${args.type.charAt(0).toUpperCase() + args.type.slice(1)} Orders` : 'Orders',
        summary: `Found ${items.length} orders.`,
        columns: ['OrderNumber', 'Type', 'Status', 'TotalAmount', 'OrderDate'],
        rows,
        reply: `Here are the orders.`
    };
};

module.exports = {
    getOrdersDeclaration,
    getOrders
};
