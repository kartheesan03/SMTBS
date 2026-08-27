const { Op } = require('sequelize');
const Salary = require('../../models/Salary').sequelizeModel;

const getPayrollDeclaration = {
    name: 'get_payroll',
    description: 'Get a summary or list of payroll and salaries. Can filter by department.',
    parameters: {
        type: 'OBJECT',
        properties: {
            department: {
                type: 'STRING',
                description: 'Filter by department name (e.g. "Production")',
            },
            limit: {
                type: 'INTEGER',
                description: 'Maximum number of items to return',
            }
        },
    },
};

const getPayroll = async (args, userContext) => {
    let whereClause = {};
    const limit = args.limit || 50;
    
    // The Salary model might need an include on Employee to filter by department
    const include = [{
        association: 'employee',
        where: args.department ? { department: { [Op.like]: `%${args.department}%` } } : {}
    }];

    const items = await Salary.findAll({ where: whereClause, include, limit });
    
    const rows = items.map(r => ({
        Employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName || ''}` : 'Unknown',
        Department: r.employee ? r.employee.department : '-',
        Month: r.month,
        Year: r.year,
        NetSalary: r.netSalary || 0,
        Status: r.status
    }));

    // Aggregate stats
    const totalPayroll = rows.reduce((acc, row) => acc + row.NetSalary, 0);

    if (args.action === 'count') {
        return {
            type: 'card',
            title: args.department ? `${args.department} Payroll` : 'Payroll Data',
            content: `Found ${items.length} salary records.`,
            stats: [
                { label: 'Total Records', value: items.length },
                { label: 'Total Amount', value: `₹${totalPayroll.toLocaleString()}` }
            ],
            reply: `Here is the payroll information.`
        };
    }

    return {
        type: 'table',
        title: args.department ? `${args.department} Payroll` : 'Payroll Data',
        summary: `Found ${items.length} salary records. Total Amount: ₹${totalPayroll.toLocaleString()}`,
        columns: ['Employee', 'Department', 'Month', 'Year', 'NetSalary', 'Status'],
        rows,
        reply: `Here is the payroll list.`
    };
};

module.exports = {
    getPayrollDeclaration,
    getPayroll
};
