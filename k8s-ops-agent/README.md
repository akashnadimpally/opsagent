# k8s-ops-agent

## Overview
The k8s-ops-agent is an interactive operations agent designed for Kubernetes environments. It leverages Azure AI Foundry to provide intelligent responses and command execution capabilities through a modern Windows desktop application. The agent interacts with users via a chat interface, allowing for seamless command execution in both shell and PowerShell environments.

## Project Structure
```
k8s-ops-agent
├── src
│   ├── agent
│   │   ├── main.ts
│   │   └── prompt.md
│   ├── ai
│   │   └── azureFoundryClient.ts
│   ├── shell
│   │   ├── shellExecutor.ts
│   │   └── powershellExecutor.ts
│   ├── mcp-server
│   │   └── server.ts
│   └── ui
│       ├── windows-desktop
│       │   ├── App.xaml
│       │   └── MainWindow.xaml.cs
│       └── shared
│           └── ChatViewModel.cs
├── package.json
├── tsconfig.json
└── README.md
```

## Features
- **Interactive Chat Interface**: Users can interact with the agent in real-time, receiving intelligent responses based on predefined prompts.
- **Command Execution**: The agent can execute commands in both Unix-like shell and PowerShell environments, providing flexibility for different user preferences.
- **Cross-Platform Compatibility**: The MCP server is designed to work seamlessly on both Windows and Linux systems.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/k8s-ops-agent.git
   cd k8s-ops-agent
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Azure AI Foundry**:
   - Create a .env file in the project root with the following content:
       ```
         AZURE_API_KEY=YOUR_API_KEY_HERE
         AZURE_MODEL_NAME=YOUR_MODEL_NAME_HERE
         AZURE_ENDPOINT=YOUR_ENDPOINT_HERE
       ```
      The application will automatically load these credentials from the .env file.

4. **Run the Application**:
   - For Windows:
     ```bash
     npm run start:windows
     ```
   - For Linux:
     ```bash
     npm run start:linux
     ```

   Open a terminal (such as Command Prompt or PowerShell).
Navigate to the project directory:
```bash
cd k8s-ops-agent
# Build the project:
npm run build
# Start the MCP server:
npm start
```

The Windows desktop UI will launch, allowing you to interact with the agent.


## Usage
- Launch the application and interact with the agent through the chat interface.
- Use the prompts defined in `src/agent/prompt.md` to guide your interactions.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.