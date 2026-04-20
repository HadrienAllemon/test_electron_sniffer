import { IDbItemSold } from "@src/interfaces/dbReady/IDbItemSold";
import { OfflineAuctionMessage } from "@src/interfaces/MessageMap/OfflineAuctionMessage";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { itemIdSet } from "@src/sniffer/sqlite/queries";
import { detectorAll, getAtPath, hasPath } from "./getObjectBySchema";
import { OFFLINE_AUCTION_SCHEMA } from "./offlineAuctionSchema";

const hasItemId = hasPath(OFFLINE_AUCTION_SCHEMA.itemId, v => typeof v === "number" && itemIdSet.has(v));
const hasQuantity = hasPath(OFFLINE_AUCTION_SCHEMA.quantity, v => typeof v === "number" && v > 0 && [1, 10, 100, 1000].includes(v));
const hasTotalGain = hasPath(OFFLINE_AUCTION_SCHEMA.totalGain, v => typeof v === "number" && v > 0);
const isArrayOfItem = (v: any[]) => v.every(item =>
    hasItemId(item) &&
    hasQuantity(item) &&
    hasTotalGain(item)
);

const isArray = hasPath(OFFLINE_AUCTION_SCHEMA.items, (v: any) =>
    Array.isArray(v) && isArrayOfItem(v)
);

export const offlineAuctionAnalyzer: IAnalyzer<IDbItemSold[]> = {
    type: "OFFLINE_AUCTION",
    detect: detectorAll(isArray),
    extract: (obj): IDbItemSold[] | null => {
        const items: any[] = getAtPath(obj, OFFLINE_AUCTION_SCHEMA.items);
        if (!Array.isArray(items)) return null;
        const results:IDbItemSold[] = items.flatMap(item => {
            const itemId = getAtPath(item, OFFLINE_AUCTION_SCHEMA.itemId);
            const amountSold = getAtPath(item, OFFLINE_AUCTION_SCHEMA.quantity);
            const profit = getAtPath(item, OFFLINE_AUCTION_SCHEMA.totalGain);
            return { itemId, amountSold, profit };
        });
        return results.length ? results : null;
    },
};
