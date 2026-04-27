export class ShellExecutor {
    executeCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            exec(command, (error: Error, stdout: string, stderr: string) => {
                if (error) {
                    reject(`Error executing command: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Command error output: ${stderr}`);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    }
}