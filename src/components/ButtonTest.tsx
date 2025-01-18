import { ipcRenderer } from "electron";

export const ButtonTest = () => {
    async function startSniffing() {
        const capInstance = await ipcRenderer.invoke('start-sniffing', { /* args */ });
        console.log('Cap instance:');
      }
      
    return (
        <button onClick={startSniffing}>
            test
        </button>
    )
}