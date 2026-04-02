import protobuf from 'protobufjs';
import { takeAction } from './takeAction';
import appendLogs from '../utls/appendLogs';


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
};


export const decodeMessage = (typeUrl: string, base64Data: string) => {
    const typeName = typeUrl.split('/').pop(); // Extract the type name
    if (!typeName) {
        console.error("No type name in ", typeUrl)
        return;
    }
    const protoRoot = typeUrlToProtoFile[typeName];
    if (!protoRoot) {
        console.error(`Unknown type URL: ${typeUrl}`);
        appendLogs(`Unknown message type: ${typeName}, content: ${JSON.stringify(base64Data)}\n\n`);
        console.error("Log appended")
        return;
    }



    const MessageType = protoRoot.lookupType(`com.ankama.dofus.server.game.protocol.${typeName}`);

    const buffer = Buffer.from(base64Data, 'base64');
    try {
        console.log(typeUrl, base64Data)
        const decodedMessage = MessageType.decode(buffer);
        const messageContent = MessageType.toObject(decodedMessage, {
            longs: String,
            enums: String,
            defaults: true,
            arrays: true,
            objects: true,
        });
        takeAction(typeName, messageContent, base64Data, buffer)
    } catch (error) {
        console.log("failed to decode message", buffer, typeName, error)
    }
    // console.log(base64Data)


}
