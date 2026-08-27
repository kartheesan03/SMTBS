const { Op } = require('sequelize');
const Employee = require('../../models/Employee').sequelizeModel;

const getEmployeesDeclaration = {
    name: 'get_employees',
    description: 'Get a list of employees. Supports filtering by department.',
    parameters: {
        type: 'OBJECT',
        properties: {
            department: {
                type: 'STRING',
                description: 'Filter by department name.',
            },
            limit: {
                type: 'INTEGER',
                description: 'Maximum number of items to return',
            }
        },
    },
};

const getEmployees = async (args, userContext) => {
    let whereClause = {};
    const limit = args.limit || 50;
    
    if (args.department) {
        whereClause.department = { [Op.like]: `%${args.department}%` };
    }

    let items = await Employee.findAll({ where: whereClause, limit });
    
    if (args.search) {
        const lowerSearch = args.search.toLowerCase();
        items = items.filter(r => {
            const fullName = `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase();
            return fullName.includes(lowerSearch) || 
                   (r.firstName && r.firstName.toLowerCase().includes(lowerSearch)) ||
                   (r.lastName && r.lastName.toLowerCase().includes(lowerSearch));
        });
    }
    
    if (args.action === 'count') {
        return {
            type: 'text',
            reply: `There are a total of ${items.length} employee(s)${args.department ? ` in the ${args.department} department` : ''}.`
        };
    }
    
    const rows = items.map(r => ({
        EmployeeID: r.employeeId,
        FirstName: r.firstName,
        LastName: r.lastName || '',
        Department: r.department || '-',
        Designation: r.designation || '-'
    }));

    return {
        type: 'table',
        title: args.department ? `${args.department} Employees` : 'Employees',
        summary: `Found ${items.length} employees.`,
        columns: ['EmployeeID', 'FirstName', 'LastName', 'Department', 'Designation'],
        rows,
        reply: `Here are the employees.`
    };
};

module.exports = {
    getEmployeesDeclaration,
    getEmployees
};
