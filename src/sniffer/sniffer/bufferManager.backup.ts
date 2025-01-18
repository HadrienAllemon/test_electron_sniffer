// @ts-nocheck 
import chalk from 'chalk';
class BufferManager2class {
    constructor() {
        this.clientBuffer = Buffer.from([]); 
        this.serverBuffer = Buffer.from([]);
    }

    appendToBuffer(isClientToServer, data) {
        if (isClientToServer) {
            this.clientBuffer = Buffer.concat([this.clientBuffer, data]);
        } else {
            this.serverBuffer = Buffer.concat([this.serverBuffer, data]);
        }
    }

    getBuffer(isClientToServer) {
        return isClientToServer ? this.clientBuffer : this.serverBuffer;
    }

    updateBuffer(isClientToServer, newBuffer) {
        if (isClientToServer) {
            this.clientBuffer = newBuffer;
        } else {
            this.serverBuffer = newBuffer;
        }
    }

    clearBuffer(isClientToServer) {
        if (isClientToServer) {
            this.clientBuffer = Buffer.from([]);
        } else {
            this.serverBuffer = Buffer.from([]);
        }
    }
    
}

class BufferManager {
    public clientBuffer: Buffer
    public serverBuffer: Buffer
    constructor() {
        this.clientBuffer = Buffer.from([]);
        this.serverBuffer = Buffer.from([]);
    }

    appendToBuffer(isClientToServer: boolean, data: Uint8Array) {
        if (isClientToServer) {
            this.clientBuffer = Buffer.concat([this.clientBuffer, data]);
        } else {
            this.serverBuffer = Buffer.concat([this.serverBuffer, data]);
        }
    }

    getBuffer(isClientToServer: boolean) {
        return isClientToServer ? this.clientBuffer : this.serverBuffer;
    }

    updateBuffer(isClientToServer: boolean, newBuffer: Buffer) {
        if (isClientToServer) {
            this.clientBuffer = newBuffer;
        } else {
            this.serverBuffer = newBuffer;
        }
    }

    clearBuffer(isClientToServer: boolean) {
        if (isClientToServer) {
            this.clientBuffer = Buffer.from([]);
        } else {
            this.serverBuffer = Buffer.from([]);
        }
    }
    
    processBuffer(lookupType: protobuf.Type, isClientToServer: boolean): [protobuf.Message<{}> | null, Buffer, boolean] {
        try {
            // Read message size
            const buffer = isClientToServer ? this.clientBuffer : this.serverBuffer
            const [size, sizeLength] = this.decodeVarint(buffer);

            // Sanity check
            if (size > 1000000) { // 1MB max
                console.log('Warning: Buffer possibly corrupted. Message size too large:', size);
                return [null, Buffer.from([]), true];
            }

            // Check if we have complete message
            if (size === 0 || buffer.length < sizeLength + size) {
                console.log(chalk.red('Incomplete message - waiting for more data'));
                return [null, buffer, false];
            }

            // Extract message
            const messageData = buffer.slice(sizeLength, sizeLength + size);
            const remainingBuffer = buffer.slice(sizeLength + size);

            try {
                const message = lookupType.decode(messageData);
                return [message, remainingBuffer, false];
            } catch (e) {
                console.log("error decoding message", e)
                return [null, remainingBuffer, false];
            }

        } catch (e) {
            console.log('Error processing buffer:', e);
            return [null, Buffer.from([]), true];
        }
    }

    decodeVarint(buffer: Buffer) {
        let result = 0;
        let shift = 0;
        let bytesRead = 0;

        while (true) {
            if (bytesRead >= buffer.length) {
                return [0, 0];
            }
            const byte = buffer[bytesRead];
            result |= (byte & 0x7F) << shift;
            bytesRead++;
            if ((byte & 0x80) === 0) {
                break;
            }
            shift += 7;
        }

        return [result, bytesRead];
    }
}

// function processBuffer(buffer: Buffer, lookupType: protobuf.Type): [protobuf.Message<{}> | null, Buffer, boolean] {
//     try {
//         // Read message size
//         const [size, sizeLength] = decodeVarint(buffer);

//         // Sanity check
//         if (size > 1000000) { // 1MB max
//             console.log('Warning: Buffer possibly corrupted. Message size too large:', size);
//             return [null, Buffer.from([]), true];
//         }

//         // Check if we have complete message
//         if (size === 0 || buffer.length < sizeLength + size) {
//             console.log(chalk.red('Incomplete message - waiting for more data'));
//             return [null, buffer, false];
//         }

//         // Extract message
//         const messageData = buffer.slice(sizeLength, sizeLength + size);
//         const remainingBuffer = buffer.slice(sizeLength + size);

//         try {
//             const message = lookupType.decode(messageData);
//             return [message, remainingBuffer, false];
//         } catch (e) {
//             console.log("error decoding message", e)
//             return [null, remainingBuffer, false];
//         }

//     } catch (e) {
//         console.log('Error processing buffer:', e);
//         return [null, Buffer.from([]), true];
//     }
// }

// function decodeVarint(buffer: Buffer) {
//     let result = 0;
//     let shift = 0;
//     let bytesRead = 0;

//     while (true) {
//         if (bytesRead >= buffer.length) {
//             return [0, 0];
//         }
//         const byte = buffer[bytesRead];
//         result |= (byte & 0x7F) << shift;
//         bytesRead++;
//         if ((byte & 0x80) === 0) {
//             break;
//         }
//         shift += 7;
//     }

//     return [result, bytesRead];
// }

const bufferManager = new BufferManager();
export default bufferManager