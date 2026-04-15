import { itemIdSet } from "../sqlite/queries";

export function findItemIds(obj: any, results: number[] = []): number[] {
    if (!obj) return results;

    if (typeof obj === "number") {
        if (itemIdSet.has(obj)) {
            results.push(obj);
        }
    }

    if (Array.isArray(obj)) {
        for (const item of obj) {
            findItemIds(item, results);
        }
    } else if (typeof obj === "object") {
        for (const key in obj) {
            findItemIds(obj[key], results);
        }
    }

    return results;
}