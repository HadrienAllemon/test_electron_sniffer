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
        console.log(typeUrl)

        const decodedProto = decodeProto(buffer);
        const protoEvent = handleProto(decodedProto);
      
        if (protoEvent) {
            takeAction(protoEvent.type, protoEvent.data);
        } else {
            appendLogs(`Unrecognized proto message type: ${typeName}, content: ${base64Data}\n\n`);
        }


    } catch (error) {
        console.log("Decode failed:", typeName, error);
    }
};
