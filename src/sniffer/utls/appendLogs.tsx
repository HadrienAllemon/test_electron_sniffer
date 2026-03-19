import fs from 'fs';

function appendLogs(log: string) {
    const timestamp = new Date().toISOString();
    const timeStapStr = `[${timestamp}] `;
    fs.appendFile(
        './logs.txt',
        timeStapStr + log,
        () => { },
    );
}

export default appendLogs;