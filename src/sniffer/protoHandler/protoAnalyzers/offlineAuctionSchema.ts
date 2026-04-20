export const OFFLINE_AUCTION_SCHEMA = {
    items:     ["1"],        // path to the repeated field in the outer message
    // fields within each item
    quantity:  ["2"],        
    itemId:    ["4"],
    totalGain: ["1", "3"],
} as const;
