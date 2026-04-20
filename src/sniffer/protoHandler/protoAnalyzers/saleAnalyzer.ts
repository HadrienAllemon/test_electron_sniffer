import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { detectorAll, hasPath, hasPathWithEqualValue } from "./getObjectBySchema";
import { SALE_SCHEMA } from "./saleSchema";

const hasItemId = hasPath(SALE_SCHEMA.itemId, v => typeof v === "number");

const hasPrices = hasPath(SALE_SCHEMA.prices, v =>
    Array.isArray(v) &&
    v.filter(p => typeof p === "number" && p > 0).length >= 1
);

const hasDoubleIdMention = hasPathWithEqualValue(SALE_SCHEMA.itemId, SALE_SCHEMA.doubleItemId)

export const saleAnalyzer: IAnalyzer<IDbItemPrice> = {
    type: "SALE",
    detect: detectorAll(hasItemId, hasPrices, hasDoubleIdMention),
    extract: (obj: any): IDbItemPrice | null => {
        try {
            const id: number = obj?.[SALE_SCHEMA.itemId[0]];
            const prices: number[] = obj?.[SALE_SCHEMA.priceGroup[0]]?.[SALE_SCHEMA.prices[1]];

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