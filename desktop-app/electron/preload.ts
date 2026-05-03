import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  chat: (message: string, workspacePath?: string) => ipcRenderer.invoke('chat', message, workspacePath),
  getConfig: () => ipcRenderer.invoke('get-config'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  onToolStatus: (callback: (status: string) => void) => {
    const listener = (_event: any, status: string) => callback(status);
    ipcRenderer.on('tool-status', listener);
    return () => ipcRenderer.removeListener('tool-status', listener);
  }
});
