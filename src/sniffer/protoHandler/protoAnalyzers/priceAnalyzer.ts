import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { detectorAll, hasPath, hasPathWithEqualValue } from "./getObjectBySchema";
import { PRICE_SCHEMA } from "./priceSchema";

const hasItemId = hasPath(PRICE_SCHEMA.itemId, v => typeof v === "number");

const hasPrices = hasPath(PRICE_SCHEMA.prices, v =>
    Array.isArray(v) &&
    v.filter(p => typeof p === "number" && p > 0).length >= 1
);

const hasDoubleIdMention = hasPathWithEqualValue(PRICE_SCHEMA.itemId, PRICE_SCHEMA.doubleItemId)

export const priceAnalyzer: IAnalyzer<IDbItemPrice> = {
    type: "PRICE",
    detect: detectorAll(hasItemId, hasPrices, hasDoubleIdMention),
    extract: (obj: any): IDbItemPrice | null => {
        try {
            const id: number = obj?.[PRICE_SCHEMA.itemId[0]];
            const prices: number[] = obj?.[PRICE_SCHEMA.priceGroup[0]]?.[PRICE_SCHEMA.prices[1]];

            if (!Array.isArray(prices)) return null;

            return {
                itemId: id,
                by1:    prices[0] ?? null,
                by10:   prices[1] ?? null,
                by100:  prices[2] ?? null,
                by1000: prices[3] ?? null,
            };
        } catch {
            return null;
        }
    },
};