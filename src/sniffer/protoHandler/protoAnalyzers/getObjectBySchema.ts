import { itemIdSet } from "../../sqlite/queries";

type Detector = (obj: any) => boolean;

export const getAtPath = (obj: any, path: readonly string[]): any => {
    let current = obj;
    for (const key of path) {
        if (current == null) return undefined;
        current = current[key];
    }
    return current;
}

export const asArray = <T>(v: T | T[] | null | undefined): T[] => {
    if (v == null) return [];
    return Array.isArray(v) ? v : [v];
}

export const hasPath = (path: readonly string[], predicate: (v: any) => boolean): Detector => {
    return (obj) => {
        let current = obj;

        for (const key of path) {
            if (current == null) return false;
            current = current[key];
        }

        return predicate(current);
    };
}

export const hasPathWithEqualValue = (path1: readonly string[], path2: readonly string[]): Detector => {
    return (obj) => {
        const val1 = getAtPath(obj, path1);
        const val2 = getAtPath(obj, path2);
        return val1 !== undefined && val1 === val2;
    }
}


export const hasNestedId: Detector = (obj) =>
    typeof obj?.["3"]?.["3"] === "number" &&
    itemIdSet.has(obj["3"]["3"]);

export const detectorAll = (...detectors: Detector[]): Detector => {
    return (obj) => detectors.every(d => d(obj));
}

export const detectorAny = (...detectors: Detector[]): Detector  => {
    return (obj) => detectors.some(d => d(obj));
}
// example of an analyzer 
/*
const analyzers = [
    {
        name: "sale",
        detect: detectorAll(hasItemId, hasPrices),
        action: (obj:any) => {
            console.log("💰 Sale detected", obj["1"]);
        }
    },
    {
        name: "somethingElse",
        detect: detectorAny(hasNestedId),
        action: (obj:any) => {  }
    }
];
*/