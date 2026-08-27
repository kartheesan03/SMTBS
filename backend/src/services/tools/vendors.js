const Vendor = require('../../models/Vendor').sequelizeModel;
const { Op } = require('sequelize');

const getVendorsDeclaration = {
    name: 'get_vendors',
    description: 'Get a list of vendors.',
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

const getVendors = async (args, userContext) => {
    let whereClause = {};
    const limit = args.limit || 50;
    
    let items = await Vendor.findAll({ where: whereClause, limit });
    
    if (args.search) {
        const lowerSearch = args.search.toLowerCase();
        items = items.filter(r => {
            return (r.name && r.name.toLowerCase().includes(lowerSearch)) ||
                   (r.company && r.company.toLowerCase().includes(lowerSearch)) ||
                   (r.contactPerson && r.contactPerson.toLowerCase().includes(lowerSearch));
        });
    }

    if (args.status && args.status.toLowerCase() === 'active') {
        items = items.filter(r => r.status === 'Active');
    }
    
    if (args.action === 'count') {
        return {
            type: 'text',
            reply: `There are a total of ${items.length} vendor(s).`
        };
    }

    const rows = items.map(r => ({
        Name: r.name || r.company || '-',
        ContactPerson: r.contactPerson || '-',
        Email: r.email || '-',
        Phone: r.phone || '-',
        Status: r.status || '-'
    }));

    return {
        type: 'table',
        title: 'Vendors',
        summary: `Found ${items.length} vendors.`,
        columns: ['Name', 'ContactPerson', 'Email', 'Phone', 'Status'],
        rows,
        reply: `Here are the vendors.`
    };
};

module.exports = {
    getVendorsDeclaration,
    getVendors
};
