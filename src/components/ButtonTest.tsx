import { ipcRenderer } from "electron";

export const ButtonTest = () => {
    async function startSniffing() {
        // const capInstance = await (window as any).electron.ipcRenderer.invoke('start-sniffing', { /* args */ });
        console.log('Cap instance:');
      }
      
    return (
        <button onClick={startSniffing}>
            test
        </button>
    )
}