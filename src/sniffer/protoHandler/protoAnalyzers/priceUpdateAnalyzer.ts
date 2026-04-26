import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { detectorAll, hasPath } from "./getObjectBySchema";
import { PRICE_UPDATE_SCHEMA } from "./priceUpdateSchema";

const hasItemId = hasPath(PRICE_UPDATE_SCHEMA.itemId, v => {
    return typeof v === "number" && v > 0;
});
const hasTransactionId = hasPath(PRICE_UPDATE_SCHEMA.transactionId, v => {
    return typeof v === "number" && v > 0;
});

const hasPrices = hasPath(PRICE_UPDATE_SCHEMA.prices, v =>{
    return Array.isArray(v) &&
    v.filter(p => typeof p === "number" && p > 0).length >= 1
});


export const priceUpdateAnalyzer: IAnalyzer<IDbItemPrice> = {
    type: "PRICE_UPDATE",
    detect: detectorAll(hasItemId, hasPrices, hasTransactionId),
    extract: (obj: any): IDbItemPrice | null => {
        try {
            const id: number = obj?.[PRICE_UPDATE_SCHEMA.itemId[0]];
            const prices: number[] = obj?.[PRICE_UPDATE_SCHEMA.prices[0]] ?? [];

            if (!Array.isArray(prices)) return null;

            return {
                itemId: id,
                by1: prices[0] ?? null,
                by10: prices[1] ?? null,
                by100: prices[2] ?? null,
                by1000: prices[3] ?? null,
            };
        } catch {
            return null;
        }
    },
};