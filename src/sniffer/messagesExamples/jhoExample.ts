

/* ----- The following is an example of a jho message -----
 * the content is an array of items sold while the player was offline
 * Though right now the typeurl is JHO, both the typeurl and the content might change in later updates.
 * Breakdown of the message:
    * the content is encoded in protobuf and then converted to base64
    * the items sold in this example were 5*Rossignols, 3*Substrat de futai
    * The schame for this particular message is the following:
        * message JhoMessage {
        *   repeated Item items = 1;
        * }
        * message Item {
            * SaleDetails detail = 1;
            * int32 quantity = 2;
            * int32 itemId = 4;
        * }
        * message SaleDetails {
            * int32 transactionId = 1;
            * int32 price = 2;
        * }
*/

import { handleProto } from "../protoHandler/handleProto";
import { decodeProto } from "../utls/decodeProto";

const protoStr = `ChAKCRDRiLTPBhizEBABIOwTChAKCRD8l7TPBhirexABIK15ChAKCRCLmbTPBhizEBABIOwTChAKCRDQmrTPBhizEBABIOwTChAKCRCVxrTPBhirexABIK15ChAKCRCn6bTPBhirexABIK15ChAKCRCS1LbPBhirexABIK15ChAKCRCT3LbPBhirexABIK15`;

export const jhoExample = {
    typeUrl: "jho",
    content: protoStr,
}

const interpretJhoExample = () => {
    const testBuffer = Buffer.from(jhoExample.content, 'base64');
    const testDecodedProto = decodeProto(testBuffer);
    const testEvent = handleProto(testDecodedProto);

}

//     Original log :     [2026-04-26T10:30:47.909Z] Unknown message type: jho, content: ChAKCRDRiLTPBhizEBABIOwTChAKCRD8l7TPBhirexABIK15ChAKCRCLmbTPBhizEBABIOwTChAKCRDQmrTPBhizEBABIOwTChAKCRCVxrTPBhirexABIK15ChAKCRCn6bTPBhirexABIK15ChAKCRCS1LbPBhirexABIK15ChAKCRCT3LbPBhirexABIK15

