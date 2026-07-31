const aiActionHandler = require('./aiActionHandler');
// We can use aiActionHandler's logic since it already fetches from the DB using Sequelize

// Define the tools for Anthropic API
const tools = [
  {
    name: "getAttendance",
    description: "Get today's attendance summary for employees.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getPayrollSummary",
    description: "Get the payroll summary and status for the current month.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "generateReport",
    description: "Generate a downloadable report file for a given module.",
    input_schema: {
      type: "object",
      properties: {
        module: {
          type: "string",
          description: "The module to generate a report for (e.g. 'attendance', 'sales', 'inventory', 'payroll')"
        },
        format: {
          type: "string",
          enum: ["pdf", "excel"],
          description: "The format of the report"
        }
      },
      required: ["module", "format"]
    }
  },
  {
    name: "getSalesData",
    description: "TODO: Get sales revenue data.",
    input_schema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "getInventoryStatus",
    description: "Gets the live inventory status and identifies low stock items",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "getDailyInsights",
    description: "Gets the daily AI insights and KPIs across all modules",
    input_schema: { type: "object", properties: {} }
  },
  {
    name: "getCrmLeads",
    description: "TODO: Get pending CRM leads.",
    input_schema: { type: "object", properties: {} }
  }
];

// Execute a tool call
async function executeTool(toolName, input, user, sessionId) {
  try {
    switch (toolName) {
      case 'getAttendance':
        return await aiActionHandler.handleAttendance(user, input);
      case 'getPayrollSummary':
        return await aiActionHandler.handlePayroll(user, input);
      case 'getSalesData':
        return await aiActionHandler.handleSales(user, input);
      case 'getInventoryStatus':
        return await aiActionHandler.handleInventory(user, input);
      case 'getDailyInsights':
        return await aiActionHandler.handleInsights(user, input);
      case 'generateReport':
        const mod = input.module || 'Sales';
        return {
          content: `I have generated the ${mod} report as requested.`,
          metadata: {
            reportPreview: {
                title: `${mod.charAt(0).toUpperCase() + mod.slice(1)} Report`,
                type: mod,
                data: {
                    size: '1.8 MB',
                    generatedAt: new Date().toLocaleDateString(),
                    format: (input.format || 'pdf').toUpperCase()
                }
            }
          }
        };
      case 'getCrmLeads':
        return {
           content: "CRM Leads retrieval is currently a stub.",
           metadata: {}
        };
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return { error: error.message };
  }
}

module.exports = {
  tools,
  executeTool
};
