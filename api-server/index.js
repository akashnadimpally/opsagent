import express from 'express';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import path from 'path';
import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Load config dynamically
function loadConfig() {
  const possibleEnvPaths = [
    path.join(process.cwd(), '../.env'),
    path.join(__dirname, '../.env')
  ];
  
  let envConfig = {};
  for (const p of possibleEnvPaths) {
    if (fs.existsSync(p)) {
      envConfig = dotenv.parse(fs.readFileSync(p));
      break;
    }
  }
  
  return {
    endpoint: envConfig['AZURE_OPENAI_ENDPOINT'] || '',
    apiKey: envConfig['AZURE_OPENAI_API_KEY'] || '',
    deployment: envConfig['AZURE_OPENAI_DEPLOYMENT_NAME'] || 'gpt-4o',
    apiVersion: envConfig['AZURE_OPENAI_API_VERSION'] || '2024-02-15-preview',
    promptFile: envConfig['PROMPT_FILE_PATH'] || 'prompt.md'
  };
}

function loadPrompt(promptFile) {
  const possiblePaths = [
    path.join(__dirname, '../', promptFile)
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return "You are an advanced Kubernetes operations assistant.";
}

let mcpClient = null;
const mcpServerPath = path.join(__dirname, '../mcp-server/index.js');

async function setupMCP() {
  const transport = new StdioClientTransport({
    command: process.platform === 'win32' ? 'node.cmd' : 'node',
    args: [mcpServerPath]
  });
  
  mcpClient = new Client({
    name: "ops-agent-api",
    version: "1.0.0"
  }, { capabilities: { prompts: {}, resources: {}, tools: {} } });
  
  await mcpClient.connect(transport);
  console.log("API Server connected to MCP Server.");
}

setupMCP().catch(console.error);

let chatHistories = {}; // Map of sessionId -> chat history

app.get('/api/config', (req, res) => {
  const config = loadConfig();
  res.json({ configured: !!(config.endpoint && config.apiKey) });
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId = 'default', workspacePath } = req.body;
  const config = loadConfig();

  if (!config.endpoint || !config.apiKey) {
    return res.status(400).json({ error: "Azure API Key and Endpoint are missing in .env file." });
  }

  if (!chatHistories[sessionId]) {
    let systemPrompt = loadPrompt(config.promptFile);
    if (workspacePath) {
      systemPrompt += `\n\nImportant: The user has selected the following directory as their active workspace: ${workspacePath}. You MUST execute any project-specific shell commands with this directory as your current working directory.`;
    }
    chatHistories[sessionId] = [{ role: 'system', content: systemPrompt }];
  }

  const client = new AzureOpenAI({
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    apiVersion: config.apiVersion,
  });

  chatHistories[sessionId].push({ role: 'user', content: message });
  let toolsExecuted = [];

  try {
    let mcpToolsResult = await mcpClient?.listTools();
    let tools = mcpToolsResult?.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema
      }
    }));

    let response = await client.chat.completions.create({
      model: config.deployment,
      messages: chatHistories[sessionId],
      tools: tools,
    });

    let aiMessage = response.choices[0].message;

    if (aiMessage.tool_calls) {
      chatHistories[sessionId].push(aiMessage);
      
      for (const toolCall of aiMessage.tool_calls) {
        if (toolCall.function.name === 'run_command') {
          const args = JSON.parse(toolCall.function.arguments);
          toolsExecuted.push(args.command);
          
          let toolResult = await mcpClient?.callTool({
            name: toolCall.function.name,
            arguments: args
          });
          
          let resultText = toolResult?.content?.[0]?.text || "No output";
          chatHistories[sessionId].push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: resultText
          });
        }
      }

      // Second turn
      response = await client.chat.completions.create({
        model: config.deployment,
        messages: chatHistories[sessionId],
      });
      aiMessage = response.choices[0].message;
    }

    chatHistories[sessionId].push(aiMessage);
    res.json({ content: aiMessage.content, toolsExecuted });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clear', (req, res) => {
  const { sessionId = 'default' } = req.body;
  delete chatHistories[sessionId];
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`OpsAgent API Server running on port ${PORT}`);
});
