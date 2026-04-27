import * as fs from 'fs';
import * as path from 'path';
import { AzureFoundryClient } from '../ai/azureFoundryClient';
import { ShellExecutor } from '../shell/shellExecutor';
import { PowerShellExecutor } from '../shell/powershellExecutor';
import * as dotenv from 'dotenv';
dotenv.config();

class OpsAgent {
    private azureClient: AzureFoundryClient;
    private shellExecutor: ShellExecutor;
    private powershellExecutor: PowerShellExecutor;
    private prompt: string;

    constructor(apiKey: string, endpoint: string) {
        this.azureClient = new AzureFoundryClient(apiKey, endpoint);
        this.shellExecutor = new ShellExecutor();
        this.powershellExecutor = new PowerShellExecutor();
        this.prompt = this.loadPrompt();
    }

    private loadPrompt(): string {
        const promptPath = path.join(__dirname, 'prompt.md');
        return fs.readFileSync(promptPath, 'utf-8');
    }

    public async startChat() {
        console.log('Welcome to the Ops Agent!');
        console.log('Prompt:', this.prompt);
        // Implement interactive chat logic here
    }
}

// Initialize the agent with your Azure API key and endpoint
const apiKey = process.env.AZURE_API_KEY || '';
const endpoint = process.env.AZURE_ENDPOINT || '';
const agent = new OpsAgent(apiKey, endpoint);
agent.startChat();