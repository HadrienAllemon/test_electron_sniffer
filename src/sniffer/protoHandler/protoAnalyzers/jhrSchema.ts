// proto: jhr { price=3, itemInfo=4 { amountSold=1, itemId=4 } }
export const JHR_SCHEMA = {
    price:      ["1"],
    itemInfo:   ["3"],
    itemId:     ["3", "3"],
    amountSold: ["3", "5"],
} as const;
