import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const server = new Server({
  name: "ops-agent-mcp",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "run_command",
      description: "Run a shell command on the host system (cross-platform, supports Windows and Linux).",
      inputSchema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The shell command to execute"
          },
          cwd: {
            type: "string",
            description: "Optional. The working directory to execute the command in. If not provided, it runs in the default agent directory."
          }
        },
        required: ["command"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "run_command") {
    const { command, cwd } = request.params.arguments;
    try {
      const execOptions = cwd ? { cwd } : {};
      const { stdout, stderr } = await execAsync(command, execOptions);
      return {
        content: [
          {
            type: "text",
            text: `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Command execution failed:\n${error.message}\nSTDOUT:\n${error.stdout}\nSTDERR:\n${error.stderr}`
          }
        ]
      };
    }
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
