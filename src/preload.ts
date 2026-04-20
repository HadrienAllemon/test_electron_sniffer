import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getItemsBought: () => ipcRenderer.invoke('getItemsBought'),
    getItemsSold: () => ipcRenderer.invoke('getItemsSold'),
    getTransactions: () => ipcRenderer.invoke('getTransactions'),
    getPetItemXpRatios: () => ipcRenderer.invoke('getPetItemXpRatios'),
    onPricesUpdated: (callback: () => void) => ipcRenderer.on('prices-updated', callback),
    searchItems: (query: string) => ipcRenderer.invoke('searchItems', query),
    addPetItemXp: (itemId: number, xp: number) => ipcRenderer.invoke('addPetItemXp', itemId, xp),
});
