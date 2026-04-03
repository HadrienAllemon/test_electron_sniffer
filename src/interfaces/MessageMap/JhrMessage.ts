export interface JhrMessage {
    price: number;
    itemInfo: JhrItemInfo;
}
interface JhrItemInfo {
    amountSold: number;
    itemId: number;
}