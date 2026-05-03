# Integrating Ops Agent into kdashm Dashboard

Since your `kdashm` dashboard is running locally on your laptop, the agent can safely run as a standalone API on your machine, leveraging your local `kubectl` (which is already authenticated to AKS and Docker Desktop) to execute operations.

I have created a new **`api-server`** directory in the `opsagent` project. This server exposes the agent as a REST API that your `kdashm` frontend can securely talk to!

## Step 1: Start the Agent API Server
Open a terminal in the `opsagent` directory and start the new API server:

```bash
cd api-server
npm install
node index.js
```
*The server will start on `http://localhost:3001` and connect to the local `mcp-server`.*

## Step 2: Add the Component to your `kdashm` React Frontend

In your `kdashm` project, install `lucide-react` if you haven't already:
```bash
npm install lucide-react
```

Then, create a new component file `OpsAgentWidget.tsx` in your `kdashm` codebase and paste the following code:

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Activity } from 'lucide-react';

export const OpsAgentWidget = () => {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'ai', content: 'Hello! I am your embedded Ops Agent. I have access to your AKS and Docker Desktop clusters. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolsRunning, setToolsRunning] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolsRunning]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Connects to the local opsagent api-server we just built!
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          sessionId: 'kdashm-session' 
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.toolsExecuted && data.toolsExecuted.length > 0) {
        setToolsRunning(data.toolsExecuted);
      }

      setMessages(prev => [...prev, { role: 'ai', content: data.content }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error connecting to agent: ${err.message}` }]);
    } finally {
      setLoading(false);
      setToolsRunning([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', width: '400px', background: '#0f172a', color: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
      <div style={{ padding: '16px', background: '#020617', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
        <Terminal size={18} color="#3b82f6" />
        K8s Ops Agent
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: msg.role === 'user' ? '#3b82f6' : '#1e293b', fontSize: '14px', lineHeight: '1.5' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {toolsRunning.length > 0 && (
          <div style={{ alignSelf: 'flex-start', fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '16px' }}>
            <Activity size={14} /> Executing {toolsRunning.length} command(s)...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ padding: '16px', background: '#020617', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about AKS or Docker Desktop..."
          disabled={loading}
          style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '10px 14px', borderRadius: '6px', outline: 'none' }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 16px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
```

## Step 3: Embed It!
Simply import and place `<OpsAgentWidget />` anywhere in your `kdashm` dashboard. Since both your dashboard and the `api-server` run locally on your laptop, the agent can seamlessly execute your commands against both your AKS cluster and your Docker Desktop cluster!
