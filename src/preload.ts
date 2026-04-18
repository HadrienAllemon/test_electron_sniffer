import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getItemsBought: () => ipcRenderer.invoke('getItemsBought'),
    getItemsSold: () => ipcRenderer.invoke('getItemsSold'),
    getTransactions: () => ipcRenderer.invoke('getTransactions'),
});
