import express from 'express';
import bodyParser from 'body-parser';
import { ShellExecutor } from '../shell/shellExecutor';
import { PowerShellExecutor } from '../shell/powershellExecutor';

class MCPServer {
    private app: express.Application;
    private shellExecutor: ShellExecutor;
    private powerShellExecutor: PowerShellExecutor;

    constructor() {
        this.app = express();
        this.shellExecutor = new ShellExecutor();
        this.powerShellExecutor = new PowerShellExecutor();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    private setupRoutes() {
        this.app.post('/execute-shell', async (req: express.Request, res: express.Response) => {
            const { command } = req.body;
            try {
                const output = await this.shellExecutor.executeCommand(command);
                res.json({ output });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/execute-powershell', async (req: express.Request, res: express.Response) => {
            const { command } = req.body;
            try {
                const output = await this.powerShellExecutor.executeCommand(command);
                res.json({ output });
            } catch (error: any) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    public start(port: number) {
        this.app.listen(port, () => {
            console.log(`MCP Server is running on port ${port}`);
        });
    }
}

export default MCPServer;