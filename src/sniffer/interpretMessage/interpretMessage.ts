import protobuf from 'protobufjs';
import { takeAction } from './takeAction';
import appendLogs from '../utls/appendLogs';
import { protoCache } from '../protoHandler/loadAllProto';


const typeUrlToProtoFile: { [key: string]: protobuf.Root } = {
    'jhr': protobuf.loadSync('./proto/typeUrl/jhr.proto'),
    // 'iyc': protobuf.loadSync('./proto/typeUrl/iyc.proto'),
    'ipd': protobuf.loadSync('./proto/typeUrl/ipd.proto'),
    'jpx': protobuf.loadSync('./proto/typeUrl/jpx.proto'),
    'imz': protobuf.loadSync('./proto/typeUrl/imz.proto'),
    'jfv': protobuf.loadSync('./proto/typeUrl/jfv.proto'),
    'jif': protobuf.loadSync('./proto/typeUrl/jif.proto'),
    'jcv': protobuf.loadSync('./proto/typeUrl/jcv.proto'),
    'jer': protobuf.loadSync('./proto/typeUrl/jer.proto'),
    'jgd': protobuf.loadSync('./proto/typeUrl/jgd.proto'),
    'jdu': protobuf.loadSync('./proto/typeUrl/jdu.proto'),
};


export const decodeMessage = (typeUrl: string, base64Data: string) => {
    const typeName = typeUrl.split('/').pop();
    if (typeName === "jgd"){
        console.log("Decoded jgd message:", typeUrl, base64Data);
    }

    if (!typeName) return;

    const MessageType = protoCache.get(typeName);

    if (!MessageType) {
        appendLogs(`Unknown message type: ${typeName}, content: ${base64Data}\n\n`);
        return;
    }

    const buffer = Buffer.from(base64Data, 'base64');

    try {
        const decoded = MessageType.decode(buffer);

        const messageContent = MessageType.toObject(decoded, {
            longs: String,
            enums: String,
            defaults: true,
        });

       
        takeAction(typeName, messageContent, base64Data, buffer);

    } catch (error) {
        console.log("Decode failed:", typeName, error);
    }
};
