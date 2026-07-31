const { Anthropic } = require('@anthropic-ai/sdk');
const { tools, executeTool } = require('./toolRegistry');

let anthropic;
let useLocalFallback = false;

function getAnthropicClient() {
  if (useLocalFallback) return null;
  
  if (!anthropic) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key.includes('your_anthropic_api_key')) {
      console.warn("Anthropic API Key not found or invalid. Using local fallback orchestrator.");
      useLocalFallback = true;
      return null;
    }
    anthropic = new Anthropic({
      apiKey: key
    });
  }
  return anthropic;
}

async function localOrchestrator(user, messages, sessionId) {
  let contextText = messages[messages.length - 1].content.toLowerCase();
  
  let toolName = null;
  const findTool = (text) => {
      if (text.includes('attendance') || text.includes('hr')) return 'getAttendance';
      if (text.includes('payroll') || text.includes('salary')) return 'getPayrollSummary';
      if (text.includes('sales') || text.includes('revenue')) return 'getSalesData';
      if (text.includes('inventory') || text.includes('stock')) return 'getInventoryStatus';
      if (text.includes('insights')) return 'getDailyInsights';
      return null;
  };

  toolName = findTool(contextText);

  // If no direct tool match, check if previous assistant message provides context
  if (!toolName && messages.length >= 2) {
      const prevMessage = messages[messages.length - 2].content.toLowerCase();
      toolName = findTool(prevMessage);
  }

  if (contextText.includes('report') || contextText.includes('download')) {
    toolName = 'generateReport';
    const input = { module: 'general', format: 'pdf' };
    const result = await executeTool(toolName, input, user, sessionId);
    return {
      content: "I have generated the report as requested.",
      metadata: result.metadata
    };
  }

  if (contextText.includes('approve') || contextText.includes('approval') || contextText.includes('po-')) {
    return {
      content: "I have found the following request pending your approval.",
      metadata: {
        approval: {
            id: 'PO-12345',
            title: 'Purchase Order Approval',
            description: 'Request for new office equipment (Laptops, Monitors).',
            details: [
                { label: 'Requested By', value: 'Jane Doe' },
                { label: 'Amount', value: '$4,500.00' },
                { label: 'Department', value: 'IT' }
            ]
        }
      }
    };
  }

  if (toolName) {
    const result = await executeTool(toolName, {}, user, sessionId);
    return {
      content: result.content || "Here is the information you requested.",
      metadata: result.metadata || {}
    };
  }

  return {
    content: "I'm your AI Assistant. (Running in offline mode). Ask me about Attendance, Payroll, Sales, or Inventory!",
    metadata: {}
  };
}

async function orchestrateChat(user, messages, sessionId) {
  const client = getAnthropicClient();
  
  if (!client) {
    return await localOrchestrator(user, messages, sessionId);
  }
  
  // Format history. Ensure correct structure for Anthropic API
  const formattedMessages = messages.map(msg => ({
    role: msg.role === 'ai' || msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }));

  const systemPrompt = `You are a helpful ERP AI Assistant for SMTBMS. The user is logged in as a ${user.role}.
Always use the provided tools to fetch real data before answering.
If the user asks for a report, use generateReport.
When a tool returns metadata (tables, charts, workflows), you don't need to re-print the entire table in text, just provide a brief natural language summary of the result, as the UI will render the metadata beautifully.`;

  try {
    let response = await client.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: systemPrompt,
      tools: tools,
      messages: formattedMessages
    });

    let toolResults = [];
    let assistantMessage = "";
    let finalMetadata = {};

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      
      // We process each tool call
      for (const block of toolUseBlocks) {
        const result = await executeTool(block.name, block.input, user, sessionId);
        
        if (result.metadata) {
          finalMetadata = { ...finalMetadata, ...result.metadata };
        }

        let resultString = typeof result === 'string' ? result : JSON.stringify({ content: result.content });
        if (result.error) resultString = JSON.stringify({ error: result.error });

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: resultString
        });
      }

      // Add the assistant's tool-use message and the tool_results back to the conversation
      formattedMessages.push({
        role: "assistant",
        content: response.content
      });
      formattedMessages.push({
        role: "user",
        content: toolResults
      });

      // Call Claude again
      response = await client.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        system: systemPrompt,
        tools: tools,
        messages: formattedMessages
      });
      
      toolResults = [];
    }

    const textBlocks = response.content.filter(block => block.type === 'text');
    if (textBlocks.length > 0) {
      assistantMessage = textBlocks[0].text;
    }

    return {
      content: assistantMessage,
      metadata: finalMetadata
    };

  } catch (error) {
    if (error.status === 401 || error.message.includes('key')) {
        console.warn("Anthropic API Key failed auth. Falling back to local orchestrator.");
        useLocalFallback = true;
        return await localOrchestrator(user, messages, sessionId);
    }
    console.error("Anthropic Orchestrator Error:", error);
    throw error;
  }
}

module.exports = {
  orchestrateChat
};
