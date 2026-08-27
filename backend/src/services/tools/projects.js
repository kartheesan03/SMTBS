const { Op } = require('sequelize');
const Project = require('../../models/Project').sequelizeModel;

const getProjectsDeclaration = {
    name: 'get_projects',
    description: 'Get a list of projects. Supports filtering by status.',
    parameters: {
        type: 'OBJECT',
        properties: {
            status: {
                type: 'STRING',
                description: 'Filter by project status (e.g., "Active", "In Progress", "Completed", "Delayed").',
            },
            action: {
                type: 'STRING',
                description: 'Set to "count" to return only the number of projects.',
            },
            limit: {
                type: 'INTEGER',
                description: 'Maximum number of items to return',
            }
        },
    },
};

const getProjects = async (args, userContext) => {
    let whereClause = {};
    const limit = args.limit || 50;
    
    if (args.status) {
        if (args.status.toLowerCase() === 'active') {
            whereClause.status = { [Op.in]: ['Planning', 'In Progress'] };
        } else {
            whereClause.status = { [Op.like]: `%${args.status}%` };
        }
    }

    const items = await Project.findAll({ where: whereClause, limit });
    
    if (args.action === 'count') {
        return {
            type: 'stats',
            reply: `Here is the total number of projects.`,
            stats: [
                {
                    label: args.status ? `${args.status.charAt(0).toUpperCase() + args.status.slice(1)} Projects` : 'Total Projects',
                    value: items.length.toString()
                }
            ]
        };
    }

    const rows = items.map(r => ({
        Name: r.name,
        Status: r.status,
        Progress: `${r.progress}%`,
        Manager: r.manager || '-',
        Priority: r.priority
    }));

    return {
        type: 'table',
        title: args.status ? `${args.status.charAt(0).toUpperCase() + args.status.slice(1)} Projects` : 'Projects',
        summary: `Found ${items.length} projects.`,
        columns: ['Name', 'Status', 'Progress', 'Manager', 'Priority'],
        rows,
        reply: `Here are the projects.`
    };
};

module.exports = {
    getProjectsDeclaration,
    getProjects
};
