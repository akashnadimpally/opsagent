# Running the Kubernetes Ops Agent on Windows

The Kubernetes Ops Agent is fully cross-platform by design. Since it is built using Electron and Node.js, the codebase can be run or packaged natively on a Windows laptop without changing any code.

Here is exactly how it works on Windows and step-by-step instructions for setting it up.

## How it works on Windows

1. **MCP Server Execution**: Under the hood, the Node.js MCP server uses `child_process.exec`. On a Windows machine, Node.js automatically uses `cmd.exe` (or you can pass scripts invoking PowerShell) to execute the system commands.
2. **Kubernetes Authentication**: As long as your Windows laptop has `kubectl` installed and `~/.kube/config` (typically `C:\Users\YourUser\.kube\config` on Windows) is pointing to your cluster, the agent can run commands seamlessly.
3. **Electron UI**: The desktop application runs inside a native Chromium window, appearing like any other Windows application.

---

## Step-by-Step Instructions

### Step 1: Install Prerequisites
Before running the code on your Windows laptop, make sure you have installed:
- **Node.js**: Download and install the LTS version from [nodejs.org](https://nodejs.org).
- **kubectl**: You can install this on Windows via PowerShell using winget (`winget install -e --id Kubernetes.kubectl`) or by downloading the binary. Ensure `kubectl` is available in your system's PATH.

### Step 2: Transfer and Prepare the Project
1. Copy the `opsagent` directory from your current machine to the Windows laptop.
2. Open a terminal on Windows (Command Prompt or PowerShell) and navigate into the `opsagent` folder.

### Step 3: Configure the Application
Open the `.env` file inside the `opsagent` root directory using Notepad or VS Code, and insert your Azure credentials:

```env
AZURE_OPENAI_ENDPOINT="https://<your-resource>.openai.azure.com/"
AZURE_OPENAI_API_KEY="<your-api-key>"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
PROMPT_FILE_PATH="prompt.md"
```
*(Note: You can tweak the instructions in `prompt.md` anytime without restarting the app).*

### Step 4: Install Dependencies
You need to install the Node packages for both the backend server and the desktop app. Run these commands sequentially:

```powershell
# 1. Install MCP Server packages
cd mcp-server
npm install

# 2. Go back, and install Desktop App packages
cd ../desktop-app
npm install
```

### Step 5: Run the App in Development Mode
To start the desktop application immediately without packaging it:

```powershell
cd desktop-app
npm run dev
```
A native Windows app interface will launch. The Electron main process automatically spawns the Node MCP server in the background and connects to it over Standard I/O. 

### Step 6: Build a Standalone Windows `.exe` (Optional)
If you want to create a permanent `OpsAgent.exe` file that you can double-click or share with other Windows users, run the build command directly on the Windows machine:

```powershell
cd desktop-app
npm run build
```

The Electron-Builder tool will detect that it is running on Windows and automatically compile a native `.exe` installer. You will find the generated executable inside the `desktop-app/dist/` directory!
