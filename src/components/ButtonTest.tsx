import { ipcRenderer } from "electron";

export const ButtonTest = () => {
    async function startSniffing() {
        const capInstance = await ipcRenderer.invoke('getItemsBought', { /* args */ });
      }
      
    return (
        <button onClick={startSniffing}>
            test
        </button>
    )
}