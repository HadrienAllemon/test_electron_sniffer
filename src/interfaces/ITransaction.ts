type TransactionType = "sold" | "bought" | "tax";


export interface ITransaction {
    id: number;
    type: TransactionType;
    name: string;
    // Common
    date: Date;

    // Financial
    amount: number;   // quantity (if relevant)
    value: number;    // ALWAYS signed (+income / -expense)

    // Metadata
    label: string;    // item name OR tax name
    itemId?: number;
    iconId?: number;
}