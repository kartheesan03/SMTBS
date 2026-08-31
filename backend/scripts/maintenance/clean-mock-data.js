const sequelize = require('../../src/config/sequelize');

// Import all models you want to clear
const Order = require('../../src/models/Order');
const Material = require('../../src/models/Material');
const MaterialMovement = require('../../src/models/MaterialMovement');
const Customer = require('../../src/models/Customer');
const Lead = require('../../src/models/Lead');
const Project = require('../../src/models/Project');
const Quotation = require('../../src/models/Quotation');
const Vendor = require('../../src/models/Vendor');
const Ticket = require('../../src/models/Ticket');
const TicketMessage = require('../../src/models/TicketMessage');
const Notification = require('../../src/models/Notification');
const News = require('../../src/models/News');
const Post = require('../../src/models/Post');
const PostLike = require('../../src/models/PostLike');
const PostComment = require('../../src/models/PostComment');
const PostRepost = require('../../src/models/PostRepost');

const clearMockData = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to database...");

        // Disable foreign key checks for SQLite
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        // Models to clear
        const modelsToClear = [
            Order, MaterialMovement, Material, Customer, Lead, Project, Quotation, Vendor, 
            TicketMessage, Ticket, Notification, News, PostLike, PostComment, PostRepost, Post
        ];

        for (const Model of modelsToClear) {
            try {
                if (Model.deleteMany) {
                    await Model.deleteMany({});
                    console.log(`Cleared data for ${Model.modelName || 'Bridged Model'}`);
                } else if (Model.sequelizeModel) {
                    await Model.sequelizeModel.destroy({ where: {} });
                    console.log(`Cleared MySQL for ${Model.sequelizeModel.name}`);
                } else {
                    await Model.destroy({ where: {} });
                    console.log(`Cleared raw model ${Model.name}`);
                }
            } catch (err) {
                console.error(`Error clearing model:`, err.message);
            }
        }

        // Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON;');

        console.log("Successfully cleared all mock data EXCEPT Employee data.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to clear data:", error);
        process.exit(1);
    }
};

clearMockData();
