import chalk from 'chalk';
import protobuf from 'protobufjs';
import fs from "node:fs";

class BufferManager {
    public clientBuffer: Buffer
    public serverBuffer: Buffer
    public errorCount: number = 0
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
        console.log("clearing buffer")
        if (isClientToServer) {
            this.clientBuffer = Buffer.from([]);
        } else {
            this.serverBuffer = Buffer.from([]);
        }
        this.errorCount = 0
    }
    processBuffer(lookupType: protobuf.Type, isClientToServer: boolean): [protobuf.Message<{}> | null, Buffer, boolean] {
        try {
            // Read message size
            let buffer = this.getBuffer(isClientToServer)
            const [size, sizeLength] = this.decodeVarint(buffer);
            fs.appendFile("./logs.txt", `Buffer, taking  from ${sizeLength} to ${sizeLength + size}  ${buffer.subarray(sizeLength, sizeLength + size).toString("base64")} \n  `, () => { })
            // Sanity check
            if (size > 1000000) { // 1MB max
                console.log('Warning: Buffer possibly corrupted. Message size too large:', size);
                debugger;
                return [null, Buffer.from([]), true];
            }

            // Check if we have complete message
            if (size === 0 || buffer.length < sizeLength + size) {
                if (size === 0) debugger
                console.log(chalk.red('Incomplete message - waiting for more data'));
                fs.appendFile("./logs.txt", `DATA TOO LARGE, ${size} ${sizeLength} ${buffer.length} ${buffer.subarray(sizeLength, sizeLength + size + 50).toString("base64")}\n`, () => { })
                return [null, buffer, false];
            }

            // Extract message
            const messageData = buffer.subarray(sizeLength, sizeLength + size);
            const remainingBuffer = buffer.subarray(sizeLength + size);

            try {
                const message = lookupType.decode(messageData);
                return [message, remainingBuffer, false];
            } catch (e) {
                return [null, remainingBuffer, false];
            }

        } catch (e) {
            console.log('Error processing buffer:', e);
            return [null, Buffer.from([]), true];
        }
    }

    // decodeVarint(buffer: Buffer): [number, number] {
    //     try {
    //         const reader = protobuf.Reader.create(buffer);
    //         const size = reader.uint32();
    //         const sizeLength = reader.pos; // Number of bytes read for the Varint
    //         return [size, sizeLength];
    //     } catch (err:any) {
    //         console.log(chalk.red('Error decoding Varint:', err.message));
    //         return [0, 0];
    //     }
    // }
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