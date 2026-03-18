import chalk from 'chalk';
import protobuf from 'protobufjs';
import fs from 'node:fs';
const root = protobuf.loadSync('./proto/game/message.proto');
const MAX_MESSAGE_SIZE = 1_000_000; // 1MB

class BufferManager {
    private clientBuffer: Buffer = Buffer.alloc(0);
    private serverBuffer: Buffer = Buffer.alloc(0);

    appendToBuffer(isClientToServer: boolean, data: Uint8Array): void {
        if (isClientToServer) {
            this.clientBuffer = Buffer.concat([this.clientBuffer, data]);
        } else {
            this.serverBuffer = Buffer.concat([this.serverBuffer, data]);
        }
    }

    getBuffer(isClientToServer: boolean): Buffer {
        return isClientToServer ? this.clientBuffer : this.serverBuffer;
    }

    updateBuffer(isClientToServer: boolean, newBuffer: Buffer): void {
        if (isClientToServer) {
            this.clientBuffer = newBuffer;
        } else {
            this.serverBuffer = newBuffer;
        }
    }

    clearBuffer(isClientToServer: boolean): void {
        if (isClientToServer) {
            this.clientBuffer = Buffer.alloc(0);
        } else {
            this.serverBuffer = Buffer.alloc(0);
        }
    }

    testDataParser(lookupType: protobuf.Type, messageData:Uint8Array): void {
        const message = lookupType.decode(messageData);
        const json = message.toJSON();

        const content =
            json?.request?.content ||
            json?.event?.content;

        if (!content?.type_url || !content?.value) return;

        const typeName = content.type_url.split("/").pop();

        try {
            const innerType = root.lookupType(typeName);

            const innerBuffer = Buffer.isBuffer(content.value)
                ? content.value
                : Buffer.from(content.value, "base64");

            const decodedInner = innerType.decode(innerBuffer);

            console.log("Decoded inner:", decodedInner.toJSON());
        } catch (e) {
            console.error("Failed to decode inner message:", typeName, e);
        }

    }

    /**
     * Attempts to decode one complete protobuf message from the buffer.
     * Returns:
     *   - message:         the decoded message, or null if none could be read
     *   - remainingBuffer: the buffer after the consumed message
     *   - shouldClear:     true if the buffer is corrupted and should be discarded
     */
    processBuffer(
        lookupType: protobuf.Type,
        isClientToServer: boolean,
    ): [protobuf.Message | null, Buffer, boolean] {
        const buffer = this.getBuffer(isClientToServer);

        const [size, sizeLength] = this.decodeVarint(buffer);

        if (size > MAX_MESSAGE_SIZE) {
            console.warn(chalk.yellow(`Buffer possibly corrupted — message size too large: ${size}`));
            return [null, Buffer.alloc(0), true];
        }

        if (size === 0 || buffer.length < sizeLength + size) {
            console.log(chalk.red('Incomplete message — waiting for more data'));
            fs.appendFile(
                './logs.txt',
                `DATA TOO LARGE — size: ${size}, sizeLength: ${sizeLength}, bufLen: ${buffer.length}\n`,
                () => { },
            );
            return [null, buffer, false];
        }

        const messageData = buffer.subarray(sizeLength, sizeLength + size);
        console.log(messageData)
        const remainingBuffer = buffer.subarray(sizeLength + size);

        /* -------------------------------- DEBUG LOGGING ------------------------------- */
        // try {
        //     this.testDataParser(lookupType, messageData);
        // } catch (error) {
        //     console.warn(chalk.yellow(`Failed to parse message for debugging: ${error}`));
        // }
        /* -------------------------------- DEBUG LOGGING ------------------------------- */

        fs.appendFile(
            './logs.txt',
            `Buffer slice [${sizeLength}, ${sizeLength + size}]: ${messageData.toString('base64')}\n`,
            () => { },
        );

        try {
            const message = lookupType.decode(messageData);
            return [message, remainingBuffer, false];
        } catch (error) {
            return [null, remainingBuffer, false];
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

const bufferManager = new BufferManager();
export default bufferManager;