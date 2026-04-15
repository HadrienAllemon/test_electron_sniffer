import protobuf from 'protobufjs';
import { takeAction } from './takeAction';
import appendLogs from '../utls/appendLogs';
import { protoCache } from '../protoHandler/loadAllProto';
import { decodeProto } from '../utls/decodeProto';
import { handleProto } from '../protoHandler/handleProto';


export const decodeMessage = (typeUrl: string, base64Data: string) => {
    const typeName = typeUrl.split('/').pop();

    if (!typeName) return;
    
    const MessageType = protoCache.get(typeName);

    if (!MessageType) {
        appendLogs(`Unknown message type: ${typeName}, content: ${base64Data}\n\n`);
    }

    const buffer = Buffer.from(base64Data, 'base64');

    try {
        const decodedProto = decodeProto(buffer);
        const protoEvent = handleProto(decodedProto);
        if (typeUrl === "type.ankama.com/jct"){
            console.log("jct");
        }
        if (protoEvent) {
            takeAction(protoEvent.type, protoEvent.data, base64Data, buffer);
        } else {
            appendLogs(`Unrecognized proto message type: ${typeName}, content: ${base64Data}\n\n`);
        }
        // const decoded = MessageType.decode(buffer);

        // const messageContent = MessageType.toObject(decoded, {
        //     longs: String,
        //     enums: String,
        //     defaults: true,
        // });

        
        // takeAction(typeName, messageContent, base64Data, buffer);

    } catch (error) {
        console.log("Decode failed:", typeName, error);
    }
};
