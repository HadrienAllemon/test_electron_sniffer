import { itemIdSet } from "../../sqlite/queries";

type Detector = (obj: any) => boolean;

export const hasPath = (path: string[], predicate: (v: any) => boolean): Detector => {
    return (obj) => {
        let current = obj;

        for (const key of path) {
            if (current == null) return false;
            current = current[key];
        }

        return predicate(current);
    };
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