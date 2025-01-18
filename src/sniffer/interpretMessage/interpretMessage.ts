import protobuf from 'protobufjs';
import { takeAction } from './takeAction';


const typeUrlToProtoFile: { [key: string]: protobuf.Root } = {
    'ipl': protobuf.loadSync('./proto/typeUrl/ipl.proto'),
    // 'iyc': protobuf.loadSync('./proto/typeUrl/iyc.proto'),
    'ipd': protobuf.loadSync('./proto/typeUrl/ipd.proto'),
    'jpx': protobuf.loadSync('./proto/typeUrl/jpx.proto'),
    'imz': protobuf.loadSync('./proto/typeUrl/imz.proto'),
    'ina': protobuf.loadSync('./proto/typeUrl/ina.proto')
};


export const decodeMessage = (typeUrl: string, base64Data: string) => {
    const typeName = typeUrl.split('/').pop(); // Extract the type name
    if (typeName === "imz") console.log("IMZ : ", base64Data)
    if (!typeName){
        console.error("No type name in ", typeUrl)
        return;
    }
    const protoRoot = typeUrlToProtoFile[typeName];
    if (!protoRoot) {
        // console.error(`Unknown type URL: ${typeUrl}`);
        return;
    }
   
    

    const MessageType = protoRoot.lookupType(`com.ankama.dofus.server.game.protocol.${typeName}`);

    const buffer = Buffer.from(base64Data, 'base64');
    try{
        console.log(typeUrl, base64Data)
        const decodedMessage = MessageType.decode(buffer);
        const messageContent = MessageType.toObject(decodedMessage, {
            longs: String, 
            enums: String, 
            defaults: true,  
            arrays: true,   
            objects: true,   
        });
        takeAction(typeName, messageContent, base64Data,buffer)
    } catch (error){
        console.log("failed to decode message", buffer, typeName, error)
    }
    // console.log(base64Data)

  
}
