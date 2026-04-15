import { IDbItemPrice } from "@src/interfaces/dbReady/IDbItemPrice";
import { ISaleAnalyzer } from "@src/interfaces/protoObj/ISaleAnalyzer";
import { itemIdSet } from "@src/sniffer/sqlite/queries";
import { detectorAll, hasPath } from "./getObjectBySchema";

const hasItemId = hasPath(["1"], (v) => {
    return itemIdSet.has(v)
});

const hasPrices = hasPath(["3", "1"], v =>
    Array.isArray(v) && 
    v.length > 0 &&
    v.filter(p => typeof p === "number" && p > 0).length >= 3 // at least 3 valid prices (by1, by10, by100)
);


export const saleAnalyzer:ISaleAnalyzer = {
    type:"SALE",
    detect: detectorAll(hasItemId, hasPrices),
    extract: (obj: any): IDbItemPrice | null => {
        try {
            const prices:number[] = obj?.["3"]?.["1"];
            const id:number = obj?.["1"];

            if (!Array.isArray(prices)) return null;

            return {
                itemId: id,
                by1: prices[0] ?? 0,
                by10: prices[1] ?? 0,
                by100: prices[2] ?? 0,
            };
        } catch {
            return null;
        }
    },

    // action: (sale: ItemSale) => {
    //     addAuctionPrices(sale);
    // }
};