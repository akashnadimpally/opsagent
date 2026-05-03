# kDashM Integration Guide (Backend)

This repository provides the "Brain" for the kDashM AI Ops Assistant. It runs as a headless REST API that securely handles Azure OpenAI communication and executes local `kubectl` commands via MCP.

## 🚀 How to Run the Integration

### 1. Configure the Backend (.env)
Create a `.env` file in the **root of this `opsagent` repository**. 
**IMPORTANT:** Use the standard Azure OpenAI endpoint format as shown below.

```env
AZURE_OPENAI_ENDPOINT="https://vs-agent-foundry.openai.azure.com/"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4.1"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
PROMPT_FILE_PATH="prompt.md"
```

### 2. Start the API Server
The API server acts as a bridge between the kDashM browser UI and your local machine's shell.

```bash
cd api-server
npm install
node index.js
```
*Port 3001 will be used by default.*

## 🛠 Features Enabled for kDashM
- **Secure Key Management**: Azure keys never leave your backend server.
- **Local Tool Execution**: The agent can run `kubectl` and `helm` commands on your laptop to manage your AKS and Docker Desktop clusters.
- **Cross-Project Support**: Can execute commands within specific workspace paths if provided by kDashM.
