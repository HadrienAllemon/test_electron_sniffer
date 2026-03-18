import chalk from 'chalk';
import protobuf from 'protobufjs';
import bufferManager from './bufferManager';
import { decoders } from './decoders';
import { decodeMessage } from '../interpretMessage/interpretMessage';

export function handlePacket(nbytes: any, trunc: any, buffer: Buffer, lookupType: protobuf.Type): void {
    if (trunc) {
        console.log('Packet truncated');
        return;
    }

    const ethernet = decoders.Ethernet(buffer);
    const ipv4 = decoders.IPV4(buffer, ethernet.offset);
    const tcp = decoders.TCP(buffer, ipv4.offset);
    const dataLength = ipv4.info.totallen - ipv4.hdrlen - tcp.hdrlen;

    const isRelevantPacket =
        ethernet.info.type === decoders.PROTOCOL.ETHERNET.IPV4 &&
        ipv4.info.protocol === decoders.PROTOCOL.IP.TCP &&
        (tcp.info.srcport === 5555 || tcp.info.dstport === 5555) &&
        dataLength > 0;
    if (!isRelevantPacket) return;

    const packetData = buffer.slice(tcp.offset, tcp.offset + dataLength);
    const isClientToServer = tcp.info.dstport === 5555;

    bufferManager.appendToBuffer(isClientToServer, packetData);

    let currentBuffer = bufferManager.getBuffer(isClientToServer);

    while (currentBuffer.length > 0) {
        const [message, remainingBuffer, shouldClear] = bufferManager.processBuffer(lookupType, isClientToServer);
        console.log(message, remainingBuffer, shouldClear)
        if (shouldClear) {
            bufferManager.clearBuffer(isClientToServer);
            break;
        }

        if (Buffer.compare(remainingBuffer, currentBuffer) === 0) {
            console.log(chalk.red('Partial packet detected — waiting for more data'));
            break;
        }

        currentBuffer = remainingBuffer;
        bufferManager.updateBuffer(isClientToServer, currentBuffer);

        if (!message) break;

        const decoded = message.toJSON();
        const content = decoded?.request?.content ?? decoded?.event?.content;

        if (content?.type_url && content?.value) {
            decodeMessage(content.type_url, content.value);
        }
    }
}