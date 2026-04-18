import { JerMessage } from "@src/interfaces/MessageMap/JerMessage";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { itemIdSet } from "@src/sniffer/sqlite/queries";
import { asArray, getAtPath } from "./getObjectBySchema";
import { JER_SCHEMA } from "./jerSchema";

const { item: F } = JER_SCHEMA;

// A jer message has field "2" as a repeated Item, each with a known itemId at field "1".
const isJer = (obj: any): boolean => {
    const raw = getAtPath(obj, JER_SCHEMA.items);
    const items = asArray(raw);
    return items.length > 0 && items.every(i => itemIdSet.has(i?.[F.itemId]));
};

export const jerAnalyzer: IAnalyzer<JerMessage> = {
    type: "JER",
    detect: isJer,
    extract: (obj): JerMessage | null => {
        const raw = getAtPath(obj, JER_SCHEMA.items);
        const items = asArray(raw);
        if (!items.length) return null;
        return {
            items: items.map(i => ({
                itemId:     i[F.itemId],
                amountSold: i[F.amountSold] ?? 0,
                details: {
                    totalGains: i?.[F.details]?.[F.totalGains[1]] ?? 0,
                },
            })),
        };
    },
};
