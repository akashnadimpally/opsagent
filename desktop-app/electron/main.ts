import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs';
import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';

let mainWindow: BrowserWindow | null = null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// Configuration loader
function loadConfig() {
  const possibleEnvPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '../.env'),
    path.join(__dirname, '../../.env'),
    path.join(__dirname, '../../../.env')
  ];
  
  let envConfig: any = {};
  for (const p of possibleEnvPaths) {
    if (fs.existsSync(p)) {
      envConfig = dotenv.parse(fs.readFileSync(p));
      console.log("Loaded config from:", p);
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

// Function to read prompt dynamically
function loadPrompt(promptFile: string) {
  const possiblePaths = [
    path.join(process.cwd(), promptFile),
    path.join(process.cwd(), '../', promptFile),
    path.join(__dirname, '../../', promptFile),
    path.join(__dirname, '../../../', promptFile)
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log("Loaded prompt from:", p);
      return fs.readFileSync(p, 'utf8');
    }
  }
  return "You are an advanced Kubernetes operations assistant.";
}

// Ensure MCP server exists
const mcpServerPath = fs.existsSync(path.join(process.cwd(), 'mcp-server/index.js'))
  ? path.join(process.cwd(), 'mcp-server/index.js')
  : fs.existsSync(path.join(process.cwd(), '../mcp-server/index.js'))
  ? path.join(process.cwd(), '../mcp-server/index.js')
  : path.join(__dirname, '../../mcp-server/index.js');

let mcpClient: Client | null = null;

async function setupMCP() {
  const transport = new StdioClientTransport({
    command: process.platform === 'win32' ? 'node.cmd' : 'node',
    args: [mcpServerPath]
  });
  
  mcpClient = new Client({
    name: "ops-agent-client",
    version: "1.0.0"
  }, { capabilities: { prompts: {}, resources: {}, tools: {} } });
  
  await mcpClient.connect(transport);
  console.log("MCP Client connected to MCP Server!");
}

setupMCP().catch(console.error);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset'
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let chatHistory: any[] = [];

ipcMain.handle('get-config', () => {
  const config = loadConfig();
  return { configured: !!(config.endpoint && config.apiKey) };
});

ipcMain.handle('select-directory', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('chat', async (event, userMessage: string, workspacePath?: string) => {
  const config = loadConfig();
  
  if (!config.endpoint || !config.apiKey) {
    return { error: "Azure API Key and Endpoint are missing in .env file." };
  }

  // Initialize history if empty
  if (chatHistory.length === 0) {
    let systemPrompt = loadPrompt(config.promptFile);
    if (workspacePath) {
      systemPrompt += `\n\nImportant: The user has selected the following directory as their active workspace: ${workspacePath}. You MUST execute any project-specific shell commands with this directory as your current working directory.`;
    }
    chatHistory.push({ role: 'system', content: systemPrompt });
  }

  // Initialize Azure OpenAI
  const client = new AzureOpenAI({
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    apiVersion: config.apiVersion,
  });

  chatHistory.push({ role: 'user', content: userMessage });

  try {
    let mcpToolsResult = await mcpClient?.listTools();
    let tools = mcpToolsResult?.tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema as any
      }
    }));

    let response = await client.chat.completions.create({
      model: config.deployment,
      messages: chatHistory,
      tools: tools,
    });

    let message = response.choices[0].message;

    if (message.tool_calls) {
      chatHistory.push(message);
      
      for (const toolCall of message.tool_calls) {
        if (toolCall.function.name === 'run_command') {
          const args = JSON.parse(toolCall.function.arguments);
          
          event.sender.send('tool-status', `Running command: ${args.command}`);
          
          let toolResult = await mcpClient?.callTool({
            name: toolCall.function.name,
            arguments: args
          });
          
          let resultText = toolResult?.content?.[0]?.text || "No output";
          chatHistory.push({
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
        messages: chatHistory,
      });
      message = response.choices[0].message;
    }

    chatHistory.push(message);
    return { content: message.content };
  } catch (err: any) {
    console.error("Chat Error:", err);
    return { error: err.message };
  }
});

ipcMain.handle('clear-history', () => {
  chatHistory = [];
  return true;
});
