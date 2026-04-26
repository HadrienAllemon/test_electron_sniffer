import { handleProto } from "../protoHandler/handleProto";
import { decodeProto } from "../utls/decodeProto";

// original log [2026-04-26T11:26:25.965Z] Unrecognized proto message type: jfv, content: CD8Q9IUBGggetQK1E7rpASiwnQI=
const protoStr = `CD8Q9IUBGggetQK1E7rpASiwnQI=`;


export const jhoExample = {
    typeUrl: "jfv",
    content: protoStr,
}

const interpretJhoExample = () => {
    const testBuffer = Buffer.from(jhoExample.content, 'base64');
    const testDecodedProto = decodeProto(testBuffer);
    const testEvent = handleProto(testDecodedProto);
}
