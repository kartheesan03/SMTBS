const sequelize = require('../../src/config/sequelize');

// Import all models to clear
const AIChatMessage = require('../../src/models/AIChatMessage');
const AIChatSession = require('../../src/models/AIChatSession');
const AICopilotLog = require('../../src/models/AICopilotLog');
const AuditLog = require('../../src/models/AuditLog');
const CommunicationLog = require('../../src/models/CommunicationLog');
const Event = require('../../src/models/Event');
const Follow = require('../../src/models/Follow');
const OCRDocument = require('../../src/models/OCRDocument');
const PostAcknowledgement = require('../../src/models/PostAcknowledgement');
const PurchaseRequest = require('../../src/models/PurchaseRequest');
const SavedPost = require('../../src/models/SavedPost');
const SocialComment = require('../../src/models/SocialComment');
const SocialConnection = require('../../src/models/SocialConnection');
const SocialMessage = require('../../src/models/SocialMessage');
const SocialPost = require('../../src/models/SocialPost');
const SocialReaction = require('../../src/models/SocialReaction');
const StockRequest = require('../../src/models/StockRequest');
const StoryView = require('../../src/models/StoryView');
const Task = require('../../src/models/Task');

const clearMockData = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to database...");

        // Disable foreign key checks for SQLite
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        // Models to clear
        const modelsToClear = [
            AIChatMessage, AIChatSession, AICopilotLog, AuditLog, CommunicationLog,
            Event, Follow, OCRDocument, PostAcknowledgement, PurchaseRequest,
            SavedPost, SocialComment, SocialConnection, SocialMessage, SocialPost,
            SocialReaction, StockRequest, StoryView, Task
        ];

        for (const Model of modelsToClear) {
            try {
                if (Model.deleteMany) {
                    await Model.deleteMany({});
                    console.log(`Cleared data for ${Model.modelName || 'Bridged Model'}`);
                } else if (Model.sequelizeModel) {
                    await Model.sequelizeModel.destroy({ where: {} });
                    console.log(`Cleared MySQL for ${Model.sequelizeModel.name}`);
                } else if (Model.destroy) {
                    await Model.destroy({ where: {} });
                    console.log(`Cleared raw model ${Model.name}`);
                }
            } catch (err) {
                console.error(`Error clearing model:`, err.message);
            }
        }

        // Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON;');

        console.log("Successfully cleared remaining non-HR data.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to clear data:", error);
        process.exit(1);
    }
};

clearMockData();
