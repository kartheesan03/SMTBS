const sequelize = require('./src/config/sequelize');
const { Op } = require('sequelize');

async function run() {
    const Order = sequelize.models.Order;
    if (!Order) {
        // Need to load models
        require('./src/models/associations');
    }
    
    try {
        const deleted = await sequelize.models.Order.destroy({
            where: {
                orderNumber: {
                    [Op.like]: 'PO-LY-%'
                }
            }
        });
        const deleted2 = await sequelize.models.Order.destroy({
            where: {
                orderNumber: {
                    [Op.like]: 'SO-LY-%'
                }
            }
        });
        const deleted3 = await sequelize.models.Order.destroy({
            where: {
                orderNumber: {
                    [Op.like]: 'PO-CY-%'
                }
            }
        });
        const deleted4 = await sequelize.models.Order.destroy({
            where: {
                orderNumber: {
                    [Op.like]: 'SO-CY-%'
                }
            }
        });
        console.log('Deleted historical orders:', deleted + deleted2 + deleted3 + deleted4);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
