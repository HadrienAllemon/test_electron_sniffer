import { JhrMessage } from "@src/interfaces/MessageMap/JhrMessage";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import {itemIdNameMap, itemIdSet} from "@src/sniffer/sqlite/queries";
import { detectorAll, getAtPath, hasPath } from "./getObjectBySchema";
import { JHR_SCHEMA } from "./jhrSchema";

const hasItemId = hasPath(JHR_SCHEMA.itemId, v => itemIdSet.has(v));
const hasPrice  = hasPath(JHR_SCHEMA.price,  v => typeof v === "number" && v > 0 && v in [1,10,100,1000]);

export const jhrAnalyzer: IAnalyzer<JhrMessage> = {
    type: "JHR",
    detect: detectorAll(hasItemId, hasPrice),
    extract: (obj): JhrMessage | null => {
        const price: number   = getAtPath(obj, JHR_SCHEMA.price);
        const itemId: number  = getAtPath(obj, JHR_SCHEMA.itemId);
        const amountSold: number = getAtPath(obj, JHR_SCHEMA.amountSold) ?? 0;
        if (!price || !itemId) return null;
        return { price, itemInfo: { itemId, amountSold } };
    },
};
