import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  chat: (message: string) => ipcRenderer.invoke('chat', message),
  getConfig: () => ipcRenderer.invoke('get-config'),
  onToolStatus: (callback: (status: string) => void) => {
    const listener = (_event: any, status: string) => callback(status);
    ipcRenderer.on('tool-status', listener);
    return () => ipcRenderer.removeListener('tool-status', listener);
  }
});
