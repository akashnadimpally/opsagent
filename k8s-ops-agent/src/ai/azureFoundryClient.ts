export class AzureFoundryClient {
    private apiKey: string;
    private endpoint: string;

    constructor(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
    }

    async sendPrompt(prompt: string): Promise<string> {
        const response = await fetch(`${this.endpoint}/v1/ai/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }
}