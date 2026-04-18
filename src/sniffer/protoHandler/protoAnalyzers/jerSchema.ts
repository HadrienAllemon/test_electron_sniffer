// proto: jer { items=2[] { itemId=1, amountSold=2, details=3 { totalGains=3 } } }
export const JER_SCHEMA = {
    items: ["2"],
    item: {
        itemId:     "1",
        amountSold: "2",
        details:    "3",
        totalGains: ["3", "3"],
    },
} as const;
