export interface JerMessage {
    items: JerItem[];
}
interface JerItem {
    itemId: number;
    amountSold: number;
    details: JerItemDetail;
}
interface JerItemDetail {
    totalGains: number;
}