export class PowerShellExecutor {
    executeCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');

            exec(command, { shell: 'powershell.exe' }, (error: any, stdout: string, stderr: string) => {
                if (error) {
                    reject(`Error: ${stderr}`);
                } else {
                    resolve(stdout);
                }
            });
        });
    }
}