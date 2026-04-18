import { JgdMessage } from "@src/interfaces/MessageMap/JgdMessage";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { itemIdSet } from "@src/sniffer/sqlite/queries";
import { asArray, detectorAll, getAtPath, hasPath } from "./getObjectBySchema";
import { JGD_SCHEMA } from "./jgdSchema";

const hasItemId      = hasPath(JGD_SCHEMA.itemId, v => itemIdSet.has(v));
const hasAuctionInfo = (obj: any): boolean => {
    const raw = getAtPath(obj, JGD_SCHEMA.auctionInfo);
    return asArray(raw).some(a => Buffer.isBuffer(a?.[JGD_SCHEMA.pricesBytes]));
};

export const jgdAnalyzer: IAnalyzer<JgdMessage> = {
    type: "JGD",
    detect: detectorAll(hasItemId, hasAuctionInfo),
    extract: (obj): JgdMessage | null => {
        const itemId: number = getAtPath(obj, JGD_SCHEMA.itemId);
        const raw = getAtPath(obj, JGD_SCHEMA.auctionInfo);
        const auctionInfo = asArray(raw).map(a => ({
            pricesBytes: a[JGD_SCHEMA.pricesBytes] as Buffer,
        }));
        if (!itemId || !auctionInfo.length) return null;
        return { itemId, auctionInfo };
    },
};
