import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Settings, Activity, CheckCircle, AlertCircle, Folder } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am your Kubernetes Ops Agent. How can I help you manage your cluster today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [workspacePath, setWorkspacePath] = useState<string>(localStorage.getItem('opsagent_workspace') || '');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkConfig = async () => {
    if ((window as any).electron?.getConfig) {
      const { configured } = await (window as any).electron.getConfig();
      setIsConfigured(configured);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolStatus]);

  useEffect(() => {
    checkConfig();

    if ((window as any).electron?.onToolStatus) {
      const cleanup = (window as any).electron.onToolStatus((status: string) => {
        setToolStatus(status);
      });
      return cleanup;
    }
  }, []);

  const handleSelectWorkspace = async () => {
    if ((window as any).electron?.selectDirectory) {
      const dir = await (window as any).electron.selectDirectory();
      if (dir) {
        setWorkspacePath(dir);
        localStorage.setItem('opsagent_workspace', dir);
      }
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    await checkConfig();
    if (!isConfigured) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Error: Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in the `.env` file first.' }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    setToolStatus(null);

    try {
      const response = await (window as any).electron.chat(userMessage, workspacePath);
      
      if (response.error) {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${response.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: response.content }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Failed to communicate with AI: ${err.message}` }]);
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  };

  return (
    <div className="app-container">
      <div className="titlebar">Ops Agent</div>
      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <Terminal size={24} />
            K8s Ops Agent
          </div>
          
          <div className="config-section" style={{ marginTop: '20px' }}>
            <div className="sidebar-header" style={{ fontSize: '14px', marginBottom: '12px' }}>
              <Folder size={16} />
              Active Workspace
            </div>
            
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                {workspacePath || 'No workspace selected (Defaulting to Agent directory)'}
              </div>
              <button 
                onClick={handleSelectWorkspace}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  alignSelf: 'flex-start',
                  transition: 'background 0.2s'
                }}
              >
                Change Workspace
              </button>
            </div>
          </div>
          
          <div className="config-section" style={{ marginTop: 'auto', marginBottom: '20px' }}>
            <div className="sidebar-header" style={{ fontSize: '14px', marginBottom: '12px' }}>
              <Settings size={16} />
              Configuration
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '13px',
              color: isConfigured ? 'var(--accent)' : 'var(--danger)',
              background: 'rgba(0,0,0,0.2)',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {isConfigured ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {isConfigured ? '.env File Loaded' : 'Missing .env Config'}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
              Configure Azure AI Foundry and prompt settings via the <code>.env</code> file in the root directory. Changes apply instantly.
            </p>
          </div>
        </aside>
        
        <main className="chat-area">
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className={`message ${msg.role}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {toolStatus && (
              <div className="tool-status">
                <Activity size={16} />
                {toolStatus}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="input-area">
            <form onSubmit={handleSend} className="input-container">
              <input 
                type="text" 
                placeholder="Ask me to check pods, scale deployments, or view logs..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="send-btn" disabled={!input.trim() || loading}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
