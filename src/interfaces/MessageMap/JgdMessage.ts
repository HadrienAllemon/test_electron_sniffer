export interface JgdMessage {
    auctionInfo: JgdItemAuctionInfo;
    itemId: number;
}
interface JgdItemAuctionInfo {
    pricesBytes: Uint8Array;
}