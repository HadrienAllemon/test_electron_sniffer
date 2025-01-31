
import protobuf from 'protobufjs';
import startSniffing from './sniffer/sniffer';
import { ensureDB } from './sqlite/ensureDatabase';
// const Cap = require('cap').Cap;
// const decoders = require('cap').decoders;
// const PROTOCOL = decoders.PROTOCOL;

// type readableInterface = {
//     [key: string]: any
// }

// const base64 = require('base-64');

// Decode Base64 value to get raw bytes

// const chatDecoder = protobuf.loadSync('./proto/typeUrl/iyc.proto');
// const hdvDecoder = protobuf.loadSync('./proto/typeUrl/ipd.proto');
// const sellerDecoder = protobuf.loadSync('./proto/typeUrl/jpx.proto');

const root = protobuf.loadSync('./proto/game/message.proto');
const Message = root.lookupType('com.ankama.dofus.server.game.protocol.Message');
// const IycMessage = chatDecoder.lookupType('com.ankama.dofus.server.game.protocol.Iyc');
// const IpdMessage = hdvDecoder.lookupType('com.ankama.dofus.server.game.protocol.Ipd');
// const JpxMessage = sellerDecoder.lookupType('com.ankama.dofus.server.game.protocol.Jpx');



// const testIplMessage = { "event": { "content": { "type_url": "type.ankama.com/ipl", "value": "ChcIkzoQChoQCOAGEgUIngEYChib2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYm9vsuwYKFwiTOhAKGhAI4AYSBQieARgKGJvb7LsGChcIkzoQChoQCOAGEgUIngEYChib2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYm9vsuwYKFwiTOhAKGhAI4AYSBQieARgKGJvb7LsGChcIkzoQChoQCOAGEgUIngEYChic2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYnNvsuwYKFwiTOhAKGhAI4AYSBQieARgKGJzb7LsGChcIkzoQChoQCOAGEgUIngEYChic2+y7BgoXCJM6EAoaEAjgBhIFCJ4BGAoYndvsuwYKFwiTOhAKGhAI4AYSBQieARgKGJ3b7LsGChcIkzoQZBoQCJ9bEgUIngEYChia5+y7BgoXCJM6EGQaEAifWxIFCJ4BGAoYm+fsuwYKFwiTOhBkGhAIn1sSBQieARgKGJzn7LsGChcIkzoQZBoQCJ9bEgUIngEYChjc7uy7BgoXCJM6EGQaEAifWxIFCJ4BGAoY3e7suwYKGAj/WhBkGhEI6KIEEgUInAMYARjKie27BgoQCO8TEAEaCQisFxjX2++7BgoWCPMLEGQaDwjSPRIECH0YBRih9u+7BgoWCPMLEGQaDwjSPRIECH0YBRiW9++7BgoWCPMLEGQaDwjSPRIECH0YBRiW9++7BgoXCJM6EGQaEAifWxIFCJ4BGAoY1YrwuwYKFwiTOhBkGhAIn1sSBQieARgKGLWS8LsGChcIkzoQZBoQCJ9bEgUIngEYChi2kvC7BgoXCJM6EGQaEAifWxIFCJ4BGAoYiZnwuwYKFwiTOhBkGhAIn1sSBQieARgKGIuZ8LsGChcIkzoQZBoQCJ9bEgUIngEYChiYmfC7BgoXCJM6EGQaEAifWxIFCJ4BGAoYmZnwuwYKFwiTOhBkGhAIn1sSBQieARgKGJqZ8LsGChcIkzoQZBoQCJ9bEgUIngEYChibmfC7BgoWCIs6EAoaDwj+GBIECHAYARimofC7BgoWCIs6EAoaDwj+GBIECHAYARimofC7BgoWCIs6EAoaDwj+GBIECHAYARinofC7BgoWCIs6EAoaDwj+GBIECHAYARinofC7BgoWCIs6EAoaDwj+GBIECHAYARinofC7BgoXCJM6EGQaEAifWxIFCJ4BGAoY8qHwuwYKFwiTOhBkGhAIn1sSBQieARgKGPOh8LsGChcIkzoQZBoQCJ9bEgUIngEYChjOovC7BgoXCJM6EGQaEAifWxIFCJ4BGAoYlKbwuwY=" } } }
// ensureDB()
// decodeMessage(testIplMessage.event.content.type_url, testIplMessage.event.content.value);
// exmapleSniffing()
const sniff = () => {
    startSniffing(Message)
}

// interpretItems()

// const addItemsIdToDb = () => {
//     fs.readFile('./ids.txt', 'utf8', (err, data) => {
//         const splittedline = data.split("\n")
//         for (let i = 0; i < splittedline.length; i++) {
//             let line = splittedline[i];
//             let match = line.match(/^(\d+)\s+(.*\S)/);
//             if (!match) continue;
//             let id = match[1];
//             let itemName = match[2];
//         }
//     })
// };


// addItemsIdToDb()

export default sniff