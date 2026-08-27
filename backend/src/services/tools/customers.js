const Customer = require('../../models/Customer').sequelizeModel;

const getCustomersDeclaration = {
    name: 'get_customers',
    description: 'Get a list of customers.',
    parameters: {
        type: 'OBJECT',
        properties: {
            limit: {
                type: 'INTEGER',
                description: 'Maximum number of items to return',
            }
        },
    },
};

const { Op } = require('sequelize');

const getCustomers = async (args, userContext) => {
    let whereClause = {};
    const limit = args.limit || 50;
    let items = await Customer.findAll({ where: whereClause, limit });
    
    if (args.search) {
        const lowerSearch = args.search.toLowerCase();
        items = items.filter(r => {
            return (r.name && r.name.toLowerCase().includes(lowerSearch)) ||
                   (r.company && r.company.toLowerCase().includes(lowerSearch));
        });
    }

    if (args.status && args.status.toLowerCase() === 'active') {
        items = items.filter(r => r.status === 'Active');
    }
    
    if (args.action === 'count') {
        return {
            type: 'text',
            reply: `There are a total of ${items.length} customer(s).`
        };
    }

    const rows = items.map(r => ({
        Name: r.name,
        Company: r.company || '-',
        Email: r.email || '-',
        Phone: r.phone || '-',
        Status: r.status || '-'
    }));

    return {
        type: 'table',
        title: 'Customers',
        summary: `Found ${items.length} customers.`,
        columns: ['Name', 'Company', 'Email', 'Phone', 'Status'],
        rows,
        reply: `Here are the customers.`
    };
};

module.exports = {
    getCustomersDeclaration,
    getCustomers
};
