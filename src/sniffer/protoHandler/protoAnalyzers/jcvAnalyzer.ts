import { JcvMessage } from "@src/interfaces/MessageMap/JcvMessage";
import { IAnalyzer } from "@src/interfaces/protoObj/IAnalyzer";
import { itemIdSet } from "@src/sniffer/sqlite/queries";
import { detectorAll, getAtPath, hasPath } from "./getObjectBySchema";
import { JCV_SCHEMA } from "./jcvSchema";

const hasItemId   = hasPath(JCV_SCHEMA.id,       v => itemIdSet.has(v));
const hasQuantity = hasPath(JCV_SCHEMA.quantity,  v => typeof v === "number" && v > 0);
const hasPrice    = hasPath(JCV_SCHEMA.price,     v => typeof v === "number" && v > 0);

export const jcvAnalyzer: IAnalyzer<JcvMessage> = {
    type: "JCV",
    detect: detectorAll(hasItemId, hasQuantity, hasPrice),
    extract: (obj): JcvMessage | null => {
        const id:       number = getAtPath(obj, JCV_SCHEMA.id);
        const quantity: number = getAtPath(obj, JCV_SCHEMA.quantity);
        const price:    number = getAtPath(obj, JCV_SCHEMA.price);
        if (!id || !quantity || !price) return null;
        return { id, quantity, price };
    },
};
