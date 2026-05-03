# Kubernetes Ops Agent

A cross-platform desktop application powered by Azure AI Foundry and the Model Context Protocol (MCP). This agent acts as an interactive Kubernetes operations assistant that can understand your requests, determine the necessary shell/kubectl commands, and securely execute them on your host machine to manage your Kubernetes cluster.

## Features

- **Native Desktop App:** Built with Electron, React, and Vite for a fast, browser-free experience.
- **Modern Interactive UI:** A sleek dark-mode interface with chat bubbles and real-time tool execution status indicators.
- **Model Context Protocol (MCP):** Uses a local Node.js MCP server that safely executes shell commands across Windows, Linux, and macOS.
- **Azure AI Foundry Integration:** Connects directly to Azure OpenAI using dynamic credentials provided in the UI.
- **Customizable Prompt:** Reads the system prompt directly from `prompt.md`, allowing you to easily tweak the agent's behavior and guardrails without modifying the codebase.

## Repository Structure

```
opsagent/
├── prompt.md             # The system instructions for the AI agent
├── README.md             # This documentation
├── mcp-server/           # The Node.js MCP Server exposing the `run_command` tool
│   ├── index.js
│   └── package.json
└── desktop-app/          # The Electron + React application (MCP Client & UI)
    ├── package.json
    ├── electron/         # Electron main process (MCP client & Azure AI integration)
    └── src/              # React frontend (Vite)
```

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **kubectl** (must be configured and authenticated to your Kubernetes cluster)
- **Azure AI Foundry Credentials** (Endpoint URL and API Key for an active deployment)

## Setup & Installation

1. **Install MCP Server dependencies:**
   ```bash
   cd mcp-server
   npm install
   ```

2. **Install Desktop App dependencies:**
   ```bash
   cd ../desktop-app
   npm install
   ```

## Running Locally for Development

To start the agent in development mode (which will launch both the React dev server and the Electron app window):

```bash
cd desktop-app
npm run dev
```

*Note: The Electron app automatically spins up the `mcp-server` process in the background.*

## Configuration

The application uses a single `.env` file for all configuration. You will find a `.env` file in the root directory:

```env
# Azure AI Foundry Configuration
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"

# Agent Configuration
PROMPT_FILE_PATH="prompt.md"
```

Any changes made to this `.env` file or `prompt.md` are **applied instantly** and dynamically read on the next chat interaction without needing to restart the application.

## Building for Production

If you want to package the application into a standalone executable (e.g., `.exe` for Windows, `.dmg` for macOS, or `.AppImage` for Linux):

```bash
cd desktop-app
npm run build
```

The compiled executables will be generated inside the `desktop-app/dist/` directory.

## Security & Best Practices

- **Destructive Actions:** The agent's prompt instructs it to ask for confirmation before running destructive commands (like `kubectl delete`). Always review the agent's proposed actions.
- **API Keys:** Keys are never passed to the frontend UI; they are sent directly to the secure Electron main process to handle Azure OpenAI communication securely.
