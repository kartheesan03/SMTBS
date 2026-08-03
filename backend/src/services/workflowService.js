const handleActionIntent = async (user, intentData) => {
    const actionType = intentData.actionType;
    switch (actionType) {
        case 'CREATE_PO':
            if (!['Admin', 'Manager', 'Vendor'].includes(user.role)) {
                return "You do not have permission to create a Purchase Order.";
            }
            return "I can help you create a Purchase Order. Please provide the vendor details and items.";
        case 'APPROVE_LEAVE':
            if (!['Admin', 'HR', 'Manager'].includes(user.role)) {
                return "You do not have permission to approve leaves.";
            }
            return "I found the pending leave request. Would you like me to approve it now?";
        default:
            return `I understand you want to perform a workflow action (${actionType}), but I need more details to proceed.`;
    }
};
const executeAction = async (user, actionData, sessionId) => {
    return {
        message: `Action ${actionData.actionType} executed successfully.`,
        success: true
    };
};
module.exports = {
    handleActionIntent,
    executeAction
};
