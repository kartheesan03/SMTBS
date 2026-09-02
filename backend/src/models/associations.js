const User = require('./User');
const Employee = require('./Employee');
const Customer = require('./Customer');
const Vendor = require('./Vendor');
const Material = require('./Material');
const Attendance = require('./Attendance');
const Leave = require('./Leave');
const Salary = require('./Salary');
const Order = require('./Order');
const Task = require('./Task');
const Ticket = require('./Ticket');
const Notification = require('./Notification');
const MaterialMovement = require('./MaterialMovement');
const CommunicationLog = require('./CommunicationLog');
const AuditLog = require('./AuditLog');
const Role = require('./Role');
const Lead = require('./Lead');
const AICopilotLog = require('./AICopilotLog');
const AIChatSession = require('./AIChatSession');
const AIChatMessage = require('./AIChatMessage');
const PostAcknowledgement = require('./PostAcknowledgement');
const StoryView = require('./StoryView');
const OCRDocument = require('./OCRDocument');

function setupAssociations() {
    Employee.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userIdField', as: 'userId' });
    User.sequelizeModel.hasOne(Employee.sequelizeModel, { foreignKey: 'userIdField', as: 'employee' });
    Customer.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdByField', as: 'createdBy' });
    Customer.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    User.sequelizeModel.hasOne(Customer.sequelizeModel, { foreignKey: 'userId', as: 'customerProfile' });
    Attendance.sequelizeModel.belongsTo(Employee.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });
    Leave.sequelizeModel.belongsTo(Employee.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });
    Leave.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'reviewedById', as: 'reviewedBy' });
    Salary.sequelizeModel.belongsTo(Employee.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });
    Order.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customerId', as: 'Customer' });
    Order.sequelizeModel.belongsTo(Lead.sequelizeModel, { foreignKey: 'leadId', as: 'Lead' });
    Order.sequelizeModel.belongsTo(Vendor.sequelizeModel, { foreignKey: 'vendorId', as: 'vendor' });
    Order.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdById', as: 'createdBy' });
    Order.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'updatedById', as: 'updatedBy' });
    Task.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'assignedById', as: 'assignedBy' });

    // Ticket Associations
    Ticket.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customerId', as: 'Customer' });
    Ticket.sequelizeModel.belongsTo(Lead.sequelizeModel, { foreignKey: 'leadId', as: 'Lead' });
    Ticket.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'assignedToId', as: 'assignedTo' });
    Ticket.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'submittedById', as: 'submittedBy' });

    const TicketMessage = require('./TicketMessage');
    Ticket.sequelizeModel.hasMany(TicketMessage.sequelizeModel, { foreignKey: 'ticketId', as: 'messages' });
    TicketMessage.sequelizeModel.belongsTo(Ticket.sequelizeModel, { foreignKey: 'ticketId', as: 'ticket' });
    TicketMessage.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'senderId', as: 'sender' });

    Notification.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    Material.sequelizeModel.belongsTo(Vendor.sequelizeModel, { foreignKey: 'vendorId', as: 'vendor' });
    Vendor.sequelizeModel.hasMany(Material.sequelizeModel, { foreignKey: 'vendorId', as: 'materials' });
    Vendor.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    User.sequelizeModel.hasOne(Vendor.sequelizeModel, { foreignKey: 'userId', as: 'vendorProfile' });
    MaterialMovement.sequelizeModel.belongsTo(Material.sequelizeModel, { foreignKey: 'materialId', as: 'material' });
    MaterialMovement.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'performedById', as: 'performedBy' });
    MaterialMovement.sequelizeModel.belongsTo(Order.sequelizeModel, { foreignKey: 'referenceOrderId', as: 'referenceOrder' });
    Material.sequelizeModel.hasMany(MaterialMovement.sequelizeModel, { foreignKey: 'materialId', as: 'movements' });
    CommunicationLog.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customerId', as: 'Customer' });
    CommunicationLog.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdById', as: 'createdBy' });
    Customer.sequelizeModel.hasMany(CommunicationLog.sequelizeModel, { foreignKey: 'customerId', as: 'communications' });
    AuditLog.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    const StockRequest = require('./StockRequest');
    StockRequest.sequelizeModel.belongsTo(Material.sequelizeModel, { foreignKey: 'materialId', as: 'material' });
    StockRequest.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'employeeId', as: 'employee' });
    StockRequest.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'managerId', as: 'manager' });
    StockRequest.sequelizeModel.belongsTo(Order.sequelizeModel, { foreignKey: 'orderId', as: 'order' });
    const Backup = require('./Backup');
    const RestoreLog = require('./RestoreLog');
    Backup.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdById', as: 'createdBy' });
    RestoreLog.sequelizeModel.belongsTo(Backup.sequelizeModel, { foreignKey: 'backupIdField', as: 'backup' });
    RestoreLog.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'restoredById', as: 'restoredBy' });
    const PurchaseRequest = require('./PurchaseRequest');
    PurchaseRequest.sequelizeModel.belongsTo(Order.sequelizeModel, { foreignKey: 'orderId', as: 'order' });
    Order.sequelizeModel.hasMany(PurchaseRequest.sequelizeModel, { foreignKey: 'orderId', as: 'purchaseRequests' });
    PurchaseRequest.sequelizeModel.belongsTo(Vendor.sequelizeModel, { foreignKey: 'vendorId', as: 'vendor' });
    PurchaseRequest.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'requestedById', as: 'requestedBy' });

    const Quotation = require('./Quotation');
    Quotation.sequelizeModel.belongsTo(Customer.sequelizeModel, { foreignKey: 'customer', as: 'Customer' });

    const SalesGoal = require('./SalesGoal');
    SalesGoal.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'assignedTo', as: 'assignedUser' });
    SalesGoal.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdBy', as: 'createdUser' });
    const SocialPost = require('./SocialPost');
    const SocialComment = require('./SocialComment');
    const SocialReaction = require('./SocialReaction');
    const SocialConnection = require('./SocialConnection');
    const SocialMessage = require('./SocialMessage');

    const Post = require('./Post');
    const PostLike = require('./PostLike');
    const PostComment = require('./PostComment');
    const PostRepost = require('./PostRepost');
    const SavedPost = require('./SavedPost');
    const PostAcknowledgement = require('./PostAcknowledgement');
    const StoryView = require('./StoryView');
    const News = require('./News');
    const Event = require('./Event');
    const Follow = require('./Follow');

    SocialPost.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'authorId', as: 'author' });
    User.sequelizeModel.hasMany(SocialPost.sequelizeModel, { foreignKey: 'authorId', as: 'posts' });

    SocialComment.sequelizeModel.belongsTo(SocialPost.sequelizeModel, { foreignKey: 'postId', as: 'post' });
    SocialPost.sequelizeModel.hasMany(SocialComment.sequelizeModel, { foreignKey: 'postId', as: 'comments' });

    SocialComment.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'authorId', as: 'author' });
    User.sequelizeModel.hasMany(SocialComment.sequelizeModel, { foreignKey: 'authorId', as: 'socialComments' });

    SocialReaction.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    SocialReaction.sequelizeModel.belongsTo(SocialPost.sequelizeModel, { foreignKey: 'postId', as: 'post' });
    SocialPost.sequelizeModel.hasMany(SocialReaction.sequelizeModel, { foreignKey: 'postId', as: 'reactions' });
    SocialReaction.sequelizeModel.belongsTo(SocialComment.sequelizeModel, { foreignKey: 'commentId', as: 'comment' });

    SocialConnection.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'requesterId', as: 'requester' });
    SocialConnection.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'recipientId', as: 'recipient' });

    SocialMessage.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'senderId', as: 'sender' });
    SocialMessage.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'receiverId', as: 'receiver' });

    Post.sequelizeModel.belongsTo(User.sequelizeModel, { as: 'author', foreignKey: 'authorId' });
    Post.sequelizeModel.hasMany(PostComment.sequelizeModel, { foreignKey: 'postId', as: 'comments' });
    Post.sequelizeModel.hasMany(PostLike.sequelizeModel, { foreignKey: 'postId', as: 'likes' });
    Post.sequelizeModel.hasMany(SavedPost.sequelizeModel, { foreignKey: 'postId', as: 'savedBy' });
    Post.sequelizeModel.hasMany(PostRepost.sequelizeModel, { foreignKey: 'postId', as: 'reposts' });
    PostComment.sequelizeModel.belongsTo(User.sequelizeModel, { as: 'author', foreignKey: 'authorId' });
    PostLike.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    PostRepost.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    SavedPost.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    SavedPost.sequelizeModel.belongsTo(Post.sequelizeModel, { foreignKey: 'postId', as: 'post' });

    News.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'authorId', as: 'author' });
    Event.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'organizerId', as: 'organizer' });

    Follow.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'followerId', as: 'follower' });
    Follow.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'followingId', as: 'following' });
    User.sequelizeModel.hasMany(Follow.sequelizeModel, { foreignKey: 'followerId', as: 'followingUsers' });
    User.sequelizeModel.hasMany(Follow.sequelizeModel, { foreignKey: 'followingId', as: 'followers' });

    PostAcknowledgement.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'userId', as: 'user' });
    PostAcknowledgement.sequelizeModel.belongsTo(Post.sequelizeModel, { foreignKey: 'postId', as: 'post' });
    Post.sequelizeModel.hasMany(PostAcknowledgement.sequelizeModel, { foreignKey: 'postId', as: 'acknowledgements' });
    User.sequelizeModel.hasMany(PostAcknowledgement.sequelizeModel, { foreignKey: 'userId', as: 'acknowledgements' });

    StoryView.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'viewerId', as: 'viewer' });
    StoryView.sequelizeModel.belongsTo(Post.sequelizeModel, { foreignKey: 'storyId', as: 'story' });
    Post.sequelizeModel.hasMany(StoryView.sequelizeModel, { foreignKey: 'storyId', as: 'views' });

    OCRDocument.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'createdBy', as: 'creator' });
    OCRDocument.sequelizeModel.belongsTo(User.sequelizeModel, { foreignKey: 'updatedBy', as: 'updater' });
}
module.exports = setupAssociations;
