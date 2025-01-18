import bufferManager from "./bufferManager"
import chalk from 'chalk';
import { decoders } from "./decoders";
import fs from "node:fs"
import protobuf from 'protobufjs';
import { decodeMessage } from "../interpretMessage/interpretMessage";

// const sellerDecoder2 = protobuf.loadSync('./proto/typeUrl/ipl.proto');
// const IplMessage = sellerDecoder2.lookupType('com.ankama.dofus.server.game.protocol.Ipl');

// const testIplMessage = { "event": { "content": { "type_url": "type.ankama.com/ipl", "value": "ChcIkzoQChoQCOAGEgUIngEYChib2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYm9vsuwYKFwiTOhAKGhAI4AYSBQieARgKGJvb7LsGChcIkzoQChoQCOAGEgUIngEYChib2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYm9vsuwYKFwiTOhAKGhAI4AYSBQieARgKGJvb7LsGChcIkzoQChoQCOAGEgUIngEYChic2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYnNvsuwYKFwiTOhAKGhAI4AYSBQieARgKGJzb7LsGChcIkzoQChoQCOAGEgUIngEYChic2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYndvsuwYKFwiTOhAKGhAI4AYSBQieARgKGJ3b7LsGChcIkzoQZBoQCJ9bEgUIngEYChia5+y7BgoXCJM6EGQaEAifWxIFCJ4BGAoYm+fsuwYKFwiTOhBkGhAIn1sSBQieARgKGJzn7LsGChcIkzoQZBoQCJ9bEgUIngEYChjc7uy7BgoXCJM6EGQaEAifWxIFCJ4BGAoY3e7suwYKGAj/WhBkGhEI6KIEEgUInAMYARjKie27BgoQCO8TEAEaCQisFxjX2++7BgoWCPMLEGQaDwjSPRIECH0YBRih9u+7BgoWCPMLEGQaDwjSPRIECH0YBRiW9++7BgoWCPMLEGQaDwjSPRIECH0YBRiW9++7BgoXCJM6EGQaEAifWxIFCJ4BGAoY1YrwuwYKFwiTOhBkGhAIn1sSBQieARgKGLWS8LsGChcIkzoQZBoQCJ9bEgUIngEYChi2kvC7BgoXCJM6EGQaEAifWxIFCJ4BGAoYiZnwuwYKFwiTOhBkGhAIn1sSBQieARgKGIuZ8LsGChcIkzoQZBoQCJ9bEgUIngEYChiYmfC7BgoXCJM6EGQaEAifWxIFCJ4BGAoYmZnwuwYKFwiTOhBkGhAIn1sSBQieARgKGJqZ8LsGChcIkzoQZBoQCJ9bEgUIngEYChibmfC7BgoWCIs6EAoaDwj+GBIECHAYARimofC7BgoWCIs6EAoaDwj+GBIECHAYARimofC7BgoWCIs6EAoaDwj+GBIECHAYARinofC7BgoWCIs6EAoaDwj+GBIECHAYARinofC7BgoWCIs6EAoaDwj+GBIECHAYARinofC7BgoXCJM6EGQaEAifWxIFCJ4BGAoY8qHwuwYKFwiTOhBkGhAIn1sSBQieARgKGPOh8LsGChcIkzoQZBoQCJ9bEgUIngEYChjOovC7BgoXCJM6EGQaEAifWxIFCJ4BGAoYlKbwuwY=" } } }
export function handlePacket(nbytes: any, trunc: any, buffer: Buffer, lookupType: protobuf.Type) {
    if (trunc) {
        console.log('Packet truncated');
        return;
    }

    const ret = decoders.Ethernet(buffer);
    const ipv4 = decoders.IPV4(buffer, ret.offset);
    const tcp = decoders.TCP(buffer, ipv4.offset);
    const dataLength = ipv4.info.totallen - ipv4.hdrlen - tcp.hdrlen;

    if (ret.info.type !== decoders.PROTOCOL.ETHERNET.IPV4 ||
        ipv4.info.protocol !== decoders.PROTOCOL.IP.TCP ||
        !(tcp.info.srcport === 5555 || tcp.info.dstport === 5555) ||
        dataLength <= 0
    ) {
        return;
    }


    const packetData = buffer.slice(tcp.offset, tcp.offset + dataLength);
    const isClientToServer = tcp.info.dstport === 5555;
    bufferManager.appendToBuffer(isClientToServer, packetData);

    let currentBuffer = bufferManager.getBuffer(isClientToServer);

    while (currentBuffer.length > 0) {

        const [message, remainingBuffer, shouldClear] = bufferManager.processBuffer(lookupType, isClientToServer);
        if (shouldClear) {
            currentBuffer = Buffer.from([]); // Clear the buffer if flagged
            break; // Exit the loop if something went wrong
        }


        const decodedMessage = message?.toJSON();
        const { type_url, value } =
        decodedMessage?.request?.content ||  // request to server variable
        decodedMessage?.event?.content || // event varaibles
        {} 
        if (type_url && value) {
            if (type_url.includes("jpx")) {
                console.log("JPX");
            };
            decodeMessage(type_url, value)
        }

        if (Buffer.compare(remainingBuffer, currentBuffer) === 0) {
            console.log(chalk.red('Partial packet detected - waiting for more data'));
            break;
        }
        currentBuffer = remainingBuffer;
        bufferManager.updateBuffer(isClientToServer, currentBuffer);
        if (!message) {
            // No complete message was found; exit processing
            break;
        }
        // console.log(decodedMessage);
        // Decode the raw message bytes
        // const IPL = IplMessage.decode(rawValueBytes);

        // Convert the decoded message to a plain object
        // const plainMessage = IplMessage.toObject(IPL, {
        //     longs: String, // Convert int64 fields to strings (to handle large numbers)
        //     enums: String, // Convert enums to string names (if any)
        //     defaults: true, // Include default values for unset fields
        //     arrays: true, // Ensure repeated fields are arrays
        //     objects: true, // Ensure nested objects are plain objects
        // });
        // console.log(plainMessage)
        // if (Array.isArray(plainMessage.items)) {
        //     plainMessage.items?.forEach((item: any) => {
        //         console.log(`Item ID: ${item.itemId}, Amount Sold: ${item.amountSold}`);
        //         console.log(item.details);
        //     });
        // }
        // plainMessage.items?.forEach((item: any) => {
        //     console.log(`Item ID: ${item.itemId}, Amount Sold: ${item.amountSold}`);
        //     item.details.forEach((detail: any) => {
        //         console.log(`    Total Gains: ${detail.totalGains}`);
        //     });
        // });



        // const typeUrl = decodedMessage?.event?.content?.type_url?.split(/\//)?.[1]
        // if (!typeUrl) return
        // if (typeUrl === "iyc") {
        //     const rawValueBytes = Buffer.from(decodedMessage.event.content.value, 'base64');

        //     // console.log(IycMessage.decode(rawValueBytes))
        // } else if (typeUrl === "igs") {
        //     // player map info
        // } else if (typeUrl === "iwh") {
        //     // player map info
        // } else if (typeUrl === "jrn") {
        //     console.log("notif koli ?")
        // } else if (typeUrl === "ipd") {
        //     const rawValueBytes = Buffer.from(decodedMessage.event.content.value, 'base64');
        //     console.log(IpdMessage.decode(rawValueBytes));
        //     console.log("mise en vente", decodedMessage)
        // if (typeUrl === "jpx") {
        //     const decodedMessage = message.toJSON();
        //     const typeUrl = decodedMessage?.event?.content?.type_url?.split(/\//)?.[1]
        //     console.log(decodedMessage)
        //     const rawValueBytes = Buffer.from(decodedMessage.event.content.value, 'base64');

        //     // Manually extract segments
        //     const field2Length = buffer[2]; // Length of the first item value
        //     const itemValue1 = rawValueBytes.slice(3, 3 + field2Length).toString('utf-8'); // Extract ASCII

        //     const field3Length = buffer[8]; // Adjust based on previous field length
        //     const itemValue2 = rawValueBytes.slice(9, 9 + field3Length).toString('utf-8');

        //     // Continue for other fields...
        //     const values = itemValue1.split(/[^0-9]/).filter(a => a.length)
        //     console.log("price=", values[0], "id=", values[1]);
        //     // console.log('Item Value 1:', itemValue1.split(/[^0-9]/).filter(a => a.length));
        //     // console.log('Item Value 2:', itemValue2);
        //     // console.log("32BE", rawValueBytes.readUInt32BE(3))
        //     // console.log("VENDU !!", decodedMessage)
        // }
        // else {
        //     console.log(decodedMessage)
        // }
        // console.log(`[${isClientToServer ? 'C->S' : 'S->C'}] Decoded message:`, message.toJSON());


        // if (Buffer.compare(remainingBuffer, currentBuffer) === 0) {
        //     console.log(chalk.red('Partial packet detected - waiting for more data'));
        //     break;
        // }


    }
}