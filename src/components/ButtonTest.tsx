export const ButtonTest = () => {
    async function startSniffing() {
        const capInstance = await window.api.getItemsBought();
      }
      
    return (
        <button onClick={startSniffing}>
            test
        </button>
    )
}