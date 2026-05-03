# Integration with kDashM

This `opsagent` repository now serves a dual purpose:
1. A standalone Electron Desktop Application (`desktop-app/`)
2. A headless REST API Server (`api-server/`)

We have successfully integrated the Ops Agent directly into the `kdashm` dashboard. When running in this mode, `kdashm` acts as the frontend, and this repository (`api-server`) acts as the backend AI execution engine.

## Step-by-Step Instructions to Run the Integration (Backend)

Follow these steps to run the agent backend that powers the `kdashm` integration.

### Step 1: Configure Environment Variables
Ensure you have a `.env` file in the root of this `opsagent` directory with your Azure credentials:
```env
AZURE_OPENAI_ENDPOINT="https://<your-resource>.openai.azure.com/"
AZURE_OPENAI_API_KEY="<your-api-key>"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
PROMPT_FILE_PATH="prompt.md"
```

### Step 2: Install API Server Dependencies
If you haven't already, install the necessary packages for the API server:
```bash
cd api-server
npm install
```

### Step 3: Start the API Server
Run the API server:
```bash
node index.js
```
*Note: This will automatically spin up the `mcp-server` child process in the background and expose the REST endpoints on `http://localhost:3001`.*

---

**Next Steps:** Leave this terminal running, open a new terminal in your `kdashm` project directory, and start the frontend dashboard!
