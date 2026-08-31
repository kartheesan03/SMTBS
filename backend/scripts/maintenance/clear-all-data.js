const sequelize = require('../../src/config/sequelize');

// Remaining models not yet cleared
const Attendance = require('../../src/models/Attendance');
const Leave = require('../../src/models/Leave');
const Salary = require('../../src/models/Salary');
const Recruitment = require('../../src/models/Recruitment');
const Training = require('../../src/models/Training');
const Holiday = require('../../src/models/Holiday');
const Backup = require('../../src/models/Backup');
const BackupSchedule = require('../../src/models/BackupSchedule');
const RestoreLog = require('../../src/models/RestoreLog');
const SalesGoal = require('../../src/models/SalesGoal');

// Already cleared in previous runs but re-clearing for completeness
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
const PurchaseRequest = require('../../src/models/PurchaseRequest');
const StockRequest = require('../../src/models/StockRequest');
const Task = require('../../src/models/Task');
const Event = require('../../src/models/Event');
const Follow = require('../../src/models/Follow');
const SavedPost = require('../../src/models/SavedPost');
const SocialComment = require('../../src/models/SocialComment');
const SocialConnection = require('../../src/models/SocialConnection');
const SocialMessage = require('../../src/models/SocialMessage');
const SocialPost = require('../../src/models/SocialPost');
const SocialReaction = require('../../src/models/SocialReaction');
const OCRDocument = require('../../src/models/OCRDocument');
const AIChatMessage = require('../../src/models/AIChatMessage');
const AIChatSession = require('../../src/models/AIChatSession');
const AICopilotLog = require('../../src/models/AICopilotLog');
const AuditLog = require('../../src/models/AuditLog');
const CommunicationLog = require('../../src/models/CommunicationLog');
const PostAcknowledgement = require('../../src/models/PostAcknowledgement');
const StoryView = require('../../src/models/StoryView');

// ======================================
// EMPLOYEE DATA IS PRESERVED — NOT CLEARED
// Models NOT cleared: Employee, User, Role
// ======================================

const clearAll = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to database...");

        // Disable foreign key constraints for safe deletion
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        const allModels = [
            // AI / System
            AIChatMessage, AIChatSession, AICopilotLog, AuditLog, CommunicationLog,
            // Backup
            RestoreLog, Backup, BackupSchedule,
            // Social
            StoryView, SavedPost, PostAcknowledgement,
            SocialReaction, SocialComment, SocialMessage, SocialConnection, SocialPost,
            PostLike, PostComment, PostRepost, Follow,
            Post,
            // Operations
            MaterialMovement, StockRequest, PurchaseRequest,
            Material,
            TicketMessage, Ticket,
            Notification, OCRDocument, Event, Task, News,
            // HR-adjacent (NOT Employee records themselves)
            Attendance, Leave, Salary, Recruitment, Training, Holiday, SalesGoal,
            // Business
            Order, Quotation, Lead, Customer, Vendor, Project,
        ];

        let cleared = 0;
        let failed = 0;

        for (const Model of allModels) {
            try {
                if (Model.deleteMany) {
                    await Model.deleteMany({});
                    const name = Model.modelName || Model.name || 'Model';
                    console.log(`✅ Cleared: ${name}`);
                    cleared++;
                } else if (Model.sequelizeModel) {
                    await Model.sequelizeModel.destroy({ where: {} });
                    console.log(`✅ Cleared MySQL: ${Model.sequelizeModel.name}`);
                    cleared++;
                } else if (Model.destroy) {
                    await Model.destroy({ where: {} });
                    console.log(`✅ Cleared: ${Model.name}`);
                    cleared++;
                } else {
                    console.log(`⚠️  Unknown model type, skipping`);
                }
            } catch (err) {
                console.error(`❌ Error clearing model: ${err.message}`);
                failed++;
            }
        }

        // Re-enable foreign keys
        await sequelize.query('PRAGMA foreign_keys = ON;');

        console.log(`\n==========================================`);
        console.log(`✅ Done! Cleared: ${cleared} models, Failed: ${failed}`);
        console.log(`⚠️  Preserved: Employee, User, Role data`);
        console.log(`==========================================\n`);
        process.exit(0);
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
};

clearAll();
