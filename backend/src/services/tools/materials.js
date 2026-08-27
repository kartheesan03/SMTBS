const { Op } = require('sequelize');
const Material = require('../../models/Material').sequelizeModel;

const getMaterialConsumptionDeclaration = {
    name: 'get_material_consumption',
    description: 'Get material consumption data, optionally filtered by material name.',
    parameters: {
        type: 'OBJECT',
        properties: {
            materialName: {
                type: 'STRING',
                description: 'Specific material to show consumption for (e.g. "Steel")',
            }
        },
    },
};

const getMaterialConsumption = async (args, userContext) => {
    let whereClause = {};
    if (args.materialName) {
        whereClause.name = { [Op.like]: `%${args.materialName}%` };
    }

    const items = await Material.findAll({ where: whereClause, limit: 50 });
    
    // In a real ERP we'd sum up consumption from a transaction log.
    // For now we simulate it from current stock/properties or just return material list.
    const data = items.map(r => ({
        name: r.name,
        consumed: (r.quantity || 10) * 2 // dummy consumption
    }));

    return {
        type: 'chart',
        title: args.materialName ? `${args.materialName} Consumption` : 'Material Consumption',
        summary: `Consumption chart for materials.`,
        data: data,
        xAxisKey: 'name',
        bars: [{ key: 'consumed', color: '#10b981', name: 'Consumed Qty' }],
        reply: `Here is the material consumption chart.`
    };
};

module.exports = {
    getMaterialConsumptionDeclaration,
    getMaterialConsumption
};
