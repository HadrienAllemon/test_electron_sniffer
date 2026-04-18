import { JduMessage } from "@src/interfaces/MessageMap/JduMessage";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { itemIdSet } from "@src/sniffer/sqlite/queries";
import { getAtPath } from "./getObjectBySchema";
import { JDU_SCHEMA } from "./jduSchema";

// jdu is sparse (one field). Placed last in the analyzer chain to avoid false positives.
// Heuristic: field "1" is a number and no other known fields are present.
const isJdu = (obj: any): boolean =>
    typeof obj?.["1"] === "number" &&
    typeof obj?.["2"] === "number" && 
    itemIdSet.has(obj?.["1"]) &&
    obj["3"] == null;

export const jduAnalyzer: IAnalyzer<JduMessage> = {
    type: "JDU",
    detect: isJdu,
    extract: (obj): JduMessage | null => {
        const transactionId: number = getAtPath(obj, JDU_SCHEMA.transactionId);
        if (transactionId == null) return null;
        return { transactionId };
    },
};
