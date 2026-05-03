# Running the Kubernetes Ops Agent on macOS

The beautiful thing about this architecture (Electron + Node.js) is that **you do not need a separate folder or codebase for macOS!** The exact same code you run on Windows will run natively on macOS and Linux.

In fact, the application includes macOS-specific UI optimizations (such as `titleBarStyle: 'hiddenInset'` in the main process) which gives it a beautiful, native-looking macOS window with integrated traffic-light buttons.

Here is how the application runs on a Mac.

## How it works on macOS

1. **MCP Server Execution**: On macOS, Node's `child_process.exec` automatically falls back to your native Unix shell (usually `/bin/sh` or `/bin/zsh`). Commands like `ls`, `grep`, and `kubectl` work identically to how you would run them in your own macOS Terminal.
2. **Kubernetes Authentication**: As long as your Mac is authenticated with your cluster (`~/.kube/config`), the agent inherits those permissions without any additional configuration.

---

## Step-by-Step Instructions

### Step 1: Install Prerequisites (using Homebrew)
If you don't already have them, you can easily install the dependencies using [Homebrew](https://brew.sh/):

Open your macOS Terminal and run:
```bash
# Install Node.js
brew install node

# Install kubectl
brew install kubectl
```

### Step 2: Configure the Application
Open the `.env` file in the root `opsagent` folder and configure your Azure settings:

```env
AZURE_OPENAI_ENDPOINT="https://<your-resource>.openai.azure.com/"
AZURE_OPENAI_API_KEY="<your-api-key>"
AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
AZURE_OPENAI_API_VERSION="2024-02-15-preview"
PROMPT_FILE_PATH="prompt.md"
```

### Step 3: Install Dependencies
Open your Terminal, navigate to the `opsagent` directory, and run:

```bash
# 1. Install MCP Server packages
cd mcp-server
npm install

# 2. Go back, and install Desktop App packages
cd ../desktop-app
npm install
```

### Step 4: Run the App in Development Mode
To start the desktop application immediately:

```bash
cd desktop-app
npm run dev
```

### Step 5: Build a Standalone macOS `.app` or `.dmg`
To create a native macOS Application bundle that you can drag into your `/Applications` folder, just run the build command directly on your Mac:

```bash
cd desktop-app
npm run build
```

Electron-Builder detects that you are on macOS and automatically creates a highly optimized Apple Silicon (`arm64`) or Intel (`x64`) macOS `.app` bundle located in the `desktop-app/dist/mac/` directory!
